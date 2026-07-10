import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import RevealLines from "@/components/motion/RevealLines";
import Reveal from "@/components/motion/Reveal";
import RegisterForm from "@/components/RegisterForm";

export const metadata: Metadata = {
  title: "register — OCC Hacks 2026",
  description:
    "Register for OCC Hacks 2026 — Oct 11–12 at Orange Coast College. Free to attend, every meal covered.",
};

export default function RegisterPage() {
  return (
    <main>
      <Navbar />
      <section className="px-6 pt-36 pb-24 md:pt-44">
        <RevealLines
          onMount
          delay={0.2}
          className="text-center font-display text-5xl leading-[1.05] tracking-tight sm:text-6xl md:text-7xl"
          lines={[
            <span key="1">
              join the{" "}
              <span className="font-serif text-[1.06em] text-ring">crew</span>.
            </span>,
          ]}
        />
        <Reveal className="mx-auto mt-6 max-w-md text-center" delay={0.5}>
          <p className="text-base tabular-nums">Oct 11–12, 2026 · Orange Coast College</p>
          <p className="mt-2 text-sm text-muted-foreground">
            Two minutes of questions, one weekend among the stars.
          </p>
        </Reveal>

        <Reveal className="mx-auto mt-16 max-w-xl" delay={0.6}>
          <RegisterForm />
        </Reveal>
      </section>
    </main>
  );
}
