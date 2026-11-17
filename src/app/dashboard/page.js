// OWNER: Parth (UI). Staff home: today's work at a glance. Students go to their own home.
import { Suspense } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { requireAccess } from "@/lib/auth";
import { run } from "@/lib/db";
import { AppPage } from "@/components/app-page";
import { BagTag, ButtonLink, List, ListRow, money, when } from "@/components/ui";

export const metadata = { title: "Today | LaundryFlow" };

export default function DashboardPage() {
  return (
    <AppPage title="Today">
      <Suspense fallback={<p className="text-muted">Loading…</p>}>
        <Today />
      </Suspense>
    </AppPage>
  );
}

function Tile({ href, value, label, note, urgent }) {
  return (
    <Link
      href={href}
      className="group rounded-2xl border border-line bg-white p-5 transition-colors hover:border-peach-hover hover:bg-peach-soft/50"
    >
      <p className={`font-display text-5xl font-semibold tabular-nums ${urgent ? "text-brand" : "text-foreground"}`}>{value}</p>
      <p className="mt-2 font-medium">{label}</p>
      {note && <p className="text-sm text-muted">{note}</p>}
    </Link>
  );
}

async function Today() {
  const access = await requireAccess(["student", "staff"]);
  if (access.kind === "student") redirect("/student");

  const [queue, wash, pickup, unpaid] = await Promise.all([run("R02"), run("R31"), run("R32"), run("R30")]);
  const unpaidTotal = unpaid.reduce((s, f) => s + Number(f.fine_amount), 0);

  return (
    <>
      <p className="-mt-3 text-muted">Hello {access.staff.full_name.split(" ")[0]}. Here is what is waiting.</p>

      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <Tile href="/counter" value={queue.length} label="To count" note="at the counter" urgent={queue.length > 0} />
        <Tile href="/fines/wash" value={wash.length} label="To wash" note="counted bags" />
        <Tile href="/fines/pickup" value={pickup.length} label="For pickup" note="ready bags" />
        <Tile href="/fines/unpaid" value={unpaid.length} label="Unpaid fines" note={money(unpaidTotal)} />
      </div>

      <section>
        <div className="mb-3 flex items-baseline justify-between">
          <h2 className="text-lg font-semibold">Next at the counter</h2>
          {queue.length > 3 && (
            <Link href="/counter" className="text-sm font-medium text-brand hover:underline">
              All {queue.length}
            </Link>
          )}
        </div>
        {queue.length === 0 ? (
          <p className="text-muted">No bags waiting. New ones appear as soon as students hand them in.</p>
        ) : (
          <List>
            {queue.slice(0, 3).map((o) => (
              <ListRow key={o.order_id} href={`/counter/orders/${o.order_id}`} aside={<span className="text-sm text-muted">{when(o.submitted_at)}</span>}>
                <div className="flex flex-wrap items-center gap-2">
                  <BagTag prefix={o.bag_prefix} number={o.bag_number} />
                  <span className="font-medium">{o.full_name}</span>
                </div>
              </ListRow>
            ))}
          </List>
        )}
      </section>

      {access.staff.role === "ADMIN" && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-line bg-white px-5 py-4">
          <p className="text-sm text-muted">Staff accounts and the fine rule are on the admin page.</p>
          <ButtonLink href="/admin" variant="secondary">
            Open admin
          </ButtonLink>
        </div>
      )}
    </>
  );
}
