import { Wordmark } from "@/components/logo";

export function AuthShell({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <div className="grid min-h-screen lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)]">
      <aside className="relative hidden flex-col overflow-hidden bg-panel p-12 text-panel-foreground lg:flex">
        <Wordmark />
        <div className="relative z-10 mt-[16vh] max-w-md space-y-5">
          <h2 className="font-serif text-5xl font-normal leading-[1.1] tracking-tight">
            Give your rough ideas <em className="text-kraft">room to breathe.</em>
          </h2>
          <p className="text-base leading-relaxed text-panel-foreground/70">
            Sketch, diagram and think out loud on an infinite canvas. Keep every board
            organised in folders, saved as you draw.
          </p>
        </div>
        <svg
          viewBox="0 0 400 300"
          className="pointer-events-none absolute -bottom-4 -right-8 w-[32rem]"
          fill="none"
          aria-hidden="true"
        >
          <path
            d="M20 230c40-90 90-150 140-130s-30 110 40 110 90-90 180-150"
            stroke="hsl(var(--primary))"
            strokeWidth="5"
            strokeLinecap="round"
          />
          <rect x="70" y="60" width="110" height="70" rx="10" stroke="hsl(var(--kraft))" strokeWidth="3" strokeDasharray="2 9" strokeLinecap="round" />
          <circle cx="300" cy="90" r="34" stroke="hsl(var(--panel-foreground) / 0.5)" strokeWidth="3" strokeLinecap="round" strokeDasharray="1 10" />
        </svg>
      </aside>

      <main className="flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm space-y-8">
          <Wordmark className="lg:hidden" />
          <div className="space-y-2">
            <h1 className="font-serif text-4xl font-medium tracking-tight">{title}</h1>
            <p className="text-muted-foreground">{description}</p>
          </div>
          <div className="space-y-5">{children}</div>
        </div>
      </main>
    </div>
  );
}

export function FormError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p
      role="alert"
      className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive"
    >
      {message}
    </p>
  );
}
