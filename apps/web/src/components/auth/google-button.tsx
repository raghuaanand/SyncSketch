"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { signIn } from "@/lib/auth-client";
import { FormError } from "./auth-shell";

export function GoogleButton() {
  const [error, setError] = useState<string>();
  const [pending, setPending] = useState(false);

  return (
    <div className="space-y-2">
      <Button
        type="button"
        variant="outline"
        className="w-full"
        disabled={pending}
        onClick={async () => {
          setPending(true);
          setError(undefined);
          const { error } = await signIn.social({
            provider: "google",
            callbackURL: "/",
          });
          if (error) {
            setError(error.message ?? "Google sign-in failed");
            setPending(false);
          }
        }}
      >
        Continue with Google
      </Button>
      <FormError message={error} />
    </div>
  );
}

export function OrDivider() {
  return (
    <div className="flex items-center gap-3 text-xs text-muted-foreground">
      <div className="h-px flex-1 bg-border" />
      or
      <div className="h-px flex-1 bg-border" />
    </div>
  );
}
