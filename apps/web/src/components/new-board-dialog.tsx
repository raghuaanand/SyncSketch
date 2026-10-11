"use client";

import { useState } from "react";
import { BoardKindPicker } from "@/components/board-kind";
import { NameDialog } from "@/components/name-dialog";
import type { BoardKind } from "@/lib/board-kinds";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreate: (name: string, kind: BoardKind) => Promise<unknown>;
};

export function NewBoardDialog({ open, onOpenChange, onCreate }: Props) {
  const [kind, setKind] = useState<BoardKind>("SKETCH");
  return (
    <NameDialog
      open={open}
      onOpenChange={onOpenChange}
      title="New board"
      submitLabel="Create board"
      onSubmit={(name) => onCreate(name, kind)}
    >
      <BoardKindPicker value={kind} onChange={setKind} />
    </NameDialog>
  );
}
