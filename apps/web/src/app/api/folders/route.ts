import { prisma } from "@syncsketch/db";
import { assertOwnedFolder } from "@/lib/api/folders";
import { handle, parseBody } from "@/lib/api/http";
import { createFolder } from "@/lib/api/schemas";
import { requireUser } from "@/lib/session";

export const POST = handle(async (request: Request) => {
  const user = await requireUser();
  const input = await parseBody(request, createFolder);
  await assertOwnedFolder(user.id, input.parentId);

  const folder = await prisma.folder.create({
    data: { name: input.name, parentId: input.parentId ?? null, ownerId: user.id },
  });
  return Response.json(folder, { status: 201 });
});
