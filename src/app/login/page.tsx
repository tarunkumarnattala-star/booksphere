import type { Metadata } from "next";
import { pageMetadata } from "@/lib/metadata";
import { LoginForm } from "@/components/login-form";

export const metadata: Metadata = pageMetadata({
  title: "Log in or join",
  description: "Join BookSphere to write, follow, and save books.",
  path: "/login",
  noIndex: true
});


export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const { next } = await searchParams;

  return (
    <div className="editorial-page grid max-w-6xl gap-5 lg:grid-cols-[minmax(0,1fr)_420px] lg:gap-10">
      <section className="flex flex-col justify-center">
        <h1 className="large-title">Join the private beta. Or log back in.</h1>
        <p className="body-copy mt-3 max-w-2xl">
          Reading needs no account. Log in to save a book, write a perspective, or follow a reader.
        </p>
      </section>
      <LoginForm next={next} />
    </div>
  );
}
