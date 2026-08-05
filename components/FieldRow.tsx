import { Label } from "@/components/ui/label";

interface FieldRowProps {
  number: string;
  label: string;
  htmlFor?: string;
  hint?: string;
  wide?: boolean;
  children: React.ReactNode;
}

/** One ruled form row: number on top, label, control beneath — all centered. */
export default function FieldRow({
  number,
  label,
  htmlFor,
  hint,
  wide,
  children,
}: FieldRowProps) {
  return (
    <div className="border-t border-border py-8 text-center">
      <p className="text-xs tabular-nums text-muted-foreground/70">{number}</p>
      <Label htmlFor={htmlFor} className="mt-1.5">
        {label}
      </Label>
      <div className={`mx-auto mt-4 ${wide ? "max-w-lg" : "max-w-sm"}`}>{children}</div>
      {hint && <p className="mt-3 text-xs text-muted-foreground/70">{hint}</p>}
    </div>
  );
}
