"use client";

// OWNER: Tanishq. The receive panel on the "Count bag" page: type the real count,
// see the fine before saving, receive the bag. Verifies a new bag tag too.
import { useActionState, useState } from "react";
import { Alert, Button, Card, money } from "@/components/ui";
import { calculateFine } from "@/lib/fines";
import { receiveOrder, verifyBag } from "./actions";

export default function ReceivePanel({ order, policy }) {
  const [count, setCount] = useState("");
  const [state, receiveAction, receiving] = useActionState(receiveOrder, { error: null, success: false });
  const [verifyState, verifyAction, verifying] = useActionState(verifyBag, { error: null, verified: false });

  const valid = /^[0-9]+$/.test(count) && Number(count) <= 100;
  const n = valid ? Number(count) : null;
  const fine = n !== null && policy ? calculateFine(n, policy) : null;
  const extra = n !== null && policy ? Math.max(0, n - policy.free_limit) : 0;
  const verified = order.bag_verified || verifyState.verified;

  return (
    <>
      {!verified && (
        <Card className="flex flex-wrap items-center justify-between gap-4 border-amber-200 bg-amber-50/60">
          <div>
            <p className="font-medium">First drop-off with this tag</p>
            <p className="text-sm text-muted">Check the tag on the bag matches before you count.</p>
          </div>
          <form action={verifyAction}>
            <input type="hidden" name="student_id" value={order.student_id} />
            <Button type="submit" variant="secondary" disabled={verifying}>
              {verifying ? "Saving…" : "Tag matches"}
            </Button>
          </form>
          {verifyState.error && (
            <div className="w-full">
              <Alert>{verifyState.error}</Alert>
            </div>
          )}
        </Card>
      )}

      <Card>
        <form action={receiveAction} className="space-y-6">
          <input type="hidden" name="order_id" value={order.order_id} />

          <div className="grid gap-6 sm:grid-cols-2">
            <div>
              <p className="text-sm text-muted">Student says</p>
              <p className="mt-1 font-display text-5xl font-semibold tabular-nums text-muted">{order.declared_count}</p>
            </div>
            <div>
              <label htmlFor="verified_count" className="text-sm text-muted">
                You counted
              </label>
              <input
                id="verified_count"
                name="verified_count"
                type="number"
                inputMode="numeric"
                min="0"
                max="100"
                step="1"
                required
                autoFocus
                value={count}
                onChange={(e) => setCount(e.target.value)}
                placeholder="0"
                className="mt-1 w-full max-w-40 rounded-2xl border border-field bg-white px-4 py-2 font-display text-5xl font-semibold tabular-nums outline-none focus:border-ink focus:ring-4 focus:ring-peach"
              />
            </div>
          </div>

          <div className={`rounded-2xl px-5 py-4 ${fine ? "bg-red-50 text-red-900" : "bg-peach-soft text-ink"}`} aria-live="polite">
            {!policy ? (
              <p>No fine rule is set up. Ask an admin before receiving.</p>
            ) : n === null ? (
              <p>
                {policy.free_limit} clothes are free, then {money(policy.fine_per_extra)} for each extra one.
              </p>
            ) : fine > 0 ? (
              <p>
                <span className="font-display text-2xl font-semibold">{money(fine)} fine</span>
                <span className="ml-2 text-sm">
                  {extra} over the free {policy.free_limit}, at {money(policy.fine_per_extra)} each
                </span>
              </p>
            ) : (
              <p>
                <span className="font-display text-2xl font-semibold">No fine</span>
                <span className="ml-2 text-sm">within the free {policy.free_limit}</span>
              </p>
            )}
            {n !== null && n !== order.declared_count && (
              <p className="mt-1 text-sm">
                {n > order.declared_count ? `${n - order.declared_count} more` : `${order.declared_count - n} fewer`} than the student said.
              </p>
            )}
          </div>

          {state.error && <Alert>{state.error}</Alert>}

          <Button type="submit" disabled={receiving || !valid || !policy} className="w-full py-3 text-base sm:w-auto">
            {receiving ? "Saving…" : fine > 0 ? `Receive bag with ${money(fine)} fine` : "Receive bag"}
          </Button>
        </form>
      </Card>
    </>
  );
}
