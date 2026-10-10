"use client";

import { formatDistanceToNow } from "date-fns";
import { Folder, Pencil } from "lucide-react";
import Link from "next/link";
import type { BoardItem, FolderItem } from "@/lib/api-client";
import {
  useDeleteBoard,
  useDeleteFolder,
  useDuplicateBoard,
  useUpdateBoardMeta,
  useUpdateFolder,
} from "@/lib/queries";
import { ItemMenu } from "./item-menu";

const tileClass =
  "group flex items-center gap-3 rounded-lg border border-slate-200/50 dark:border-slate-700/50 bg-white/90 dark:bg-slate-800/90 p-4 shadow-md transition hover:-translate-y-0.5 hover:border-blue-300/60 hover:shadow-xl";

export function FolderTile({ folder }: { folder: FolderItem }) {
  const update = useUpdateFolder();
  const remove = useDeleteFolder();
  return (
    <div className={tileClass}>
      <Link href={`/folder/${folder.id}`} className="flex min-w-0 flex-1 items-center gap-3">
        <Folder className="size-8 shrink-0 text-blue-600 dark:text-blue-400" />
        <div className="min-w-0">
          <p className="truncate font-semibold text-slate-800 dark:text-slate-100">{folder.name}</p>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Updated {formatDistanceToNow(new Date(folder.updatedAt), { addSuffix: true })}
          </p>
        </div>
      </Link>
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
  );
}

export function BoardTile({ board }: { board: BoardItem }) {
  const update = useUpdateBoardMeta();
  const duplicate = useDuplicateBoard();
  const remove = useDeleteBoard();
  return (
    <div className={tileClass}>
      <Link href={`/board/${board.id}`} className="flex min-w-0 flex-1 items-center gap-3">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/30 dark:to-purple-900/30">
          <Pencil className="size-5 text-slate-500 group-hover:text-blue-500" />
        </div>
        <div className="min-w-0">
          <p className="truncate font-semibold text-slate-800 dark:text-slate-100">{board.name}</p>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Edited {formatDistanceToNow(new Date(board.updatedAt), { addSuffix: true })}
          </p>
        </div>
      </Link>
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
}
