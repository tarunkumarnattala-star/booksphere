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

// Reading needs no account, so the buttons open the product. Writing asks for sign-in at
// the moment it is needed - a stranger from a link should never meet a login screen first.
const browseHref = "/explore";
const signInHref = "/login?next=%2Fexplore";

const faqs = [
  {
    question: "Is BookSphere a book-summary app?",
    answer:
      "No. A summary tells you what an author said. BookSphere also shows how readers used the idea, what it changed, what they question, and where they would push back."
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

const angles = [
  {
    number: "01",
    title: "What changed",
    copy: "The idea a reader put to work, and what it changed for them."
  },
  {
    number: "02",
    title: "What clicked",
    copy: "The part that shifted how they think, long after the detail faded."
  },
  {
    number: "03",
    title: "What puzzles them",
    copy: "The question the book left open, waiting for someone to answer."
  },
  {
    number: "04",
    title: "Where they would push back",
    copy: "The claim that does not hold everywhere, and the conditions it needs."
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
function BetaLink({ quiet = false, label = "Start reading" }: { quiet?: boolean; label?: string }) {
  return (
    <Link className={quiet ? styles.quietBeta : styles.betaLink} href={quiet ? signInHref : browseHref}>
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
        <BetaLink quiet label="Log in" />
      </header>

      <main>
        {/* Order matters more than cleverness here. The previous hero opened with a
            perspective at display size and left a stranger to work out what the site was
            from the small print beside it - showing before telling only works when the
            visitor already knows what category they are in. So: what it is, what it is
            not, then the proof. */}
        <section className={styles.hero} aria-labelledby="landing-title">
          <div className={styles.heroContent}>
            <p className={styles.heroEyebrow}>Early access · 394 books</p>
            <h1 id="landing-title">
              You&rsquo;ll never read them all. <em>Read the people who did.</em>
            </h1>
            <p className={styles.heroLead}>
              Four questions on every book, answered by people who read it. Learn what they
              took from it — then ask them, or argue back.
            </p>

            <div className={styles.heroAngles} aria-label="The four angles on every book">
              {angles.map((angle) => (
                <div key={angle.title}>
                  <p className={styles.angleLabel}>{angle.title}</p>
                  <p className={styles.angleText}>{angle.copy}</p>
                </div>
              ))}
            </div>

            <div className={styles.heroActions}>
              <BetaLink />
              <p className={styles.heroFine}>Free to read · no account needed · sign in only when you want to post</p>
            </div>

            <div className={styles.heroProof}>
              <p className={styles.proofLabel}>This is what one looks like</p>
              <div className={styles.proofCard}>
                <div className={styles.proofMeta}>
                  <span className={styles.proofType}>Insight</span>
                  <span>The Hard Thing About Hard Things</span>
                </div>
                <p className={styles.proofTitle}>
                  &ldquo;The value here is that it refuses to give you a formula.&rdquo;
                </p>
                <p className={styles.proofBody}>
                  Horowitz says directly that there is no recipe for the hard things, and then
                  spends the book on situations where every option is bad. Layoffs, demoting a
                  loyal friend, telling the truth to people who will leave because of it.
                </p>
              </div>
            </div>
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
                <p><strong>BookSphere</strong> shows what a reader made of it.</p>
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
              <h2>Books teach ideas. Readers show what they made of them.</h2>
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
              <h2>One book. Four ways in.</h2>
              <p>
                The useful part is not agreement. It is seeing what different readers
                took from the same pages, and where they disagree.
              </p>
            </div>
            <div className={styles.outcomes}>
              {angles.map((outcome) => (
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
            <h2>Start with a book you have already read.</h2>
            <p>
              394 books, read through what people took from them, questioned, and argued
              with. It is early, and the first readers shape what this becomes.
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
