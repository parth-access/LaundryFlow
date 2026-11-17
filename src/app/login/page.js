import { Suspense } from "react";
import Link from "next/link";
import { signInWithGoogle } from "./actions";

export const metadata = { title: "Sign in | LaundryFlow" };

const MESSAGES = {
  not_allowed:
    "That Google account is not allowed. Students: use your college email (ending in @rishihood.edu.in or @something.rishihood.edu.in). Laundry staff: ask an admin to add your Google account.",
  auth_failed: "Sign-in did not work. Please try again.",
};

export default function LoginPage({ searchParams }) {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-6 px-4 py-16">
      <Link href="/" className="text-xl font-semibold tracking-tight">
        Laundry<span className="text-brand">Flow</span>
      </Link>
      <div className="w-full max-w-sm space-y-6 rounded-2xl border border-line bg-white p-8 text-center shadow-sm">
        <h1 className="text-2xl font-semibold tracking-tight">Sign in</h1>
        <p className="text-muted">
          Students sign in with their college Google account. Laundry staff use the Google account an admin has added.
        </p>

        {/* searchParams is only known when a request arrives, so it is read inside <Suspense> */}
        <Suspense fallback={null}>
          <ErrorMessage searchParams={searchParams} />
        </Suspense>

        <form action={signInWithGoogle}>
          <button
            type="submit"
            className="flex w-full items-center justify-center gap-3 rounded-lg border border-field bg-white px-4 py-3 font-medium text-zinc-900 hover:bg-zinc-50"
          >
            <span aria-hidden className="flex h-5 w-5 items-center justify-center rounded-full bg-brand text-xs font-bold text-white">
              G
            </span>
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
    <p role="alert" className="rounded-lg border border-red-300 bg-red-50 p-3 text-left text-sm text-red-800">
      {message}
    </p>
  );
}
