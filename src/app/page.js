// OWNER: Parth (UI). Rough landing page: polish on Sat 14 in the UI pass.
import Link from "next/link";

const steps = [
  { n: "1", title: "Sign in once", text: "Use your college Google account and register your bag tag, like B 1054." },
  { n: "2", title: "Submit from your phone", text: "Say how many clothes you are handing in. No paper register." },
  { n: "3", title: "Counted at the counter", text: "Staff find your bag by number and count the clothes. Any fine is worked out automatically." },
  { n: "4", title: "Pick it up", text: "You see when it is ready. Staff mark it collected, so nothing goes missing." },
];

const statuses = [
  { label: "Submitted", color: "bg-blue-100 text-blue-800" },
  { label: "Received", color: "bg-amber-100 text-amber-800" },
  { label: "Ready", color: "bg-green-100 text-green-800" },
  { label: "Collected", color: "bg-zinc-200 text-zinc-700" },
];

export default function Home() {
  return (
    <div className="flex flex-1 flex-col">
      <header className="mx-auto flex w-full max-w-5xl items-center justify-between px-6 py-5">
        <span className="text-lg font-semibold tracking-tight">
          Laundry<span className="text-teal-600">Flow</span>
        </span>
        <Link href="/login" className="rounded-lg px-4 py-2 text-sm font-medium hover:bg-zinc-100">
          Sign in
        </Link>
      </header>

      <main className="mx-auto w-full max-w-5xl flex-1 px-6">
        {/* Hero */}
        <section className="grid items-center gap-12 py-16 md:grid-cols-2 md:py-24">
          <div className="space-y-6">
            <p className="inline-block rounded-full bg-teal-50 px-3 py-1 text-sm font-medium text-teal-700">
              For Rishihood hostel laundry
            </p>
            <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
              The laundry register, <span className="text-teal-600">without the paper.</span>
            </h1>
            <p className="max-w-md text-lg text-zinc-600">
              Submit from your phone, get counted at the counter, and always know where your bag is.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/login"
                className="rounded-lg bg-teal-600 px-5 py-3 font-medium text-white hover:bg-teal-700"
              >
                Sign in with college Google
              </Link>
              <a href="#how" className="rounded-lg border border-zinc-300 px-5 py-3 font-medium hover:bg-zinc-100">
                How it works
              </a>
            </div>
          </div>

          {/* Sample order card */}
          <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="rounded-md bg-zinc-100 px-2 py-0.5 font-mono font-semibold">B 1054</span>
              <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-medium text-amber-800">
                received
              </span>
            </div>
            <dl className="mt-6 grid grid-cols-2 gap-4 text-sm">
              <div>
                <dt className="text-zinc-500">Declared</dt>
                <dd className="text-2xl font-semibold">10</dd>
              </div>
              <div>
                <dt className="text-zinc-500">Counted</dt>
                <dd className="text-2xl font-semibold text-amber-600">13</dd>
              </div>
            </dl>
            <div className="mt-6 rounded-lg bg-red-50 p-3 text-sm text-red-800">
              3 extra x Rs 5 = <strong>Rs 15 fine</strong>, worked out automatically
            </div>
            <div className="mt-6 flex flex-wrap gap-2">
              {statuses.map((s) => (
                <span key={s.label} className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${s.color}`}>
                  {s.label}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* How it works */}
        <section id="how" className="scroll-mt-8 py-12">
          <h2 className="text-2xl font-semibold tracking-tight">How it works</h2>
          <ol className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map((s) => (
              <li key={s.n} className="rounded-xl border border-zinc-200 p-5">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-teal-600 text-sm font-semibold text-white">
                  {s.n}
                </span>
                <h3 className="mt-4 font-medium">{s.title}</h3>
                <p className="mt-1 text-sm text-zinc-600">{s.text}</p>
              </li>
            ))}
          </ol>
        </section>

        {/* The rule */}
        <section className="py-12">
          <div className="grid gap-6 rounded-2xl bg-zinc-900 p-8 text-white sm:grid-cols-3">
            <div>
              <p className="text-4xl font-semibold">10</p>
              <p className="mt-1 text-zinc-400">clothes free per bag</p>
            </div>
            <div>
              <p className="text-4xl font-semibold">Rs 5</p>
              <p className="mt-1 text-zinc-400">for every extra cloth</p>
            </div>
            <div>
              <p className="text-4xl font-semibold">0</p>
              <p className="mt-1 text-zinc-400">lost register entries</p>
            </div>
          </div>
        </section>

        {/* Who it's for */}
        <section className="grid gap-4 py-12 sm:grid-cols-2">
          <div className="rounded-xl border border-zinc-200 p-6">
            <h3 className="font-medium">Students</h3>
            <p className="mt-2 text-sm text-zinc-600">
              Sign in with your <strong>@rishihood.edu.in</strong> account, submit laundry, and see your orders and fines.
            </p>
          </div>
          <div className="rounded-xl border border-zinc-200 p-6">
            <h3 className="font-medium">Laundry staff</h3>
            <p className="mt-2 text-sm text-zinc-600">
              Find a bag by its number, count the clothes, and mark orders ready and collected.
            </p>
          </div>
        </section>
      </main>

      <footer className="mx-auto w-full max-w-5xl px-6 py-8 text-sm text-zinc-500">
        LaundryFlow · a student project at NST Rishihood University
      </footer>
    </div>
  );
}
