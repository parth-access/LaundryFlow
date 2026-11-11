// OWNER: Parth. Admin: staff accounts, fine policy, numbers at a glance.
// Your query ids: R40-R49, W40-W49 (in src/lib/queries.js). See TEAM.md for your task list.
import { Suspense } from "react";
import { redirect } from "next/navigation";
import { requireAccess } from "@/lib/auth";
import { run } from "@/lib/db";
import { Page, Card, money } from "@/components/ui";

export const metadata = { title: "Admin | LaundryFlow" };

export default function AdminPage() {
  return (
    <Page title="Admin">
      <Suspense fallback={<p className="text-zinc-500">Loading...</p>}>
        <Admin />
      </Suspense>
    </Page>
  );
}

async function Admin() {
  const { staff } = await requireAccess(["staff"]);
  if (staff.role !== "ADMIN") redirect("/dashboard"); // counter staff cannot open admin

  const [staffList, policies] = await Promise.all([run("R40"), run("R41")]); // working examples

  return (
    <>
      {/* TODO (Parth): numbers at a glance: orders today, waiting at counter, unpaid fines total (R42) */}
      <Card>
        <p className="font-mono text-sm text-zinc-500">TODO: today&apos;s numbers go here.</p>
      </Card>

      <Card>
        <h2 className="mb-3 text-lg font-medium">Staff ({staffList.length})</h2>
        <ul className="divide-y divide-zinc-200 dark:divide-zinc-800">
          {staffList.map((s) => (
            <li key={s.staff_id} className="flex items-center justify-between py-2">
              <span>
                {s.full_name} <span className="text-sm text-zinc-500">{s.email}</span>
              </span>
              <span className="text-sm">
                {s.role.toLowerCase()} {s.is_active ? "" : "· inactive"}
              </span>
              {/* TODO (Parth): "Deactivate" / "Reactivate" button (W41). Do not let an admin deactivate themselves. */}
            </li>
          ))}
        </ul>
        {/* TODO (Parth): "Add staff" form: name, Google email (lowercase), role (W40) */}
      </Card>

      <Card>
        <h2 className="mb-3 text-lg font-medium">Fine policy</h2>
        <ul className="space-y-1 text-sm">
          {policies.map((p) => (
            <li key={p.policy_id}>
              From {String(p.effective_from).slice(0, 10)}: {p.free_limit} clothes free, {money(p.fine_per_extra)} per extra
            </li>
          ))}
        </ul>
        {/* TODO (Parth): "New policy" form (W42). Never edit an old row: insert a new one with a later date,
            so old orders keep the rule they were counted under. */}
      </Card>
    </>
  );
}
