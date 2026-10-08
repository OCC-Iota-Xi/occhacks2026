"use client";

import { useState } from "react";
import { Moon, Sun } from "lucide-react";
import { HANDBOOK_THEME_COOKIE, type HandbookTheme } from "@/lib/handbook";
import { cn } from "@/lib/utils";

/**
 * The site's tokens, redrawn as ink on paper. Set on the reading area itself,
 * so everything inside it keeps using `text-foreground`, `text-ring` and the
 * rest and nothing outside it changes.
 *
 * All the type is black here, the quieter text and the gold accents included.
 * Links are underlined, so they still read as links without a color.
 */
const LIGHT = {
  "--background": "#fafaf9",
  "--foreground": "#000000",
  "--muted-foreground": "#000000",
  "--border": "#e7e5e4",
  "--ring": "#000000",
} as React.CSSProperties;

/**
 * The handbook's reading area, with its light and dark switch. The site is
 * dark only; this is the one place a reader can choose, because it's the one
 * page that's mostly for reading.
 *
 * Dark is the page as the layout draws it, text straight on the space
 * backdrop. Light fills the area edge to edge and covers the backdrop, which
 * is drawn for a dark sky. The sidebar belongs to the layout and stays dark.
 *
 * `initialTheme` is the reader's last choice, which the page reads from a
 * cookie so it arrives in the right colors instead of flipping to them.
 */
export default function HandbookReader({
  initialTheme,
  children,
}: {
  initialTheme: HandbookTheme;
  children: React.ReactNode;
}) {
  const [theme, setTheme] = useState(initialTheme);
  const light = theme === "light";

  const toggle = () => {
    const next: HandbookTheme = light ? "dark" : "light";
    setTheme(next);
    document.cookie = `${HANDBOOK_THEME_COOKIE}=${next}; path=/handbook; max-age=31536000; samesite=lax`;
  };

  return (
    <div
      style={light ? LIGHT : undefined}
      className={cn("relative z-10 w-full flex-1 text-foreground", light && "bg-background")}
    >
      <button
        type="button"
        onClick={toggle}
        aria-label={light ? "Switch to dark mode" : "Switch to light mode"}
        className="absolute top-4 right-4 flex size-9 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:text-ring sm:top-6 sm:right-6"
      >
        {light ? <Moon className="size-4" /> : <Sun className="size-4" />}
      </button>
      <article
        className={cn(
          "mx-auto w-full max-w-5xl px-6 pt-16 pb-20 text-base leading-7 sm:px-12",
          !light && "text-foreground/90"
        )}
      >
        {children}
      </article>
    </div>
  );
}
