"use client";

import { useRef, useState, type ClipboardEvent, type KeyboardEvent } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { EMAIL_RE, normalizeEmail, parseAddresses } from "@/lib/admin/email";

/**
 * The To field, the way a mail client does it: addresses become chips as
 * they're typed, a paste of a whole list becomes many chips at once, and
 * Backspace on an empty box pulls the last one back out. A chip that doesn't
 * look like an address stays visible — red, and left out of the count — so
 * the typo is where the organizer can see it.
 */
export default function RecipientChips({
  value,
  onChange,
  disabled,
  placeholder = "Add an address and press Enter…",
}: {
  value: string[];
  onChange: (next: string[]) => void;
  disabled?: boolean;
  placeholder?: string;
}) {
  const [draft, setDraft] = useState("");
  const input = useRef<HTMLInputElement>(null);

  const add = (raw: string) => {
    const pieces = raw
      .split(/[\s,;]+/)
      .map((piece) => piece.trim())
      .filter(Boolean);
    if (!pieces.length) return;
    const next = [...value];
    for (const piece of pieces) {
      const email = normalizeEmail(piece);
      if (!next.includes(email)) next.push(email);
    }
    onChange(next);
    setDraft("");
  };

  const remove = (email: string) => onChange(value.filter((item) => item !== email));

  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter" || event.key === "," || event.key === " " || event.key === ";") {
      if (draft.trim()) {
        event.preventDefault();
        add(draft);
      } else if (event.key !== " ") {
        event.preventDefault();
      }
    } else if (event.key === "Backspace" && !draft && value.length) {
      event.preventDefault();
      remove(value[value.length - 1]);
    }
  };

  const onPaste = (event: ClipboardEvent<HTMLInputElement>) => {
    const text = event.clipboardData.getData("text");
    if (!/[\s,;<]/.test(text.trim())) return;
    event.preventDefault();
    const { valid, invalid } = parseAddresses(text);
    add([...valid.map((v) => v.email), ...invalid].join(" "));
  };

  return (
    <div
      onClick={() => input.current?.focus()}
      className={cn(
        "flex min-h-8 w-full cursor-text flex-wrap items-center gap-1 rounded-lg border border-border bg-transparent px-2 py-1 text-sm focus-within:border-[var(--ring)]/50",
        disabled && "pointer-events-none opacity-60"
      )}
    >
      {value.map((email) => {
        const valid = EMAIL_RE.test(email);
        return (
          <span
            key={email}
            className={cn(
              "inline-flex max-w-full items-center gap-1 rounded-md border px-1.5 py-0.5 text-xs",
              valid
                ? "border-border bg-muted/60 text-foreground"
                : "border-rose-400/40 bg-rose-400/10 text-rose-200"
            )}
            title={valid ? undefined : "Doesn't look like an email address — it won't be sent to"}
          >
            <span className="truncate">{email}</span>
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                remove(email);
              }}
              className="rounded p-0.5 text-muted-foreground hover:text-foreground"
              aria-label={`Remove ${email}`}
            >
              <X className="size-3" />
            </button>
          </span>
        );
      })}
      <input
        ref={input}
        value={draft}
        disabled={disabled}
        onChange={(event) => setDraft(event.target.value)}
        onKeyDown={onKeyDown}
        onPaste={onPaste}
        onBlur={() => draft.trim() && add(draft)}
        placeholder={value.length ? "" : placeholder}
        autoComplete="off"
        spellCheck={false}
        className="min-w-[12rem] flex-1 bg-transparent py-0.5 text-sm outline-none placeholder:text-muted-foreground"
      />
    </div>
  );
}
