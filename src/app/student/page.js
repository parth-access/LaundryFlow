// OWNER: Aarabdh. Student home: your bag tag, your current laundry, and recent orders.
import { Suspense } from "react";
import Link from "next/link";
import { requireAccess } from "@/lib/auth";
import { run } from "@/lib/db";
import { AppPage } from "@/components/app-page";
import { BagTag, ButtonLink, Card, EmptyState, List, ListRow, OrderTracker, StatusBadge, money, when } from "@/components/ui";

export const metadata = { title: "Home | LaundryFlow" };

const ACTIVE = ["SUBMITTED", "RECEIVED", "READY"];

export default function StudentPage() {
  return (
    <AppPage title="Your laundry">
      <Suspense fallback={<p className="text-muted">Loading…</p>}>
        <StudentHome />
      </Suspense>
    </AppPage>
  );
}

async function StudentHome() {
  const { student } = await requireAccess(["student"]);
  const orders = await run("R03", [student.student_id]);
  const active = orders.find((o) => ACTIVE.includes(o.order_status));
  const unpaid = orders.filter((o) => o.fine_status === "UNPAID");
  const recent = orders.filter((o) => o !== active).slice(0, 3);

  return (
    <>
      <Card className="flex flex-wrap items-center justify-between gap-6">
        <div>
          <p className="text-sm text-muted">Hi {student.full_name.split(" ")[0]}, this is your bag</p>
          <div className="mt-3">
            <BagTag prefix={student.bag_prefix} number={student.bag_number} size="lg" />
          </div>
        </div>
        <p className="max-w-56 text-sm text-muted">
          {student.bag_verified_at
            ? "Staff have checked this tag. Show it at the counter."
            : "Staff will check this tag the first time you hand in laundry."}
          <Link href="/student/profile" className="mt-2 block font-medium text-ink underline underline-offset-2">
            Your profile
          </Link>
        </p>
      </Card>

      {unpaid.length > 0 && (
        <Card className="border-red-200 bg-red-50/60">
          <p className="font-medium text-red-900">
            You have {money(unpaid.reduce((s, o) => s + Number(o.fine_amount), 0))} in unpaid fines.
          </p>
          <p className="mt-1 text-sm text-red-800">
            Pay at the laundry counter when you collect your bag.{" "}
            <Link href="/student/fines" className="font-medium underline underline-offset-2">
              See your fines
            </Link>
          </p>
        </Card>
      )}

      {active ? (
        <Card>
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-lg font-semibold">In progress</h2>
            <StatusBadge status={active.order_status} />
          </div>
          <OrderTracker order={active} />
          <div className="mt-6 border-t border-line pt-4">
            <ButtonLink href={`/student/orders/${active.order_id}`} variant="secondary">
              View this order
            </ButtonLink>
          </div>
        </Card>
      ) : (
        <EmptyState title="Nothing at the laundry right now" action={<ButtonLink href="/student/new">Hand in laundry</ButtonLink>}>
          Tell us how many clothes you are handing in before you drop off your bag.
        </EmptyState>
      )}

      {recent.length > 0 && (
        <section>
          <div className="mb-3 flex items-baseline justify-between">
            <h2 className="text-lg font-semibold">Earlier orders</h2>
            <Link href="/student/orders" className="text-sm font-medium text-brand hover:underline">
              See all
            </Link>
          </div>
          <List>
            {recent.map((o) => (
              <ListRow
                key={o.order_id}
                href={`/student/orders/${o.order_id}`}
                aside={o.fine_amount ? <span className="text-sm">{money(o.fine_amount)}</span> : null}
              >
                <p className="font-medium">{o.verified_count ?? o.declared_count} clothes</p>
                <p className="text-sm text-muted">Handed in {when(o.submitted_at)}</p>
              </ListRow>
            ))}
          </List>
        </section>
      )}
    </>
  );
}
