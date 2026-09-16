import Schedule from "@/components/sections/Schedule";
import FAQ from "@/components/sections/FAQ";

/**
 * Schedule and FAQ share a row on wide screens — both are scannable lists of
 * roughly the same height, and pairing them keeps the page from reading as
 * one more full-width block after another. They stack below lg.
 */
export default function ScheduleFaq() {
  return (
    <section className="px-6 py-16 md:py-24">
      <div className="mx-auto grid max-w-6xl gap-20 lg:grid-cols-2 lg:items-start lg:gap-14">
        <Schedule />
        <FAQ />
      </div>
    </section>
  );
}
