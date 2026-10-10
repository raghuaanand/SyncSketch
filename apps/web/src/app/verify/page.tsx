"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { AuthShell, FormError } from "@/components/auth/auth-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authClient } from "@/lib/auth-client";

const RESEND_COOLDOWN_SECONDS = 60;

function VerifyForm() {
  const router = useRouter();
  const email = useSearchParams().get("email") ?? "";
  const [otp, setOtp] = useState("");
  const [error, setError] = useState<string>();
  const [info, setInfo] = useState<string>();
  const [pending, setPending] = useState(false);
  const [cooldown, setCooldown] = useState(RESEND_COOLDOWN_SECONDS);

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);
    setError(undefined);
    // On success the server also signs the user in.
    const { error } = await authClient.emailOtp.verifyEmail({ email, otp });
    if (error) {
      setError(error.message ?? "Invalid or expired code");
      setPending(false);
      return;
    }
    router.push("/");
    router.refresh();
  }

  async function resend() {
    setError(undefined);
    setInfo(undefined);
    const { error } = await authClient.emailOtp.sendVerificationOtp({
      email,
      type: "email-verification",
    });
    if (error) {
      setError(error.message ?? "Could not resend the code");
      return;
    }
    setInfo("A new code is on its way.");
    setCooldown(RESEND_COOLDOWN_SECONDS);
  }

  if (!email) {
    return (
      <AuthShell title="Verify your email" description="No email to verify.">
        <Link href="/signup" className="underline text-sm">
          Back to sign up
        </Link>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      title="Check your email"
      description={`Enter the 6-digit code we sent to ${email}.`}
    >
      <form onSubmit={onSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="otp">Verification code</Label>
          <Input
            id="otp"
            inputMode="numeric"
            autoComplete="one-time-code"
            pattern="[0-9]{6}"
            maxLength={6}
            required
            value={otp}
            onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
            className="text-center text-xl tracking-[0.5em]"
          />
        </div>
        <FormError message={error} />
        {info && <p className="text-sm text-muted-foreground">{info}</p>}
        <Button
          type="submit"
          className="w-full"
          disabled={pending || otp.length !== 6}
        >
          {pending ? "Verifying..." : "Verify"}
        </Button>
      </form>
      <Button
        type="button"
        variant="ghost"
        className="w-full"
        disabled={cooldown > 0}
        onClick={resend}
      >
        {cooldown > 0 ? `Resend code in ${cooldown}s` : "Resend code"}
      </Button>
    </AuthShell>
  );
}

export default function VerifyPage() {
  return (
    <Suspense>
      <VerifyForm />
    </Suspense>
  );
}
