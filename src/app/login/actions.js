"use server";

import { redirect } from "next/navigation";
import { createSupabaseServer } from "@/lib/supabase/server";
import { getSiteUrl } from "@/lib/site-url";

/** Starts Google sign-in: asks Supabase for the Google address, then sends the browser there. */
export async function signInWithGoogle() {
  const supabase = await createSupabaseServer();
  const siteUrl = await getSiteUrl();

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${siteUrl}/auth/callback`,
      // Always show Google's account chooser, so a shared laptop does not
      // silently reuse the previous person's Google account.
      queryParams: { prompt: "select_account" },
    },
  });

  if (error || !data?.url) {
    console.error("google sign-in could not start", error);
    redirect("/login?error=auth_failed");
  }
  redirect(data.url);
}
