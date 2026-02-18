import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-server";
import { db } from "@/lib/db";
import { PLANS } from "@/lib/plans";
import { PlanType } from "@/generated/prisma/client";

// GET /api/user/profile - Get user profile with subscription info
export async function GET() {
    try {
        const session = await requireAuth();
        const userId = session.user.id;

        const [user, subscription, diagramCount] = await Promise.all([
            db.user.findUnique({
                where: { id: userId },
                select: {
                    id: true,
                    email: true,
                    name: true,
                    image: true,
                    createdAt: true,
                },
            }),
            db.subscription.findUnique({
                where: { userId },
                include: { plan: true },
            }),
            db.diagram.count({ where: { userId } }),
        ]);

        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        const planType = subscription?.plan.type ?? PlanType.FREE;
        const planConfig = PLANS[planType];

        return NextResponse.json({
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                image: user.image,
                createdAt: user.createdAt,
            },
            subscription: {
                plan: planType,
                planName: planConfig.name,
                status: subscription?.status ?? "ACTIVE",
                currentPeriodEnd: subscription?.currentPeriodEnd ?? null,
            },
            usage: {
                diagrams: {
                    current: diagramCount,
                    limit: planConfig.maxDiagrams,
                },
            },
        });
    } catch (error) {
        console.error("Error fetching user profile:", error);
        if (error instanceof Error && error.message === "Unauthorized") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
        return NextResponse.json(
            { error: "Failed to fetch profile" },
            { status: 500 }
        );
    }
}
