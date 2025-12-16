import { NextResponse } from "next/server";
import * as cheerio from "cheerio";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

/* ----------------------------------------------------
   Helpers
---------------------------------------------------- */

async function fetchWithTimeout(url, timeout = 15000) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);

  try {
    const res = await fetch(url, { signal: controller.signal });
    return res;
  } finally {
    clearTimeout(id);
  }
}

function buildScraperUrl({ apiKey, url, render }) {
  const params = new URLSearchParams({
    api_key: apiKey,
    url,
    country: "ph",
    device: "desktop", // always scrape desktop
    render: render ? "true" : "false",
  });

  return `https://api.scraperapi.com?${params.toString()}`;
}

/* ----------------------------------------------------
   Main Route
---------------------------------------------------- */

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const urlsParam = searchParams.get("urls");
  const API_KEY = process.env.SCRAPERAPI_KEY;

  if (!API_KEY) {
    return NextResponse.json(
      { error: "SCRAPERAPI_KEY missing" },
      { status: 500 }
    );
  }

  if (!urlsParam) {
    return NextResponse.json(
      { error: "Missing ?urls=" },
      { status: 400 }
    );
  }

  let urls;
  try {
    urls = JSON.parse(urlsParam);
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON in urls param" },
      { status: 400 }
    );
  }

  urls = urls.map((u) => {
    let clean = u.trim();
    if (clean.startsWith("//")) clean = "https:" + clean;
    return clean;
  });

  const results = await Promise.all(
    urls.map(async (productUrl) => {
      try {
        /* ----------------------------------------------------
           STEP 1: FAST FETCH (NO RENDER)
        ---------------------------------------------------- */
        let html = "";
        let usedRender = false;

        const fastUrl = buildScraperUrl({
          apiKey: API_KEY,
          url: productUrl,
          render: false,
        });

        let res = await fetchWithTimeout(fastUrl, 12000);

        if (res.ok) {
          html = await res.text();
        }

        /* ----------------------------------------------------
           STEP 2: FALLBACK (RENDER = TRUE)
        ---------------------------------------------------- */
        if (!html || !html.includes("pdp")) {
          const renderUrl = buildScraperUrl({
            apiKey: API_KEY,
            url: productUrl,
            render: true,
          });

          res = await fetchWithTimeout(renderUrl, 20000);
          if (!res.ok) throw new Error("ScraperAPI render failed");

          html = await res.text();
          usedRender = true;
        }

        const $ = cheerio.load(html);

        /* ----------------------------------------------------
           BLOCK CHECK
        ---------------------------------------------------- */
        const titleTag = $("title").text();
        if (
          titleTag.includes("Security") ||
          titleTag.includes("Robot")
        ) {
          throw new Error("Blocked by Lazada");
        }

        /* ----------------------------------------------------
           PRICE EXTRACTION
        ---------------------------------------------------- */
        let price = 0;

        const metaPrice =
          $('meta[property="product:price:amount"]').attr("content") ||
          $('meta[property="og:price:amount"]').attr("content");

        if (metaPrice) price = parseFloat(metaPrice);

        if (!price) {
          const match = html.match(/₱\s?([\d,]+\.?\d*)/);
          if (match) price = parseFloat(match[1].replace(/,/g, ""));
        }

        /* ----------------------------------------------------
           TITLE
        ---------------------------------------------------- */
        const title =
          $(".pdp-mod-product-badge-title-v2").text().trim() ||
          $("h1").text().trim() ||
          "Unknown Product";

        return {
          url: productUrl,
          title,
          currency: "PHP",
          lowestPrice: price || 0,
          usedRender,
        };
      } catch (err) {
        return {
          url: productUrl,
          error: err.message,
        };
      }
    })
  );

  return NextResponse.json({
    success: true,
    results,
  });
}
