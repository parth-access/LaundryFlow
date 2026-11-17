// OWNER: Dhruv. Washed bags waiting for the student: mark each one collected.
// Bags waiting OVERDUE_DAYS or more are marked so staff can remind the student.
import { Suspense } from "react";
import { requireAccess } from "@/lib/auth";
import { AppPage } from "@/components/app-page";
import { BagTag, EmptyState, List, ListRow, when } from "@/components/ui";
import FinesFrame from "../frame";
import SubmitButton from "../submit-button";
import { markCollected } from "../actions";

export const metadata = { title: "For pickup | LaundryFlow" };

const OVERDUE_DAYS = 3;

function waitingText(days) {
  if (days <= 0) return "ready today";
  if (days === 1) return "waiting 1 day";
  return `waiting ${days} days`;
}

export default function PickupPage({ searchParams }) {
  return (
    <AppPage title="Wash & fines" subtitle="Bags move from washing to pickup, and fines get settled here.">
      <Suspense fallback={<p className="text-muted">Loading…</p>}>
        <Pickup searchParams={searchParams} />
      </Suspense>
    </AppPage>
  );
}

async function Pickup({ searchParams }) {
  await requireAccess(["staff"]);
  return (
    <FinesFrame current="/fines/pickup" searchParams={searchParams}>
      {(orders) =>
        orders.length === 0 ? (
          <EmptyState title="No bags waiting for pickup">Bags appear here once they are marked ready.</EmptyState>
        ) : (
          <List>
            {orders.map((o) => (
              <ListRow
                key={o.order_id}
                aside={
                  <form action={markCollected}>
                    <input type="hidden" name="order_id" value={o.order_id} />
                    <input type="hidden" name="return_to" value="/fines/pickup" />
                    <SubmitButton>Collected</SubmitButton>
                  </form>
                }
              >
                <div className="flex flex-wrap items-center gap-2">
                  <BagTag prefix={o.bag_prefix} number={o.bag_number} />
                  <span className="font-medium">{o.full_name}</span>
                </div>
                <p className="mt-1 text-sm text-muted">
                  {o.verified_count} clothes, ready since {when(o.ready_at)}
                </p>
                <p className={`mt-1 text-sm ${o.days_waiting >= OVERDUE_DAYS ? "font-medium text-brand" : "text-muted"}`}>
                  {waitingText(o.days_waiting)}
                  {o.days_waiting >= OVERDUE_DAYS && ", remind the student"}
                </p>
              </ListRow>
            ))}
          </List>
        )
      }
    </FinesFrame>
  );
}
