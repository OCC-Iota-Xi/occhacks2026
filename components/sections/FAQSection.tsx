import React, { useState } from "react";

export default function FAQSection() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const faqs = [
    {
      question: "Who can participate in OCC Hacks?",
      answer: "OCC Hacks is open to all community college and university students who are 18 or older. Whether you're a first-time coder, a business major, or a seasoned developer, you are welcome!"
    },
    {
      question: "Is the event free to attend?",
      answer: "Yes, 100% free! We provide meals, snacks, drinks, workspace, internet, mentors, workshops, and swag for all registered attendees. You just need to bring yourself and your laptop."
    },
    {
      question: "What if I don't have a team or an idea?",
      answer: "Don't worry! We will have team formation activities at the beginning of the hackathon where you can meet other hackers, pitch ideas, and form a crew of up to 4 members."
    },
    {
      question: "What is the team size limit?",
      answer: "Teams can be anywhere from 1 to 4 people. We highly recommend hacking in a team as it's more fun and lets you collaborate across different skill sets!"
    },
    {
      question: "What should I bring to the hackathon?",
      answer: "Bring your laptop, charger, a valid student or photo ID, a sleeping bag/blanket, toiletries (toothbrush/toothpaste), and comfortable clothes. We provide the rest!"
    }
  ];

  return (
    <section id="faq" className="relative min-h-screen flex items-center px-6 sm:px-12 md:px-24 py-12 z-10 w-full border-t border-[var(--card-border)]/40 bg-black/10">
      <div className="w-full grid grid-cols-1 gap-12 text-left">
        <div className="flex flex-col gap-4">
          <span className="inline-block text-[10px] sm:text-xs md:text-sm uppercase tracking-[0.2em] text-[var(--text-accent)] font-bold mb-1">
            Got Questions?
          </span>
          <h2 className="font-header text-3xl sm:text-5xl md:text-6xl text-[var(--text-primary)] tracking-wider leading-none">
            Frequently <span className="bg-clip-text text-transparent bg-gradient-to-r from-[var(--text-accent)] to-[#4f46e5]">Asked Questions</span>
          </h2>
          <p className="font-body text-sm sm:text-base md:text-lg text-[var(--text-secondary)] leading-relaxed max-w-2xl">
            Can&apos;t find what you&apos;re looking for? Reach out to our organizing team on our social channels or contact our support crew.
          </p>
        </div>

        <div className="flex flex-col gap-4 max-w-3xl w-full mt-4">
          {faqs.map((faq, index) => {
            const isOpen = openFaq === index;
            return (
              <div 
                key={index} 
                className="border border-[var(--card-border)] bg-[var(--card-bg)] rounded-2xl overflow-hidden transition-all duration-300 hover:border-[var(--text-accent)]/30"
              >
                <button
                  onClick={() => setOpenFaq(isOpen ? null : index)}
                  className="w-full px-6 py-5 flex items-center justify-between text-left cursor-pointer font-header text-sm sm:text-base text-[var(--text-primary)] hover:text-[var(--text-accent)] transition-colors duration-200"
                >
                  <span>{faq.question}</span>
                  <svg
                    className={`w-5 h-5 text-[var(--text-accent)] transform transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                <div
                  className={`transition-all duration-300 ease-in-out overflow-hidden ${
                    isOpen ? "max-h-[200px] border-t border-[var(--card-border)]/50" : "max-h-0"
                  }`}
                >
                  <p className="px-6 py-5 font-body text-sm text-[var(--card-desc)] leading-relaxed bg-black/5">
                    {faq.answer}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
