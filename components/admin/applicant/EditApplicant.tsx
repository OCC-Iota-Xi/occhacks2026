"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Pencil } from "lucide-react";
import { Dialog } from "radix-ui";
import { useToast } from "@/components/admin/Toast";
import { Button } from "@/components/ui/button";
import { updateApplicant } from "@/lib/admin/actions";
import type { Applicant } from "@/lib/admin/types";

const FIELDS = [
  { key: "full_name", label: "Name" },
  { key: "email", label: "Email" },
  { key: "phone", label: "Phone" },
  { key: "school", label: "School" },
  { key: "major", label: "Major" },
  { key: "shirt", label: "Shirt size" },
  { key: "needs", label: "Accessibility or dietary needs" },
] as const;

/**
 * Correcting an applicant's own answers.
 *
 * Deliberately a short list of fields: organizers fix typos and bounced email
 * addresses, they don't rewrite applications. Every save is recorded in the
 * activity log with the field names, so a changed email can be traced later.
 */
export default function EditApplicant({ applicant }: { applicant: Applicant }) {
  const router = useRouter();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const [values, setValues] = useState<Record<string, string>>(() =>
    Object.fromEntries(
      FIELDS.map(({ key }) => [key, (applicant[key] as string | null) ?? ""])
    )
  );

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>
        <Button size="sm" variant="ghost">
          <Pencil className="size-3.5" />
          Edit
        </Button>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-100 bg-black/50 backdrop-blur-xs" />
        <Dialog.Content className="fixed top-1/2 left-1/2 z-100 w-[min(30rem,calc(100vw-2rem))] -translate-x-1/2 -translate-y-1/2 rounded-xl border border-border bg-popover p-5 shadow-2xl">
          <Dialog.Title className="text-sm">Edit applicant details</Dialog.Title>
          <Dialog.Description className="mt-1 text-xs text-muted-foreground">
            For corrections — a misspelled school, a bounced email. The change is logged.
          </Dialog.Description>

          <div className="mt-4 space-y-2.5">
            {FIELDS.map(({ key, label }) => (
              <label key={key} className="block">
                <span className="text-xs text-muted-foreground">{label}</span>
                <input
                  value={values[key]}
                  onChange={(event) => setValues({ ...values, [key]: event.target.value })}
                  className="mt-0.5 w-full rounded-lg border border-border bg-transparent px-2.5 py-1.5 text-sm outline-none focus:border-[var(--ring)]/50"
                />
              </label>
            ))}
          </div>

          <div className="mt-5 flex justify-end gap-2">
            <Dialog.Close asChild>
              <Button variant="ghost" size="sm">
                Cancel
              </Button>
            </Dialog.Close>
            <Button
              size="sm"
              disabled={pending}
              onClick={() =>
                startTransition(async () => {
                  const result = await updateApplicant(applicant.id, values);
                  if (result.ok) {
                    toast("Details updated");
                    setOpen(false);
                    router.refresh();
                  } else {
                    toast(result.message ?? "Could not save those changes.", "error");
                  }
                })
              }
            >
              Save changes
            </Button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
