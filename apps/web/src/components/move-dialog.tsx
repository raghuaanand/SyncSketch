"use client";

import { ChevronRight, Folder, Home } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useItems } from "@/lib/queries";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  itemName: string;
  // Folder being moved (cannot be picked as its own destination); omit for boards.
  folderId?: string;
  currentParentId: string | null;
  onMove: (destinationId: string | null) => Promise<unknown>;
};

// Browse the folder tree level by level and pick a destination.
export function MoveDialog({
  open,
  onOpenChange,
  itemName,
  folderId,
  currentParentId,
  onMove,
}: Props) {
  const [location, setLocation] = useState<string | null>(null);
  const [error, setError] = useState<string>();
  const [pending, setPending] = useState(false);
  const { data, isLoading } = useItems(location, open);

  useEffect(() => {
    if (open) {
      setLocation(currentParentId);
      setError(undefined);
    }
  }, [open, currentParentId]);

  const insideMovedFolder = !!folderId && data?.path.some((f) => f.id === folderId);

  async function move() {
    setPending(true);
    setError(undefined);
    try {
      await onMove(location);
      onOpenChange(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not move");
    } finally {
      setPending(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Move &quot;{itemName}&quot;</DialogTitle>
          <DialogDescription>Choose a destination folder.</DialogDescription>
        </DialogHeader>

        <div className="flex flex-wrap items-center gap-1 text-sm">
          <button
            type="button"
            className="flex items-center gap-1 hover:underline"
            onClick={() => setLocation(null)}
          >
            <Home className="size-4" /> All boards
          </button>
          {data?.path.map((f) => (
            <span key={f.id} className="flex items-center gap-1">
              <ChevronRight className="size-3" />
              <button type="button" className="hover:underline" onClick={() => setLocation(f.id)}>
                {f.name}
              </button>
            </span>
          ))}
        </div>

        <div className="max-h-64 overflow-y-auto rounded-md border divide-y">
          {isLoading && <p className="p-3 text-sm text-muted-foreground">Loading...</p>}
          {data?.folders
            .filter((f) => f.id !== folderId)
            .map((f) => (
              <button
                key={f.id}
                type="button"
                className="flex w-full items-center gap-2 p-3 text-left text-sm hover:bg-accent"
                onClick={() => setLocation(f.id)}
              >
                <Folder className="size-4 text-kraft" />
                <span className="truncate">{f.name}</span>
                <ChevronRight className="ml-auto size-4 text-muted-foreground" />
              </button>
            ))}
          {data && data.folders.filter((f) => f.id !== folderId).length === 0 && (
            <p className="p-3 text-sm text-muted-foreground">No subfolders here.</p>
          )}
        </div>

        {error && (
          <p role="alert" className="text-sm text-destructive">
            {error}
          </p>
        )}
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={move}
            disabled={pending || location === currentParentId || insideMovedFolder}
          >
            Move here
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
