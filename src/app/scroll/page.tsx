import { redirect } from "next/navigation";

// The scroll was built here to be judged on its own before it replaced Home. It is Home now,
// and this stays so that any link already shared still lands in the right place.
export default function ScrollPage() {
  redirect("/explore");
}
