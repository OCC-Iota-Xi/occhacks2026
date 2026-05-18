"use client";

import { motion } from "framer-motion";
import SectionHeading from "@/components/ui/SectionHeading";
import { SPONSORS_CONTENT } from "@/lib/constants";

export default function SponsorsSection() {
  return (
    <section
      id="sponsors"
      className="relative section-padding overflow-hidden"
      style={{
        background:
          "linear-gradient(180deg, var(--color-void) 0%, var(--color-deep-space) 50%, var(--color-void) 100%)",
      }}
    >
      <div className="max-w-5xl mx-auto flex flex-col items-center gap-16">
        <SectionHeading headline={SPONSORS_CONTENT.headline} align="center" />

        <div className="grid grid-cols-2 md:grid-cols-3 gap-6 w-full">
          {SPONSORS_CONTENT.slots.map((slot, i) => (
            <motion.div
              key={i}
              className="glass-card h-28 flex items-center justify-center text-fog/30 text-sm font-[family-name:var(--font-space-mono)] tracking-wider"
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{
                duration: 0.4,
                delay: i * 0.1,
                ease: "easeOut",
              }}
              whileHover={{
                borderColor: "rgba(201, 168, 76, 0.3)",
                scale: 1.02,
              }}
            >
              {slot}
            </motion.div>
          ))}
        </div>

        <motion.p
          className="text-fog/50 text-sm text-center"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.6 }}
        >
          {SPONSORS_CONTENT.subtext}{" "}
          <a
            href={`mailto:${SPONSORS_CONTENT.email}`}
            className="text-aged-gold hover:text-bone transition-colors underline underline-offset-4"
          >
            {SPONSORS_CONTENT.email}
          </a>
        </motion.p>
      </div>

      {/* Footer */}
      <motion.footer
        className="mt-24 pt-8 border-t border-steel-deck/30 text-center"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
      >
        <p className="text-fog/30 text-xs font-[family-name:var(--font-space-mono)] tracking-wider">
          © 2026 OCC Hacks · Orange Coast College · Built with ☠️ by the crew
        </p>
      </motion.footer>
    </section>
  );
}
