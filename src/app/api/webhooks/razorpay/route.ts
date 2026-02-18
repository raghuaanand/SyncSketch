import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { verifyWebhookSignature } from "@/lib/razorpay";
import { PaymentStatus, SubscriptionStatus } from "@/generated/prisma/client";

// POST /api/webhooks/razorpay - Handle Razorpay webhooks
export async function POST(request: NextRequest) {
    try {
        const body = await request.text();
        const signature = request.headers.get("x-razorpay-signature");

        if (!signature) {
            return NextResponse.json(
                { error: "Missing signature" },
                { status: 400 }
            );
        }

        // Verify webhook signature
        const isValid = verifyWebhookSignature(body, signature);
        if (!isValid) {
            console.error("Invalid webhook signature");
            return NextResponse.json(
                { error: "Invalid signature" },
                { status: 400 }
            );
        }

        const event = JSON.parse(body);
        const eventType = event.event;

        console.log("Razorpay webhook received:", eventType);

        switch (eventType) {
            case "payment.captured":
                await handlePaymentCaptured(event.payload.payment.entity);
                break;

            case "payment.failed":
                await handlePaymentFailed(event.payload.payment.entity);
                break;

            case "subscription.charged":
                await handleSubscriptionCharged(event.payload.subscription.entity);
                break;

            case "subscription.cancelled":
                await handleSubscriptionCancelled(event.payload.subscription.entity);
                break;

            case "subscription.expired":
                await handleSubscriptionExpired(event.payload.subscription.entity);
                break;

            default:
                console.log("Unhandled webhook event:", eventType);
        }

        return NextResponse.json({ received: true });
    } catch (error) {
        console.error("Webhook error:", error);
        return NextResponse.json(
            { error: "Webhook processing failed" },
            { status: 500 }
        );
    }
}

async function handlePaymentCaptured(payment: {
    id: string;
    order_id: string;
    amount: number;
}) {
    const existingPayment = await db.payment.findFirst({
        where: { razorpayOrderId: payment.order_id },
    });

    if (existingPayment && existingPayment.status === PaymentStatus.PENDING) {
        await db.payment.update({
            where: { id: existingPayment.id },
            data: {
                status: PaymentStatus.SUCCESS,
                razorpayPaymentId: payment.id,
            },
        });
    }
}

async function handlePaymentFailed(payment: {
    id: string;
    order_id: string;
    error_description?: string;
}) {
    const existingPayment = await db.payment.findFirst({
        where: { razorpayOrderId: payment.order_id },
    });

    if (existingPayment) {
        await db.payment.update({
            where: { id: existingPayment.id },
            data: {
                status: PaymentStatus.FAILED,
                razorpayPaymentId: payment.id,
                failureReason: payment.error_description,
            },
        });
    }
}

async function handleSubscriptionCharged(subscription: {
    id: string;
    current_start: number;
    current_end: number;
}) {
    const existingSub = await db.subscription.findFirst({
        where: { razorpaySubscriptionId: subscription.id },
    });

    if (existingSub) {
        await db.subscription.update({
            where: { id: existingSub.id },
            data: {
                status: SubscriptionStatus.ACTIVE,
                currentPeriodStart: new Date(subscription.current_start * 1000),
                currentPeriodEnd: new Date(subscription.current_end * 1000),
            },
        });
    }
}

async function handleSubscriptionCancelled(subscription: { id: string }) {
    const existingSub = await db.subscription.findFirst({
        where: { razorpaySubscriptionId: subscription.id },
    });

    if (existingSub) {
        await db.subscription.update({
            where: { id: existingSub.id },
            data: {
                status: SubscriptionStatus.CANCELLED,
                cancelledAt: new Date(),
            },
        });
    }
}

async function handleSubscriptionExpired(subscription: { id: string }) {
    const existingSub = await db.subscription.findFirst({
        where: { razorpaySubscriptionId: subscription.id },
    });

    if (existingSub) {
        await db.subscription.update({
            where: { id: existingSub.id },
            data: {
                status: SubscriptionStatus.EXPIRED,
            },
        });
    }
}
