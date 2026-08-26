"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";
import { CircleAlert, CircleCheck, X } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Feedback for actions that don't otherwise show their result.
 *
 * A tiny provider rather than a toast library: the dashboard needs "it worked"
 * and "it didn't, here's why", and everything else about a toast — queues,
 * promises, positions — would be weight for no gain.
 */

type Tone = "success" | "error";

interface Toast {
  id: number;
  message: string;
  tone: Tone;
}

const ToastContext = createContext<{
  toast: (message: string, tone?: Tone) => void;
}>({ toast: () => {} });

export function useToast() {
  return useContext(ToastContext);
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const toast = useCallback((message: string, tone: Tone = "success") => {
    const id = Date.now() + Math.random();
    setToasts((current) => [...current, { id, message, tone }]);
    setTimeout(() => {
      setToasts((current) => current.filter((t) => t.id !== id));
    }, 5000);
  }, []);

  const value = useMemo(() => ({ toast }), [toast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed right-4 bottom-4 z-100 flex w-80 flex-col gap-2">
        {toasts.map((item) => (
          <div
            key={item.id}
            role="status"
            className={cn(
              "pointer-events-auto flex items-start gap-2 rounded-lg border bg-popover/95 px-3 py-2 text-sm shadow-lg backdrop-blur",
              item.tone === "error"
                ? "border-destructive/40 text-rose-200"
                : "border-border text-foreground"
            )}
          >
            {item.tone === "error" ? (
              <CircleAlert className="mt-0.5 size-4 shrink-0 text-rose-400" />
            ) : (
              <CircleCheck className="mt-0.5 size-4 shrink-0 text-emerald-400" />
            )}
            <span className="min-w-0 flex-1">{item.message}</span>
            <button
              type="button"
              onClick={() => setToasts((current) => current.filter((t) => t.id !== item.id))}
              className="text-muted-foreground transition-colors hover:text-foreground"
              aria-label="Dismiss"
            >
              <X className="size-3.5" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
