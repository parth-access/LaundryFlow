// OWNER: Aarabdh. My fines: what is unpaid, and what was paid or waived before.
import { Suspense } from "react";
import { requireAccess } from "@/lib/auth";
import { run } from "@/lib/db";
import { AppPage } from "@/components/app-page";
import { EmptyState, List, ListRow, money, when } from "@/components/ui";

export const metadata = { title: "My fines | LaundryFlow" };

const WORDS = { UNPAID: "Unpaid", PAID: "Paid", WAIVED: "Waived" };

export default function FinesPage() {
  return (
    <AppPage title="My fines" subtitle="A fine is added when a bag has more clothes than the free limit.">
      <Suspense fallback={<p className="text-muted">Loading…</p>}>
        <Fines />
      </Suspense>
    </AppPage>
  );
}

async function Fines() {
  const { student } = await requireAccess(["student"]);
  const fines = await run("R12", [student.student_id]);

  if (fines.length === 0) {
    return <EmptyState title="No fines">Keep each bag within the free limit and it stays that way.</EmptyState>;
  }

  const unpaid = fines.filter((f) => f.fine_status === "UNPAID");
  const owed = unpaid.reduce((sum, f) => sum + Number(f.fine_amount), 0);

  return (
    <>
      <section className="rounded-3xl bg-peach-soft p-6 sm:p-8">
        <p className="text-sm text-muted">To pay at the counter</p>
        <p className="mt-1 font-display text-4xl font-semibold tabular-nums">{money(owed)}</p>
        <p className="mt-1 text-sm text-muted">
          {unpaid.length === 0 ? "Nothing owed. All settled." : `Across ${unpaid.length} ${unpaid.length === 1 ? "bag" : "bags"}.`}
        </p>
      </section>

      <List>
        {fines.map((f) => (
          <ListRow
            key={f.order_id}
            href={`/student/orders/${f.order_id}`}
            aside={
              <div className="text-right">
                <p className={`font-semibold tabular-nums ${f.fine_status === "WAIVED" ? "text-muted line-through" : ""}`}>
                  {money(f.fine_amount)}
                </p>
                <p className={`text-sm ${f.fine_status === "UNPAID" ? "font-medium text-red-700" : "text-muted"}`}>
                  {WORDS[f.fine_status]}
                </p>
              </div>
            }
          >
            <p className="font-medium">Counted {when(f.received_at)}</p>
            <p className="mt-1 text-sm text-muted">
              {f.verified_count} clothes, {Math.max(0, f.verified_count - f.free_limit)} over the free {f.free_limit}
              {f.fine_status === "PAID" && `. Paid ${when(f.fine_paid_at)}`}
              {f.fine_status === "WAIVED" && `. Waived: ${f.waiver_reason}`}
            </p>
          </ListRow>
        ))}
      </List>
    </>
  );
}
