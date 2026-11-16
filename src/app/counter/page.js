import { Suspense } from "react";
import { requireAccess } from "@/lib/auth";
import { run } from "@/lib/db";
import { AppPage } from "@/components/app-page";
import CounterOperations from "./counter-operations";

export const metadata = { title: "Counter | LaundryFlow" };

export default function CounterPage() {
  return (
    <AppPage title="Laundry counter" subtitle="Receive bags and record verified counts">
      <Suspense fallback={<p className="text-zinc-500">Loading the counter queue…</p>}>
        <CounterQueue />
      </Suspense>
    </AppPage>
  );
}

async function CounterQueue() {
  await requireAccess(["staff"]);
  const queue = await run("R02");

  return <CounterOperations queue={queue} />;
}
