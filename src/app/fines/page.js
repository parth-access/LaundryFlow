// OWNER: Dhruv. Pickup and fines: mark ready, mark collected, unpaid fines, paid / waived.
// Your query ids: R30-R39, W30-W39 (in src/lib/queries.js). See TEAM.md for your task list.
import { Suspense } from "react";
import { requireAccess } from "@/lib/auth";
import { run } from "@/lib/db";
import { Page, Card, BagTag, money, when } from "@/components/ui";

export const metadata = { title: "Fines and pickup | LaundryFlow" };

export default function FinesPage() {
  return (
    <Page title="Fines and pickup">
      <Suspense fallback={<p className="text-zinc-500">Loading...</p>}>
        <Fines />
      </Suspense>
    </Page>
  );
}

async function Fines() {
  await requireAccess(["staff"]);
  const unpaid = await run("R30"); // working example: unpaid fines

  return (
    <>
      {/* TODO (Dhruv): list of RECEIVED orders with a "Mark ready" button, and READY orders with "Collected" */}
      <Card>
        <p className="font-mono text-sm text-zinc-500">TODO: ready / collected lists go here.</p>
      </Card>

      <Card>
        <h2 className="mb-3 text-lg font-medium">Unpaid fines ({unpaid.length})</h2>
        {unpaid.length === 0 ? (
          <p className="text-zinc-500">No unpaid fines.</p>
        ) : (
          <ul className="divide-y divide-zinc-200 dark:divide-zinc-800">
            {unpaid.map((f) => (
              <li key={f.order_id} className="flex items-center justify-between py-2">
                <span>
                  <BagTag prefix={f.bag_prefix} number={f.bag_number} /> {f.full_name}
                </span>
                <span className="text-sm">
                  {money(f.fine_amount)} &middot; <span className="text-zinc-500">{when(f.received_at)}</span>
                </span>
                {/* TODO (Dhruv): "Paid" and "Waive" (waive needs a reason) buttons */}
              </li>
            ))}
          </ul>
        )}
      </Card>
    </>
  );
}
