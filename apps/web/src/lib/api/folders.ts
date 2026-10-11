import { prisma } from "@unfold/db";
import { HttpError, notFound } from "./http";

const MAX_DEPTH = 100;

// Folders from the root down to (and including) `folderId`, owner-scoped.
// A single recursive query: one round trip however deep the folder is.
export async function folderPath(ownerId: string, folderId: string) {
  const rows = await prisma.$queryRaw<{ id: string; name: string }[]>`
    WITH RECURSIVE ancestors AS (
      SELECT id, name, "parentId", 1 AS depth
      FROM folder WHERE id = ${folderId} AND "ownerId" = ${ownerId}
      UNION ALL
      SELECT f.id, f.name, f."parentId", a.depth + 1
      FROM folder f JOIN ancestors a ON f.id = a."parentId"
      WHERE f."ownerId" = ${ownerId} AND a.depth < ${MAX_DEPTH}
    )
    SELECT id, name FROM ancestors ORDER BY depth DESC`;
  if (rows.length === 0) throw notFound();
  if (rows.length >= MAX_DEPTH) throw new HttpError(400, "Folders nested too deeply");
  return rows;
}

// 404 unless the folder exists and belongs to the user. null = top level.
export async function assertOwnedFolder(ownerId: string, folderId: string | null | undefined) {
  if (!folderId) return;
  const exists = await prisma.folder.findFirst({
    where: { id: folderId, ownerId },
    select: { id: true },
  });
  if (!exists) throw notFound();
}

// Moving a folder into itself or one of its descendants would create a cycle.
export async function assertNoCycle(ownerId: string, folderId: string, newParentId: string) {
  const path = await folderPath(ownerId, newParentId);
  if (path.some((f) => f.id === folderId)) {
    throw new HttpError(400, "Cannot move a folder into itself or its subfolder");
  }
}
