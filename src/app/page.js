// OWNER: Parth (UI). Landing page.
import Link from "next/link";
import { BagTag, OrderTracker } from "@/components/ui";

// A sample order, so the hero shows the real tracker students see.
const SAMPLE = {
  order_status: "READY",
  submitted_at: "2026-11-16T03:40:00Z",
  received_at: "2026-11-16T05:10:00Z",
  ready_at: "2026-11-16T11:30:00Z",
  collected_at: null,
};

const steps = [
  { title: "Hand in from your phone", text: "Say how many clothes are in the bag. No paper register." },
  { title: "Counted at the counter", text: "Staff find your bag by its tag and count. Any fine is worked out for them." },
  { title: "Collect when it's ready", text: "Your phone shows when it's washed. Staff mark it collected." },
];

export default function Home() {
  return (
    <div className="flex flex-1 flex-col">
      <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-5">
        <span className="text-lg font-semibold tracking-tight">
          Laundry<span className="text-brand">Flow</span>
        </span>
        <Link href="/login" className="rounded-full border border-field px-4 py-2 text-sm font-medium hover:bg-peach-soft">
          Sign in
        </Link>
      </header>

      <main className="mx-auto w-full max-w-6xl flex-1 px-6">
        <section className="grid items-center gap-14 py-14 lg:grid-cols-[1.1fr_1fr] lg:py-24">
          <div>
            <h1 className="text-5xl font-semibold leading-[1.02] tracking-tight sm:text-6xl">
              Know where your laundry bag is.
            </h1>
            <p className="mt-6 max-w-md text-lg text-muted">
              The hostel laundry register, on your phone. Hand in, get counted, and see the moment it&apos;s ready.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/login" className="rounded-full bg-peach px-6 py-3.5 font-medium text-ink hover:bg-peach-hover">
                Sign in with college Google
              </Link>
              <a href="#how" className="rounded-full px-6 py-3.5 font-medium text-muted hover:text-ink">
                How it works
              </a>
            </div>
          </div>

          <div className="relative">
            <div className="absolute -left-4 -top-6 z-10 rotate-[-6deg] sm:-left-8">
              <BagTag prefix="B" number="1054" size="lg" />
            </div>
            <div className="rounded-3xl border border-line bg-white p-7 pt-16 sm:pt-24 shadow-[0_24px_60px_-30px_rgba(54,65,83,0.35)]">
              <div className="mb-6 flex items-baseline justify-between">
                <p className="font-display text-xl font-semibold">Your order</p>
                <p className="text-sm text-muted">13 clothes</p>
              </div>
              <OrderTracker order={SAMPLE} />
            </div>
          </div>
        </section>

        <section id="how" className="scroll-mt-8 border-t border-line py-16">
          <h2 className="text-3xl font-semibold tracking-tight">How it works</h2>
          <ol className="mt-10 grid gap-10 sm:grid-cols-3">
            {steps.map((s, i) => (
              <li key={s.title}>
                <span className="font-display text-5xl font-semibold text-peach-hover">{i + 1}</span>
                <h3 className="mt-3 text-lg font-semibold">{s.title}</h3>
                <p className="mt-1 text-muted">{s.text}</p>
              </li>
            ))}
          </ol>
        </section>

        <section className="py-10">
          <div className="flex flex-col gap-6 rounded-3xl bg-peach-soft p-8 sm:flex-row sm:items-center sm:justify-between sm:p-10">
            <div>
              <p className="font-display text-3xl font-semibold tracking-tight">10 clothes free per bag.</p>
              <p className="mt-2 text-muted">Rs 5 for each one over. Worked out at the counter, shown on your phone.</p>
            </div>
            <Link href="/login" className="shrink-0 self-start rounded-full bg-ink px-6 py-3.5 font-medium text-white hover:bg-ink/90 sm:self-auto">
              Get started
            </Link>
          </div>
        </section>
      </main>

      <footer className="mx-auto w-full max-w-6xl px-6 py-10 text-sm text-muted">
        LaundryFlow, a student project at NST Rishihood University
      </footer>
    </div>
  );
}
