// OWNER: Aarabdh. Every order this student has handed in.
import { Suspense } from "react";
import { requireAccess } from "@/lib/auth";
import { run } from "@/lib/db";
import { AppPage } from "@/components/app-page";
import { ButtonLink, EmptyState, List, ListRow, StatusBadge, money, when } from "@/components/ui";

export const metadata = { title: "My orders | LaundryFlow" };

export default function OrdersPage() {
  return (
    <AppPage title="My orders">
      <Suspense fallback={<p className="text-muted">Loading…</p>}>
        <Orders />
      </Suspense>
    </AppPage>
  );
}

async function Orders() {
  const { student } = await requireAccess(["student"]);
  const orders = await run("R03", [student.student_id]);

  if (orders.length === 0) {
    return (
      <EmptyState title="No orders yet" action={<ButtonLink href="/student/new">Hand in laundry</ButtonLink>}>
        Your first bag will show up here.
      </EmptyState>
    );
  }

  return (
    <List>
      {orders.map((o) => (
        <ListRow
          key={o.order_id}
          href={`/student/orders/${o.order_id}`}
          aside={
            <div className="space-y-1">
              <StatusBadge status={o.order_status} />
              {o.fine_amount && (
                <p className={`text-sm ${o.fine_status === "UNPAID" ? "font-medium text-red-700" : "text-muted"}`}>
                  {money(o.fine_amount)} {o.fine_status === "UNPAID" ? "due" : o.fine_status.toLowerCase()}
                </p>
              )}
            </div>
          }
        >
          <p className="font-medium">
            {o.verified_count ?? o.declared_count} clothes
            {o.verified_count !== null && o.verified_count !== o.declared_count && (
              <span className="font-normal text-muted"> (you said {o.declared_count})</span>
            )}
          </p>
          <p className="text-sm text-muted">Handed in {when(o.submitted_at)}</p>
        </ListRow>
      ))}
    </List>
  );
}
