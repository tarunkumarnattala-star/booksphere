"use client";

import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  Bookmark,
  Check,
  ChevronDown,
  Clock3,
  MessageCircle,
  Search,
  Sparkles,
  UsersRound
} from "lucide-react";
import { useEffect } from "react";
import { BookCover } from "./book-cover";

const betaHref = "/login?next=%2Fexplore";

const books = {
  atomic: {
    title: "Atomic Habits",
    author: "James Clear",
    isbn: "9780735211292",
    coverUrl: "https://covers.openlibrary.org/b/id/12539702-L.jpg"
  },
  psychology: {
    title: "The Psychology of Money",
    author: "Morgan Housel",
    isbn: "9780857197689",
    coverUrl: "https://covers.openlibrary.org/b/id/10389354-L.jpg"
  },
  deepWork: {
    title: "Deep Work",
    author: "Cal Newport",
    isbn: "9781455586691",
    coverUrl: "https://covers.openlibrary.org/b/id/7988607-L.jpg"
  }
};

const faqs = [
  {
    question: "Is BookSphere a book-summary app?",
    answer:
      "Not exactly. BookSphere gives you a clear starting point, then adds what summaries miss: how readers applied the idea, where it failed, what they questioned, and whether the full book deserves your time."
  },
  {
    question: "Do I need to finish a book before joining?",
    answer:
      "No. You can search a question, understand a concept, compare reader perspectives, or explore a book before deciding to read it."
  },
  {
    question: "What can I share in the Feed?",
    answer:
      "Share useful knowledge from real life: something you tried, noticed, changed, or questioned. A book can add context, but it is never required."
  },
  {
    question: "What does joining the private beta mean?",
    answer:
      "You get early access to the working product and help shape what BookSphere becomes. The first beta is intentionally small so every piece of feedback can improve the product."
  }
];

function BetaButton({ compact = false }: { compact?: boolean }) {
  return (
    <Link className={`landing-beta-button ${compact ? "landing-beta-button--compact" : ""}`} href={betaHref}>
      Join the Private Beta
      <ArrowRight aria-hidden="true" size={compact ? 16 : 18} strokeWidth={2} />
    </Link>
  );
}

function ProductMark() {
  return (
    <Link href="/" className="landing-brand" aria-label="BookSphere home">
      <span className="landing-brand-icon">
        <BookOpen aria-hidden="true" size={18} strokeWidth={2} />
      </span>
      <span>BookSphere</span>
    </Link>
  );
}

function HeroProduct() {
  return (
    <div className="landing-hero-product" aria-label="Preview of the BookSphere product">
      <div className="landing-window-bar">
        <span className="landing-window-brand">
          <BookOpen aria-hidden="true" size={15} />
          BookSphere
        </span>
        <span>Useful ideas</span>
        <span>Reader views</span>
        <span>Worth reading?</span>
      </div>

      <div className="landing-book-preview">
        <BookCover book={books.atomic} priority className="landing-hero-cover" />
        <div className="landing-book-copy">
          <span className="landing-eyebrow">Personal Growth · Productivity</span>
          <h3>Atomic Habits</h3>
          <p className="landing-author">James Clear</p>
          <div className="landing-divider" />
          <span className="landing-micro-label">What this book is about</span>
          <p>
            A practical system for making good habits easier, bad habits harder, and repeated actions more aligned with identity.
          </p>
        </div>
      </div>

      <div className="landing-perspective-strip">
        <div>
          <span className="landing-avatar">TK</span>
          <span>
            <strong>Applied in real life</strong>
            <small>“Changing the room worked better than chasing motivation.”</small>
          </span>
        </div>
        <div className="landing-strip-actions">
          <span><MessageCircle size={15} /> 18</span>
          <span><Bookmark size={15} /> 34</span>
        </div>
      </div>
    </div>
  );
}

function BookPagePreview() {
  return (
    <div className="landing-product-screen landing-book-screen">
      <div className="landing-screen-nav">
        <span><BookOpen size={16} /> BookSphere</span>
        <span>Explore</span>
        <span>Genres</span>
        <span>Feed</span>
        <span>Search</span>
      </div>
      <div className="landing-screen-book">
        <BookCover book={books.psychology} className="landing-screen-cover" />
        <div>
          <span className="landing-eyebrow">Finance · Psychology</span>
          <h3>The Psychology of Money</h3>
          <p className="landing-author">Morgan Housel</p>
          <span className="landing-micro-label">What this book is about</span>
          <p>
            How behavior, personal history, incentives, luck, and risk shape financial decisions.
          </p>
          <div className="landing-audience">
            <span>new investors</span>
            <span>long-term thinkers</span>
          </div>
        </div>
      </div>
      <div className="landing-screen-tabs">
        <span className="active">Useful ideas</span>
        <span>Reader views</span>
        <span>Worth reading?</span>
      </div>
    </div>
  );
}

function ConceptPreview() {
  return (
    <div className="landing-product-screen landing-concept-screen">
      <div className="landing-search-field">
        <Search aria-hidden="true" size={21} />
        <span>Why can’t I stop scrolling?</span>
      </div>
      <div className="landing-concept-body">
        <span className="landing-eyebrow">Behavior · Source-aware</span>
        <h3>Dopamine loops</h3>
        <p className="landing-concept-question">Why does “one more scroll” feel automatic?</p>
        <div className="landing-concept-grid">
          <div>
            <span className="landing-micro-label">In simple terms</span>
            <p>Unpredictable rewards teach the brain to keep checking, even when the last check was not satisfying.</p>
          </div>
          <div>
            <span className="landing-micro-label">Try this</span>
            <p>Remove the cue before relying on willpower: move the app, disable badges, and add one moment of friction.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function FeedPreview() {
  return (
    <div className="landing-product-screen landing-feed-screen">
      <div className="landing-feed-profile">
        <span className="landing-avatar landing-avatar--large">N</span>
        <span>
          <strong>Nadia</strong>
          <small>Today · Reader reflection</small>
        </span>
        <button type="button">Follow</button>
      </div>
      <span className="landing-eyebrow">Negotiation</span>
      <h3>I stopped defending my solution and explained the problem first.</h3>
      <p>
        The conversation changed when I made the cost of doing nothing clear. The other person started asking questions instead of raising objections.
      </p>
      <div className="landing-feed-reference">
        <BookCover book={books.deepWork} className="landing-reference-cover" />
        <span>
          <small>Optional reference</small>
          <strong>Deep Work</strong>
        </span>
      </div>
      <div className="landing-feed-actions">
        <span><MessageCircle size={17} /> 12</span>
        <span><Bookmark size={17} /> 29</span>
        <span><Check size={17} /> Helpful</span>
      </div>
    </div>
  );
}

export function LandingPage() {
  useEffect(() => {
    const elements = Array.from(document.querySelectorAll<HTMLElement>("[data-landing-reveal]"));
    if (!("IntersectionObserver" in window)) {
      elements.forEach((element) => element.setAttribute("data-visible", "true"));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            (entry.target as HTMLElement).setAttribute("data-visible", "true");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.16, rootMargin: "0px 0px -8% 0px" }
    );

    elements.forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, []);

  return (
    <div className="landing-page">
      <header className="landing-nav">
        <ProductMark />
        <nav aria-label="Landing page navigation">
          <a href="#product">Product</a>
          <a href="#how-it-works">How it works</a>
          <a href="#faq">FAQs</a>
        </nav>
        <BetaButton compact />
      </header>

      <main>
        <section className="landing-hero" aria-labelledby="landing-title">
          <div className="landing-hero-copy">
            <p className="landing-eyebrow">Private beta · First 100 readers</p>
            <h1 id="landing-title">BookSphere</h1>
            <h2>Understand books through the people who used, questioned, and challenged their ideas.</h2>
            <p className="landing-hero-description">
              Learn useful ideas, compare real reader perspectives, and decide whether a book deserves your time.
            </p>
            <div className="landing-hero-action">
              <BetaButton />
              <span>No credit card. Shape the product with us.</span>
            </div>
          </div>
          <HeroProduct />
          <a className="landing-scroll-cue" href="#problem" aria-label="Scroll to the problem">
            <span>Scroll</span>
            <ChevronDown aria-hidden="true" size={17} />
          </a>
        </section>

        <section id="problem" className="landing-problem">
          <div className="landing-section-inner" data-landing-reveal>
            <p className="landing-eyebrow">The problem</p>
            <h2>Ideas are everywhere.<br />Understanding is not.</h2>
            <div className="landing-source-line" aria-label="Sources of ideas">
              <span>TikTok</span>
              <span>YouTube</span>
              <span>Podcasts</span>
              <span>Newsletters</span>
              <span>Social feeds</span>
            </div>
            <p className="landing-problem-copy">
              Social media makes ideas interesting. BookSphere makes them understandable, reliable, and useful.
            </p>
          </div>
        </section>

        <section className="landing-contrast">
          <div className="landing-section-inner" data-landing-reveal>
            <p>Ratings tell you if people liked the book.</p>
            <p>Summaries tell you what the author said.</p>
            <h2>Neither tells you what worked, what failed, or what changed someone’s mind.</h2>
          </div>
        </section>

        <section id="product" className="landing-product-reveal">
          <div className="landing-section-heading" data-landing-reveal>
            <p className="landing-eyebrow">The book page</p>
            <h2>More than a summary.</h2>
            <p>Start with the useful part. Then see how the idea survived real life.</p>
          </div>
          <div className="landing-screen-wrap" data-landing-reveal>
            <BookPagePreview />
          </div>
        </section>

        <section id="how-it-works" className="landing-how">
          <div className="landing-section-inner">
            <div className="landing-section-heading" data-landing-reveal>
              <p className="landing-eyebrow">How it works</p>
              <h2>From curiosity to useful knowledge.</h2>
            </div>
            <div className="landing-steps" data-landing-reveal>
              <div>
                <span>01</span>
                <Search aria-hidden="true" size={24} />
                <h3>Search</h3>
                <p>Start with a book, concept, question, or goal.</p>
              </div>
              <div>
                <span>02</span>
                <Sparkles aria-hidden="true" size={24} />
                <h3>Understand</h3>
                <p>Get the idea simply, with sources and reader context.</p>
              </div>
              <div>
                <span>03</span>
                <Check aria-hidden="true" size={24} />
                <h3>Apply</h3>
                <p>Compare what people tried, challenged, and changed.</p>
              </div>
            </div>
          </div>
        </section>

        <section className="landing-feature landing-feature--light">
          <div className="landing-feature-copy" data-landing-reveal>
            <p className="landing-eyebrow">Concept search</p>
            <h2>Turn a trend into something you can use.</h2>
            <p>Understand the idea, check the context, find the books behind it, and see what people are noticing.</p>
            <ul>
              <li><Clock3 size={17} /> Clear enough to grasp quickly</li>
              <li><BookOpen size={17} /> Grounded in credible sources</li>
              <li><UsersRound size={17} /> Improved by lived experience</li>
            </ul>
          </div>
          <div className="landing-feature-visual" data-landing-reveal>
            <ConceptPreview />
          </div>
        </section>

        <section className="landing-feature landing-feature--dark">
          <div className="landing-feature-copy" data-landing-reveal>
            <p className="landing-eyebrow">The knowledge feed</p>
            <h2>Books teach ideas. People show what happens next.</h2>
            <p>The Feed is knowledge from life: what someone tried, noticed, changed, or questioned. A book can add context, but it is never required.</p>
          </div>
          <div className="landing-feature-visual" data-landing-reveal>
            <FeedPreview />
          </div>
        </section>

        <section className="landing-perspective-statement">
          <div className="landing-section-inner" data-landing-reveal>
            <p className="landing-eyebrow">Reader perspectives</p>
            <h2>One book.<br />Many honest outcomes.</h2>
            <div className="landing-outcomes">
              <span>Applied it</span>
              <span>Changed my thinking</span>
              <span>Didn’t work</span>
              <span>Disagreed</span>
              <span>Connected it</span>
            </div>
          </div>
        </section>

        <section id="faq" className="landing-faq">
          <div className="landing-section-inner">
            <div className="landing-section-heading" data-landing-reveal>
              <p className="landing-eyebrow">FAQs</p>
              <h2>A few useful answers.</h2>
            </div>
            <div className="landing-faq-list" data-landing-reveal>
              {faqs.map((faq) => (
                <details key={faq.question}>
                  <summary>
                    {faq.question}
                    <span aria-hidden="true">+</span>
                  </summary>
                  <p>{faq.answer}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        <section className="landing-final">
          <div data-landing-reveal>
            <p className="landing-eyebrow">Private beta</p>
            <h2>Help shape<br />BookSphere.</h2>
            <p>Join the first 100 readers building a better way to learn from books and from each other.</p>
            <BetaButton />
          </div>
        </section>
      </main>

      <footer className="landing-footer">
        <ProductMark />
        <p>Understand books through people.</p>
        <nav aria-label="Legal">
          <Link href="/privacy">Privacy</Link>
          <Link href="/terms">Terms</Link>
          <Link href="/explore">Open BookSphere</Link>
        </nav>
      </footer>
    </div>
  );
}
