/**
 * Fine rule, shared by every screen. Pure function, tested in fines.test.js.
 *
 * fine = (clothes counted - free limit) x fine per extra cloth, never below 0.
 * Example with the college rule (10 free, Rs 5 each): 13 clothes -> 3 extra -> Rs 15.
 *
 * @param {number} verifiedCount   clothes the staff counted
 * @param {{ free_limit: number, fine_per_extra: number | string }} policy  a row from `policies`
 * @returns {number} fine in rupees (0 when within the limit)
 */
export function calculateFine(verifiedCount, policy) {
  const count = Number(verifiedCount);
  const free = Number(policy.free_limit);
  const perExtra = Number(policy.fine_per_extra); // NUMERIC comes back from Postgres as a string
  if (!Number.isInteger(count) || count < 0) throw new Error("verifiedCount must be a whole number >= 0");
  if (!Number.isFinite(free) || !Number.isFinite(perExtra)) throw new Error("invalid policy");
  const extra = Math.max(0, count - free);
  return Math.round(extra * perExtra * 100) / 100;
}
