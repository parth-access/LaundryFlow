"use client";

// OWNER: Aarabdh. Small form on the order page to fix the clothes count before staff count the bag.
import { useActionState } from "react";
import { Alert, Button } from "@/components/ui";
import { changeCount } from "../../actions";

export default function ChangeCountForm({ orderId, current }) {
  const [state, formAction, pending] = useActionState(changeCount, { error: null });

  return (
    <form action={formAction} className="mt-4 space-y-3">
      <input type="hidden" name="order_id" value={orderId} />
      <div className="flex flex-wrap items-end gap-3">
        <div>
          <label htmlFor="declared_count" className="mb-1.5 block text-sm font-medium">
            Correct number
          </label>
          <input
            id="declared_count"
            name="declared_count"
            type="number"
            inputMode="numeric"
            min="1"
            max="100"
            required
            defaultValue={current}
            disabled={pending}
            className="w-28 rounded-xl border border-field bg-white px-4 py-2.5 tabular-nums focus:border-ink focus:outline-none"
          />
        </div>
        <Button type="submit" variant="secondary" disabled={pending}>
          {pending ? "Saving…" : "Update count"}
        </Button>
      </div>
      {state.error && <Alert>{state.error}</Alert>}
    </form>
  );
}
