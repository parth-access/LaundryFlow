import { connection } from "next/server";
import { getSql } from "@/lib/db";

/**
 * GET /api/health: is the app up, and can it reach the database?
 *
 * `connection()` makes this run per request. Without it Next.js (cache
 * components mode) could try to run the query while building the app.
 * Do NOT add `export const dynamic = "force-dynamic"`: that setting is
 * removed in this mode.
 */
export async function GET() {
  await connection();
  try {
    const [row] = await getSql()`SELECT now() AS server_time, current_database() AS database`;
    return Response.json({ ok: true, ...row });
  } catch (error) {
    // Log the real reason on the server; do not leak host names or
    // credentials to whoever opens this URL.
    console.error("health check: database unreachable", error);
    return Response.json(
      { ok: false, error: "database unreachable" },
      { status: 503 },
    );
  }
}
