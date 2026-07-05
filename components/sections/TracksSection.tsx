import React from "react";

import { GridPattern } from "@/components/ui/grid-pattern";

type Track = {
  title: string;
  description: string;
  tag: string;
  /** Solid accent color, e.g. "#fbbf24" */
  accent: string;
  /** Accent as "r, g, b" channels, e.g. "251, 191, 36" */
  accentRgb: string;
};

const TRACKS: Track[] = [
  {
    title: "Education",
    description:
      "Build tools that help people learn — tutoring platforms, study aids, interactive lessons, or anything that makes knowledge stick.",
    tag: "Build to Learn",
    accent: "#fbbf24",
    accentRgb: "251, 191, 36",
  },
  {
    title: "Productivity",
    description:
      "Ship apps that save time and cut the busywork — task managers, automation, planners, or smarter everyday workflows.",
    tag: "Build to Ship",
    accent: "#22d3ee",
    accentRgb: "34, 211, 238",
  },
  {
    title: "Spoof Apps",
    description:
      "Go wild with parody and joke apps. Useless machines, absurd tools, and shamelessly silly ideas are all fair game.",
    tag: "Build to Laugh",
    accent: "#c084fc",
    accentRgb: "192, 132, 252",
  },
];

function TrackCard({ title, description, tag, accent, accentRgb }: Track) {
  return (
    <div
      style={
        {
          "--accent": accent,
          "--accent-soft": `rgba(${accentRgb}, 0.4)`,
          "--accent-glow": `rgba(${accentRgb}, 0.15)`,
          "--accent-dim": `rgba(${accentRgb}, 0.6)`,
        } as React.CSSProperties
      }
      className="group relative text-left border border-[var(--card-border)] bg-[var(--card-bg)] hover:border-[var(--accent-soft)] hover:shadow-[0_0_30px_var(--accent-glow)] backdrop-blur-md p-8 rounded-2xl transition-all duration-500 hover:-translate-y-2 flex flex-col justify-between h-[320px]"
    >
      <div>
        <h3 className="font-header text-lg sm:text-xl text-[var(--text-primary)] mb-3">{title}</h3>
        <p className="text-sm text-[var(--card-desc)] leading-relaxed">{description}</p>
      </div>
      <div className="text-[10px] font-mono text-[var(--accent-dim)] uppercase tracking-widest mt-4">{tag}</div>
    </div>
  );
}

export default function TracksSection() {
  return (
    <section
      id="tracks"
      className="relative min-h-screen flex items-center px-6 sm:px-12 md:px-24 py-12 z-10 w-full overflow-hidden"
      style={{ background: "linear-gradient(to bottom, transparent 0%, #ffffff 18%, #ffffff 100%)" }}
    >
      <GridPattern
        width={40}
        height={40}
        className="absolute inset-0 z-0 h-full w-full fill-gray-500/20 stroke-gray-500/25 [mask-image:radial-gradient(ellipse_70%_60%_at_50%_50%,#000_40%,transparent_100%)]"
      />
      <div className="relative z-10 w-full grid grid-cols-1 gap-12 text-center">
        <div className="flex flex-col items-center gap-4">
          <h2 className="font-header text-3xl sm:text-5xl md:text-6xl text-[var(--text-primary)] tracking-wider leading-none">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-[var(--text-accent)] to-[#4f46e5]">Tracks</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-4">
          {TRACKS.map((track) => (
            <TrackCard key={track.title} {...track} />
          ))}
        </div>
      </div>
    </section>
  );
}
