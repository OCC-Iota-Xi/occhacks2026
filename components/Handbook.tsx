import Image from "next/image";
import Link from "next/link";
import { HandbookAstronaut, HandbookPlanet } from "@/components/HandbookArt";
import { EVENT } from "@/lib/email/templates";
import { OCC_CLASSES } from "@/lib/form-options";
import { HANDBOOK_SECTIONS, type HandbookSectionId } from "@/lib/handbook";
import { SCHEDULE_DAYS } from "@/lib/schedule";

/** Same listing the site footer links to — see components/sections/Closer.tsx. */
const DEVPOST_URL = "https://occhacks-2026.devpost.com/";

/* Set like a docs page: one column of prose straight on the page, no card,
   in the site's own type and colors. */
const LINK = "text-ring underline underline-offset-4";
/* Bullets are drawn in the line rather than hung outside it. A real list
   marker sits to the left of its item's box, which puts it underneath any
   picture the text is wrapping around on that side. */
const ITEM =
  "[&>li]:pl-6 [&>li]:-indent-6 [&>li]:before:inline-block [&>li]:before:w-6 [&>li]:before:indent-0 [&>li]:before:text-muted-foreground";
const LIST = `mt-4 space-y-2 ${ITEM} [&>li]:before:content-['•']`;
const SUBLIST = `mt-2 space-y-2 ${ITEM} [&>li]:before:content-['◦']`;

function External({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a href={href} target="_blank" rel="noreferrer" className={LINK}>
      {children}
    </a>
  );
}

/** What projects are judged on, worded as on the Devpost listing. */
const JUDGING = [
  {
    name: "Technical Complexity",
    description:
      "Complexity is based on how effectively, efficiently, and cleanly your program uses frameworks, APIs, and libraries, especially how they are interconnected. Judgment will focus on how you have implemented your resources.",
  },
  {
    name: "Creativity",
    description:
      "Innovation is a reflection of creativity and originality. Ideas that are new and fresh and solutions that are different and clever can become influential. Judgment will focus on the purpose of your project and how you tackle technical problems.",
  },
  {
    name: "Functionality",
    description:
      "An effective project with an intuitive design is imperative to its functionality, allowing users to smoothly understand its function and efficiency. Judgment will be based on how well your program performs and the simplicity of the user interface.",
  },
  {
    name: "Presentation",
    description:
      "Presentation is a necessary skill in the industry, performing a solution strong enough to efficiently solve a problem. Judgment will focus on you and your team's ability to confidently and effectively demo your project.",
  },
];

/**
 * The pictures set into the text, by the section each one opens, each
 * drifting at its own pace as the page scrolls.
 *
 * Sides are mixed where they can be. On the left a picture only works beside
 * paragraphs or a short flat list that fits wholly alongside it: the text
 * wraps but the indents don't, so a longer or nested list comes out ragged.
 */
const ART: Partial<Record<HandbookSectionId, React.ReactNode>> = {
  about: <HandbookAstronaut side="right" drift={14} />,
  rules: <HandbookPlanet side="right" drift={-20} variant="saturn" />,
  prizes: <HandbookPlanet side="left" drift={10} variant="pluto" />,
  logistics: <HandbookPlanet side="right" drift={-16} variant="earth" />,
};

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
          className="mt-4 block h-auto w-full max-w-lg rounded-lg border border-border indent-0"
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
              Include your team name, the names of everyone on your team, and a short
              description, and optionally a demo video or photos if you built a mechanical
              prototype.
            </li>
          </ul>
        </li>
        <li>
          Conduct:
          <ul className={SUBLIST}>
            <li>Harassment or inappropriate behavior will not be tolerated.</li>
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
        Breaking any of these rules could result in disqualification or ejection.
      </p>
    </>
  ),
  prizes: (
    <>
      <p>Scholarship Prizes!</p>
      <ul className={LIST}>
        <li>Best Project in Each Track (3 winners) - $500 each</li>
        <li>
          Overall Winner (1 winner) - $250, awarded on top of their Best Project in Track prize
        </li>
        <li>LeetCode Champion (3 winners) - 1st Place $150, 2nd Place $75, 3rd Place $25</li>
      </ul>
      <p className="font-bold text-foreground">
        Winners must be enrolled college students to receive a prize.
      </p>
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
        Attendance is taken from check-in, so make sure your code is scanned at the check-in
        desk each morning.
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
        <li>Meals provided: Saturday lunch & dinner, Sunday lunch</li>
        <li>Snacks and drinks available throughout the event</li>
      </ul>
      <p>Facilities:</p>
      <ul className={LIST}>
        <li>Restrooms: Located at both ends of the 3rd-floor hallway.</li>
        <li>Water Fountains: Next to restrooms.</li>
      </ul>
    </>
  ),
  judging: (
    <>
      <dl className="mt-6 space-y-6">
        {JUDGING.map((criterion) => (
          <div key={criterion.name}>
            <dt className="font-display text-base tracking-tight text-foreground">
              {criterion.name}
            </dt>
            <dd className="mt-1">{criterion.description}</dd>
          </div>
        ))}
      </dl>
      <p>
        The criteria are also on the{" "}
        <External href={DEVPOST_URL}>OCCHacks 2026 Devpost</External>.
      </p>
    </>
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
      <li>Questions? Ask an organizer or message on Discord anytime!</li>
    </ul>
  ),
};

/**
 * The hacker handbook itself. Shown to confirmed hackers at `/handbook` and to
 * organizers inside the dashboard at `/admin/handbook`; who gets to read it is
 * each of those pages' business, not this component's.
 */
export default function Handbook() {
  return (
    <article className="relative z-10 mx-auto w-full max-w-5xl px-6 pt-16 pb-20 text-base leading-7 text-foreground/90 sm:px-12">
      <h1 className="font-display text-3xl tracking-tight text-foreground sm:text-4xl">
        OCCHacks 2026 Hacker Handbook
      </h1>
      <p className="mt-4 text-lg text-muted-foreground">
        This document contains all the info you need for our upcoming hackathon, OCCHacks.
      </p>

      {HANDBOOK_SECTIONS.map((section, index) => (
        // `flow-root` keeps a section's picture inside it: without it a picture
        // taller than its section would push into the next one's text.
        <section
          key={section.id}
          id={section.id}
          className="mt-12 flow-root scroll-mt-20 md:scroll-mt-8 [&_p]:mt-4"
        >
          <h2 className="font-display text-xl tracking-tight text-foreground sm:text-2xl">
            <span className="text-ring">{index + 1}.</span> {section.title}
          </h2>
          {ART[section.id]}
          {BODIES[section.id]}
        </section>
      ))}
    </article>
  );
}
