import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import SpaceBackdrop from "@/components/SpaceBackdrop";
import Hero from "@/components/sections/Hero";
import AboutSection from "@/components/sections/AboutSection";
import Tracks from "@/components/sections/Tracks";
import Schedule from "@/components/sections/Schedule";
import FAQ from "@/components/sections/FAQ";
import Sponsors from "@/components/sections/Sponsors";
import Mentors from "@/components/sections/Mentors";
import Closer from "@/components/sections/Closer";
import { faqJsonLd } from "@/lib/faq";

const SITE_URL = "https://occhacks.com";

/* Scoped to the homepage on purpose: set in the root layout, every child
   route would inherit it and point its canonical at "/". */
export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

/** Branded spellings people search for, so they all resolve to this page. */
const ALTERNATE_NAMES = ["OCCHacks", "OCC Hack", "OCC Hackathon", "OC Hacks", "Orange Coast College Hackathon"];

const siteJsonLd = [
  {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "OCC Hacks",
    alternateName: ALTERNATE_NAMES,
    url: SITE_URL,
  },
  {
    "@context": "https://schema.org",
    "@type": "Event",
    name: "OCC Hacks 2026",
    alternateName: ALTERNATE_NAMES,
    description:
      "A free two-day hackathon for college students at Orange Coast College. All majors and skill levels welcome.",
    startDate: "2026-10-10T08:00:00-07:00",
    endDate: "2026-10-11T18:00:00-07:00",
    eventStatus: "https://schema.org/EventScheduled",
    eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
    isAccessibleForFree: true,
    url: SITE_URL,
    image: `${SITE_URL}/opengraph-image.png`,
    location: {
      "@type": "Place",
      name: "OCC Ballroom, Orange Coast College",
      address: {
        "@type": "PostalAddress",
        streetAddress: "2701 Fairview Road",
        addressLocality: "Costa Mesa",
        addressRegion: "CA",
        postalCode: "92626",
        addressCountry: "US",
      },
    },
    organizer: { "@type": "Organization", name: "Iota Xi (ΙΞ) Society at Orange Coast College" },
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
      availability: "https://schema.org/InStock",
      url: `${SITE_URL}/register`,
      validThrough: "2026-10-05T23:59:00-07:00",
    },
  },
  faqJsonLd,
];

export default function Home() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(siteJsonLd).replace(/</g, "\\u003c") }}
      />
      {/* Opaque and above the footer: the footer is sticky underneath the page
          and has to stay covered until the very bottom, or it would simply be
          appended rather than uncovered. */}
      <main className="relative z-10">
        <SpaceBackdrop />
        <Navbar />
        <Hero />
        <AboutSection />
        <Tracks />
        <Mentors />
        <Sponsors />
        <Schedule />
        <FAQ />
      </main>
      <Closer />
    </>
  );
}
