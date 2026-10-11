import { LogoMark } from "@/components/logo";

export function ScreenMessage({ children, pulse }: { children: React.ReactNode; pulse?: boolean }) {
  return (
    <div className="flex h-screen flex-col items-center justify-center gap-4 bg-background">
      <LogoMark className={pulse ? "size-12 animate-pulse" : "size-12"} />
      <p className="font-serif text-xl text-muted-foreground">{children}</p>
    </div>
  );
}
