import * as React from "react";

import { cn } from "@/lib/utils";

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "min-h-24 w-full resize-none rounded-none border-0 border-b border-border bg-transparent px-0 py-2.5 text-center text-base outline-none transition-colors placeholder:text-muted-foreground/60 focus-visible:border-foreground disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    />
  );
}

export { Textarea };
