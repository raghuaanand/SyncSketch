"use client";

import { Copy, FolderInput, MoreVertical, Pencil, Trash2 } from "lucide-react";
import { useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoveDialog } from "./move-dialog";
import { NameDialog } from "./name-dialog";

type Props = {
  kind: "folder" | "board";
  id: string;
  name: string;
  parentId: string | null;
  onRename: (name: string) => Promise<unknown>;
  onMove: (destinationId: string | null) => Promise<unknown>;
  onDelete: () => Promise<unknown>;
  onDuplicate?: () => Promise<unknown>;
};

// The "..." menu on a tile plus the dialogs it opens.
export function ItemMenu({ kind, id, name, parentId, onRename, onMove, onDelete, onDuplicate }: Props) {
  const [dialog, setDialog] = useState<"rename" | "move" | "delete" | null>(null);
  const close = (open: boolean) => !open && setDialog(null);

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="h-8 w-8" aria-label={`Actions for ${name}`}>
            <MoreVertical className="size-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onSelect={() => setDialog("rename")}>
            <Pencil className="mr-2 size-4" /> Rename
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={() => setDialog("move")}>
            <FolderInput className="mr-2 size-4" /> Move to...
          </DropdownMenuItem>
          {onDuplicate && (
            <DropdownMenuItem onSelect={() => void onDuplicate()}>
              <Copy className="mr-2 size-4" /> Duplicate
            </DropdownMenuItem>
          )}
          <DropdownMenuItem
            className="text-red-600 dark:text-red-400"
            onSelect={() => setDialog("delete")}
          >
            <Trash2 className="mr-2 size-4" /> Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <NameDialog
        open={dialog === "rename"}
        onOpenChange={close}
        title={`Rename ${kind}`}
        submitLabel="Rename"
        initialName={name}
        onSubmit={onRename}
      />
      <MoveDialog
        open={dialog === "move"}
        onOpenChange={close}
        itemName={name}
        folderId={kind === "folder" ? id : undefined}
        currentParentId={parentId}
        onMove={onMove}
      />
      <AlertDialog open={dialog === "delete"} onOpenChange={close}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {kind}</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete &quot;{name}&quot;
              {kind === "folder" ? " and everything inside it" : ""}. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700 text-white"
              onClick={() => void onDelete()}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
