// OWNER: Dhruv. Shared frame for the Wash & fines pages: tabs with counts,
// plus the message after an action (done / error).
import { run } from "@/lib/db";
import { Alert, Tabs } from "@/components/ui";

const errorMessages = {
  "already-updated": "Someone already updated this order. The list below is current.",
  "invalid-order": "That order could not be found. Try again from the list below.",
  "invalid-reason": "Write a reason between 3 and 200 characters to waive a fine.",
  "save-failed": "The change was not saved. Try again.",
  "none-selected": "Tick at least one bag first.",
};
const doneMessages = {
  ready: "Marked ready. The student can see it is ready to collect.",
  "not-ready": "Moved back to To wash. The change is recorded.",
  "many-ready": (n) => `${n} ${n === "1" ? "bag" : "bags"} marked ready.`,
  collected: "Marked collected.",
  paid: "Fine marked paid.",
  waived: "Fine waived.",
};

export default async function FinesFrame({ current, searchParams, children }) {
  const [wash, pickup, unpaid, history] = await Promise.all([
    run("R31"),
    run("R32"),
    run("R30"),
    current === "/fines/history" ? run("R33") : [], // only load history when that tab is open
  ]);
  const { error, done, n } = await searchParams;
  const doneMessage = typeof doneMessages[done] === "function" ? doneMessages[done](/^[0-9]+$/.test(String(n)) ? String(n) : "Some") : doneMessages[done];

  const tabs = [
    { href: "/fines/wash", label: "To wash", count: wash.length },
    { href: "/fines/pickup", label: "For pickup", count: pickup.length },
    { href: "/fines/unpaid", label: "Unpaid fines", count: unpaid.length },
    { href: "/fines/history", label: "History" },
  ];
  const rows = {
    "/fines/wash": wash,
    "/fines/pickup": pickup,
    "/fines/unpaid": unpaid,
    "/fines/history": history,
  }[current];

  return (
    <>
      <Tabs items={tabs} current={current} />
      {errorMessages[error] && <Alert>{errorMessages[error]}</Alert>}
      {doneMessage && <Alert kind="success">{doneMessage}</Alert>}
      {children(rows)}
    </>
  );
}
