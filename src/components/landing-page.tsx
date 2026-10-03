import Link from "next/link";
import styles from "./landing-page.module.css";
import type { LandingPerspective } from "@/lib/landing-evidence";

// Reading needs no account, so the buttons open the product. Writing asks for sign-in at
// the moment it is needed - a stranger from a link should never meet a login screen first.
const browseHref = "/explore";
const signInHref = "/login?next=%2Fexplore";

// Every entry below is a real published perspective: its own type, its own title, its own
// first lines, on the book it was actually written about, attributed to whoever wrote it.
// Nothing here is a mock-up. If one is edited or unpublished, edit or remove it here too -
// an invented example on the front door would be worse than a shorter list.
//
// The exact four words a book page asks, quoted rather than paraphrased. Someone who follows
// a link to one of those questions should meet the same wording there that they read here.
const questions = [
  { n: "01", q: "What changed", a: "The idea someone put to work, and what it changed." },
  { n: "02", q: "What clicked", a: "The part that shifted how they think, after the detail faded." },
  { n: "03", q: "What puzzles you", a: "The question the book left open." },
  { n: "04", q: "Where you’d push back", a: "The claim that does not hold everywhere." }
];

const faqs = [
  {
    question: "Is this a book-summary app?",
    answer:
      "No. A summary tells you what an author said. Here you also get how a reader used the idea, what it changed, what they still question, and where they would push back."
  },
  {
    question: "Do I need to finish a book before I start?",
    answer:
      "No. Start with a question, a concept, or a book. Read what the useful part turned out to be, then decide whether the full book is worth your next block of attention."
  },
  {
    question: "What can I write about?",
    answer:
      "Something you learned, tried, changed, or questioned in real life. A book can give it context, but it is never required."
  },
  {
    question: "What does it cost, and what do I get?",
    answer:
      "Nothing, and all of it: 394 books, the perspectives written on them, concept search, and reading paths. It is early and deliberately small, so what you write shapes what this becomes. There is no waiting list."
  }
];

function Wordmark() {
  return (
    <Link href="/" className={styles.wordmark}>
      BookSphere
    </Link>
  );
}

export function LandingPage({ perspectiveCount, perspectives }: { perspectiveCount: number | null; perspectives: LandingPerspective[] }) {
  return (
    <div className={styles.page}>
      <header className={styles.masthead}>
        <Wordmark />
        <Link className={styles.quietAction} href={signInHref}>
          Log in
        </Link>
      </header>

      <main>
        {/* Claim, then evidence, then structure. The previous order put the taxonomy of answer
            types above the fold and the first real answer 2,100px down a phone, so a stranger
            met the filing system before anything worth filing. */}
        <section className={styles.hero} aria-labelledby="landing-title">
          <p className={styles.eyebrow}>Early access · 394 books</p>
          <h1 id="landing-title" className={styles.display}>
            You&rsquo;ll never read them all. <em>Read the people who did.</em>
          </h1>
          <p className={styles.lead}>
            Someone finished the book and wrote down what they made of it — what changed, what
            they still question, where they would push back. Read that. Then ask them, or
            argue.
          </p>
          <div className={styles.heroActions}>
            <Link className={styles.action} href={browseHref}>
              Start reading <span aria-hidden="true">&rarr;</span>
            </Link>
            <p className={styles.fine}>
              Free to read. No account needed. Sign in only when you want to write.
            </p>
          </div>
        </section>

        {/* The whole argument for the site, printed rather than described. Four real
            perspectives on four different books: the type stamp teaches the taxonomy by
            example, so the section below it explains something already seen. */}
        <section className={styles.evidence} aria-labelledby="evidence-title">
          <div className={styles.sectionHead}>
            <p className={styles.label}>What is actually here</p>
            <h2 id="evidence-title" className={styles.sectionTitle}>
              {/* Counted, never typed. With no count available the sentence claims no number. */}
              {perspectiveCount === null
                ? "What readers have written so far. Here are four."
                : `${perspectiveCount} perspectives are written. Here are four.`}
            </h2>
          </div>
          {/* Unordered: these four are a sample, not a sequence. The four questions below
              are an <ol> because they really are numbered 01-04. */}
          <ul className={styles.records}>
            {perspectives.map((item) => (
              <li key={item.title} className={styles.record}>
                <p className={styles.stamp}>{item.type}</p>
                <div className={styles.recordBody}>
                  <h3 className={styles.recordTitle}>{item.title}</h3>
                  <p className={styles.recordText}>{item.excerpt}</p>
                  <p className={styles.recordMeta}>
                    <span>{item.book}</span>
                    <span>{item.author}</span>
                  </p>
                  {/* On its own line, and prefixed, so three names in a row can never be
                      misread as three authors of the book. */}
                  <p className={styles.recordWriter}>Written by {item.writer}</p>
                </div>
              </li>
            ))}
          </ul>
          <p className={styles.recordsNote}>
            Open any of them on the book&rsquo;s page, where you can reply to the writer or add
            your own.
          </p>
        </section>

        <section className={styles.band} aria-labelledby="questions-title">
          <div className={styles.bandInner}>
            <div className={styles.sectionHead}>
              <p className={styles.label}>On every book page</p>
              <h2 id="questions-title" className={styles.sectionTitle}>
                Four questions, asked the same way every time.
              </h2>
            </div>
            <ol className={styles.records}>
              {questions.map((item) => (
                <li key={item.n} className={styles.record}>
                  <p className={`${styles.stamp} ${styles.stampNum}`}>{item.n}</p>
                  <div className={styles.recordBody}>
                    <h3 className={styles.recordTitle}>{item.q}</h3>
                    <p className={styles.recordText}>{item.a}</p>
                  </div>
                </li>
              ))}
            </ol>

            {/* The sharpest three lines on the page. They were previously set below a 102px
                headline that restated them, so the headline is gone and the mono label is
                the heading - it is the only line here doing a heading's job, so it is marked
                up as one rather than being a paragraph a screen reader skips past. */}
            <section className={styles.compare} aria-labelledby="compare-title">
              <h2 id="compare-title" className={styles.label}>
                Against what you already use
              </h2>
              <dl className={styles.compareList}>
                <div>
                  <dt>Ratings</dt>
                  <dd>tell you whether people liked the book.</dd>
                </div>
                <div>
                  <dt>Summaries</dt>
                  <dd>tell you what the author said.</dd>
                </div>
                <div className={styles.compareUs}>
                  <dt>BookSphere</dt>
                  <dd>shows you what a reader made of it.</dd>
                </div>
              </dl>
            </section>
          </div>
        </section>

        <section className={styles.faq} aria-labelledby="faq-title">
          <div className={styles.sectionHead}>
            <p className={styles.label}>Fair questions</p>
            <h2 id="faq-title" className={styles.sectionTitle}>
              What this is, and what it is not.
            </h2>
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
        </section>

        <section className={styles.close} aria-labelledby="close-title">
          <div className={styles.closeInner}>
            <h2 id="close-title" className={styles.closeTitle}>
              Start with a book you have already read.
            </h2>
            <p className={styles.closeText}>
              See what someone else took from it, and whether you agree. 394 books are open. It
              is early, and the first readers decide what this becomes.
            </p>
            <div className={styles.heroActions}>
              <Link className={styles.action} href={browseHref}>
                Start reading <span aria-hidden="true">&rarr;</span>
              </Link>
              <p className={styles.fine}>Free to read. No account needed.</p>
            </div>
          </div>
        </section>
      </main>

      <footer className={styles.footer}>
        <Wordmark />
        <p>Early access</p>
        <nav aria-label="Legal">
          <Link href="/privacy">Privacy</Link>
          <Link href="/terms">Terms</Link>
        </nav>
      </footer>
    </div>
  );
}
