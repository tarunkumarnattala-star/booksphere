"use client";

import Link from "next/link";
import {
  ArrowDown,
  ArrowRight,
  BookOpen,
  Check,
  Search,
  Sparkles,
  UsersRound
} from "lucide-react";
import styles from "./landing-page.module.css";

const betaHref = "/login?next=%2Fexplore";

const faqs = [
  {
    question: "Is BookSphere a book-summary app?",
    answer:
      "No. A summary tells you what an author said. BookSphere also shows how readers used the idea, where it broke down, what they questioned, and whether the full book deserves your time."
  },
  {
    question: "Do I need to finish a book before joining?",
    answer:
      "No. Start with a question, concept, or book. You can understand the useful context first, then decide whether deeper reading is right for you."
  },
  {
    question: "What belongs in the knowledge feed?",
    answer:
      "Something you learned, tried, changed, or questioned in real life. A book can add context, but it is never required."
  },
  {
    question: "What do I get when I sign in?",
    answer:
      "The full product: 394 books, the perspectives readers have written on them, concept search, and reading paths. It is early and deliberately small, so what you write shapes what this becomes. There is no waiting list and nothing to pay."
  }
];

const outcomes = [
  {
    number: "01",
    title: "It worked",
    copy: "The idea changed a decision, habit, conversation, or result."
  },
  {
    number: "02",
    title: "It failed",
    copy: "The advice met a real limit the book did not make obvious."
  },
  {
    number: "03",
    title: "It changed my mind",
    copy: "A reader saw the claim differently after testing it."
  },
  {
    number: "04",
    title: "It connected",
    copy: "One idea became clearer through another book or lived experience."
  }
];

function Brand() {
  return (
    <Link href="/" className={styles.brand} aria-label="BookSphere home">
      <span className={styles.brandMark}>
        <BookOpen aria-hidden="true" size={17} strokeWidth={1.8} />
      </span>
      <span>BookSphere</span>
    </Link>
  );
}

// "Join the Private Beta" promised gated exclusivity - a passcode, a queue, an approval -
// and none of it exists: the link goes straight to sign-in. It also sold the waiting room
// instead of the product. The button now names what is actually on the other side of it.
function BetaLink({ quiet = false, label = "See what happened next" }: { quiet?: boolean; label?: string }) {
  return (
    <Link className={quiet ? styles.quietBeta : styles.betaLink} href={betaHref}>
      {label}
      <ArrowRight aria-hidden="true" size={17} strokeWidth={1.8} />
    </Link>
  );
}

export function LandingPage() {
  return (
    <div className={styles.page}>
      <header className={styles.nav}>
        <Brand />
        <nav aria-label="Landing page">
          <a href="#why">Why BookSphere</a>
          <a href="#how">How it works</a>
          <a href="#knowledge">Knowledge</a>
          <a href="#faq">FAQ</a>
        </nav>
        <BetaLink quiet label="Start reading" />
      </header>

      <main>
        <section className={styles.hero} aria-labelledby="landing-title">
          <div className={styles.heroScene} aria-hidden="true">
            <span>Read</span>
            <span>Question</span>
            <span>Apply</span>
            <span>Change</span>
          </div>
          <div className={styles.heroContent}>
            <p className={styles.heroEyebrow}>Early access · Built with its first readers</p>
            <h1 id="landing-title">
              Understand books through the people who lived their ideas.
            </h1>
            <p className={styles.heroCopy}>
              Every book gives advice. Almost none of them tell you what happened when
              someone actually tried it. That part is here.
            </p>
            <BetaLink />
          </div>
          <a className={styles.scrollCue} href="#why">
            Discover BookSphere
            <ArrowDown aria-hidden="true" size={15} />
          </a>
        </section>

        <section className={styles.why} id="why">
          <div className={styles.shell} data-landing-reveal>
            <p className={styles.kicker}>Beyond the takeaway</p>
            <h2>Ideas are everywhere. Understanding is still rare.</h2>
            <div className={styles.whyGrid}>
              <p className={styles.whyLead}>
                Social media makes an idea interesting. BookSphere makes it
                understandable, reliable, and useful.
              </p>
              <div className={styles.comparison}>
                <p><span>Ratings</span> tell you if people liked the book.</p>
                <p><span>Summaries</span> tell you what the author said.</p>
                <p><strong>BookSphere</strong> shows what happened next.</p>
              </div>
            </div>
          </div>
        </section>

        <section className={styles.how} id="how">
          <div className={styles.shell} data-landing-reveal>
            <div className={styles.sectionIntro}>
              <p className={styles.kicker}>How it works</p>
              <h2>From curiosity to something you can use.</h2>
            </div>
            <div className={styles.steps}>
              <article>
                <span>01</span>
                <Search aria-hidden="true" size={25} strokeWidth={1.5} />
                <h3>Search</h3>
                <p>Begin with a book, question, concept, or goal.</p>
              </article>
              <article>
                <span>02</span>
                <Sparkles aria-hidden="true" size={25} strokeWidth={1.5} />
                <h3>Understand</h3>
                <p>Get the useful idea, its context, and its limits.</p>
              </article>
              <article>
                <span>03</span>
                <Check aria-hidden="true" size={25} strokeWidth={1.5} />
                <h3>Apply</h3>
                <p>Compare real outcomes before deciding what fits your life.</p>
              </article>
            </div>
          </div>
        </section>

        <section className={styles.concepts} id="knowledge">
          <div className={styles.conceptLayout} data-landing-reveal>
            <div className={styles.conceptCopy}>
              <p className={styles.kicker}>Concept search</p>
              <h2>Curiosity deserves more than a trend.</h2>
              <p>
                Find the plain-language idea, why it matters, where it came from,
                and the books and experiences that make it clearer.
              </p>
            </div>
            <div className={styles.conceptStudy} aria-label="Example concept">
              <div className={styles.studyHeader}>
                <span>Behavior · Source-aware</span>
                <Sparkles aria-hidden="true" size={21} strokeWidth={1.5} />
              </div>
              <p className={styles.studyQuestion}>Why can’t I stop scrolling?</p>
              <h3>Dopamine loops</h3>
              <div className={styles.studyNotes}>
                <div>
                  <span>In simple terms</span>
                  <p>
                    Unpredictable rewards teach the brain to keep checking, even
                    when the last check was not satisfying.
                  </p>
                </div>
                <div>
                  <span>What to notice</span>
                  <p>
                    The cue often matters more than motivation. Change the
                    environment before blaming your willpower.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className={styles.feed}>
          <div className={styles.feedInner} data-landing-reveal>
            <div>
              <p className={styles.kicker}>Knowledge feed</p>
              <h2>Books teach ideas. People show what happened next.</h2>
            </div>
            <blockquote>
              <span>Reader reflection</span>
              “I stopped defending my solution and explained the problem first.
              The conversation changed.”
              <small>A book can add context. Real experience is the point.</small>
            </blockquote>
          </div>
        </section>

        <section className={styles.perspectives}>
          <div className={styles.shell} data-landing-reveal>
            <div className={styles.perspectiveIntro}>
              <p className={styles.kicker}>Reader perspectives</p>
              <h2>One book. Many honest outcomes.</h2>
              <p>
                The useful part is not agreement. It is seeing the conditions
                under which an idea helps, fails, or changes.
              </p>
            </div>
            <div className={styles.outcomes}>
              {outcomes.map((outcome) => (
                <article key={outcome.number}>
                  <span>{outcome.number}</span>
                  <h3>{outcome.title}</h3>
                  <p>{outcome.copy}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className={styles.faq} id="faq">
          <div className={styles.shell} data-landing-reveal>
            <div className={styles.faqIntro}>
              <p className={styles.kicker}>Questions, answered</p>
              <h2>Know what you are joining.</h2>
            </div>
            <div className={styles.faqList}>
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

        <section className={styles.final}>
          <div data-landing-reveal>
            <UsersRound aria-hidden="true" size={28} strokeWidth={1.3} />
            <p className={styles.kicker}>Start here</p>
            <h2>Find out what happened when someone tried it.</h2>
            <p>
              394 books, read through what people applied, questioned, and abandoned.
              It is early, and the first readers shape what this becomes.
            </p>
            <BetaLink />
          </div>
        </section>
      </main>

      <footer className={styles.footer}>
        <Brand />
        <p>BookSphere · Early access</p>
        <nav aria-label="Legal">
          <Link href="/privacy">Privacy</Link>
          <Link href="/terms">Terms</Link>
        </nav>
      </footer>
    </div>
  );
}
