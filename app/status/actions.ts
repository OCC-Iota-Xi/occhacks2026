"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export interface WaiversSentState {
  ok: boolean;
  message?: string;
}

/**
 * Records the applicant's word that their signed waivers have been emailed.
 *
 * The write is `mark_waivers_sent()` (migration 0024), which acts on the
 * caller's own row and only when they've been accepted — applicants have no
 * update policy on `application_status`, so there's nothing to get wrong here
 * by passing an id.
 */
export async function markWaiversSent(): Promise<WaiversSentState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, message: "Your session ended. Sign in again and retry." };

  // The function answers whether it changed anything. "No" is not an error to
  // the database, but it is to the person who pressed the button: they aren't
  // accepted (or no longer are), or it was already recorded.
  const { data: changed, error } = await supabase.rpc("mark_waivers_sent");
  if (error) {
    return {
      ok: false,
      message: "We couldn't save that. Try again, or email hello@occhacks.com.",
    };
  }

  // Either way the page is re-read, so it shows where they really stand.
  revalidatePath("/status");
  if (changed === false) {
    return {
      ok: false,
      message:
        "Nothing was updated: this only applies once your application is accepted, and only once. If this page still looks out of date, reload it.",
    };
  }
  return { ok: true };
}
