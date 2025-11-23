import next from "next";
import http from "http";
import axios from "axios";
import puppeteerCore from "puppeteer-core"; // Changed from puppeteer

const dev = process.env.NODE_ENV !== "production";
const app = next({ dev });
const handle = app.getRequestHandler();

const KAMELEO_URL = "http://localhost:5050";
const PROFILE_ID = process.env.NEXT_PUBLIC_KAMELEO;

async function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function startKameleoProfile(retries = 5) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      console.log(`> Fetching profile info (attempt ${attempt})...`);
      const res = await axios.get(`${KAMELEO_URL}/profiles/${PROFILE_ID}`);
      const status = res.data.status?.lifetimeState || res.data.state;

      console.log(`> Current profile state: ${status}`);

      if (status === "running") {
        console.log("> Stopping running profile...");
        await axios.post(`${KAMELEO_URL}/profiles/${PROFILE_ID}/stop`);
        await delay(3000);
      }

      console.log("> Starting profile fresh...");
      await axios.post(`${KAMELEO_URL}/profiles/${PROFILE_ID}/start`, {
        headers: { "Content-Type": "application/json" },
      });
      console.log("> Profile started successfully!");

      const browserWSEndpoint = `ws://localhost:5050/puppeteer/${PROFILE_ID}`;
      console.log("> Connecting Puppeteer...");
      const browser = await puppeteerCore.connect({ // Changed to puppeteerCore
        browserWSEndpoint,
        defaultViewport: null,
      });

      const page = await browser.newPage();
      console.log("> Opening Shopee...");
      await page.goto("https://shopee.ph", { waitUntil: "networkidle2" });

      console.log("> Waiting 5s for manual login...");
      await delay(5000);

      console.log("> ✅ Kameleo profile ready to use!");
      await browser.disconnect();
      return;
    } catch (err) {
      if (attempt < retries) {
        console.warn(`> Kameleo not ready yet, retrying in 3s...`);
        await delay(3000);
      } else {
        console.error("> ❌ Failed to start Kameleo after several attempts:");
        if (err.response) {
          console.error("Status:", err.response.status);
          console.error("Data:", err.response.data);
        } else if (err.request) {
          console.error("No response received:", err.request);
        } else {
          console.error("Message:", err.message);
        }
      }
    }
  }
}

app.prepare().then(() => {
  startKameleoProfile();

  http
    .createServer((req, res) => handle(req, res))
    .listen(3000, (err) => {
      if (err) throw err;
      console.log("> Next.js ready on http://localhost:3000");
    });
});