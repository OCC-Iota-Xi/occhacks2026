"use client";

import SectionHeading from "@/components/ui/SectionHeading";
import Card from "@/components/ui/Card";
import { ABOUT_CONTENT } from "@/lib/constants";

export default function AboutSection() {
  return (
    <section
      id="about"
      className="relative section-padding overflow-hidden"
      style={{
        background:
          "linear-gradient(180deg, var(--color-deep-space) 0%, rgba(13,22,36,0.5) 50%, var(--color-deep-space) 100%)",
      }}
    >
      <div className="max-w-6xl mx-auto flex flex-col items-center gap-16">
        <SectionHeading
          headline={ABOUT_CONTENT.headline}
          body={ABOUT_CONTENT.body}
          align="center"
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
          {ABOUT_CONTENT.cards.map((card, i) => (
            <Card
              key={card.title}
              icon={card.icon}
              title={card.title}
              description={card.description}
              index={i}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
