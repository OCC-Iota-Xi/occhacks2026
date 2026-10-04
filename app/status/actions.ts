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

  const { error } = await supabase.rpc("mark_waivers_sent");
  if (error) {
    return {
      ok: false,
      message: "We couldn't save that. Try again, or email hello@occhacks.com.",
    };
  }

  revalidatePath("/status");
  return { ok: true };
}
