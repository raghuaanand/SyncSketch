import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAuth } from "@/lib/auth-server";
import { verifyRazorpaySignature } from "@/lib/razorpay";
import { PlanType, PaymentStatus, SubscriptionStatus } from "@/generated/prisma/client";

// POST /api/subscription/verify - Verify payment and activate subscription
export async function POST(request: NextRequest) {
    try {
        const session = await requireAuth();
        const userId = session.user.id;
        const body = await request.json();

        const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = body;

        if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
            return NextResponse.json(
                { error: "Missing payment details" },
                { status: 400 }
            );
        }

        // Verify signature
        const isValid = verifyRazorpaySignature(
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature
        );

        if (!isValid) {
            return NextResponse.json(
                { error: "Invalid payment signature" },
                { status: 400 }
            );
        }

        // Find the pending payment
        const payment = await db.payment.findFirst({
            where: {
                razorpayOrderId: razorpay_order_id,
                userId,
                status: PaymentStatus.PENDING,
            },
        });

        if (!payment) {
            return NextResponse.json(
                { error: "Payment not found" },
                { status: 404 }
            );
        }

        const metadata = payment.metadata as { planType: PlanType; planId: string };

        // Use transaction to update payment and subscription atomically
        await db.$transaction(async (tx) => {
            // Update payment status
            await tx.payment.update({
                where: { id: payment.id },
                data: {
                    status: PaymentStatus.SUCCESS,
                    razorpayPaymentId: razorpay_payment_id,
                    razorpaySignature: razorpay_signature,
                },
            });

            // Calculate subscription period (1 month)
            const now = new Date();
            const periodEnd = new Date(now);
            periodEnd.setMonth(periodEnd.getMonth() + 1);

            // Create or update subscription
            await tx.subscription.upsert({
                where: { userId },
                create: {
                    userId,
                    planId: metadata.planId,
                    status: SubscriptionStatus.ACTIVE,
                    currentPeriodStart: now,
                    currentPeriodEnd: periodEnd,
                },
                update: {
                    planId: metadata.planId,
                    status: SubscriptionStatus.ACTIVE,
                    currentPeriodStart: now,
                    currentPeriodEnd: periodEnd,
                    cancelledAt: null,
                },
            });

            // Link payment to subscription
            const subscription = await tx.subscription.findUnique({
                where: { userId },
            });

            if (subscription) {
                await tx.payment.update({
                    where: { id: payment.id },
                    data: { subscriptionId: subscription.id },
                });
            }
        });

        return NextResponse.json({
            success: true,
            message: "Subscription activated successfully",
        });
    } catch (error) {
        console.error("Error verifying payment:", error);
        if (error instanceof Error && error.message === "Unauthorized") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
        return NextResponse.json(
            { error: "Failed to verify payment" },
            { status: 500 }
        );
    }
}
