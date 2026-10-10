import { prisma } from "@syncsketch/db";
import { HttpError, notFound } from "./http";

const MAX_DEPTH = 100;

// Folder ids from the root down to (and including) `folderId`, owner-scoped.
export async function folderPath(ownerId: string, folderId: string) {
  const path: { id: string; name: string }[] = [];
  let currentId: string | null = folderId;
  while (currentId) {
    if (path.length >= MAX_DEPTH) throw new HttpError(400, "Folders nested too deeply");
    const found: { id: string; name: string; parentId: string | null } | null =
      await prisma.folder.findFirst({
        where: { id: currentId, ownerId },
        select: { id: true, name: true, parentId: true },
      });
    if (!found) throw notFound();
    path.unshift({ id: found.id, name: found.name });
    currentId = found.parentId;
  }
  return path;
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
