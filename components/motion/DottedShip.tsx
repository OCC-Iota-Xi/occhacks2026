import { cn } from "@/lib/utils";

/**
 * Static dotted silhouette of the pirate cruiser — the featherweight stand-in
 * for the old three.js ship. Pure SVG strokes, no runtime cost.
 */
export default function DottedShip({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 420 280"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeDasharray="0.5 7"
      aria-hidden="true"
      className={cn("text-ring/80", className)}
    >
      {/* Hull */}
      <path d="M 396 130 L 300 106 Q 268 99 248 96 L 214 74 Q 196 66 178 76 L 162 95 L 96 100 L 58 106 Q 32 110 32 122 L 32 146 Q 32 156 60 158 L 140 168 L 168 172 L 282 160 Q 348 148 396 130 Z" />
      {/* Cockpit canopy */}
      <path d="M 186 92 Q 200 82 216 88 L 232 96 L 190 98 Z" strokeDasharray="0.5 6" />
      {/* Tail fin */}
      <path d="M 96 100 L 74 44 L 56 48 L 66 102" />
      {/* Pennant flying off the fin */}
      <path d="M 64 44 L 58 16 L 24 24 L 56 34" strokeDasharray="0.5 6" />
      {/* Lower wing, raked back */}
      <path d="M 176 168 L 122 232 L 158 236 L 226 172" />
      {/* Ventral fin */}
      <path d="M 128 166 L 112 200 L 132 202 L 150 168" strokeDasharray="0.5 6" />
      {/* Skull emblem on the hull */}
      <circle cx="216" cy="128" r="15" strokeDasharray="0.5 5" />
      <circle cx="211" cy="126" r="1.4" fill="currentColor" stroke="none" />
      <circle cx="221" cy="126" r="1.4" fill="currentColor" stroke="none" />
      <path d="M 213 134 L 219 134" strokeDasharray="0.5 4" />
      {/* Engine wake */}
      <path d="M 26 118 L 6 116" strokeDasharray="0.5 6" opacity="0.7" />
      <path d="M 26 134 L 0 134" strokeDasharray="0.5 6" opacity="0.5" />
      <path d="M 26 150 L 10 152" strokeDasharray="0.5 6" opacity="0.7" />
      {/* A few loose stars around the ship */}
      <circle cx="360" cy="52" r="1.5" fill="currentColor" stroke="none" opacity="0.7" />
      <circle cx="330" cy="230" r="1.2" fill="currentColor" stroke="none" opacity="0.5" />
      <circle cx="60" cy="250" r="1.5" fill="currentColor" stroke="none" opacity="0.6" />
      <circle cx="396" cy="196" r="1.2" fill="currentColor" stroke="none" opacity="0.5" />
    </svg>
  );
}
