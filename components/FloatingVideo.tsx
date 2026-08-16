"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { X } from "lucide-react";

const VIDEO_ID = "952ILTHDgC4";
/**
 * Phone-shaped window — the 16:9 source is cropped to fill it. Kept at 2:3
 * rather than a true 9:16 so the crop keeps more of the frame in view.
 */
const WIDTH = 240;
const HEIGHT = 360;
const EDGE = 16;
/** How far down the page it waits before sliding in. */
const SHOW_AFTER = 320;
const DISMISSED_KEY = "occhacks:video-dismissed";

/**
 * Muted background video in a draggable phone-sized window. Slides in once
 * the page has been scrolled a little — once only, since scrolling back up
 * shouldn't take it away — and stays gone for the session once closed.
 */
export default function FloatingVideo() {
  const [shown, setShown] = useState(false);
  // Read once at mount rather than in an effect. Nothing renders before the
  // first scroll anyway, so the server and client agree on the empty output.
  const [dismissed, setDismissed] = useState(
    () => typeof window !== "undefined" && sessionStorage.getItem(DISMISSED_KEY) === "1"
  );
  const [pos, setPos] = useState<{ x: number; y: number } | null>(null);
  const [dragging, setDragging] = useState(false);
  const grab = useRef({ x: 0, y: 0 });
  const cardRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<HTMLIFrameElement>(null);

  /**
   * Nudge the player into playing. A paused embed puts YouTube's title and
   * "more videos" chrome over the picture, so it must never come to rest —
   * and since clicks can't reach it, only this can restart it.
   */
  function play() {
    frameRef.current?.contentWindow?.postMessage(
      JSON.stringify({ event: "command", func: "playVideo", args: [] }),
      "*"
    );
  }

  useEffect(() => {
    if (shown) return;
    const onScroll = () => {
      // Latches on: this is a one-time entrance, not a scroll-linked toggle.
      if (window.scrollY > SHOW_AFTER) setShown(true);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [shown]);

  /** Keeps the window on screen when it's dragged or the viewport changes. */
  const clamp = useCallback((x: number, y: number) => {
    const maxX = window.innerWidth - WIDTH - EDGE;
    const maxY = window.innerHeight - HEIGHT - EDGE;
    return {
      x: Math.min(Math.max(x, EDGE), Math.max(maxX, EDGE)),
      y: Math.min(Math.max(y, EDGE), Math.max(maxY, EDGE)),
    };
  }, []);

  // The embed can come up paused when a browser declines the autoplay; retry
  // for a few seconds after it appears rather than leaving chrome on screen.
  useEffect(() => {
    if (!shown || dismissed) return;
    const timers = [600, 1500, 3000, 5000].map((ms) => setTimeout(play, ms));
    return () => timers.forEach(clearTimeout);
  }, [shown, dismissed]);

  useEffect(() => {
    if (!pos) return;
    const onResize = () => setPos((prev) => (prev ? clamp(prev.x, prev.y) : prev));
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [pos, clamp]);

  function onPointerDown(event: React.PointerEvent<HTMLDivElement>) {
    const rect = cardRef.current?.getBoundingClientRect();
    if (!rect) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    grab.current = { x: event.clientX - rect.left, y: event.clientY - rect.top };
    setPos({ x: rect.left, y: rect.top });
    setDragging(true);
  }

  function onPointerMove(event: React.PointerEvent<HTMLDivElement>) {
    if (!dragging) return;
    setPos(clamp(event.clientX - grab.current.x, event.clientY - grab.current.y));
  }

  function onPointerUp(event: React.PointerEvent<HTMLDivElement>) {
    event.currentTarget.releasePointerCapture(event.pointerId);
    setDragging(false);
  }

  function dismiss() {
    setDismissed(true);
    sessionStorage.setItem(DISMISSED_KEY, "1");
  }

  // Nothing is loaded — including the embed — until it's actually wanted.
  if (dismissed || !shown) return null;

  return (
    <div
      ref={cardRef}
      className={`fixed z-50 overflow-hidden rounded-2xl bg-black shadow-2xl ${
        dragging ? "" : "animate-in fade-in slide-in-from-bottom-4 duration-500"
      }`}
      style={
        pos
          ? { left: pos.x, top: pos.y, width: WIDTH, height: HEIGHT }
          : { right: EDGE, bottom: EDGE, width: WIDTH, height: HEIGHT }
      }
    >
      <iframe
        ref={frameRef}
        // The source is 16:9, so it's blown up and centre-cropped to fill the
        // portrait window rather than sitting in letterbox bars. It's also
        // inert: no clicks reach it, so YouTube's title and paused-state
        // controls never surface over the picture.
        className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 border-0"
        style={{ height: HEIGHT, width: (HEIGHT * 16) / 9 }}
        src={`https://www.youtube-nocookie.com/embed/${VIDEO_ID}?autoplay=1&mute=1&loop=1&playlist=${VIDEO_ID}&controls=0&modestbranding=1&rel=0&playsinline=1&disablekb=1&iv_load_policy=3&fs=0&enablejsapi=1`}
        title="background gameplay"
        allow="autoplay; encrypted-media"
        onLoad={play}
        tabIndex={-1}
      />

      {/* The whole window is the drag handle — the embed can't take the
          pointer events, so this transparent layer does the work. */}
      <div
        // A pointer on the window counts as the gesture some browsers want
        // before they'll start playback at all.
        onPointerDownCapture={play}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        // touch-none keeps a drag on mobile from scrolling the page instead.
        className={`absolute inset-0 touch-none ${dragging ? "cursor-grabbing" : "cursor-grab"}`}
      />

      <button
        type="button"
        onClick={dismiss}
        aria-label="close video"
        className="absolute right-2 top-2 rounded-full bg-black/50 p-1.5 text-white/70 backdrop-blur-sm transition-colors hover:bg-black/70 hover:text-white"
      >
        <X className="size-3.5" />
      </button>
    </div>
  );
}
