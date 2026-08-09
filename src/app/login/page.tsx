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
    <div className="editorial-page grid max-w-6xl gap-8 lg:grid-cols-[minmax(0,1fr)_420px] lg:gap-10">
      <section className="flex flex-col justify-center">
        <p className="caption mb-4">BookSphere Account</p>
        <h1 className="large-title">Join the private beta. Or log back in.</h1>
        <p className="body-copy mt-5 max-w-2xl">
          Log in to save books, recommend titles, follow thoughtful readers, and share perspectives that help other readers think more clearly.
        </p>
      </section>
      <LoginForm next={next} />
    </div>
  );
}
