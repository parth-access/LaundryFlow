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

  // ---- Aarabdh: R10-R19, W10-W19 (student side) ----

  // ---- Tanishq: R20-R29, W20-W29 (counter side) ----

  // ---- Dhruv: R30-R39, W30-W39 (fines and pickup) ----
  R30: {
    id: "R30",
    title: "Unpaid fines",
    purpose:
      "Every fine not yet paid or waived, oldest first, with the student's bag tag. " +
      "Uses the partial index ix_fines_unpaid.",
    params: [],
    text: `
SELECT f.order_id, f.fine_amount, o.received_at,
       s.bag_prefix, s.bag_number, s.full_name
FROM fines f
JOIN orders o ON o.order_id = f.order_id
JOIN students s ON s.student_id = o.student_id
WHERE f.fine_status = 'UNPAID'
ORDER BY o.received_at`,
  },
  R31: {
    id: "R31",
    title: "Orders ready to wash",
    purpose:
      "Lists all received orders waiting to be washed, with the student's bag tag, verified clothes count and received time.",
    params: [],
    text: `
SELECT o.order_id, o.verified_count, o.received_at,
       s.bag_prefix, s.bag_number, s.full_name
FROM orders o
JOIN students s ON s.student_id = o.student_id
WHERE o.order_status = 'RECEIVED'
ORDER BY o.received_at`,
  },

  R32: {
    id: "R32",
    title: "Orders waiting for pickup",
    purpose:
      "Lists all ready orders waiting to be collected by students, with their bag tag and ready time.",
    params: [],
    text: `
SELECT o.order_id, o.verified_count, o.ready_at,
       s.bag_prefix, s.bag_number, s.full_name
FROM orders o
JOIN students s ON s.student_id = o.student_id
WHERE o.order_status = 'READY'
ORDER BY o.ready_at`,
  },

  W30: {
    id: "W30",
    title: "Mark order ready",
    purpose:
      "Changes a received order to READY and records when washing is completed. Only received orders can be updated.",
    params: ["order_id"],
    text: `
UPDATE orders
SET order_status = 'READY',
    ready_at = now()
WHERE order_id = $1
  AND order_status = 'RECEIVED'
RETURNING order_id`,
  },

  W31: {
    id: "W31",
    title: "Mark order collected",
    purpose:
      "Marks a ready order as COLLECTED and records the collection time and staff member responsible.",
    params: ["order_id", "staff_id"],
    text: `
UPDATE orders
SET order_status = 'COLLECTED',
    collected_at = now(),
    collected_by = $2
WHERE order_id = $1
  AND order_status = 'READY'
RETURNING order_id`,
  },

  W32: {
    id: "W32",
    title: "Mark fine paid",
    purpose:
      "Marks an unpaid fine as PAID and records the payment time. Already paid or waived fines cannot be updated.",
    params: ["order_id"],
    text: `
UPDATE fines
SET fine_status = 'PAID',
    fine_paid_at = now()
WHERE order_id = $1
  AND fine_status = 'UNPAID'
RETURNING order_id`,
  },

  W33: {
    id: "W33",
    title: "Waive unpaid fine",
    purpose:
      "Waives an unpaid fine and records the responsible staff member and reason for the waiver.",
    params: ["order_id", "staff_id", "waiver_reason"],
    text: `
UPDATE fines
SET fine_status = 'WAIVED',
    waived_by = $2,
    waiver_reason = $3
WHERE order_id = $1
  AND fine_status = 'UNPAID'
RETURNING order_id`,
  },


  // ---- Parth: R40-R49, W40-W49 (admin) ----
  R40: {
    id: "R40",
    title: "All staff",
    purpose: "Admin page: everyone on the staff list, active first.",
    params: [],
    text: `
SELECT staff_id, full_name, email, role, is_active
FROM staff
ORDER BY is_active DESC, full_name`,
  },

  R41: {
    id: "R41",
    title: "Fine policy history",
    purpose:
      "Admin page: every fine rule, newest first. Rules are never edited; a change is a new row, " +
      "so each order keeps the rule it was counted under (orders.policy_id).",
    params: [],
    text: `
SELECT policy_id, effective_from, free_limit, fine_per_extra
FROM policies
ORDER BY effective_from DESC`,
  },
};
