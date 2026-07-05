# OCC Hacks 2026 — Site Redesign Proposal (v5)

A ground-up rebuild of the landing page. Framer Motion + shadcn/ui + Tailwind stock colors. No three.js, no GSAP, no Lenis, no eyebrow labels, minimal bolding.

**Reference:** [synchronized.studio](https://synchronized.studio/) — tuned way down. We take their typographic system (oversized stacked headlines mixing sans with serif italic, hairline-ruled numbered lists, marquee strips, a rotating circular badge, monochrome + one pale accent, inverted footer) and leave their chaos (WebGL showreel, scroll-jacking, full-viewport transitions).

---

## Theme: "Open Studio"

OCC Hacks presented the way a design studio presents itself: **the hackathon is a 24-hour studio, and you're invited to join it.** The site is a quiet, typography-first editorial page — near-monochrome, ruled with hairlines, carried by enormous light-weight type. Tracks read like a studio's selected works. Registering is joining the studio.

The vibe: confident through restraint. Almost no color, almost no boxes — when everything is quiet, the two peach moments and the giant type do all the talking.

### The visual language

| Element | Treatment |
|---|---|
| **Type is the design** | Headlines at `text-6xl → text-9xl`, Inter 400 (never bolder), tight tracking and leading, stacked on multiple lines. One phrase per headline switches to Newsreader italic — the sans/serif collision is the signature, straight from the reference. |
| **Hairline rules** | No cards. Content sits in full-width rows separated by 1px `stone-300` rules. Tracks, schedule, FAQ, and stats are all ruled lists. |
| **Numbered rows** | List items carry small tabular numbers (`01`, `02`, `03`) set above their content on the center axis — the reference's case-list pattern, recomposed for the centered layout. Used for tracks, schedule, and FAQ. |
| **Center axis** | Everything is center-aligned: headlines, dates, buttons, paragraphs, rows, footer. The page reads as one vertical poster column (`max-w-3xl` text, `max-w-5xl` rows), and the symmetry is itself part of the theme's calm. The nav is the only exception (wordmark left, stacked links right, per the reference). |
| **The marquee** | A slim repeating text strip between hero and content: `occ hacks 2026 · oct 11–12 · orange coast college · free to attend ·` — hairline above and below, drifting slowly, pausing on hover. |
| **The rotating badge** | A circular-text stamp (`orange coast college · est. 2024 · 24 hours ·`) rotating one turn per ~30s, centered above the hero headline as its crown. The only ornament. |
| **Inverted footer** | The final CTA + footer flips to `stone-950` ink with paper text — the reference's closing move and the page's single dramatic beat. |

### Typography

Same faces as agreed, weight discipline intact — this theme leans on them harder:

- **Inter 400** — everything, including the giant headlines. At 8rem, regular weight is plenty; hierarchy comes from size, not weight. 500 permitted only on button labels.
- **Newsreader italic (300–400)** — the accent phrase inside headlines ("a 24-hour *studio*"), pull-quotes, and the footer sign-off. Never for whole paragraphs.
- Numbers everywhere get `tabular-nums`. Lowercase/sentence case; no letterspaced caps, no all-caps sections.

### Color (Tailwind stock palette)

Near-monochrome. Warm neutrals (stone, per your palette), one pale accent.

| Role | Token | Use |
|---|---|---|
| Paper | `stone-50` | Page background |
| Ink | `stone-950` | Headlines, primary text, footer background |
| Body | `stone-600` | Paragraphs |
| Faded | `stone-400` | Row numbers, captions, timestamps |
| Hairline | `stone-300` | All rules and dividers |
| Accent | `orange-200` | Pale peach fills: row hover wash, selection color, badge fill (their `#ff997f` / `#deebc8` move) |
| Accent ink | `orange-700` | The italic headline phrase, links, active states |

That's the whole palette. Track rows don't get individual colors — the monochrome discipline is the theme. (If the page needs one more note later, `stone-200` washes, not new hues.)

### Components (shadcn/ui)

`button`, `accordion`, `tabs`, `separator`, `badge` — restyled flat: hairline borders, `rounded-full` pill buttons (ink outline, paper fill; primary is ink fill with paper text), no shadows anywhere, no card component on the page at all.

### Motion vocabulary (Framer Motion, defined once in `lib/motion.ts`)

The reference's motion language at 30% intensity — six moves:

| Move | Definition | Where |
|---|---|---|
| Line reveal | Headline lines wrapped in `overflow-hidden`, `y: "100%" → 0`, 0.7s, staggered 0.09s — the classic editorial mask reveal | Hero on load, section headlines in view |
| Nav stagger | Each stacked nav link `opacity 0→1, y 20→0`, delays 0.4–0.55s on load | Navbar |
| `fadeUp` | `opacity 0→1, y 12→0`, 0.5s, `whileInView`, once | Body copy, lists |
| Marquee | Infinite `x` loop, ~40s per cycle, pauses on hover | The strip |
| Badge spin | `rotate: 360`, 30s, linear, infinite | Circular stamp |
| Row hover | Background washes `orange-200`, the row's name scales to 1.02 with a spring (no lateral shift — rows are centered) | Track/schedule/FAQ rows |
| Press | `whileTap={{ scale: 0.97 }}` | Buttons |

Count-up on the stat row. Everything gated by `useReducedMotion` (reveals become fades; marquee and badge hold still).

---

## Key sections (top to bottom)

1. **Navbar** — the reference's nav, faithfully: `fixed` to the top, **fully transparent** — no fill, no blur, no border or hairline, ever. Wordmark left ("occ hacks", Inter 400). Right edge: the links as a **vertically stacked, right-aligned column** — `about` / `tracks` / `schedule` / `faq` — one per line, small (13–14px), lowercase, each line entering with a staggered `opacity + y` reveal on load (delays ~0.4/0.45/0.5/0.55s, matching the reference). Below them, set slightly apart: `register ↗` with a small arrow SVG and an animated underline on hover (their "distorted-link", tuned down to a clean line that draws in). Active section gets `orange-700`. Links sit as ink on paper and flip to paper color while over the inverted closer (a simple `mix-blend-difference` or an in-view flag on the dark section). Mobile: wordmark + the stacked column collapses to `menu`, opening a full-screen paper sheet with the same stacked links, large.

2. **Hero** — the statement, dead-center of the viewport. Stacked giant headline, center-aligned, line-revealed on load:
   `occ hacks is` / `a 24-hour *studio*` / `on the golden coast.`
   (italic phrase in `orange-700`). Below, centered in plain reading size: `Oct 11–12, 2026 · Orange Coast College`, one supporting sentence, then the buttons centered — ink pill **register** + text link **see the tracks →**. The rotating circular badge sits above the headline, centered, as the hero's crown. No imagery.

3. **Marquee strip** — `occ hacks 2026 · oct 11–12 · orange coast college · free to attend ·` repeating between hairlines.

4. **About** — "built by students, for *students*." A single centered column: one strong paragraph at reading size (`max-w-2xl`), then a centered ruled stat strip — `150+ hackers` / `24 hours` / `every meal covered` / `beginner friendly` — values counting up in ink above their labels in `stone-600`, separated by short vertical hairlines.

5. **Tracks** — "selected *tracks*." Three full-width ruled rows, all content centered: small number (`01`) on top, track name huge in Newsreader beneath it (education / productivity / spoof apps), one-line description in `stone-600`, tag (`build to learn` / `build to ship` / `build to laugh`) in `stone-400`. Hover: peach wash + a gentle scale of the name.

6. **Schedule** — "two days in the *studio*." Centered shadcn tabs (saturday / sunday), ruled rows with the tabular timestamp above and the event name beneath, all centered.

7. **Sponsors** — "with *friends*." Hairline-ruled logo grid, grayscale to full on hover; quiet "want to sponsor? → sponsor@occhacks.com".

8. **FAQ** — "before you *ask*." shadcn accordion as ruled numbered rows, the five existing questions.

9. **Inverted closer** — full-width `stone-950`, everything centered: giant paper-colored line-revealed headline `join the *studio*.`, the date, one paper pill **register**, then the footer inside the same ink block — wordmark, socials, college link, `occ hacks 2026 · costa mesa, ca` stacked on the center axis. One dramatic beat to end.

---

## What gets deleted

- `components/three/*`, `three`, `@react-three/fiber`, `@react-three/drei`, `leva`
- `gsap`, `@gsap/react`, `lenis`, `SmoothScroll.tsx`
- `aurora-background`, `animated-gradient-text`, `glowing-effect`, `grid-pattern`, `AtmosphereTransition`, the SVG cyber buttons, Bruno Ace SC, the scroll-driven CSS-variable morph
- `framer-motion` package (keep `motion` — same library, current name — as the single import source)

## Build order

1. `globals.css`: paper/ink tokens, hairline defaults; load Inter + Newsreader (variable, ital).
2. Theme primitives: line-reveal headline component, marquee, circular badge, ruled-row list.
3. Static rebuild of all sections with final copy — must read right frozen.
4. Wire `lib/motion.ts` moves section by section.
5. Schedule content, responsive pass (headlines scale hard on mobile — clamp carefully), reduced-motion pass, Lighthouse check.
