"use client";

import { useSyncExternalStore } from "react";
import { applicationsClosed } from "@/lib/deadline";

function subscribe(onTick: () => void) {
  const id = window.setInterval(onTick, 1000);
  return () => window.clearInterval(id);
}
const getClosed = () => applicationsClosed();

/**
 * Whether the application deadline has passed, flipping live for a page left
 * open across it. `initial` is the server's answer at render: the markup
 * hydrates against it, then the browser's own clock takes over.
 */
export function useApplicationsClosed(initial: boolean) {
  return useSyncExternalStore(subscribe, getClosed, () => initial);
}
