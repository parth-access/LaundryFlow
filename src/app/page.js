import Link from "next/link";

export default function Home() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-4 px-6 py-24 text-center">
      <h1 className="text-4xl font-semibold tracking-tight">LaundryFlow</h1>
      <p className="max-w-md text-lg text-zinc-600 dark:text-zinc-400">
        Digital laundry register: students submit, staff verify, fines are
        calculated automatically.
      </p>
      <Link
        href="/login"
        className="rounded-lg bg-zinc-900 px-5 py-3 font-medium text-white hover:bg-zinc-700 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
      >
        Sign in
      </Link>
    </main>
  );
}
