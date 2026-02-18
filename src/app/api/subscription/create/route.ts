import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAuth } from "@/lib/auth-server";
import { razorpay, formatAmountForRazorpay } from "@/lib/razorpay";
import { PLANS } from "@/lib/plans";
import { PlanType } from "@/generated/prisma/client";

// POST /api/subscription/create - Create subscription order
export async function POST(request: NextRequest) {
    try {
        const session = await requireAuth();
        const userId = session.user.id;
        const body = await request.json();

        const { planType } = body as { planType: PlanType };

        if (!planType || !["PRO", "PREMIUM"].includes(planType)) {
            return NextResponse.json(
                { error: "Invalid plan type. Must be PRO or PREMIUM" },
                { status: 400 }
            );
        }

        // Check if user already has an active subscription
        const existingSubscription = await db.subscription.findUnique({
            where: { userId },
            include: { plan: true },
        });

        if (existingSubscription?.status === "ACTIVE" &&
            existingSubscription.plan.type === planType) {
            return NextResponse.json(
                { error: "You already have this subscription" },
                { status: 400 }
            );
        }

        const planConfig = PLANS[planType];

        // Get or create plan in database
        let plan = await db.plan.findUnique({
            where: { type: planType },
        });

        if (!plan) {
            plan = await db.plan.create({
                data: {
                    type: planType,
                    name: planConfig.name,
                    priceInPaisa: planConfig.priceInPaisa,
                    maxDiagrams: planConfig.maxDiagrams,
                    features: planConfig.features,
                },
            });
        }

        // Create Razorpay order
        const order = await razorpay.orders.create({
            amount: formatAmountForRazorpay(planConfig.priceInPaisa),
            currency: "INR",
            receipt: `sub_${userId}_${Date.now()}`,
            notes: {
                userId,
                planType,
                planId: plan.id,
            },
        });

        // Create pending payment record
        await db.payment.create({
            data: {
                userId,
                amountInPaisa: planConfig.priceInPaisa,
                currency: "INR",
                status: "PENDING",
                razorpayOrderId: order.id,
                metadata: {
                    planType,
                    planId: plan.id,
                },
            },
        });

        return NextResponse.json({
            orderId: order.id,
            amount: order.amount,
            currency: order.currency,
            keyId: process.env.RAZORPAY_KEY_ID,
            planName: planConfig.name,
        });
    } catch (error) {
        console.error("Error creating subscription:", error);
        if (error instanceof Error && error.message === "Unauthorized") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
        return NextResponse.json(
            { error: "Failed to create subscription" },
            { status: 500 }
        );
    }
}
