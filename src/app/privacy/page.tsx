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
        <section><h2 className="title-3">Service providers</h2><p className="body-copy mt-3">BookSphere uses Supabase for authentication and data storage and may use its hosting provider for delivery and operational logs. We do not sell personal information.</p></section>
        <section><h2 className="title-3">Your choices</h2><p className="body-copy mt-3">You may edit your public profile and remove your own community activity where the product provides that control. You may request access, correction, or deletion of your account data through the support contact below.</p></section>
        <section><h2 className="title-3">Contact</h2><p className="body-copy mt-3">{supportEmail ? <>Privacy requests: <a className="font-medium text-[color:var(--color-text-primary)] underline underline-offset-4" href={`mailto:${supportEmail}`}>{supportEmail}</a>.</> : "A verified support email must be configured before public launch."}</p></section>
      </div>
    </article>
  );
}
