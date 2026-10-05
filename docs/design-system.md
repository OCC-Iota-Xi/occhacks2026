# OCC Hacks design system

The design system as it exists in the code. Tokens live in [`app/globals.css`](../app/globals.css), fonts in [`app/layout.tsx`](../app/layout.tsx), motion presets in [`lib/motion.ts`](../lib/motion.ts).

## Foundations

- **Stack:** Tailwind v4 (tokens in CSS, no config file), shadcn/ui (`radix-nova` style, neutral base), Radix primitives, lucide icons, `motion` for animation.
- **Theme:** dark only. There is no light theme.
- **Principle:** deep space background, starlight text, gold as the single accent. Gold is spent on active navigation, focus, and the one thing a view is about.

## Color

### Core tokens

| Token | Value | Use |
|---|---|---|
| `--background` | `oklch(14.5% 0 0)` | Page, sidebar |
| `--foreground` / `--primary` | `#e8eaf2` | Text, default button fill |
| `--primary-foreground` | `#0b0d17` | Text on light or gold fills |
| `--card` / `--popover` | `#10131f` | Panels (usually `bg-card/40`) |
| `--secondary` / `--muted` | `#161a2a` | Quiet fills |
| `--muted-foreground` | `#9aa0b8` | Secondary text, labels |
| `--border` | `#232842` | Hairlines |
| `--input` | `#2a3050` | Form control borders |
| `--ring` | `#fbbf24` | Gold: focus, accent text (`text-ring`), selection |
| `--accent` | `#1f1a10` | Dark amber wash for hovers and active rows |
| `--accent-foreground` | `#fcd34d` | Light gold text on that wash, primary CTA label |
| `--destructive` | `#ef4444` | Errors |

### Sidebar tokens

| Token | Value |
|---|---|
| `--sidebar` | `oklch(14.5% 0 0)` (same as the page) |
| `--sidebar-foreground` | `#e8eaf2` |
| `--sidebar-primary` | `#fbbf24` |
| `--sidebar-primary-foreground` | `#0b0d17` |
| `--sidebar-accent` | `#1f1a10` |
| `--sidebar-accent-foreground` | `#fcd34d` |
| `--sidebar-border` | `rgba(232, 234, 242, 0.1)` |
| `--sidebar-ring` | `#fbbf24` |

The sidebar shares the page background and is split from it by a hairline, so signed-in pages read as one continuous surface.

### Marketing-only variables

| Token | Value | Use |
|---|---|---|
| `--text-primary` | `#ffffff` | Hero and navbar text |
| `--text-secondary` | `#d1d5db` | Hero secondary text |
| `--card-bg` | `rgba(0, 0, 0, 0.4)` | About cards |
| `--card-border` | `rgba(255, 255, 255, 0.1)` | About card borders |
| `--card-desc` | `#d1d5db` | About card body text |
| `--card-1-accent` | `#fbbf24` | Gold |
| `--card-2-accent` | `#22d3ee` | Cyan |
| `--card-3-accent` | `#c084fc` | Purple |
| `--scrollbar-thumb` | `rgba(154, 160, 184, 0.45)` | `.scroll-soft` thumb |
| `--scrollbar-thumb-hover` | `rgba(154, 160, 184, 0.7)` | `.scroll-soft` thumb on hover |

### Status colors (admin only)

The one sanctioned exception to gold-only: "accepted" and "rejected" have to be distinguishable at a glance in a long table. They are kept desaturated so a screen of them still reads as one surface.

Recipe: `border-{color}-400/25 bg-{color}-400/10 text-{color}-200`. Defined in [`components/admin/ui.tsx`](../components/admin/ui.tsx).

| Color | Meaning |
|---|---|
| Sky | Submitted |
| Violet | In review |
| Emerald | Accepted, confirmed |
| Amber | Waitlisted |
| Rose | Rejected, declined |
| Muted (`border-border bg-muted/60 text-muted-foreground`) | Draft, withdrawn |
| Gold (`--ring`) | `waivers_review`, the only stage where the next move is the organizer's |

Tag pills use the same recipe with six colors: gold, slate, sky, violet, emerald, rose.

## Typography

| Role | Font | Tailwind class |
|---|---|---|
| Display / headers | Bruno Ace SC, weight 400 | `font-display`, `font-header` |
| Body / UI | Space Grotesk | `font-sans`, `font-body` |

Both load through `next/font/google` with `display: swap`.

- **Section headings:** one pattern, [`SectionHeading`](../components/SectionHeading.tsx). Centered, `font-display text-4xl sm:text-5xl md:text-6xl tracking-tight`, with the accent phrase in gold (`text-ring`). No eyebrow label above.
- **Admin scale:**

  | Element | Classes |
  |---|---|
  | Page title | `text-xl tracking-tight` |
  | Panel title | `text-sm` |
  | Labels, meta | `text-xs text-muted-foreground` |
  | KPI value | `text-2xl tabular-nums tracking-tight` |

- **Weight:** hierarchy comes from size and color. The heaviest weight in regular use is `font-medium` on buttons.

## Shape and layout

- **Radius:** base `--radius` is `0.625rem`.

  | Token | Value | Used on |
  |---|---|---|
  | `--radius-sm` | 6px | |
  | `--radius-md` | 8px | Badges (`rounded-md`) |
  | `--radius-lg` | 10px | Buttons (`rounded-lg`) |
  | `--radius-xl` | 14px | Panels (`rounded-xl`) |
  | full | 999px | CTAs (`rounded-full`) |

- **Section rhythm:** `py-16 md:py-24`, with content widths from `max-w-3xl` to `max-w-7xl`.
- **Elevation:** none by shadow. Depth comes from hairline borders, translucent fills, and backdrop blur.

## Components

### Button

[`components/ui/button.tsx`](../components/ui/button.tsx)

- **Variants:** `default`, `outline`, `secondary`, `ghost`, `destructive`, `link`.
- **Sizes:** `xs` 24px, `sm` 28px, `default` 32px, `lg` 36px, plus `icon-xs`, `icon-sm`, `icon`, `icon-lg`.
- **Focus:** gold border plus a 3px gold ring at 50% opacity.
- **Press:** 1px downward nudge.

### Liquid-glass pills

`.liquid-glass` in [`app/globals.css`](../app/globals.css): blurred glass with a rim glow that tracks the mouse through `--mouse-x` / `--mouse-y`.

| Modifier | Use |
|---|---|
| `.glass-visible` | Secondary CTA: visible rim and a faint fill at rest |
| `.glass-gold` | Primary CTA: gold tint with a sheen sweep every 3.6s |

[`CtaButtons`](../components/CtaButtons.tsx) is the site's single CTA set (register / sponsor), shared by the hero and the join section.

### Forms

[`FieldRow`](../components/FieldRow.tsx): centered ruled rows of number, label, control, and hint. Controls sit at `max-w-sm`, or `max-w-lg` when `wide`. An invalid row turns its number and label red.

### Admin kit

[`components/admin/ui.tsx`](../components/admin/ui.tsx)

| Component | Purpose |
|---|---|
| `Panel`, `PanelHeader` | `rounded-xl border border-border bg-card/40` container with a ruled header |
| `PageHeader` | Page title, subtitle, actions |
| `StatCard` | KPI with optional delta, hint, link, and gold emphasis |
| `StatusBadge`, `StageBadge`, `AttendanceBadge` | Status color pills |
| `TagPill` | Colored tag, optionally removable |
| `Score` | Review score; gold at 4 and above, muted below 3 |
| `Empty` | Empty state with title, hint, action |
| `Field` | Labelled value; empty reads "—" |

### Utilities

- `.scroll-soft`: scrollbars that stay invisible until the area is hovered or scrolled.
- `::selection`: gold background, ink text.
- `input[type="date"]`: dark color scheme for the native picker.

## Motion

Everything shares one easing: `EASE = [0.21, 0.47, 0.32, 0.98]`.

| Preset | Behavior |
|---|---|
| `fadeUp` | 12px rise and fade, 0.5s |
| `fadeIn` | Reduced-motion counterpart to `fadeUp`, no travel |
| `stagger` | 80ms between children |
| `lineReveal` | Masked line slide-up, 0.7s |
| `viewportOnce` | Fires once, `-80px` margin |

CSS keyframes cover the ambient effects:

| Keyframe | Use |
|---|---|
| `gold-sheen` | Sheen sweep on the primary CTA |
| `orbit-pulse` | Occasional spark along the mentor avatar orbits |
| `cyber-light-1/2/3` | Indicator lights on hero CTA icons, hover only |
| `gradient` | Animated gradient text, 8s linear loop |
| `accordion-down` / `accordion-up` | FAQ accordion, 0.25s ease-out |
