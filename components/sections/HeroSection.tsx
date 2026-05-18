"use client";

import { motion } from "framer-motion";
import dynamic from "next/dynamic";
import Button from "@/components/ui/Button";
import StatsBar from "@/components/ui/StatsBar";
import { HERO_CONTENT } from "@/lib/constants";
import { useIsMobile } from "@/lib/hooks";

const ShipCanvas = dynamic(() => import("@/components/three/ShipCanvas"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-aged-gold/30 border-t-aged-gold rounded-full animate-spin" />
    </div>
  ),
});

const stagger = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.2,
    },
  },
};

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] as const },
  },
};

export default function HeroSection() {
  const isMobile = useIsMobile();

  return (
    <section
      id="hero"
      className="relative min-h-screen flex flex-col justify-center section-padding overflow-hidden"
      style={{
        background:
          "radial-gradient(ellipse at 50% 40%, #0A0D16 0%, #050509 70%)",
      }}
    >
      {/* WIP Badge */}
      {HERO_CONTENT.wip && (
        <motion.div
          className="absolute top-6 left-1/2 -translate-x-1/2 z-20"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-ember/10 border border-ember/30 text-ember text-xs font-[family-name:var(--font-space-mono)] tracking-wider uppercase">
            <span className="w-2 h-2 rounded-full bg-ember animate-pulse" />
            Work in Progress
          </span>
        </motion.div>
      )}

      <div className="max-w-7xl mx-auto w-full flex flex-col lg:flex-row items-center gap-12 lg:gap-8">
        {/* Left Column — Text */}
        <motion.div
          className="flex-1 lg:max-w-[55%] flex flex-col gap-6 text-center lg:text-left items-center lg:items-start"
          variants={stagger}
          initial="hidden"
          animate="show"
        >
          <motion.span
            variants={fadeUp}
            className="font-[family-name:var(--font-space-mono)] text-xs tracking-[0.25em] uppercase text-aged-gold"
          >
            {HERO_CONTENT.eyebrow}
          </motion.span>

          <motion.h1
            variants={fadeUp}
            className="font-[family-name:var(--font-bruno-ace-sc)] text-4xl md:text-5xl lg:text-6xl xl:text-7xl text-bone leading-[1.1] max-w-lg"
          >
            {HERO_CONTENT.headline}
          </motion.h1>

          <motion.p
            variants={fadeUp}
            className="text-lg md:text-xl text-fog/90 max-w-md leading-relaxed"
          >
            {HERO_CONTENT.subheadline}
          </motion.p>

          <motion.p
            variants={fadeUp}
            className="text-base text-fog/60 max-w-md leading-relaxed"
          >
            {HERO_CONTENT.body}
          </motion.p>

          <motion.div
            variants={fadeUp}
            className="flex flex-col sm:flex-row gap-4 mt-2"
          >
            <Button href={HERO_CONTENT.ctaPrimaryHref} variant="filled">
              {HERO_CONTENT.ctaPrimary}
            </Button>
            <Button href={HERO_CONTENT.ctaSecondaryHref} variant="outline">
              {HERO_CONTENT.ctaSecondary}
            </Button>
          </motion.div>
        </motion.div>

        {/* Right Column — 3D Ship */}
        {!isMobile && (
          <motion.div
            className="flex-1 lg:max-w-[45%] h-[400px] lg:h-[550px] w-full"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.6, ease: "easeOut" }}
          >
            <ShipCanvas section="hero" />
          </motion.div>
        )}
      </div>

      {/* Stats Bar */}
      <StatsBar />

      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-deep-space to-transparent pointer-events-none" />
    </section>
  );
}
