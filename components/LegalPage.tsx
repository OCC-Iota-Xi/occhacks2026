import Navbar from "@/components/Navbar";
import Closer from "@/components/sections/Closer";
import Reveal from "@/components/motion/Reveal";
import HashScroll from "@/components/HashScroll";

/**
 * Chrome and typography for the legal page.
 *
 * It sits inside the `(site)` group so it inherits the particle backdrop, and
 * it borrows `SectionHeading`'s type rather than reusing the component itself —
 * that one is hardcoded to an <h2>, and a standalone page needs an <h1>. The
 * body is sentence case: the lowercase UI voice reads as careless on a page
 * whose whole job is to be precise.
 *
 * Privacy and terms share this one page so a single URL carries both, anchored
 * as #privacy and #terms. Google's OAuth console asks for the two links
 * separately and will not take the same URL twice.
 */
export default function LegalPage({
  plain,
  accent,
  updated,
  children,
}: {
  plain: string;
  accent: string;
  updated: string;
  children: React.ReactNode;
}) {
  return (
    <main>
      <Navbar />
      <HashScroll />
      <section className="px-6 pt-28 pb-16 md:pt-36">
        <Reveal className="text-center">
          <h1 className="font-display text-4xl tracking-tight text-foreground sm:text-5xl md:text-6xl">
            {plain} <span className="text-ring">{accent}</span>
          </h1>
          <p className="mt-4 text-sm text-muted-foreground/60">Last updated {updated}</p>
        </Reveal>
        {/* Both documents are on one page, so a reader who lands at the top
            needs a way to the other one without scrolling past all of it. */}
        <Reveal className="mt-8 flex items-center justify-center gap-4 text-sm text-muted-foreground">
          <a
            href="#privacy"
            className="underline underline-offset-4 transition-colors hover:text-foreground"
          >
            Privacy Policy
          </a>
          <span aria-hidden="true" className="text-muted-foreground/40">
            ·
          </span>
          <a
            href="#terms"
            className="underline underline-offset-4 transition-colors hover:text-foreground"
          >
            Terms of Service
          </a>
        </Reveal>
        <div className="mx-auto mt-16 flex max-w-2xl flex-col gap-20">{children}</div>
      </section>
      <Closer />
    </main>
  );
}

/** One of the two documents on the page, linkable by its id. */
export function Doc({
  id,
  plain,
  accent,
  children,
}: {
  id: string;
  plain: string;
  accent: string;
  children: React.ReactNode;
}) {
  return (
    <Reveal>
      {/* scroll-mt clears the fixed navbar when arriving on the anchor. */}
      <section id={id} className="flex scroll-mt-28 flex-col gap-8 text-muted-foreground">
        <h2 className="font-display text-2xl tracking-tight text-foreground sm:text-3xl">
          {plain} <span className="text-ring">{accent}</span>
        </h2>
        {children}
      </section>
    </Reveal>
  );
}

/** One numbered section within a document. */
export function Clause({
  heading,
  children,
}: {
  heading: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-3">
      <h3 className="font-display text-lg tracking-tight text-foreground">{heading}</h3>
      {children}
    </div>
  );
}

/** Body copy. */
export function P({ children }: { children: React.ReactNode }) {
  return <p className="leading-relaxed">{children}</p>;
}

/** A plain bulleted list. */
export function List({ children }: { children: React.ReactNode }) {
  return (
    <ul className="flex list-disc flex-col gap-2 pl-5 leading-relaxed marker:text-ring">
      {children}
    </ul>
  );
}

/** A link in body copy. */
export function A({ href, children }: { href: string; children: React.ReactNode }) {
  const newTab = href.startsWith("http");
  return (
    <a
      href={href}
      {...(newTab ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      className="underline underline-offset-4 transition-colors hover:text-foreground"
    >
      {children}
    </a>
  );
}
