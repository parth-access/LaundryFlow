/**
 * Shared building blocks so all screens look the same. Use these instead of
 * styling buttons and cards from scratch. Add new shared pieces here (tell the team).
 * Client-safe: no server-only imports in this file.
 */
import Link from "next/link";

/** Page title area. `back` is an optional { href, label } link shown above the title. */
export function PageHeader({ title, subtitle, back, action }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div className="min-w-0">
        {back && (
          <Link href={back.href} className="mb-2 inline-flex items-center gap-1 text-sm text-muted hover:text-ink">
            <span aria-hidden>&larr;</span> {back.label}
          </Link>
        )}
        <h1 className="text-2xl font-semibold text-foreground sm:text-[1.75rem]">{title}</h1>
        {subtitle && <p className="mt-1 max-w-prose text-muted">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

/** Older layout helper, kept so existing pages keep working. Prefer PageHeader inside AppPage. */
export function Page({ title, subtitle, back = "/dashboard", children }) {
  return (
    <main className="mx-auto w-full max-w-4xl flex-1 space-y-6 px-4 py-8 sm:px-6 sm:py-10">
      <PageHeader title={title} subtitle={subtitle} back={back ? { href: back, label: "Back" } : null} />
      {children}
    </main>
  );
}

export function Card({ children, className = "" }) {
  return <section className={`rounded-2xl border border-line bg-white p-5 sm:p-6 ${className}`}>{children}</section>;
}

const buttonStyles = {
  primary: "bg-peach text-ink hover:bg-peach-hover",
  secondary: "border border-field bg-white text-ink hover:bg-peach-soft",
  danger: "bg-red-600 text-white hover:bg-red-500",
};

export function Button({ variant = "primary", className = "", ...props }) {
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 rounded-full px-5 py-2.5 font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${buttonStyles[variant]} ${className}`}
      {...props}
    />
  );
}

/** A link that looks like a Button. */
export function ButtonLink({ variant = "primary", className = "", ...props }) {
  return (
    <Link
      className={`inline-flex items-center justify-center gap-2 rounded-full px-5 py-2.5 font-medium transition-colors ${buttonStyles[variant]} ${className}`}
      {...props}
    />
  );
}

/**
 * The bag tag, drawn like the paper tag tied to a laundry bag: a punched hole
 * on the left, the letter and number on the right. size: "sm" | "md" | "lg".
 */
export function BagTag({ prefix, number, size = "sm" }) {
  const s = {
    sm: { box: "h-7 pl-5 pr-2.5 text-sm", hole: "left-1.5 size-2" },
    md: { box: "h-10 pl-7 pr-4 text-lg", hole: "left-2.5 size-2.5" },
    lg: { box: "h-20 pl-12 pr-8 text-4xl sm:h-24 sm:text-5xl", hole: "left-4 size-4" },
  }[size];
  return (
    <span
      className={`relative inline-flex shrink-0 items-center rounded-[0.6rem] border border-peach-hover bg-peach-soft font-display font-semibold tabular-nums text-ink ${s.box}`}
      aria-label={`Bag ${prefix} ${number}`}
    >
      <span aria-hidden className={`absolute top-1/2 -translate-y-1/2 rounded-full border border-peach-hover bg-background ${s.hole}`} />
      {prefix}&nbsp;{number}
    </span>
  );
}

const statusStyles = {
  SUBMITTED: "bg-blue-50 text-blue-800 ring-blue-200",
  RECEIVED: "bg-amber-50 text-amber-800 ring-amber-200",
  READY: "bg-green-50 text-green-800 ring-green-200",
  COLLECTED: "bg-zinc-100 text-zinc-700 ring-zinc-200",
  CANCELLED: "bg-zinc-100 text-zinc-500 ring-zinc-200",
  DISPUTED: "bg-red-50 text-red-800 ring-red-200",
};

const statusWords = {
  SUBMITTED: "Handed in",
  RECEIVED: "Counted",
  READY: "Ready to collect",
  COLLECTED: "Collected",
  CANCELLED: "Cancelled",
  DISPUTED: "Disputed",
};

export function StatusBadge({ status }) {
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${statusStyles[status] ?? ""}`}>
      {statusWords[status] ?? status.toLowerCase()}
    </span>
  );
}

/**
 * Where an order is in its life: handed in -> counted -> ready -> collected.
 * Pass the order row (needs order_status and the *_at timestamps).
 */
export function OrderTracker({ order }) {
  const steps = [
    { key: "SUBMITTED", label: "Handed in", at: order.submitted_at },
    { key: "RECEIVED", label: "Counted at the counter", at: order.received_at },
    { key: "READY", label: "Washed, ready to collect", at: order.ready_at },
    { key: "COLLECTED", label: "Collected", at: order.collected_at },
  ];
  const reached = steps.filter((s) => s.at).length;
  return (
    <ol className="relative space-y-5">
      {steps.map((s, i) => {
        const done = Boolean(s.at);
        const current = i === reached - 1 && order.order_status !== "COLLECTED";
        return (
          <li key={s.key} className="relative flex gap-4">
            {i < steps.length - 1 && (
              <span aria-hidden className={`absolute left-[0.6875rem] top-6 h-[calc(100%+0.25rem)] w-0.5 ${i < reached - 1 ? "bg-ink" : "bg-line"}`} />
            )}
            <span
              aria-hidden
              className={`relative z-[1] mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${
                done ? "bg-ink text-white" : "border-2 border-line bg-white text-muted"
              } ${current ? "ring-4 ring-peach" : ""}`}
            >
              {done ? "✓" : i + 1}
            </span>
            <div className="min-w-0">
              <p className={`font-medium ${done ? "text-foreground" : "text-muted"}`}>{s.label}</p>
              <p className="text-sm text-muted">{done ? when(s.at) : "Not yet"}</p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}

/** Message shown when a list is empty: what it means and what to do. */
export function EmptyState({ title, children, action }) {
  return (
    <div className="rounded-2xl border border-dashed border-field bg-white px-6 py-12 text-center">
      <p className="font-display text-lg font-semibold">{title}</p>
      {children && <p className="mx-auto mt-1 max-w-sm text-sm text-muted">{children}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

/** A list inside a card. Rows are <ListRow>. */
export function List({ children }) {
  return <ul className="divide-y divide-line overflow-hidden rounded-2xl border border-line bg-white">{children}</ul>;
}

/** One row. With href the whole row is a link to a detail page. */
export function ListRow({ href, children, aside }) {
  const inner = (
    <div className="flex items-center gap-4 px-4 py-4 sm:px-5">
      <div className="min-w-0 flex-1">{children}</div>
      {aside && <div className="shrink-0 text-right">{aside}</div>}
      {href && (
        <span aria-hidden className="shrink-0 text-xl leading-none text-muted transition-transform group-hover:translate-x-0.5">
          &rsaquo;
        </span>
      )}
    </div>
  );
  return (
    <li>
      {href ? (
        <Link href={href} className="group block hover:bg-peach-soft/60 focus-visible:bg-peach-soft/60">
          {inner}
        </Link>
      ) : (
        inner
      )}
    </li>
  );
}

/** Tabs between sibling pages, e.g. Wash / Pickup / Fines. `current` is the active href. */
export function Tabs({ items, current }) {
  return (
    <nav aria-label="Sections" className="mb-6 flex w-fit max-w-full gap-1 overflow-x-auto rounded-full border border-line bg-white p-1 text-sm">
      {items.map((t) => {
        const active = t.href === current;
        return (
          <Link
            key={t.href}
            href={t.href}
            aria-current={active ? "page" : undefined}
            className={`flex items-center gap-2 whitespace-nowrap rounded-full px-4 py-2 font-medium ${
              active ? "bg-peach text-ink" : "text-muted hover:text-ink"
            }`}
          >
            {t.label}
            {t.count !== undefined && (
              <span className={`rounded-full px-1.5 text-xs tabular-nums ${active ? "bg-white/70" : "bg-line/70"}`}>{t.count}</span>
            )}
          </Link>
        );
      })}
    </nav>
  );
}

export function Alert({ children, kind = "error" }) {
  const styles =
    kind === "error" ? "border-red-200 bg-red-50 text-red-800" : "border-green-200 bg-green-50 text-green-800";
  return (
    <p role={kind === "error" ? "alert" : "status"} className={`rounded-xl border px-4 py-3 text-sm ${styles}`}>
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
