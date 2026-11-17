import { Suspense } from "react";
import { redirect } from "next/navigation";
import { getAccess } from "@/lib/auth";
import { AuthCard } from "@/components/auth-card";
import RegisterForm from "./register-form";

export const metadata = { title: "Set up your bag | LaundryFlow" };

export default function RegisterPage() {
  return (
    <AuthCard
      title="Set up your bag"
      subtitle="One time only. The counter finds your laundry by this tag."
      aside={
        <p className="font-display text-3xl font-semibold leading-tight tracking-tight">
          B for boys&apos; hostel, G for girls&apos;. The number is the one stitched on your bag.
        </p>
      }
    >
      <Suspense fallback={<p className="text-muted">Loading…</p>}>
        <Form />
      </Suspense>
    </AuthCard>
  );
}

async function Form() {
  const access = await getAccess();
  if (access.kind === "anonymous") redirect("/login");
  if (access.kind === "denied") redirect("/login?error=not_allowed");
  if (access.kind !== "unregistered") redirect("/dashboard");
  return <RegisterForm email={access.email} suggestedName={access.name} />;
}
