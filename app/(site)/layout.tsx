import Particles from "@/components/motion/Particles";
import SpaceEffects from "@/components/SpaceEffects";

/**
 * Site chrome: the drifting WebGL particle field + twinkle/meteor effects
 * behind every page except the bare auth pages outside this group.
 */
export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {/* Global space backdrop: one drifting WebGL particle field spanning
          the full document, so the stars scroll past with the page.
          pixelRatio is capped at 1 to keep the page-tall canvas cheap. */}
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
      {children}
    </>
  );
}
