// A signed-in page: the top bar, then the usual <Page> layout from ui.js.
// Use this in server pages:  import { AppPage } from "@/components/app-page";
import { Suspense } from "react";
import { Page } from "./ui";
import TopBar, { Shell } from "./top-bar";

export function AppPage(props) {
  return (
    <>
      <Suspense fallback={<Shell />}>
        <TopBar />
      </Suspense>
      <Page {...props} />
    </>
  );
}
