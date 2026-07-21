"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export interface RegistrationState {
  ok: boolean;
  message: string;
}

const REQUIRED = ["name", "school", "track", "team", "experience", "shirt"] as const;

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

  for (const key of REQUIRED) {
    if (!field(key)) {
      return { ok: false, message: "please fill in every required field." };
    }
  }
  if (!formData.get("eligibility")) {
    return { ok: false, message: "please confirm the eligibility checkbox." };
  }

  const { error } = await supabase.from("registrations").upsert(
    {
      user_id: user.id,
      email: user.email,
      full_name: field("name"),
      school: field("school"),
      track: field("track"),
      team: field("team"),
      experience: field("experience"),
      shirt: field("shirt"),
      diet: field("diet") || null,
      notes: field("notes") || null,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id" }
  );

  if (error) {
    return { ok: false, message: "something went wrong saving your registration — try again." };
  }

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
