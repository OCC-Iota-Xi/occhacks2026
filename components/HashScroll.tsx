"use client";

import { useEffect } from "react";

/**
 * Lands on the right document when /legal is opened at #privacy or #terms.
 *
 * The browser's own fragment scroll is unreliable here: globals.css sets
 * `scroll-behavior: smooth`, and on a cold load the animated scroll is
 * cancelled by the layout settling under it — the particle canvas sizing, the
 * webfonts swapping in — which leaves the reader at the top of a page they
 * asked the bottom half of. That matters more than it sounds: Google's OAuth
 * console wants the privacy policy and the terms at two different URLs, so
 * #terms landing on the privacy policy is a review failure, not a nitpick.
 */
export default function HashScroll({ offset = 112 }: { offset?: number }) {
  useEffect(() => {
    const id = window.location.hash.slice(1);
    if (!id) return;

    // Two frames: the first lets hydration finish, the second lets the layout
    // it produced settle before anything is measured.
    const outer = requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        const el = document.getElementById(id);
        if (!el) return;
        window.scrollTo({
          top: window.scrollY + el.getBoundingClientRect().top - offset,
          behavior: "instant",
        });
      });
    });
    return () => cancelAnimationFrame(outer);
  }, [offset]);

  return null;
}
