import Particles from "@/components/motion/Particles";
import SpaceEffects from "@/components/SpaceEffects";

/**
 * The drifting WebGL particle field + twinkle/meteor effects, over an opaque
 * base.
 *
 * This renders *inside* <main> rather than beside it. The sticky footer sits
 * under the page and is uncovered by scrolling, which only works if the page
 * itself is opaque — and the opaque layer has to live in the same stacking
 * context as the stars, painted directly beneath them, or it would hide them.
 * Both layers are z-[-10] within <main>, so DOM order alone decides: base,
 * then particles, then effects, then the sections.
 *
 * The base fades out over the last stretch of the page so the footer's glow
 * bleeds up through the bottom of the final section instead of meeting it at a
 * hard edge. The fade is a fixed length, not a percentage — this layer is as
 * tall as the whole document, so a percentage would smear it over thousands of
 * pixels.
 */
export default function SpaceBackdrop() {
  return (
    <>
      <div
        className="absolute inset-0 -z-10"
        aria-hidden="true"
        style={{
          background:
            "linear-gradient(to top, rgba(10, 10, 10, 0) 0px, var(--background) 240px)",
        }}
      />
      {/* One drifting particle field spanning the full document, so the stars
          scroll past with the page. pixelRatio is capped at 1 to keep the
          page-tall canvas cheap. */}
      <div className="absolute inset-0 -z-10" aria-hidden="true">
        <Particles
          particleColors={["#e8eaf2", "#e8eaf2", "#e8eaf2", "#fbbf24", "#22d3ee"]}
          particleCount={4000}
          particleSpread={20}
          speed={0.1}
          particleBaseSize={100}
          moveParticlesOnHover={false}
          alphaParticles
          disableRotation
          pixelRatio={1}
        />
      </div>
      {/* Twinkling sparkles + falling meteors over the particle field */}
      <SpaceEffects />
    </>
  );
}
