import "server-only";
import { cookies } from "next/headers";
import { connection } from "next/server";
import { createServerClient } from "@supabase/ssr";

/**
 * A Supabase client for server code (pages, server actions, route handlers).
 * It is used ONLY for sign-in: our own data lives in Postgres and is read with
 * run() from src/lib/db.js. Create a new client per request; never share one.
 */
export async function createSupabaseServer() {
  // Wait for a real request FIRST. Next.js (Cache Components) also does trial
  // renders with no request while building and starting; the Supabase client
  // reads the clock, which is not allowed there. connection() and cookies()
  // both mean "only run this for a real visitor".
  await connection();
  const cookieStore = await cookies();

  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) {
    throw new Error(
      "SUPABASE_URL and SUPABASE_PUBLISHABLE_KEY are not set. Copy .env.example to .env.local and fill them in.",
    );
  }

  return createServerClient(url, key, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          for (const { name, value, options } of cookiesToSet) {
            cookieStore.set(name, value, options);
          }
        } catch {
          // Called from a Server Component, where cookies cannot be written.
          // That is fine: src/proxy.js refreshes the session on every request.
        }
      },
    },
  });
}
