import { prisma } from "@syncsketch/db";
import { assertNoCycle, assertOwnedFolder, folderPath } from "@/lib/api/folders";
import { handle, notFound, parseBody } from "@/lib/api/http";
import { updateFolder } from "@/lib/api/schemas";
import { requireUser } from "@/lib/session";

type Ctx = { params: { id: string } };

export const GET = handle(async (_request: Request, { params }: Ctx) => {
  const user = await requireUser();
  const path = await folderPath(user.id, params.id);
  return Response.json({ id: params.id, name: path[path.length - 1].name, path });
});

// Rename and/or move (parentId: null moves to the top level).
export const PATCH = handle(async (request: Request, { params }: Ctx) => {
  const user = await requireUser();
  const input = await parseBody(request, updateFolder);

  const existing = await prisma.folder.findFirst({
    where: { id: params.id, ownerId: user.id },
    select: { id: true },
  });
  if (!existing) throw notFound();

  if (input.parentId !== undefined && input.parentId !== null) {
    await assertOwnedFolder(user.id, input.parentId);
    await assertNoCycle(user.id, params.id, input.parentId);
  }

  const folder = await prisma.folder.update({
    where: { id: params.id },
    data: { name: input.name, parentId: input.parentId },
  });
  return Response.json(folder);
});

// Deletes the folder and, by cascade, everything inside it.
export const DELETE = handle(async (_request: Request, { params }: Ctx) => {
  const user = await requireUser();
  const { count } = await prisma.folder.deleteMany({
    where: { id: params.id, ownerId: user.id },
  });
  if (count === 0) throw notFound();
  return new Response(null, { status: 204 });
});
