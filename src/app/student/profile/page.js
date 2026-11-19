// OWNER: Aarabdh. Profile: the student's details and their laundry in numbers (R13).
import { Suspense } from "react";
import { requireAccess } from "@/lib/auth";
import { run } from "@/lib/db";
import { AppPage } from "@/components/app-page";
import { BagTag, Card, money, when } from "@/components/ui";

export const metadata = { title: "Profile | LaundryFlow" };

export default function ProfilePage() {
  return (
    <AppPage title="Profile" back={{ href: "/student", label: "Home" }}>
      <Suspense fallback={<p className="text-muted">Loading…</p>}>
        <Profile />
      </Suspense>
    </AppPage>
  );
}

async function Profile() {
  const { student } = await requireAccess(["student"]);
  const [stats] = await run("R13", [student.student_id]);

  return (
    <>
      <Card className="flex flex-wrap items-center gap-6">
        <BagTag prefix={student.bag_prefix} number={student.bag_number} size="lg" />
        <dl className="grid gap-x-8 gap-y-2 text-sm sm:grid-cols-[auto_1fr]">
          <dt className="text-muted">Name</dt>
          <dd className="font-medium">{student.full_name}</dd>
          <dt className="text-muted">Enrollment</dt>
          <dd className="font-medium tabular-nums">{student.enrollment_no}</dd>
          <dt className="text-muted">Email</dt>
          <dd className="font-medium break-all">{student.email}</dd>
          <dt className="text-muted">Bag tag</dt>
          <dd className="font-medium">{student.bag_verified_at ? "Checked by staff" : "Not checked yet"}</dd>
        </dl>
      </Card>

      <section>
        <h2 className="mb-3 text-xl font-semibold">Your laundry</h2>
        {stats.bags === 0 ? (
          <p className="text-muted">Nothing handed in yet. Your numbers show up here after your first bag.</p>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            <Stat value={stats.bags} label={stats.bags === 1 ? "bag handed in" : "bags handed in"} />
            <Stat value={stats.clothes} label="clothes counted by staff" />
            <Stat
              value={stats.avg_hours_to_ready === null ? "None yet" : hours(stats.avg_hours_to_ready)}
              label="from hand-in to ready, on average"
            />
            <Stat value={money(stats.fines_paid)} label="fines paid" />
          </div>
        )}
        {stats.first_hand_in && <p className="mt-3 text-sm text-muted">First hand-in {when(stats.first_hand_in)}.</p>}
      </section>
    </>
  );
}

function hours(h) {
  if (h < 24) return `${h} ${h === 1 ? "hour" : "hours"}`;
  const days = Math.round(h / 24);
  return `${days} ${days === 1 ? "day" : "days"}`;
}

function Stat({ value, label }) {
  return (
    <div className="rounded-2xl border border-line bg-white p-5">
      <p className="font-display text-3xl font-semibold tabular-nums">{value}</p>
      <p className="mt-1 text-sm text-muted">{label}</p>
    </div>
  );
}
