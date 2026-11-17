// A signed-in page: navigation (sidebar / phone tabs) plus the page itself.
//   <AppPage title="Counter" subtitle="..." back={{ href: "/counter", label: "Counter" }} action={<ButtonLink .../>}>
import { Suspense } from "react";
import { PageHeader } from "./ui";
import TopBar, { Shell } from "./top-bar";

export function AppPage({ title, subtitle, back, action, children }) {
  // Older pages passed back="/dashboard" (a string) or back={null}.
  const backLink = typeof back === "string" ? { href: back, label: "Back" } : back ?? null;
  return (
    <div className="flex-1 lg:grid lg:grid-cols-[15rem_1fr]">
      <Suspense fallback={<Shell />}>
        <TopBar />
      </Suspense>
      <main className="min-w-0 px-4 pb-28 pt-6 sm:px-6 lg:px-12 lg:pb-12 lg:pt-10">
        <div className="mx-auto max-w-3xl">
          <PageHeader title={title} subtitle={subtitle} back={backLink} action={action} />
          <div className="space-y-6">{children}</div>
        </div>
      </main>
    </div>
  );
}
