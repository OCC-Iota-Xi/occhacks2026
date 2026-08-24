"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import { useReducedMotion } from "motion/react";
import Reveal from "@/components/motion/Reveal";
import Sponsors from "@/components/sections/Sponsors";
import styles from "./Mentors.module.css";

/** Ink color — matches the page background so the blob reads as the
 *  surrounding space bleeding into the white. */
const INK = "#0a0a0a";

/** Height of each wavy edge band, px. The wave's midline sits at BAND/2,
 *  which is flush with the section's own top/bottom edge. */
const BAND = 176;
/** How far the ink layer overhangs the section, px. */
const OVER = 88;
/** Wave path viewBox width; the path stretches to any viewport. */
const VW = 1440;
/**
 * How far the shorelines run past the left and right edges, px.
 *
 * The goo filter rounds off whatever it is handed, corners included — a
 * shoreline that stopped at the section's own edge would curl away from the
 * top corners and let the white ground show through there, which is what
 * turns the band into a block sitting on the page instead of the page's own
 * background. The shorelines are drawn wider than the section so those curled
 * ends fall outside it, and a clip window cuts them back off square.
 */
const BLEED = 56;

/** Trailing droplet diameters, head first. A long taper makes a long tail;
 *  nothing goes far below 30px or the goo filter's threshold eats it. */
const SIZES = [116, 108, 100, 92, 85, 78, 72, 66, 60, 55, 50, 45, 40, 35, 31];

interface Point {
  x: number;
  y: number;
}

/** Small seeded PRNG — fixed seeds keep the "random" edges identical on the
 *  server and the client, so the markup hydrates cleanly. */
function mulberry32(seed: number) {
  let a = seed;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * A shoreline across the full width. Three sine components at unrelated
 * frequencies sum into a continuous swell — long lazy rolls with smaller
 * ripples riding on them — which reads as a liquid surface. Sampling that
 * function and joining the samples with Catmull-Rom cubics keeps the curve
 * smooth everywhere; picking random y values per point instead is what
 * makes an edge look jagged. `fillDown` fills below the wave (bottom edge)
 * instead of above it (top edge).
 */
function makeEdge(seed: number, fillDown: boolean): string {
  const rand = mulberry32(seed);

  // Amplitudes sum to 34 at most, so the swell stays well inside the band.
  // Frequencies and phases are untouched, and the amplitudes are scaled as a
  // set — the shoreline keeps the same shape and the same crests, drawn about
  // half as deep, so it reads as a long shallow roll rather than a scallop.
  const waves = [
    { amp: 15 + rand() * 4, freq: 1.1 + rand() * 0.5, phase: rand() * Math.PI * 2 },
    { amp: 7 + rand() * 3, freq: 2.3 + rand() * 0.7, phase: rand() * Math.PI * 2 },
    { amp: 3 + rand() * 2.5, freq: 4.1 + rand() * 1.1, phase: rand() * Math.PI * 2 },
  ];

  const SAMPLES = 40;
  const pts: Point[] = [];
  for (let i = 0; i <= SAMPLES; i++) {
    const x = (i / SAMPLES) * VW;
    let y = BAND / 2;
    for (const w of waves) {
      y += w.amp * Math.sin((x / VW) * w.freq * Math.PI * 2 + w.phase);
    }
    pts.push({ x, y });
  }

  let d = `M${pts[0].x.toFixed(1)},${pts[0].y.toFixed(1)}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] ?? pts[i];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[i + 2] ?? p2;
    const c1x = p1.x + (p2.x - p0.x) / 6;
    const c1y = p1.y + (p2.y - p0.y) / 6;
    const c2x = p2.x - (p3.x - p1.x) / 6;
    const c2y = p2.y - (p3.y - p1.y) / 6;
    d +=
      ` C${c1x.toFixed(1)},${c1y.toFixed(1)}` +
      ` ${c2x.toFixed(1)},${c2y.toFixed(1)}` +
      ` ${p2.x.toFixed(1)},${p2.y.toFixed(1)}`;
  }
  d += fillDown ? ` V${BAND} H0 Z` : ` V0 H0 Z`;
  return d;
}

const TOP_EDGE = makeEdge(0x51f3, false);
const BOTTOM_EDGE = makeEdge(0x9ac7, true);

interface Star {
  left: number;
  top: number;
  size: number;
  opacity: number;
  delay: number;
}

interface Spark {
  left: number;
  top: number;
  scale: number;
  delay: number;
}

/** The page's starfield, continued through the white band in black — kept
 *  as sparse as the rest of the site's sky. */
const STARS: Star[] = (() => {
  const rand = mulberry32(0x2d81);
  return Array.from({ length: 22 }, () => ({
    left: rand() * 100,
    top: rand() * 100,
    size: 1.5 + rand() * 2,
    opacity: 0.2 + rand() * 0.4,
    delay: rand() * 4,
  }));
})();

/**
 * Who Community Innovations brings, by role and employer. Deliberately
 * nameless: the people can change between now and the weekend, and it is the
 * kind of help on offer that a reader is deciding about.
 */
const MENTOR_ROLES = [
  "Community Innovations Foundation",
  "Applied Scientist, Blizzard",
  "PhD Researcher, UC Irvine",
  "Senior Software Engineer, Amazon",
];

/** Plus-sparkles in the background, matching the ones scattered over the
 *  dark sections. A third one sits inline above the header. */
const SPARKS: Spark[] = [
  { left: 88, top: 26, scale: 0.6, delay: 1.1 },
  { left: 71, top: 78, scale: 0.45, delay: 0.3 },
];

/**
 * Mentors: a white interlude between the space-dark sections, divided from
 * them by uneven, gooey shorelines rather than straight rules. It carries the
 * sponsors block too — both are the people behind the weekend rather than the
 * event itself, and one band of paper reads as one aside. The cursor
 * drags a droplet of that dark background in with it — an SVG
 * blur+contrast (metaball) filter gives the trail surface tension, and the
 * droplet is born out of the nearest shoreline on entry and reabsorbed
 * into it on exit, oil-in-water style.
 */
export default function Mentors() {
  const reduceMotion = useReducedMotion();
  const sectionRef = useRef<HTMLElement>(null);
  const blobRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    // The droplets render at scale 0 everywhere; only fine-pointer devices
    // without reduced motion get the physics wired up to bring them out.
    if (reduceMotion || !window.matchMedia("(pointer: fine)").matches) return;
    const section = sectionRef.current;
    if (!section) return;

    const pts: Point[] = SIZES.map(() => ({ x: 0, y: 0 }));
    const scales = SIZES.map(() => 0);
    const target: Point = { x: 0, y: 0 };
    const prevHead: Point = { x: 0, y: 0 };
    let exiting = true;
    let raf = 0;
    let running = false;

    // Ink-layer coordinates: origin sits OVER px above the section's top edge.
    const toLocal = (e: PointerEvent): Point => {
      const r = section.getBoundingClientRect();
      return { x: e.clientX - r.left, y: e.clientY - r.top + OVER };
    };

    /** Point buried in the nearest shoreline, where droplets are born and
     *  reabsorbed. */
    const shorePoint = (p: Point): Point => {
      const h = section.offsetHeight + OVER * 2;
      return { x: p.x, y: p.y < h / 2 ? 22 : h - 22 };
    };

    const tick = () => {
      // Head chases the cursor, each droplet chases the one ahead of it. The
      // lower the follow factor, the further each one lags and the longer the
      // tail strings out behind the head.
      pts[0].x += (target.x - pts[0].x) * 0.19;
      pts[0].y += (target.y - pts[0].y) * 0.19;
      for (let i = 1; i < pts.length; i++) {
        pts[i].x += (pts[i - 1].x - pts[i].x) * 0.26;
        pts[i].y += (pts[i - 1].y - pts[i].y) * 0.26;
      }

      // Droplets squash along their direction of travel like a moving drop.
      const vx = pts[0].x - prevHead.x;
      const vy = pts[0].y - prevHead.y;
      prevHead.x = pts[0].x;
      prevHead.y = pts[0].y;
      const stretch = Math.min(Math.hypot(vx, vy) * 0.01, 0.55);
      const angle = Math.atan2(vy, vx);

      let maxScale = 0;
      for (let i = 0; i < pts.length; i++) {
        scales[i] += ((exiting ? 0 : 1) - scales[i]) * 0.14;
        maxScale = Math.max(maxScale, scales[i]);
        const el = blobRefs.current[i];
        if (!el) continue;
        const r = SIZES[i] / 2;
        const s = 1 + stretch * (1 - (i / SIZES.length) * 0.8);
        el.style.transform =
          `translate3d(${pts[i].x - r}px, ${pts[i].y - r}px, 0) ` +
          `rotate(${angle}rad) scale(${s * scales[i]}, ${scales[i] / s}) ` +
          `rotate(${-angle}rad)`;
      }

      // Once fully reabsorbed into a shoreline, go idle.
      if (exiting && maxScale < 0.02) {
        running = false;
        return;
      }
      raf = requestAnimationFrame(tick);
    };

    const run = () => {
      if (!running) {
        running = true;
        raf = requestAnimationFrame(tick);
      }
    };

    const onEnter = (e: PointerEvent) => {
      const p = toLocal(e);
      if (exiting) {
        // Materialize inside the nearest shoreline so the droplet stretches
        // out of the dark rather than popping in mid-white.
        const birth = shorePoint(p);
        for (const pt of pts) {
          pt.x = birth.x;
          pt.y = birth.y;
        }
        prevHead.x = birth.x;
        prevHead.y = birth.y;
      }
      exiting = false;
      target.x = p.x;
      target.y = p.y;
      run();
    };

    const onMove = (e: PointerEvent) => {
      const p = toLocal(e);
      target.x = p.x;
      target.y = p.y;
      exiting = false;
      run();
    };

    const onLeave = (e: PointerEvent) => {
      const exit = shorePoint(toLocal(e));
      target.x = exit.x;
      target.y = exit.y;
      exiting = true;
      run();
    };

    section.addEventListener("pointerenter", onEnter);
    section.addEventListener("pointermove", onMove);
    section.addEventListener("pointerleave", onLeave);
    return () => {
      section.removeEventListener("pointerenter", onEnter);
      section.removeEventListener("pointermove", onMove);
      section.removeEventListener("pointerleave", onLeave);
      cancelAnimationFrame(raf);
    };
  }, [reduceMotion]);

  const edge = (d: string, bottom: boolean) => (
    // The width is stated outright rather than left to `inset-x-0`: an <svg>
    // is a replaced element, so `left:0; right:0; width:auto` resolves to the
    // viewBox's intrinsic 1440 instead of the containing block — which
    // overflows any narrower viewport, taking the whole page's horizontal
    // scrollbar with it, and falls short of any wider one.
    // `preserveAspectRatio="none"` stretches the swell across whatever it gets.
    <svg
      className={`absolute ${bottom ? "bottom-0" : "top-0"}`}
      style={{ left: -BLEED, width: `calc(100% + ${BLEED * 2}px)`, height: BAND }}
      viewBox={`0 0 ${VW} ${BAND}`}
      preserveAspectRatio="none"
    >
      <path d={d} fill={INK} />
    </svg>
  );

  return (
    <section
      ref={sectionRef}
      id="mentors"
      className="relative isolate flex scroll-mt-24 items-start px-6 pb-36 pt-24 sm:px-12 md:min-h-[70vh] md:px-24 md:pb-52 md:pt-32"
    >
      <svg className="absolute h-0 w-0" aria-hidden="true">
        <defs>
          <filter id="mentors-goo" colorInterpolationFilters="sRGB">
            <feGaussianBlur in="SourceGraphic" stdDeviation="10" result="blur" />
            <feColorMatrix
              in="blur"
              mode="matrix"
              values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 18 -7"
            />
          </filter>
        </defs>
      </svg>

      {/* The white ground. It overhangs the section by the same amount as the
          ink so the shorelines can crest above the section's own top edge and
          still have white beneath them — putting the white on the section
          itself leaves a straight edge showing wherever the wave rises past
          it. */}
      <div
        aria-hidden="true"
        className="absolute inset-x-0 bg-white"
        style={{ top: -OVER, bottom: -OVER }}
      />

      {/* The starfield continued through the white band, in black. Sits under
          the ink so the droplet blots the stars out as it passes. */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
        {STARS.map((star, i) => (
          <span
            key={i}
            className={styles.star}
            style={
              {
                left: `${star.left}%`,
                top: `${star.top}%`,
                width: star.size,
                height: star.size,
                "--o": star.opacity,
                "--d": `${star.delay}s`,
              } as React.CSSProperties
            }
          />
        ))}
        {SPARKS.map((spark, i) => (
          <div
            key={`spark-${i}`}
            className={styles.spark}
            style={
              {
                left: `${spark.left}%`,
                top: `${spark.top}%`,
                transform: `scale(${spark.scale})`,
                "--d": `${spark.delay}s`,
              } as React.CSSProperties
            }
          >
            <div />
            <div />
            <div />
          </div>
        ))}
      </div>

      {/* Clip window for the ink. It is exactly the ink layer's own box, so
          the vertical overhang the shorelines need passes through untouched
          and only the horizontal BLEED — and anything the goo filter smears
          past the sides — is cut back to the section's width, square. The
          clip has to sit outside the filtered element: clipping the filtered
          element itself would hand the filter an already-cut edge and it
          would round that off in turn. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 overflow-clip"
        style={{ top: -OVER, bottom: -OVER }}
      >
        {/* Ink layer: the two shorelines plus the cursor droplets, all fused
            by the goo filter. It overhangs the section so the shorelines sit
            half over the dark page and the droplet can slide out of / back
            into them. Its origin is the window's, which is what the pointer
            handlers above convert into. */}
        <div className="absolute inset-0" style={{ filter: "url(#mentors-goo)" }}>
          {edge(TOP_EDGE, false)}
          {edge(BOTTOM_EDGE, true)}

          {SIZES.map((size, i) => (
            <div
              key={i}
              ref={(el) => {
                blobRefs.current[i] = el;
              }}
              className="absolute left-0 top-0 rounded-full will-change-transform"
              style={{ width: size, height: size, background: INK, transform: "scale(0)" }}
            />
          ))}
        </div>
      </div>

      {/* Content sits above the ink and the stars by tree order. No max-width
          wrapper: it runs to the section's own padding so the header starts on
          the same left edge as the about section's copy.

          The header is the about section's "about us" size exactly — a flat
          text-3xl, no responsive ramp — so the two read as the same rank of
          sub-heading. The mark column is the wider of the two, which is what
          gives the logo more room than an even split would. */}
      <div className="relative flex w-full flex-col gap-24 md:gap-32">
        <div className="flex w-full flex-col gap-14 md:flex-row md:items-start md:gap-24">
          <div className="flex flex-col gap-8 md:flex-[1.4]">
            <Reveal>
              <div className="relative">
                {/* Out of the flow, so the header itself starts at the top of
                    the column and lines up with the copy beside it. */}
                <div
                  className={styles.spark}
                  style={{ left: 0, top: -30, transform: "scale(0.75)", "--d": "0.6s" } as React.CSSProperties}
                >
                  <div />
                  <div />
                  <div />
                </div>
                <h2 className="font-display text-3xl tracking-tight text-[#0a0a0a]">
                  Industry mentors from
                </h2>
              </div>
            </Reveal>

            {/* The CIF mark lives on a 1500-square canvas with ~40% of its
                height as empty padding, so it is cropped to the wordmark's own
                strip — otherwise it renders a fraction of its box size. No color
                filter: the file already carries the blue monogram and a black
                wordmark. */}
            <Reveal delay={0.1} className="w-full">
              <a
                href="https://www.cifdn.org/"
                target="_blank"
                rel="noopener noreferrer"
                className="relative block w-[380px] max-w-full overflow-hidden transition-transform duration-300 ease-out hover:scale-[1.03] sm:w-[560px] md:w-full md:max-w-[760px]"
                style={{ aspectRatio: "1500 / 340" }}
              >
                <Image
                  src="/sponsors/CIF-logo-white.svg"
                  alt="Community Innovations"
                  width={2000}
                  height={2000}
                  unoptimized
                  className="absolute left-0 top-0 h-auto w-full"
                  style={{ transform: "translateY(-39.77%)" }}
                />
              </a>
            </Reveal>
          </div>

          <div className="flex flex-col gap-6 md:flex-1">
            <Reveal delay={0.15}>
              <p className="max-w-2xl font-body text-lg leading-relaxed text-[#2b2b2b] sm:text-xl">
                Community Innovations is a local non-profit that helps
                neighborhoods and small businesses put AI to work. Their people
                walk the floor all weekend — sit with them, debug with them, get
                unstuck at 2am.
              </p>
            </Reveal>

            {/* Roles and where they come from, not names — who is on the floor
                matters here, and the roster shifts between now and October. */}
            <Reveal delay={0.2}>
              <ul className="max-w-2xl space-y-1.5 font-body text-base text-[#5a5a5a] sm:text-lg">
                {MENTOR_ROLES.map((role) => (
                  <li key={role}>{role}</li>
                ))}
              </ul>
            </Reveal>

            <Reveal delay={0.25}>
              <p className="max-w-2xl font-body text-lg leading-relaxed text-[#2b2b2b] sm:text-xl">
                And if you&apos;ve shipped real things and want to sit on the other
                side of the table, we&apos;d love to have you.
              </p>
            </Reveal>
          </div>
        </div>

        <Sponsors />
      </div>
    </section>
  );
}
