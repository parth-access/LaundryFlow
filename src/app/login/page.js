import { Suspense } from "react";
import { signInWithGoogle } from "./actions";
import { AuthCard } from "@/components/auth-card";
import { BagTag } from "@/components/ui";

export const metadata = { title: "Sign in | LaundryFlow" };

const MESSAGES = {
  not_allowed:
    "That Google account can't sign in here. Students: use your college email ending in rishihood.edu.in. Laundry staff: ask an admin to add your Google account.",
  auth_failed: "Sign-in didn't finish. Try again.",
};

export default function LoginPage({ searchParams }) {
  return (
    <AuthCard
      title="Sign in"
      subtitle="Students use their college Google account. Laundry staff use the account an admin added."
      aside={
        <div className="space-y-6">
          <BagTag prefix="B" number="1054" size="lg" />
          <p className="font-display text-3xl font-semibold leading-tight tracking-tight">
            Your bag number is all the counter needs.
          </p>
        </div>
      }
    >
      {/* searchParams is only known when a request arrives, so it is read inside <Suspense> */}
      <Suspense fallback={null}>
        <ErrorMessage searchParams={searchParams} />
      </Suspense>

      <form action={signInWithGoogle}>
        <button
          type="submit"
          className="flex w-full items-center justify-center gap-3 rounded-full border border-field bg-white px-4 py-3.5 font-medium text-ink transition-colors hover:bg-peach-soft"
        >
          <GoogleMark />
          Continue with Google
        </button>
      </form>
      <p className="mt-6 text-sm text-muted">New students set up their bag tag right after signing in.</p>
    </AuthCard>
  );
}

async function ErrorMessage({ searchParams }) {
  const { error } = await searchParams;
  const message = typeof error === "string" ? MESSAGES[error] : undefined;
  if (!message) return null;
  return (
    <p role="alert" className="mb-6 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-800">
      {message}
    </p>
  );
}

function GoogleMark() {
  return (
    <svg aria-hidden viewBox="0 0 48 48" className="size-5">
      <path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9 3.5l6.7-6.7C35.6 2.4 30.2 0 24 0 14.6 0 6.6 5.4 2.6 13.2l7.8 6.1C12.3 13.6 17.7 9.5 24 9.5z" />
      <path fill="#4285F4" d="M46.5 24.5c0-1.6-.1-3.1-.4-4.5H24v9h12.7c-.6 3-2.3 5.5-4.8 7.2l7.5 5.8c4.4-4.1 7.1-10.1 7.1-17.5z" />
      <path fill="#FBBC05" d="M10.4 28.7A14.5 14.5 0 0 1 9.5 24c0-1.6.3-3.2.8-4.7l-7.8-6.1A24 24 0 0 0 0 24c0 3.9.9 7.5 2.6 10.8l7.8-6.1z" />
      <path fill="#34A853" d="M24 48c6.5 0 11.9-2.1 15.9-5.8l-7.5-5.8c-2.1 1.4-4.9 2.3-8.4 2.3-6.3 0-11.7-4.1-13.6-9.8l-7.8 6.1C6.6 42.6 14.6 48 24 48z" />
    </svg>
  );
}
