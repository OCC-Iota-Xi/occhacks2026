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
    question: "What is a hackathon?",
    answer:
      "A hackathon is a fast-paced event where you collaborate to build a project in a single weekend. You'll attend workshops, get help from mentors, and demo your work to judges at the end.",
  },
  {
    question: "Who can come?",
    answer:
      "OCC Hacks welcomes students from any major and skill level. Beginners are encouraged to join — no prior hackathon experience required.",
  },
  {
    question: "What does it cost?",
    answer:
      "It's free to attend. We provide meals, snacks, and plenty of caffeine throughout the event.",
  },
  {
    question: "Are there prizes?",
    answer:
      "Yes! We'll recognize top projects in each track and award special prizes for innovation, design, and community choice.",
  },
  {
    question: "What if I don't know how to code?",
    answer:
      "You're still welcome! We offer beginner-friendly workshops and mentors. You can learn as you go and contribute through design, product, research, writing, and more.",
  },
  {
    question: "What if I don't have a team or idea?",
    answer:
      "No problem. We'll run team-formation and ideation activities at the start. You can also work solo if you prefer.",
  },
  {
    question: "What can I build?",
    answer:
      "Anything you can dream up — web, mobile, AI/ML, hardware, games, or something wild that fits our tracks. Projects must be built during the event.",
  },
  {
    question: "What should I bring?",
    answer:
      "Bring your laptop, chargers, and anything you need to be comfortable. We'll take care of food, drinks, and a space to create.",
  },
  {
    question: "When should I arrive? Can I leave and come back?",
    answer:
      "Check-in opens at 8:00 AM on Saturday and Opening Ceremony starts at 9:00 AM. You can step out and re-enter with your event wristband; please return before submissions close.",
  },
  {
    question: "Where is the event and where do I park?",
    answer:
      "We're in the OCC Ballroom. Parking is available in nearby campus lots; follow event signage to the Ballroom entrance.",
  },
];

export default function FAQ() {
  return (
    <section id="faq" className="scroll-mt-24 px-6 py-24 md:py-32">
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
