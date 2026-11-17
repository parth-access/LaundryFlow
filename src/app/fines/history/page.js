// OWNER: Dhruv. Fines that were paid or waived (last 50), so an admin can check them.
import { Suspense } from "react";
import { requireAccess } from "@/lib/auth";
import { AppPage } from "@/components/app-page";
import { BagTag, EmptyState, List, ListRow, money, when } from "@/components/ui";
import FinesFrame from "../frame";

export const metadata = { title: "Fines history | LaundryFlow" };

export default function HistoryPage({ searchParams }) {
  return (
    <AppPage title="Wash & fines" subtitle="Bags move from washing to pickup, and fines get settled here.">
      <Suspense fallback={<p className="text-muted">Loading…</p>}>
        <History searchParams={searchParams} />
      </Suspense>
    </AppPage>
  );
}

async function History({ searchParams }) {
  await requireAccess(["staff"]);
  return (
    <FinesFrame current="/fines/history" searchParams={searchParams}>
      {(fines) =>
        fines.length === 0 ? (
          <EmptyState title="No settled fines yet">Fines show here once they are paid or waived.</EmptyState>
        ) : (
          <List>
            {fines.map((f) => (
              <ListRow
                key={f.order_id}
                aside={
                  <div className="text-right">
                    <p className={`font-semibold ${f.fine_status === "WAIVED" ? "text-muted line-through" : ""}`}>
                      {money(f.fine_amount)}
                    </p>
                    <p className="text-sm text-muted">{f.fine_status === "PAID" ? "Paid" : "Waived"}</p>
                  </div>
                }
              >
                <div className="flex flex-wrap items-center gap-2">
                  <BagTag prefix={f.bag_prefix} number={f.bag_number} />
                  <span className="font-medium">{f.full_name}</span>
                </div>
                <p className="mt-1 text-sm text-muted">
                  {f.fine_status === "PAID"
                    ? `Paid ${when(f.fine_paid_at)}`
                    : `Waived by ${f.waived_by_name}: "${f.waiver_reason}"`}
                </p>
              </ListRow>
            ))}
          </List>
        )
      }
    </FinesFrame>
  );
}
