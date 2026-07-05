import React from "react";

// Soft seam at the TOP of a section. The previous (hero) section is a flat dark
// color and this section is light, so the boundary is a hard line. A flat blur
// can't soften two solid colors — what reads as a transition is a color fade.
// This band starts at the hero's dark (zinc-950) and fades to transparent so the
// dark melts into the light section below. A touch of blur rides along on top.
const LAYERS = [
  { blur: 3, end: 45 },
  { blur: 1.5, end: 100 },
];

export default function AtmosphereTransition() {
  return (
    <div className="pointer-events-none absolute inset-x-0 top-0 h-3 z-[5]">
      {LAYERS.map(({ blur, end }, i) => {
        const mask = `linear-gradient(to bottom, black 0%, transparent ${end}%)`;
        return (
          <div
            key={i}
            className="absolute inset-0"
            style={{
              backdropFilter: `blur(${blur}px)`,
              WebkitBackdropFilter: `blur(${blur}px)`,
              maskImage: mask,
              WebkitMaskImage: mask,
            }}
          />
        );
      })}

      {/* Dark-to-clear fade: blends the dark hero into the light section */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(to bottom, oklch(14.1% 0.005 285.823) 0%, oklch(14.1% 0.005 285.823 / 0.55) 30%, transparent 100%)",
        }}
      />
    </div>
  );
}
