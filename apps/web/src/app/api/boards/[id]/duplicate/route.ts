import { Prisma, prisma } from "@syncsketch/db";
import { handle, notFound } from "@/lib/api/http";
import { requireUser } from "@/lib/session";

export const POST = handle(
  async (_request: Request, { params }: { params: { id: string } }) => {
    const user = await requireUser();
    const source = await prisma.board.findFirst({
      where: { id: params.id, ownerId: user.id },
    });
    if (!source) throw notFound();

    const copy = await prisma.board.create({
      data: {
        name: `${source.name} (copy)`.slice(0, 100),
        ownerId: user.id,
        folderId: source.folderId,
        data: (source.data ?? undefined) as Prisma.InputJsonValue | undefined,
        thumbnail: source.thumbnail,
      },
      select: { id: true, name: true, folderId: true, createdAt: true, updatedAt: true },
    });
    return Response.json(copy, { status: 201 });
  },
);
