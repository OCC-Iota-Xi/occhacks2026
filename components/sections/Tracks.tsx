import SectionHeading from "@/components/SectionHeading";
import styles from "./Tracks.module.css";
import Reveal from "@/components/motion/Reveal";

type PlanetVariant = "earth" | "saturn" | "pluto";

const TRACKS: { planet: PlanetVariant; name: string; description: string }[] = [
  {
    planet: "earth",
    name: "education",
    description:
      "Build tools that help people learn — tutoring platforms, study aids, interactive lessons, or anything that makes knowledge stick.",
  },
  {
    planet: "saturn",
    name: "productivity",
    description:
      "Ship apps that save time and cut the busywork — task managers, automation, planners, or smarter everyday workflows.",
  },
  {
    planet: "pluto",
    name: "spoof apps",
    description:
      "Go wild with parody and joke apps. Useless machines, absurd tools, and shamelessly silly ideas are all fair game.",
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

function TrackPlanet({ variant }: { variant: PlanetVariant }) {
  if (variant === "earth") {
    return (
      <div className={styles.wrap}>
        <div className={`${styles.disc} ${styles.earth}`}>
          <Surface>
            <div className={styles.cont1} />
            <div className={styles.cont2} />
            <div className={styles.cont3} />
            <div className={styles.cloud1} />
            <div className={styles.cloud2} />
          </Surface>
          <div className={styles.earthCap} />
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
    <section id="tracks" className="scroll-mt-24 px-6 py-24 sm:px-12 md:px-24 md:py-32">
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
