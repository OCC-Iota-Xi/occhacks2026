"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

/**
 * The last stop for an unexpected failure — a dropped connection, a query the
 * database refused. Deliberately says nothing about the applicant data that was
 * being loaded when it happened.
 */
export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[admin]", error);
  }, [error]);

  return (
    <div className="rounded-xl border border-border bg-card/40 px-5 py-8 text-center">
      <h2 className="text-sm">Something went wrong loading this page</h2>
      <p className="mx-auto mt-2 max-w-md text-xs text-muted-foreground">
        If this keeps happening, your session may have expired — sign out and back in. The
        details are in the server log{error.digest ? ` (digest ${error.digest})` : ""}.
      </p>
      <Button size="sm" variant="outline" className="mt-4" onClick={reset}>
        Try again
      </Button>
    </div>
  );
}
