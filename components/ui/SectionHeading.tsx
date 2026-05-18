"use client";

import { motion } from "framer-motion";

interface SectionHeadingProps {
  eyebrow?: string;
  headline: string;
  body?: string;
  align?: "left" | "center";
}

export default function SectionHeading({
  eyebrow,
  headline,
  body,
  align = "center",
}: SectionHeadingProps) {
  const alignment = align === "center" ? "text-center items-center" : "text-left items-start";

  return (
    <motion.div
      className={`flex flex-col gap-4 max-w-3xl ${alignment}`}
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.7, ease: "easeOut" }}
    >
      {eyebrow && (
        <motion.span
          className="font-[family-name:var(--font-space-mono)] text-xs tracking-[0.25em] uppercase text-aged-gold"
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          {eyebrow}
        </motion.span>
      )}
      <h2 className="font-[family-name:var(--font-bruno-ace-sc)] text-3xl md:text-4xl lg:text-5xl text-bone leading-tight">
        {headline}
      </h2>
      {body && (
        <p className="text-fog/80 text-base md:text-lg leading-relaxed max-w-2xl">
          {body}
        </p>
      )}
    </motion.div>
  );
}
