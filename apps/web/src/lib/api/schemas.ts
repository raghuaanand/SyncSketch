import { z } from "zod";
import { BOARD_KINDS } from "@/lib/board-kinds";

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
  kind: z.enum(BOARD_KINDS).default("SKETCH"),
  folderId: id.nullable().optional(),
});

// `data` is the editor snapshot; its shape depends on the board kind.
export const updateBoard = z
  .object({
    name,
    folderId: id.nullable(),
    data: z.record(z.string(), z.unknown()),
  })
  .partial();
