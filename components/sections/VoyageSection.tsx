"use client";

import { useRef, useState, useEffect } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import dynamic from "next/dynamic";
import { VOYAGE_CONTENT } from "@/lib/constants";
import { useIsMobile } from "@/lib/hooks";

const ShipCanvas = dynamic(() => import("@/components/three/ShipCanvas"), {
  ssr: false,
  loading: () => null,
});

export default function VoyageSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const isMobile = useIsMobile();
  const [shipProgress, setShipProgress] = useState(0);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });

  const textOpacity = useTransform(scrollYProgress, [0.2, 0.4, 0.7, 0.9], [0, 1, 1, 0]);
  const textY = useTransform(scrollYProgress, [0.2, 0.4], [60, 0]);

  // Track scroll progress for 3D ship
  useEffect(() => {
    const unsubscribe = scrollYProgress.on("change", (v) => {
      const progress = Math.max(0, Math.min(1, (v - 0.1) / 0.8));
      setShipProgress(progress);
    });
    return unsubscribe;
  }, [scrollYProgress]);

  return (
    <section
      id="voyage"
      ref={sectionRef}
      className="relative min-h-[80vh] flex items-center section-padding overflow-hidden"
      style={{
        background: "linear-gradient(180deg, var(--color-deep-space) 0%, var(--color-void) 50%, var(--color-deep-space) 100%)",
      }}
    >
      <div className="max-w-7xl mx-auto w-full flex flex-col lg:flex-row items-center gap-12">
        {/* 3D Ship — Left (desktop) */}
        {!isMobile && (
          <motion.div className="flex-1 h-[400px] w-full">
            <ShipCanvas section="voyage" scrollProgress={shipProgress} />
          </motion.div>
        )}

        {/* Text — Right */}
        <motion.div
          className="flex-1 flex flex-col gap-6 text-center lg:text-left items-center lg:items-start"
          style={{ opacity: textOpacity, y: textY }}
        >
          <span className="font-[family-name:var(--font-space-mono)] text-xs tracking-[0.25em] uppercase text-aged-gold">
            {VOYAGE_CONTENT.eyebrow}
          </span>
          <h2 className="font-[family-name:var(--font-bruno-ace-sc)] text-3xl md:text-4xl lg:text-5xl text-bone leading-tight">
            {VOYAGE_CONTENT.headline}
          </h2>
          <p className="text-fog/80 text-base md:text-lg leading-relaxed max-w-lg">
            {VOYAGE_CONTENT.body}
          </p>
        </motion.div>
      </div>
    </section>
  );
}
