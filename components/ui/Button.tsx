"use client";

import { motion } from "framer-motion";

interface ButtonProps {
  children: React.ReactNode;
  href?: string;
  variant?: "filled" | "outline";
  className?: string;
  disabled?: boolean;
}

export default function Button({
  children,
  href = "#",
  variant = "filled",
  className = "",
  disabled = false,
}: ButtonProps) {
  const base =
    "relative inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-full font-[family-name:var(--font-oxanium)] font-semibold text-sm tracking-wider uppercase transition-all duration-300 cursor-pointer overflow-hidden";

  const variants = {
    filled:
      "bg-aged-gold text-void hover:shadow-[0_0_30px_rgba(201,168,76,0.4)] hover:scale-[1.02] active:scale-[0.98]",
    outline:
      "border-2 border-steel-blue text-steel-blue hover:border-aged-gold hover:text-aged-gold hover:shadow-[0_0_20px_rgba(91,127,165,0.2)] active:scale-[0.98]",
  };

  const disabledStyle = disabled ? "opacity-50 cursor-not-allowed" : "";

  return (
    <motion.a
      href={disabled ? undefined : href}
      className={`${base} ${variants[variant]} ${disabledStyle} ${className}`}
      whileHover={disabled ? {} : { scale: 1.03 }}
      whileTap={disabled ? {} : { scale: 0.97 }}
    >
      {children}
    </motion.a>
  );
}
