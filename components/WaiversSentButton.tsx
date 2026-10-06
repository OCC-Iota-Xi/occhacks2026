"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Check } from "lucide-react";
import { markWaiversSent } from "@/app/(account)/status/actions";

/**
 * The applicant's "I've emailed them" — moves the status page to waivers sent.
 *
 * `previewNext` is set when the page is showing a development preview rather
 * than the caller's own state. A preview has no row of its own to stamp, so the
 * button walks to the next preview instead of writing to whoever is signed in.
 */
export default function WaiversSentButton({ previewNext }: { previewNext?: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const send = () => {
    if (previewNext) {
      router.push(previewNext);
      return;
    }
    startTransition(async () => {
      const result = await markWaiversSent();
      setError(result.ok ? null : (result.message ?? "Something went wrong."));
    });
  };

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
