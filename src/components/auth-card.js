// Shared frame for the sign-in and register screens.
import Link from "next/link";

export function AuthCard({ title, subtitle, children, aside }) {
  return (
    <div className="grid min-h-dvh flex-1 lg:grid-cols-[1fr_28rem]">
      <section className="hidden flex-col justify-between bg-peach-soft p-12 lg:flex">
        <Link href="/" className="text-lg font-semibold tracking-tight">
          Laundry<span className="text-brand">Flow</span>
        </Link>
        <div className="max-w-md">{aside}</div>
        <p className="text-sm text-muted">Hostel laundry at NST Rishihood University</p>
      </section>

      <main className="flex flex-col justify-center px-6 py-12 sm:px-10">
        <Link href="/" className="mb-10 text-lg font-semibold tracking-tight lg:hidden">
          Laundry<span className="text-brand">Flow</span>
        </Link>
        <div className="w-full max-w-sm">
          <h1 className="text-3xl font-semibold tracking-tight">{title}</h1>
          {subtitle && <p className="mt-2 text-muted">{subtitle}</p>}
          <div className="mt-8">{children}</div>
        </div>
      </main>
    </div>
  );
}
