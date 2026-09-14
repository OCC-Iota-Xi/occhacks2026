"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { useToast } from "@/components/admin/Toast";
import { Empty } from "@/components/admin/ui";
import { Button } from "@/components/ui/button";
import { addContacts, removeContact } from "@/lib/admin/email-actions";
import { formatDate } from "@/lib/admin/format";
import type { EmailContact } from "@/lib/admin/email";

/**
 * The hand-kept list: judges, sponsors, a speaker's assistant — anyone who
 * should get organizer mail without having filled in a form. Paste in
 * whatever a mail client gives you; the parser sorts out the names.
 */
export default function ContactList({ contacts }: { contacts: EmailContact[] }) {
  const router = useRouter();
  const { toast } = useToast();
  const [pending, startTransition] = useTransition();
  const [text, setText] = useState("");

  const add = () => {
    if (!text.trim()) return;
    startTransition(async () => {
      const result = await addContacts(text);
      if (result.ok) {
        toast(result.message ?? "Added");
        setText("");
        router.refresh();
      } else {
        toast(result.message ?? "That didn't work.", "error");
      }
    });
  };

  const remove = (contact: EmailContact) => {
    startTransition(async () => {
      const result = await removeContact(contact.id);
      if (result.ok) {
        toast(`Removed ${contact.email}`);
        router.refresh();
      } else {
        toast(result.message ?? "That didn't work.", "error");
      }
    });
  };

  return (
    <div>
      <div className="border-b border-border px-4 py-3">
        <textarea
          value={text}
          onChange={(event) => setText(event.target.value)}
          rows={3}
          placeholder={"One per line, or comma-separated. Name <email> works too."}
          spellCheck={false}
          className="scroll-soft w-full resize-y rounded-lg border border-border bg-transparent px-2.5 py-2 text-sm outline-none placeholder:text-muted-foreground focus:border-[var(--ring)]/50"
        />
        <div className="mt-2 flex items-center justify-between gap-2">
          <span className="text-xs text-muted-foreground">
            Duplicates are skipped, so pasting a list twice is safe.
          </span>
          <Button size="sm" onClick={add} disabled={pending || !text.trim()}>
            {pending ? "Adding…" : "Add contacts"}
          </Button>
        </div>
      </div>

      {contacts.length === 0 ? (
        <Empty title="No contacts yet" hint="Addresses you add here become the “Contact list” audience." />
      ) : (
        <ul className="scroll-soft max-h-96 divide-y divide-border overflow-y-auto">
          {contacts.map((contact) => (
            <li key={contact.id} className="flex items-center gap-3 px-4 py-2 text-sm">
              <div className="min-w-0 flex-1">
                <div className="truncate text-foreground">{contact.email}</div>
                <div className="truncate text-xs text-muted-foreground">
                  {[contact.name, contact.note].filter(Boolean).join(" · ") || "—"}
                </div>
              </div>
              <span className="shrink-0 text-xs text-muted-foreground">
                {formatDate(contact.created_at)}
              </span>
              <button
                type="button"
                onClick={() => remove(contact)}
                disabled={pending}
                className="shrink-0 rounded-md p-1 text-muted-foreground transition-colors hover:bg-rose-400/10 hover:text-rose-300 disabled:opacity-40"
                aria-label={`Remove ${contact.email}`}
              >
                <Trash2 className="size-3.5" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
