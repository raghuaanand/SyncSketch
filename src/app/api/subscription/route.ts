import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAuth } from "@/lib/auth-server";
import { PLANS } from "@/lib/plans";
import { PlanType } from "@/generated/prisma/client";

// GET /api/subscription - Get current subscription info
export async function GET() {
    try {
        const session = await requireAuth();
        const userId = session.user.id;

        const [subscription, diagramCount] = await Promise.all([
            db.subscription.findUnique({
                where: { userId },
                include: { plan: true },
            }),
            db.diagram.count({ where: { userId } }),
        ]);

        const planType = subscription?.plan.type ?? PlanType.FREE;
        const planConfig = PLANS[planType];

        return NextResponse.json({
            plan: planType,
            planName: planConfig.name,
            status: subscription?.status ?? "ACTIVE",
            currentPeriodEnd: subscription?.currentPeriodEnd ?? null,
            usage: {
                diagrams: {
                    current: diagramCount,
                    limit: planConfig.maxDiagrams,
                },
            },
            features: planConfig.features,
            priceInPaisa: planConfig.priceInPaisa,
        });
    } catch (error) {
        console.error("Error fetching subscription:", error);
        if (error instanceof Error && error.message === "Unauthorized") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
        return NextResponse.json(
            { error: "Failed to fetch subscription" },
            { status: 500 }
        );
    }
}
