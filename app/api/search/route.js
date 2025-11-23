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

  // Store search query
  if (userId) {
    try {
      await db.insert(searchTb).values({ userId, query: keyword });
    } catch {}
  }

  const url = `https://www.lazada.com.ph/catalog/?ajax=true&q=${encodeURIComponent(
    keyword
  )}`;

  try {
    const scraperUrl = `https://api.scraperapi.com?api_key=${API_KEY}&url=${encodeURIComponent(
      url
    )}&country=ph&device=desktop&keep_headers=true`;

    const response = await fetch(scraperUrl);
    const json = await response.json().catch(() => null);

    return NextResponse.json({
      success: true,
      keyword,
      lazada: json || { error: "Lazada search failed" },
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
