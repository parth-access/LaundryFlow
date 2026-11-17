// OWNER: Aarabdh. Hand in laundry.
import { Suspense } from "react";
import { requireAccess } from "@/lib/auth";
import { run } from "@/lib/db";
import { AppPage } from "@/components/app-page";
import { ButtonLink, Card, EmptyState } from "@/components/ui";
import SubmitForm from "../submit-form";

export const metadata = { title: "Hand in laundry | LaundryFlow" };

export default function NewOrderPage() {
  return (
    <AppPage title="Hand in laundry" back={{ href: "/student", label: "Home" }}>
      <Suspense fallback={<p className="text-muted">Loading…</p>}>
        <NewOrder />
      </Suspense>
    </AppPage>
  );
}

async function NewOrder() {
  const { student } = await requireAccess(["student"]);
  const [[active], [policy]] = await Promise.all([run("R10", [student.student_id]), run("R20")]);

  if (active) {
    return (
      <EmptyState
        title="You already have laundry in progress"
        action={<ButtonLink href={`/student/orders/${active.order_id}`}>View that order</ButtonLink>}
      >
        You can hand in a new bag once this one is collected.
      </EmptyState>
    );
  }

  return (
    <Card>
      <SubmitForm freeLimit={policy?.free_limit} />
    </Card>
  );
}
