import postgres from "postgres";
import { QUERIES } from "./queries.js";

/**
 * One shared connection pool for the whole server.
 *
 * - Created lazily, so `next build` works without a database.
 * - Kept on globalThis so hot reload in `next dev` does not open a new pool
 *   on every file save.
 * - `prepare: false` is required when DATABASE_URL points at a transaction
 *   pooler (Supabase port 6543, pgbouncer). It is harmless for a local server.
 */
const globalForDb = globalThis;

export function getSql() {
  if (!globalForDb.__laundryflowSql) {
    const url = process.env.DATABASE_URL;
    if (!url) {
      throw new Error(
        "DATABASE_URL is not set. Copy .env.example to .env.local and fill it in.",
      );
    }
    globalForDb.__laundryflowSql = postgres(url, { prepare: false, max: 10 });
  }
  return globalForDb.__laundryflowSql;
}

/**
 * Run a registered query by id.
 *
 *   const rows = await run("R01", [1054]);
 *
 * Parameters are sent separately from the SQL text ($1, $2...), so user input
 * can never change the shape of the statement.
 *
 * @param {string} id  A key of QUERIES, e.g. "R01".
 * @param {Array<string | number | boolean | Date | null>} [params]
 * @returns {Promise<Array<Record<string, unknown>>>} The result rows.
 */
export async function run(id, params = []) {
  const q = QUERIES[id];
  if (!q) {
    throw new Error(
      `Unknown query id "${id}". Add it to src/lib/queries.js first (known: ${Object.keys(QUERIES).join(", ")}).`,
    );
  }
  if (params.length !== q.params.length) {
    throw new Error(
      `${id} expects ${q.params.length} parameter(s) (${q.params.join(", ") || "none"}), got ${params.length}`,
    );
  }
  return getSql().unsafe(q.text, [...params]);
}
