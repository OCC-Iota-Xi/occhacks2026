"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/**
 * Keeps a page current without a reload.
 *
 * What these pages show changes because of someone else: an applicant's stage
 * when an organizer acts, an organizer's list when an applicant submits or
 * another organizer decides. None of that reaches the browser by itself, so the
 * page asks: every `every` milliseconds while it's on screen, and straight away
 * when someone comes back to the tab — which is when most people look.
 *
 * `router.refresh()` re-reads the page on the server and swaps in what changed,
 * leaving everything held in the browser alone: scroll, a selection, an open
 * menu, a half-typed search. It stops while the tab is hidden, so a page left
 * open overnight costs nothing.
 *
 * Mount it on pages that are for looking at. On one where the server's copy
 * would be written over what someone is typing, it has no business.
 */
export default function AutoRefresh({ every = 10_000 }: { every?: number }) {
  const router = useRouter();

  useEffect(() => {
    let timer: ReturnType<typeof setInterval> | undefined;

    const stop = () => clearInterval(timer);
    const start = () => {
      stop();
      timer = setInterval(() => router.refresh(), every);
    };
    const onReturn = () => {
      if (document.hidden) {
        stop();
        return;
      }
      router.refresh();
      start();
    };

    if (!document.hidden) start();
    document.addEventListener("visibilitychange", onReturn);
    // Switching windows doesn't change visibility, but it is still "coming back".
    window.addEventListener("focus", onReturn);

    return () => {
      stop();
      document.removeEventListener("visibilitychange", onReturn);
      window.removeEventListener("focus", onReturn);
    };
  }, [router, every]);

  return null;
}
