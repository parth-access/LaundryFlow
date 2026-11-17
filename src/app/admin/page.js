// OWNER: Parth. Admin: numbers at a glance (R42), staff accounts (R40, W40, W41), fine policy (R41, W42).
import { Suspense } from "react";
import { connection } from "next/server";
import { redirect } from "next/navigation";
import { requireAccess } from "@/lib/auth";
import { run } from "@/lib/db";
import { Alert, money } from "@/components/ui";
import { AppPage } from "@/components/app-page";
import SubmitButton from "@/app/fines/submit-button";
import { addStaff, setStaffActive, addPolicy } from "./actions";

export const metadata = { title: "Admin | LaundryFlow" };

const ERRORS = {
  name: "Enter the staff member's name.",
  email: "Enter a valid Google email address.",
  role: "Choose a role.",
  "staff-exists": "That email is already on the staff list.",
  self: "You can't deactivate your own account. Ask another admin.",
  date: "Choose the date the new rule starts.",
  limit: "Free clothes must be a whole number from 1 to 100.",
  amount: "Fine per extra cloth must be between Rs 0 and Rs 1000.",
  "policy-date": "A rule can't start in the past, or there is already a rule on that date. Pick another date.",
  "save-failed": "That didn't save. Try again.",
};
const DONE = {
  "staff-added": "Staff member added. They can sign in with that Google account now.",
  deactivated: "Account deactivated. They can no longer sign in.",
  reactivated: "Account reactivated.",
  "policy-added": "New fine rule saved.",
};

const input =
  "w-full rounded-xl border border-field bg-white px-4 py-2.5 text-ink placeholder:text-zinc-400 focus:border-ink focus:outline-none";
const label = "mb-1.5 block text-sm font-medium";

export default function AdminPage({ searchParams }) {
  return (
    <AppPage title="Admin" subtitle="Staff accounts and the fine rule.">
      <Suspense fallback={<p className="text-muted">Loading…</p>}>
        <Admin searchParams={searchParams} />
      </Suspense>
    </AppPage>
  );
}

async function Admin({ searchParams }) {
  const { staff: me } = await requireAccess(["staff"]);
  if (me.role !== "ADMIN") redirect("/dashboard"); // counter staff cannot open admin

  await connection();
  const { error, done } = await searchParams;
  const today = new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" }); // YYYY-MM-DD

  const [staffList, policies, [numbers]] = await Promise.all([run("R40"), run("R41"), run("R42")]);
  const current = policies.find((p) => toDate(p.effective_from) <= today);
  const upcoming = policies.filter((p) => toDate(p.effective_from) > today).reverse();
  const earlier = policies.filter((p) => toDate(p.effective_from) <= today && p !== current);

  return (
    <div className="space-y-12">
      {ERRORS[error] && <Alert>{ERRORS[error]}</Alert>}
      {DONE[done] && <Alert kind="success">{DONE[done]}</Alert>}

      <section className="grid gap-3 sm:grid-cols-3">
        <Stat value={numbers.orders_today} label="Bags handed in today" />
        <Stat value={numbers.waiting} label="Waiting to be counted" />
        <Stat value={money(numbers.unpaid_total)} label={`Unpaid across ${numbers.unpaid_count} ${numbers.unpaid_count === 1 ? "fine" : "fines"}`} />
      </section>

      <section>
        <h2 className="mb-3 text-xl font-semibold">
          Staff <span className="text-muted">{staffList.length}</span>
        </h2>
        <ul className="divide-y divide-line overflow-hidden rounded-2xl border border-line bg-white">
          {staffList.map((s) => {
            const isMe = s.staff_id === me.staff_id;
            return (
              <li key={s.staff_id} className={`flex flex-wrap items-center justify-between gap-3 px-5 py-4 ${s.is_active ? "" : "bg-zinc-50"}`}>
                <div className="min-w-0">
                  <p className={`font-medium ${s.is_active ? "" : "text-muted"}`}>
                    {s.full_name} {isMe && <span className="text-sm font-normal text-muted">(you)</span>}
                  </p>
                  <p className="truncate text-sm text-muted">{s.email}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${s.is_active ? (s.role === "ADMIN" ? "bg-ink text-white" : "bg-peach-soft text-ink") : "bg-zinc-200 text-muted"}`}>
                    {s.is_active ? (s.role === "ADMIN" ? "Admin" : "Counter staff") : "Inactive"}
                  </span>
                  {!isMe && (
                    <form action={setStaffActive}>
                      <input type="hidden" name="staff_id" value={s.staff_id} />
                      <input type="hidden" name="is_active" value={s.is_active ? "false" : "true"} />
                      <SubmitButton variant="secondary" className="px-3 py-1.5 text-sm">
                        {s.is_active ? "Deactivate" : "Reactivate"}
                      </SubmitButton>
                    </form>
                  )}
                </div>
              </li>
            );
          })}
        </ul>

        <form action={addStaff} className="mt-4 rounded-2xl border border-line bg-white p-5">
          <h3 className="font-semibold">Add staff</h3>
          <p className="mt-1 text-sm text-muted">They sign in with this Google account. Any Google account works for staff.</p>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="full_name" className={label}>Name</label>
              <input id="full_name" name="full_name" required maxLength={100} className={input} placeholder="Ramesh Kumar" />
            </div>
            <div>
              <label htmlFor="email" className={label}>Google email</label>
              <input id="email" name="email" type="email" required className={input} placeholder="name@gmail.com" autoCapitalize="none" />
            </div>
          </div>
          <div className="mt-4 flex flex-wrap items-end justify-between gap-4">
            <fieldset>
              <legend className={label}>Role</legend>
              <div className="flex gap-4 text-sm">
                <label className="flex items-center gap-2"><input type="radio" name="role" value="COUNTER" defaultChecked className="accent-ink" /> Counter staff</label>
                <label className="flex items-center gap-2"><input type="radio" name="role" value="ADMIN" className="accent-ink" /> Admin</label>
              </div>
            </fieldset>
            <SubmitButton>Add staff</SubmitButton>
          </div>
        </form>
      </section>

      <section>
        <h2 className="mb-3 text-xl font-semibold">Fine rule</h2>
        {current && (
          <div className="rounded-3xl bg-peach-soft p-6 sm:p-8">
            <p className="text-sm text-muted">In use since {current.effective_from && toDate(current.effective_from)}</p>
            <p className="mt-1 font-display text-3xl font-semibold tracking-tight">
              {current.free_limit} free, then {money(current.fine_per_extra)} each
            </p>
          </div>
        )}
        {upcoming.map((p) => (
          <p key={p.policy_id} className="mt-3 rounded-xl border border-line bg-white px-4 py-3 text-sm">
            From <strong>{toDate(p.effective_from)}</strong>: {p.free_limit} free, then {money(p.fine_per_extra)} each
          </p>
        ))}

        <form action={addPolicy} className="mt-4 rounded-2xl border border-line bg-white p-5">
          <h3 className="font-semibold">New rule</h3>
          <p className="mt-1 text-sm text-muted">
            Old rules are kept, so bags already counted keep the fine they were given.
          </p>
          <div className="mt-4 grid gap-4 sm:grid-cols-3">
            <div>
              <label htmlFor="effective_from" className={label}>Starts on</label>
              <input id="effective_from" name="effective_from" type="date" required min={today} defaultValue={today} className={input} />
            </div>
            <div>
              <label htmlFor="free_limit" className={label}>Free clothes</label>
              <input id="free_limit" name="free_limit" type="number" required min={1} max={100} defaultValue={current?.free_limit ?? 10} className={input} />
            </div>
            <div>
              <label htmlFor="fine_per_extra" className={label}>Rs per extra</label>
              <input id="fine_per_extra" name="fine_per_extra" type="number" required min={0} max={1000} step="0.5" defaultValue={Number(current?.fine_per_extra ?? 5)} className={input} />
            </div>
          </div>
          <div className="mt-4 flex justify-end">
            <SubmitButton>Save rule</SubmitButton>
          </div>
        </form>

        {earlier.length > 0 && (
          <details className="mt-4 text-sm text-muted">
            <summary className="cursor-pointer">Earlier rules ({earlier.length})</summary>
            <ul className="mt-2 space-y-1">
              {earlier.map((p) => (
                <li key={p.policy_id}>
                  From {toDate(p.effective_from)}: {p.free_limit} free, {money(p.fine_per_extra)} per extra
                </li>
              ))}
            </ul>
          </details>
        )}
      </section>
    </div>
  );
}

function Stat({ value, label }) {
  return (
    <div className="rounded-2xl border border-line bg-white p-5">
      <p className="font-display text-3xl font-semibold">{value}</p>
      <p className="mt-1 text-sm text-muted">{label}</p>
    </div>
  );
}

// Postgres DATE arrives as a JS Date at UTC midnight; keep the calendar date as written.
function toDate(value) {
  if (typeof value === "string") return value.slice(0, 10);
  return value.toISOString().slice(0, 10);
}
