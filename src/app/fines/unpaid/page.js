// OWNER: Dhruv. Unpaid fines: mark paid, or waive with a reason.
import { Suspense } from "react";
import { requireAccess } from "@/lib/auth";
import { AppPage } from "@/components/app-page";
import { BagTag, Card, EmptyState, money, when } from "@/components/ui";
import FinesFrame from "../frame";
import SubmitButton from "../submit-button";
import { markPaid, waiveFine } from "../actions";

export const metadata = { title: "Unpaid fines | LaundryFlow" };

export default function UnpaidPage({ searchParams }) {
  return (
    <AppPage title="Wash & fines" subtitle="Bags move from washing to pickup, and fines get settled here.">
      <Suspense fallback={<p className="text-muted">Loading…</p>}>
        <Unpaid searchParams={searchParams} />
      </Suspense>
    </AppPage>
  );
}

async function Unpaid({ searchParams }) {
  await requireAccess(["staff"]);
  return (
    <FinesFrame current="/fines/unpaid" searchParams={searchParams}>
      {(fines) =>
        fines.length === 0 ? (
          <EmptyState title="No unpaid fines">Fines appear here when a bag is counted over the free limit.</EmptyState>
        ) : (
          <>
            <p className="text-muted">
              {money(fines.reduce((s, f) => s + Number(f.fine_amount), 0))} outstanding across {fines.length}{" "}
              {fines.length === 1 ? "bag" : "bags"}.
            </p>
            <div className="space-y-3">
              {fines.map((f) => (
                <Card key={f.order_id} className="p-4 sm:p-5">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <BagTag prefix={f.bag_prefix} number={f.bag_number} />
                        <span className="font-medium">{f.full_name}</span>
                      </div>
                      <p className="mt-1 text-sm text-muted">Counted {when(f.received_at)}</p>
                    </div>
                    <p className="font-display text-2xl font-semibold tabular-nums">{money(f.fine_amount)}</p>
                  </div>

                  <div className="mt-4 flex flex-col gap-3 border-t border-line pt-4 sm:flex-row sm:items-start">
                    <form action={markPaid}>
                      <input type="hidden" name="order_id" value={f.order_id} />
                      <input type="hidden" name="return_to" value="/fines/unpaid" />
                      <SubmitButton>Mark paid</SubmitButton>
                    </form>
                    <form action={waiveFine} className="flex flex-1 gap-2">
                      <input type="hidden" name="order_id" value={f.order_id} />
                      <input type="hidden" name="return_to" value="/fines/unpaid" />
                      <label htmlFor={`reason-${f.order_id}`} className="sr-only">
                        Reason for waiving
                      </label>
                      <input
                        id={`reason-${f.order_id}`}
                        name="waiver_reason"
                        required
                        minLength={3}
                        maxLength={200}
                        placeholder="Reason for waiving"
                        className="min-w-0 flex-1 rounded-full border border-field bg-white px-4 py-2 text-sm outline-none focus:border-ink focus:ring-4 focus:ring-peach"
                      />
                      <SubmitButton variant="secondary">Waive</SubmitButton>
                    </form>
                  </div>
                </Card>
              ))}
            </div>
          </>
        )
      }
    </FinesFrame>
  );
}
