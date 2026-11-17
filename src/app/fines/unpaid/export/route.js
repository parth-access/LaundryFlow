// OWNER: Dhruv. GET /fines/unpaid/export: unpaid fines as a CSV file for the warden.
// Staff only. Reuses R30, the same list as the Unpaid fines tab.
import { connection } from "next/server";
import { requireAccess } from "@/lib/auth";
import { run } from "@/lib/db";
import { toCsv } from "@/lib/csv";

export async function GET() {
  await connection();
  await requireAccess(["staff"]);

  const fines = await run("R30");
  const today = new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" });
  const csv = toCsv(
    ["Bag", "Student", "Fine (Rs)", "Counted on"],
    fines.map((f) => [
      `${f.bag_prefix}${f.bag_number}`,
      f.full_name,
      f.fine_amount,
      new Date(f.received_at).toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" }),
    ]),
  );

  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="unpaid-fines-${today}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
