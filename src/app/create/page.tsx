import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { pageMetadata } from "@/lib/metadata";

export const metadata: Metadata = pageMetadata({
  title: "Write",
  description: "Share what you applied, questioned, or learned.",
  path: "/create",
  noIndex: true
});

export default function CreatePage() {
  redirect("/feed");
}
