import { Prisma, prisma } from "@unfold/db";
import { boardSelect } from "@/lib/api/boards";
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
        kind: source.kind,
        ownerId: user.id,
        folderId: source.folderId,
        data: (source.data ?? undefined) as Prisma.InputJsonValue | undefined,
        thumbnail: source.thumbnail,
      },
      select: boardSelect,
    });
    return Response.json(copy, { status: 201 });
  },
);
