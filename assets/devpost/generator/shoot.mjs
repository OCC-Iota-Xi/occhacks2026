import puppeteer from "puppeteer-core";
import { mkdirSync } from "node:fs";

const CHROME =
  "/Users/nootnoot/.cache/puppeteer/chrome/mac_arm-148.0.7778.97/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing";
const OUT = "/Users/nootnoot/occhacks2026/assets/devpost";
mkdirSync(OUT, { recursive: true });

// Fixed page coordinates that /export pins each composition to.
const SHOTS = [
  {
    file: "occhacks-thumbnail-1200.png",
    clip: { x: 0, y: 0, width: 1200, height: 1200 },
    transparent: false,
  },
  {
    file: "occhacks-header-logo.png",
    clip: { x: 0, y: 1240, width: 1170, height: 156 },
    transparent: true,
  },
  {
    file: "occhacks-header-background.png",
    clip: { x: 0, y: 1480, width: 2000, height: 246 },
    transparent: false,
  },
  {
    file: "occhacks-header-merged.png",
    clip: { x: 0, y: 1780, width: 2000, height: 246 },
    transparent: false,
  },
];

const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: true,
  args: ["--force-device-scale-factor=1", "--hide-scrollbars"],
});
const page = await browser.newPage();
await page.setViewport({ width: 2400, height: 2040, deviceScaleFactor: 1 });
// Freezes the astronaut float, planet spin and star twinkle at frame 0 — the
// hero's CSS module already has a prefers-reduced-motion branch.
await page.emulateMediaFeatures([
  { name: "prefers-reduced-motion", value: "reduce" },
]);

await page.goto("http://localhost:3001/export", { waitUntil: "networkidle0" });
await page.evaluate(() => document.fonts.ready);
await new Promise((r) => setTimeout(r, 3500));

// Sanity-check that the DOM actually sits where the clips assume.
const rects = await page.evaluate(() =>
  ["thumb", "logo", "banner"].map((id) => {
    const r = document.getElementById(id).getBoundingClientRect();
    return `${id} ${r.x},${r.y} ${r.width}x${r.height}`;
  }),
);
console.log(rects.join("\n"));

for (const { file, clip, transparent } of SHOTS) {
  await page.screenshot({ path: `${OUT}/${file}`, clip, omitBackground: transparent });
  console.log(`wrote ${file}`);
}

await browser.close();

// Devpost's thumbnail advice is "crop to 300x300"; ship that exact size too.
const sharp = (await import("/Users/nootnoot/occhacks2026/node_modules/sharp/lib/index.js")).default;
await sharp(`${OUT}/occhacks-thumbnail-1200.png`)
  .resize(300, 300)
  .png()
  .toFile(`${OUT}/occhacks-thumbnail-300.png`);
console.log("wrote occhacks-thumbnail-300.png");
