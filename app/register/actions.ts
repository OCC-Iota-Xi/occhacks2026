"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { after } from "next/server";
import { sendHackerWelcome, sendVolunteerWelcome } from "@/lib/email/welcome";
import type { VolunteerRole } from "@/lib/email/templates";
import { isOldEnough, UNDER_18_MESSAGE } from "@/lib/eligibility";
import { createClient } from "@/lib/supabase/server";

export interface RegistrationState {
  ok: boolean;
  message: string;
}

const HACKER_REQUIRED = [
  "name",
  "school",
  "major",
  "dob",
  "email",
  "iota_xi",
  "shirt",
] as const;
const VOLUNTEER_REQUIRED = [
  "name",
  "dob",
  "email",
  "phone",
  "iota_xi",
  "role",
  "shirt",
] as const;

/** Upserts the signed-in user's registration (one row per account). */
export async function submitRegistration(
  _prev: RegistrationState,
  formData: FormData
): Promise<RegistrationState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/signin");

  const field = (key: string) => String(formData.get(key) ?? "").trim();
  for (const key of HACKER_REQUIRED) {
    if (!field(key)) {
      return { ok: false, message: "please fill in every required field." };
    }
  }
  if (!formData.get("eligibility")) {
    return { ok: false, message: "please confirm the eligibility checkbox." };
  }
  if (!isOldEnough(field("dob"))) {
    return { ok: false, message: UNDER_18_MESSAGE };
  }

  const ranks = {
    entertainment: Number(field("rank_entertainment")),
    education: Number(field("rank_education")),
    productivity: Number(field("rank_productivity")),
  };
  const rankValues = Object.values(ranks);
  if (new Set(rankValues).size !== 3 || rankValues.some((r) => r < 1 || r > 3)) {
    return { ok: false, message: "rank each track once, using 1, 2, and 3." };
  }

  const { error } = await supabase.from("registrations").upsert(
    {
      user_id: user.id,
      email: field("email"),
      full_name: field("name"),
      school: field("school"),
      major: field("major"),
      occ_id: field("occ_id") || null,
      dob: field("dob"),
      phone: field("phone") || null,
      iota_xi: field("iota_xi") === "yes",
      shirt: field("shirt"),
      needs: field("needs") || null,
      classes: formData.getAll("classes").map(String),
      rank_entertainment: ranks.entertainment,
      rank_education: ranks.education,
      rank_productivity: ranks.productivity,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id" }
  );

  if (error) {
    console.error("registration upsert failed:", error);
    return { ok: false, message: "something went wrong saving your registration — try again." };
  }

  // After the response, so a slow mail provider never delays the confirmation.
  // Only the first save sends — `sendHackerWelcome` no-ops on later edits.
  const email = field("email");
  const fullName = field("name");
  after(() => sendHackerWelcome(supabase, user.id, email, fullName));

  return { ok: true, message: "" };
}

/** Upserts the signed-in user's volunteer/mentor sign-up (one row per account). */
export async function submitVolunteer(
  _prev: RegistrationState,
  formData: FormData
): Promise<RegistrationState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/signin");

  const field = (key: string) => String(formData.get(key) ?? "").trim();

  for (const key of VOLUNTEER_REQUIRED) {
    if (!field(key)) {
      return { ok: false, message: "please fill in every required field." };
    }
  }
  if (!formData.get("eligibility")) {
    return { ok: false, message: "please confirm the eligibility checkbox." };
  }

  const availability = formData.getAll("availability").map(String);
  if (availability.length === 0) {
    return { ok: false, message: "pick at least one time period you're available." };
  }

  const { error } = await supabase.from("volunteers").upsert(
    {
      user_id: user.id,
      email: field("email"),
      full_name: field("name"),
      occ_id: field("occ_id") || null,
      dob: field("dob"),
      phone: field("phone"),
      iota_xi: field("iota_xi") === "yes",
      role: field("role"),
      availability,
      expertise: field("expertise") || null,
      shirt: field("shirt"),
      needs: field("needs") || null,
      classes: formData.getAll("classes").map(String),
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id" }
  );

  if (error) {
    console.error("volunteer upsert failed:", error);
    return { ok: false, message: "something went wrong saving your sign-up — try again." };
  }

  // Same as the hacker flow: fire after the response, first save only.
  const email = field("email");
  const fullName = field("name");
  const role = field("role") as VolunteerRole;
  after(() => sendVolunteerWelcome(supabase, user.id, email, fullName, role));

  return { ok: true, message: "" };
}

/** Adds the signed-in user to the notify-when-registration-opens list. */
export async function optInNotify(email?: string): Promise<{ ok: boolean }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/signin");

  const chosen = (email ?? "").trim() || user.email;

  const { error } = await supabase
    .from("notify_optins")
    .upsert({ user_id: user.id, email: chosen }, { onConflict: "user_id" });

  revalidatePath("/register");
  return { ok: !error };
}

/** Removes the signed-in user from the notify list. */
export async function optOutNotify(): Promise<{ ok: boolean }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/signin");

  const { error } = await supabase.from("notify_optins").delete().eq("user_id", user.id);

  revalidatePath("/register");
  return { ok: !error };
}

/** Signs the current user out and returns home. */
export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}
