"use client";

// OWNER: Aarabdh. The "Hand in laundry" form. On success the action opens the new order's page.
import { useActionState } from "react";
import { Alert, Button } from "@/components/ui";
import { submitLaundry } from "./actions";

const initialState = { error: null, values: { declared_count: "" } };

export default function SubmitForm({ freeLimit }) {
  const [state, formAction, pending] = useActionState(submitLaundry, initialState);

  return (
    <form action={formAction} className="space-y-5">
      <div>
        <label htmlFor="declared_count" className="block font-display text-lg font-semibold">
          How many clothes are in your bag?
        </label>
        <p className="mt-1 text-sm text-muted">
          Count every item. {freeLimit ? `The first ${freeLimit} are free; staff recount at the counter.` : "Staff recount at the counter."}
        </p>
        <input
          id="declared_count"
          name="declared_count"
          type="number"
          inputMode="numeric"
          min="1"
          max="100"
          required
          autoFocus
          defaultValue={state.values?.declared_count ?? ""}
          placeholder="0"
          disabled={pending}
          className="mt-4 w-40 rounded-2xl border border-field bg-white px-5 py-4 font-display text-4xl font-semibold tabular-nums outline-none focus:border-ink focus:ring-4 focus:ring-peach"
        />
      </div>

      {state.error && <Alert>{state.error}</Alert>}

      <Button type="submit" disabled={pending} className="w-full sm:w-auto">
        {pending ? "Handing in…" : "Hand in laundry"}
      </Button>
    </form>
  );
}
