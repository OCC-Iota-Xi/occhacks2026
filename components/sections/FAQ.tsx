import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import SectionHeading from "@/components/SectionHeading";
import Reveal from "@/components/motion/Reveal";

const FAQS = [
  {
    question: "who can participate?",
    answer:
      "OCC Hacks is open to all community college and university students who are 18 or older. Whether you're a first-time coder, a business major, or a seasoned developer, you are welcome.",
  },
  {
    question: "is the event free to attend?",
    answer:
      "Yes, 100% free. We provide meals, snacks, drinks, workspace, internet, mentors, workshops, and swag for all registered attendees. You just need to bring yourself and your laptop.",
  },
  {
    question: "what if i don't have a team or an idea?",
    answer:
      "Don't worry — we run team formation at the start of the hackathon where you can meet other hackers, pitch ideas, and form a team of up to 4.",
  },
  {
    question: "what is the team size limit?",
    answer:
      "Teams can be anywhere from 1 to 4 people. We highly recommend hacking in a team — it's more fun and lets you collaborate across different skill sets.",
  },
  {
    question: "what should i bring?",
    answer:
      "Your laptop, charger, a valid student or photo ID, a sleeping bag or blanket, toiletries, and comfortable clothes. We provide the rest.",
  },
];

export default function FAQ() {
  return (
    <section id="faq" className="scroll-mt-24 px-6 py-24 md:py-32">
      <SectionHeading plain="before you" accent="ask" className="mb-12" />

      <Reveal className="mx-auto max-w-2xl">
        <Accordion type="single" collapsible>
          {FAQS.map((faq, i) => (
            <AccordionItem key={faq.question} value={`faq-${i}`}>
              <AccordionTrigger>
                <span className="flex-1 text-base sm:text-lg">
                  <span className="mr-3 text-xs tabular-nums text-muted-foreground">
                    0{i + 1}
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
