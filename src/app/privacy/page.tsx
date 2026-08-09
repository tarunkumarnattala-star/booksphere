import type { Metadata } from "next";
import { pageMetadata } from "@/lib/metadata";

export const metadata: Metadata = pageMetadata({
  title: "Privacy",
  description: "How BookSphere handles your data.",
  path: "/privacy"
});

const supportEmail = process.env.NEXT_PUBLIC_SUPPORT_EMAIL;

export default function PrivacyPage() {
  return (
    <article className="editorial-page max-w-3xl">
      <p className="caption mb-4">Effective July 14, 2026</p>
      <h1 className="large-title">Privacy.</h1>
      <p className="body-copy mt-6">BookSphere collects the account, profile, and community content you choose to provide so the service can operate. It also records limited product events needed to understand reliability and improve the experience.</p>
      <div className="mt-10 grid gap-8">
        <section><h2 className="title-3">What we store</h2><p className="body-copy mt-3">Your email and sign-in identity, public profile details, posts, comments, reactions, follows, reports, saved books, saved insights, followed discussions, and basic product events. Saved books, saved insights, followed discussions, reading status, reports, and account analytics are not shown publicly.</p></section>
        <section><h2 className="title-3">How we use it</h2><p className="body-copy mt-3">We use this information to provide your account, publish the contributions you submit, personalize your saved activity, prevent abuse, respond to reports, and understand whether BookSphere is working correctly.</p></section>
        {/* All three processors are named. Resend receives every reader's email address on
            every sign-in link, which is the most identifying thing BookSphere holds, and it
            was not disclosed at all; Vercel was referred to only as "its hosting provider".
            GDPR Art. 13(1)(e) expects the recipients to be identified. */}
        <section><h2 className="title-3">Service providers</h2><p className="body-copy mt-3">BookSphere uses Supabase for authentication and data storage, Vercel for hosting, delivery, and operational logs, and Resend for delivering sign-in and account emails. Each receives only what it needs to perform that function. We do not sell personal information.</p></section>
        <section><h2 className="title-3">Your choices</h2><p className="body-copy mt-3">You may edit your public profile. Removing a perspective you wrote hides it from the community; a copy remains in our database until you ask us to erase it. You may request access, correction, or deletion of your account data through the support contact below.</p></section>
        <section><h2 className="title-3">Contact</h2><p className="body-copy mt-3">{supportEmail ? <>Privacy requests: <a className="font-medium text-[color:var(--color-text-primary)] underline underline-offset-4" href={`mailto:${supportEmail}`}>{supportEmail}</a>.</> : "A verified support email must be configured before public launch."}</p></section>
      </div>
    </article>
  );
}
