// OWNER: Aarabdh. One order: where it is, the count, and any fine.
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { requireAccess } from "@/lib/auth";
import { run } from "@/lib/db";
import { AppPage } from "@/components/app-page";
import { Alert, Card, OrderTracker, StatusBadge, money, when } from "@/components/ui";

export const metadata = { title: "Order | LaundryFlow" };

export default function OrderPage({ params, searchParams }) {
  return (
    <AppPage title="Your order" back={{ href: "/student/orders", label: "My orders" }}>
      <Suspense fallback={<p className="text-muted">Loading…</p>}>
        <Order params={params} searchParams={searchParams} />
      </Suspense>
    </AppPage>
  );
}

async function Order({ params, searchParams }) {
  const { student } = await requireAccess(["student"]);
  const { id } = await params;
  const { new: isNew } = await searchParams;
  if (!/^[1-9][0-9]{0,9}$/.test(id)) notFound();

  const [order] = await run("R11", [Number(id), student.student_id]);
  if (!order) notFound();

  const extra = order.verified_count !== null && order.free_limit !== null ? Math.max(0, order.verified_count - order.free_limit) : 0;

  return (
    <>
      {isNew && <Alert kind="success">Handed in. Take your bag to the laundry counter.</Alert>}

      <Card>
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <p className="text-muted">Handed in {when(order.submitted_at)}</p>
          <StatusBadge status={order.order_status} />
        </div>
        <OrderTracker order={order} />
      </Card>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <p className="text-sm text-muted">Clothes</p>
          <p className="mt-1 font-display text-4xl font-semibold tabular-nums">{order.verified_count ?? order.declared_count}</p>
          <p className="mt-1 text-sm text-muted">
            {order.verified_count === null
              ? "Your count. Staff will recount at the counter."
              : order.verified_count === order.declared_count
                ? "Counted by staff, matches your count."
                : `Counted by staff. You said ${order.declared_count}.`}
          </p>
        </Card>

        <Card>
          <p className="text-sm text-muted">Fine</p>
          {order.fine_amount ? (
            <>
              <p className="mt-1 font-display text-4xl font-semibold tabular-nums">{money(order.fine_amount)}</p>
              <p className="mt-1 text-sm text-muted">
                {extra} over the free {order.free_limit} at {money(order.fine_per_extra)} each.{" "}
                {order.fine_status === "UNPAID" && <span className="font-medium text-red-700">Pay at the counter.</span>}
                {order.fine_status === "PAID" && `Paid ${when(order.fine_paid_at)}.`}
                {order.fine_status === "WAIVED" && `Waived: ${order.waiver_reason}`}
              </p>
            </>
          ) : (
            <>
              <p className="mt-1 font-display text-4xl font-semibold">None</p>
              <p className="mt-1 text-sm text-muted">
                {order.verified_count === null ? "Worked out when staff count your clothes." : "Within the free limit."}
              </p>
            </>
          )}
        </Card>
      </div>
    </>
  );
}
