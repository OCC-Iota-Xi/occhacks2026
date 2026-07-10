"use client";

import * as React from "react";
import { RadioGroup as RadioGroupPrimitive } from "radix-ui";

import { cn } from "@/lib/utils";

function RadioGroup({
  className,
  ...props
}: React.ComponentProps<typeof RadioGroupPrimitive.Root>) {
  return (
    <RadioGroupPrimitive.Root
      data-slot="radio-group"
      className={cn("flex flex-wrap items-center justify-center gap-2", className)}
      {...props}
    />
  );
}

/** Pill-style option, matching the schedule tabs. */
function RadioGroupItem({
  className,
  children,
  ...props
}: React.ComponentProps<typeof RadioGroupPrimitive.Item>) {
  return (
    <RadioGroupPrimitive.Item
      data-slot="radio-group-item"
      className={cn(
        "rounded-full border border-border px-5 py-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40 data-[state=checked]:border-foreground data-[state=checked]:bg-foreground data-[state=checked]:text-background",
        className
      )}
      {...props}
    >
      {children}
    </RadioGroupPrimitive.Item>
  );
}

export { RadioGroup, RadioGroupItem };
