// app/api/scrape/shopee/route.js
import { NextResponse } from "next/server";
import puppeteerCore from "puppeteer-core";
import chromium from "@sparticuz/chromium";

const delay = (ms) => new Promise((res) => setTimeout(res, ms));

/**
 * Extract Shopee JSON from multiple possible sources
 */
function extractShopeeData() {
  try {
    // Try __PRELOADED_STATE__ first (mobile)
    if (window.__PRELOADED_STATE__) {
      const s = window.__PRELOADED_STATE__;
      if (s.product?.item) return s.product.item;
      if (s.item?.item) return s.item.item;
      if (s.item) return s.item;
    }

    // Try __INITIAL_STATE__ (alternative)
    if (window.__INITIAL_STATE__) {
      const s = window.__INITIAL_STATE__;
      if (s.product?.item) return s.product.item;
      if (s.item?.item) return s.item.item;
      if (s.item) return s.item;
    }

    // Try __NEXT_DATA__ (desktop)
    const nd = document.querySelector("#__NEXT_DATA__");
    if (nd) {
      const json = JSON.parse(nd.textContent);
      const item =
        json?.props?.pageProps?.item ||
        json?.props?.pageProps?.data?.item ||
        json?.props?.pageProps?.initialReduxState?.item?.item;
      if (item) return item;
    }

    // Last resort: try window.App or other globals
    if (window.App?.context?.item) return window.App.context.item;

    return null;
  } catch (err) {
    return null;
  }
}

/**
 * Normalize Shopee price (they use 100000 or 100 multipliers)
 */
function normalizePrice(raw) {
  if (!raw) return null;
  const n = Number(raw);
  if (isNaN(n)) return null;

  // Shopee multiplies by 100000
  if (n > 100000000) return n / 100000;
  if (n > 1000000) return n / 100;

  return n;
}

/**
 * Apply stealth settings to avoid detection
 */
async function applyStealthSettings(page) {
  // Override navigator properties
  await page.evaluateOnNewDocument(() => {
    // Hide webdriver
    Object.defineProperty(navigator, 'webdriver', {
      get: () => undefined,
    });

    // Mock plugins
    Object.defineProperty(navigator, 'plugins', {
      get: () => [1, 2, 3, 4, 5],
    });

    // Mock languages
    Object.defineProperty(navigator, 'languages', {
      get: () => ['en-US', 'en', 'fil'],
    });

    // Mock chrome
    window.chrome = {
      runtime: {},
    };

    // Mock permissions
    const originalQuery = window.navigator.permissions.query;
    window.navigator.permissions.query = (parameters) =>
      parameters.name === 'notifications'
        ? Promise.resolve({ state: Notification.permission })
        : originalQuery(parameters);
  });
}

/**
 * Main scraper with enhanced reliability
 */
async function scrapeShopeeProduct(page, url) {
  try {
    // Apply stealth first
    await applyStealthSettings(page);

    // Block only heavy resources, NOT scripts
    await page.setRequestInterception(true);
    page.on("request", (req) => {
      const type = req.resourceType();
      if (["image", "media", "font", "stylesheet"].includes(type)) {
        req.abort();
      } else {
        req.continue();
      }
    });

    // Navigate with longer timeout
    await page.goto(url, {
      waitUntil: "networkidle0",
      timeout: 60000,
    });

    // Wait for initial load
    await delay(2000);

    // Scroll to trigger hydration and API calls
    for (let i = 0; i < 5; i++) {
      await page.evaluate(() => window.scrollBy(0, 500));
      await delay(500);
    }

    // Try to capture API response
    let productData = null;
    const apiPatterns = [
      "/api/v4/item/get",
      "/api/v4/pages/item",
      "/api/v2/item/get",
      "/item/get?",
      "/pdp/api",
    ];

    try {
      const response = await page.waitForResponse(
        (res) => apiPatterns.some((p) => res.url().includes(p)),
        { timeout: 8000 }
      );

      const json = await response.json().catch(() => null);
      if (json?.data?.item) productData = json.data.item;
      else if (json?.data) productData = json.data;
      else if (json?.item) productData = json.item;
    } catch (e) {
      console.log("API interception timeout, trying page extraction...");
    }

    // Fallback 1: Extract from page hydration
    if (!productData) {
      productData = await page.evaluate(extractShopeeData);
    }

    // Fallback 2: Try direct API call from page context
    if (!productData) {
      const urlParts = url.match(/\/([^\/]+)-i\.(\d+)\.(\d+)/);
      if (urlParts && urlParts[2] && urlParts[3]) {
        const shopId = urlParts[2];
        const itemId = urlParts[3];
        
        productData = await page.evaluate(async (sid, iid) => {
          try {
            const apiUrl = `https://shopee.ph/api/v4/item/get?shopid=${sid}&itemid=${iid}`;
            const resp = await fetch(apiUrl, {
              credentials: "same-origin",
              headers: { "Accept": "application/json" },
            });
            const json = await resp.json();
            return json?.data?.item || json?.item || json?.data || null;
          } catch (e) {
            return null;
          }
        }, shopId, itemId);
      }
    }

    if (!productData) {
      return {
        url,
        error: "Failed to extract product data from Shopee",
        suggestion: "The URL might be invalid or Shopee blocked the request",
      };
    }

    // Parse variations
    const variations =
      productData.models?.map((m) => ({
        name: m.name || null,
        stock: m.stock || null,
        sold: m.sold || m.sold_count || null,
        price: normalizePrice(m.price),
        priceBeforeDiscount: normalizePrice(m.price_before_discount),
        currency: productData.currency || "PHP",
      })) || [];

    const prices = variations
      .map((v) => v.price)
      .filter((x) => typeof x === "number" && !isNaN(x));

    // If no variations, use main price
    if (prices.length === 0 && productData.price) {
      const mainPrice = normalizePrice(productData.price);
      if (mainPrice) prices.push(mainPrice);
    }

    return {
      url,
      title: productData.name || productData.title || null,
      brand: productData.brand || "Unknown",
      description: productData.description || null,
      rating: productData.item_rating?.rating_star || productData.rating || null,
      currency: productData.currency || "PHP",
      location: productData.shop_location || "Unknown",
      lowestPrice: prices.length ? Math.min(...prices) : null,
      highestPrice: prices.length ? Math.max(...prices) : null,
      variations,
      sold: productData.sold || productData.historical_sold || null,
      stock: productData.stock || null,
    };
  } catch (err) {
    return { url, error: err.message };
  }
}

export async function POST(req) {
  let browser;
  try {
    const { urls } = await req.json();
    if (!urls || !Array.isArray(urls)) {
      return NextResponse.json({ error: "urls must be array" }, { status: 400 });
    }

    // Configure for Vercel serverless environment
    const isProduction = process.env.NODE_ENV === "production";
    
    browser = await puppeteerCore.launch({
      args: isProduction ? [
        ...chromium.args,
        '--disable-gpu',
        '--disable-dev-shm-usage',
        '--disable-setuid-sandbox',
        '--no-first-run',
        '--no-sandbox',
        '--no-zygote',
        '--single-process',
        '--window-size=390,844',
      ] : [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-web-security",
        "--disable-blink-features=AutomationControlled",
        "--disable-dev-shm-usage",
        "--disable-features=IsolateOrigins,site-per-process",
        "--window-size=390,844",
      ],
      defaultViewport: chromium.defaultViewport,
      executablePath: isProduction 
        ? await chromium.executablePath("/tmp") 
        : process.env.PUPPETEER_EXECUTABLE_PATH || 
          "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
      headless: chromium.headless,
      ignoreHTTPSErrors: true,
    });

    const results = [];

    for (const url of urls) {
      const page = await browser.newPage();
      
      // Mobile user agent
      await page.setUserAgent(
        "Mozilla/5.0 (Linux; Android 13; SM-S908B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.6099.144 Mobile Safari/537.36"
      );

      await page.setViewport({ width: 390, height: 844 });

      // Add headers
      await page.setExtraHTTPHeaders({
        "accept-language": "en-US,en;q=0.9",
        "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
        "referer": "https://shopee.ph/",
      });

      const res = await scrapeShopeeProduct(page, url);
      results.push(res);

      await page.close();
      await delay(1000); // Rate limiting between requests
    }

    await browser.close();
    return NextResponse.json({ results });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  } finally {
    if (browser) {
      try {
        await browser.close();
      } catch {}
    }
  }
}

// Increase timeout for Vercel
export const maxDuration = 60;