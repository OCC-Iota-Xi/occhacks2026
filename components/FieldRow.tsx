import { Label } from "@/components/ui/label";

interface FieldRowProps {
  number: string;
  label: React.ReactNode;
  htmlFor?: string;
  hint?: string;
  wide?: boolean;
  /** Marks the row as failing validation — number and label turn red. */
  invalid?: boolean;
  children: React.ReactNode;
}

/** One ruled form row: number on top, label, control beneath — all centered. */
export default function FieldRow({
  number,
  label,
  htmlFor,
  hint,
  wide,
  invalid,
  children,
}: FieldRowProps) {
  return (
    <div className="py-8 text-center">
      <p
        className={`text-sm tabular-nums ${
          invalid ? "text-destructive" : "text-muted-foreground/70"
        }`}
      >
        {number}
      </p>
      <Label htmlFor={htmlFor} className={`mt-2 text-base ${invalid ? "text-destructive" : ""}`}>
        {label}
      </Label>
      <div className={`mx-auto mt-4 ${wide ? "max-w-lg" : "max-w-sm"}`}>{children}</div>
      {hint && (
        <p
          className={`mt-3 text-sm ${
            invalid ? "text-destructive/80" : "text-muted-foreground/70"
          }`}
        >
          {hint}
        </p>
      )}
    </div>
  );
}
