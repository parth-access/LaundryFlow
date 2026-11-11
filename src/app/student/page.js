// OWNER: Aarabdh. Student side: submit laundry + my orders.
// Your query ids: R10-R19, W10-W19 (in src/lib/queries.js). See TEAM.md for your task list.
import { Suspense } from "react";
import { requireAccess } from "@/lib/auth";
import { run } from "@/lib/db";
import { Page, Card, BagTag, StatusBadge, money, when } from "@/components/ui";

export const metadata = { title: "My laundry | LaundryFlow" };

export default function StudentPage() {
  return (
    <Page title="My laundry">
      <Suspense fallback={<p className="text-zinc-500">Loading...</p>}>
        <StudentHome />
      </Suspense>
    </Page>
  );
}

async function StudentHome() {
  const { student } = await requireAccess(["student"]);
  const orders = await run("R03", [student.student_id]); // working example: history with fines

  return (
    <>
      <Card>
        <p>
          Bag tag <BagTag prefix={student.bag_prefix} number={student.bag_number} />
        </p>
        {/* TODO (Aarabdh): "Submit laundry" form -> server action in ./actions.js -> run("W01", [...]) */}
        <p className="mt-3 font-mono text-sm text-zinc-500">TODO: submit laundry form goes here.</p>
      </Card>

      <Card>
        <h2 className="mb-3 text-lg font-medium">My orders</h2>
        {orders.length === 0 ? (
          <p className="text-zinc-500">No orders yet.</p>
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="text-zinc-500">
              <tr>
                <th className="py-1">Submitted</th>
                <th>Status</th>
                <th>Declared</th>
                <th>Counted</th>
                <th>Fine</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o.order_id} className="border-t border-zinc-200 dark:border-zinc-800">
                  <td className="py-2">{when(o.submitted_at)}</td>
                  <td><StatusBadge status={o.order_status} /></td>
                  <td>{o.declared_count}</td>
                  <td>{o.verified_count ?? "-"}</td>
                  <td>{o.fine_amount ? `${money(o.fine_amount)} (${o.fine_status.toLowerCase()})` : "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>
    </>
  );
}
