"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { after } from "next/server";
import { sendHackerWelcome, sendHelperWelcome } from "@/lib/email/welcome";
import { HELPER_TABLE, type HelperRole, type HelperTable } from "@/lib/helper-roles";
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
/**
 * The questions both roles answer. `role` isn't in the list — it comes from the
 * page, not the form.
 */
const HELPER_REQUIRED = ["name", "dob", "email", "phone", "shirt"] as const;

/**
 * The mentor form's own questions. Only `expertise` is required — the résumé
 * and the reason for mentoring are both optional.
 */
const MENTOR_REQUIRED = ["expertise"] as const;

function requiredFor(role: HelperRole): readonly string[] {
  return role === "mentor" ? [...HELPER_REQUIRED, ...MENTOR_REQUIRED] : HELPER_REQUIRED;
}

/** Trimmed string, or null — a draft stores an unanswered question as null. */
function reader(formData: FormData) {
  const field = (key: string) => String(formData.get(key) ?? "").trim();
  return {
    field,
    nullable: (key: string) => field(key) || null,
    list: (key: string) =>
      formData
        .getAll(key)
        .map((v) => String(v).trim())
        .filter(Boolean),
  };
}

/**
 * The row as the form currently stands, complete or not.
 *
 * Both the autosave and the final submit write through here, so a half-filled
 * draft and a finished sign-up round-trip identically — the only difference is
 * that submit stamps `completed_at` and validates first. Every value is read
 * from the posted form rather than merged onto the stored row, which is safe
 * because all four steps stay mounted and post together on every save.
 */
function hackerRow(formData: FormData) {
  const { field, nullable, list } = reader(formData);
  // Out-of-range or half-picked ranks stay null so a mid-edit autosave can't
  // trip `registrations_ranks_distinct`.
  const rank = (key: string) => {
    const n = Number(field(key));
    return Number.isInteger(n) && n >= 1 && n <= 3 ? n : null;
  };

  return {
    email: nullable("email"),
    full_name: nullable("name"),
    school: nullable("school"),
    major: nullable("major"),
    occ_id: nullable("occ_id"),
    dob: nullable("dob"),
    phone: nullable("phone"),
    // Unanswered is null, not "no".
    iota_xi: field("iota_xi") ? field("iota_xi") === "yes" : null,
    shirt: nullable("shirt"),
    needs: nullable("needs"),
    classes: list("classes"),
    eligibility_agreed: !!formData.get("eligibility"),
    email_opt_in: !!formData.get("email_opt_in"),
    rank_entertainment: rank("rank_entertainment"),
    rank_education: rank("rank_education"),
    rank_productivity: rank("rank_productivity"),
    updated_at: new Date().toISOString(),
  };
}

/** The answers both helper forms ask for, shared by the two builders below. */
function helperRow(formData: FormData) {
  const { nullable, list } = reader(formData);
  return {
    email: nullable("email"),
    full_name: nullable("name"),
    dob: nullable("dob"),
    phone: nullable("phone"),
    availability: list("availability"),
    expertise: nullable("expertise"),
    shirt: nullable("shirt"),
    needs: nullable("needs"),
    eligibility_agreed: !!formData.get("eligibility"),
    email_opt_in: !!formData.get("email_opt_in"),
    updated_at: new Date().toISOString(),
  };
}

/** A `volunteers` row — the shared answers plus the OCC student ID. */
function volunteerRow(formData: FormData) {
  const { nullable } = reader(formData);
  return { ...helperRow(formData), occ_id: nullable("occ_id") };
}

/**
 * A `mentors` row. No `occ_id`: that question is on the volunteer form only,
 * and the column doesn't exist here. `resume_path` is the Storage object the
 * browser already uploaded, never the file itself.
 */
function mentorRow(formData: FormData) {
  const { nullable } = reader(formData);
  return {
    ...helperRow(formData),
    resume_path: nullable("resume_path"),
    mentor_reason: nullable("mentor_reason"),
  };
}

/**
 * Autosave. Writes whatever is filled in so far and stops there: no validation,
 * no `completed_at`, and crucially no welcome email — that stays on the submit
 * path, or everyone would be welcomed as soon as they typed their name.
 *
 * Failures are deliberately quiet. An autosave that can't reach the network
 * shouldn't interrupt someone mid-sentence, and the browser-side draft is still
 * holding the same answers.
 */
async function saveDraft(
  table: "hackers" | HelperTable,
  row: object
): Promise<{ ok: boolean }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  // No redirect here: this runs in the background, and bouncing someone to the
  // sign-in page mid-keystroke would throw away what they were typing.
  if (!user) return { ok: false };

  const { error } = await supabase
    .from(table)
    .upsert({ user_id: user.id, ...row }, { onConflict: "user_id" });

  if (error) console.error(`[draft] ${table} autosave failed:`, error);
  return { ok: !error };
}

export async function saveRegistrationDraft(formData: FormData) {
  return saveDraft("hackers", hackerRow(formData));
}

// One per role rather than a single action taking the role as an argument:
// a server action is a public endpoint, and the role decides which table gets
// written. Binding it here keeps it out of reach of the request body.
export async function saveVolunteerDraft(formData: FormData) {
  return saveDraft(HELPER_TABLE.volunteer, volunteerRow(formData));
}

export async function saveMentorDraft(formData: FormData) {
  return saveDraft(HELPER_TABLE.mentor, mentorRow(formData));
}

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
  if (!formData.get("email_opt_in")) {
    return { ok: false, message: "please agree to receive event updates by email." };
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

  const { error } = await supabase.from("hackers").upsert(
    {
      user_id: user.id,
      ...hackerRow(formData),
      // Promotes the row from draft to finished sign-up.
      completed_at: new Date().toISOString(),
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

/**
 * Upserts the signed-in user's sign-up for one role. Volunteering and mentoring
 * are separate commitments in separate tables, so filling in the other form
 * adds a row there rather than replacing this one.
 */
async function submitHelper(
  role: HelperRole,
  formData: FormData
): Promise<RegistrationState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/signin");

  const field = (key: string) => String(formData.get(key) ?? "").trim();

  for (const key of requiredFor(role)) {
    if (!field(key)) {
      return { ok: false, message: "please fill in every required field." };
    }
  }
  if (!formData.get("eligibility")) {
    return { ok: false, message: "please confirm the eligibility checkbox." };
  }
  if (!formData.get("email_opt_in")) {
    return { ok: false, message: "please agree to receive event updates by email." };
  }
  if (!isOldEnough(field("dob"))) {
    return { ok: false, message: UNDER_18_MESSAGE };
  }

  const availability = formData.getAll("availability").map(String);
  if (availability.length === 0) {
    return { ok: false, message: "pick at least one time period you're available." };
  }

  const { error } = await supabase.from(HELPER_TABLE[role]).upsert(
    {
      user_id: user.id,
      ...(role === "mentor" ? mentorRow(formData) : volunteerRow(formData)),
      completed_at: new Date().toISOString(),
    },
    { onConflict: "user_id" }
  );

  if (error) {
    console.error(`${role} upsert failed:`, error);
    return { ok: false, message: "something went wrong saving your sign-up — try again." };
  }

  // Same as the hacker flow: fire after the response, first save only. The
  // claim is per table, so someone who does both gets one email for each.
  const email = field("email");
  const fullName = field("name");
  after(() => sendHelperWelcome(supabase, role, user.id, email, fullName));

  return { ok: true, message: "" };
}

export async function submitVolunteer(
  _prev: RegistrationState,
  formData: FormData
): Promise<RegistrationState> {
  return submitHelper("volunteer", formData);
}

export async function submitMentor(
  _prev: RegistrationState,
  formData: FormData
): Promise<RegistrationState> {
  return submitHelper("mentor", formData);
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
