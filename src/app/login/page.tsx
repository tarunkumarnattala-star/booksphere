import { LoginForm } from "@/components/login-form";

export default function LoginPage() {
  return (
    <div className="editorial-page grid max-w-6xl gap-8 lg:grid-cols-[minmax(0,1fr)_420px] lg:gap-10">
      <section className="flex flex-col justify-center">
        <p className="caption mb-4">BookSphere Account</p>
        <h1 className="large-title">Save books. Join discussions. Follow thoughtful readers.</h1>
        <p className="body-copy mt-5 max-w-2xl">
          Log in to save books, recommend titles, follow thoughtful readers, and share perspectives that help other readers think more clearly.
        </p>
      </section>
      <LoginForm />
    </div>
  );
}
