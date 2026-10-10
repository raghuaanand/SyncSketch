"use client";

import { cn } from "@/lib/utils"

export function SkeletonCard({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "animate-pulse overflow-hidden rounded-xl border bg-card",
        className,
      )}
    >
      <div className="h-28 bg-muted" />
      <div className="space-y-2 p-4">
        <div className="h-3.5 w-2/3 rounded bg-muted" />
        <div className="h-3 w-1/3 rounded bg-muted" />
      </div>
    </div>
  )
}
