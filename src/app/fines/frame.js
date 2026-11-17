// OWNER: Dhruv. Shared frame for the three Wash & fines pages: tabs with counts,
// plus the message after an action (done / error).
import { run } from "@/lib/db";
import { Alert, Tabs } from "@/components/ui";

const errorMessages = {
  "already-updated": "Someone already updated this order. The list below is current.",
  "invalid-order": "That order could not be found. Try again from the list below.",
  "invalid-reason": "Write a reason between 3 and 200 characters to waive a fine.",
  "save-failed": "The change was not saved. Try again.",
};
const doneMessages = {
  ready: "Marked ready. The student can see it is ready to collect.",
  collected: "Marked collected.",
  paid: "Fine marked paid.",
  waived: "Fine waived.",
};

export default async function FinesFrame({ current, searchParams, children }) {
  const [wash, pickup, unpaid] = await Promise.all([run("R31"), run("R32"), run("R30")]);
  const { error, done } = await searchParams;

  const tabs = [
    { href: "/fines/wash", label: "To wash", count: wash.length },
    { href: "/fines/pickup", label: "For pickup", count: pickup.length },
    { href: "/fines/unpaid", label: "Unpaid fines", count: unpaid.length },
  ];
  const rows = { "/fines/wash": wash, "/fines/pickup": pickup, "/fines/unpaid": unpaid }[current];

  return (
    <>
      <Tabs items={tabs} current={current} />
      {errorMessages[error] && <Alert>{errorMessages[error]}</Alert>}
      {doneMessages[done] && <Alert kind="success">{doneMessages[done]}</Alert>}
      {children(rows)}
    </>
  );
}
