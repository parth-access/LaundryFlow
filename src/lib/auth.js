import "server-only";
import { redirect } from "next/navigation";
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
 */
export async function getAccess() {
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
  const [staff] = await run("R05", [email]);
  const [student] = await run("R04", [email]);

  return { ...resolveAccess({ email, staff: staff ?? null, student: student ?? null }), name };
}

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
