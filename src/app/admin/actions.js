"use server";

// OWNER: Parth. Admin actions: add staff (W40), deactivate / reactivate (W41), new fine rule (W42).
// Every action checks the caller is an active ADMIN again: a form can be posted by anyone.
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireAccess } from "@/lib/auth";
import { run } from "@/lib/db";

async function requireAdmin() {
  const { staff } = await requireAccess(["staff"]);
  if (staff.role !== "ADMIN") redirect("/dashboard");
  return staff;
}

function done(message) {
  revalidatePath("/admin");
  redirect(`/admin?done=${message}`);
}

function fail(message) {
  redirect(`/admin?error=${message}`);
}

export async function addStaff(formData) {
  await requireAdmin();
  const fullName = String(formData.get("full_name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const role = String(formData.get("role") ?? "");

  if (!fullName || fullName.length > 100) fail("name");
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) fail("email");
  if (role !== "COUNTER" && role !== "ADMIN") fail("role");

  let rows;
  try {
    rows = await run("W40", [fullName, email, role]);
  } catch (error) {
    console.error("LaundryFlow W40 failed", error);
    fail("save-failed");
  }
  if (rows.length === 0) fail("staff-exists");
  done("staff-added");
}

export async function setStaffActive(formData) {
  const me = await requireAdmin();
  const staffId = Number(formData.get("staff_id"));
  const active = formData.get("is_active") === "true";
  if (!Number.isSafeInteger(staffId) || staffId < 1) fail("save-failed");
  if (staffId === me.staff_id) fail("self");

  let rows;
  try {
    rows = await run("W41", [staffId, active, me.staff_id]);
  } catch (error) {
    console.error("LaundryFlow W41 failed", error);
    fail("save-failed");
  }
  if (rows.length === 0) fail("save-failed");
  done(active ? "reactivated" : "deactivated");
}

export async function addPolicy(formData) {
  await requireAdmin();
  const from = String(formData.get("effective_from") ?? "");
  const freeLimit = Number(formData.get("free_limit"));
  const perExtra = Number(formData.get("fine_per_extra"));

  if (!/^\d{4}-\d{2}-\d{2}$/.test(from)) fail("date");
  if (!Number.isInteger(freeLimit) || freeLimit < 1 || freeLimit > 100) fail("limit");
  if (!Number.isFinite(perExtra) || perExtra < 0 || perExtra > 1000) fail("amount");

  let rows;
  try {
    rows = await run("W42", [from, freeLimit, perExtra.toFixed(2)]);
  } catch (error) {
    console.error("LaundryFlow W42 failed", error);
    fail("save-failed");
  }
  if (rows.length === 0) fail("policy-date");
  done("policy-added");
}
