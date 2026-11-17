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
          <Link href={back} className="text-sm text-muted hover:text-brand">
            &larr; Back
          </Link>
        )}
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">{title}</h1>
        {subtitle && <p className="text-muted">{subtitle}</p>}
      </div>
      {children}
    </main>
  );
}

export function Card({ children, className = "" }) {
  return (
    <section
      className={`rounded-2xl border border-line bg-white p-5 shadow-sm ${className}`}
    >
      {children}
    </section>
  );
}

const buttonStyles = {
  primary: "bg-peach text-ink hover:bg-peach-hover focus-visible:outline-ink",
  secondary: "border border-field hover:bg-zinc-100",
  danger: "bg-red-600 text-white hover:bg-red-500",
};

export function Button({ variant = "primary", className = "", ...props }) {
  return (
    <button
      className={`rounded-full px-5 py-2 font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-60 ${buttonStyles[variant]} ${className}`}
      {...props}
    />
  );
}

export function BagTag({ prefix, number }) {
  return (
    <span className="rounded-md bg-zinc-100 px-2 py-0.5 font-mono font-semibold">
      {prefix} {number}
    </span>
  );
}

const statusColors = {
  SUBMITTED: "bg-blue-100 text-blue-800",
  RECEIVED: "bg-amber-100 text-amber-800",
  READY: "bg-green-100 text-green-800",
  COLLECTED: "bg-zinc-200 text-zinc-700",
  CANCELLED: "bg-zinc-200 text-muted",
  DISPUTED: "bg-red-100 text-red-800",
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
      ? "border-red-300 bg-red-50 text-red-800"
      : "border-green-300 bg-green-50 text-green-800";
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
