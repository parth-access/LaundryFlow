/**
 * Query registry: every SQL statement the app runs lives here, as plain text.
 *
 * Why one file: the DE course asks us to submit the SQL queries with an
 * analysis (dbms/04_queries.sql in the AP repo). Keeping them in one place means the
 * app and the submission can never drift apart. `npm run queries:export`
 * writes this registry out as a .sql file.
 *
 * Rules
 *  - Ids are R01, R02... for reads and W01, W02... for writes. Never reuse an id.
 *  - Use $1, $2... placeholders. Never build SQL by joining strings with user input.
 *  - Table and column names follow dbms/01_normalization.md (lowercase snake_case).
 *    The starter queries below are EXAMPLES: re-check them against
 *    dbms/03_schema.sql once it lands, then fix whatever differs.
 *  - Keep this file free of imports so the export script can load it without a database.
 */

/**
 * @typedef {Object} QueryDef
 * @property {string} id        Same as the key in QUERIES.
 * @property {string} title     Short name.
 * @property {string} purpose   What the query is for, in one or two sentences (goes into the export).
 * @property {string[]} params  Parameter names in order ($1 is params[0]).
 * @property {string} text      The SQL.
 */

/** @type {Record<string, QueryDef>} */
export const QUERIES = {
  R01: {
    id: "R01",
    title: "Find bags by number",
    purpose:
      "The counter staff type 1054 and pick B 1054 or G 1054 from the list. " +
      "The prefix is part of the bag tag, so one number can match two students.",
    params: ["bag_number"],
    text: `
SELECT student_id, bag_prefix, bag_number, full_name
FROM students
WHERE bag_number = $1
  AND is_active
ORDER BY bag_prefix`,
  },

  R02: {
    id: "R02",
    title: "Counter queue: orders waiting to be received",
    purpose:
      "Everything a student has submitted that no staff member has counted yet, oldest first.",
    params: [],
    text: `
SELECT o.order_id, o.submitted_at, o.declared_count,
       s.bag_prefix, s.bag_number, s.full_name
FROM orders o
JOIN students s ON s.student_id = o.student_id
WHERE o.order_status = 'SUBMITTED'
ORDER BY o.submitted_at`,
  },

  R03: {
    id: "R03",
    title: "A student's orders with fines",
    purpose:
      "History page for one student. The fine is optional, so it is a LEFT JOIN: " +
      "an order within the free limit has no row in fines.",
    params: ["student_id"],
    text: `
SELECT o.order_id, o.order_status, o.declared_count, o.verified_count,
       o.submitted_at, o.received_at, o.ready_at, o.collected_at,
       f.fine_amount, f.fine_status
FROM orders o
LEFT JOIN fines f ON f.order_id = o.order_id
WHERE o.student_id = $1
ORDER BY o.submitted_at DESC`,
  },

  R04: {
    id: "R04",
    title: "Find a student by email",
    purpose:
      "Used after Google sign-in to link the login to a student profile. " +
      "Emails are stored in lowercase and are unique.",
    params: ["email"],
    text: `
SELECT student_id, enrollment_no, full_name, email, bag_prefix, bag_number,
       bag_verified_at, is_active
FROM students
WHERE email = $1`,
  },

  R05: {
    id: "R05",
    title: "Find an active staff member by email",
    purpose:
      "Used after Google sign-in to see whether the account belongs to laundry staff. " +
      "Staff are added by an admin, so being on this list is what grants staff access.",
    params: ["email"],
    text: `
SELECT staff_id, full_name, email, role
FROM staff
WHERE email = $1
  AND is_active`,
  },

  W01: {
    id: "W01",
    title: "Submit an order",
    purpose:
      "A student declares how many clothes they are handing in. Staff count them later " +
      "(verified_count stays NULL until then).",
    params: ["student_id", "declared_count"],
    text: `
INSERT INTO orders (student_id, order_status, declared_count, submitted_at)
VALUES ($1, 'SUBMITTED', $2, now())
RETURNING order_id, submitted_at`,
  },

  W02: {
    id: "W02",
    title: "Register a student profile",
    purpose:
      "A student creates their own profile after their first Google sign-in. " +
      "The bag tag is unverified until staff check it at the first drop-off " +
      "(bag_verified_at and bag_verified_by stay NULL).",
    params: ["enrollment_no", "full_name", "email", "bag_prefix", "bag_number"],
    text: `
INSERT INTO students (enrollment_no, full_name, email, bag_prefix, bag_number)
VALUES ($1, $2, $3, $4, $5)
RETURNING student_id`,
  },
};
