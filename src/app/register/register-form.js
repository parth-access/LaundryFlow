"use client";

import { useActionState, useState } from "react";
import { registerStudent } from "./actions";
import { BagTag } from "@/components/ui";

const input =
  "w-full rounded-xl border border-field bg-white px-4 py-3 text-ink placeholder:text-zinc-400 focus:border-ink focus:outline-none";
const label = "mb-1.5 block text-sm font-medium";

export default function RegisterForm({ email, suggestedName }) {
  const [state, action, pending] = useActionState(registerStudent, null);
  const values = state?.values ?? { full_name: suggestedName, enrollment_no: "", bag_prefix: "B", bag_number: "" };
  const [prefix, setPrefix] = useState(values.bag_prefix);
  const [number, setNumber] = useState(values.bag_number);

  return (
    <form action={action} className="space-y-5">
      {state?.error && (
        <p role="alert" className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-800">
          {state.error}
        </p>
      )}

      <p className="text-sm text-muted">
        Signed in as <span className="font-medium text-ink">{email}</span>
      </p>

      <div>
        <label htmlFor="full_name" className={label}>Full name</label>
        <input id="full_name" name="full_name" defaultValue={values.full_name} required maxLength={100} autoComplete="name" className={input} />
      </div>

      <div>
        <label htmlFor="enrollment_no" className={label}>Enrollment number</label>
        <input id="enrollment_no" name="enrollment_no" defaultValue={values.enrollment_no} required inputMode="numeric" pattern="[0-9]{10}" placeholder="2501010325" className={input} />
      </div>

      <fieldset>
        <legend className={label}>Bag tag</legend>
        <div className="flex gap-2">
          <div className="flex shrink-0 rounded-xl border border-field bg-white p-1" role="radiogroup" aria-label="Hostel">
            {["B", "G"].map((p) => (
              <label key={p} className={`cursor-pointer rounded-lg px-4 py-2 font-semibold transition-colors ${prefix === p ? "bg-peach text-ink" : "text-muted hover:text-ink"}`}>
                <input type="radio" name="bag_prefix" value={p} checked={prefix === p} onChange={() => setPrefix(p)} className="sr-only" />
                {p}
              </label>
            ))}
          </div>
          <input
            name="bag_number"
            value={number}
            onChange={(e) => setNumber(e.target.value.replace(/\D/g, "").slice(0, 5))}
            required
            inputMode="numeric"
            pattern="[0-9]{1,5}"
            placeholder="1054"
            aria-label="Bag number"
            className={input}
          />
        </div>
        <div className="mt-4 flex items-center gap-3 rounded-xl bg-peach-soft p-4">
          <BagTag prefix={prefix} number={number || "····"} size="md" />
          <p className="text-sm text-muted">Staff check this against your bag the first time you hand in laundry.</p>
        </div>
      </fieldset>

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-full bg-peach px-4 py-3.5 font-medium text-ink transition-colors hover:bg-peach-hover disabled:opacity-60"
      >
        {pending ? "Saving…" : "Save and continue"}
      </button>
    </form>
  );
}
