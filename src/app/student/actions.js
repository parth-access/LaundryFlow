"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAccess } from "@/lib/auth";
import { run } from "@/lib/db";

export async function submitLaundry(_previous, formData) {
  const { student } = await requireAccess(["student"]);

  const rawCount = String(formData.get("declared_count") ?? "").trim();

  const declaredCount = Number(rawCount);

  const values = {
    declared_count: rawCount,
  };

  const fail = (error) => ({
    error,
    values,
    success: false,
  });

  // Validate the clothes count
  if (!/^[0-9]+$/.test(rawCount) || declaredCount < 1 || declaredCount > 100) {
    return fail("Enter a valid number of clothes between 1 and 100.");
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
