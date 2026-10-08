import type { Metadata } from "next";
import { cookies } from "next/headers";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import HandbookReader from "@/components/HandbookReader";
import { EVENT } from "@/lib/email/templates";
import { OCC_CLASSES } from "@/lib/form-options";
import {
  HANDBOOK_SECTIONS,
  HANDBOOK_THEME_COOKIE,
  type HandbookSectionId,
} from "@/lib/handbook";
import { canReadHandbook } from "@/lib/read-applicant-stage";
import { SCHEDULE_DAYS } from "@/lib/schedule";
import { createClient, getSessionUser } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "hacker handbook — OCC Hacks 2026",
  description: "Everything a confirmed hacker needs for the weekend of OCC Hacks 2026.",
};

/** Same listing the site footer links to — see components/sections/Closer.tsx. */
const DEVPOST_URL = "https://occhacks-2026.devpost.com/";

/* Set like a docs page: one column of prose straight on the page, no card,
   in the site's own type and colors. Everything is a token, so
   `HandbookReader` can swap the palette for its light mode. */
const LINK = "text-ring underline underline-offset-4";
const LIST = "mt-4 list-disc space-y-2 pl-6 marker:text-muted-foreground";
const SUBLIST = "mt-2 list-[circle] space-y-2 pl-6 marker:text-muted-foreground";

function External({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a href={href} target="_blank" rel="noreferrer" className={LINK}>
      {children}
    </a>
  );
}

/** What each section says. Their order and headings are `HANDBOOK_SECTIONS`. */
const BODIES: Record<HandbookSectionId, React.ReactNode> = {
  about: (
    <>
      <p>
        OCCHacks is an in-person two-day hackathon hosted by the Iota Xi Honor Society at Orange
        Coast College that will challenge students to build a project that will be judged in
        various categories, including technical complexity, creativity, functionality, and your
        own presentation skills.
      </p>
      <p>
        Our mission: We want to push students to develop practical technology skills, gain
        experience designing and creating solutions, and network and collaborate with others!
      </p>
      <p>Tracks:</p>
      <ul className={LIST}>
        <li>Entertainment</li>
        <li>Education</li>
        <li>Productivity and Utility</li>
      </ul>
    </>
  ),
  venue: (
    <ul className={LIST}>
      <li>
        Venue:
        <ul className={SUBLIST}>
          <li>Orange Coast College, College Center Ballroom (3rd Floor)</li>
          <li>2701 Fairview Rd, Costa Mesa, CA 92626</li>
        </ul>
      </li>
      <li>
        Parking:
        <ul className={SUBLIST}>
          <li>
            Free parking is available in Lot C, on the corner of Merrimac Way and Fairview Road
            (near the Campus Safety building).
          </li>
          <li>Please park only in Lot C to avoid towing.</li>
        </ul>
      </li>
      <li>
        Map:
        <ul className={SUBLIST}>
          <li>
            The red arrow/rectangle shows the College Center, and the blue rectangle marks Lot
            C. (<External href={EVENT.parkingUrl}>Lot C on Google Maps</External>)
          </li>
        </ul>
        <Image
          src="/handbook/campus-map.png"
          alt="Campus map with the College Center outlined in red and Lot C, just south of it along Fairview Road, outlined in blue."
          width={589}
          height={556}
          className="mt-4 h-auto w-full max-w-lg rounded-lg border border-border"
        />
      </li>
    </ul>
  ),
  schedule: (
    <>
      <div className="mt-6 grid gap-x-12 gap-y-8 sm:grid-cols-2">
        {SCHEDULE_DAYS.map((day) => (
          <div key={day.id}>
            <h3 className="font-display text-base tracking-tight text-foreground">{day.label}</h3>
            <ul className="mt-2 divide-y divide-border">
              {day.events.map((event) => (
                <li key={`${event.time}-${event.name}`} className="flex items-baseline gap-4 py-2">
                  <span className="w-20 shrink-0 text-sm text-muted-foreground tabular-nums">
                    {event.time}
                  </span>
                  <span>
                    {event.name}
                    {event.speakers && (
                      <span className="block text-sm text-muted-foreground">{event.speakers}</span>
                    )}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <p className="text-sm text-muted-foreground">
        The schedule is provisional, and you do not need to stay for the whole time. It&apos;s
        also on{" "}
        <Link href="/#schedule" className={LINK}>
          occhacks.com
        </Link>
        .
      </p>
    </>
  ),
  rules: (
    <>
      <ul className={LIST}>
        <li>Team Size: 1-4 members.</li>
        <li>
          Work Period: All coding, hardware work, and major project components must be created
          during the hackathon.
        </li>
        <li>
          Submissions:
          <ul className={SUBLIST}>
            <li>
              Submit on <External href={DEVPOST_URL}>Devpost</External> by 3:30 pm October 11th.
            </li>
            <li>
              Include your code and a short description and optionally a demo video or photos
              if you built a mechanical prototype.
            </li>
          </ul>
        </li>
        <li>
          Resources:
          <ul className={SUBLIST}>
            <li>Open-source libraries and frameworks are allowed.</li>
          </ul>
        </li>
        <li>
          Conduct:
          <ul className={SUBLIST}>
            <li>Harassment or inappropriate behavior will not be tolerated.</li>
          </ul>
        </li>
        <li>
          Plagiarism:
          <ul className={SUBLIST}>
            <li>Make sure to properly credit your projects!</li>
          </ul>
        </li>
        <li>
          Miscellaneous:
          <ul className={SUBLIST}>
            <li>You are only allowed to compete in one track.</li>
            <li>Vibe (AI) coding is permitted.</li>
            <li>
              You must physically check into this event when it starts. You will be allowed to
              leave once you are checked in, but make sure to show up during judging!
            </li>
            <li>
              This event will not be hosted on location overnight, but you are allowed to work
              on your project at home during the period the venue is closed.
            </li>
          </ul>
        </li>
      </ul>
      <p>
        Breaking any of these rules could result in disqualification, ejection, and a permanent
        ban from future OCC hackathons.
      </p>
    </>
  ),
  prizes: (
    <>
      <p>Cash Prizes!</p>
      <ul className={LIST}>
        <li>Overall Winner (1 winner) - $250</li>
        <li>Best Project in Each Track (3 winners) - $500 each</li>
        <li>LeetCode Champion (3 winners) - 1st Place $150, 2nd Place $75, 3rd Place $25</li>
      </ul>
    </>
  ),
  "extra-credit": (
    <>
      <p>
        Some OCC instructors are giving extra credit for attending OCCHacks. You can get it if
        you&apos;re currently taking one of these classes:
      </p>
      <ul className={LIST}>
        {OCC_CLASSES.map((name) => (
          <li key={name}>{name}</li>
        ))}
      </ul>
      <p>
        Extra credit counts toward one class only, so pick one. We send each instructor the
        list of their students who attended, which is why we need your section as well as your
        class.
      </p>
      <p>
        <Link href="/register#extra-credit" className={LINK}>
          Add your class and section on the registration page
        </Link>
        .
      </p>
      <p>
        Attendance is taken from check-in, so make sure your code is scanned at the door each
        morning.
      </p>
    </>
  ),
  logistics: (
    <>
      <p>CCCD Guest Wifi is available.</p>
      <p>What to Bring:</p>
      <ul className={LIST}>
        <li>
          Your own laptop, charger, mouse, headphones, and any equipment or materials you plan
          to use (especially for hardware projects).
        </li>
      </ul>
      <p>Food & Snacks:</p>
      <ul className={LIST}>
        <li>Meals provided: Saturday lunch & dinner, Sunday breakfast & lunch</li>
        <li>Snacks and drinks available throughout the event</li>
      </ul>
      <p>Facilities:</p>
      <ul className={LIST}>
        <li>Restrooms: Located at both ends of the 3rd-floor hallway.</li>
        <li>Water Fountains: Next to restrooms.</li>
        <li>Building doors will be locked. Message an organizer on Discord to re-enter.</li>
      </ul>
    </>
  ),
  judging: (
    <p>
      For a more in-depth look at our judging criteria, check out the{" "}
      <External href={DEVPOST_URL}>OCCHacks 2026 Devpost</External>.
    </p>
  ),
  help: (
    <ul className={LIST}>
      <li>
        Discord: Join via this <External href={EVENT.discordUrl}>link</External> to stay
        updated.
      </li>
      <li>
        Website:{" "}
        <Link href="/" className={LINK}>
          OCCHacks.com
        </Link>
      </li>
      <li>
        Questions? Ask an organizer (they have special name tags) or message on Discord anytime!
      </li>
    </ul>
  ),
};

export default async function HandbookPage() {
  const supabase = await createClient();
  const user = await getSessionUser(supabase);
  // Dev-only: allow viewing the page without a session.
  if (!user && process.env.NODE_ENV !== "development") redirect("/signin");
  // Anyone not yet confirmed goes to the page that says where they stand.
  if (user && !(await canReadHandbook(user))) redirect("/status");

  const theme =
    (await cookies()).get(HANDBOOK_THEME_COOKIE)?.value === "light" ? "light" : "dark";

  return (
    <HandbookReader initialTheme={theme}>
      <h1 className="font-display text-3xl tracking-tight text-foreground sm:text-4xl">
        OCCHacks 2026 Hacker Handbook
      </h1>
      <p className="mt-4 text-lg text-muted-foreground">
        This document contains all the info you need for our upcoming hackathon, OCCHacks.
      </p>

      {HANDBOOK_SECTIONS.map((section, index) => (
        <section
          key={section.id}
          id={section.id}
          className="mt-12 scroll-mt-20 md:scroll-mt-8 [&_p]:mt-4"
        >
          <h2 className="font-display text-xl tracking-tight text-foreground sm:text-2xl">
            <span className="text-ring">{index + 1}.</span> {section.title}
          </h2>
          {BODIES[section.id]}
        </section>
      ))}
    </HandbookReader>
  );
}
