// OWNER: Dhruv. Washed bags waiting for the student: mark each one collected.
// Bags waiting OVERDUE_DAYS or more are marked so staff can remind the student.
import { Suspense } from "react";
import Link from "next/link";
import { requireAccess } from "@/lib/auth";
import { run } from "@/lib/db";
import { parseBagSearch } from "@/lib/bag-search";
import { AppPage } from "@/components/app-page";
import { BagTag, EmptyState, List, ListRow, when } from "@/components/ui";
import FinesFrame from "../frame";
import SubmitButton from "../submit-button";
import { markCollected, markNotReady } from "../actions";

export const metadata = { title: "For pickup | LaundryFlow" };

const OVERDUE_DAYS = 3;

function waitingText(days) {
  if (days <= 0) return "ready today";
  if (days === 1) return "waiting 1 day";
  return `waiting ${days} days`;
}

export default function PickupPage({ searchParams }) {
  return (
    <AppPage title="Wash & fines" subtitle="Bags move from washing to pickup, and fines get settled here.">
      <Suspense fallback={<p className="text-muted">Loading…</p>}>
        <Pickup searchParams={searchParams} />
      </Suspense>
    </AppPage>
  );
}

async function Pickup({ searchParams }) {
  await requireAccess(["staff"]);
  const { bag } = await searchParams;
  const typed = typeof bag === "string" ? bag.trim() : "";
  const search = typed ? parseBagSearch(typed) : null;
  const found = search ? await run("R34", [search.number, search.prefix]) : null;

  return (
    <FinesFrame current="/fines/pickup" searchParams={searchParams}>
      {(all) => {
        const orders = found ?? all;
        return (
          <>
            <SearchForm typed={typed} />
            {typed && !search && <p className="text-sm text-brand">Type a bag number like B1054 or 1054.</p>}
            {found && found.length === 0 && (
              <EmptyState title={`No bag ${typed.toUpperCase()} waiting`}>
                It may still be in the wash, or already collected.
              </EmptyState>
            )}
            {(found ? found.length > 0 : true) && <PickupList orders={orders} />}
          </>
        );
      }}
    </FinesFrame>
  );
}

function SearchForm({ typed }) {
  return (
    <form action="/fines/pickup" className="flex gap-2" role="search">
      <label htmlFor="bag" className="sr-only">
        Bag number
      </label>
      <input
        id="bag"
        name="bag"
        defaultValue={typed}
        placeholder="Find a bag, e.g. B1054"
        autoComplete="off"
        className="w-full rounded-full border border-field bg-white px-4 py-2.5 focus:border-ink focus:outline-none"
      />
      <SubmitButton variant="secondary">Find</SubmitButton>
      {typed && (
        <Link href="/fines/pickup" className="self-center whitespace-nowrap px-2 text-sm text-muted hover:text-ink">
          Show all
        </Link>
      )}
    </form>
  );
}

function PickupList({ orders }) {
  return orders.length === 0 ? (
    <EmptyState title="No bags waiting for pickup">Bags appear here once they are marked ready.</EmptyState>
  ) : (
    <>
      <OverdueNote count={orders.filter((o) => o.days_waiting >= OVERDUE_DAYS).length} />
      <List>
        {orders.map((o) => (
          <ListRow
            key={o.order_id}
            aside={
              <div className="flex flex-wrap justify-end gap-2">
                <form action={markNotReady}>
                  <input type="hidden" name="order_id" value={o.order_id} />
                  <input type="hidden" name="return_to" value="/fines/pickup" />
                  <SubmitButton variant="secondary">Not ready yet</SubmitButton>
                </form>
                <form action={markCollected}>
                  <input type="hidden" name="order_id" value={o.order_id} />
                  <input type="hidden" name="return_to" value="/fines/pickup" />
                  <SubmitButton>Collected</SubmitButton>
                </form>
              </div>
            }
          >
            <div className="flex flex-wrap items-center gap-2">
              <BagTag prefix={o.bag_prefix} number={o.bag_number} />
              <span className="font-medium">{o.full_name}</span>
            </div>
            <p className="mt-1 text-sm text-muted">
              {o.verified_count} clothes, ready since {when(o.ready_at)}
            </p>
            <p className={`mt-1 text-sm ${o.days_waiting >= OVERDUE_DAYS ? "font-medium text-brand" : "text-muted"}`}>
              {waitingText(o.days_waiting)}
              {o.days_waiting >= OVERDUE_DAYS && ", remind the student"}
            </p>
          </ListRow>
        ))}
      </List>
    </>
  );
}

function OverdueNote({ count }) {
  if (count === 0) return null;
  return (
    <p className="rounded-xl bg-peach-soft px-4 py-3 text-sm">
      {count === 1 ? "1 bag has" : `${count} bags have`} waited {OVERDUE_DAYS} days or more. Oldest are at the top.
    </p>
  );
}
