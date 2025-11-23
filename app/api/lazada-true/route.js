import { NextResponse } from "next/server";
import puppeteerCore from "puppeteer-core";
import chromium from "@sparticuz/chromium";

// delay helper
async function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

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
    return NextResponse.json(
      { error: "Invalid ?urls=, must be JSON array" },
      { status: 400 }
    );
  }

  if (!Array.isArray(urls) || urls.length === 0) {
    return NextResponse.json(
      { error: "?urls= must be a non-empty array" },
      { status: 400 }
    );
  }

  urls = urls.map((u) => (u.startsWith("//") ? "https:" + u : u));

  let browser;

  try {
    // Configure for Vercel serverless environment
    const isProduction = process.env.NODE_ENV === "production";
    
    browser = await puppeteerCore.launch({
      args: isProduction ? chromium.args : [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
        "--disable-accelerated-2d-canvas",
        "--disable-gpu",
        "--disable-web-security",
        "--disable-features=IsolateOrigins,site-per-process",
      ],
      defaultViewport: chromium.defaultViewport,
      executablePath: isProduction 
        ? await chromium.executablePath() 
        : process.env.PUPPETEER_EXECUTABLE_PATH || 
          "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
      headless: chromium.headless,
      ignoreHTTPSErrors: true,
    });

    // Scrape function (uses its own tab per URL)
    const scrapeOne = async (productUrl) => {
      const page = await browser.newPage();
      
      // Set viewport and user agent for better compatibility
      await page.setViewport({ width: 1920, height: 1080 });
      await page.setUserAgent(
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
      );

      let apiResponse = null;

      const waitForApi = new Promise((resolve) => {
        const timeout = setTimeout(() => resolve(), 15000); // Reduced timeout

        page.on("response", async (res) => {
          try {
            const req = res.request();
            if (
              req.resourceType() === "fetch" ||
              req.resourceType() === "xhr"
            ) {
              if (res.url().includes("mtop.global.detail.web.getdetailinfo")) {
                try {
                  const json = await res.json();
                  let moduleData = null;

                  if (json?.data?.module) {
                    moduleData =
                      typeof json.data.module === "string"
                        ? JSON.parse(json.data.module)
                        : json.data.module;
                  } else if (Array.isArray(json?.data?.modules)) {
                    moduleData =
                      typeof json.data.modules[0].module === "string"
                        ? JSON.parse(json.data.modules[0].module)
                        : json.data.modules[0].module;
                  }

                  if (moduleData) {
                    apiResponse = moduleData;
                    clearTimeout(timeout);
                    resolve();
                  }
                } catch {}
              }
            }
          } catch {}
        });
      });

      try {
        await page.goto(productUrl, {
          waitUntil: "networkidle0",
          timeout: 20000,
        });
        await waitForApi;
      } catch (err) {
        console.error(`Error loading ${productUrl}:`, err.message);
      } finally {
        await page.close();
      }

      if (!apiResponse?.productOption?.skuBase) {
        return {
          url: productUrl,
          error: "Unexpected Lazada response shape",
          raw: apiResponse,
        };
      }

      const variationValues =
        apiResponse.productOption.skuBase.properties.flatMap((p) => p.values);
      const vidToName = {};
      variationValues.forEach((v) => {
        vidToName[v.vid] = v.name;
      });

      const productName = apiResponse.tracking?.pdt_name || "Unknown product";
      const rawDescription =
        apiResponse.product?.desc || "No description found";
      const description = rawDescription
        .replace(/<[^>]+>/g, " ")
        .replace(/\s+/g, " ")
        .trim();

      const currency = apiResponse.tracking?.core?.currencyCode || "PHP";
      const variations = apiResponse.productOption.skuBase.skus.map((sku) => {
        const skuInfo = apiResponse.skuInfos?.[sku.skuId];
        let salePrice, originalPrice;

        if (skuInfo?.price) {
          if (skuInfo.price.salePrice?.text) {
            salePrice = skuInfo.price.salePrice.text;
          } else if (skuInfo.price.multiPrices?.length > 0) {
            salePrice = skuInfo.price.multiPrices[0].text;
          }
          if (skuInfo.price.originalPrice?.text) {
            originalPrice = skuInfo.price.originalPrice.text;
          }
        }

        let decodedProps = "Default";
        if (sku.propPath) {
          decodedProps = sku.propPath
            .split(";")
            .map((pair) => {
              const [pid, vid] = pair.split(":");
              return vidToName[vid] || vid;
            })
            .join(", ");
        }

        return {
          name: decodedProps,
          currency: currency,
          price: (salePrice || "0").replace(/[₱,]/g, ""),
          priceBeforeDiscount: (originalPrice || "0").replace(/[₱,]/g, ""),
          stock: skuInfo?.quantity?.limit?.max || null,
          sold: null,
        };
      });

      const numericPrices = variations
        .map((v) =>
          parseFloat(
            (v.price || v.priceBeforeDiscount || "").replace(/[₱,]/g, "")
          )
        )
        .filter((v) => !isNaN(v));

      const lowestPrice =
        numericPrices.length > 0 ? Math.min(...numericPrices) : null;
      const highestPrice =
        numericPrices.length > 0 ? Math.max(...numericPrices) : null;

      return {
        url: productUrl,
        title: productName,
        brand: apiResponse.product?.brand?.name || "Unknown",
        description: description,
        location: "Unknown",
        rating: apiResponse.review?.averageRating || null,
        currency: currency,
        lowestPrice,
        highestPrice,
        variations,
      };
    };

    // Run all scrapes in parallel (with concurrency limit for better performance)
    const concurrency = 5; // Process 5 URLs at a time
    const results = [];

    for (let i = 0; i < urls.length; i += concurrency) {
      const batch = urls.slice(i, i + concurrency);
      const batchResults = await Promise.all(
        batch.map((u) => scrapeOne(u))
      );
      results.push(...batchResults);
    }

    await browser.close();
    return NextResponse.json({ results });
  } catch (err) {
    console.error("ERROR:", err.message || err);
    return NextResponse.json(
      { error: err.message || "Unexpected error" },
      { status: 500 }
    );
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