import { NextResponse } from "next/server";
import chromium from "@sparticuz/chromium";
import playwright from "playwright-core";
import { addExtra } from "playwright-extra";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const delay = (ms) => new Promise((res) => setTimeout(res, ms));

export const maxDuration = 60;

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const urlsParam = searchParams.get("urls");

  if (!urlsParam) {
    return NextResponse.json({ error: "Missing ?urls=" }, { status: 400 });
  }

  let urls;
  try {
    urls = JSON.parse(urlsParam);
  } catch {
    return NextResponse.json({ error: "Invalid ?urls=" }, { status: 400 });
  }

  const pw = addExtra(playwright.chromium);
  pw.use(StealthPlugin());

  let browser;

  try {
    browser = await pw.launch({
      args: chromium.args,
      executablePath: await chromium.executablePath(),
      headless: chromium.headless,
    });

    const page = await browser.newPage();
    await page.setViewportSize({ width: 1280, height: 900 });

    const results = [];

    for (const url of urls) {
      try {
        await page.goto(url, { waitUntil: "networkidle", timeout: 30_000 });
        await delay(1500);

        const data = await page.evaluate(() => {
          try {
            let json = window?.g_config?.data || window?.pageData;

            if (!json) return { error: "No JSON found" };

            return {
              title: json?.title || json?.item?.title || "Unknown",
              brand:
                json?.brand ||
                json?.item?.brandName ||
                json?.product?.brand ||
                null,
              description:
                json?.desc ||
                json?.item?.description ||
                json?.product?.description ||
                null,
              variations:
                json?.skuInfos ||
                json?.skuBase?.skus ||
                json?.item?.models?.map((m) => ({
                  name: m.name,
                  price: m.price,
                  stock: m.stock,
                })) ||
                [],
            };
          } catch {
            return { error: "JSON parsing failed" };
          }
        });

        results.push({ url, ...data });
      } catch (err) {
        results.push({ url, error: err.message });
      }
    }

    await browser.close();

    return NextResponse.json({ success: true, results });
  } catch (err) {
    if (browser) await browser.close();
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}
