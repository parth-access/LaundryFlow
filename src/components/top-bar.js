// Top bar for signed-in pages: logo, links for the visitor's role, name, sign out.
// Server-only (reads who is signed in), so it lives outside ui.js, which client forms import.
import Link from "next/link";
import { getAccess } from "@/lib/auth";
import { signOut } from "@/app/auth/actions";

const LINKS = {
  student: [{ href: "/student", label: "My laundry" }],
  staff: [
    { href: "/counter", label: "Counter" },
    { href: "/fines", label: "Fines & pickup" },
  ],
  admin: [{ href: "/admin", label: "Admin" }],
};

export default async function TopBar() {
  const access = await getAccess();
  if (access.kind !== "student" && access.kind !== "staff") return <Shell />;

  const links =
    access.kind === "student"
      ? LINKS.student
      : [...LINKS.staff, ...(access.staff.role === "ADMIN" ? LINKS.admin : [])];
  const name = access.kind === "student" ? access.student.full_name : access.staff.full_name;

  return (
    <Shell>
      <nav className="flex items-center gap-1 overflow-x-auto text-sm">
        {links.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            className="rounded-lg px-3 py-1.5 whitespace-nowrap text-muted hover:bg-zinc-100 hover:text-zinc-900"
          >
            {l.label}
          </Link>
        ))}
      </nav>
      <div className="ml-auto flex items-center gap-3">
        <span className="hidden text-sm text-muted sm:inline">{name}</span>
        <form action={signOut}>
          <button
            type="submit"
            className="rounded-lg border border-field px-3 py-1.5 text-sm hover:bg-zinc-100"
          >
            Sign out
          </button>
        </form>
      </div>
    </Shell>
  );
}

/** The bar itself; also the loading placeholder. */
export function Shell({ children }) {
  return (
    <header className="sticky top-0 z-10 border-b border-line bg-white/85 backdrop-blur">
      <div className="mx-auto flex h-14 w-full max-w-4xl items-center gap-4 px-4 sm:px-6">
        <Link href="/dashboard" className="shrink-0 font-semibold tracking-tight">
          Laundry<span className="text-brand">Flow</span>
        </Link>
        {children}
      </div>
    </header>
  );
}
