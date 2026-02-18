import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAuth } from "@/lib/auth-server";

type RouteParams = { params: Promise<{ id: string }> };

// GET /api/diagrams/[id] - Get diagram with data
export async function GET(request: NextRequest, { params }: RouteParams) {
    try {
        const session = await requireAuth();
        const { id } = await params;

        const diagram = await db.diagram.findUnique({
            where: { id },
        });

        if (!diagram) {
            return NextResponse.json(
                { error: "Diagram not found" },
                { status: 404 }
            );
        }

        if (diagram.userId !== session.user.id) {
            return NextResponse.json(
                { error: "Forbidden" },
                { status: 403 }
            );
        }

        // Update lastOpenedAt
        await db.diagram.update({
            where: { id },
            data: { lastOpenedAt: new Date() },
        });

        return NextResponse.json({
            id: diagram.id,
            name: diagram.name,
            data: diagram.data,
            createdAt: diagram.createdAt,
            updatedAt: diagram.updatedAt,
        });
    } catch (error) {
        console.error("Error fetching diagram:", error);
        if (error instanceof Error && error.message === "Unauthorized") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
        return NextResponse.json(
            { error: "Failed to fetch diagram" },
            { status: 500 }
        );
    }
}

// PUT /api/diagrams/[id] - Update diagram
export async function PUT(request: NextRequest, { params }: RouteParams) {
    try {
        const session = await requireAuth();
        const { id } = await params;
        const body = await request.json();

        const diagram = await db.diagram.findUnique({
            where: { id },
            select: { userId: true },
        });

        if (!diagram) {
            return NextResponse.json(
                { error: "Diagram not found" },
                { status: 404 }
            );
        }

        if (diagram.userId !== session.user.id) {
            return NextResponse.json(
                { error: "Forbidden" },
                { status: 403 }
            );
        }

        // Build update data directly to satisfy Prisma types
        const updated = await db.diagram.update({
            where: { id },
            data: {
                ...(body.name !== undefined && typeof body.name === "string" && body.name.trim()
                    ? { name: body.name.trim() }
                    : {}),
                ...(body.data !== undefined
                    ? { data: body.data }
                    : {}),
            },
        });

        return NextResponse.json({
            id: updated.id,
            updatedAt: updated.updatedAt,
        });
    } catch (error) {
        console.error("Error updating diagram:", error);
        if (error instanceof Error && error.message === "Unauthorized") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
        return NextResponse.json(
            { error: "Failed to update diagram" },
            { status: 500 }
        );
    }
}

// DELETE /api/diagrams/[id] - Delete diagram
export async function DELETE(request: NextRequest, { params }: RouteParams) {
    try {
        const session = await requireAuth();
        const { id } = await params;

        const diagram = await db.diagram.findUnique({
            where: { id },
            select: { userId: true },
        });

        if (!diagram) {
            return NextResponse.json(
                { error: "Diagram not found" },
                { status: 404 }
            );
        }

        if (diagram.userId !== session.user.id) {
            return NextResponse.json(
                { error: "Forbidden" },
                { status: 403 }
            );
        }

        await db.diagram.delete({ where: { id } });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error deleting diagram:", error);
        if (error instanceof Error && error.message === "Unauthorized") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
        return NextResponse.json(
            { error: "Failed to delete diagram" },
            { status: 500 }
        );
    }
}
