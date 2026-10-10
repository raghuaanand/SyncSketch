import { z } from "zod";

export const name = z.string().trim().min(1).max(100);
const id = z.string().min(1).max(64);

export const createFolder = z.object({
  name,
  parentId: id.nullable().optional(),
});

export const updateFolder = z
  .object({ name, parentId: id.nullable() })
  .partial();

export const createBoard = z.object({
  name,
  folderId: id.nullable().optional(),
});

// `data` is the Excalidraw scene: { elements, appState, files }.
export const updateBoard = z
  .object({
    name,
    folderId: id.nullable(),
    data: z.object({
      elements: z.array(z.unknown()),
      appState: z.record(z.string(), z.unknown()),
      files: z.record(z.string(), z.unknown()),
    }),
  })
  .partial();
