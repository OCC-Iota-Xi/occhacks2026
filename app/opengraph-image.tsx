import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

export const alt =
  "OCC Hacks 2026 — Orange Coast College's hackathon. October 11–12, 2026 in the OCC Ballroom. Free to attend.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/* The link-share card: deep space, gold logo dot, the OCCHacks wordmark
   in its white + amber split, and plain-English event facts. */
export default async function OpenGraphImage() {
  const [inter, schibsted] = await Promise.all([
    readFile(join(process.cwd(), "assets/fonts/inter-400.ttf")),
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
            "radial-gradient(circle at 20% 25%, rgba(251, 191, 36, 0.10), transparent 45%), radial-gradient(circle at 80% 75%, rgba(249, 115, 22, 0.12), transparent 45%)",
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
            fontFamily: "Schibsted Grotesk",
            fontSize: 118,
            lineHeight: 1.1,
            letterSpacing: "0.02em",
          }}
        >
          <span style={{ color: "#ffffff" }}>OCC</span>
          <span style={{ color: "#f97316" }}>Hacks</span>
          <span style={{ color: "#ffffff", marginLeft: 24 }}>2026</span>
        </div>
        <div style={{ marginTop: 28, fontSize: 34, color: "#e8eaf2" }}>
          Orange Coast College&apos;s hackathon
        </div>
        <div style={{ marginTop: 40, fontSize: 26, color: "#9aa0b8" }}>
          October 11–12, 2026 · OCC Ballroom · Costa Mesa, CA
        </div>
        <div style={{ marginTop: 12, fontSize: 22, color: "#9aa0b8" }}>
          free to attend · food, workshops, mentors & prizes
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: "Inter", data: inter, weight: 400, style: "normal" },
        { name: "Schibsted Grotesk", data: schibsted, weight: 400, style: "normal" },
      ],
    }
  );
}
