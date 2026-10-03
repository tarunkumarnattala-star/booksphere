import type { Metadata } from "next";
import { pageMetadata } from "@/lib/metadata";

export const metadata: Metadata = pageMetadata({
  title: "Terms",
  description: "The terms of using BookSphere.",
  path: "/terms"
});

const supportEmail = process.env.NEXT_PUBLIC_SUPPORT_EMAIL;

export default function TermsPage() {
  return (
    <article className="editorial-page editorial-prose">
      <p className="caption">Effective July 14, 2026</p>
      <h1 className="large-title mt-4">Terms</h1>
      <p className="body-copy measure mt-5">By using BookSphere, you agree to use the service respectfully and lawfully. BookSphere is a knowledge-sharing community, not a substitute for professional, legal, medical, or financial advice.</p>
      <div className="mt-8 grid gap-5 border-t border-[color:var(--rule-strong)] pt-8">
        <section className="grid gap-2 border-b border-[color:var(--rule)] pb-5 md:grid-cols-[150px_minmax(0,1fr)] md:gap-5"><h2 className="caption caption-muted pt-[3px]">Your contributions</h2><p className="body-copy measure m-0">You keep ownership of content you create. You grant BookSphere permission to host, display, format, and distribute it within the service. Share your own analysis and short quotations only when legally permitted; do not upload copyrighted books or substantial excerpts.</p></section>
        <section className="grid gap-2 border-b border-[color:var(--rule)] pb-5 md:grid-cols-[150px_minmax(0,1fr)] md:gap-5"><h2 className="caption caption-muted pt-[3px]">Community conduct</h2><p className="body-copy measure m-0">Do not harass people, impersonate others, manipulate engagement, post unlawful material, or use automated methods to disrupt or scrape the service. We may remove content or restrict accounts to protect the community.</p></section>
        <section className="grid gap-2 border-b border-[color:var(--rule)] pb-5 md:grid-cols-[150px_minmax(0,1fr)] md:gap-5"><h2 className="caption caption-muted pt-[3px]">Book information</h2><p className="body-copy measure m-0">Catalog details and editorial summaries are provided for discovery and discussion. We work to keep them accurate, but readers should verify important claims against the original book and authoritative sources.</p></section>
        <section className="grid gap-2 border-b border-[color:var(--rule)] pb-5 md:grid-cols-[150px_minmax(0,1fr)] md:gap-5"><h2 className="caption caption-muted pt-[3px]">Availability</h2><p className="body-copy measure m-0">The service may change, pause, or end. To the extent permitted by law, BookSphere is provided without guarantees of uninterrupted availability or fitness for a particular purpose.</p></section>
        <section className="grid gap-2 border-b border-[color:var(--rule)] pb-5 md:grid-cols-[150px_minmax(0,1fr)] md:gap-5"><h2 className="caption caption-muted pt-[3px]">Contact</h2><p className="body-copy measure m-0">{supportEmail ? <>Questions: <a className="text-[color:var(--ink)] underline decoration-[color:var(--rule-strong)] underline-offset-[5px]" href={`mailto:${supportEmail}`}>{supportEmail}</a>.</> : "A verified support email must be configured before public launch."}</p></section>
      </div>
    </article>
  );
}
