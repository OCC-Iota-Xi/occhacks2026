"use client";

import { motion } from "framer-motion";
import { STATS } from "@/lib/constants";

export default function StatsBar() {
  return (
    <motion.div
      className="w-full mt-16 grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-0"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 1.2 }}
    >
      {STATS.map((stat, i) => (
        <div
          key={stat.label}
          className={`flex flex-col items-center gap-2 py-4 ${
            i < STATS.length - 1
              ? "md:border-r md:border-steel-deck/50"
              : ""
          }`}
        >
          <span className="text-lg">{stat.icon}</span>
          <span className="font-[family-name:var(--font-space-mono)] text-xs tracking-[0.15em] uppercase text-fog/60">
            {stat.label}
          </span>
        </div>
      ))}
    </motion.div>
  );
}
