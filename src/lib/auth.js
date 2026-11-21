import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { createSupabaseServer } from "./supabase/server.js";
import { run } from "./db.js";
import { resolveAccess } from "./access.js";
import { normalizeEmail } from "./email-rules.js";

/**
 * Who is the current visitor? Returns one of:
 *   { kind: "anonymous" }                      not signed in
 *   { kind: "staff", staff, name }             on the staff list
 *   { kind: "student", student, name }         registered student
 *   { kind: "unregistered", email, name }      college email, profile not filled in yet
 *   { kind: "denied", reason }                 signed in, but not allowed
 *
 * Reads cookies, so call it inside a <Suspense> boundary (Cache Components rule).
 *
 * Wrapped in React cache(): the top bar and the page both ask "who is this?" while
 * one request is being rendered, and cache() makes them share one answer, so the
 * Supabase check and the two lookups run once per request instead of twice.
 */
export const getAccess = cache(async function getAccess() {
  // DEVELOPMENT ONLY: pretend to be signed in as DEV_LOGIN_EMAIL (set in .env.local),
  // so the team can build screens before Google sign-in is set up.
  // `next build` / `next start` run in production mode, where this is ignored.
  if (process.env.NODE_ENV === "development" && process.env.DEV_LOGIN_EMAIL) {
    await connection();
    const email = normalizeEmail(process.env.DEV_LOGIN_EMAIL);
    // two independent lookups: run them at the same time, not one after the other
    const [[staff], [student]] = await Promise.all([run("R05", [email]), run("R04", [email])]);
    return { ...resolveAccess({ email, staff: staff ?? null, student: student ?? null }), name: "Dev User" };
  }

  const supabase = await createSupabaseServer();
  // getUser() asks Supabase to confirm the session. Do not use getSession()
  // for decisions: it only reads the cookie, which the browser controls.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || !user.email) return { kind: "anonymous" };
  if (!user.email_confirmed_at) return { kind: "denied", reason: "unverified_email" };
  if (user.app_metadata?.provider !== "google") return { kind: "denied", reason: "not_google" };

  const email = normalizeEmail(user.email);
  const name = typeof user.user_metadata?.full_name === "string" ? user.user_metadata.full_name : "";
  // two independent lookups: run them at the same time, not one after the other
  const [[staff], [student]] = await Promise.all([run("R05", [email]), run("R04", [email])]);

  return { ...resolveAccess({ email, staff: staff ?? null, student: student ?? null }), name };
});

/**
 * Use at the top of a protected page. Sends visitors who may not be there away.
 * @param {Array<"student" | "staff">} allowed  which kinds may see this page
 */
export async function requireAccess(allowed = ["student", "staff"]) {
  const access = await getAccess();
  if (access.kind === "anonymous") redirect("/login");
  if (access.kind === "denied") redirect("/login?error=not_allowed");
  if (access.kind === "unregistered") redirect("/register");
  if (!allowed.includes(access.kind)) redirect("/dashboard");
  return access;
}
