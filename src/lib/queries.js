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
       s.student_id, s.bag_prefix, s.bag_number, s.full_name, s.bag_verified_at
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
  R10: {
    id: "R10",
    title: "Check student's active laundry order",
    purpose:
      "Checks whether a student has an order that is submitted, received, or ready.",
    params: ["student_id"],
    text: `
SELECT order_id, order_status
FROM orders
WHERE student_id = $1
  AND order_status IN ('SUBMITTED', 'RECEIVED', 'READY')
LIMIT 1`,
  },

  R11: {
    id: "R11",
    title: "One of a student's orders, with its fine",
    purpose:
      "Order detail page for a student. Filtering on student_id as well as order_id " +
      "means a student can only ever open their own orders, even by editing the URL.",
    params: ["order_id", "student_id"],
    text: `
SELECT o.order_id, o.order_status, o.declared_count, o.verified_count,
       o.submitted_at, o.received_at, o.ready_at, o.collected_at,
       f.fine_amount, f.fine_status, f.fine_paid_at, f.waiver_reason,
       p.free_limit, p.fine_per_extra
FROM orders o
LEFT JOIN fines f    ON f.order_id = o.order_id
LEFT JOIN policies p ON p.policy_id = o.policy_id
WHERE o.order_id = $1
  AND o.student_id = $2`,
  },

  W10: {
    id: "W10",
    title: "Submit order if no active order exists",
    purpose:
      "Atomically checks for an active order and inserts a new order if none exists.",
    params: ["student_id", "declared_count"],
    text: `
INSERT INTO orders (student_id, order_status, declared_count, submitted_at)
SELECT $1, 'SUBMITTED', $2, now()
WHERE NOT EXISTS (
  SELECT 1
  FROM orders
  WHERE student_id = $1
    AND order_status IN ('SUBMITTED', 'RECEIVED', 'READY')
)
ON CONFLICT DO NOTHING
RETURNING order_id, submitted_at`,
  },

  W11: {
    id: "W11",
    title: "Cancel a hand-in",
    purpose:
      "A student cancels an order they handed in by mistake. Only while it is still SUBMITTED (staff have not " +
      "counted it yet), and only their own order: both rules are in the WHERE, so a forged form changes nothing. " +
      "Zero rows back means it was already counted or is not theirs.",
    params: ["order_id", "student_id"],
    text: `
UPDATE orders
SET order_status = 'CANCELLED'
WHERE order_id = $1
  AND student_id = $2
  AND order_status = 'SUBMITTED'
RETURNING order_id`,
  },

  // ---- Tanishq: R20-R29, W20-W29 (counter side) ----

  R20: {
    id: "R20",
    title: "Current fine policy",
    purpose:
      "Counter receipt: returns the latest fine policy effective on the receipt date. " +
      "The date is taken in India time, because the database server runs in UTC.",
    params: [],
    text: `
SELECT policy_id, free_limit, fine_per_extra
FROM policies
WHERE effective_from <= (now() AT TIME ZONE 'Asia/Kolkata')::date
ORDER BY effective_from DESC
LIMIT 1`,
  },

  W20: {
    id: "W20",
    title: "Receive a submitted order",
    purpose:
      "Records the verified count, policy, receipt time, and staff member. Only a still-submitted order can be received.",
    params: ["order_id", "verified_count", "staff_id", "policy_id"],
    text: `
UPDATE orders
SET order_status = 'RECEIVED',
    verified_count = $2,
    received_at = now(),
    received_by = $3,
    policy_id = $4
WHERE order_id = $1
  AND order_status = 'SUBMITTED'
RETURNING order_id`,
  },

  W21: {
    id: "W21",
    title: "Create an unpaid fine",
    purpose:
      "Stores a positive fine calculated from the verified count and effective policy. Called inside the receipt transaction only when the amount is greater than zero.",
    params: ["order_id", "fine_amount"],
    text: `
INSERT INTO fines (order_id, fine_amount, fine_status)
VALUES ($1, $2, 'UNPAID')
RETURNING order_id`,
  },

  W22: {
    id: "W22",
    title: "Verify a bag tag",
    purpose:
      "Records the first in-person verification time and the authenticated staff member. Does not overwrite an existing verification.",
    params: ["student_id", "staff_id"],
    text: `
UPDATE students
SET bag_verified_at = now(),
    bag_verified_by = $2
WHERE student_id = $1
  AND is_active
  AND bag_verified_at IS NULL
RETURNING student_id, bag_verified_at`,
  },

  R23: {
    id: "R23",
    title: "One order with its student, for the receive page",
    purpose:
      "The counter opens one order to count it. Includes the student's bag tag and whether " +
      "the tag has been verified, so staff can verify it on the first drop-off.",
    params: ["order_id"],
    text: `
SELECT o.order_id, o.order_status, o.declared_count, o.verified_count,
       o.submitted_at, o.received_at, o.ready_at, o.collected_at,
       s.student_id, s.full_name, s.enrollment_no, s.bag_prefix, s.bag_number, s.bag_verified_at
FROM orders o
JOIN students s ON s.student_id = o.student_id
WHERE o.order_id = $1`,
  },

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
      "Lists all ready orders waiting to be collected by students, with their bag tag and ready time. " +
      "days_waiting counts whole days since the bag was marked ready, in India time, so staff can chase old bags.",
    params: [],
    text: `
SELECT o.order_id, o.verified_count, o.ready_at,
       ((now() AT TIME ZONE 'Asia/Kolkata')::date - (o.ready_at AT TIME ZONE 'Asia/Kolkata')::date) AS days_waiting,
       s.bag_prefix, s.bag_number, s.full_name
FROM orders o
JOIN students s ON s.student_id = o.student_id
WHERE o.order_status = 'READY'
ORDER BY o.ready_at`,
  },

  R33: {
    id: "R33",
    title: "Settled fines (history)",
    purpose:
      "The last 50 fines that were paid or waived, newest first, so an admin can check who was let off and why. " +
      "LEFT JOIN staff because only waived fines have a waived_by.",
    params: [],
    text: `
SELECT f.order_id, f.fine_amount, f.fine_status, f.fine_paid_at, f.waiver_reason,
       o.received_at, s.bag_prefix, s.bag_number, s.full_name,
       w.full_name AS waived_by_name
FROM fines f
JOIN orders o ON o.order_id = f.order_id
JOIN students s ON s.student_id = o.student_id
LEFT JOIN staff w ON w.staff_id = f.waived_by
WHERE f.fine_status IN ('PAID', 'WAIVED')
ORDER BY coalesce(f.fine_paid_at, o.received_at) DESC
LIMIT 50`,
  },

  R34: {
    id: "R34",
    title: "Find a bag waiting for pickup",
    purpose:
      "Pickup search: ready bags with this bag number, optionally only B or G. " +
      "Used when a student walks up and says their number, instead of scrolling the whole list.",
    params: ["bag_number", "bag_prefix_or_null"],
    text: `
SELECT o.order_id, o.verified_count, o.ready_at,
       ((now() AT TIME ZONE 'Asia/Kolkata')::date - (o.ready_at AT TIME ZONE 'Asia/Kolkata')::date) AS days_waiting,
       s.bag_prefix, s.bag_number, s.full_name
FROM orders o
JOIN students s ON s.student_id = o.student_id
WHERE o.order_status = 'READY'
  AND s.bag_number = $1
  AND ($2::char(1) IS NULL OR s.bag_prefix = $2)
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

  W35: {
    id: "W35",
    title: "Mark several orders ready",
    purpose:
      "Marks every listed order READY in one statement, when a whole machine load finishes. " +
      "One UPDATE is atomic, so either all qualifying bags change or none do. " +
      "Bags no longer RECEIVED (someone else already moved them) are skipped; RETURNING says which changed.",
    params: ["order_ids"],
    text: `
UPDATE orders
SET order_status = 'READY',
    ready_at = now()
WHERE order_id = ANY($1::int[])
  AND order_status = 'RECEIVED'
RETURNING order_id`,
  },

  W34: {
    id: "W34",
    title: "Undo mark ready",
    purpose:
      "Moves a READY order back to RECEIVED when staff pressed Mark ready by mistake, and records the change in " +
      "order_changes in the same statement (a CTE), so the undo and its audit row succeed or fail together. " +
      "Only READY orders qualify, so a collected bag can never be undone. change_no is the next number for that order.",
    params: ["order_id", "staff_id", "reason"],
    text: `
WITH undone AS (
  UPDATE orders
  SET order_status = 'RECEIVED',
      ready_at = NULL
  WHERE order_id = $1
    AND order_status = 'READY'
  RETURNING order_id
)
INSERT INTO order_changes (order_id, change_no, changed_by, field_changed, old_value, new_value, reason)
SELECT u.order_id,
       coalesce((SELECT max(c.change_no) FROM order_changes c WHERE c.order_id = u.order_id), 0) + 1,
       $2, 'order_status', 'READY', 'RECEIVED', $3
FROM undone u
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
SELECT policy_id, effective_from::text AS effective_from, free_limit, fine_per_extra
FROM policies
ORDER BY effective_from DESC`,
  },

  R42: {
    id: "R42",
    title: "Numbers at a glance",
    purpose:
      "Admin page: bags handed in today (India time), bags waiting to be counted, and the total of unpaid fines. " +
      "One row, three scalar subqueries.",
    params: [],
    text: `
SELECT
  (SELECT count(*)::int FROM orders
     WHERE (submitted_at AT TIME ZONE 'Asia/Kolkata')::date = (now() AT TIME ZONE 'Asia/Kolkata')::date) AS orders_today,
  (SELECT count(*)::int FROM orders WHERE order_status = 'SUBMITTED') AS waiting,
  (SELECT count(*)::int FROM fines WHERE fine_status = 'UNPAID') AS unpaid_count,
  (SELECT coalesce(sum(fine_amount), 0) FROM fines WHERE fine_status = 'UNPAID') AS unpaid_total`,
  },

  W40: {
    id: "W40",
    title: "Add staff",
    purpose:
      "Admin adds a laundry staff member by their Google email. The email is stored lowercase (the table CHECK enforces it). " +
      "ON CONFLICT DO NOTHING: an email already on the list returns no row, so the page can say so.",
    params: ["full_name", "email", "role"],
    text: `
INSERT INTO staff (full_name, email, role)
VALUES ($1, lower($2), $3)
ON CONFLICT (email) DO NOTHING
RETURNING staff_id`,
  },

  W41: {
    id: "W41",
    title: "Deactivate or reactivate staff",
    purpose:
      "Turns a staff account off or back on. Accounts are never deleted, because collected orders point at the staff member. " +
      "The WHERE stops an admin from switching off their own account ($3 is the admin's own staff_id).",
    params: ["staff_id", "is_active", "own_staff_id"],
    text: `
UPDATE staff
SET is_active = $2
WHERE staff_id = $1
  AND staff_id <> $3
RETURNING staff_id`,
  },

  W42: {
    id: "W42",
    title: "New fine policy",
    purpose:
      "Adds a new fine rule from a date onwards. Old rules are never edited, so past orders keep the rule they were counted under. " +
      "The date cannot be in the past (India time), and only one rule per date (UNIQUE).",
    params: ["effective_from", "free_limit", "fine_per_extra"],
    text: `
INSERT INTO policies (effective_from, free_limit, fine_per_extra)
SELECT $1::date, $2, $3
WHERE $1::date >= (now() AT TIME ZONE 'Asia/Kolkata')::date
ON CONFLICT (effective_from) DO NOTHING
RETURNING policy_id`,
  },
};
