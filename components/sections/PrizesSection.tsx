"use client";

import { motion } from "framer-motion";
import SectionHeading from "@/components/ui/SectionHeading";
import { PRIZES_CONTENT } from "@/lib/constants";

export default function PrizesSection() {
  return (
    <section
      id="prizes"
      className="relative section-padding overflow-hidden"
      style={{
        background:
          "radial-gradient(ellipse at 50% 30%, rgba(13,22,36,0.8) 0%, var(--color-void) 70%)",
      }}
    >
      <div className="max-w-6xl mx-auto flex flex-col items-center gap-16">
        <SectionHeading headline={PRIZES_CONTENT.headline} align="center" />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full">
          {PRIZES_CONTENT.tiers.map((tier, i) => (
            <motion.div
              key={tier.place}
              className="relative p-8 rounded-2xl flex flex-col items-center text-center gap-4 overflow-hidden"
              style={{
                background: "rgba(13, 22, 36, 0.5)",
                backdropFilter: "blur(16px)",
                WebkitBackdropFilter: "blur(16px)",
                border: `1px solid ${tier.borderColor}`,
              }}
              initial={{ opacity: 0, y: 50, scale: 0.95 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{
                duration: 0.6,
                delay: i * 0.2,
                ease: "easeOut",
              }}
              whileHover={{
                scale: 1.03,
                boxShadow: `0 0 40px ${tier.glowColor}`,
              }}
            >
              {/* Gradient glow orb */}
              <div
                className="absolute -top-12 left-1/2 -translate-x-1/2 w-32 h-32 rounded-full opacity-20 blur-3xl"
                style={{ background: tier.glowColor }}
              />

              <span className="text-5xl" role="img">
                {tier.icon}
              </span>
              <span className="font-[family-name:var(--font-space-mono)] text-xs tracking-[0.2em] uppercase text-fog/50">
                {tier.place}
              </span>
              <h3 className="font-[family-name:var(--font-bruno-ace-sc)] text-2xl text-bone">
                {tier.title}
              </h3>
              <span className="font-[family-name:var(--font-oxanium)] text-3xl font-bold text-aged-gold">
                {tier.amount}
              </span>
            </motion.div>
          ))}
        </div>

        <motion.p
          className="text-fog/50 text-sm font-[family-name:var(--font-space-mono)] tracking-wider"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.8 }}
        >
          {PRIZES_CONTENT.footnote}
        </motion.p>
      </div>
    </section>
  );
}
