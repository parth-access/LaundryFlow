# LaundryFlow

A digital laundry management system for college students and laundry staff.

## About

LaundryFlow is a project aimed at replacing the paper-based laundry process used in colleges. Students currently record the clothes they submit manually, while laundry staff maintain the corresponding records on paper. This makes it difficult to verify quantities, maintain accurate records, and enforce the existing clothes limit.

LaundryFlow will allow students to submit laundry requests through their accounts. Laundry staff can then review each request, verify the clothes received, and update the records accordingly.

## Features

- **Student accounts** — Students create their own profile and register their bag tag (for example B 1054 or G 1054). Staff verify the bag on the first drop-off.
- **Laundry requests** — Students can enter the details and quantity of clothes submitted.
- **Staff verification** — Staff can review requests and confirm the clothes received.
- **Clothes limit** — The system tracks the existing limit of 10 clothes.
- **Fine tracking** — Requests exceeding the limit can be flagged for applicable fines.
- **Digital records** — Requests and their verification status are maintained digitally.

## How It Works

1. The student signs up once with their bag tag, then logs in.
2. The student enters the details of the clothes being submitted.
3. A laundry request is created.
4. Laundry staff review the request and verify the clothes received.
5. The verified quantity is recorded, and any applicable fine is flagged.

## User Roles

### Student
- Create a profile and register their bag tag.
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
- **Sign-in:** Google only, through Supabase Auth (see "Sign-in" below)
- **Database:** PostgreSQL hosted on Supabase, accessed with the [`postgres`](https://github.com/porsager/postgres) driver and plain SQL (no ORM, because the database design and queries are graded in the DE course)

## Getting Started

You need Node.js 20.9 or newer. The team database is on Supabase: ask Parth for the connection string (never commit it).

```bash
git clone https://github.com/parth-access/LaundryFlow.git
cd LaundryFlow
npm install
cp .env.example .env.local     # then fill in the values Parth sends you (DATABASE_URL, SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY)
npm run dev                    # http://localhost:3000
```

Check the database connection at <http://localhost:3000/api/health>. It should answer `{"ok":true, ...}`.

| Command | What it does |
| --- | --- |
| `npm run dev` | Start the development server |
| `npm run build` | Production build (run this before you push) |
| `npm run lint` | Check the code style |
| `npm test` | Run the tests for the email rule and the access rules |
| `npm run queries:export` | Print every SQL query as a `.sql` file (see below) |

`.env.local` holds your password and is ignored by git. Never commit it; only `.env.example` is committed.

## Sign-in

Everyone signs in with Google, through Supabase Auth. There are no passwords in this app.

- **Students** may sign in only with a college address: `@rishihood.edu.in` or `@<something>.rishihood.edu.in` (for example `@nst.rishihood.edu.in`). The first time, they fill in a profile (name, enrollment number, bag tag) at `/register`.
- **Laundry staff** have no college email. They sign in with any Google account that an admin has added to the `staff` table. Adding one (run in the Supabase SQL editor; the email must be lowercase):

  ```sql
  INSERT INTO staff (full_name, email, role) VALUES ('Ramesh Kumar', 'ramesh@gmail.com', 'COUNTER');
  ```

  Use role `ADMIN` for people who manage the laundry. To stop someone's access, set `is_active = false`.
- Anyone else is signed out again straight away and sent to `/login` with a message.

The rule is checked **on the server** in `src/app/auth/callback/route.js` and again by every protected page, so it cannot be skipped from the browser. The rule itself is in `src/lib/email-rules.js`, with tests.

**Protect a new page** by calling `requireAccess()` from `src/lib/auth.js` at the top of the page, inside a `<Suspense>` boundary:

```js
const access = await requireAccess(["staff"]); // or ["student"], or both
// access.kind is "staff" or "student"; access.staff / access.student is the database row
```

### One-time Supabase setup (Parth does this)

Menu names in Supabase and Google may differ slightly from these.

1. **Google:** in Google Cloud Console create an OAuth client (type "Web application"). Add the redirect URI shown on Supabase's Google provider page (it looks like `https://<project-ref>.supabase.co/auth/v1/callback`). On the OAuth consent screen use only the basic scopes (email, profile) and set the publishing status to **In production**. While it says "Testing", only Google accounts you list as test users can sign in.
2. **Supabase > Authentication > Providers:** turn **Google** on and paste the client ID and secret. Turn the **Email** provider **off**, so nobody can sign up with a password.
3. **Supabase > Authentication > URL Configuration:** add `http://localhost:3000/auth/callback` and your deployed address `/auth/callback` to the Redirect URLs, and set Site URL to the deployed address.
4. Put `SUPABASE_URL` and `SUPABASE_PUBLISHABLE_KEY` (Project Settings > API) in `.env.local`, and in the hosting settings when you deploy. Never use the `service_role` / secret key in this project.

## Project Structure

```
src/app/                   Pages and API routes (one folder per URL)
src/app/login/             Sign-in page and the "Continue with Google" action
src/app/auth/callback/     Where Google sends people back; enforces who is allowed
src/app/register/          Student profile form (first sign-in only)
src/app/dashboard/         Signed-in landing page (placeholder for the real screens)
src/app/api/health/        GET /api/health: is the app up and is the database reachable
src/proxy.js               Keeps the sign-in session fresh on every request
src/lib/auth.js            getAccess() and requireAccess(): who is this visitor?
src/lib/access.js          The rule: staff / student / must register / denied (pure, tested)
src/lib/email-rules.js     Which emails count as college emails (pure, tested)
src/lib/supabase/server.js Supabase client, used only for sign-in
src/lib/db.js              The database connection and run("R01", [params])
src/lib/queries.js         Every SQL query the app uses, with an id (R01, W01, ...)
scripts/export-queries.js  Writes the query list out as a .sql file
```

## Working Rules

1. **All SQL lives in `src/lib/queries.js`.** Add the query there with the next free id (R = read, W = write), then call it with `run("R10", [...])`. Ids R01 to R05 and W01 to W02 are already used. To avoid merge clashes each person uses their own range: Aarabdh 10 to 19, Tanishq 20 to 29, Dhruv 30 to 39 (for example `R10`, `W21`, `R31`). Do not write SQL inside pages or components. This keeps the course submission and the app identical.
2. **Always use `$1, $2...` parameters.** Never put a value into the SQL text by string concatenation.
3. **The database design is in the AP repo.** Table and column names come from `dbms/` in [LaundryFlow_AP_2026](https://github.com/parth-access/LaundryFlow_AP_2026) (`01_normalization.md` now, `03_schema.sql` when it is ready). If the app and the schema disagree, fix the app.
4. **To export the queries for the DE submission:**
   `npm run queries:export -- ../LaundryFlow_AP_2026/dbms/04_queries.sql`
5. **Do not change the sign-in files** (`src/lib/auth.js`, `src/lib/access.js`, `src/lib/email-rules.js`, `src/proxy.js`, `src/app/login`, `src/app/auth`) without telling Parth. Everyone depends on them.
6. This project uses Next.js 16 with Cache Components turned on, which differs from older tutorials. Do not add `export const dynamic = "force-dynamic"`. A route that must run on every request calls `await connection()` from `next/server` first (see `src/app/api/health/route.js`). A page that reads who is signed in must do it inside a `<Suspense>` boundary (see `src/app/dashboard/page.js`). `AGENTS.md` explains how to find the matching docs in `node_modules/next/dist/docs/`.

## Project Status

Currently in development as a B.Tech capstone project.

## Future Scope

- Laundry status notifications.
- Digital fine and payment records.
- Student laundry history.
