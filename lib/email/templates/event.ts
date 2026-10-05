/** The facts of the weekend, shared by every letter and by the status page. */

import { goldLink } from "./layout";

export const EVENT = {
  dates: "October 10–11, 2026",
  venue: "College Center 3rd floor (ballroom), Orange Coast College",
  checkIn: "8:00 AM Saturday",
  ceremony: "9:00 AM",
  parking: "Free in Lot C, at Merrimac Way and Fairview Road",
  parkingUrl: "https://maps.app.goo.gl/7yWSvNarKVgHhJZW8",
  /** Same invite the site footer links to — see components/sections/Closer.tsx. */
  discordUrl: "https://discord.gg/Qn638vTzp2",
} as const;

/** `EVENT.parking` with the lot linked to its map pin — for HTML bodies only. */
export const PARKING_HTML = `Free in ${goldLink("Lot C", EVENT.parkingUrl)}, at Merrimac Way and Fairview Road`;
