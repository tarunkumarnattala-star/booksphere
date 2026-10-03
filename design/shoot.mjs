// Screenshot helper for the design loop. Usage:
//   node design/shoot.mjs <name> <route> [widths]
// Widths default to 390,1024,1440. A width of 640 is the 200%-zoom stand-in.
import { chromium } from "playwright";

const [name, route, widthArg] = process.argv.slice(2);
if (!name || !route) {
  console.error("usage: node design/shoot.mjs <name> <route> [w,w,w]");
  process.exit(1);
}
const widths = (widthArg || "390,1024,1440").split(",").map(Number);
const base = process.env.BASE || "http://localhost:3016";

const browser = await chromium.launch();
for (const width of widths) {
  const page = await browser.newPage({ viewport: { width, height: width < 500 ? 844 : 900 } });
  const errors = [];
  page.on("pageerror", (e) => errors.push(String(e)));
  await page.goto(base + route, { waitUntil: "networkidle" });
  await page.waitForTimeout(600);
  const height = await page.evaluate(() => document.documentElement.scrollHeight);
  await page.screenshot({ path: `design/shots/${name}-${width}.png`, fullPage: true });
  console.log(`${name}-${width}: ${height}px tall${errors.length ? ` ERRORS: ${errors.join(" | ")}` : ""}`);
  await page.close();
}
await browser.close();
