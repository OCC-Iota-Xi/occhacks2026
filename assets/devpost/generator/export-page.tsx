"use client";

/**
 * TEMPORARY asset-export route (dev only).
 *
 * Lays the three Devpost brand assets out at exact upload dimensions, pinned
 * to known page coordinates so a headless Chrome can clip each one:
 *   #thumb   1200x1200 @ y=0     square thumbnail (Devpost wants 1:1, ~300x300)
 *   #logo     760x156  @ y=1240  header title/logo, exported transparent
 *   #banner  2400x246  @ y=1480  header background (>=2000 wide, 246 tall)
 *
 * Everything visual comes from the real hero: HeroAstronaut for the planet +
 * astronaut, AnimatedGradientText for the gold "Hacks" sweep, and the
 * Bruno Ace SC / Space Grotesk pair wired up in the root layout.
 */

import HeroAstronaut from "@/components/HeroAstronaut";
import astro from "@/components/HeroAstronaut.module.css";
import { AnimatedGradientText } from "@/components/ui/animated-gradient-text";

/**
 * The hero's gold sweep, re-weighted for print: a single left-to-right run
 * that holds warm gold through the word and does its colour shift at the tail
 * instead of flaring white through the middle of "Hacks".
 */
const GOLD =
  "linear-gradient(to right, #fff3d0 0%, #ffe259 22%, #fbbf24 52%, #f59e0b 72%, #f97316 88%, #ea580c 100%)";

const goldStyle = {
  backgroundImage: GOLD,
  backgroundSize: "100% 100%",
  animation: "none",
} as const;

/* Deterministic starfield — a plain LCG so server and client agree. */
function stars(count: number, seed: number, w: number, h: number) {
  let s = seed;
  const rand = () => ((s = (s * 1664525 + 1013904223) % 4294967296) / 4294967296);
  return Array.from({ length: count }, () => {
    const r = rand();
    return {
      left: rand() * w,
      top: rand() * h,
      size: r < 0.08 ? 4 : r < 0.3 ? 2.5 : 1.5,
      opacity: 0.25 + rand() * 0.7,
    };
  });
}

function Starfield({
  count,
  seed,
  w,
  h,
}: {
  count: number;
  seed: number;
  w: number;
  h: number;
}) {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {stars(count, seed, w, h).map((st, i) => (
        <div
          key={i}
          className="absolute rounded-full bg-white"
          style={{
            left: st.left,
            top: st.top,
            width: st.size,
            height: st.size,
            opacity: st.opacity,
            boxShadow: st.size > 3 ? "0 0 6px rgba(255,255,255,0.8)" : undefined,
          }}
        />
      ))}
    </div>
  );
}

/**
 * HeroAstronaut's wrapper is `lg:absolute lg:inset-y-0 lg:right-0 lg:w-1/2`,
 * so inside a positioned 1000x500 box the 500px scene lands in the right half.
 * Scaling that box from its top-left corner then places the scene exactly.
 */
function AstronautBox({
  scale,
  left,
  top,
  className = "",
}: {
  scale: number;
  left: number;
  top: number;
  className?: string;
}) {
  return (
    <div
      className={`pointer-events-none absolute ${className}`}
      style={{
        width: 1000,
        height: 500,
        left,
        top,
        transform: `scale(${scale})`,
        transformOrigin: "top left",
      }}
    >
      <HeroAstronaut />
    </div>
  );
}

/**
 * A four-point sparkle. The concave waist between each spike is what makes it
 * read as a twinkle rather than a plus sign. The glow goes on the wrapper as a
 * drop-shadow, since clip-path would crop a box-shadow off the inner element.
 */
function Star({ x, y, size }: { x: number; y: number; size: number }) {
  return (
    <div
      className="pointer-events-none absolute"
      style={{
        left: x - size / 2,
        top: y - size / 2,
        width: size,
        height: size,
        filter: `drop-shadow(0 0 ${size * 0.14}px rgba(255,255,255,0.95)) drop-shadow(0 0 ${size * 0.4}px rgba(255,255,255,0.5))`,
      }}
    >
      <div
        className="h-full w-full bg-white"
        style={{
          clipPath:
            "polygon(50% 0%, 56% 44%, 100% 50%, 56% 56%, 50% 100%, 44% 56%, 0% 50%, 44% 44%)",
        }}
      />
    </div>
  );
}

/**
 * A shooting star: a tapered trail with a bright head at the leading end.
 * `x`/`y` are the head's position; the trail runs back up-left at `angle`.
 */
function Meteor({
  x,
  y,
  length,
  angle,
  thickness = 5,
}: {
  x: number;
  y: number;
  length: number;
  angle: number;
  thickness?: number;
}) {
  return (
    <div
      className="pointer-events-none absolute"
      style={{
        left: x - length,
        top: y - thickness / 2,
        width: length,
        height: thickness,
        transform: `rotate(${angle}deg)`,
        transformOrigin: "right center",
      }}
    >
      <div
        className="absolute inset-0 rounded-full"
        style={{
          background:
            "linear-gradient(to right, rgba(255,255,255,0) 0%, rgba(251,191,36,0.28) 48%, rgba(255,226,89,0.7) 78%, #ffffff 100%)",
        }}
      />
      <div
        className="absolute rounded-full bg-white"
        style={{
          right: -thickness * 0.8,
          top: "50%",
          width: thickness * 2.6,
          height: thickness * 2.6,
          transform: "translateY(-50%)",
          boxShadow: "0 0 22px 7px rgba(255,226,89,0.7)",
        }}
      />
    </div>
  );
}

/** One copy of the planet's surface bands, mirroring HeroAstronaut's markup. */
function SurfaceBands() {
  return (
    <>
      <div className={astro.r1} />
      <div className={astro.r2} />
      <div className={astro.r3} />
      <div className={astro.r4} />
      <div className={astro.r5} />
      <div className={astro.r6} />
      <div className={astro.r7} />
      <div className={astro.r8} />
    </>
  );
}

/**
 * The hero's ringed planet on its own, so the square can place it independently
 * of the astronaut (in the scene they sit locked together).
 *
 * `.planet` carries its own `top:20px; left:245px; transform:scale(1.35)`, so
 * after scaling by `f` the disc is 270*f across, centred at (345f, 120f) from
 * this wrapper's origin. `cx`/`cy` are that centre in canvas coordinates.
 */
function Planet({ cx, cy, f }: { cx: number; cy: number; f: number }) {
  return (
    <div
      className="pointer-events-none absolute"
      style={{
        left: cx - 345 * f,
        top: cy - 120 * f,
        transform: `scale(${f})`,
        transformOrigin: "top left",
      }}
    >
      <div className={astro.planet}>
        <div className={astro.surface}>
          <div className={astro.set}>
            <SurfaceBands />
          </div>
          <div className={`${astro.set} ${astro.set2}`}>
            <SurfaceBands />
          </div>
        </div>
        <div className={astro.shad} />
      </div>
    </div>
  );
}

/** The OCCHacks wordmark: white "OCC" + the hero's gold gradient on "Hacks". */
function Wordmark({ size }: { size: number }) {
  return (
    <div
      className="font-header whitespace-nowrap leading-none tracking-wider text-white"
      style={{
        fontSize: size,
        filter: "drop-shadow(0 6px 22px rgba(0,0,0,0.75))",
      }}
    >
      OCC
      <AnimatedGradientText style={goldStyle}>Hacks</AnimatedGradientText>
    </div>
  );
}

export default function ExportPage() {
  return (
    <>
      {/* omitBackground in the screenshot only bites if nothing paints a
          backdrop, and globals.css puts bg-background on body. */}
      <style>{`
        html, body { background: transparent !important; margin: 0; }
        /* The dev-tools indicator is a fixed overlay and lands inside the banner clip. */
        nextjs-portal { display: none !important; }
        /* .backg paints a rgba(0,0,0,0.1) disc behind the scene. On the site it
           vanishes into the page; on these exports it reads as a grey halo. */
        .${astro.backg} { background-color: transparent !important; }
        /* The square places its planet separately, so drop the scene's copy. */
        .scene-no-planet .${astro.planet} { display: none !important; }
      `}</style>

      <div className="relative" style={{ width: 2400, height: 2040 }}>
        {/* ------------------------------------------------------------ */}
        {/* 1. Square thumbnail — 1200x1200 @ (0, 0)                       */}
        {/* ------------------------------------------------------------ */}
        <div
          id="thumb"
          className="absolute overflow-hidden"
          style={{
            left: 0,
            top: 0,
            width: 1200,
            height: 1200,
            background:
              "radial-gradient(120% 95% at 72% 16%, #1c2748 0%, #0d1122 44%, #05060c 100%)",
          }}
        >
          <Starfield count={90} seed={7} w={1200} h={1200} />
          <Meteor x={368} y={196} length={330} angle={30} />
          <Star x={214} y={520} size={54} />
          <Star x={962} y={648} size={42} />
          <Star x={332} y={838} size={46} />
          {/* Planet first so the astronaut floats in front of it */}
          <Planet cx={1000} cy={270} f={1.45} />
          {/* Offsets chosen from the measured astronaut bbox so it lands
              centred at (600, 530) on the 1200 canvas. */}
          <AstronautBox
            className="scene-no-planet"
            scale={1.45}
            left={-398}
            top={440}
          />

          {/* Scrim so the wordmark always sits on darkness */}
          <div
            className="absolute inset-x-0 bottom-0"
            style={{
              /* Starts below the astronaut's boots so the scrim never dims them. */
              height: 420,
              background:
                "linear-gradient(to top, rgba(5,6,12,0.98) 40%, rgba(5,6,12,0.72) 74%, transparent 100%)",
            }}
          />

          <div className="absolute inset-x-0 bottom-0 flex flex-col items-center pb-[120px]">
            <Wordmark size={140} />
          </div>
        </div>

        {/* ------------------------------------------------------------ */}
        {/* 2. Header title / logo — 1170x156 @ (0, 1240), transparent    */}
        {/* ------------------------------------------------------------ */}
        <div
          id="logo"
          className="absolute flex flex-col items-start justify-center gap-3"
          style={{ left: 0, top: 1240, width: 1170, height: 156, paddingLeft: 28 }}
        >
          <Wordmark size={96} />
          <div
            className="font-body whitespace-nowrap"
            style={{
              fontSize: 21,
              letterSpacing: "0.26em",
              color: "#e8eaf2",
              textShadow: "0 2px 10px rgba(0,0,0,0.85)",
            }}
          >
            OCTOBER 10–11, 2026 · ORANGE COAST COLLEGE
          </div>
        </div>

        {/* ------------------------------------------------------------ */}
        {/* 3. Header background strip — 2000x246 @ (0, 1480)             */}
        {/* ------------------------------------------------------------ */}
        <div
          id="banner"
          className="absolute overflow-hidden"
          style={{
            left: 0,
            top: 1480,
            width: 2000,
            height: 246,
            background:
              "radial-gradient(70% 240% at 78% 34%, #1e2950 0%, #0d1122 46%, #05060c 100%)",
          }}
        >
          <Starfield count={130} seed={23} w={2000} h={246} />
          <AstronautBox scale={0.47} left={1128} top={-2} />

          {/* Scrim over the left 1170px, where the title image is overlaid */}
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(to right, rgba(5,6,12,0.94) 0%, rgba(5,6,12,0.78) 40%, rgba(5,6,12,0.32) 64%, transparent 80%)",
            }}
          />
        </div>

        {/* ------------------------------------------------------------ */}
        {/* 4. Merged header — 2000x246 @ (0, 1780), title baked in       */}
        {/* ------------------------------------------------------------ */}
        {/* Title and art are held inside x 430..1580 so the composition
            survives BOTH header fits: a centred cover-crop shows only
            x 415..1585, while a stretch-to-fill shows everything. */}
        <div
          id="merged"
          className="absolute overflow-hidden"
          style={{
            left: 0,
            top: 1780,
            width: 2000,
            height: 246,
            background:
              "radial-gradient(70% 240% at 78% 34%, #1e2950 0%, #0d1122 46%, #05060c 100%)",
          }}
        >
          <Starfield count={130} seed={23} w={2000} h={246} />
          <AstronautBox scale={0.47} left={1000} top={-2} />

          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(to right, rgba(5,6,12,0.94) 0%, rgba(5,6,12,0.78) 40%, rgba(5,6,12,0.32) 64%, transparent 80%)",
            }}
          />

          <div
            className="absolute flex flex-col items-start justify-center gap-3"
            style={{ left: 470, top: 0, height: 246 }}
          >
            <Wordmark size={90} />
            <div
              className="font-body whitespace-nowrap"
              style={{
                fontSize: 19,
                letterSpacing: "0.26em",
                color: "#e8eaf2",
                textShadow: "0 2px 10px rgba(0,0,0,0.85)",
              }}
            >
              OCTOBER 10–11, 2026 · ORANGE COAST COLLEGE
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
