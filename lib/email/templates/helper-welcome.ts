import type { HelperRole } from "@/lib/helper-roles";
import type { WelcomeEmail } from "./layout";
import { mentorWelcomeEmail } from "./mentor-welcome";
import { volunteerWelcomeEmail } from "./volunteer-welcome";

/** Picks the letter for a role — the two share nothing but their shape. */
export function helperWelcomeEmail(fullName: string, role: HelperRole): WelcomeEmail {
  return role === "mentor" ? mentorWelcomeEmail(fullName) : volunteerWelcomeEmail(fullName);
}
