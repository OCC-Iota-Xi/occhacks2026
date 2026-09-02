"use client";

import { useState } from "react";
import { Dialog } from "radix-ui";
import { Button } from "@/components/ui/button";

/**
 * The check before a decision that moves many rows at once. Deliberately says
 * what will happen and to how many people, because "Accept 34 applicants" and
 * "Accept 3 applicants" are very different clicks.
 *
 * `confirmText` adds a word to type before the button works. Reserved for the
 * one action with no undo — deleting applications — where a mis-aimed click on
 * a menu item shouldn't be enough on its own.
 */
export default function ConfirmDialog({
  open,
  onOpenChange,
  title,
  body,
  confirmLabel,
  confirmText,
  destructive,
  onConfirm,
  pending,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  body: string;
  confirmLabel: string;
  confirmText?: string;
  destructive?: boolean;
  onConfirm: () => void;
  pending?: boolean;
}) {
  const [typed, setTyped] = useState("");

  // Cleared when the dialog opens or closes, adjusted during render against the
  // last value seen rather than in an effect — otherwise the next dialog would
  // paint with the previous one's word still in the box.
  const [wasOpen, setWasOpen] = useState(open);
  if (wasOpen !== open) {
    setWasOpen(open);
    setTyped("");
  }

  const armed = !confirmText || typed.trim().toUpperCase() === confirmText.toUpperCase();

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-100 bg-black/50 backdrop-blur-xs" />
        <Dialog.Content className="fixed top-1/2 left-1/2 z-100 w-[min(26rem,calc(100vw-2rem))] -translate-x-1/2 -translate-y-1/2 rounded-xl border border-border bg-popover p-5 shadow-2xl">
          <Dialog.Title className="text-sm text-foreground">{title}</Dialog.Title>
          <Dialog.Description className="mt-2 text-sm text-muted-foreground">
            {body}
          </Dialog.Description>

          {confirmText && (
            <label className="mt-4 block">
              <span className="text-xs text-muted-foreground">
                Type <span className="text-foreground">{confirmText}</span> to confirm
              </span>
              <input
                value={typed}
                onChange={(event) => setTyped(event.target.value)}
                autoComplete="off"
                spellCheck={false}
                className="mt-1 w-full rounded-lg border border-border bg-transparent px-2.5 py-1.5 text-sm outline-none focus:border-[var(--ring)]/50"
              />
            </label>
          )}

          <div className="mt-5 flex justify-end gap-2">
            <Dialog.Close asChild>
              <Button variant="ghost" size="sm">
                Cancel
              </Button>
            </Dialog.Close>
            <Button
              size="sm"
              variant={destructive ? "destructive" : "default"}
              disabled={pending || !armed}
              onClick={onConfirm}
            >
              {pending ? "Working…" : confirmLabel}
            </Button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
