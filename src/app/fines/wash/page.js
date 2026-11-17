// OWNER: Dhruv. Counted bags waiting to be washed: mark each one ready.
import { Suspense } from "react";
import { requireAccess } from "@/lib/auth";
import { AppPage } from "@/components/app-page";
import { BagTag, EmptyState, List, ListRow, when } from "@/components/ui";
import FinesFrame from "../frame";
import SubmitButton from "../submit-button";
import { markReady } from "../actions";

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
                  <BagTag prefix={o.bag_prefix} number={o.bag_number} />
                  <span className="font-medium">{o.full_name}</span>
                </div>
                <p className="mt-1 text-sm text-muted">
                  {o.verified_count} clothes, counted {when(o.received_at)}
                </p>
              </ListRow>
            ))}
          </List>
        )
      }
    </FinesFrame>
  );
}
