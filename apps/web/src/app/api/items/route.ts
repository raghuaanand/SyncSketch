export const dynamic = "force-dynamic";

import { prisma } from "@syncsketch/db";
import { assertOwnedFolder, folderPath } from "@/lib/api/folders";
import { handle } from "@/lib/api/http";
import { requireUser } from "@/lib/session";

// Contents of one folder (or the top level when parentId is omitted),
// plus breadcrumbs for the current folder. Board `data` is not included.
export const GET = handle(async (request: Request) => {
  const user = await requireUser();
  const parentId = new URL(request.url).searchParams.get("parentId") || null;
  await assertOwnedFolder(user.id, parentId);

  const [folders, boards, path] = await Promise.all([
    prisma.folder.findMany({
      where: { ownerId: user.id, parentId },
      orderBy: { name: "asc" },
    }),
    prisma.board.findMany({
      where: { ownerId: user.id, folderId: parentId },
      orderBy: { updatedAt: "desc" },
      select: {
        id: true,
        name: true,
        folderId: true,
        thumbnail: true,
        createdAt: true,
        updatedAt: true,
      },
    }),
    parentId ? folderPath(user.id, parentId) : Promise.resolve([]),
  ]);

  return Response.json({ path, folders, boards });
});
