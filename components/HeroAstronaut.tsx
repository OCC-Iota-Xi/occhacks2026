"use client";

import { motion } from "motion/react";
import styles from "./HeroAstronaut.module.css";

/* Scene scale per breakpoint lives in the scale-* classes on the scene
   div below (the pen's scene is 500px at scale 1). */

/** One copy of the planet's surface bands (duplicated for the spin loop). */
function SurfaceBands() {
  return (
    <>
      <div className={styles.r1} />
      <div className={styles.r2} />
      <div className={styles.r3} />
      <div className={styles.r4} />
      <div className={styles.r5} />
      <div className={styles.r6} />
      <div className={styles.r7} />
      <div className={styles.r8} />
    </>
  );
}

/**
 * Pure-CSS floating astronaut + ringed planet for the hero, ported from
 * Coding Artist's "Pure Css Astronaut Animated"
 * (codepen.io/Coding-Artist/pen/gjZJOZ). No JS, no images — the astronaut
 * bobs on a 5s CSS keyframe loop.
 */
export default function HeroAstronaut() {
  return (
    <motion.div
      className="pointer-events-none relative z-0 order-2 flex h-[340px] w-full items-center justify-center lg:absolute lg:inset-y-0 lg:right-0 lg:order-none lg:h-auto lg:w-1/2"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 1, duration: 1.2 }}
    >
      <div className={`${styles.backg} scale-[0.6] sm:scale-75 lg:scale-115`}>
        <div className={styles.planet}>
          <div className={styles.surface}>
            <div className={styles.set}>
              <SurfaceBands />
            </div>
            <div className={`${styles.set} ${styles.set2}`}>
              <SurfaceBands />
            </div>
          </div>
          <div className={styles.shad} />
        </div>
        <div>
          <div className={styles.s1} />
          <div className={styles.s2} />
          <div className={styles.s3} />
          <div className={styles.s4} />
          <div className={styles.s5} />
          <div className={styles.s6} />
        </div>
        <div className={styles.an}>
          <div className={styles.tank} />
          <div className={styles.astro}>
            <div className={styles.helmet}>
              <div className={styles.glass}>
                <div className={styles.shine} />
              </div>
            </div>
            <div className={styles.dress}>
              <div className={styles.c}>
                <div className={styles.btn1} />
                <div className={styles.btn2} />
                <div className={styles.btn3} />
                <div className={styles.btn4} />
              </div>
            </div>
            <div className={styles.handl}>
              <div className={styles.handl1}>
                <div className={styles.glovel}>
                  <div className={styles.thumbl} />
                  <div className={styles.b2} />
                </div>
              </div>
            </div>
            <div className={styles.handr}>
              <div className={styles.handr1}>
                <div className={styles.glover}>
                  <div className={styles.thumbr} />
                  <div className={styles.b1} />
                </div>
              </div>
            </div>
            <div className={styles.legl}>
              <div className={styles.bootl1}>
                <div className={styles.bootl2} />
              </div>
            </div>
            <div className={styles.legr}>
              <div className={styles.bootr1}>
                <div className={styles.bootr2} />
              </div>
            </div>
            <div className={styles.pipe}>
              <div className={styles.pipe2}>
                <div className={styles.pipe3} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
