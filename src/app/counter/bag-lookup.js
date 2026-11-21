"use client";

// OWNER: Tanishq. Type the number on a bag tag; pick B or G; see where that student's bag is.
import { useActionState } from "react";
import { Alert, BagTag, Button, ButtonLink, Card } from "@/components/ui";
import { searchBags } from "./actions";

const initialSearchState = { searched: false, error: null, results: [] };

export default function BagLookup() {
  const [state, searchAction, searching] = useActionState(searchBags, initialSearchState);

  return (
    <Card>
      <form action={searchAction} className="flex flex-col gap-3 sm:flex-row sm:items-end">
        <div className="min-w-0 flex-1">
          <label htmlFor="bag_number" className="block font-display text-lg font-semibold">
            Bag number
          </label>
          <input
            id="bag_number"
            name="bag_number"
            type="number"
            inputMode="numeric"
            min="1"
            max="2147483647"
            step="1"
            required
            placeholder="1054"
            className="mt-2 w-full rounded-2xl border border-field bg-white px-5 py-3 font-display text-2xl font-semibold tabular-nums outline-none focus:border-ink focus:ring-4 focus:ring-peach"
          />
        </div>
        <Button type="submit" disabled={searching} className="sm:min-w-32 sm:py-3.5">
          {searching ? "Finding…" : "Find bag"}
        </Button>
      </form>

      {state.error && (
        <div className="mt-4">
          <Alert>{state.error}</Alert>
        </div>
      )}

      {state.searched && !state.error && (
        <div className="mt-5 border-t border-line pt-4">
          {state.results.length === 0 ? (
            <p className="text-muted">No student has that bag number. Check the tag and try again.</p>
          ) : (
            <>
              {state.results.length > 1 && (
                <p className="mb-3 text-sm text-muted">Two bags share this number. Match the letter on the tag.</p>
              )}
              <ul className="space-y-2">
                {state.results.map((s) => {
                  return (
                    <li
                      key={s.student_id}
                      className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-line px-4 py-3"
                    >
                      <div className="flex items-center gap-3">
                        <BagTag prefix={s.bag_prefix} number={s.bag_number} size="md" />
                        <span className="font-medium">{s.full_name}</span>
                      </div>
                      <BagStatus student={s} />
                    </li>
                  );
                })}
              </ul>
            </>
          )}
        </div>
      )}
    </Card>
  );
}

// Where this student's bag is right now, with the page that handles that step.
function BagStatus({ student }) {
  const tag = `${student.bag_prefix}${student.bag_number}`;
  switch (student.order_status) {
    case "SUBMITTED":
      return <ButtonLink href={`/counter/orders/${student.order_id}`}>Count this bag</ButtonLink>;
    case "RECEIVED":
      return (
        <ButtonLink variant="secondary" href="/fines/wash">
          Counted, in the wash
        </ButtonLink>
      );
    case "READY":
      return (
        <ButtonLink variant="secondary" href={`/fines/pickup?bag=${tag}`}>
          Ready for pickup
        </ButtonLink>
      );
    default:
      return <span className="text-sm text-muted">No bag handed in</span>;
  }
}
