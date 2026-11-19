"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAccess } from "@/lib/auth";
import { run } from "@/lib/db";
import { parseClothesCount, MAX_CLOTHES } from "@/lib/clothes-count";

export async function submitLaundry(_previous, formData) {
  const { student } = await requireAccess(["student"]);

  const rawCount = String(formData.get("declared_count") ?? "").trim();

  const declaredCount = parseClothesCount(rawCount);

  const values = {
    declared_count: rawCount,
  };

  const fail = (error) => ({
    error,
    values,
    success: false,
  });

  // Validate the clothes count
  if (declaredCount === null) {
    return fail(`Enter a valid number of clothes between 1 and ${MAX_CLOTHES}.`);
  }

  let orderId;
  try {
    // Check and insert in one database query
    const result = await run("W10", [student.student_id, declaredCount]);

    // Zero rows means an active order already exists
    if (result.length === 0) {
      return fail(
        "You already have an active laundry order. Wait until it is collected before submitting another.",
      );
    }

    // Refresh the student pages, then show the new order
    revalidatePath("/student");
    orderId = result[0].order_id;
  } catch (error) {
    console.error("Could not submit laundry order:", error);

    return fail("Something went wrong. Please try again.");
  }

  // redirect() works by throwing, so it must stay outside the try/catch above
  redirect(`/student/orders/${orderId}?new=1`);
}

// Cancel a hand-in before staff count it (W11). The query itself checks the order is
// this student's and still SUBMITTED, so the order id from the form cannot be misused.
export async function cancelOrder(formData) {
  const { student } = await requireAccess(["student"]);
  const orderId = Number(formData.get("order_id"));

  if (!Number.isSafeInteger(orderId) || orderId < 1) {
    redirect("/student/orders");
  }

  let rows;
  try {
    rows = await run("W11", [orderId, student.student_id]);
  } catch (error) {
    console.error("Could not cancel laundry order:", error);
    redirect(`/student/orders/${orderId}?error=cancel-failed`);
  }

  if (rows.length === 0) {
    redirect(`/student/orders/${orderId}?error=already-counted`);
  }

  revalidatePath("/student");
  redirect(`/student/orders/${orderId}?cancelled=1`);
}

// Fix the clothes count on a hand-in that staff have not counted yet (W12).
// Used with useActionState, so it returns an error message instead of redirecting on bad input.
export async function changeCount(_previous, formData) {
  const { student } = await requireAccess(["student"]);
  const orderId = Number(formData.get("order_id"));
  const count = parseClothesCount(formData.get("declared_count"));

  if (!Number.isSafeInteger(orderId) || orderId < 1) {
    return { error: "This order can't be changed." };
  }
  if (count === null) {
    return { error: `Enter a number of clothes between 1 and ${MAX_CLOTHES}.` };
  }

  let rows;
  try {
    rows = await run("W12", [orderId, student.student_id, count]);
  } catch (error) {
    console.error("Could not change clothes count:", error);
    return { error: "That didn't save. Try again." };
  }

  if (rows.length === 0) {
    redirect(`/student/orders/${orderId}?error=already-counted`);
  }

  revalidatePath("/student");
  redirect(`/student/orders/${orderId}?changed=1`);
}
