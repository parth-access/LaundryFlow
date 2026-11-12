
"use server";

import { redirect } from "next/navigation";
import { requireAccess } from "@/lib/auth";
import { run } from "@/lib/db";

function getOrderId(formData) {
  const value = String(formData.get("order_id") ?? "").trim();

  if (!/^[1-9][0-9]*$/.test(value)) {
    return null;
  }

  const orderId = Number(value);

  return Number.isSafeInteger(orderId) ? orderId : null;
}

async function updateOrder(queryId, params) {
  let rows;

  try {
    rows = await run(queryId, params);
  } catch (error) {
    console.error(`LaundryFlow ${queryId} failed`, error);
    redirect("/fines?error=save-failed");
  }

  if (!rows || rows.length === 0) {
    redirect("/fines?error=already-updated");
  }

  redirect("/fines");
}

export async function markReady(formData) {
  await requireAccess(["staff"]);

  const orderId = getOrderId(formData);

  if (!orderId) {
    redirect("/fines?error=invalid-order");
  }

  await updateOrder("W30", [orderId]);
}

export async function markCollected(formData) {
  const { staff } = await requireAccess(["staff"]);

  const orderId = getOrderId(formData);

  if (!orderId) {
    redirect("/fines?error=invalid-order");
  }

  await updateOrder("W31", [orderId, staff.staff_id]);
}

export async function markPaid(formData) {
  await requireAccess(["staff"]);

  const orderId = getOrderId(formData);

  if (!orderId) {
    redirect("/fines?error=invalid-order");
  }

  await updateOrder("W32", [orderId]);
}

export async function waiveFine(formData) {
  const { staff } = await requireAccess(["staff"]);

  const orderId = getOrderId(formData);

  if (!orderId) {
    redirect("/fines?error=invalid-order");
  }

  const reason = String(formData.get("waiver_reason") ?? "").trim();

  if (reason.length < 3 || reason.length > 200) {
    redirect("/fines?error=invalid-reason");
  }

  await updateOrder("W33", [
    orderId,
    staff.staff_id,
    reason,
  ]);
}
