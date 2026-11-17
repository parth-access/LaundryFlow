
"use server";

import { redirect } from "next/navigation";
import { requireAccess } from "@/lib/auth";
import { run } from "@/lib/db";

// Each button says which tab it was on, so we send staff back there.
// Only these three pages are allowed, so a form can never redirect elsewhere.
const PAGES = ["/fines/wash", "/fines/pickup", "/fines/unpaid"];
function getPage(formData) {
  const page = String(formData.get("return_to") ?? "");
  return PAGES.includes(page) ? page : PAGES[0];
}

function getOrderId(formData) {
  const value = String(formData.get("order_id") ?? "").trim();

  if (!/^[1-9][0-9]*$/.test(value)) {
    return null;
  }

  const orderId = Number(value);

  return Number.isSafeInteger(orderId) ? orderId : null;
}

async function updateOrder(queryId, params, page, done) {
  let rows;

  try {
    rows = await run(queryId, params);
  } catch (error) {
    console.error(`LaundryFlow ${queryId} failed`, error);
    redirect(`${page}?error=save-failed`);
  }

  if (!rows || rows.length === 0) {
    redirect(`${page}?error=already-updated`);
  }

  redirect(`${page}?done=${done}`);
}

export async function markReady(formData) {
  await requireAccess(["staff"]);

  const orderId = getOrderId(formData);

  if (!orderId) {
    redirect(`${getPage(formData)}?error=invalid-order`);
  }

  await updateOrder("W30", [orderId], getPage(formData), "ready");
}

export async function markCollected(formData) {
  const { staff } = await requireAccess(["staff"]);

  const orderId = getOrderId(formData);

  if (!orderId) {
    redirect(`${getPage(formData)}?error=invalid-order`);
  }

  await updateOrder("W31", [orderId, staff.staff_id], getPage(formData), "collected");
}

export async function markPaid(formData) {
  await requireAccess(["staff"]);

  const orderId = getOrderId(formData);

  if (!orderId) {
    redirect(`${getPage(formData)}?error=invalid-order`);
  }

  await updateOrder("W32", [orderId], getPage(formData), "paid");
}

export async function waiveFine(formData) {
  const { staff } = await requireAccess(["staff"]);

  const orderId = getOrderId(formData);

  if (!orderId) {
    redirect(`${getPage(formData)}?error=invalid-order`);
  }

  const reason = String(formData.get("waiver_reason") ?? "").trim();

  if (reason.length < 3 || reason.length > 200) {
    redirect(`${getPage(formData)}?error=invalid-reason`);
  }

  await updateOrder("W33", [orderId, staff.staff_id, reason], getPage(formData), "waived");
}
