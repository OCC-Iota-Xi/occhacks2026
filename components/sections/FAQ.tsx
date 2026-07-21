import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import SectionHeading from "@/components/SectionHeading";
import Reveal from "@/components/motion/Reveal";

const FAQS: { question: string; answer: React.ReactNode }[] = [
  {
    question: "What is a hackathon?",
    answer:
      "A weekend sprint where you team up to build a project from scratch, guided by mentors, and demo it to judges at the end.",
  },
  {
    question: "Who can come?",
    answer:
      "Any college student who's 18 or older — every major and skill level, beginners included.",
  },
  {
    question: "What does it cost?",
    answer:
      "Nothing. Entry is free and meals are on us: Costco muffins for breakfast, Raising Cane's for lunch, Domino's for dinner, plus snacks and caffeine all weekend.",
  },
  {
    question: "Are there prizes?",
    answer:
      "Yes — $500 for the best project in each track, plus $500 for the overall best.",
  },
  {
    question: "What if I'm new, or don't have a team or idea?",
    answer:
      "Totally fine. We run beginner-friendly workshops and team formation at kickoff, and mentors are around all weekend. Solo hacking is welcome too.",
  },
  {
    question: "What can I build?",
    answer:
      "Web, mobile, AI/ML, hardware, games — anything that fits our tracks, as long as it's built during the event.",
  },
  {
    question: "Who will I meet there?",
    answer:
      "130–150 student hackers, judges from OCC CS faculty and industry, and industry technical mentors.",
  },
  {
    question: "What should I bring?",
    answer:
      "Laptop, chargers, and whatever keeps you comfortable — we cover the rest.",
  },
  {
    question: "When and where?",
    answer: (
      <>
        The OCC Ballroom — check-in opens 8:00 AM Saturday, opening ceremony at
        9:00. Park for free in{" "}
        <a
          href="https://maps.app.goo.gl/7yWSvNarKVgHhJZW8"
          target="_blank"
          rel="noopener noreferrer"
          className="underline underline-offset-4 hover:text-foreground"
        >
          Lot C
        </a>{" "}
        at Merrimac Way and Fairview Road.
      </>
    ),
  },
];

export default function FAQ() {
  return (
    <section id="faq" className="scroll-mt-24 px-6 py-16 md:py-24">
      <SectionHeading plain="FAQ" accent="" className="mb-12" />

      <Reveal className="mx-auto max-w-2xl">
        <Accordion type="single" collapsible>
          {FAQS.map((faq, i) => (
            <AccordionItem key={faq.question} value={`faq-${i}`}>
              <AccordionTrigger>
                <span className="flex-1 text-base sm:text-lg">
                  <span className="mr-3 text-xs tabular-nums text-muted-foreground">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  {faq.question}
                </span>
              </AccordionTrigger>
              <AccordionContent>
                <p className="mx-auto max-w-xl text-center text-sm leading-relaxed text-muted-foreground">
                  {faq.answer}
                </p>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </Reveal>
    </section>
  );
}
