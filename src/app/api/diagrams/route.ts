import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAuth } from "@/lib/auth-server";
import { PLANS } from "@/lib/plans";
import { PlanType } from "@/generated/prisma/client";

// GET /api/diagrams - List user's diagrams
export async function GET() {
    try {
        const session = await requireAuth();
        const userId = session.user.id;

        const [diagrams, diagramCount, subscription] = await Promise.all([
            db.diagram.findMany({
                where: { userId },
                select: {
                    id: true,
                    name: true,
                    createdAt: true,
                    updatedAt: true,
                    lastOpenedAt: true,
                },
                orderBy: { updatedAt: "desc" },
            }),
            db.diagram.count({ where: { userId } }),
            db.subscription.findUnique({
                where: { userId },
                include: { plan: true },
            }),
        ]);

        const planType = subscription?.plan.type ?? PlanType.FREE;
        const limit = PLANS[planType].maxDiagrams;

        return NextResponse.json({
            diagrams,
            usage: {
                current: diagramCount,
                limit,
            },
        });
    } catch (error) {
        console.error("Error fetching diagrams:", error);
        if (error instanceof Error && error.message === "Unauthorized") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
        return NextResponse.json(
            { error: "Failed to fetch diagrams" },
            { status: 500 }
        );
    }
}

// POST /api/diagrams - Create new diagram
export async function POST(request: NextRequest) {
    try {
        const session = await requireAuth();
        const userId = session.user.id;
        const body = await request.json();

        const { name } = body;
        if (!name || typeof name !== "string") {
            return NextResponse.json(
                { error: "Name is required" },
                { status: 400 }
            );
        }

        // Check plan limits
        const [diagramCount, subscription] = await Promise.all([
            db.diagram.count({ where: { userId } }),
            db.subscription.findUnique({
                where: { userId },
                include: { plan: true },
            }),
        ]);

        const planType = subscription?.plan.type ?? PlanType.FREE;
        const limit = PLANS[planType].maxDiagrams;

        if (diagramCount >= limit) {
            return NextResponse.json(
                {
                    error: "Plan limit reached",
                    message: `You have reached your limit of ${limit} diagrams. Please upgrade your plan to create more.`,
                    upgradeRequired: true,
                },
                { status: 403 }
            );
        }

        // Create diagram with empty Excalidraw data
        const diagram = await db.diagram.create({
            data: {
                name: name.trim(),
                userId,
                data: {
                    elements: [],
                    appState: {},
                    files: {},
                },
            },
        });

        return NextResponse.json({
            id: diagram.id,
            name: diagram.name,
            createdAt: diagram.createdAt,
        });
    } catch (error) {
        console.error("Error creating diagram:", error);
        if (error instanceof Error && error.message === "Unauthorized") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
        return NextResponse.json(
            { error: "Failed to create diagram" },
            { status: 500 }
        );
    }
}
