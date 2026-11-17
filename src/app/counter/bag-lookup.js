"use client";

import { useActionState, useState } from "react";
import { Alert, BagTag, Button, Card } from "@/components/ui";
import { searchBags, verifyBag } from "./actions";

const initialSearchState = { searched: false, error: null, results: [] };
const initialVerifyState = { error: null, studentId: null, verified: false };

export default function BagLookup() {
  const [searchState, searchAction, searching] = useActionState(
    searchBags,
    initialSearchState,
  );
  const [selectedId, setSelectedId] = useState(null);

  return (
    <Card>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-ink">
            Bag lookup
          </p>
          <h2 className="mt-1 text-lg font-semibold">Find the right bag</h2>
          <p className="mt-1 max-w-xl text-sm text-muted">
            Search by the number on the tag, then confirm its prefix. A number can belong to more than one bag.
          </p>
        </div>
        <span className="rounded-full bg-peach-soft px-3 py-1 text-xs font-medium text-ink">
          Search by number
        </span>
      </div>

      <form
        action={searchAction}
        onSubmit={() => setSelectedId(null)}
        className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-end"
      >
        <div className="min-w-0 flex-1">
          <label htmlFor="bag_number" className="mb-1.5 block text-sm font-medium">
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
            placeholder="Enter the number on the tag"
            className="w-full rounded-lg border border-field bg-white px-3 py-2.5 text-base outline-none transition focus:border-ink focus:ring-2 focus:ring-peach"
          />
        </div>
        <Button type="submit" disabled={searching} className="min-h-11 sm:min-w-32">
          {searching ? "Searching…" : "Find bag"}
        </Button>
      </form>

      {searchState.error && <Alert>{searchState.error}</Alert>}

      {searchState.searched && !searchState.error && (
        <div className="mt-5 border-t border-line pt-4">
          <div className="mb-3 flex items-center justify-between gap-3">
            <h3 className="text-sm font-semibold">
              {searchState.results.length === 0
                ? "No matching bags"
                : `${searchState.results.length} matching ${searchState.results.length === 1 ? "bag" : "bags"}`}
            </h3>
            {searchState.results.length > 1 && (
              <span className="text-xs text-muted">Select the exact prefix</span>
            )}
          </div>

          {searchState.results.length > 0 && (
            <ul className="space-y-2">
              {searchState.results.map((student) => (
                <BagResult
                  key={student.student_id}
                  student={student}
                  selected={selectedId === student.student_id}
                  onSelect={() => setSelectedId(student.student_id)}
                />
              ))}
            </ul>
          )}
        </div>
      )}
    </Card>
  );
}

function BagResult({ student, selected, onSelect }) {
  const [verifyState, verifyAction, verifying] = useActionState(
    verifyBag,
    initialVerifyState,
  );
  const verified = Boolean(student.bag_verified_at) ||
    (verifyState.verified && verifyState.studentId === student.student_id);

  return (
    <li
      className={`rounded-xl border p-3 transition-colors ${
        selected
          ? "border-peach-hover bg-peach-soft ring-1 ring-peach-hover/60"
          : "border-line bg-zinc-50/70"
      }`}
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <Button
          type="button"
          variant="secondary"
          aria-pressed={selected}
          onClick={onSelect}
          className="flex min-h-12 flex-1 items-center justify-between gap-3 text-left"
        >
          <span className="flex min-w-0 items-center gap-3">
            <BagTag prefix={student.bag_prefix} number={student.bag_number} />
            <span className="truncate font-medium">{student.full_name}</span>
          </span>
          <span className="shrink-0 text-xs text-muted">
            {selected ? "Selected" : "Select"}
          </span>
        </Button>

        {verified ? (
          <span className="inline-flex items-center gap-2 self-start rounded-full bg-green-100 px-3 py-1.5 text-xs font-semibold text-green-800 sm:self-auto">
            <span aria-hidden className="size-1.5 rounded-full bg-green-600" />
            Bag verified
          </span>
        ) : selected ? (
          // Show Verify only on the bag staff selected, so the wrong B or G bag is not verified.
          <form action={verifyAction} className="self-start sm:self-auto">
            <input type="hidden" name="student_id" value={student.student_id} />
            <Button type="submit" variant="secondary" disabled={verifying} className="min-h-10 text-sm">
              {verifying ? "Verifying…" : "Verify bag"}
            </Button>
          </form>
        ) : null}
      </div>

      {verifyState.error && verifyState.studentId === student.student_id && (
        <div className="mt-3"><Alert>{verifyState.error}</Alert></div>
      )}
      {verifyState.verified && verifyState.studentId === student.student_id && (
        <div className="mt-3"><Alert kind="success">Bag verification saved.</Alert></div>
      )}
    </li>
  );
}
