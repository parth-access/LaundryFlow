# Who does what (deadline Mon 16 Nov)

Everyone works **only in their own folder and their own query id range**, so nobody blocks or overwrites anyone.
Each folder already has a working page; build on it. `TODO` comments mark where your work goes.

| Person | Folder (URL) | Query ids | Sign in as (dev) |
| --- | --- | --- | --- |
| Aarabdh | `src/app/student/` (`/student`) | R10-R19, W10-W19 | `aman@nst.rishihood.edu.in` |
| Tanishq | `src/app/counter/` (`/counter`) | R20-R29, W20-W29 | `counter@demo.laundryflow` |
| Dhruv | `src/app/fines/` (`/fines`) | R30-R39, W30-W39 | `counter@demo.laundryflow` |
| Parth | `src/app/admin/` (`/admin`) + login, Supabase, deploy | R40-R49, W40-W49 | `admin@demo.laundryflow` |

## First day setup (everyone, about 15 minutes)

1. `git clone https://github.com/parth-access/LaundryFlow.git && cd LaundryFlow && npm install`
2. `cp .env.example .env.local`, then paste in the values Parth sends you (privately).
3. Set `DEV_LOGIN_EMAIL` in `.env.local` to the email in your row above. You are now "signed in" as that person, no Google needed (only in `npm run dev`).
4. `npm run dev`, open http://localhost:3000/dashboard and click into your page.
5. Make a tiny change in your folder, commit, `git pull`, `git push`. Now you are set up.

The demo data (`scripts/demo-data.sql`) has one order in every state: two waiting at the counter, one counted with a Rs 15 unpaid fine, one ready, one collected. Parth loads it once into the shared database. If you break the data, tell Parth; do not reload it yourself on the shared database.

## Tasks

### Aarabdh: student side (`/student`)
- [ ] Submit laundry form: number of clothes (1 to 100), server action in `src/app/student/actions.js` calling `run("W10", [...])` (insert only if no active order, one query). Look at `src/app/register/` for a complete form + action example.
- [ ] Stop a second submit while the student already has an order in SUBMITTED / RECEIVED / READY (new read query R10).
- [ ] Show a clear message after submitting.
- [ ] (if time) cancel an order that is still SUBMITTED (W11).

### Tanishq: counter (`/counter`)
- [ ] Bag lookup: type a number, show matching B / G students (`R01` already exists).
- [ ] Receive an order: enter the counted clothes. In ONE transaction: update the order to RECEIVED (received_at, received_by = the staff id, verified_count, policy_id = current policy) and, if `calculateFine()` from `src/lib/fines.js` is above 0, insert the fine. Needs the current policy (R20) and the writes (W20, W21).
- [ ] Verify an unverified bag tag on first drop-off (W22: set bag_verified_at, bag_verified_by).
- Ask Parth for help with the transaction if stuck; `run()` does one query, a transaction needs `getSql().begin(...)`.

### Dhruv: fines and pickup (`/fines`)
- [ ] List RECEIVED orders with "Mark ready" (W30) and READY orders with "Collected" (W31, sets collected_at and collected_by).
- [ ] Unpaid fines list is done (R30). Add "Paid" (W32, sets fine_paid_at) and "Waive" with a reason (W33, sets waived_by and waiver_reason).
- [ ] DE repo: ER diagram `dbms/02_er_diagram.png` in LaundryFlow_AP_2026 (due Tue 17).

### Parth: admin (`/admin`) + setup
- [ ] Staff list is done (R40). Add staff form (W40) and deactivate / reactivate (W41); an admin cannot deactivate themselves.
- [ ] Fine policy: history is done (R41). "New policy" form (W42) inserts a new row, never edits an old one.
- [ ] Numbers at a glance: orders today, waiting at the counter, unpaid fines total (R42).
- [ ] DE: large dataset generator in LaundryFlow_AP_2026 (`dbms/generate_data.py`), so Tanishq can time the queries.
- [ ] Supabase project, run `dbms/03_schema.sql` then `scripts/demo-data.sql`, send everyone the `.env.local` values.
- [ ] Google sign-in setup (README, "One-time Supabase setup").
- [ ] Deploy (Vercel) by Sat 14, then everyone tests one full order end to end.

## Rules
- Pull before you push: `git pull` then `git push`.
- Only edit your own folder and your own query ids. Shared files (`src/components/ui.js`, `src/lib/*`): tell the group first.
- Staff identity for writes: `const { staff } = await requireAccess(["staff"])`, then use `staff.staff_id`. Never take it from the form.
- Before pushing: `npm run lint` and `npm run build` must pass.
