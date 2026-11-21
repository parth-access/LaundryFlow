// OWNER: Tanishq. The counter: find a bag by number, or pick the next one in the queue.
import { Suspense } from "react";
import { requireAccess } from "@/lib/auth";
import { run } from "@/lib/db";
import { AppPage } from "@/components/app-page";
import { Alert, BagTag, EmptyState, List, ListRow, when } from "@/components/ui";
import BagLookup from "./bag-lookup";

export const metadata = { title: "Counter | LaundryFlow" };

export default function CounterPage({ searchParams }) {
  return (
    <AppPage title="Counter" subtitle="Type the number on the bag tag, or pick the next bag in the queue.">
      <Suspense fallback={<p className="text-muted">Loading the queue…</p>}>
        <Counter searchParams={searchParams} />
      </Suspense>
    </AppPage>
  );
}

async function Counter({ searchParams }) {
  await requireAccess(["staff"]);
  const queue = await run("R02");
  const { received } = await searchParams;

  return (
    <>
      {received && <Alert kind="success">Bag received. {queue.length > 0 ? "Next one below." : "The queue is clear."}</Alert>}

      <BagLookup />

      <section>
        <h2 className="mb-3 text-lg font-semibold">
          Waiting to be counted <span className="font-normal text-muted">({queue.length})</span>
        </h2>
        {queue.length === 0 ? (
          <EmptyState title="The queue is clear">Bags show up here as soon as students hand them in.</EmptyState>
        ) : (
          <List>
            {queue.map((o) => (
              <ListRow
                key={o.order_id}
                href={`/counter/orders/${o.order_id}`}
                aside={<span className="text-sm text-muted">{when(o.submitted_at)}</span>}
              >
                <div className="flex flex-wrap items-center gap-2">
                  <BagTag prefix={o.bag_prefix} number={o.bag_number} />
                  <span className="font-medium">{o.full_name}</span>
                  {!o.bag_verified_at && (
                    <span className="rounded-full bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-800 ring-1 ring-inset ring-amber-200">
                      New tag
                    </span>
                  )}
                </div>
                <p className="mt-1 text-sm text-muted">Says {o.declared_count} clothes</p>
              </ListRow>
            ))}
          </List>
        )}
      </section>
    </>
  );
}
