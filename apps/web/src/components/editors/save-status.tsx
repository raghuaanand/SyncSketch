import type { SaveStatus } from "./use-board-session";

const dot: Record<SaveStatus, string> = {
  saved: "bg-success",
  saving: "animate-pulse bg-primary",
  error: "bg-destructive",
};

export function SaveStatusPill({
  status,
  boardName,
  error,
}: {
  status: SaveStatus;
  boardName: string;
  error?: string;
}) {
  return (
    <div
      className="pointer-events-none fixed bottom-4 left-1/2 z-[500] flex max-w-[90vw] -translate-x-1/2 items-center gap-2 rounded-full border bg-card px-3 py-1.5 text-xs text-card-foreground shadow-md"
      role="status"
    >
      <span className={`size-2 shrink-0 rounded-full ${dot[status]}`} />
      <span className="truncate">
        {status === "saving" && "Saving..."}
        {status === "saved" && `${boardName} · Saved`}
        {status === "error" && `Not saved: ${error}`}
      </span>
    </div>
  );
}
