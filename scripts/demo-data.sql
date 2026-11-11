-- LaundryFlow demo data: the SAME test data for everyone.
-- Run AFTER dbms/03_schema.sql (from LaundryFlow_AP_2026), on your own/dev database:
--   psql "$DATABASE_URL" -f scripts/demo-data.sql
-- Then set DEV_LOGIN_EMAIL in .env.local to one of the emails below to "be" that person.
-- Re-running is safe: it wipes the demo rows first.

BEGIN;
TRUNCATE order_changes, fines, orders, students, staff RESTART IDENTITY CASCADE;

INSERT INTO staff (full_name, email, role) VALUES
  ('Ramesh Kumar', 'counter@demo.laundryflow', 'COUNTER'),   -- staff_id 1
  ('Sunita Admin', 'admin@demo.laundryflow',   'ADMIN');     -- staff_id 2

INSERT INTO students (enrollment_no, full_name, email, bag_prefix, bag_number, bag_verified_at, bag_verified_by) VALUES
  ('2501010001', 'Aman Verma',   'aman@nst.rishihood.edu.in',   'B', 1054, now() - interval '20 days', 1), -- 1
  ('2501010002', 'Riya Sharma',  'riya@nst.rishihood.edu.in',   'G', 1054, now() - interval '20 days', 1), -- 2 (same number, other prefix)
  ('2501010003', 'Kabir Singh',  'kabir@cse.rishihood.edu.in',  'B', 2210, NULL, NULL),                    -- 3 (bag not verified yet)
  ('2501010004', 'Meera Iyer',   'meera@nst.rishihood.edu.in',  'G', 318,  now() - interval '10 days', 1); -- 4

-- One order in every state. policy_id 1 = 10 free, Rs 5 per extra.
INSERT INTO orders (student_id, order_status, declared_count, submitted_at) VALUES
  (3, 'SUBMITTED', 9,  now() - interval '2 hours'),     -- 1: waiting at the counter
  (4, 'SUBMITTED', 10, now() - interval '30 minutes');  -- 2: waiting at the counter

INSERT INTO orders (student_id, policy_id, order_status, declared_count, verified_count, submitted_at, received_at, received_by) VALUES
  (1, 1, 'RECEIVED', 10, 13, now() - interval '1 day', now() - interval '23 hours', 1);  -- 3: counted 13 -> Rs 15 fine

INSERT INTO orders (student_id, policy_id, order_status, declared_count, verified_count, submitted_at, received_at, received_by, ready_at) VALUES
  (2, 1, 'READY', 8, 8, now() - interval '2 days', now() - interval '47 hours', 1, now() - interval '20 hours'); -- 4: ready to collect

INSERT INTO orders (student_id, policy_id, order_status, declared_count, verified_count, submitted_at, received_at, received_by, ready_at, collected_at, collected_by) VALUES
  (1, 1, 'COLLECTED', 10, 12, now() - interval '9 days', now() - interval '9 days' + interval '1 hour', 1,
   now() - interval '8 days', now() - interval '7 days', 1);                                                    -- 5: done, fine paid

INSERT INTO fines (order_id, fine_amount, fine_status, fine_paid_at) VALUES
  (3, 15.00, 'UNPAID', NULL),
  (5, 10.00, 'PAID', now() - interval '7 days');

COMMIT;
