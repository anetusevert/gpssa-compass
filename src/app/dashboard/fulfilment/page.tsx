import { redirect } from "next/navigation";

export default function FulfilmentRedirect() {
  redirect("/dashboard/fulfilment/cases");
}
