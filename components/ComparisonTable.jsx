import React from "react";
import Dropdown from "react-dropdown";
import "react-dropdown/style.css";

export default function ComparisonTable(
  {
  snapshot, // Array of comparison results
  selectedProducts = [], // Optional: for showing product images
  selectedVariations = {},
  onVariationChange,
  showActions = true,
  
}

) {
    const isDesktopOrLaptop = useMediaQuery({ query: '(min-width: 700px)' });
    
      const isTabletOrMobile = useMediaQuery({ query: '(max-width: 699px)' });
  return (
    <>
    {isDesktopOrLaptop &&
    <>
    <div className="w-full mx-auto flex gap-4 overflow-x-auto text-white">
{snapshot.map((result, index) => {
 const invalid = (val) =>
  val === null ||
  val === undefined ||
  val === "" ||
  val === "null" ||
  val === "undefined" ||
  Number.isNaN(val);

const safeLow = invalid(result.lowestPrice) ? "-" : result.lowestPrice;
const safeHigh = invalid(result.highestPrice) ? "-" : result.highestPrice;

const displayPrice = selectedVar?.price
  ? (invalid(selectedVar.price) ? "-" : selectedVar.price)
  : `${safeLow} - ${safeHigh}`;

    const isDesktopOrLaptop = useMediaQuery({ query: '(min-width: 1000px)' });
const Bigtablet = useMediaQuery({ minWidth: 700, maxWidth: 1000 });
    const isTabletOrMobile = useMediaQuery({ query: '(max-width: 699px)' });
        return (
          <div key={index} className="flex flex-col flex-1 min-w-[220px]">
            <div className="glass-button1 rounded-t-[23px]">
              <div className="flex justify-center items-center flex-col p-4">
                {product?.image && (
                  <img
                    crossOrigin="anonymous"
                    src={product.image}
                    alt={result.title}
                    className="w-32 h-32 object-contain rounded-lg mb-3"
                  />
                )}
                <p className="font-semibold text-center mt-3">{result.title}</p>
                {result.brand && (
                  <p className="text-xs text-white/60 mt-1">{result.brand}</p>
                )}
              </div>
            </div>

            <div className="glass-button1 h-16 rounded-0 flex items-center justify-center text-center">
              <div className="flex flex-col">
                <span className="font-semibold text-xs opacity-60">Price</span>
                <span>
                  {result.currency} {displayPrice}
                </span>
              </div>
            </div>

            <div className="glass-button1 h-16 rounded-0 flex items-center justify-center text-center">
              <div className="flex flex-col">
                <span className="font-semibold text-xs opacity-60">Rating</span>
                <span>{result.rating || "-"} ⭐</span>
              </div>
            </div>

            <div className="glass-button1 h-16 rounded-0 flex items-center justify-center text-center">
              <div className="flex flex-col">
                <span className="font-semibold text-xs opacity-60">Store</span>
                <span>
                  {result.url.includes("lazada")
                    ? "Lazada"
                    : result.url.includes("shopee")
                    ? "Shopee"
                    : "Unknown"}
                </span>
              </div>
            </div>

            <div className="glass-button1 min-h-24 rounded-0 flex items-center justify-center text-center p-3">
              <div className="flex flex-col">
                <span className="font-semibold text-xs opacity-60">
                  Description
                </span>
                <span className="text-xs mt-1 line-clamp-3">
                  {result.description || "-"}
                </span>
              </div>
            </div>

            <div className="glass-button1 py-3 min-h-16 h-auto rounded-0 flex flex-col items-center justify-center text-center relative">
              <span className="font-semibold text-xs opacity-60 mb-2">
                Variations
              </span>
              {result.variations && result.variations.length > 0 ? (
                <Dropdown
                  options={result.variations.map(
                    (variation) =>
                      `${variation.name ?? "Unknown"} — ${result.currency}${variation.price ?? "-"}`

                  )}
                  onChange={(option) => {
                    if (onVariationChange && product) {
                      const [name] = option.value.split(" — ");
                      const selected = result.variations.find(
                        (v) => v.name === name
                      );
                      onVariationChange(product.id, selected);
                    }
                  }}
                  value={
                    selectedVar
                      ? `${selectedVar.name} — ${result.currency}${selectedVar.price}`
                      : "Select variation"
                  }
                  placeholder="Select a variation"
                  className="w-full text-sm font-vagRounded"
               
                  disabled={!showActions || !onVariationChange}
                />
              ) : (
                <span className="text-xs text-white/40">No variations</span>
              )}
            </div>

            {showActions && (
              <div className="text-center pt-6">
                <button
                  onClick={() => window.open(result.url, "_blank")}
                  className={`${
                    result.url.includes("lazada")
                      ? "bg-pink-700/20 hover:bg-pink-800/20"
                      : "bg-orange-700/20 hover:bg-orange-800/20"
                  } text-white text-sm px-5 py-2 rounded-full shadow-md compare-button1`}
                >
                  Buy Now
                </button>
              </div>
            )}
          </div>
        );
      })}
    </div> 
</>}

  {isTabletOrMobile &&
    <>
    <div className="w-full mx-auto flex gap-4 overflow-x-auto text-white">
{snapshot.map((result, index) => {
 const invalid = (val) =>
  val === null ||
  val === undefined ||
  val === "" ||
  val === "null" ||
  val === "undefined" ||
  Number.isNaN(val);

const safeLow = invalid(result.lowestPrice) ? "-" : result.lowestPrice;
const safeHigh = invalid(result.highestPrice) ? "-" : result.highestPrice;

const displayPrice = selectedVar?.price
  ? (invalid(selectedVar.price) ? "-" : selectedVar.price)
  : `${safeLow} - ${safeHigh}`;

    const isDesktopOrLaptop = useMediaQuery({ query: '(min-width: 1000px)' });
const Bigtablet = useMediaQuery({ minWidth: 700, maxWidth: 1000 });
    const isTabletOrMobile = useMediaQuery({ query: '(max-width: 699px)' });
        return (
          <div key={index} className="flex flex-col flex-1 min-w-[220px]">
            <div className="glass-button1 rounded-t-[23px]">
              <div className="flex justify-center items-center flex-col p-4">
                {product?.image && (
                  <img
                    crossOrigin="anonymous"
                    src={product.image}
                    alt={result.title}
                    className="w-32 h-32 object-contain rounded-lg mb-3"
                  />
                )}
                <p className="font-semibold text-center mt-3">{result.title}</p>
                {result.brand && (
                  <p className="text-xs text-white/60 mt-1">{result.brand}</p>
                )}
              </div>
            </div>

            <div className="glass-button1 h-16 rounded-0 flex items-center justify-center text-center">
              <div className="flex flex-col">
                <span className="font-semibold text-xs opacity-60">Price</span>
                <span>
                  {result.currency} {displayPrice}
                </span>
              </div>
            </div>

            <div className="glass-button1 h-16 rounded-0 flex items-center justify-center text-center">
              <div className="flex flex-col">
                <span className="font-semibold text-xs opacity-60">Rating</span>
                <span>{result.rating || "-"} ⭐</span>
              </div>
            </div>

            <div className="glass-button1 h-16 rounded-0 flex items-center justify-center text-center">
              <div className="flex flex-col">
                <span className="font-semibold text-[12px] opacity-60">Store</span>
                <span>
                  {result.url.includes("lazada")
                    ? "Lazada"
                    : result.url.includes("shopee")
                    ? "Shopee"
                    : "Unknown"}
                </span>
              </div>
            </div>

            <div className="glass-button1 min-h-24 rounded-0 flex items-center justify-center text-center p-3">
              <div className="flex flex-col">
                <span className="font-semibold text-xs opacity-60">
                  Description
                </span>
                <span className="text-xs mt-1 line-clamp-3">
                  {result.description || "-"}
                </span>
              </div>
            </div>

            <div className="glass-button1 py-3 min-h-16 h-auto rounded-0 flex flex-col items-center justify-center text-center relative">
              <span className="font-semibold text-xs opacity-60 mb-2">
                Variations
              </span>
              {result.variations && result.variations.length > 0 ? (
                <Dropdown
                  options={result.variations.map(
                    (variation) =>
                      `${variation.name ?? "Unknown"} — ${result.currency}${variation.price ?? "-"}`

                  )}
                  onChange={(option) => {
                    if (onVariationChange && product) {
                      const [name] = option.value.split(" — ");
                      const selected = result.variations.find(
                        (v) => v.name === name
                      );
                      onVariationChange(product.id, selected);
                    }
                  }}
                  value={
                    selectedVar
                      ? `${selectedVar.name} — ${result.currency}${selectedVar.price}`
                      : "Select variation"
                  }
                  placeholder="Select a variation"
                  className="w-full text-sm font-vagRounded"
               
                  disabled={!showActions || !onVariationChange}
                />
              ) : (
                <span className="text-xs text-white/40">No variations</span>
              )}
            </div>

            {showActions && (
              <div className="text-center pt-6">
                <button
                  onClick={() => window.open(result.url, "_blank")}
                  className={`${
                    result.url.includes("lazada")
                      ? "bg-pink-700/20 hover:bg-pink-800/20"
                      : "bg-orange-700/20 hover:bg-orange-800/20"
                  } text-white text-sm px-5 py-2 rounded-full shadow-md compare-button1`}
                >
                  Buy Now
                </button>
              </div>
            )}
          </div>
        );
      })}
    </div> 
</>}
</>
);
  
}
