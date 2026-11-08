/**
 * Decide what a signed-in Google account is allowed to be in LaundryFlow.
 * Pure function (no database, no Next.js) so it can be tested on its own.
 *
 *   staff       the email is on the active staff list (added by an admin in the database)
 *   student     college email and a students row exists
 *   unregistered  college email but no students row yet -> must fill in /register
 *   denied      anything else
 */
import { isCollegeEmail, normalizeEmail } from "./email-rules.js";

/**
 * @typedef {{ kind: "staff", staff: object }
 *   | { kind: "student", student: object }
 *   | { kind: "unregistered", email: string }
 *   | { kind: "denied", reason: string }} Access
 */

/**
 * @param {{ email: unknown, staff?: object | null, student?: object | null }} input
 *   `staff` is the ACTIVE staff row for this email (or null); `student` is the students row (or null).
 * @returns {Access}
 */
export function resolveAccess({ email, staff = null, student = null }) {
  const normalized = normalizeEmail(email);
  if (!normalized) return { kind: "denied", reason: "no_email" };

  // Staff come first: the staff list is controlled by an admin, so an address
  // on it is trusted even though staff have no college email.
  if (staff) return { kind: "staff", staff };

  if (!isCollegeEmail(normalized)) return { kind: "denied", reason: "not_college_email" };

  if (student) {
    if (student.is_active === false) return { kind: "denied", reason: "inactive" };
    return { kind: "student", student };
  }
  return { kind: "unregistered", email: normalized };
}
