import path from "node:path";
import { pathToFileURL } from "node:url";
import puppeteer from "puppeteer";

const root = path.resolve(import.meta.dirname, "..");
const htmlPath = path.join(root, "docs", "mini-ups-animation-guide.html");
const pdfPath = path.join(root, "docs", "راهنمای-انیمیشن-Mini-UPS.pdf");
const chromePath =
  process.env.CHROME_PATH ||
  "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";

const browser = await puppeteer.launch({
  headless: true,
  executablePath: chromePath,
  args: ["--no-sandbox", "--disable-dev-shm-usage"],
});

try {
  const page = await browser.newPage();
  await page.goto(pathToFileURL(htmlPath).href, {
    waitUntil: "networkidle0",
  });
  await page.evaluateHandle("document.fonts.ready");
  await page.pdf({
    path: pdfPath,
    format: "A4",
    printBackground: true,
    margin: {
      top: "14mm",
      right: "12mm",
      bottom: "14mm",
      left: "12mm",
    },
  });
  console.log("PDF created:", pdfPath);
} finally {
  await browser.close();
}
