import { redirect } from "next/navigation";

export default function CreatePage() {
  redirect("/search?intent=add");
}
