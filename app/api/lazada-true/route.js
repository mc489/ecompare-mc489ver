import { NextResponse } from "next/server";
import * as cheerio from "cheerio";

export const maxDuration = 60;
export const dynamic = "force-dynamic";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const urlsParam = searchParams.get("urls");
  const API_KEY = process.env.SCRAPERAPI_KEY;

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
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  urls = urls.map((u) => (u.startsWith("//") ? "https:" + u : u));

  try {
    const scrapePromises = urls.map(async (productUrl) => {
      try {
        console.log(`> Fetching: ${productUrl}`);

        // Use ScraperAPI
        const scraperUrl = `https://api.scraperapi.com?api_key=${API_KEY}&url=${encodeURIComponent(
          productUrl
        )}&country=ph&device=desktop`;

        const res = await fetch(scraperUrl);
        if (!res.ok) throw new Error(`ScraperAPI Error: ${res.status}`);

        const html = await res.text();
        const $ = cheerio.load(html);

        // --------------------------------------------------------------------------------
        // 💰 PRICE FINDER (Nuclear Option)
        // We look in 4 different places to guarantee we find a price > 0.
        // --------------------------------------------------------------------------------
        let foundPrice = 0;

        // 1. Check SEO Meta Tags (Most reliable)
        const metaPrice =
          $('meta[property="product:price:amount"]').attr("content") ||
          $('meta[property="og:price:amount"]').attr("content");
        if (metaPrice) foundPrice = parseFloat(metaPrice);

        // 2. Check JSON-LD (Google Structured Data)
        if (!foundPrice) {
          try {
            const jsonLd = JSON.parse(
              $('script[type="application/ld+json"]').first().html()
            );
            if (jsonLd && jsonLd.offers && jsonLd.offers.price) {
              foundPrice = parseFloat(jsonLd.offers.price);
            }
          } catch (e) {}
        }

        // 3. Check Visual Selectors (Specific Classes)
        if (!foundPrice) {
          const selectors = [
            ".pdp-v2-product-price-content-salePrice-amount", // Desktop
            ".pdp-price", // Legacy
            ".pricemask-detail-text-price", // Flash Sale
            "#module_product_price_1 .price", // Mobile
          ];
          for (const sel of selectors) {
            const text = $(sel).text().trim().replace(/[₱,]/g, "");
            if (text && !isNaN(parseFloat(text))) {
              foundPrice = parseFloat(text);
              break;
            }
          }
        }

        // 4. Regex Scan (Last Resort - Find ANY price pattern in the raw text)
        if (!foundPrice) {
          // Looks for "₱" followed by digits (e.g., "₱3,899.00")
          const priceMatch = html.match(/₱\s?([\d,]+\.?\d*)/);
          if (priceMatch && priceMatch[1]) {
            foundPrice = parseFloat(priceMatch[1].replace(/,/g, ""));
          }
        }

        // Default to 0 if absolutely nothing found
        const mainPrice = foundPrice || 0;

        // --------------------------------------------------------------------------------
        // 🧩 VARIATION PARSING
        // --------------------------------------------------------------------------------
        const variations = [];
        let skuMap = {};

        // Try to parse hidden JSON for variation-specific prices
        const match = html.match(/var __moduleData__\s*=\s*(\{[\s\S]*?\});/);
        if (match && match[1]) {
          try {
            const fullData = JSON.parse(match[1]);
            const data =
              fullData.data?.root?.fields || fullData.data || fullData;

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
                    price:
                      info.price?.salePrice?.value ||
                      parseFloat(
                        info.price?.salePrice?.text?.replace(/[₱,]/g, "") || 0
                      ),
                    stock:
                      info.quantity?.limit?.max ||
                      (info.quantity?.text === "Out of stock" ? 0 : 1),
                  };
                }
              });
            }
          } catch (e) {}
        }

        // Build Variations List
        $(".sku-prop-v2").each((_, prop) => {
          $(prop)
            .find(".sku-variable-name, .sku-variable-name-selected")
            .each((_, opt) => {
              const optionName = $(opt)
                .find(".sku-variable-name-text")
                .text()
                .trim();
              const isDisabled = $(opt).hasClass("sku-variable-name-disabled");

              // Find specific price in map
              // We check if our map keys *contain* this option name (fuzzy match)
              const matchedKey = Object.keys(skuMap).find((k) =>
                k.includes(optionName)
              );
              const skuData = matchedKey ? skuMap[matchedKey] : null;

              // 🚨 CRITICAL FIX: If specific price is 0 or missing, use Main Price
              let finalPrice = skuData?.price || 0;
              if (finalPrice === 0) finalPrice = mainPrice;

              variations.push({
                name: optionName,
                currency: "PHP",
                price: finalPrice,
                priceBeforeDiscount: finalPrice, // Simplified for now
                stock: isDisabled ? 0 : 1,
                sold: null,
              });
            });
        });

        // If no variations found visually, add a default one so the frontend doesn't break
        if (variations.length === 0) {
          variations.push({
            name: "Standard",
            currency: "PHP",
            price: mainPrice,
            priceBeforeDiscount: mainPrice,
            stock: 1,
            sold: null,
          });
        }

        // --------------------------------------------------------------------------------
        // 🏁 RETURN DATA
        // --------------------------------------------------------------------------------
        return {
          url: productUrl,
          title:
            $(".pdp-mod-product-badge-title-v2").text().trim() ||
            "Unknown Product",
          brand:
            $(".pdp-product-brand-v2__brand-link").text().trim() || "Unknown",
          description:
            $(".pdp-product-detail").text().trim().slice(0, 500) ||
            "No description",
          location: "Unknown",
          rating: $(".score-average").first().text().trim() || "0",
          currency: "PHP",
          lowestPrice: mainPrice,
          highestPrice: mainPrice,
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