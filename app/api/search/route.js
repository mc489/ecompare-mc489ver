import { NextResponse } from "next/server";
import { db } from "@/database/drizzle";
import { searchTb } from "@/database/schema";
import { getAuth } from "@clerk/nextjs/server";

export async function GET(req) {
  const { userId } = getAuth(req);
  const { searchParams } = new URL(req.url);
  const keyword = searchParams.get("keyword") || "powerbank";
  const API_KEY = process.env.SCRAPERAPI_KEY;

  if (!API_KEY) {
    return NextResponse.json({
      success: false,
      error: "SCRAPERAPI_KEY missing",
    });
  }

  // 1. Detect device
  const userAgent = req.headers.get("user-agent") || "";
  const isMobile = /mobile/i.test(userAgent);
  const deviceType = isMobile ? "mobile" : "desktop";

  // 2. Build the correct target URL based on device
  // Desktop uses /catalog/ while Mobile often uses /search/ or different query params
  const targetUrl = isMobile 
    ? `https://www.lazada.com.ph/search/?ajax=true&q=${encodeURIComponent(keyword)}`
    : `https://www.lazada.com.ph/catalog/?ajax=true&q=${encodeURIComponent(keyword)}`;

  // Store search query
  if (userId) {
    try {
      await db.insert(searchTb).values({ userId, query: keyword });
    } catch {}
  }

  try {
    // 3. Request via ScraperAPI with matching device profiles
    const scraperUrl = `https://api.scraperapi.com?api_key=${API_KEY}&url=${encodeURIComponent(
      targetUrl
    )}&country=ph&device=${deviceType}&keep_headers=true`;

    const response = await fetch(scraperUrl);
    
    // Some mobile responses come back with different content-types
    const text = await response.text();
    let json = null;
    try {
      json = JSON.parse(text);
    } catch (e) {
      json = null;
    }

    return NextResponse.json({
      success: true,
      keyword,
      deviceUsed: deviceType, // Diagnostic to see what was detected
      lazada: json || { error: "Lazada search failed", raw: text.substring(0, 200) },
      shopee: {
        available: false,
        message: "Your Shopee scraper is separate via puppeteer.",
      },
    });
  } catch (err) {
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}

export const maxDuration = 60;