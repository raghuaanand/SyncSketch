import { Prisma, prisma } from "@unfold/db";
import { assertOwnedFolder } from "@/lib/api/folders";
import { boardSelect } from "@/lib/api/boards";
import { handle, notFound, parseBody } from "@/lib/api/http";
import { updateBoard } from "@/lib/api/schemas";
import { requireUser } from "@/lib/session";

type Ctx = { params: { id: string } };

export const GET = handle(async (_request: Request, { params }: Ctx) => {
  const user = await requireUser();
  const board = await prisma.board.findFirst({
    where: { id: params.id, ownerId: user.id },
  });
  if (!board) throw notFound();
  return Response.json(board);
});

// Rename, move (folderId: null = top level) and/or save scene data.
export const PATCH = handle(async (request: Request, { params }: Ctx) => {
  const user = await requireUser();
  const input = await parseBody(request, updateBoard);

  const existing = await prisma.board.findFirst({
    where: { id: params.id, ownerId: user.id },
    select: { id: true },
  });
  if (!existing) throw notFound();
  if (input.folderId) await assertOwnedFolder(user.id, input.folderId);

  const board = await prisma.board.update({
    where: { id: params.id },
    data: {
      name: input.name,
      folderId: input.folderId,
      data: input.data as Prisma.InputJsonValue | undefined,
    },
    select: boardSelect,
  });
  return Response.json(board);
});

export const DELETE = handle(async (_request: Request, { params }: Ctx) => {
  const user = await requireUser();
  const { count } = await prisma.board.deleteMany({
    where: { id: params.id, ownerId: user.id },
  });
  if (count === 0) throw notFound();
  return new Response(null, { status: 204 });
});
