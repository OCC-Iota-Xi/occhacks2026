"use client";

import { useEffect, useRef, useState } from "react";
import jsQR from "jsqr";
import { RotateCw } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * The camera that reads check-in codes.
 *
 * Two readers, so the desk isn't betting on one. The browser's own
 * `BarcodeDetector` is used where it exists and says it can read QR — it's the
 * faster and the better at a tilted or dim screen. Everywhere else (every
 * iPhone, for one) and whenever the built-in one throws, frames go through
 * jsQR instead, which is plain JavaScript shipped with this page: no worker, no
 * wasm, nothing fetched when the camera opens, so it can't be the thing that
 * fails on venue wifi.
 *
 * `onRead` fires once per code held up, not once per frame: a code that stays
 * in view is reported again only after it has been out of view for a moment.
 */

/** How long a code must be out of frame before the same one counts again. */
const SAME_CODE_GAP = 2500;
const FRAME_INTERVAL = 120;
/** Longest edge handed to jsQR. Plenty for a code filling a third of the frame. */
const MAX_EDGE = 800;

type Decode = (video: HTMLVideoElement) => Promise<string | null>;

interface NativeDetector {
  detect(source: CanvasImageSource): Promise<{ rawValue: string }[]>;
}
interface NativeDetectorClass {
  new (options: { formats: string[] }): NativeDetector;
  getSupportedFormats(): Promise<string[]>;
}

function softwareDecoder(): Decode {
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d", { willReadFrequently: true });

  return async (video) => {
    const { videoWidth, videoHeight } = video;
    if (!context || !videoWidth || !videoHeight) return null;

    const scale = Math.min(1, MAX_EDGE / Math.max(videoWidth, videoHeight));
    const width = Math.round(videoWidth * scale);
    const height = Math.round(videoHeight * scale);
    if (canvas.width !== width) canvas.width = width;
    if (canvas.height !== height) canvas.height = height;

    context.drawImage(video, 0, 0, width, height);
    const frame = context.getImageData(0, 0, width, height);
    // The codes we print are dark on light; trying the inverse too would double
    // the work per frame for nothing.
    const found = jsQR(frame.data, width, height, { inversionAttempts: "dontInvert" });
    return found?.data || null;
  };
}

async function makeDecoder(): Promise<Decode> {
  const software = softwareDecoder();

  const Native = (window as unknown as { BarcodeDetector?: NativeDetectorClass })
    .BarcodeDetector;
  if (!Native) return software;

  try {
    // Present isn't the same as working: on some Android phones the class
    // exists but reports no formats until a system component is installed.
    const formats = await Native.getSupportedFormats();
    if (!formats.includes("qr_code")) return software;
    const detector = new Native({ formats: ["qr_code"] });

    let broken = false;
    return async (video) => {
      if (!broken) {
        try {
          const found = await detector.detect(video);
          return found[0]?.rawValue || null;
        } catch {
          broken = true;
        }
      }
      return software(video);
    };
  } catch {
    return software;
  }
}

function explain(error: unknown): string {
  const name = error instanceof DOMException ? error.name : "";
  if (name === "NotAllowedError" || name === "SecurityError") {
    return "Camera access is blocked for this site. Allow it in your browser's site settings, then try again.";
  }
  if (name === "NotFoundError" || name === "OverconstrainedError") {
    return "This device has no camera to scan with.";
  }
  if (name === "NotReadableError" || name === "AbortError") {
    return "The camera is busy in another app or tab. Close it there, then try again.";
  }
  return "The camera couldn't start.";
}

export default function Scanner({ onRead }: { onRead: (text: string) => void }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [problem, setProblem] = useState<string | null>(null);
  const [live, setLive] = useState(false);
  // Bumped to start the camera over, by the retry button or a dropped stream.
  const [attempt, setAttempt] = useState(0);

  // The loop below outlives any one render; it should call the newest handler
  // without being torn down and restarted each time the parent re-renders.
  const onReadRef = useRef(onRead);
  useEffect(() => {
    onReadRef.current = onRead;
  });

  useEffect(() => {
    let cancelled = false;
    let stream: MediaStream | null = null;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const last = { text: "", seenAt: 0 };

    const restart = () => {
      if (cancelled) return;
      setLive(false);
      setAttempt((value) => value + 1);
    };

    // A phone that was locked or switched away comes back with the stream
    // either paused or ended, depending on the browser.
    const onVisible = () => {
      if (document.hidden || !stream) return;
      const [track] = stream.getVideoTracks();
      if (!track || track.readyState === "ended") restart();
      else videoRef.current?.play().catch(() => {});
    };

    async function start() {
      if (!navigator.mediaDevices?.getUserMedia) {
        // Only offered on https (and localhost).
        setProblem("This browser won't open the camera here. Use the site's https address.");
        return;
      }

      try {
        stream = await navigator.mediaDevices.getUserMedia({
          audio: false,
          video: {
            facingMode: { ideal: "environment" },
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
        });
      } catch (error) {
        if (!cancelled) setProblem(explain(error));
        return;
      }

      const video = videoRef.current;
      if (cancelled || !video) {
        stream.getTracks().forEach((track) => track.stop());
        return;
      }

      stream.getVideoTracks()[0]?.addEventListener("ended", restart);
      video.srcObject = stream;
      // Rejects if the element is replaced mid-start; the next effect run plays.
      await video.play().catch(() => {});

      const decode = await makeDecoder();
      if (cancelled) return;
      setProblem(null);
      setLive(true);

      const tick = async () => {
        if (cancelled) return;
        if (!document.hidden && video.readyState >= video.HAVE_CURRENT_DATA) {
          try {
            const text = await decode(video);
            const now = Date.now();
            if (text && !cancelled) {
              const repeat = text === last.text && now - last.seenAt < SAME_CODE_GAP;
              last.text = text;
              last.seenAt = now;
              if (!repeat) onReadRef.current(text);
            }
          } catch {
            // One bad frame isn't worth stopping for; the next tick tries again.
          }
        }
        timer = setTimeout(tick, FRAME_INTERVAL);
      };
      tick();
    }

    start();
    document.addEventListener("visibilitychange", onVisible);

    return () => {
      cancelled = true;
      clearTimeout(timer);
      document.removeEventListener("visibilitychange", onVisible);
      stream?.getTracks().forEach((track) => {
        track.removeEventListener("ended", restart);
        track.stop();
      });
    };
  }, [attempt]);

  if (problem) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-xl border border-border bg-card/40 px-6 py-8 text-center">
        <p className="text-sm text-foreground">{problem}</p>
        <p className="max-w-sm text-xs text-muted-foreground">
          Until then, scan the attendee&apos;s code with this phone&apos;s own camera app and
          open the link, or search for them below by name or backup code.
        </p>
        <Button
          size="sm"
          variant="outline"
          onClick={() => {
            setProblem(null);
            setAttempt((value) => value + 1);
          }}
        >
          <RotateCw className="size-3.5" />
          Try again
        </Button>
      </div>
    );
  }

  return (
    <div className="relative mx-auto aspect-square w-full max-w-sm overflow-hidden rounded-xl border border-border bg-black">
      {/* `playsInline` and `muted` are what let iOS play a camera stream inline
          without a tap; without them it opens full screen or stays black. */}
      <video ref={videoRef} playsInline muted autoPlay className="size-full object-cover" />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-[14%] rounded-2xl border-2 border-[var(--ring)]/70"
      />
      {!live && (
        <p className="absolute inset-0 flex items-center justify-center text-xs text-muted-foreground">
          Starting camera…
        </p>
      )}
    </div>
  );
}
