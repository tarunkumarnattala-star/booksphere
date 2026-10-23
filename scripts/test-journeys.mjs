// What a person actually does, driven in a real browser.
//
// Every other gate in this repo checks the code. None of them would notice if signing in,
// writing a perspective or opening a book stopped working, because all of that happens after
// the HTML arrives. Two of the worst things to go wrong this month were invisible to a build:
// two Google buttons stacked on the sign-in card because an effect re-ran, and fifty cards
// labelled "What a reader did" that the house account had written. One was client-side, the
// other was a true statement rendered in a false place. Checks that only read source could
// not see either, so these open a browser.
//
// Usage: node scripts/test-journeys.mjs [baseUrl]   (default http://localhost:3100)

import assert from "node:assert/strict";
import { chromium } from "playwright";

const BASE = (process.argv[2] || process.env.BASE_URL || "http://localhost:3100").replace(/\/$/, "");
const PHONE = { width: 375, height: 812 };

let passed = 0;
const failures = [];

async function journey(name, fn) {
  const browser = await chromium.launch();
  const context = await browser.newContext({ viewport: PHONE });
  const page = await context.newPage();
  const errors = [];
  page.on("console", (m) => { if (m.type() === "error") errors.push(m.text()); });
  page.on("pageerror", (e) => errors.push(String(e)));
  try {
    await fn(page, errors);
    // A journey that "works" while throwing in the console is not working. Chrome logs a
    // failed favicon and similar noise, so only errors from our own code count.
    const ours = errors.filter((e) =>
      !/favicon|ERR_CONNECTION_CLOSED|net::ERR_FAILED/i.test(e)
      // A page that correctly answers 404 makes the browser log a failed resource for the
      // navigation itself. Counting that as a console error made the 404 journey fail for
      // doing exactly what it was asserting.
      && !/Failed to load resource.*404/i.test(e));
    assert.equal(ours.length, 0, `console errors: ${ours.slice(0, 2).join(" | ")}`);
    console.log(`  PASS  ${name}`);
    passed += 1;
  } catch (error) {
    console.error(`  FAIL  ${name}\n          ${error.message.split("\n")[0]}`);
    failures.push(name);
  } finally {
    await browser.close();
  }
}

// Layout is read after forcing a reflow. Reading geometry straight after load reported every
// card as zero-height and the page as 926px during this work, which looked like a catastrophic
// bug and was stale layout in the measurement.
const settle = (page) => page.evaluate(() => { void document.documentElement.offsetHeight; return true; });

await journey("a stranger can read without an account", async (page) => {
  await page.goto(`${BASE}/explore`, { waitUntil: "domcontentloaded" });
  await page.waitForSelector("li");
  await settle(page);

  const cards = await page.locator("li").count();
  assert.ok(cards > 50, `expected a scroll worth scrolling, found ${cards} cards`);

  const height = await page.evaluate(() => document.documentElement.scrollHeight);
  assert.ok(height > 10000, `expected a long scroll, got ${height}px`);

  // All five kinds are the product's claim about what understanding a book means. If one
  // stops rendering, the thing that makes this not a summary site is quietly gone.
  const text = await page.evaluate(() => document.body.textContent || "");
  for (const kind of ["What it argues", "What you can do", "Where it stops working", "What's disputed", "What people get wrong"]) {
    assert.ok(text.includes(kind), `the scroll is missing "${kind}" cards`);
  }

  // Nothing may demand an account to read.
  assert.ok(!/sign in to continue|create an account to read/i.test(text), "reading is behind a wall");
});

await journey("no card claims a reader wrote what BookSphere wrote", async (page) => {
  await page.goto(`${BASE}/explore`, { waitUntil: "domcontentloaded" });
  await page.waitForSelector("li");
  await settle(page);

  const offenders = await page.evaluate(() =>
    [...document.querySelectorAll("li")]
      .filter((li) => li.innerText.includes("What a reader did") && /BookSphere Team/.test(li.innerText))
      .map((li) => li.innerText.slice(0, 80))
  );
  assert.equal(offenders.length, 0, `house writing presented as a reader's: ${offenders[0] || ""}`);

  // And every editorial card must still say whose words they are.
  const unattributed = await page.evaluate(() =>
    [...document.querySelectorAll("li")]
      .filter((li) => /What it argues|Where it stops working|What's disputed/.test(li.innerText))
      .filter((li) => !li.innerText.includes("BookSphere")).length
  );
  assert.equal(unattributed, 0, "an editorial card is not attributed to BookSphere");
});

await journey("reading an idea leads to a way to answer it", async (page) => {
  await page.goto(`${BASE}/explore`, { waitUntil: "domcontentloaded" });
  await page.waitForSelector("li");
  await settle(page);

  const tried = page.locator('a[href*="create-discussion?idea="]');
  const count = await tried.count();
  assert.ok(count > 10, `expected many ways in, found ${count}`);

  const href = await tried.first().getAttribute("href");
  await page.goto(`${BASE}${href}`, { waitUntil: "domcontentloaded" });
  await settle(page);

  // The composer must show the idea being answered: a blank page is the reason nobody writes.
  const banner = await page.locator(".headline").first().innerText();
  assert.ok(banner.length > 15, "the composer did not show the idea being answered");
  const body = await page.evaluate(() => document.body.textContent || "");
  assert.ok(body.includes("You tried this"), "the composer fell back to a generic prompt");
  assert.equal(await page.locator("select").first().inputValue(), "Real-Life Result", "wrong perspective type preset");
});

await journey("every place a reader can write is reachable from the tab bar", async (page) => {
  await page.goto(`${BASE}/explore`, { waitUntil: "domcontentloaded" });
  // The tab bar is a client component that reads the current path, so it is not there at
  // domcontentloaded. Asserting immediately reported every tab as missing while all four were
  // present - the test racing hydration, not the nav being broken.
  await page.waitForSelector('nav[aria-label="Primary mobile navigation"] a');
  await settle(page);
  const tabs = await page.evaluate(() =>
    [...document.querySelectorAll('nav[aria-label="Primary mobile navigation"] a')].map((a) => a.textContent.trim())
  );
  // The Feed tab was removed on the belief that its writing had been folded into the scroll.
  // It had not: the scroll carries discussion_posts and the Feed carries knowledge_posts, so
  // three people's notes sat on no tab at all and were reachable only by typing the URL.
  for (const tab of ["Home", "Feed", "Books", "You"]) {
    assert.ok(tabs.includes(tab), `the ${tab} tab is missing - its content is unreachable`);
  }

  // And the Feed must actually carry what it claims to.
  await page.goto(`${BASE}/feed`, { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(1500);
  await settle(page);
  const text = await page.evaluate(() => document.body.textContent || "");
  assert.ok(!/could not be loaded|something went wrong/i.test(text), "the feed failed to load");
});

await journey("a book page shows the writing it is stocked on", async (page) => {
  await page.goto(`${BASE}/book/atomic-habits`, { waitUntil: "domcontentloaded" });
  await settle(page);
  const text = await page.evaluate(() => document.body.textContent || "");
  assert.ok(text.includes("Atomic Habits"), "the book page does not name the book");
  assert.ok(!/nothing has been written|no perspectives here yet/i.test(text), "a stocked book still shows an empty state");

  // This assertion exists because the earlier version of it did not. It checked only that an
  // empty-state message was absent, and passed for weeks while the book page rendered none of
  // the editorial the whole catalogue was gated on - a reader tapped a card in the scroll,
  // arrived here, and found nothing they had just been reading.
  for (const kind of ["What it argues", "Where it stops working", "What's disputed", "What people get wrong"]) {
    assert.ok(text.includes(kind), `the book page is missing its "${kind}" writing`);
  }
  const { editorialForBook } = await import("../src/lib/editorial.ts");
  const first = editorialForBook("atomic-habits").cards[0].claim;
  assert.ok(text.includes(first), "the book page does not render its own editorial cards");

  const tried = await page.locator('a[href*="create-discussion?idea="]').count();
  assert.ok(tried > 0, "no way to report trying an idea from the book page");
});

await journey("sign-in offers both routes, once each", async (page) => {
  await page.goto(`${BASE}/login`, { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(2500); // Google's script injects its button
  await settle(page);

  // Two Google buttons stacked here once, because the effect re-ran on every render and
  // renderButton materialises asynchronously. The build was perfectly happy.
  const googleButtons = await page.evaluate(() => {
    const inline = [...document.querySelectorAll("button")].filter((b) => /Continue with Google/i.test(b.textContent || "")).length;
    const frames = document.querySelectorAll('iframe[src*="accounts.google.com"]').length;
    return inline + frames;
  });
  assert.ok(googleButtons <= 1, `the Google button is duplicated: found ${googleButtons}`);

  // Google is only configured where the client id is set, so its absence on a dev machine is
  // correct rather than a failure. What must always hold is that a duplicate never appears
  // and that at least one way to sign in is on the page.
  const body = await page.evaluate(() => document.body.textContent || "");
  assert.ok(/sign-in link|Email address/i.test(body), "the email route is missing");
});

await journey("pages that do not exist say so", async (page) => {
  for (const path of ["/profile/definitely-nobody", "/discussion/00000000-0000-0000-0000-000000000000", "/book/not-a-real-book"]) {
    const response = await page.goto(`${BASE}${path}`, { waitUntil: "domcontentloaded" });
    assert.equal(response.status(), 404, `${path} answered ${response.status()}, which a crawler reads as a real page`);
  }
});

await journey("the landing promises only what the shelf holds", async (page) => {
  await page.goto(`${BASE}/`, { waitUntil: "domcontentloaded" });
  await settle(page);
  // innerText misses the landing hero completely here (3290 characters that do not include
  // it) and reflects CSS text-transform where it does read. textContent is the source of truth.
  const text = await page.evaluate(() => document.body.textContent || "");
  const claimed = Number((text.match(/Early access[^\d]*(\d+)\s+books/i) || [])[1]);
  assert.ok(Number.isFinite(claimed), "the landing no longer states how many books there are");

  const { editorialBookIds } = await import("../src/lib/editorial.ts");
  assert.equal(claimed, editorialBookIds.length, `the landing promises ${claimed} books and the shelf holds ${editorialBookIds.length}`);
});

console.log(`\njourneys: ${passed} passed, ${failures.length} failed  (against ${BASE})`);
if (failures.length) {
  for (const f of failures) console.error(`  - ${f}`);
  process.exit(1);
}
