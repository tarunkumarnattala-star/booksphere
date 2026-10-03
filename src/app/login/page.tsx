import type { Metadata } from "next";
import { pageMetadata } from "@/lib/metadata";
import { LoginForm } from "@/components/login-form";

export const metadata: Metadata = pageMetadata({
  title: "Sign in",
  description: "Sign in to write a perspective, save a book, or reply to someone.",
  path: "/login",
  noIndex: true
});


export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const { next } = await searchParams;

  return (
    <div className="editorial-page editorial-prose">
      {/* "Join the private beta" framed a free, open product as invite-only, on the one page
          a stranger reaches by trying to write something. */}
      <p className="caption">Sign in</p>
      <h1 className="large-title mt-4 max-w-[16ch]">Sign in to write</h1>
      <p className="body-copy measure mt-5">
        Reading never asks for an account. Writing does, so a perspective can carry a name and
        somebody can reply to you.
      </p>
      <LoginForm next={next} />
    </div>
  );
}
