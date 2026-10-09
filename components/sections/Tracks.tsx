import SectionHeading from "@/components/SectionHeading";
import styles from "./Tracks.module.css";
import Reveal from "@/components/motion/Reveal";

export type PlanetVariant = "earth" | "saturn" | "pluto";

const TRACKS: { planet: PlanetVariant; name: string; description: string }[] = [
  {
    planet: "earth",
    name: "entertainment",
    description: "Games, media, and anything built for fun.",
  },
  {
    planet: "saturn",
    name: "education",
    description: "Tools that help people learn and make knowledge stick.",
  },
  {
    planet: "pluto",
    name: "productivity and utility",
    description: "Apps that save time and make everyday life easier.",
  },
];

/** Two copies of a feature set make the seamless spin loop. */
function Surface({ children }: { children: React.ReactNode }) {
  return (
    <div className={styles.surface}>
      <div className={styles.set}>{children}</div>
      <div className={`${styles.set} ${styles.set2}`}>{children}</div>
    </div>
  );
}

const EARTH_DARK = "#5e9f52";
const EARTH_LIGHT = "#8db55a";

/**
 * One full turn of Earth's land, in paint order: the Americas, Europe and
 * Africa, Asia, Australia. The tile is 162 units around (x -8 to 154) and its
 * two ends sit in open Pacific, so copies butt together with no seam.
 */
function EarthLand() {
  return (
    <>
      <path
        fill={EARTH_DARK}
        d="M32.7 8v7c-.2 6 1.3 8 5.3 8.5 3 .3 4 1.5 4 4.5v6c0 4-2 5.8-5 6-3.5.3-5.5 1.5-6.5 4-.7 2-.7 4-1.7 5.5L12 48C8 44 3 36 0 30-3 24-3 16 1 8z"
      />
      <path
        fill={EARTH_LIGHT}
        d="M17.5 29.5c3 4.5 3.5 11.5 5.5 16.5l7 7c4 3.5 12 4.5 17 9 2 2 1.6 5-.5 7-2.5 2.5-4.5 4-5.5 7l-1.5 8c-.5 2.5-2 4-4 4-3 0-5-4-5.5-9-1-7-2.5-14-4-18-2-4-7-6-10-9-1.5-1.5-3-3-4-4C8 44 3 36 0 30-1.5 27-2.25 23.5-2.125 19.75 4 19 12 23 17.5 29.5z"
      />
      <path
        fill={EARTH_DARK}
        d="M30 53c4 3.5 12 4.5 17 9 1.5 1.5 1.6 3.4.5 4.5-3.5 1.5-7.5 1-11-1.5-3-2-5.5-6-6.5-12zM33.5 80c1.5-4 4.5-7 8-8.5h2c-2 2.5-3 6.5-4 14.5h-6.5z"
      />
      <path
        fill="none"
        stroke="#3066be"
        strokeWidth="5.5"
        strokeLinecap="round"
        d="M23.3 48.8q1.7 3.7 8.7 4.2"
      />
      <path
        fill={EARTH_DARK}
        d="M64.5 66.5l5.5-2.5L86 64C85 70 82 76 77 82 75.5 84 72 84.5 70.5 82 69.8 81 69.7 80.5 69.5 80 68.5 75 66.5 70 64.5 66.5z"
      />
      <path
        fill={EARTH_DARK}
        d="M69.5 8l.4 11.5c-1.4 3.5-2.9 6.5-4.9 9-2 2.5-4.5 3.5-4.4 5.5.2 1.5 2.9 1 2.4 2.5-1 2-5 3-5.2 5.5-.2 3 1.7 4.5 3.7 3.5 2.5-1.3 3.5-5 7-6 2.5-.7 5-1.7 6.9-2.5L80 33h8C91 32.5 93.5 35 96 38 97 42 99 47 101 50.5 102 52.5 103.5 52.5 104.2 50.5 105.5 47 106 42.5 107.8 41.5 109 41 109.8 43 110.5 45 111 46.5 112 47.5 113 47.5 114.5 47.5 114.8 45 114.6 43 114.4 40 116 37.5 116.5 35 118 31 118.5 25 117 20 116 16 114 12 113 8z"
      />
      <path
        fill={EARTH_LIGHT}
        d="M78.7 29L75.4 37C76.2 40 76 44 74.5 46.5 73 48.5 70 48.3 67 48.8 63 49.5 59 51 57.2 54 55.5 57 56 61 58.5 63.8 61 66.5 64.5 66 67 68 69.5 70 72 71.8 76 71.8 79 71.8 82 71 84.5 69.5 86.5 65 88 60 89.5 56 90.5 53.5 89 51 87 49.5 89 48 91 45 91 41 92 37 92 32 89.5 28.5 87 25 81 25 78.7 29z"
      />
      <path
        fill={EARTH_LIGHT}
        d="M96 38C97 42 99 47 101 50.5 102 52.5 103.5 52.5 104.2 50.5 105.5 47 106 42.5 107.8 41.5 104.5 37 99.5 36 96 38z"
      />
      <path
        fill={EARTH_LIGHT}
        d="M116.5 35C118 31 118.5 25 117 20 116 16 114 12 113 8H104C106 14 109 18 108.5 24 108 29 111 33 116.5 35z"
      />
      <path
        fill={EARTH_LIGHT}
        d="M105 62C106 58.5 110 58 112 59.5 113 57.5 116 57 117.5 59 120 61.5 121 66 119.5 69.5 118 72.5 114.5 73 112.5 71 110.5 69.5 108 71.5 106 70 104 68.5 104 65 105 62z"
      />
      <path
        fill={EARTH_DARK}
        d="M117.5 59C120 61.5 121 66 119.5 69.5 118 72.5 114.5 73 112.5 71 115 68.5 115 62.5 117.5 59z"
      />
    </>
  );
}

/**
 * Earth's oceans are the disc itself; this is the land, scrolling under the
 * clouds. The disc shows 72 units of the map at a time, so two tiles side by
 * side moved one tile's width make the loop.
 */
function EarthMap() {
  return (
    <svg className={styles.earthMap} viewBox="-8 12 324 72" aria-hidden="true">
      <EarthLand />
      <g transform="translate(162)">
        <EarthLand />
      </g>
    </svg>
  );
}

export function TrackPlanet({ variant }: { variant: PlanetVariant }) {
  if (variant === "earth") {
    return (
      <div className={styles.wrap}>
        <div className={`${styles.disc} ${styles.earth}`}>
          <EarthMap />
          <Surface>
            <div className={styles.cloud1} />
            <div className={styles.cloud2} />
            <div className={styles.cloud3} />
            <div className={styles.cloud4} />
          </Surface>
          <div className={styles.shade} />
        </div>
      </div>
    );
  }

  if (variant === "saturn") {
    return (
      <div className={`${styles.wrap} ${styles.saturnWrap}`}>
        <div className={styles.ring2Back} />
        <div className={styles.ringBack} />
        <div className={`${styles.disc} ${styles.saturn}`}>
          <Surface>
            <div className={styles.sBand1} />
            <div className={styles.sBand2} />
            <div className={styles.sBand3} />
            <div className={styles.sBand4} />
          </Surface>
          <div className={styles.shade} />
        </div>
        <div className={styles.ring2} />
        <div className={styles.ring} />
      </div>
    );
  }

  return (
    <div className={styles.wrap}>
      <div className={`${styles.disc} ${styles.pluto}`}>
        <Surface>
          <div className={styles.patch} />
          <div className={styles.crater1} />
          <div className={styles.crater2} />
          <div className={styles.heart} />
        </Surface>
        <div className={styles.glint} />
        <div className={styles.shade} />
      </div>
    </div>
  );
}

/**
 * Tracks as a plain three-column grid on the page background: a themed
 * flat-art planet over each name and description — no panels, no hover
 * choreography.
 */
export default function Tracks() {
  return (
    <section id="tracks" className="scroll-mt-24 px-6 py-16 sm:px-12 md:px-24 md:py-24">
      <SectionHeading plain="Tracks" accent="" className="mb-16" />

      <div className="grid gap-12 md:grid-cols-3 md:gap-16">
        {TRACKS.map((track, i) => (
          <Reveal key={track.name} delay={i * 0.1} className="text-center">
            <TrackPlanet variant={track.planet} />
            <h3 className="font-header text-2xl tracking-wider text-[var(--text-primary)] sm:text-3xl">
              {track.name}
            </h3>
            <p className="mt-4 font-body text-base leading-relaxed text-[var(--text-secondary)]">
              {track.description}
            </p>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
