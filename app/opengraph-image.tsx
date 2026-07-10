import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

export const alt = "OCC Hacks 2026 — a 24-hour space pirate hackathon. Oct 11–12 at Orange Coast College.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/* Recreates the site's hero as the link-share card: deep space, gold
   headline, uncharted-future tagline, date line. */
export default async function OpenGraphImage() {
  const [inter, newsreader, schibsted] = await Promise.all([
    readFile(join(process.cwd(), "assets/fonts/inter-400.ttf")),
    readFile(join(process.cwd(), "assets/fonts/newsreader-italic-400.ttf")),
    readFile(join(process.cwd(), "assets/fonts/schibsted-grotesk-400.ttf")),
  ]);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#0b0d17",
          backgroundImage:
            "radial-gradient(circle at 20% 25%, rgba(34, 211, 238, 0.12), transparent 45%), radial-gradient(circle at 80% 75%, rgba(124, 58, 237, 0.14), transparent 45%)",
          fontFamily: "Inter",
          color: "#e8eaf2",
        }}
      >
        <div
          style={{
            width: 88,
            height: 88,
            borderRadius: "50%",
            backgroundColor: "#fbbf24",
            marginBottom: 40,
          }}
        />
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            textAlign: "center",
          }}
        >
          <div
            style={{
              fontFamily: "Schibsted Grotesk",
              fontSize: 44,
              letterSpacing: "-0.02em",
            }}
          >
            ahoy, we are
          </div>
          <div
            style={{
              fontFamily: "Newsreader",
              fontStyle: "italic",
              color: "#fbbf24",
              fontSize: 130,
              lineHeight: 1.1,
            }}
          >
            occ hacks.
          </div>
        </div>
        <div style={{ marginTop: 48, fontSize: 28, color: "#e8eaf2" }}>
          Oct 11–12, 2026 · Orange Coast College
        </div>
        <div style={{ marginTop: 12, fontSize: 22, color: "#9aa0b8" }}>
          the future is uncharted · every meal covered · free to board
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: "Inter", data: inter, weight: 400, style: "normal" },
        { name: "Schibsted Grotesk", data: schibsted, weight: 400, style: "normal" },
        { name: "Newsreader", data: newsreader, weight: 400, style: "italic" },
      ],
    }
  );
}
