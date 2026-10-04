"use client";

import { useState, useTransition } from "react";
import { Check } from "lucide-react";
import { markWaiversSent } from "@/app/status/actions";

/** The applicant's "I've emailed them" — moves the status page to under review. */
export default function WaiversSentButton() {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const send = () =>
    startTransition(async () => {
      const result = await markWaiversSent();
      setError(result.ok ? null : (result.message ?? "Something went wrong."));
    });

  return (
    <div className="mt-6">
      <button
        type="button"
        disabled={pending}
        onClick={send}
        className="inline-flex items-center gap-2 rounded-full border border-ring/60 px-6 py-3 text-sm text-ring transition-colors hover:bg-ring/10 disabled:opacity-60"
      >
        <Check className="size-4" />
        {pending ? "saving..." : "i've sent my waivers"}
      </button>
      {error && (
        <p role="alert" className="mt-3 text-sm text-muted-foreground">
          {error}
        </p>
      )}
    </div>
  );
}
