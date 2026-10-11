"use client";

import { PenLine, StickyNote, type LucideIcon } from "lucide-react";
import { BOARD_KIND_META, BOARD_KINDS, type BoardKind } from "@/lib/board-kinds";
import { cn } from "@/lib/utils";

const ICONS: Record<BoardKind, LucideIcon> = {
  SKETCH: PenLine,
  WHITEBOARD: StickyNote,
};

export function BoardKindIcon({ kind, className }: { kind: BoardKind; className?: string }) {
  const Icon = ICONS[kind];
  return <Icon className={className} aria-hidden="true" />;
}

export function BoardKindBadge({ kind, className }: { kind: BoardKind; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border bg-secondary/60 px-2 py-0.5 text-xs font-medium text-secondary-foreground",
        className,
      )}
    >
      <BoardKindIcon kind={kind} className="size-3" />
      {BOARD_KIND_META[kind].label}
    </span>
  );
}

export function BoardKindPicker({
  value,
  onChange,
}: {
  value: BoardKind;
  onChange: (kind: BoardKind) => void;
}) {
  return (
    <div role="radiogroup" aria-label="Board type" className="grid gap-2 sm:grid-cols-2">
      {BOARD_KINDS.map((kind) => {
        const selected = kind === value;
        return (
          <button
            key={kind}
            type="button"
            role="radio"
            aria-checked={selected}
            onClick={() => onChange(kind)}
            className={cn(
              "flex flex-col items-start gap-2 rounded-lg border p-3 text-left transition-colors hover:border-primary/50",
              selected && "border-primary bg-primary/5 ring-1 ring-primary",
            )}
          >
            <span className="flex items-center gap-2 font-medium">
              <BoardKindIcon kind={kind} className="size-4 text-primary" />
              {BOARD_KIND_META[kind].label}
            </span>
            <span className="text-xs text-muted-foreground">{BOARD_KIND_META[kind].description}</span>
          </button>
        );
      })}
    </div>
  );
}
