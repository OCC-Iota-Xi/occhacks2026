"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

const PAST_HACKATHONS = [
  {
    name: "Spookathon 2025",
    devpost: "https://spookathon-2025.devpost.com/?ref_feature=challenge&ref_medium=discover",
    embed: "https://www.youtube.com/embed/I9FVxneDnL4",
    title: "Spookathon 2025",
  },
  {
    name: "HackCC 2024",
    devpost: "https://hackcc-23092.devpost.com/?ref_feature=challenge&ref_medium=discover",
    embed: "https://www.youtube.com/embed/vT81BYkjc8k",
    title: "HackCC 2024 Recap",
  },
] as const;

export default function PastHackathonsPanel() {
  const [activeIndex, setActiveIndex] = useState(0);
  const active = PAST_HACKATHONS[activeIndex];

  return (
    <div className="about-video-panel group/card relative flex flex-col rounded-2xl border border-[var(--card-border)] bg-[var(--card-bg)] backdrop-blur-md shadow-2xl overflow-hidden">
      <div className="shrink-0 border-b border-[var(--card-border)] bg-[var(--card-bg)] px-4 py-3 sm:px-6 sm:py-4 text-center">
        <h3 className="font-header font-normal text-base sm:text-lg md:text-xl text-[var(--text-primary)] tracking-wider leading-snug">
          Past event:{" "}
          <a
            href={active.devpost}
            target="_blank"
            rel="noopener noreferrer"
            className="font-normal hover:text-[var(--text-accent)] hover:underline underline-offset-4 transition-colors"
          >
            {active.name}
          </a>
        </h3>
      </div>

      <div className="relative w-full aspect-video">
        {activeIndex > 0 && (
          <button
            type="button"
            aria-label="Previous hackathon"
            onClick={() => setActiveIndex((i) => i - 1)}
            className="group/edge absolute left-2 sm:left-3 top-1/2 z-20 flex h-9 w-9 sm:h-10 sm:w-10 -translate-y-1/2 items-center justify-center rounded-full border border-[var(--card-border)] bg-[var(--card-bg)]/90 text-[var(--text-primary)] shadow-md backdrop-blur-sm opacity-90 transition-all duration-200 hover:opacity-100 hover:border-[var(--text-accent)] hover:text-[var(--text-accent)] hover:scale-105"
          >
            <ChevronLeft className="h-5 w-5 sm:h-6 sm:w-6" strokeWidth={2.5} />
          </button>
        )}

        {activeIndex < PAST_HACKATHONS.length - 1 && (
          <button
            type="button"
            aria-label="Next hackathon"
            onClick={() => setActiveIndex((i) => i + 1)}
            className="group/edge absolute right-2 sm:right-3 top-1/2 z-20 flex h-9 w-9 sm:h-10 sm:w-10 -translate-y-1/2 items-center justify-center rounded-full border border-[var(--card-border)] bg-[var(--card-bg)]/90 text-[var(--text-primary)] shadow-md backdrop-blur-sm opacity-90 transition-all duration-200 hover:opacity-100 hover:border-[var(--text-accent)] hover:text-[var(--text-accent)] hover:scale-105"
          >
            <ChevronRight className="h-5 w-5 sm:h-6 sm:w-6" strokeWidth={2.5} />
          </button>
        )}

        <div className="about-video-card absolute inset-0 bg-black/20">
          <iframe
            key={active.embed}
            className="absolute inset-0 h-full w-full"
            src={active.embed}
            title={active.title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          />
        </div>
      </div>

      {/* Split bottom indicator — rounded corners + visible bar */}
      <div className="flex h-2 sm:h-2.5 shrink-0 overflow-hidden rounded-b-2xl border-t border-[var(--card-border)] bg-[var(--card-border)]/25">
        {PAST_HACKATHONS.map((hackathon, index) => (
          <button
            key={hackathon.name}
            type="button"
            aria-label={`Show ${hackathon.name}`}
            onClick={() => setActiveIndex(index)}
            className={cn(
              "flex-1 h-full transition-all duration-300",
              activeIndex === index
                ? "bg-[var(--text-accent)]"
                : "bg-transparent hover:bg-[var(--card-border)]/60"
            )}
          />
        ))}
      </div>
    </div>
  );
}
