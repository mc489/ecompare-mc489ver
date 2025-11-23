// app/api/search/route.js
import { NextResponse } from "next/server";
import puppeteerCore from "puppeteer-core";
import chromium from "@sparticuz/chromium";
import { db } from "@/database/drizzle";
import { searchTb } from "@/database/schema";
import { getAuth } from "@clerk/nextjs/server";

const delay = (ms) => new Promise((res) => setTimeout(res, ms));

export async function GET(req) {
  const { userId } = getAuth(req);
  const { searchParams } = new URL(req.url);
  const keyword = searchParams.get("keyword") || "powerbank";

  // Log search history
  if (userId) {
    try {
      await db.insert(searchTb).values({ userId, query: keyword });
    } catch (err) {
      console.error("DB insert error:", err.message);
    }
  }

  const lazadaUrl = `https://www.lazada.com.ph/tag/${encodeURIComponent(
    keyword.replace(/\s+/g, "-")
  )}?q=${encodeURIComponent(keyword)}`;

  let browser;
  try {
    // Configure for Vercel serverless environment
    const isProduction = process.env.NODE_ENV === "production";
    
    browser = await puppeteerCore.launch({
      args: isProduction ? chromium.args : [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
      ],
      defaultViewport: chromium.defaultViewport,
      executablePath: isProduction 
        ? await chromium.executablePath() 
        : process.env.PUPPETEER_EXECUTABLE_PATH || 
          "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe", // Windows Chrome path
      headless: chromium.headless,
      ignoreHTTPSErrors: true,
    });

    const lazadaPage = await browser.newPage();
    
    await lazadaPage.setUserAgent(
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    );
    await lazadaPage.setViewport({ width: 1366, height: 900 });

    let lazadaData = null;

    lazadaPage.on("response", async (res) => {
      try {
        const url = res.url();
        if (url.includes("/search") || url.includes("catalog") || url.includes("tag")) {
          try {
            const json = await res.json();
            if (json && (json.mods || json.listItems)) {
              lazadaData = json;
            }
          } catch (e) {
            // Ignore JSON parse errors
          }
        }
      } catch (e) {
        // Ignore response errors
      }
    });

    await lazadaPage.goto(lazadaUrl, { 
      waitUntil: "networkidle2", 
      timeout: 25000 // Reduced timeout for Vercel
    });

    await delay(2000);

    if (!lazadaData) {
      lazadaData = { 
        error: true,
        message: "Could not retrieve Lazada products"
      };
    }

    await lazadaPage.close();
    await browser.close();

    return NextResponse.json({
      keyword,
      success: true,
      lazada: lazadaData,
      shopee: {
        available: false,
        message: "Shopee data is currently unavailable due to their anti-scraping protection.",
        note: "Shopee requires paid scraping services (ScraperAPI, Bright Data, etc.) which cost $50-100/month."
      },
    });
  } catch (err) {
    console.error("Search error:", err.message);
    if (browser) {
      try {
        await browser.close();
      } catch (closeErr) {
        console.error("Browser close error:", closeErr.message);
      }
    }
    return NextResponse.json({ 
      error: err.message,
      success: false 
    }, { status: 500 });
  }
}

// Increase timeout for Vercel (max 60s on Pro, 10s on Hobby)
