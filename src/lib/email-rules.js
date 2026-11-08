/**
 * Which Google accounts may register as a student.
 *
 * Rule: the address must end in @rishihood.edu.in or @<something>.rishihood.edu.in
 * (for example @nst.rishihood.edu.in or a branch address). Nothing else.
 *
 * This is the single place the rule lives. The sign-in callback and the
 * register page both call it on the server; the login page only shows a hint.
 * Keep this file free of imports so `npm test` can run it without Next.js.
 */

const COLLEGE_DOMAIN = "rishihood.edu.in";
const LABEL = /^[a-z0-9-]+$/;

/**
 * Trim and lowercase an email. Returns "" for anything that is not plain ASCII,
 * so look-alike letters (Unicode tricks) can never pass as a college address.
 * @param {unknown} email
 * @returns {string}
 */
export function normalizeEmail(email) {
  if (typeof email !== "string") return "";
  const trimmed = email.trim();
  if (trimmed.length === 0 || trimmed.length > 254) return "";
  if (/[^\x21-\x7e]/.test(trimmed)) return ""; // visible ASCII only: no spaces, no Unicode
  return trimmed.toLowerCase();
}

/**
 * True only for a college address as described at the top of this file.
 * @param {unknown} email
 * @returns {boolean}
 */
export function isCollegeEmail(email) {
  const normalized = normalizeEmail(email);
  const parts = normalized.split("@");
  if (parts.length !== 2) return false;
  const [local, domain] = parts;
  if (local.length === 0) return false;

  if (domain === COLLEGE_DOMAIN) return true;

  const suffix = `.${COLLEGE_DOMAIN}`;
  if (!domain.endsWith(suffix)) return false;
  const subdomain = domain.slice(0, -suffix.length);
  // every label before ".rishihood.edu.in" must be non-empty letters, digits or hyphens
  return subdomain.split(".").every((label) => LABEL.test(label));
}
