"use client";

import { formatDistanceToNow } from "date-fns";
import { Folder } from "lucide-react";
import Link from "next/link";
import type { BoardItem, FolderItem } from "@/lib/api-client";
import { cn } from "@/lib/utils";
import {
  useDeleteBoard,
  useDeleteFolder,
  useDuplicateBoard,
  usePrefetchBoard,
  useUpdateBoardMeta,
  useUpdateFolder,
} from "@/lib/queries";
import { BoardKindBadge, BoardKindIcon } from "./board-kind";
import { preloadEditor } from "./editors";
import { ItemMenu } from "./item-menu";

export type View = "grid" | "list";

const card =
  "group relative rounded-xl border bg-card transition-colors hover:border-primary/50";

// Name | Type | Edited | actions. Type moves under the name on narrow screens.
const listColumns = "grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-4 sm:grid-cols-[minmax(0,1fr)_9rem_10rem_auto]";

const ago = (iso: string) => formatDistanceToNow(new Date(iso), { addSuffix: true });

export function ListHeader() {
  return (
    <div
      className={cn(
        listColumns,
        "hidden border-b bg-muted/40 px-3 py-2 text-xs font-medium uppercase tracking-wider text-muted-foreground sm:grid",
      )}
    >
      <span>Name</span>
      <span>Type</span>
      <span>Edited</span>
      <span className="w-8" />
    </div>
  );
}

function ListRow({
  href,
  icon,
  name,
  type,
  updatedAt,
  menu,
  onIntent,
}: {
  href: string;
  icon: React.ReactNode;
  name: string;
  type: React.ReactNode;
  updatedAt: string;
  menu: React.ReactNode;
  onIntent?: () => void;
}) {
  return (
    <div className={cn(listColumns, "group relative px-3 py-2.5 transition-colors hover:bg-muted/40")}>
      <Link
        href={href}
        onPointerEnter={onIntent}
        onFocus={onIntent}
        className="flex min-w-0 items-center gap-3 after:absolute after:inset-0 after:content-['']"
      >
        {icon}
        <span className="min-w-0">
          <span className="block truncate font-medium">{name}</span>
          <span className="mt-0.5 flex items-center gap-2 text-xs text-muted-foreground sm:hidden">
            {type} · {ago(updatedAt)}
          </span>
        </span>
      </Link>
      <span className="hidden text-sm sm:block">{type}</span>
      <span className="hidden text-sm text-muted-foreground sm:block">{ago(updatedAt)}</span>
      <div className="relative z-10">{menu}</div>
    </div>
  );
}

export function FolderTile({ folder, view }: { folder: FolderItem; view: View }) {
  const update = useUpdateFolder();
  const remove = useDeleteFolder();
  const icon = (
    <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-kraft/20 text-kraft">
      <Folder className="size-5 fill-current" />
    </span>
  );
  const menu = (
    <ItemMenu
      kind="folder"
      id={folder.id}
      name={folder.name}
      parentId={folder.parentId}
      onRename={(name) => update.mutateAsync({ id: folder.id, name })}
      onMove={(parentId) => update.mutateAsync({ id: folder.id, parentId })}
      onDelete={() => remove.mutateAsync(folder.id)}
    />
  );

  if (view === "list") {
    return (
      <ListRow
        href={`/folder/${folder.id}`}
        icon={icon}
        name={folder.name}
        type={<span className="text-muted-foreground">Folder</span>}
        updatedAt={folder.updatedAt}
        menu={menu}
      />
    );
  }

  return (
    <div className={cn(card, "flex items-center gap-3 p-3 pr-2")}>
      <Link
        href={`/folder/${folder.id}`}
        className="flex min-w-0 flex-1 items-center gap-3 rounded-lg after:absolute after:inset-0 after:content-['']"
      >
        {icon}
        <span className="block min-w-0 truncate font-medium">{folder.name}</span>
      </Link>
      <div className="relative z-10">{menu}</div>
    </div>
  );
}

export function BoardTile({ board, view }: { board: BoardItem; view: View }) {
  const update = useUpdateBoardMeta();
  const duplicate = useDuplicateBoard();
  const remove = useDeleteBoard();
  const prefetchBoard = usePrefetchBoard();
  const href = `/board/${board.id}`;

  // Opening a board waits on its data and its editor bundle; start both early.
  const warmUp = () => {
    void prefetchBoard(board.id);
    preloadEditor(board.kind);
  };

  const menu = (
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
  );

  if (view === "list") {
    return (
      <ListRow
        href={href}
        icon={
          <span className="canvas-dots flex size-10 shrink-0 items-center justify-center rounded-lg border bg-background text-primary">
            <BoardKindIcon kind={board.kind} className="size-4" />
          </span>
        }
        name={board.name}
        type={<BoardKindBadge kind={board.kind} />}
        updatedAt={board.updatedAt}
        menu={menu}
        onIntent={warmUp}
      />
    );
  }

  return (
    <div className={cn(card, "overflow-hidden")}>
      <Link
        href={href}
        onPointerEnter={warmUp}
        onFocus={warmUp}
        className="block after:absolute after:inset-0 after:content-['']"
        aria-label={`Open ${board.name}`}
      >
        <div className="canvas-dots relative flex h-32 items-center justify-center border-b bg-background">
          <BoardKindIcon
            kind={board.kind}
            className="size-6 text-primary/70 transition-transform group-hover:-rotate-6 group-hover:scale-110"
          />
          <BoardKindBadge kind={board.kind} className="absolute left-2 top-2 bg-card" />
        </div>
      </Link>
      <div className="flex items-center gap-2 p-3 pr-2">
        <div className="min-w-0 flex-1">
          <p className="truncate font-medium">{board.name}</p>
          <p className="text-xs text-muted-foreground">Edited {ago(board.updatedAt)}</p>
        </div>
        <div className="relative z-10">{menu}</div>
      </div>
    </div>
  );
}
