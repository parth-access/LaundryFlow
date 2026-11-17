// OWNER: Dhruv. Counted bags waiting to be washed: mark each one ready.
import { Suspense } from "react";
import { requireAccess } from "@/lib/auth";
import { AppPage } from "@/components/app-page";
import { BagTag, EmptyState, List, ListRow, when } from "@/components/ui";
import FinesFrame from "../frame";
import SubmitButton from "../submit-button";
import { markReady, markManyReady } from "../actions";

export const metadata = { title: "To wash | LaundryFlow" };

export default function WashPage({ searchParams }) {
  return (
    <AppPage title="Wash & fines" subtitle="Bags move from washing to pickup, and fines get settled here.">
      <Suspense fallback={<p className="text-muted">Loading…</p>}>
        <Wash searchParams={searchParams} />
      </Suspense>
    </AppPage>
  );
}

async function Wash({ searchParams }) {
  await requireAccess(["staff"]);
  return (
    <FinesFrame current="/fines/wash" searchParams={searchParams}>
      {(orders) =>
        orders.length === 0 ? (
          <EmptyState title="Nothing to wash">Bags appear here after they are counted at the counter.</EmptyState>
        ) : (
          <>
            {orders.length > 1 && (
              // The checkboxes sit inside each row but belong to this form through form="bulk-ready".
              <form
                id="bulk-ready"
                action={markManyReady}
                className="flex items-center justify-between gap-3 rounded-xl bg-peach-soft px-4 py-3"
              >
                <p className="text-sm">Tick the bags from one wash load, then mark them all at once.</p>
                <SubmitButton>Mark selected ready</SubmitButton>
              </form>
            )}
            <List>
              {orders.map((o) => (
                <ListRow
                  key={o.order_id}
                  aside={
                    <form action={markReady}>
                      <input type="hidden" name="order_id" value={o.order_id} />
                      <input type="hidden" name="return_to" value="/fines/wash" />
                      <SubmitButton>Mark ready</SubmitButton>
                    </form>
                  }
                >
                  <div className="flex flex-wrap items-center gap-2">
                    {orders.length > 1 && (
                      <input
                        type="checkbox"
                        name="order_ids"
                        value={o.order_id}
                        form="bulk-ready"
                        aria-label={`Select bag ${o.bag_prefix}${o.bag_number}`}
                        className="size-5 accent-ink"
                      />
                    )}
                    <BagTag prefix={o.bag_prefix} number={o.bag_number} />
                    <span className="font-medium">{o.full_name}</span>
                  </div>
                  <p className="mt-1 text-sm text-muted">
                    {o.verified_count} clothes, counted {when(o.received_at)}
                  </p>
                </ListRow>
              ))}
            </List>
          </>
        )
      }
    </FinesFrame>
  );
}
