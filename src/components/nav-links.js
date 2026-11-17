"use client";

// Navigation links that know which page you are on.
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function NavLinks({ links, variant }) {
  const pathname = usePathname();
  const isActive = (l) => (l.exact ? pathname === l.href : pathname === l.href || pathname.startsWith(`${l.href}/`));

  if (variant === "tabs") {
    return (
      <ul className="flex">
        {links.map((l) => {
          const active = isActive(l);
          return (
            <li key={l.href} className="flex-1">
              <Link
                href={l.href}
                aria-current={active ? "page" : undefined}
                className={`flex h-14 flex-col items-center justify-center gap-1 text-xs font-medium ${active ? "text-ink" : "text-muted"}`}
              >
                <span aria-hidden className={`h-1 w-6 rounded-full ${active ? "bg-brand" : "bg-transparent"}`} />
                {l.label}
              </Link>
            </li>
          );
        })}
      </ul>
    );
  }

  return (
    <ul className="mt-8 space-y-1">
      {links.map((l) => {
        const active = isActive(l);
        return (
          <li key={l.href}>
            <Link
              href={l.href}
              aria-current={active ? "page" : undefined}
              className={`block rounded-full px-3 py-2 text-sm font-medium transition-colors ${
                active ? "bg-peach text-ink" : "text-muted hover:bg-peach-soft hover:text-ink"
              }`}
            >
              {l.label}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
