import { Suspense } from "react";
import { signInWithGoogle } from "./actions";

export const metadata = { title: "Sign in | LaundryFlow" };

const MESSAGES = {
  not_allowed:
    "That Google account is not allowed. Students: use your college email (ending in @rishihood.edu.in or @something.rishihood.edu.in). Laundry staff: ask an admin to add your Google account.",
  auth_failed: "Sign-in did not work. Please try again.",
};

export default function LoginPage({ searchParams }) {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-6 px-6 py-24">
      <div className="w-full max-w-sm space-y-6 text-center">
        <h1 className="text-3xl font-semibold tracking-tight">Sign in to LaundryFlow</h1>
        <p className="text-zinc-600 dark:text-zinc-400">
          Students sign in with their college Google account. Laundry staff use the Google account an admin has added.
        </p>

        {/* searchParams is only known when a request arrives, so it is read inside <Suspense> */}
        <Suspense fallback={null}>
          <ErrorMessage searchParams={searchParams} />
        </Suspense>

        <form action={signInWithGoogle}>
          <button
            type="submit"
            className="w-full rounded-lg bg-zinc-900 px-4 py-3 font-medium text-white hover:bg-zinc-700 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
          >
            Continue with Google
          </button>
        </form>
      </div>
    </main>
  );
}

async function ErrorMessage({ searchParams }) {
  const { error } = await searchParams;
  const message = typeof error === "string" ? MESSAGES[error] : undefined;
  if (!message) return null;
  return (
    <p role="alert" className="rounded-lg border border-red-300 bg-red-50 p-3 text-left text-sm text-red-800 dark:border-red-900 dark:bg-red-950 dark:text-red-200">
      {message}
    </p>
  );
}
