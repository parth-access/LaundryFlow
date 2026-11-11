// OWNER: Tanishq. Counter side: queue, bag lookup, receive + count (fine is saved automatically).
// Your query ids: R20-R29, W20-W29 (in src/lib/queries.js). See TEAM.md for your task list.
import { Suspense } from "react";
import { requireAccess } from "@/lib/auth";
import { run } from "@/lib/db";
import { Page, Card, BagTag, when } from "@/components/ui";

export const metadata = { title: "Counter | LaundryFlow" };

export default function CounterPage() {
  return (
    <Page title="Laundry counter">
      <Suspense fallback={<p className="text-zinc-500">Loading...</p>}>
        <Queue />
      </Suspense>
    </Page>
  );
}

async function Queue() {
  await requireAccess(["staff"]);
  const queue = await run("R02"); // working example: orders waiting to be counted

  return (
    <>
      {/* TODO (Tanishq): bag lookup box: type 1054 -> run("R01", [1054]) -> pick B or G */}
      <Card>
        <p className="font-mono text-sm text-zinc-500">TODO: bag number search goes here.</p>
      </Card>

      <Card>
        <h2 className="mb-3 text-lg font-medium">Waiting to be counted ({queue.length})</h2>
        {queue.length === 0 ? (
          <p className="text-zinc-500">Nothing waiting.</p>
        ) : (
          <ul className="divide-y divide-zinc-200 dark:divide-zinc-800">
            {queue.map((o) => (
              <li key={o.order_id} className="flex items-center justify-between py-2">
                <span>
                  <BagTag prefix={o.bag_prefix} number={o.bag_number} /> {o.full_name}
                </span>
                <span className="text-sm text-zinc-500">
                  declared {o.declared_count} &middot; {when(o.submitted_at)}
                </span>
                {/* TODO (Tanishq): "Receive" -> enter counted clothes -> one transaction:
                    UPDATE orders (status RECEIVED, received_at, received_by, verified_count, policy_id)
                    + INSERT INTO fines when calculateFine() from @/lib/fines is > 0 */}
              </li>
            ))}
          </ul>
        )}
      </Card>
    </>
  );
}
