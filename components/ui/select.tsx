import * as React from "react";

import { cn } from "@/lib/utils";

/** Native select styled to match the underlined form inputs. */
function Select({ className, children, ...props }: React.ComponentProps<"select">) {
  return (
    <select
      data-slot="select"
      className={cn(
        "w-full cursor-pointer appearance-none rounded-none border-0 border-b border-border bg-transparent px-0 py-2.5 text-center text-base outline-none transition-colors focus-visible:border-foreground disabled:cursor-not-allowed disabled:opacity-50 [&>option]:bg-background [&>option]:text-foreground",
        className
      )}
      {...props}
    >
      {children}
    </select>
  );
}

export { Select };
