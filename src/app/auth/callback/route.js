import { NextResponse } from "next/server";
import { createSupabaseServer } from "@/lib/supabase/server";
import { getAccess } from "@/lib/auth";
import { getSiteUrl } from "@/lib/site-url";

/**
 * Google sends the browser back here after sign-in, with a one-time `code`.
 * We swap the code for a session, then decide whether this account is allowed.
 * This is where the college-email rule is enforced, on the server: a student
 * cannot skip it by editing the login page.
 */
export async function GET(request) {
  const siteUrl = await getSiteUrl();
  const go = (path) => NextResponse.redirect(new URL(path, siteUrl));

  const code = new URL(request.url).searchParams.get("code");
  if (!code) return go("/login?error=auth_failed");

  const supabase = await createSupabaseServer();
  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) {
    console.error("could not exchange sign-in code", error.message);
    return go("/login?error=auth_failed");
  }

  const access = await getAccess();
  if (access.kind === "denied" || access.kind === "anonymous") {
    await supabase.auth.signOut(); // do not leave a session for a disallowed account
    return go("/login?error=not_allowed");
  }
  return go(access.kind === "unregistered" ? "/register" : "/dashboard");
}
