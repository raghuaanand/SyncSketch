import { prisma } from "@unfold/db";
import { assertOwnedFolder } from "@/lib/api/folders";
import { handle, parseBody } from "@/lib/api/http";
import { boardSelect } from "@/lib/api/boards";
import { createBoard } from "@/lib/api/schemas";
import { requireUser } from "@/lib/session";

export const POST = handle(async (request: Request) => {
  const user = await requireUser();
  const input = await parseBody(request, createBoard);
  await assertOwnedFolder(user.id, input.folderId);

  const board = await prisma.board.create({
    data: { name: input.name, kind: input.kind, folderId: input.folderId ?? null, ownerId: user.id },
    select: boardSelect,
  });
  return Response.json(board, { status: 201 });
});
