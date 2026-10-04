import { encode } from "uqr";
import { backupCode, checkInUrl } from "@/lib/checkin";

/**
 * The attendee's check-in code.
 *
 * Drawn on the server as plain SVG, so it's in the HTML before any script runs
 * and there's nothing left to fail on the attendee's phone. It is always black
 * on a white tile with the full four-module quiet zone, whatever the theme
 * around it: scanners read dark-on-light, and a code drawn in the page's own
 * colours is the usual reason one won't scan.
 */
export default function CheckInQr({ userId }: { userId: string }) {
  const { data, size } = encode(checkInUrl(userId), { ecc: "M", border: 4 });

  // One rectangle per run of dark modules rather than per module: a fraction of
  // the markup, and no hairline seams between neighbours when it's scaled.
  let path = "";
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      if (!data[y][x]) continue;
      const start = x;
      while (x + 1 < size && data[y][x + 1]) x++;
      path += `M${start} ${y}h${x - start + 1}v1H${start}z`;
    }
  }

  return (
    <figure className="mt-6 flex flex-col items-center gap-3 border-t border-border pt-6">
      <svg
        role="img"
        aria-label="Your check-in QR code"
        viewBox={`0 0 ${size} ${size}`}
        shapeRendering="crispEdges"
        className="w-full max-w-64 rounded-xl bg-white"
      >
        <rect width={size} height={size} fill="#fff" />
        <path d={path} fill="#000" />
      </svg>
      <figcaption className="text-center text-sm text-muted-foreground">
        Show this at check-in. Take a screenshot now so it&apos;s ready at the door.
        <span className="mt-2 block">
          Backup code{" "}
          <span className="font-mono tracking-widest text-foreground">{backupCode(userId)}</span>
        </span>
      </figcaption>
    </figure>
  );
}
