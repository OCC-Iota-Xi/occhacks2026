import styles from "./SpaceEffects.module.css";
import { TrackPlanet } from "@/components/sections/Tracks";

/* Single-viewport arrangement of the home page's sparkles and dots. */
const SPARKS = [
  { left: "14vw", top: "18vh", scale: 0.7, delay: "0.4s" },
  { left: "82vw", top: "24vh", scale: 0.5, delay: "0.9s" },
  { left: "70vw", top: "70vh", scale: 0.8, delay: "0.1s" },
  { left: "8vw", top: "76vh", scale: 0.5, delay: "1.1s" },
  { left: "48vw", top: "12vh", scale: 0.6, delay: "0.7s" },
];

const DOTS = [
  { left: "28vw", top: "30vh", gold: true, delay: "0.2s" },
  { left: "90vw", top: "48vh", gold: false, delay: "0.6s" },
  { left: "60vw", top: "86vh", gold: true, delay: "1s" },
  { left: "18vw", top: "56vh", gold: false, delay: "0s" },
  { left: "76vw", top: "10vh", gold: true, delay: "1.3s" },
  { left: "40vw", top: "64vh", gold: false, delay: "0.8s" },
];

/**
 * Backdrop for the auth'd pages: the home page's twinkling sparkles, dots,
 * and a meteor, plus a dimmed flat-art planet — scaled to one viewport.
 */
export default function RegisterBackdrop() {
  return (
    <div className={styles.effects} aria-hidden="true">
      {SPARKS.map((s, i) => (
        <div
          key={`spark-${i}`}
          className={styles.spark}
          style={
            {
              left: s.left,
              top: s.top,
              transform: `scale(${s.scale})`,
              "--d": s.delay,
            } as React.CSSProperties
          }
        >
          <div />
          <div />
          <div />
        </div>
      ))}
      {DOTS.map((d, i) => (
        <div
          key={`dot-${i}`}
          className={`${styles.dot} ${d.gold ? styles.dotGold : styles.dotWhite}`}
          style={{ left: d.left, top: d.top, "--d": d.delay } as React.CSSProperties}
        />
      ))}

      <div className={`${styles.meteor} ${styles.meteor1}`}>
        <div />
        <div />
        <div />
        <div />
      </div>

      {/* Dimmed planet anchoring the lower-right corner */}
      <div className="absolute right-[6%] bottom-[8%] hidden scale-75 opacity-50 md:block">
        <TrackPlanet variant="saturn" />
      </div>
    </div>
  );
}
