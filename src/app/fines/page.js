
import { Suspense } from "react";
import { requireAccess } from "@/lib/auth";
import { run } from "@/lib/db";
import {
  Page,
  Card,
  BagTag,
  Button,
  Alert,
  money,
  when,
} from "@/components/ui";

import {
  markReady,
  markCollected,
  markPaid,
  waiveFine,
} from "./actions";

export const metadata = {
  title: "Fines and pickup | LaundryFlow",
};

const errorMessages = {
  "already-updated": "This order was already updated. Please refresh and check its current status.",
  "invalid-order": "Invalid order. Please try again.",
  "invalid-reason": "Waiver reason must contain between 3 and 200 characters.",
  "save-failed": "Something went wrong while saving. Please try again.",
};

export default function FinesPage({ searchParams }) {
  return (
    <Page title="Fines and pickup">
      <Suspense
        fallback={<p className="text-zinc-500">Loading...</p>}
      >
        <Fines searchParams={searchParams} />
      </Suspense>
    </Page>
  );
}

async function Fines({ searchParams }) {
  await requireAccess(["staff"]);

  const params = await searchParams;
  const error = errorMessages[params?.error];

  const [received, ready, unpaid] = await Promise.all([
    run("R31"),
    run("R32"),
    run("R30"),
  ]);

  return (
    <div className="space-y-6">

      {error && <Alert kind="error">{error}</Alert>}

      <Card>
        <h2 className="mb-3 text-lg font-medium">
          Ready to wash ({received.length})
        </h2>

        {received.length === 0 ? (
          <p className="text-zinc-500">
            No orders waiting to be washed.
          </p>
        ) : (
          <ul className="divide-y divide-zinc-200 dark:divide-zinc-800">
            {received.map((order) => (
              <li
                key={order.order_id}
                className="flex flex-col justify-between gap-3 py-3 sm:flex-row sm:items-center"
              >
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <BagTag
                      prefix={order.bag_prefix}
                      number={order.bag_number}
                    />
                    <span className="font-medium">
                      {order.full_name}
                    </span>
                  </div>

                  <p className="mt-1 text-sm text-zinc-500">
                    {order.verified_count} clothes · Received{" "}
                    {when(order.received_at)}
                  </p>
                </div>

                <form action={markReady}>
                  <input
                    type="hidden"
                    name="order_id"
                    value={order.order_id}
                  />

                  <Button type="submit">
                    Mark ready
                  </Button>
                </form>
              </li>
            ))}
          </ul>
        )}
      </Card>

      <Card>
        <h2 className="mb-3 text-lg font-medium">
          Waiting for pickup ({ready.length})
        </h2>

        {ready.length === 0 ? (
          <p className="text-zinc-500">
            No orders waiting for pickup.
          </p>
        ) : (
          <ul className="divide-y divide-zinc-200 dark:divide-zinc-800">
            {ready.map((order) => (
              <li
                key={order.order_id}
                className="flex flex-col justify-between gap-3 py-3 sm:flex-row sm:items-center"
              >
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <BagTag
                      prefix={order.bag_prefix}
                      number={order.bag_number}
                    />
                    <span className="font-medium">
                      {order.full_name}
                    </span>
                  </div>

                  <p className="mt-1 text-sm text-zinc-500">
                    {order.verified_count} clothes · Ready{" "}
                    {when(order.ready_at)}
                  </p>
                </div>

                <form action={markCollected}>
                  <input
                    type="hidden"
                    name="order_id"
                    value={order.order_id}
                  />

                  <Button type="submit">
                    Collected
                  </Button>
                </form>
              </li>
            ))}
          </ul>
        )}
      </Card>

      <Card>
        <h2 className="mb-3 text-lg font-medium">
          Unpaid fines ({unpaid.length})
        </h2>

        {unpaid.length === 0 ? (
          <p className="text-zinc-500">
            No unpaid fines.
          </p>
        ) : (
          <ul className="divide-y divide-zinc-200 dark:divide-zinc-800">
            {unpaid.map((fine) => (
              <li
                key={fine.order_id}
                className="space-y-3 py-4"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <BagTag
                        prefix={fine.bag_prefix}
                        number={fine.bag_number}
                      />
                      <span className="font-medium">
                        {fine.full_name}
                      </span>
                    </div>

                    <p className="mt-1 text-sm text-zinc-500">
                      Received {when(fine.received_at)}
                    </p>
                  </div>

                  <span className="font-semibold">
                    {money(fine.fine_amount)}
                  </span>
                </div>

                <div className="flex flex-wrap gap-2">
                  <form action={markPaid}>
                    <input
                      type="hidden"
                      name="order_id"
                      value={fine.order_id}
                    />

                    <Button type="submit">
                      Paid
                    </Button>
                  </form>

                  <form
                    action={waiveFine}
                    className="flex min-w-0 flex-1 flex-col gap-2 sm:flex-row"
                  >
                    <input
                      type="hidden"
                      name="order_id"
                      value={fine.order_id}
                    />

                    <textarea
                      name="waiver_reason"
                      required
                      minLength={3}
                      maxLength={200}
                      rows={1}
                      placeholder="Reason for waiving the fine..."
                      className="min-w-0 flex-1 rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
                    />

                    <Button
                      type="submit"
                      variant="secondary"
                    >
                      Waive
                    </Button>
                  </form>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>

    </div>
  );
}
