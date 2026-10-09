"use client";

import { useEffect, useState, type ReactNode } from "react";
import { Check } from "lucide-react";
import { useToast } from "@/components/admin/Toast";

/**
 * A piece of the applicant's details that copies to the clipboard when pressed.
 * `label` names it in the tooltip and error ("email", "name"). The check mark
 * takes the icon's place when there is one, and trails the text otherwise.
 */
export default function CopyText({ value, label, icon }: { value: string; label: string; icon?: ReactNode }) {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const timer = setTimeout(() => setCopied(false), 1500);
    return () => clearTimeout(timer);
  }, [copied]);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
    } catch {
      toast(`Couldn't copy the ${label}.`, "error");
    }
  };

  const check = <Check className="size-3 text-emerald-400" />;

  return (
    <button
      type="button"
      onClick={copy}
      title={`Copy ${label}`}
      className="inline-flex cursor-pointer items-center gap-1 transition-colors hover:text-foreground"
    >
      {icon && (copied ? check : icon)}
      {value}
      {!icon && copied && check}
      <span aria-live="polite" className="sr-only">
        {copied ? "Copied" : ""}
      </span>
    </button>
  );
}
