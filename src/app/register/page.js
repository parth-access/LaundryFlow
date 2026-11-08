import { Suspense } from "react";
import { redirect } from "next/navigation";
import { getAccess } from "@/lib/auth";
import RegisterForm from "./register-form";

export const metadata = { title: "Create your profile | LaundryFlow" };

export default function RegisterPage() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center px-6 py-24">
      <div className="w-full max-w-sm space-y-6">
        <h1 className="text-center text-3xl font-semibold tracking-tight">Create your profile</h1>
        <Suspense fallback={<p className="text-center text-zinc-500">Loading...</p>}>
          <Form />
        </Suspense>
      </div>
    </main>
  );
}

async function Form() {
  const access = await getAccess();
  if (access.kind === "anonymous") redirect("/login");
  if (access.kind === "denied") redirect("/login?error=not_allowed");
  if (access.kind !== "unregistered") redirect("/dashboard");
  return <RegisterForm email={access.email} suggestedName={access.name} />;
}
