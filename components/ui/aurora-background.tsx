"use client";
import { cn } from "@/lib/utils";
import React, { ReactNode } from "react";

interface AuroraBackgroundProps extends React.HTMLProps<HTMLDivElement> {
  children: ReactNode;
  showRadialGradient?: boolean;
}

export const AuroraBackground = ({
  className,
  children,
  showRadialGradient = true,
  ...props
}: AuroraBackgroundProps) => {
  return (
    <div
      className={cn(
        "transition-bg relative flex h-[100vh] flex-col items-center justify-center bg-white text-slate-950 dark:bg-white dark:text-slate-950",
        className,
      )}
      {...props}
    >
      <div className="absolute inset-0 overflow-hidden">
        <div
          className="aurora-el"
          style={showRadialGradient ? {
            maskImage: "radial-gradient(ellipse 85% 75% at 70% 30%, black 10%, transparent 70%)",
            WebkitMaskImage: "radial-gradient(ellipse 85% 75% at 70% 30%, black 10%, transparent 70%)",
          } : undefined}
        ></div>
      </div>
      {children}
    </div>
  );
};
