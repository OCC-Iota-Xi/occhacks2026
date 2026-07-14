import styles from "./SpaceEffects.module.css";

/* Placement of the sparkles and dots, in viewport units. */
/* The layer spans the whole document, so top values walk down the page
   (the page is roughly 700vh tall). */
const SPARKS = [
  { left: "68vw", top: "12vh", scale: 0.8, delay: "0.5s" },
  { left: "88vw", top: "58vh", scale: 0.6, delay: "0.3s" },
  { left: "72vw", top: "86vh", scale: 0.5, delay: "0.8s" },
  { left: "10vw", top: "130vh", scale: 0.7, delay: "0.2s" },
  { left: "85vw", top: "185vh", scale: 0.5, delay: "1s" },
  { left: "20vw", top: "255vh", scale: 0.8, delay: "0.6s" },
  { left: "90vw", top: "330vh", scale: 0.6, delay: "0s" },
  { left: "12vw", top: "420vh", scale: 0.5, delay: "0.9s" },
  { left: "80vw", top: "500vh", scale: 0.7, delay: "0.4s" },
  { left: "35vw", top: "590vh", scale: 0.6, delay: "1.2s" },
];

const DOTS = [
  { left: "40vw", top: "8vh", gold: true, delay: "0.2s" },
  { left: "76vw", top: "42vh", gold: false, delay: "0s" },
  { left: "56vw", top: "82vh", gold: true, delay: "0.9s" },
  { left: "30vw", top: "160vh", gold: false, delay: "0.5s" },
  { left: "65vw", top: "230vh", gold: true, delay: "1.1s" },
  { left: "8vw", top: "310vh", gold: true, delay: "0.3s" },
  { left: "88vw", top: "395vh", gold: false, delay: "0.8s" },
  { left: "45vw", top: "470vh", gold: true, delay: "0s" },
  { left: "15vw", top: "560vh", gold: false, delay: "1.3s" },
];

/** Extra meteor showers further down the page, one viewport tall each. */
const METEOR_BANDS = ["150vh", "380vh"];

function Meteor({ variant }: { variant: 1 | 2 }) {
  return (
    <div className={`${styles.meteor} ${variant === 1 ? styles.meteor1 : styles.meteor2}`}>
      <div />
      <div />
      <div />
      <div />
    </div>
  );
}

/**
 * Twinkling sparkle stars and periodic falling meteors over the whole
 * viewport, adapted from maaarj's "Planets" CodePen and recolored to the
 * site's gold palette. Sits behind everything, next to the particle field.
 */
export default function SpaceEffects() {
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
      <Meteor variant={1} />
      <Meteor variant={2} />
      {METEOR_BANDS.map((top, i) => (
        <div
          key={`band-${top}`}
          style={{ position: "absolute", top, left: 0, right: 0, height: "100vh" }}
        >
          <Meteor variant={i % 2 === 0 ? 2 : 1} />
        </div>
      ))}
    </div>
  );
}
