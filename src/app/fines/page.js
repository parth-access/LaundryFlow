// OWNER: Dhruv. Wash & fines has three pages; /fines opens the first one.
import { redirect } from "next/navigation";

export default function FinesPage() {
  redirect("/fines/wash");
}
