"use client";

import { formatDistanceToNow } from "date-fns";
import { Folder, PenLine } from "lucide-react";
import Link from "next/link";
import type { BoardItem, FolderItem } from "@/lib/api-client";
import { cn } from "@/lib/utils";
import {
  useDeleteBoard,
  useDeleteFolder,
  useDuplicateBoard,
  useUpdateBoardMeta,
  useUpdateFolder,
} from "@/lib/queries";
import { ItemMenu } from "./item-menu";

export type View = "grid" | "list";

const card =
  "group relative rounded-xl border bg-card transition-colors hover:border-primary/50";

const ago = (iso: string) => formatDistanceToNow(new Date(iso), { addSuffix: true });

export function FolderTile({ folder, view }: { folder: FolderItem; view: View }) {
  const update = useUpdateFolder();
  const remove = useDeleteFolder();
  return (
    <div className={cn(card, "flex items-center gap-3 p-3 pr-2")}>
      <Link
        href={`/folder/${folder.id}`}
        className="flex min-w-0 flex-1 items-center gap-3 rounded-lg after:absolute after:inset-0 after:content-['']"
      >
        <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-kraft/20 text-kraft">
          <Folder className="size-5 fill-current" />
        </span>
        <span className="min-w-0">
          <span className="block truncate font-medium">{folder.name}</span>
          {view === "list" && (
            <span className="block text-xs text-muted-foreground">
              Updated {ago(folder.updatedAt)}
            </span>
          )}
        </span>
      </Link>
      <div className="relative z-10">
        <ItemMenu
          kind="folder"
          id={folder.id}
          name={folder.name}
          parentId={folder.parentId}
          onRename={(name) => update.mutateAsync({ id: folder.id, name })}
          onMove={(parentId) => update.mutateAsync({ id: folder.id, parentId })}
          onDelete={() => remove.mutateAsync(folder.id)}
        />
      </div>
    </div>
  );
}

export function BoardTile({ board, view }: { board: BoardItem; view: View }) {
  const update = useUpdateBoardMeta();
  const duplicate = useDuplicateBoard();
  const remove = useDeleteBoard();

  const menu = (
    <div className="relative z-10">
      <ItemMenu
        kind="board"
        id={board.id}
        name={board.name}
        parentId={board.folderId}
        onRename={(name) => update.mutateAsync({ id: board.id, name })}
        onMove={(folderId) => update.mutateAsync({ id: board.id, folderId })}
        onDuplicate={() => duplicate.mutateAsync(board.id)}
        onDelete={() => remove.mutateAsync(board.id)}
      />
    </div>
  );

  if (view === "list") {
    return (
      <div className={cn(card, "flex items-center gap-3 p-3 pr-2")}>
        <Link
          href={`/board/${board.id}`}
          className="flex min-w-0 flex-1 items-center gap-3 after:absolute after:inset-0 after:content-['']"
        >
          <span className="canvas-dots flex size-10 shrink-0 items-center justify-center rounded-lg border bg-background text-primary">
            <PenLine className="size-4" />
          </span>
          <span className="min-w-0">
            <span className="block truncate font-medium">{board.name}</span>
            <span className="block text-xs text-muted-foreground">Edited {ago(board.updatedAt)}</span>
          </span>
        </Link>
        {menu}
      </div>
    );
  }

  return (
    <div className={cn(card, "overflow-hidden")}>
      <Link
        href={`/board/${board.id}`}
        className="block after:absolute after:inset-0 after:content-['']"
        aria-label={`Open ${board.name}`}
      >
        <div className="canvas-dots flex h-32 items-center justify-center border-b bg-background">
          <PenLine className="size-6 text-primary/70 transition-transform group-hover:-rotate-6 group-hover:scale-110" />
        </div>
      </Link>
      <div className="flex items-center gap-2 p-3 pr-2">
        <div className="min-w-0 flex-1">
          <p className="truncate font-medium">{board.name}</p>
          <p className="text-xs text-muted-foreground">Edited {ago(board.updatedAt)}</p>
        </div>
        {menu}
      </div>
    </div>
  );
}
