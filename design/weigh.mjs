// Page weight: every response the browser actually fetches for a route, summed.
// Usage: node design/weigh.mjs <route> [route...]   (expects a server on BASE)
import { chromium } from "playwright";

const base = process.env.BASE || "http://localhost:3017";
const routes = process.argv.slice(2);
const browser = await chromium.launch();
for (const route of routes) {
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  const tally = { code: 0, image: 0, other: 0 };
  let requests = 0;
  let images = 0;
  page.on("response", async (res) => {
    const url = res.url();
    if (!url.startsWith(base)) return;
    requests += 1;
    try {
      const body = await res.body();
      if (/\.(js|css)(\?|$)/.test(url) || res.request().resourceType() === "document" || url.includes("/_next/static/chunks")) tally.code += body.length;
      else if (res.request().resourceType() === "image" || url.includes("/_next/image")) { tally.image += body.length; images += 1; }
      else tally.other += body.length;
    } catch {}
  });
  await page.goto(base + route, { waitUntil: "networkidle" });
  await page.waitForTimeout(400);
  const total = tally.code + tally.image + tally.other;
  console.log(`${route.padEnd(30)} code ${(tally.code / 1024).toFixed(1)} KB | images ${(tally.image / 1024).toFixed(1)} KB (${images}) | total ${(total / 1024).toFixed(1)} KB | ${requests} req`);
  await page.close();
}
await browser.close();
