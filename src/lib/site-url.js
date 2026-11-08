import "server-only";
import { headers } from "next/headers";

/**
 * The public address of this site, with no trailing slash, e.g. http://localhost:3000.
 * Set SITE_URL in production. Without it, we use the address the browser asked for.
 * (Supabase only redirects to addresses on its own allow-list, so a wrong value
 * here cannot send people to another site.)
 */
export async function getSiteUrl() {
  if (process.env.SITE_URL) return process.env.SITE_URL.replace(/\/+$/, "");
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3000";
  const proto = h.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  return `${proto}://${host}`;
}
