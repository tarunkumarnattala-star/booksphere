const supportEmail = process.env.NEXT_PUBLIC_SUPPORT_EMAIL;

export default function TermsPage() {
  return (
    <article className="editorial-page max-w-3xl">
      <p className="caption mb-4">Effective July 14, 2026</p>
      <h1 className="large-title">Terms.</h1>
      <p className="body-copy mt-6">By using BookSphere, you agree to use the service respectfully and lawfully. BookSphere is a knowledge-sharing community, not a substitute for professional, legal, medical, or financial advice.</p>
      <div className="mt-10 grid gap-8">
        <section><h2 className="title-3">Your contributions</h2><p className="body-copy mt-3">You keep ownership of content you create. You grant BookSphere permission to host, display, format, and distribute it within the service. Share your own analysis and short quotations only when legally permitted; do not upload copyrighted books or substantial excerpts.</p></section>
        <section><h2 className="title-3">Community conduct</h2><p className="body-copy mt-3">Do not harass people, impersonate others, manipulate engagement, post unlawful material, or use automated methods to disrupt or scrape the service. We may remove content or restrict accounts to protect the community.</p></section>
        <section><h2 className="title-3">Book information</h2><p className="body-copy mt-3">Catalog details and editorial summaries are provided for discovery and discussion. We work to keep them accurate, but readers should verify important claims against the original book and authoritative sources.</p></section>
        <section><h2 className="title-3">Availability</h2><p className="body-copy mt-3">The service may change, pause, or end. To the extent permitted by law, BookSphere is provided without guarantees of uninterrupted availability or fitness for a particular purpose.</p></section>
        <section><h2 className="title-3">Contact</h2><p className="body-copy mt-3">{supportEmail ? <>Questions: <a className="font-medium text-[color:var(--color-text-primary)] underline underline-offset-4" href={`mailto:${supportEmail}`}>{supportEmail}</a>.</> : "A verified support email must be configured before public launch."}</p></section>
      </div>
    </article>
  );
}
