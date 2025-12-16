import { NextResponse } from "next/server";
import * as cheerio from "cheerio";

// Increase max duration to handle ScraperAPI rendering time (which is slower)
export const maxDuration = 60; 
export const dynamic = "force-dynamic";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const urlsParam = searchParams.get("urls");
  const API_KEY = process.env.SCRAPERAPI_KEY;
async function followRedirect(url) {
  if (url.includes("s.lazada")) {
    try {
      const response = await fetch(url, { redirect: 'follow', method: 'HEAD' });
      return response.url; // Returns the final long URL
    } catch (e) {
      return url;
    }
  }
  return url;
}

// ... inside your GET function, before the loop ...
urls = await Promise.all(urls.map(async (u) => await followRedirect(u)));
  if (!API_KEY)
    return NextResponse.json(
      { error: "SCRAPERAPI_KEY missing" },
      { status: 500 }
    );
  if (!urlsParam)
    return NextResponse.json({ error: "Missing ?urls=" }, { status: 400 });

  let urls;
  try {
    urls = JSON.parse(urlsParam);
  } catch {
    return NextResponse.json({ error: "Invalid JSON in urls param" }, { status: 400 });
  }

  // Sanitize URLs
  urls = urls.map((u) => {
    let cleanUrl = u.trim();
    if (cleanUrl.startsWith("//")) cleanUrl = "https:" + cleanUrl;
    return cleanUrl;
  });

  try {
    const scrapePromises = urls.map(async (productUrl) => {
      try {
        console.log(`> Fetching: ${productUrl}`);

        // --------------------------------------------------------------------------------
        // 🚀 UPGRADE: ScraperAPI Configuration
        // 1. render=true: Forces Lazada to load JS (Critical for prices/stock)
        // 2. device=desktop: Ensures we get the layout matching our selectors
        // 3. premium=true: (Optional) Set to 'true' if you get Captchas often.
        // --------------------------------------------------------------------------------
        const params = new URLSearchParams({
          api_key: API_KEY,
          url: productUrl,
          country: "ph",
          device: "desktop",
          render: "true", // <--- CRITICAL FIX for Lazada
          // premium: "true", // <--- Uncomment if you still get empty results
        });

        const scraperUrl = `https://api.scraperapi.com?${params.toString()}`;

        const res = await fetch(scraperUrl);
        
        // Handle API failures
        if (!res.ok) {
           const errText = await res.text();
           throw new Error(`ScraperAPI Error ${res.status}: ${errText.slice(0, 100)}`);
        }

        const html = await res.text();
        const $ = cheerio.load(html);

        // Debug: Check if we actually hit a product page or a captcha/login page
        const pageTitle = $("title").text();
        if (pageTitle.includes("Security Challenge") || pageTitle.includes("Robot Check")) {
           throw new Error("Lazada blocked the request (Captcha)");
        }

        // --------------------------------------------------------------------------------
        // 💰 PRICE FINDER
        // --------------------------------------------------------------------------------
        let foundPrice = 0;

        // 1. Check SEO Meta Tags
        const metaPrice =
          $('meta[property="product:price:amount"]').attr("content") ||
          $('meta[property="og:price:amount"]').attr("content");
        if (metaPrice) foundPrice = parseFloat(metaPrice);

        // 2. Check JSON-LD
        if (!foundPrice) {
          try {
            const scriptContent = $('script[type="application/ld+json"]').first().html();
            if(scriptContent) {
                const jsonLd = JSON.parse(scriptContent);
                if (jsonLd?.offers?.price) {
                  foundPrice = parseFloat(jsonLd.offers.price);
                }
            }
          } catch (e) {}
        }

        // 3. Regex Scan (Fallback)
        if (!foundPrice) {
          const priceMatch = html.match(/₱\s?([\d,]+\.?\d*)/);
          if (priceMatch && priceMatch[1]) {
            foundPrice = parseFloat(priceMatch[1].replace(/,/g, ""));
          }
        }

        const mainPrice = foundPrice || 0;

        // --------------------------------------------------------------------------------
        // 🧩 VARIATION PARSING
        // --------------------------------------------------------------------------------
        const variations = [];
        let skuMap = {};

        // Try to parse hidden JSON for variations
        // Note: Lazada updates this variable name occasionally. 
        // We look for the large JSON blob usually assigned to window.app or __moduleData__
        const match = html.match(/var __moduleData__\s*=\s*(\{[\s\S]*?\});/) || 
                      html.match(/window\.app\s*=\s*(\{[\s\S]*?\});/);

        if (match && match[1]) {
          try {
            const fullData = JSON.parse(match[1]);
            const data = fullData.data?.root?.fields || fullData.data || fullData;

            if (data?.productOption?.skuBase?.skus) {
              // Build Property Map
              const propMap = {};
              data.productOption.skuBase.properties?.forEach((p) => {
                p.values.forEach((v) => {
                  propMap[`${p.pid}:${v.vid}`] = v.name;
                });
              });

              // Build SKU Map
              data.productOption.skuBase.skus.forEach((sku) => {
                let name = "Default";
                if (sku.propPath) {
                  name = sku.propPath
                    .split(";")
                    .map((pair) => propMap[pair] || pair)
                    .join(", ");
                }
                const info = data.skuInfos[sku.skuId];
                if (info) {
                  skuMap[name] = {
                    price: info.price?.salePrice?.value || parseFloat(info.price?.salePrice?.text?.replace(/[₱,]/g, "") || 0),
                    stock: info.quantity?.limit?.max || (info.quantity?.text === "Out of stock" ? 0 : 1),
                  };
                }
              });
            }
          } catch (e) {
             console.log("Error parsing JSON module data", e.message);
          }
        }

        // Build Variations from Visual DOM (if JSON failed or as fallback)
        $(".sku-prop-v2").each((_, prop) => {
          $(prop)
            .find(".sku-variable-name, .sku-variable-name-selected")
            .each((_, opt) => {
              const optionName = $(opt).find(".sku-variable-name-text").text().trim();
              const isDisabled = $(opt).hasClass("sku-variable-name-disabled");
              
              const matchedKey = Object.keys(skuMap).find((k) => k.includes(optionName));
              const skuData = matchedKey ? skuMap[matchedKey] : null;

              let finalPrice = skuData?.price || 0;
              if (finalPrice === 0) finalPrice = mainPrice;

              variations.push({
                name: optionName,
                currency: "PHP",
                price: finalPrice,
                priceBeforeDiscount: finalPrice,
                stock: isDisabled ? 0 : 1,
              });
            });
        });

        if (variations.length === 0) {
          variations.push({
            name: "Standard",
            currency: "PHP",
            price: mainPrice,
            priceBeforeDiscount: mainPrice,
            stock: 1,
          });
        }

        // --------------------------------------------------------------------------------
        // 🏁 RETURN DATA
        // --------------------------------------------------------------------------------
        const title = $(".pdp-mod-product-badge-title-v2").text().trim() || 
                      $("h1").text().trim() || // Fallback H1
                      "Unknown Product";

        // Check for specific error where scraping succeeded but content is empty
        if(title === "Unknown Product" && mainPrice === 0) {
            console.warn(`Empty data for ${productUrl}. HTML Preview: ${html.slice(0, 200)}`);
        }

        return {
          url: productUrl,
          title: title,
          brand: $(".pdp-product-brand-v2__brand-link").text().trim() || "Unknown",
          description: $(".pdp-product-detail").text().trim().slice(0, 500) || "",
          rating: $(".score-average").first().text().trim() || "0",
          currency: "PHP",
          lowestPrice: mainPrice,
          image: $(".gallery-preview-panel-v2__image").attr("src") || "",
          variations,
        };
      } catch (err) {
        console.error(`Failed to scrape ${productUrl}:`, err.message);
        return { url: productUrl, error: err.message };
      }
    });

    const results = await Promise.all(scrapePromises);
    return NextResponse.json({ results });
  } catch (error) {
    console.error("Route Error:", error);
    return NextResponse.json(
      { error: "Server Error", details: error.message },
      { status: 500 }
    );
  }
}