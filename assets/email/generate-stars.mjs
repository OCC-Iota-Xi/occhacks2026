/**
 * Generates `public/email/stars-tile.png` — the seamless starfield that sits
 * behind the welcome emails.
 *
 * Email clients can't run the site's WebGL particle field or its CSS twinkle
 * animation, so the backdrop has to be a flat, tiling raster. Stars follow the
 * site's treatment (plain white dots, opacity varying down to ~0.25) but stay
 * deliberately sparse — this reads as texture, not as a feature.
 *
 * Run with: node assets/email/generate-stars.mjs
 */
import sharp from "../../node_modules/sharp/lib/index.js";

const OUT = "public/email/stars-tile.png";
const SIZE = 400; // tile edge, in px
const COUNT = 46; // stars per tile
const BG = "#0a0a0a";
const SEED = 20261010; // event date — fixed so re-runs are byte-identical

/** mulberry32: tiny seeded PRNG, so this script is deterministic. */
function rng(seed) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const rand = rng(SEED);
const between = (lo, hi) => lo + rand() * (hi - lo);

const stars = Array.from({ length: COUNT }, () => ({
  x: rand() * SIZE,
  y: rand() * SIZE,
  r: between(0.5, 1.5),
  o: between(0.22, 0.7),
}));

/**
 * Draws each star, plus copies shifted a full tile in every direction it sits
 * near an edge. Without this a star straddling the seam gets clipped and the
 * repeat becomes visible as a grid.
 */
const circles = stars
  .flatMap(({ x, y, r, o }) => {
    const xs = [x, ...(x < r ? [x + SIZE] : []), ...(x > SIZE - r ? [x - SIZE] : [])];
    const ys = [y, ...(y < r ? [y + SIZE] : []), ...(y > SIZE - r ? [y - SIZE] : [])];
    return xs.flatMap((cx) => ys.map((cy) => ({ cx, cy, r, o })));
  })
  .map(
    ({ cx, cy, r, o }) =>
      `<circle cx="${cx.toFixed(2)}" cy="${cy.toFixed(2)}" r="${r.toFixed(2)}" fill="#ffffff" fill-opacity="${o.toFixed(3)}"/>`
  )
  .join("");

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${SIZE}" height="${SIZE}"><rect width="${SIZE}" height="${SIZE}" fill="${BG}"/>${circles}</svg>`;

await sharp(Buffer.from(svg)).png({ compressionLevel: 9 }).toFile(OUT);

const { width, height } = await sharp(OUT).metadata();
const { size } = await import("node:fs").then((fs) => fs.statSync(OUT));
console.log(`wrote ${OUT} — ${width}x${height}, ${size} bytes, ${stars.length} stars`);
