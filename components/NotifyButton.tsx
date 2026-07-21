"use client";

import { useState, useTransition } from "react";
import { optInNotify, optOutNotify } from "@/app/register/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

/**
 * One-click notify opt-in: an editable email (defaulting to the login
 * email), a save button, confetti on success, and an undo. `initialOptedIn`
 * reflects the DB state at page load.
 */
export default function NotifyButton({
  initialOptedIn,
  defaultEmail,
}: {
  initialOptedIn: boolean;
  defaultEmail: string;
}) {
  const [optedIn, setOptedIn] = useState(initialOptedIn);
  const [email, setEmail] = useState(defaultEmail);
  const [failed, setFailed] = useState(false);
  const [pending, startTransition] = useTransition();

  const optIn = () => {
    startTransition(async () => {
      const { ok } = await optInNotify(email);
      setFailed(!ok);
      if (!ok) return;
      setOptedIn(true);
      const confetti = (await import("canvas-confetti")).default;
      confetti({
        particleCount: 120,
        spread: 75,
        origin: { y: 0.7 },
        colors: ["#fbbf24", "#e8eaf2", "#f97316"],
        disableForReducedMotion: true,
      });
    });
  };

  const undo = () => {
    startTransition(async () => {
      const { ok } = await optOutNotify();
      if (ok) setOptedIn(false);
    });
  };

  if (optedIn) {
    return (
      <div className="text-center">
        <p className="text-sm text-ring">
          thank you — we&apos;ll email <span className="text-foreground">{email}</span>{" "}
          when registration opens.
        </p>
        <button
          type="button"
          onClick={undo}
          disabled={pending}
          className="mt-2 text-xs text-muted-foreground underline underline-offset-4 transition-colors hover:text-foreground disabled:opacity-60"
        >
          undo
        </button>
      </div>
    );
  }

  return (
    <form
      className="w-full max-w-sm text-center"
      onSubmit={(e) => {
        e.preventDefault();
        optIn();
      }}
    >
      <Input
        type="email"
        name="email"
        aria-label="notification email"
        placeholder="you@email.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />
      <Button
        type="submit"
        disabled={pending}
        className="mt-5 h-auto rounded-full bg-foreground px-8 py-3 text-sm text-background hover:bg-foreground/85 disabled:opacity-60"
      >
        {pending ? "saving…" : "email me when registration opens"}
      </Button>
      {failed && (
        <p className="mt-3 text-xs text-ring" role="alert">
          couldn&apos;t save — try again in a moment.
        </p>
      )}
    </form>
  );
}
