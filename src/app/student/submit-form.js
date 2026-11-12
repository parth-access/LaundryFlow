"use client";

import { useActionState } from "react";
import { submitLaundry } from "./actions";
import { Button, Alert } from "@/components/ui";

const initialState = {
  error: null,
  values: { declared_count: "" },
  success: false,
};

export default function SubmitForm({ hasActiveOrder }) {
  const [state, formAction, pending] = useActionState(
    submitLaundry,
    initialState,
  );

  return (
    <div className="mt-4">
      <h2 className="text-lg font-medium">Submit laundry</h2>

      {state.success && (
        <Alert kind="success">Laundry submitted successfully!</Alert>
      )}

      {hasActiveOrder ? (
        <Alert>
          You already have an active order. Wait until it is collected before
          submitting another.
        </Alert>
      ) : (
        <form action={formAction} className="mt-3 space-y-3">
          <div>
            <label
              htmlFor="declared_count"
              className="mb-1 block text-sm font-medium"
            >
              Number of clothes
            </label>

            <input
              id="declared_count"
              name="declared_count"
              type="number"
              min="1"
              max="100"
              required
              defaultValue={state.values?.declared_count ?? ""}
              placeholder="Enter number of clothes"
              disabled={pending}
              className="w-full rounded-lg border border-zinc-300 bg-transparent px-3 py-2 dark:border-zinc-700"
            />
          </div>

          {state.error && <Alert>{state.error}</Alert>}

          <Button type="submit" disabled={pending}>
            {pending ? "Submitting..." : "Submit laundry"}
          </Button>
        </form>
      )}
    </div>
  );
}
