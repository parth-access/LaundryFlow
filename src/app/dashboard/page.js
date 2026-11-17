// OWNER: Parth (UI). Home after sign-in: a card per area, with live counts.
import { Suspense } from "react";
import Link from "next/link";
import { requireAccess } from "@/lib/auth";
import { run } from "@/lib/db";
import { Card, BagTag, StatusBadge, money } from "@/components/ui";
import { AppPage } from "@/components/app-page";

export const metadata = { title: "Dashboard | LaundryFlow" };

export default function DashboardPage() {
  return (
    <AppPage title="Dashboard" back={null}>
      <Suspense fallback={<p className="text-muted">Loading...</p>}>
        <Dashboard />
      </Suspense>
    </AppPage>
  );
}

function AreaCard({ href, title, text, stat, statLabel }) {
  return (
    <Link href={href} className="group block">
      <Card className="h-full transition-shadow group-hover:shadow-md group-hover:ring-1 group-hover:ring-peach-hover">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-medium">{title}</h2>
            <p className="mt-1 text-sm text-muted">{text}</p>
          </div>
          {stat !== undefined && (
            <div className="text-right">
              <p className="text-3xl font-semibold text-brand">{stat}</p>
              <p className="text-xs text-muted">{statLabel}</p>
            </div>
          )}
        </div>
        <p className="mt-4 text-sm font-medium text-brand group-hover:underline">Open &rarr;</p>
      </Card>
    </Link>
  );
}

async function Dashboard() {
  const access = await requireAccess(["student", "staff"]);

  if (access.kind === "student") {
    const s = access.student;
    const [active] = await run("R10", [s.student_id]);
    return (
      <div className="space-y-6">
        <Card className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm text-muted">Welcome back</p>
            <p className="text-xl font-semibold">{s.full_name}</p>
          </div>
          <div className="text-right">
            <BagTag prefix={s.bag_prefix} number={s.bag_number} />
            <p className="mt-1 text-xs text-muted">{s.bag_verified_at ? "verified by staff" : "not verified yet"}</p>
          </div>
        </Card>
        <div className="grid gap-4 sm:grid-cols-2">
          <AreaCard
            href="/student"
            title="My laundry"
            text={active ? "Your current order is in progress." : "No laundry in progress. Submit a new bag."}
          />
          {active && (
            <Card className="flex items-center justify-between">
              <span className="text-sm text-muted">Current order</span>
              <StatusBadge status={active.order_status} />
            </Card>
          )}
        </div>
      </div>
    );
  }

  const isAdmin = access.staff.role === "ADMIN";
  const [queue, unpaid] = await Promise.all([run("R02"), run("R30")]);
  const unpaidTotal = unpaid.reduce((sum, f) => sum + Number(f.fine_amount), 0);

  return (
    <div className="space-y-6">
      <p className="text-muted">
        Signed in as <span className="font-medium text-zinc-900">{access.staff.full_name}</span>{" "}
        ({access.staff.role.toLowerCase()})
      </p>
      <div className="grid gap-4 sm:grid-cols-2">
        <AreaCard
          href="/counter"
          title="Counter"
          text="Find a bag, count the clothes, record the fine."
          stat={queue.length}
          statLabel="waiting"
        />
        <AreaCard
          href="/fines"
          title="Fines & pickup"
          text="Mark ready and collected, settle fines."
          stat={unpaid.length}
          statLabel={`unpaid · ${money(unpaidTotal)}`}
        />
        {isAdmin && <AreaCard href="/admin" title="Admin" text="Staff accounts, fine policy and numbers." />}
      </div>
    </div>
  );
}
