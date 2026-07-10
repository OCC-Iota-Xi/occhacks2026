import * as React from "react";

import { cn } from "@/lib/utils";

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "w-full rounded-none border-0 border-b border-border bg-transparent px-0 py-2.5 text-center text-base outline-none transition-colors placeholder:text-muted-foreground/60 focus-visible:border-foreground disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    />
  );
}

export { Input };
