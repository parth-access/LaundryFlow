// OWNER: Parth. Admin: staff accounts, fine policy, numbers at a glance.
// Your query ids: R40-R49, W40-W49 (in src/lib/queries.js). See TEAM.md for your task list.
import { Suspense } from "react";
import { redirect } from "next/navigation";
import { requireAccess } from "@/lib/auth";
import { run } from "@/lib/db";
import { money } from "@/components/ui";
import { AppPage } from "@/components/app-page";

export const metadata = { title: "Admin | LaundryFlow" };

export default function AdminPage() {
  return (
    <AppPage title="Admin" subtitle="Staff accounts and the fine rule.">
      <Suspense fallback={<p className="text-muted">Loading…</p>}>
        <Admin />
      </Suspense>
    </AppPage>
  );
}

async function Admin() {
  const { staff } = await requireAccess(["staff"]);
  if (staff.role !== "ADMIN") redirect("/dashboard"); // counter staff cannot open admin

  const [staffList, policies] = await Promise.all([run("R40"), run("R41")]);
  const current = policies[0];

  return (
    <div className="space-y-10">
      {/* TODO (Parth): numbers at a glance: orders today, waiting at counter, unpaid fines total (R42) */}

      {current && (
        <section className="rounded-3xl bg-peach-soft p-6 sm:p-8">
          <p className="text-sm text-muted">Fine rule in use</p>
          <p className="mt-1 font-display text-3xl font-semibold tracking-tight">
            {current.free_limit} free, then {money(current.fine_per_extra)} each
          </p>
          <p className="mt-1 text-sm text-muted">Since {new Date(current.effective_from).toISOString().slice(0, 10)}</p>
          {/* TODO (Parth): "New policy" form (W42). Never edit an old row: insert a new one with a later date,
              so old orders keep the rule they were counted under. */}
        </section>
      )}

      <section>
        <h2 className="mb-3 text-xl font-semibold">Staff <span className="text-muted">{staffList.length}</span></h2>
        <ul className="divide-y divide-line overflow-hidden rounded-2xl border border-line bg-white">
          {staffList.map((s) => (
            <li key={s.staff_id} className="flex items-center justify-between gap-4 px-5 py-4">
              <div className="min-w-0">
                <p className="font-medium">{s.full_name}</p>
                <p className="truncate text-sm text-muted">{s.email}</p>
              </div>
              <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium ${s.is_active ? (s.role === "ADMIN" ? "bg-ink text-white" : "bg-peach-soft text-ink") : "bg-zinc-100 text-muted"}`}>
                {s.is_active ? (s.role === "ADMIN" ? "Admin" : "Counter staff") : "Inactive"}
              </span>
              {/* TODO (Parth): "Deactivate" / "Reactivate" button (W41). Do not let an admin deactivate themselves. */}
            </li>
          ))}
        </ul>
        {/* TODO (Parth): "Add staff" form: name, Google email (lowercase), role (W40) */}
      </section>

      {policies.length > 1 && (
        <section>
          <h2 className="mb-3 text-xl font-semibold">Earlier rules</h2>
          <ul className="space-y-1 text-sm text-muted">
            {policies.slice(1).map((p) => (
              <li key={p.policy_id}>
                From {new Date(p.effective_from).toISOString().slice(0, 10)}: {p.free_limit} free, {money(p.fine_per_extra)} per extra
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
