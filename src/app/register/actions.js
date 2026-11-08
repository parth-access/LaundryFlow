"use server";

import { redirect } from "next/navigation";
import { getAccess } from "@/lib/auth";
import { run } from "@/lib/db";

const ENROLLMENT = /^[0-9]{10}$/; // same rule as the CHECK in dbms/03_schema.sql

/**
 * Creates the student's profile. Called by the register form (useActionState).
 * Returns { error, values } to show a problem, or redirects on success.
 * The email always comes from the verified Google session, never from the form.
 */
export async function registerStudent(_previous, formData) {
  const access = await getAccess();
  if (access.kind === "anonymous") redirect("/login");
  if (access.kind === "denied") redirect("/login?error=not_allowed");
  if (access.kind !== "unregistered") redirect("/dashboard"); // already registered, or staff

  const values = {
    full_name: String(formData.get("full_name") ?? "").trim().replace(/\s+/g, " "),
    enrollment_no: String(formData.get("enrollment_no") ?? "").trim(),
    bag_prefix: String(formData.get("bag_prefix") ?? "").trim().toUpperCase(),
    bag_number: String(formData.get("bag_number") ?? "").trim(),
  };
  const fail = (error) => ({ error, values });

  if (values.full_name.length === 0 || values.full_name.length > 100) {
    return fail("Enter your full name (up to 100 characters).");
  }
  if (!ENROLLMENT.test(values.enrollment_no)) {
    return fail("Your enrollment number is exactly 10 digits, for example 2501010325.");
  }
  if (values.bag_prefix !== "B" && values.bag_prefix !== "G") {
    return fail("Choose B (boys) or G (girls) for your bag tag.");
  }
  if (!/^[0-9]{1,5}$/.test(values.bag_number) || Number(values.bag_number) < 1) {
    return fail("Your bag number is the number on your bag tag, for example 1054.");
  }

  try {
    await run("W02", [
      values.enrollment_no,
      values.full_name,
      access.email,
      values.bag_prefix,
      Number(values.bag_number),
    ]);
  } catch (error) {
    // 23505 = unique violation. Say which one, without leaking whose it is.
    if (error?.code === "23505") {
      if (error.constraint_name === "uq_students_bag") {
        return fail(
          "That bag tag is already registered. If it is really yours, tell the laundry staff and they will sort it out.",
        );
      }
      if (error.constraint_name === "students_enrollment_no_key") {
        return fail("That enrollment number is already registered.");
      }
      return fail("You are already registered. Go to your dashboard.");
    }
    console.error("could not register student", error);
    return fail("Something went wrong on our side. Please try again.");
  }

  redirect("/dashboard");
}
