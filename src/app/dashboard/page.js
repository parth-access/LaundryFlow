import { Suspense } from "react";
import Link from "next/link";
import { requireAccess } from "@/lib/auth";
import { signOut } from "@/app/auth/actions";

export const metadata = { title: "Dashboard | LaundryFlow" };

export default function DashboardPage() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center px-6 py-24">
      <div className="w-full max-w-md space-y-6 text-center">
        <Suspense fallback={<p className="text-zinc-500">Loading...</p>}>
          <Dashboard />
        </Suspense>
      </div>
    </main>
  );
}

async function Dashboard() {
  const access = await requireAccess(["student", "staff"]);

  return (
    <>
      {access.kind === "staff" ? (
        <>
          <h1 className="text-3xl font-semibold tracking-tight">Laundry counter</h1>
          <p>
            Signed in as <strong>{access.staff.full_name}</strong> ({access.staff.role.toLowerCase()}).
          </p>
          <div className="flex justify-center gap-3">
            <Link href="/counter" className="rounded-lg bg-zinc-900 px-4 py-2 font-medium text-white dark:bg-white dark:text-zinc-900">Counter</Link>
            <Link href="/fines" className="rounded-lg bg-zinc-900 px-4 py-2 font-medium text-white dark:bg-white dark:text-zinc-900">Fines and pickup</Link>
          </div>
        </>
      ) : (
        <>
          <h1 className="text-3xl font-semibold tracking-tight">Hello, {access.student.full_name}</h1>
          <p>
            Your bag tag is{" "}
            <strong>
              {access.student.bag_prefix} {access.student.bag_number}
            </strong>{" "}
            ({access.student.bag_verified_at ? "verified by staff" : "not verified yet"}).
          </p>
          <Link href="/student" className="inline-block rounded-lg bg-zinc-900 px-4 py-2 font-medium text-white dark:bg-white dark:text-zinc-900">My laundry</Link>
        </>
      )}

      <form action={signOut}>
        <button type="submit" className="rounded-lg border border-zinc-300 px-4 py-2 text-sm hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-900">
          Sign out
        </button>
      </form>
    </>
  );
}
