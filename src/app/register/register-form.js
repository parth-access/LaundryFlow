"use client";

import { useActionState } from "react";
import { registerStudent } from "./actions";

const input =
  "w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-white";

export default function RegisterForm({ email, suggestedName }) {
  const [state, action, pending] = useActionState(registerStudent, null);
  const values = state?.values ?? { full_name: suggestedName, enrollment_no: "", bag_prefix: "B", bag_number: "" };

  return (
    <form action={action} className="space-y-4 text-left">
      {state?.error && (
        <p role="alert" className="rounded-lg border border-red-300 bg-red-50 p-3 text-sm text-red-800 dark:border-red-900 dark:bg-red-950 dark:text-red-200">
          {state.error}
        </p>
      )}

      <div>
        <label className="mb-1 block text-sm font-medium">College email</label>
        <input value={email} readOnly className={`${input} opacity-70`} />
      </div>

      <div>
        <label htmlFor="full_name" className="mb-1 block text-sm font-medium">Full name</label>
        <input id="full_name" name="full_name" defaultValue={values.full_name} required maxLength={100} autoComplete="name" className={input} />
      </div>

      <div>
        <label htmlFor="enrollment_no" className="mb-1 block text-sm font-medium">Enrollment number</label>
        <input id="enrollment_no" name="enrollment_no" defaultValue={values.enrollment_no} required inputMode="numeric" pattern="[0-9]{10}" placeholder="2501010325" className={input} />
      </div>

      <div>
        <span className="mb-1 block text-sm font-medium">Bag tag</span>
        <div className="flex gap-2">
          <select name="bag_prefix" defaultValue={values.bag_prefix} aria-label="Bag tag letter" className={`${input} w-24`}>
            <option value="B">B</option>
            <option value="G">G</option>
          </select>
          <input name="bag_number" defaultValue={values.bag_number} required inputMode="numeric" pattern="[0-9]{1,5}" placeholder="1054" aria-label="Bag number" className={input} />
        </div>
        <p className="mt-1 text-xs text-zinc-500">Staff will check your bag tag the first time you hand in laundry.</p>
      </div>

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-lg bg-zinc-900 px-4 py-3 font-medium text-white hover:bg-zinc-700 disabled:opacity-60 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
      >
        {pending ? "Saving..." : "Create my profile"}
      </button>
    </form>
  );
}
