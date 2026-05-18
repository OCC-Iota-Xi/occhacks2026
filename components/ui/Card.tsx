"use client";

import { motion } from "framer-motion";

interface CardProps {
  icon: string;
  title: string;
  description: string;
  index?: number;
}

export default function Card({ icon, title, description, index = 0 }: CardProps) {
  return (
    <motion.div
      className="glass-card p-8 flex flex-col items-center text-center gap-4"
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{
        duration: 0.6,
        delay: index * 0.15,
        ease: "easeOut",
      }}
    >
      <span className="text-4xl" role="img">
        {icon}
      </span>
      <h3 className="font-[family-name:var(--font-oxanium)] text-xl font-bold text-bone">
        {title}
      </h3>
      <p className="text-fog/70 text-sm leading-relaxed">{description}</p>
    </motion.div>
  );
}
