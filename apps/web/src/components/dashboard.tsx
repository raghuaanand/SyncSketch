"use client";

import {
  ChevronRight,
  FilePlus,
  FolderPlus,
  Grid,
  Home,
  List,
  LogOut,
  Moon,
  Palette,
  Search,
  Sun,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { NameDialog } from "@/components/name-dialog";
import { useTheme } from "@/components/theme-provider";
import { BoardTile, FolderTile } from "@/components/tiles";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  const [view, setView] = useState<"grid" | "list">("grid");
  const [dialog, setDialog] = useState<"folder" | "board" | null>(null);

  const q = search.toLowerCase();
  const folders = data?.folders.filter((f) => f.name.toLowerCase().includes(q)) ?? [];
  const boards = data?.boards.filter((b) => b.name.toLowerCase().includes(q)) ?? [];
  const isEmpty = !!data && data.folders.length === 0 && data.boards.length === 0;
  const layout =
    view === "grid"
      ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
      : "flex flex-col gap-3";

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-700">
      <nav className="sticky top-0 z-50 border-b border-white/20 bg-white/80 shadow-lg backdrop-blur-xl dark:bg-slate-900/80">
        <div className="container mx-auto flex h-16 items-center justify-between px-4 lg:px-6">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 shadow-lg">
              <Palette className="size-5 text-white" />
            </div>
            <h1 className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-xl font-bold text-transparent">
              SyncSketch
            </h1>
          </Link>
          <div className="flex items-center gap-2">
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
      </nav>

      <main className="container mx-auto space-y-6 px-4 py-8 lg:px-6">
        <div className="flex flex-wrap items-center gap-1 text-sm text-slate-600 dark:text-slate-300">
          <Link href="/" className="flex items-center gap-1 hover:underline">
            <Home className="size-4" /> All boards
          </Link>
          {data?.path.map((f, i) => (
            <span key={f.id} className="flex items-center gap-1">
              <ChevronRight className="size-3" />
              {i === data.path.length - 1 ? (
                <span className="font-semibold">{f.name}</span>
              ) : (
                <Link href={`/folder/${f.id}`} className="hover:underline">
                  {f.name}
                </Link>
              )}
            </span>
          ))}
        </div>

        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setDialog("folder")}>
              <FolderPlus className="mr-2 size-4" /> New folder
            </Button>
            <Button
              className="bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700"
              onClick={() => setDialog("board")}
            >
              <FilePlus className="mr-2 size-4" /> New board
            </Button>
          </div>
          <div className="flex gap-2">
            <div className="relative flex-1 lg:w-64">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
              <Input
                placeholder="Search this folder..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button
              variant={view === "grid" ? "default" : "outline"}
              size="icon"
              aria-label="Grid view"
              onClick={() => setView("grid")}
            >
              <Grid className="size-4" />
            </Button>
            <Button
              variant={view === "list" ? "default" : "outline"}
              size="icon"
              aria-label="List view"
              onClick={() => setView("list")}
            >
              <List className="size-4" />
            </Button>
          </div>
        </div>

        {error && (
          <p role="alert" className="text-sm text-red-600 dark:text-red-400">
            {error.message}{" "}
            <Link href="/" className="underline">
              Back to all boards
            </Link>
          </p>
        )}
        {isLoading && (
          <div className={layout}>
            {Array.from({ length: 6 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        )}
        {isEmpty && (
          <p className="py-16 text-center text-slate-500 dark:text-slate-400">
            This folder is empty. Create a folder or a board to get started.
          </p>
        )}
        {folders.length > 0 && (
          <section className="space-y-3">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Folders</h2>
            <div className={layout}>
              {folders.map((f) => (
                <FolderTile key={f.id} folder={f} />
              ))}
            </div>
          </section>
        )}
        {boards.length > 0 && (
          <section className="space-y-3">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Boards</h2>
            <div className={layout}>
              {boards.map((b) => (
                <BoardTile key={b.id} board={b} />
              ))}
            </div>
          </section>
        )}
        {data && !isEmpty && folders.length === 0 && boards.length === 0 && (
          <p className="py-12 text-center text-slate-500">Nothing matches your search.</p>
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
