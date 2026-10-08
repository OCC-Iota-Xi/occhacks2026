"use client";

import { useEffect, useState } from "react";
import { Check, Mail } from "lucide-react";
import { useToast } from "@/components/admin/Toast";

/** The applicant's email, which copies to the clipboard instead of opening a mail client. */
export default function CopyEmail({ email }: { email: string }) {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const timer = setTimeout(() => setCopied(false), 1500);
    return () => clearTimeout(timer);
  }, [copied]);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(email);
      setCopied(true);
    } catch {
      toast("Couldn't copy the email.", "error");
    }
  };

  return (
    <button
      type="button"
      onClick={copy}
      title="Copy email"
      className="inline-flex cursor-pointer items-center gap-1 transition-colors hover:text-foreground"
    >
      {copied ? <Check className="size-3 text-emerald-400" /> : <Mail className="size-3" />}
      {email}
      <span aria-live="polite" className="sr-only">
        {copied ? "Copied" : ""}
      </span>
    </button>
  );
}
