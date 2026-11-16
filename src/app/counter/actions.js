"use server";

import { revalidatePath } from "next/cache";
import { requireAccess } from "@/lib/auth";
import { getSql, run } from "@/lib/db";
import { QUERIES } from "@/lib/queries";
import { calculateFine } from "@/lib/fines";

const isPositiveId = (value) => /^[1-9][0-9]*$/.test(value);

async function runInTransaction(tx, id, params = []) {
  const query = QUERIES[id];
  if (!query || query.params.length !== params.length) {
    throw new Error(`Invalid registered transaction query: ${id}`);
  }
  return tx.unsafe(query.text, params);
}

export async function searchBags(_previousState, formData) {
  await requireAccess(["staff"]);

  const rawNumber = String(formData.get("bag_number") ?? "").trim();
  const bagNumber = Number(rawNumber);
  if (!/^[0-9]+$/.test(rawNumber) || !Number.isSafeInteger(bagNumber) || bagNumber < 1) {
    return {
      searched: true,
      error: "Enter a positive whole-number bag number.",
      results: [],
    };
  }

  try {
    const rows = await run("R01", [bagNumber]);
    return {
      searched: true,
      error: null,
      results: rows.map((row) => ({
        student_id: row.student_id,
        bag_prefix: row.bag_prefix,
        bag_number: row.bag_number,
        full_name: row.full_name,
        bag_verified_at: row.bag_verified_at
          ? new Date(row.bag_verified_at).toISOString()
          : null,
      })),
    };
  } catch (error) {
    console.error("Counter bag lookup failed", error);
    return {
      searched: true,
      error: "Bag lookup could not be completed. Please try again.",
      results: [],
    };
  }
}

export async function verifyBag(_previousState, formData) {
  const { staff } = await requireAccess(["staff"]);
  const rawStudentId = String(formData.get("student_id") ?? "").trim();
  if (!isPositiveId(rawStudentId) || !Number.isSafeInteger(Number(rawStudentId))) {
    return { error: "Select a valid bag before verifying it.", studentId: null };
  }

  const studentId = Number(rawStudentId);
  try {
    const rows = await run("W22", [studentId, staff.staff_id]);
    if (rows.length === 0) {
      return {
        error: "This bag is already verified or is no longer available.",
        studentId,
      };
    }

    revalidatePath("/counter");
    return {
      error: null,
      studentId,
      verified: true,
      verifiedAt: new Date(rows[0].bag_verified_at).toISOString(),
    };
  } catch (error) {
    console.error("Counter bag verification failed", error);
    return {
      error: "Bag verification could not be saved. Please try again.",
      studentId,
    };
  }
}

export async function receiveOrder(_previousState, formData) {
  const { staff } = await requireAccess(["staff"]);

  const rawOrderId = String(formData.get("order_id") ?? "").trim();
  const rawCount = String(formData.get("verified_count") ?? "").trim();
  const orderId = Number(rawOrderId);
  const verifiedCount = Number(rawCount);

  if (!isPositiveId(rawOrderId) || !Number.isSafeInteger(orderId)) {
    return { error: "This order could not be identified. Refresh the queue and try again." };
  }
  if (!/^[0-9]+$/.test(rawCount) || !Number.isInteger(verifiedCount) || verifiedCount < 0 || verifiedCount > 100) {
    return {
      error: "Enter a whole-number count from 0 to 100.",
      orderId,
      verifiedCount: rawCount,
    };
  }

  try {
    const outcome = await getSql().begin(async (tx) => {
      const policies = await runInTransaction(tx, "R20");
      const policy = policies[0];
      if (!policy) return { kind: "no-policy" };

      const fineAmount = calculateFine(verifiedCount, policy);
      const updatedOrders = await runInTransaction(tx, "W20", [
        orderId,
        verifiedCount,
        staff.staff_id,
        policy.policy_id,
      ]);
      if (updatedOrders.length === 0) return { kind: "stale-order" };

      if (fineAmount > 0) {
        await runInTransaction(tx, "W21", [orderId, fineAmount]);
      }

      return { kind: "received", fineAmount };
    });

    if (outcome.kind === "no-policy") {
      return { error: "No active fine policy is available. Ask an administrator to check the policy setup." };
    }
    if (outcome.kind === "stale-order") {
      revalidatePath("/counter");
      return { error: "This order was already processed. The queue has been refreshed." };
    }

    revalidatePath("/counter");
    return {
      error: null,
      success: true,
      orderId,
      verifiedCount,
      fineAmount: outcome.fineAmount,
    };
  } catch (error) {
    console.error("Counter order receipt failed", error);
    return {
      error: "The order could not be received. No changes were saved; please try again.",
      orderId,
      verifiedCount: rawCount,
    };
  }
}
