"use client";

import { useActionState, useState } from "react";
import { Alert, BagTag, Button, Card, StatusBadge, when, money } from "@/components/ui";
import BagLookup from "./bag-lookup";
import { receiveOrder } from "./actions";

const initialReceiveState = { error: null, success: false };

export default function CounterOperations({ queue }) {
  const [receiveState, receiveAction, receiving] = useActionState(
    receiveOrder,
    initialReceiveState,
  );
  // Remember which order was submitted, so the success message can show its bag tag.
  const [submittedOrder, setSubmittedOrder] = useState(null);

  return (
    <div className="space-y-6">
      <BagLookup />

      {receiveState.error && !receiveState.orderId && <Alert>{receiveState.error}</Alert>}
      {receiveState.success && (
        <Alert kind="success">
          {submittedOrder ? (
            <>
              <BagTag prefix={submittedOrder.bag_prefix} number={submittedOrder.bag_number} />{" "}
              {submittedOrder.full_name}
            </>
          ) : (
            "Order"
          )}{" "}
          received · {receiveState.verifiedCount} items counted ·{" "}
          {receiveState.fineAmount > 0
            ? `Fee ${money(receiveState.fineAmount)}`
            : "No fee due"}
        </Alert>
      )}

      <Card className="overflow-hidden p-0">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-200 px-5 py-4 dark:border-zinc-800">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500">
              Incoming orders
            </p>
            <h2 className="mt-1 text-lg font-semibold">Waiting to be counted</h2>
          </div>
          <span className="inline-flex min-w-9 items-center justify-center rounded-full bg-zinc-100 px-3 py-1 text-sm font-semibold tabular-nums dark:bg-zinc-800">
            {queue.length}
          </span>
        </div>

        {queue.length === 0 ? (
          <div className="px-5 py-10 text-center">
            <div aria-hidden className="mx-auto mb-3 flex size-11 items-center justify-center rounded-full bg-teal-50 text-lg text-teal-700 dark:bg-teal-950 dark:text-teal-300">
              ✓
            </div>
            <p className="font-medium">You’re all caught up</p>
            <p className="mt-1 text-sm text-zinc-500">New submitted orders will appear here.</p>
          </div>
        ) : (
          <ul className="divide-y divide-zinc-200 dark:divide-zinc-800">
            {queue.map((order) => (
              <li key={order.order_id} className="px-5 py-5 sm:px-6">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <BagTag prefix={order.bag_prefix} number={order.bag_number} />
                      <span className="font-semibold">{order.full_name}</span>
                      <StatusBadge status="SUBMITTED" />
                    </div>
                    <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-zinc-500">
                      <span>Declared {order.declared_count} items</span>
                      <span>Submitted {when(order.submitted_at)}</span>
                    </div>
                  </div>
                  <ReceiveForm
                    order={order}
                    action={receiveAction}
                    pending={receiving}
                    onSubmit={() => setSubmittedOrder(order)}
                    rowState={receiveState.orderId === order.order_id ? receiveState : null}
                  />
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}

function ReceiveForm({ order, action, pending, onSubmit, rowState }) {
  // Start empty so staff type the real count. If saving fails, keep what they typed.
  const rowError = rowState?.error ?? null;
  const countValue = rowError ? rowState.verifiedCount ?? "" : "";
  const errorId = `verified-count-error-${order.order_id}`;

  return (
    <form action={action} onSubmit={onSubmit} className="w-full rounded-xl bg-zinc-50 p-3 dark:bg-zinc-900/70 lg:w-[22rem]">
      <input type="hidden" name="order_id" value={order.order_id} />
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
        <div className="min-w-0 flex-1">
          <label htmlFor={`verified-count-${order.order_id}`} className="mb-1.5 block text-xs font-semibold text-zinc-600 dark:text-zinc-300">
            Verified count
          </label>
          <input
            id={`verified-count-${order.order_id}`}
            name="verified_count"
            type="number"
            inputMode="numeric"
            min="0"
            max="100"
            step="1"
            required
            defaultValue={countValue}
            aria-describedby={rowError ? errorId : undefined}
            className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2.5 text-base tabular-nums outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-600/20 dark:border-zinc-700 dark:bg-zinc-950"
          />
        </div>
        <Button type="submit" disabled={pending} className="min-h-11 w-full sm:w-auto">
          {pending ? "Saving…" : "Receive order"}
        </Button>
      </div>
      {rowError && (
        <p id={errorId} role="alert" className="mt-2 text-sm text-red-700 dark:text-red-300">
          {rowError}
        </p>
      )}
      <p className="mt-2 text-xs text-zinc-500">Fee is calculated from the active policy after the count is saved.</p>
    </form>
  );
}
