import { cn } from "@/lib/utils";

// Three folded panels of a sheet opening out; mirrors public/logo.svg.
export function LogoMark({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex size-9 items-center justify-center rounded-[10px] bg-primary text-primary-foreground",
        className,
      )}
    >
      <svg viewBox="0 0 32 32" className="size-6" fill="currentColor" aria-hidden="true">
        <path d="M6 9l6-2v18l-6-2z" opacity=".6" />
        <path d="M12 7l8 3v12l-8 3z" />
        <path d="M20 10l6-2v16l-6-2z" opacity=".6" />
      </svg>
    </span>
  );
}

export function Wordmark({ className }: { className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <LogoMark />
      <span className="font-serif text-2xl font-medium tracking-tight">unfold</span>
    </span>
  );
}
