// A readable slice of a long page: node design/clip.mjs <name> <route> <width> <y> <height>
import { chromium } from "playwright";
const [name, route, w, y, h] = process.argv.slice(2);
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: Number(w), height: 844 } });
await page.goto((process.env.BASE || "http://localhost:3016") + route, { waitUntil: "networkidle" });
await page.waitForTimeout(1500);
await page.screenshot({ path: `design/shots/${name}.png`, fullPage: true, clip: { x: 0, y: Number(y), width: Number(w), height: Number(h) } });
await browser.close();
