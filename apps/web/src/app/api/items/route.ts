export const dynamic = "force-dynamic";

import { prisma } from "@unfold/db";
import { folderPath } from "@/lib/api/folders";
import { boardSelect } from "@/lib/api/boards";
import { handle } from "@/lib/api/http";
import { requireUser } from "@/lib/session";

// Contents of one folder (or the top level when parentId is omitted),
// plus breadcrumbs for the current folder (which also proves the folder is
// the caller's: folderPath 404s otherwise). Board `data` is not included.
export const GET = handle(async (request: Request) => {
  const user = await requireUser();
  const parentId = new URL(request.url).searchParams.get("parentId") || null;

  const [folders, boards, path] = await Promise.all([
    prisma.folder.findMany({
      where: { ownerId: user.id, parentId },
      orderBy: { name: "asc" },
    }),
    prisma.board.findMany({
      where: { ownerId: user.id, folderId: parentId },
      orderBy: { updatedAt: "desc" },
      select: boardSelect,
    }),
    parentId ? folderPath(user.id, parentId) : Promise.resolve([]),
  ]);

  return Response.json({ path, folders, boards });
});
