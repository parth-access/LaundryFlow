// OWNER: Tanishq. Count one bag: enter the real number of clothes, see the fine, receive it.
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { requireAccess } from "@/lib/auth";
import { run } from "@/lib/db";
import { AppPage } from "@/components/app-page";
import { BagTag, ButtonLink, Card, EmptyState, StatusBadge, when } from "@/components/ui";
import ReceivePanel from "../../counter-operations";

export const metadata = { title: "Count bag | LaundryFlow" };

export default function CountPage({ params }) {
  return (
    <AppPage title="Count bag" back={{ href: "/counter", label: "Counter" }}>
      <Suspense fallback={<p className="text-muted">Loading…</p>}>
        <Count params={params} />
      </Suspense>
    </AppPage>
  );
}

async function Count({ params }) {
  await requireAccess(["staff"]);
  const { id } = await params;
  if (!/^[1-9][0-9]{0,9}$/.test(id)) notFound();

  const [[order], [policy]] = await Promise.all([run("R23", [Number(id)]), run("R20")]);
  if (!order) notFound();

  const header = (
    <Card className="flex flex-wrap items-center justify-between gap-5">
      <div className="flex items-center gap-4">
        <BagTag prefix={order.bag_prefix} number={order.bag_number} size="lg" />
      </div>
      <div className="text-right">
        <p className="font-display text-xl font-semibold">{order.full_name}</p>
        <p className="text-sm text-muted">{order.enrollment_no}</p>
        <p className="mt-1 text-sm text-muted">Handed in {when(order.submitted_at)}</p>
      </div>
    </Card>
  );

  if (order.order_status !== "SUBMITTED") {
    return (
      <>
        {header}
        <EmptyState
          title="This bag has already been counted"
          action={<ButtonLink href="/counter">Back to the counter</ButtonLink>}
        >
          <span className="inline-flex items-center gap-2">
            Status now: <StatusBadge status={order.order_status} />
          </span>
        </EmptyState>
      </>
    );
  }

  return (
    <>
      {header}
      <ReceivePanel
        order={{
          order_id: order.order_id,
          student_id: order.student_id,
          declared_count: order.declared_count,
          bag_verified: Boolean(order.bag_verified_at),
        }}
        policy={policy ? { free_limit: policy.free_limit, fine_per_extra: policy.fine_per_extra } : null}
      />
    </>
  );
}
