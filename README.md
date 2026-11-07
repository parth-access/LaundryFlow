# LaundryFlow

A digital laundry management system for college students and laundry staff.

## About

LaundryFlow is a project aimed at replacing the paper-based laundry process used in colleges. Students currently record the clothes they submit manually, while laundry staff maintain the corresponding records on paper. This makes it difficult to verify quantities, maintain accurate records, and enforce the existing clothes limit.

LaundryFlow will allow students to submit laundry requests through their accounts. Laundry staff can then review each request, verify the clothes received, and update the records accordingly.

## Features

- **Student accounts** — Student details are pre-filled wherever possible.
- **Laundry requests** — Students can enter the details and quantity of clothes submitted.
- **Staff verification** — Staff can review requests and confirm the clothes received.
- **Clothes limit** — The system tracks the existing limit of 10 clothes.
- **Fine tracking** — Requests exceeding the limit can be flagged for applicable fines.
- **Digital records** — Requests and their verification status are maintained digitally.

## How It Works

1. The student logs in to their account.
2. The student enters the details of the clothes being submitted.
3. A laundry request is created.
4. Laundry staff review the request and verify the clothes received.
5. The verified quantity is recorded, and any applicable fine is flagged.

## User Roles

### Student
- Access personal account details.
- Submit laundry requests.
- View submitted requests and their status.

### Laundry Staff
- View submitted laundry requests.
- Verify the clothes received.
- Update request status and record quantity discrepancies.

## Objective

The objective of LaundryFlow is to reduce paperwork in the college laundry process, improve the accuracy of laundry records, and make the submission and verification process easier for both students and laundry staff.

## Tech Stack

Proposed starter stack (change it by agreeing as a team, then update this section):

- **Language:** JavaScript only (`.js` files). We do not use TypeScript.
- **Frontend and backend:** [Next.js](https://nextjs.org) 16 (App Router)
- **Styling:** Tailwind CSS 4
- **Database:** PostgreSQL, accessed with the [`postgres`](https://github.com/porsager/postgres) driver and plain SQL (no ORM, because the database design and queries are graded in the DE course)

## Getting Started

You need Node.js 20.9 or newer and a PostgreSQL database (local, or a free Supabase project).

```bash
git clone https://github.com/parth-access/LaundryFlow.git
cd LaundryFlow
npm install
cp .env.example .env.local     # then put your own DATABASE_URL in .env.local
npm run dev                    # http://localhost:3000
```

Check the database connection at <http://localhost:3000/api/health>. It should answer `{"ok":true, ...}`.

| Command | What it does |
| --- | --- |
| `npm run dev` | Start the development server |
| `npm run build` | Production build (run this before you push) |
| `npm run lint` | Check the code style |
| `npm run queries:export` | Print every SQL query as a `.sql` file (see below) |

`.env.local` holds your password and is ignored by git. Never commit it; only `.env.example` is committed.

## Project Structure

```
src/app/                 Pages and API routes (one folder per URL)
src/app/api/health/      GET /api/health: is the app up and is the database reachable
src/lib/db.js            The database connection and run("R01", [params])
src/lib/queries.js       Every SQL query the app uses, with an id (R01, W01, ...)
scripts/export-queries.js  Writes the query list out as a .sql file
```

## Working Rules

1. **All SQL lives in `src/lib/queries.js`.** Add the query there with the next free id (R = read, W = write), then call it with `run("R05", [...])`. Do not write SQL inside pages or components. This keeps the course submission and the app identical.
2. **Always use `$1, $2...` parameters.** Never put a value into the SQL text by string concatenation.
3. **The database design is in the AP repo.** Table and column names come from `dbms/` in [LaundryFlow_AP_2026](https://github.com/parth-access/LaundryFlow_AP_2026) (`01_normalization.md` now, `03_schema.sql` when it is ready). If the app and the schema disagree, fix the app.
4. **To export the queries for the DE submission:**
   `npm run queries:export -- ../LaundryFlow_AP_2026/dbms/04_queries.sql`
5. This project uses Next.js 16 with Cache Components turned on, which differs from older tutorials. Do not add `export const dynamic = "force-dynamic"`. A route that must run on every request calls `await connection()` from `next/server` first (see `src/app/api/health/route.js`). `AGENTS.md` explains how to find the matching docs in `node_modules/next/dist/docs/`.

## Project Status

Currently in development as a B.Tech capstone project.

## Future Scope

- Laundry status notifications.
- Digital fine and payment records.
- Student laundry history.
