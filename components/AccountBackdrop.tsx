import Particles from "@/components/motion/Particles";
import styles from "./SpaceEffects.module.css";

/* Percentages of the content area (not the viewport) — the form fills the
   middle, so everything hugs an edge or the top/bottom band. */
const SPARKS = [
  { left: "5%", top: "15%", scale: 0.55, delay: "0.4s" },
  { left: "93%", top: "24%", scale: 0.4, delay: "3.2s" },
  { left: "92%", top: "78%", scale: 0.5, delay: "1.6s" },
  { left: "7%", top: "86%", scale: 0.4, delay: "5s" },
];

const DOTS = [
  { left: "17%", top: "7%", gold: true, delay: "0.2s" },
  { left: "97%", top: "46%", gold: false, delay: "2.4s" },
  { left: "3%", top: "52%", gold: false, delay: "0s" },
  { left: "83%", top: "93%", gold: true, delay: "3.6s" },
];

/** Much slower than the home page's — these sit right behind a form. */
const SPARK_TWINKLE = "8s";
const DOT_TWINKLE = "7s";

/**
 * Space backdrop for the signed-in pages: the same drifting WebGL particle
 * field as the site, with a few sparkles and dots twinkling at a calmer pace.
 */
export default function AccountBackdrop() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
      <Particles
        particleColors={["#e8eaf2", "#e8eaf2", "#e8eaf2", "#fbbf24", "#22d3ee"]}
        // The site's field spans ~7 viewports; matching its per-screen density
        // means far fewer particles in this one-viewport container.
        particleCount={600}
        particleSpread={20}
        speed={0.06}
        particleBaseSize={80}
        moveParticlesOnHover={false}
        alphaParticles
        disableRotation
        pixelRatio={1}
      />

      {SPARKS.map((s, i) => (
        <div
          key={`spark-${i}`}
          className={styles.spark}
          style={
            {
              left: s.left,
              top: s.top,
              transform: `scale(${s.scale})`,
              opacity: 0.35,
              "--d": s.delay,
            } as React.CSSProperties
          }
        >
          <div style={{ animationDuration: SPARK_TWINKLE }} />
          <div style={{ animationDuration: SPARK_TWINKLE }} />
          <div />
        </div>
      ))}

      {/* The dot's own keyframes animate opacity, so the dimming lives on a
          wrapper instead of on the dot itself. */}
      {DOTS.map((d, i) => (
        <div
          key={`dot-${i}`}
          className="absolute opacity-50"
          style={{ left: d.left, top: d.top }}
        >
          <div
            className={`${styles.dot} ${d.gold ? styles.dotGold : styles.dotWhite}`}
            style={
              { animationDuration: DOT_TWINKLE, "--d": d.delay } as React.CSSProperties
            }
          />
        </div>
      ))}
    </div>
  );
}
