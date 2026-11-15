/**
 * Shared building blocks so all screens look the same. Use these instead of
 * styling buttons and cards from scratch. Add new shared pieces here (tell the team).
 */
import Link from "next/link";

export function Page({ title, subtitle, back = "/dashboard", children }) {
  return (
    <main className="mx-auto w-full max-w-4xl flex-1 space-y-6 px-4 py-8 sm:px-6 sm:py-10">
      <div className="space-y-1">
        {back && (
          <Link href={back} className="text-sm text-zinc-500 hover:text-teal-600 dark:hover:text-teal-400">
            &larr; Back
          </Link>
        )}
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">{title}</h1>
        {subtitle && <p className="text-zinc-500">{subtitle}</p>}
      </div>
      {children}
    </main>
  );
}

export function Card({ children, className = "" }) {
  return (
    <section
      className={`rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-950 ${className}`}
    >
      {children}
    </section>
  );
}

const buttonStyles = {
  primary: "bg-teal-600 text-white hover:bg-teal-700 focus-visible:outline-teal-600",
  secondary: "border border-zinc-300 hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-900",
  danger: "bg-red-600 text-white hover:bg-red-500",
};

export function Button({ variant = "primary", className = "", ...props }) {
  return (
    <button
      className={`rounded-lg px-4 py-2 font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-60 ${buttonStyles[variant]} ${className}`}
      {...props}
    />
  );
}

export function BagTag({ prefix, number }) {
  return (
    <span className="rounded-md bg-zinc-100 px-2 py-0.5 font-mono font-semibold dark:bg-zinc-800">
      {prefix} {number}
    </span>
  );
}

const statusColors = {
  SUBMITTED: "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-200",
  RECEIVED: "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-200",
  READY: "bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-200",
  COLLECTED: "bg-zinc-200 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300",
  CANCELLED: "bg-zinc-200 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400",
  DISPUTED: "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-200",
};

export function StatusBadge({ status }) {
  return (
    <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${statusColors[status] ?? ""}`}>
      {status.toLowerCase()}
    </span>
  );
}

export function Alert({ children, kind = "error" }) {
  const styles =
    kind === "error"
      ? "border-red-300 bg-red-50 text-red-800 dark:border-red-900 dark:bg-red-950 dark:text-red-200"
      : "border-green-300 bg-green-50 text-green-800 dark:border-green-900 dark:bg-green-950 dark:text-green-200";
  return (
    <p role="alert" className={`rounded-lg border p-3 text-sm ${styles}`}>
      {children}
    </p>
  );
}

/** Rs 15.00 style money. Postgres NUMERIC arrives as a string. */
export function money(value) {
  return `Rs ${Number(value ?? 0).toFixed(2)}`;
}

/** 11 Nov, 2:30 pm, in India time. */
export function when(value) {
  if (!value) return "-";
  return new Date(value).toLocaleString("en-IN", {
    timeZone: "Asia/Kolkata",
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
  });
}
