// App navigation for signed-in pages: a sidebar on desktop, a header and a bottom
// tab bar on phones. Server-only (reads who is signed in), so it lives outside
// ui.js, which client forms import. The links themselves are in nav-links.js.
import Link from "next/link";
import { getAccess } from "@/lib/auth";
import { signOut } from "@/app/auth/actions";
import NavLinks from "./nav-links";

const STUDENT = [
  { href: "/student", label: "Home", exact: true },
  { href: "/student/new", label: "Hand in" },
  { href: "/student/orders", label: "My orders" },
  { href: "/student/fines", label: "Fines" },
];
const STAFF = [
  { href: "/dashboard", label: "Today", exact: true },
  { href: "/counter", label: "Counter" },
  { href: "/fines", label: "Wash & fines" },
];
const ADMIN = { href: "/admin", label: "Admin" };

export default async function TopBar() {
  const access = await getAccess();
  if (access.kind !== "student" && access.kind !== "staff") return <Shell links={[]} />;

  const isStudent = access.kind === "student";
  const links = isStudent ? STUDENT : [...STAFF, ...(access.staff.role === "ADMIN" ? [ADMIN] : [])];
  const name = isStudent ? access.student.full_name : access.staff.full_name;
  const role = isStudent
    ? `Bag ${access.student.bag_prefix} ${access.student.bag_number}`
    : access.staff.role === "ADMIN"
      ? "Admin"
      : "Laundry staff";

  return <Shell links={links} name={name} role={role} />;
}

function Logo() {
  return (
    <Link href="/dashboard" className="font-display text-xl font-semibold tracking-tight">
      Laundry<span className="text-brand">Flow</span>
    </Link>
  );
}

function SignOut({ className = "" }) {
  return (
    <form action={signOut}>
      <button type="submit" className={`whitespace-nowrap rounded-full border border-field px-4 py-1.5 text-sm hover:bg-peach-soft ${className}`}>
        Sign out
      </button>
    </form>
  );
}

/** The navigation chrome; also the loading placeholder (with no links). */
export function Shell({ links = [], name, role }) {
  return (
    <>
      {/* Desktop sidebar */}
      <aside className="sticky top-0 hidden h-screen flex-col border-r border-line bg-white px-4 py-6 lg:flex">
        <div className="px-3">
          <Logo />
        </div>
        {links.length > 0 && <NavLinks links={links} variant="sidebar" />}
        {name && (
          <div className="mt-auto space-y-3 border-t border-line px-3 pt-4">
            <div>
              <p className="truncate text-sm font-medium">{name}</p>
              <p className="text-xs text-muted">{role}</p>
            </div>
            <SignOut />
          </div>
        )}
      </aside>

      {/* Phone header */}
      <header className="sticky top-0 z-10 flex h-14 items-center justify-between border-b border-line bg-white/90 px-4 backdrop-blur lg:hidden">
        <Logo />
        {name && <SignOut className="py-1" />}
      </header>

      {/* Phone bottom tabs */}
      {links.length > 0 && (
        <nav aria-label="Main" className="fixed inset-x-0 bottom-0 z-10 border-t border-line bg-white pb-[env(safe-area-inset-bottom)] lg:hidden">
          <NavLinks links={links} variant="tabs" />
        </nav>
      )}
    </>
  );
}
