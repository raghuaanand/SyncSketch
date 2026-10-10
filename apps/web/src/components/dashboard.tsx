"use client";

import {
  ChevronRight,
  FolderPlus,
  LayoutGrid,
  List,
  LogOut,
  Moon,
  Plus,
  Search,
  Sun,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { NameDialog } from "@/components/name-dialog";
import { useTheme } from "@/components/theme-provider";
import { Wordmark } from "@/components/logo";
import { BoardTile, FolderTile, type View } from "@/components/tiles";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormError } from "@/components/auth/auth-shell";
import { SkeletonCard } from "@/components/ui/loading";
import { signOut } from "@/lib/auth-client";
import { useCreateBoard, useCreateFolder, useItems } from "@/lib/queries";

// File-explorer style view of one folder (null = top level).
export function Dashboard({ parentId }: { parentId: string | null }) {
  const router = useRouter();
  const { isDarkMode, toggleDarkMode } = useTheme();
  const { data, isLoading, error } = useItems(parentId);
  const createFolder = useCreateFolder();
  const createBoard = useCreateBoard();
  const [search, setSearch] = useState("");
  const [view, setView] = useState<View>("grid");
  const [dialog, setDialog] = useState<"folder" | "board" | null>(null);

  const q = search.toLowerCase();
  const folders = data?.folders.filter((f) => f.name.toLowerCase().includes(q)) ?? [];
  const boards = data?.boards.filter((b) => b.name.toLowerCase().includes(q)) ?? [];
  const isEmpty = !!data && data.folders.length === 0 && data.boards.length === 0;
  const boardLayout =
    view === "grid"
      ? "grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
      : "flex flex-col gap-2";
  const folderLayout =
    view === "grid"
      ? "grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
      : "flex flex-col gap-2";
  const title = data?.path.length ? data.path[data.path.length - 1].name : "All boards";

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-40 border-b bg-background/90 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <Link href="/" aria-label="SyncSketch home">
            <Wordmark />
          </Link>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" onClick={toggleDarkMode} aria-label="Toggle theme">
              {isDarkMode ? <Sun className="size-5" /> : <Moon className="size-5" />}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              title="Sign out"
              aria-label="Sign out"
              onClick={async () => {
                await signOut();
                router.push("/login");
                router.refresh();
              }}
            >
              <LogOut className="size-5" />
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl space-y-8 px-4 py-10 sm:px-6">
        <div className="space-y-4">
          {!!data?.path.length && (
            <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-1 text-sm text-muted-foreground">
              <Link href="/" className="hover:text-foreground hover:underline">
                All boards
              </Link>
              {data.path.slice(0, -1).map((f) => (
                <span key={f.id} className="flex items-center gap-1">
                  <ChevronRight className="size-3.5" />
                  <Link href={`/folder/${f.id}`} className="hover:text-foreground hover:underline">
                    {f.name}
                  </Link>
                </span>
              ))}
            </nav>
          )}
          <div className="flex flex-wrap items-end justify-between gap-4">
            <h1 className="font-serif text-4xl font-medium tracking-tight sm:text-5xl">{title}</h1>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setDialog("folder")}>
                <FolderPlus className="mr-2 size-4" /> New folder
              </Button>
              <Button onClick={() => setDialog("board")}>
                <Plus className="mr-2 size-4" /> New board
              </Button>
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          <div className="relative flex-1 sm:max-w-xs">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search this folder"
              aria-label="Search this folder"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <div className="ml-auto flex rounded-md border bg-card p-0.5">
            {(["grid", "list"] as const).map((v) => (
              <Button
                key={v}
                variant="ghost"
                size="icon"
                className={`size-9 ${view === v ? "bg-secondary text-foreground" : "text-muted-foreground"}`}
                aria-label={v === "grid" ? "Grid view" : "List view"}
                aria-pressed={view === v}
                onClick={() => setView(v)}
              >
                {v === "grid" ? <LayoutGrid className="size-4" /> : <List className="size-4" />}
              </Button>
            ))}
          </div>
        </div>

        {error && (
          <div className="space-y-2">
            <FormError message={error.message} />
            <Link href="/" className="text-sm font-medium text-primary hover:underline">
              Back to all boards
            </Link>
          </div>
        )}
        {isLoading && (
          <div className={boardLayout}>
            {Array.from({ length: 4 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        )}
        {isEmpty && (
          <div className="flex flex-col items-center rounded-xl border border-dashed py-20 text-center">
            <svg viewBox="0 0 120 60" className="mb-6 w-28 text-primary" fill="none" aria-hidden="true">
              <path d="M6 44c14-30 28-40 40-34s-8 34 8 34 30-26 60-34" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" />
            </svg>
            <h2 className="font-serif text-3xl font-medium">A blank canvas</h2>
            <p className="mt-2 max-w-sm text-muted-foreground">
              Start a board for your next idea, or make a folder to keep related work together.
            </p>
            <Button className="mt-6" onClick={() => setDialog("board")}>
              <Plus className="mr-2 size-4" /> New board
            </Button>
          </div>
        )}
        {folders.length > 0 && (
          <section className="space-y-3">
            <h2 className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Folders</h2>
            <div className={folderLayout}>
              {folders.map((f) => (
                <FolderTile key={f.id} folder={f} view={view} />
              ))}
            </div>
          </section>
        )}
        {boards.length > 0 && (
          <section className="space-y-3">
            <h2 className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Boards</h2>
            <div className={boardLayout}>
              {boards.map((b) => (
                <BoardTile key={b.id} board={b} view={view} />
              ))}
            </div>
          </section>
        )}
        {data && !isEmpty && folders.length === 0 && boards.length === 0 && (
          <p className="py-12 text-center text-muted-foreground">Nothing matches your search.</p>
        )}
      </main>

      <NameDialog
        open={dialog === "folder"}
        onOpenChange={(open) => !open && setDialog(null)}
        title="New folder"
        submitLabel="Create folder"
        onSubmit={(name) => createFolder.mutateAsync({ name, parentId })}
      />
      <NameDialog
        open={dialog === "board"}
        onOpenChange={(open) => !open && setDialog(null)}
        title="New board"
        submitLabel="Create board"
        onSubmit={async (name) => {
          const board = await createBoard.mutateAsync({ name, folderId: parentId });
          router.push(`/board/${board.id}`);
        }}
      />
    </div>
  );
}
