"use client";
import React, { useEffect, useState, useRef, useCallback } from "react";
import Card from "@/components/Card";
import SkeletonResult from "./SkeletonResult";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { toast } from "sonner";
import Dropdown from "react-dropdown";
import "react-dropdown/style.css";
import PopoverDemo from "./ui/PopoverDemo";
import { TrendingUpDown } from "lucide-react";
import CompareSkeleton from "./CompareSkeleton";
import Link from "next/link";

import { useMediaQuery } from 'react-responsive';


function SearchResults({
  query,
  onToggleHeader,
  setIsComparisonView,
  sortBy = "Best Match",
}) {

  
    const isDesktopOrLaptop = useMediaQuery({ query: '(min-width: 700px)' });
    
      const isTabletOrMobile = useMediaQuery({ query: '(max-width: 699px)' });
  const [aiReply, setAiReply] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);
  const targetRef = useRef(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showCompare, setShowCompare] = useState(false);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [showClose, setShowClose] = useState(true);
  const [showComparisonTable, setShowComparisonTable] = useState(false);
  const [rawProducts, setRawProducts] = useState([]);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isAddingOneMore, setIsAddingOneMore] = useState(false);
  const [lockedProducts, setLockedProducts] = useState([]);
  const [comparisonResults, setComparisonResults] = useState([]);
  const [selectedVariations, setSelectedVariations] = useState({});
  const [likedProducts, setLikedProducts] = useState([]);
  const [compareid, setCompareID] = useState();
  const minimizedSnapshot = useRef([]);
  const [loadingCompare, setLoadingCompare] = useState(false);

  useEffect(() => {
    if (typeof onToggleHeader === "function") {
      onToggleHeader(!showComparisonTable);
    }
  }, [showComparisonTable, onToggleHeader]);
  useEffect(() => {
    if (typeof setIsComparisonView === "function") {
      setIsComparisonView(showComparisonTable);
    }
  }, [showComparisonTable]);
  function alternateProducts(productList) {
    const shopee = productList.filter((p) => p.source === "Shopee");
    const lazada = productList.filter((p) => p.source === "Lazada");
    const result = [];
    const maxLength = Math.max(shopee.length, lazada.length);

    for (let i = 0; i < maxLength; i++) {
      if (i < shopee.length) result.push(shopee[i]);
      if (i < lazada.length) result.push(lazada[i]);
    }

    return result;
  }
  function slugify(text) {
    if (!text) return "product";
    return text
      .toString()
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^\w\-]+/g, "")
      .replace(/\-\-+/g, "-")
      .replace(/^-+/, "")
      .replace(/-+$/, "");
  }

  async function GetProducts(signal) {
    try {
      setLoading(true);
      const res = await axios.get(
        `/api/search?keyword=${encodeURIComponent(query)}`,
        { signal }
      );

      const lazadaItems =
        res.data.lazada?.mods?.listItems?.map((item, index) => ({
          id: `lazada-${item.itemId || index}`,
          source: "Lazada",
          name: item.name,
          image: item.image,
          merchant: item.sellerName,
          price: parseFloat(item.price.replace(/[^\d.]/g, "")),
          link: item.itemUrl,
          sales: parseInt(
            (item.itemSoldCntShow || "0").replace(/[^0-9]/g, ""),
            10
          ),
          rating: Math.round((item.ratingScore || 0) * 10) / 10,
        })) || [];

      const shopeeItems =
        res.data.shopee?.items
          ?.filter((item) => item.item_basic)
          ?.map((item, index) => {
            const b = item.item_basic;

            let linkShopId = b.shopid;
            let linkItemId = b.itemid;

            if (item.real_items && item.real_items.length > 0) {
              linkShopId = item.real_items[0].shop_id;
              linkItemId = item.real_items[0].item_id;
            }
            // --- END NEW LOGIC ---

            const name = b.name;
            const slug = slugify(name);

            return {
              id: `shopee-${b.itemid || index}`,
              source: "Shopee",
              name: name,
              merchant: b.shop_name || "Unknown Seller",
              image: b.image
                ? `https://down-ph.img.susercontent.com/file/${b.image}`
                : null,
              price: b.price ? b.price / 100000 : 0,

              // Build the link using the prioritized IDs
              link: `https://shopee.ph/${slug}-i.${linkShopId}.${linkItemId}`,

              sales: b.historical_sold || 0,
              rating: Math.round((b.item_rating?.rating_star || 0) * 10) / 10,
            };
          }) || [];

      const merged = [...lazadaItems, ...shopeeItems];
      const uniqueProducts = Object.values(
        merged.reduce((acc, product) => {
          if (!acc[product.id]) acc[product.id] = product;
          return acc;
        }, {})
      );

      // Store raw unsorted list
      setRawProducts(uniqueProducts);

      const bestMatch = alternateProducts(uniqueProducts);
      setProducts(bestMatch);
    } catch (error) {
      if (axios.isCancel(error)) {
        console.log("❌ Request canceled");
        toast.error(`${error}`);
      } else {
        console.error("Error fetching products:", error);
        toast.error(`${error}`);
      }
    } finally {
      setLoading(false);
    }
  }

  // ---------------------------------------------MOCK DATA ---------------------------------------------
  // async function GetProducts() {
  //   try {
  //     setLoading(true);
  //     await new Promise((resolve) => setTimeout(resolve, 300));

  //     const lazadaItems = [
  //       {
  //         id: 1,
  //         source: "Lazada",
  //         link: "//www.lazada.com.ph/products/pdp-i4583025956.html",
  //         name: "Wireless Mouse",
  //         image: "https://placehold.co/400",
  //         merchant: "Lazada Store",
  //         price: 299,
  //         sales: 150,
  //         rating: 4.6,
  //         ratingCount: 230,
  //       },
  //       {
  //         id: 2,
  //         source: "Lazada",
  //         name: "Mechanical Keyboard",
  //         link: "//www.lazada.com.ph/products/pdp-i5061537266.html",
  //         image: "https://placehold.co/400x400/FFFFFF/FFFFFF",
  //         merchant: "Lazada Tech",
  //         price: 899,
  //         sales: 89,
  //         rating: 4.8,
  //         ratingCount: 124,
  //       },
  //     ];

  //     const shopeeItems = Array.from({ length: 8 }).map((_, i) => ({
  //       id: i + 3,
  //       source: "Shopee",
  //       name: "Mechanical Keyboard",
  //       link: "https://shopee.ph/product/1023426474/29541632312",
  //       image: "https://placehold.co/400x400/FFFFFF/FFFFFF", // pure white background
  //       merchant: "Shopee Tech",
  //       price: 850,
  //       sales: 120 - i * 10,
  //       rating: (Math.random() * 1.5 + 3.5).toFixed(2), // random between 3.5–5.0
  //       ratingCount: Math.floor(Math.random() * 500 + 50), // 50–550
  //     }));

  //     const newProducts = [...lazadaItems, ...shopeeItems];
  //     setRawProducts(newProducts);
  //     setProducts(newProducts);
  //     ScrapeAllProducts(newProducts);
  //   } catch (error) {
  //     toast.error(error.message);
  //   } finally {
  //     setLoading(false);
  //   }
  // }

  useEffect(() => {
    if (!rawProducts.length) return;

    let sorted = [...rawProducts];

    switch (sortBy) {
      case "Best Match":
        sorted = alternateProducts(rawProducts);
        break;

      case "Top Sales":
        sorted.sort((a, b) => {
          const salesA = a.sales || 0;
          const salesB = b.sales || 0;
          return salesB - salesA;
        });
        break;

      case "Price: Low to High":
        sorted.sort((a, b) => a.price - b.price);
        break;

      case "Price: High to Low":
        sorted.sort((a, b) => b.price - a.price);
        break;

      default:
        sorted = [...rawProducts];
    }

    setProducts(sorted);
  }, [sortBy, rawProducts]);
  useEffect(() => {
    if (!query) return;

    const controller = new AbortController();
    const delay = setTimeout(() => GetProducts(controller.signal), 400);

    return () => {
      controller.abort();
      clearTimeout(delay);
    };
  }, [query]);

  const handleToggle = useCallback(
    (productId) => {
      setSelectedProducts((prev) => {
        const isLocked = lockedProducts.includes(productId);
        const alreadySelected = prev.includes(productId);
        if (isLocked) return prev;
        if (alreadySelected) return prev.filter((id) => id !== productId);

        if (isAddingOneMore) {
          if (prev.length >= 3) return prev;

          const newSelected = [...prev, productId];

          // If we hit 3 items, trigger comparison immediately
          if (newSelected.length === 3) {
            setTimeout(() => {
              setIsAddingOneMore(false);
              setLockedProducts([]);
              setShowCompare(false);

              // This now works because CompareAction accepts 'newSelected'
              CompareAction(newSelected).then(() => {
                setShowComparisonTable(true);
              });
            }, 300);
          }
          return newSelected;
        }

        if (prev.length >= 3) return prev;
        return [...prev, productId];
      });
    },
    [lockedProducts, isAddingOneMore]
  );
  useEffect(() => {
    let lastScrollY = 0;
    const handleScroll = () => {
      const currentScroll = window.scrollY;
      setShowClose(currentScroll < lastScrollY);
      lastScrollY = currentScroll;
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // ------------------------------ mockdata ---------------------------------------------
  // async function CompareAction(selectedList = selectedProducts) {
  //   try {
  //     setLoadingCompare(true);
  //     setShowComparisonTable(true);

  //     const selected = products.filter((p) => selectedList.includes(p.id));
  //     const urls = selected.map((p) =>
  //       p.link.startsWith("//") ? "https:" + p.link : p.link
  //     );

  //     if (!urls.length) {
  //       toast.error("No valid URLs selected");
  //       return;
  //     }

  //     const mockResults = urls.map((url, i) => ({
  //       url,
  //       title:
  //         i % 2 === 0
  //           ? `Mock Product ${i + 1}`
  //           : `MOCKPRODUCTT FOR WWHAT NOW HAHAHHAHAHAHAHHAH HAHAHAHHAH HAHAHAHHAH`,
  //       brand: i % 2 === 0 ? "Logitech" : "Rakk",
  //       description:
  //         i % 2 === 0
  //           ? "This is a mocked product description."
  //           : "This is a mocked product description.This is a mocked product description. This is a mocked product description. This is a mocked product description. This is a mocked product description. This is a mocked product description.",
  //       rating: (Math.random() * 5).toFixed(1),
  //       currency: "PHP",
  //       lowestPrice: 799 + i * 100,
  //       highestPrice: 999 + i * 100,
  //       variations: [
  //         {
  //           name: "Black / Red",
  //           price: (799 + i * 100).toFixed(2),
  //           priceBeforeDiscount: (899 + i * 100).toFixed(2),
  //           stock: 12,
  //           sold: 45 + i * 5,
  //         },
  //         {
  //           name: "White / Blue",
  //           price: (849 + i * 100).toFixed(2),
  //           priceBeforeDiscount: (949 + i * 100).toFixed(2),
  //           stock: 8,
  //           sold: 20 + i * 2,
  //         },
  //       ],
  //     }));

  //     setComparisonResults(mockResults);
  //     const res = await axios.post("/api/history", { snapshot: mockResults });
  //     setCompareID(res.data.comparisonId);
  //   } catch (error) {
  //     console.error("Mock CompareAction failed:", error);
  //     toast.error("Something went wrong");
  //   } finally {
  //     setLoadingCompare(false);
  //   }
  // }

  //------------------------------------------------------------legit---------------------------------------------------------------------------

  async function CompareAction(idsToCompare = selectedProducts) {
    try {
      setLoadingCompare(true);
      setShowComparisonTable(true);

      const selected = products.filter((p) => idsToCompare.includes(p.id));

      if (selected.length === 0) {
        toast.error("No products selected");
        return;
      }

      // 1. Separate Lazada & Shopee products
      const lazadaProducts = selected.filter((p) => p.source === "Lazada");
      const shopeeProducts = selected.filter((p) => p.source === "Shopee"); // (Ignored for now)

      // 2. Create an array of individual promises (One request per product)
      const scrapePromises = lazadaProducts.map((product) => {
        // Prepare a single-item array for the API
        const singleUrlArray = JSON.stringify([
          product.link.startsWith("//")
            ? "https:" + product.link
            : product.link,
        ]);

        // Fire request!
        return axios
          .get(`/api/lazada-true?urls=${encodeURIComponent(singleUrlArray)}`)
          .then((res) => res.data.results?.[0]) // Grab the first (and only) result
          .catch((err) => {
            console.error(`Failed to scrape ${product.name}:`, err);
            return { error: "Scrape Failed", source: "Lazada" };
          });
      });

      // 3. Wait for all 3 Vercel servers to finish simultaneously
      const results = await Promise.all(scrapePromises);

      // Filter out any undefined/null results
      const validResults = results.filter((item) => item);

      setComparisonResults(validResults);

      // Save to history (Optional: You can save them as a batch if needed)
      if (validResults.length > 0) {
        await axios.post("/api/history", { snapshot: validResults });
      }

      setCompareID("new-compare-session"); // Mock ID or from response
      setShowComparisonTable(true);
    } catch (error) {
      console.error("CompareAction failed:", error);
      toast.error("Something went wrong while comparing");
    } finally {
      setLoadingCompare(false);
    }
  }

  useEffect(() => {
    const fetchLikes = async () => {
      try {
        const res = await axios.get("/api/likes");

        setLikedProducts(res.data.likedProducts || []);
      } catch (err) {
        console.error("Error fetching likes", err);
      }
    };

    fetchLikes();
  }, [query]);

  const selectedImages = selectedProducts.map((id) => {
    const p = products.find((prod) => prod.id === id);
    return p ? p.image : null;
  });

  return (
    <>
  {isDesktopOrLaptop &&
  <>
      {!showComparisonTable && (
        <motion.div
          key="motion-container"
          initial={false}
          animate={
            
            showCompare
              ? { y: 0, backdropFilter: "blur(35px)" }
              : { y: 0, backdropFilter: "blur(0px)" }
          }
          transition={{ type: "spring", stiffness: 200, damping: 25 }}
          className={`relative z-30 min-h-screen ${
            showCompare ? "inner-shadow-y" : "bg-transparent"
          }`}
          style={{ top: "5px", overflow: "visible" }}
        >
          {/* ✕ and ━ Buttons */}
          <AnimatePresence>
            {showCompare && showClose && (
              <motion.div
                key="top-buttons"
                className="absolute top-4 right-10 flex gap-4 z-[101]"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: -5 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
              >
                
                <button
                  onClick={() => {
                    setShowCompare(false);
                    setSelectedProducts([]);
                    setIsMinimized(false);
                    minimizedSnapshot.current = [];
                  }}
                  className="text-white text-[32px] font-vagRounded font-light cursor-pointer"
                  title="Close"
                >
                  ✕
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="text-center px-10 pt-20 grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-4">
            {loading ? (
              // <div className="col-span-full flex flex-col justify-center items-center gap-4 min-h-[60vh]">
              //   <motion.div
              //     animate={{ rotate: 360 }}
              //     transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
              //     className="w-12 h-12 border-4 border-t-white border-gray-400 rounded-full"
              //   />
              //   <p className="text-white text-lg font-vagRounded tracking-wide">
              //     Loading Products...
              //   </p>
              // </div>
              <SkeletonResult />
            ) : error ? (
              <p className="text-center text-red-400 font-vagRounded mt-10">
                {error}
              </p>
            ) : (
              products.map((product) => (
                <Card
                  key={product.id}
                  showCompare={showCompare}
                  products={product}
                  isSelected={selectedProducts.includes(product.id)}
                  onToggle={() => handleToggle(product.id)}
                  isDisabled={
                    selectedProducts.length >= 3 &&
                    !selectedProducts.includes(product.id)
                  }
                  isLiked={likedProducts.some((item) => item.id === product.id)}
                  onLikeToggle={(isLiked) => {
                    setLikedProducts((prev) =>
                      isLiked
                        ? [...prev, product]
                        : prev.filter((p) => p.id !== product.id)
                    );
                  }}
                />
              ))
            )}
          </div>
        </motion.div>
      )}

      {showComparisonTable && (
        <motion.div
          ref={targetRef}
          key="comparison-view"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="backdrop-blur-lg border border-white/20 relative w-full min-h-screen p-0 text-white flex flex-col overflow-hidden z-40"
        >
          <motion.div
            key="top-buttons"
            className="absolute top-4 right-10 flex gap-4 z-[101]"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: -5 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            {/* ━ Minimize */}
            <button
              onClick={() => {
                minimizedSnapshot.current = [...selectedProducts];
                setIsMinimized(true);
                setShowComparisonTable(false);
                setShowCompare(true);
              }}
              className="text-white text-[26px] font-vagRounded font-light cursor-pointer"
              title="Minimize"
            >
              ━
            </button>

            {/* ✕ Close */}
            <button
              onClick={() => {
                setShowCompare(false);
                setShowComparisonTable(false);
                setSelectedProducts([]);
                setIsMinimized(false);
                setComparisonResults([]);
                setSelectedVariations({});
                minimizedSnapshot.current = [];
              }}
              className="text-white text-[36px] font-vagRounded font-light cursor-pointer"
              title="Close"
            >
              ✕
            </button>
          </motion.div>
          <h2 className="text-2xl font-bold mb-8 text-center z-10 mt-16">
            Product Comparison
          </h2>
          {loadingCompare ? (
            <div className="  grid grid-cols-3 w-3/4 mx-auto gap-4">
              <CompareSkeleton />
              {/* <div className="overflow-x-hidden overflow-hidden relative z-10">
                <div className="pb-5 w-3/4 mx-auto flex gap-4">
                  {comparisonResults.map((result, index) => {
                    const p = products.find(
                      (x) => x.id === selectedProducts[index]
                    );
                    const selectedVar = selectedVariations[p?.id];
                    const displayPrice = selectedVar
                      ? selectedVar.price
                      : `${result.lowestPrice} - ${result.highestPrice}`;

                    return (
                      <div
                        key={p?.id || index}
                        className="flex flex-col flex-1 min-w-[220px]"
                      >
                        <div className="glass-button1 rounded-t-[23px]">
                          <div className="flex justify-center items-center flex-col p-4">
                            <img
                              crossOrigin="anonymous"
                              src={p?.image}
                              alt={result.title}
                              className="w-32 h-32 object-contain rounded-lg"
                            />
                            <p className="font-semibold text-center mt-3">
                              {result.title}
                            </p>
                            {result.brand && (
                              <p className="text-xs text-white/60 mt-1">
                                {result.brand}
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="glass-button1 h-16 rounded-0 flex items-center justify-center text-center">
                          <div className="flex flex-col">
                            <span className="font-semibold text-xs opacity-60">
                              Price
                            </span>
                            <span>₱{displayPrice}</span>
                          </div>
                        </div>

                        <div className="glass-button1 h-16 rounded-0 flex items-center justify-center text-center">
                          <div className="flex flex-col">
                            <span className="font-semibold text-xs opacity-60">
                              Rating
                            </span>
                            <span>{result.rating || "-"} ⭐</span>
                          </div>
                        </div>

                        <div className="glass-button1 h-16 rounded-0 flex items-center justify-center text-center">
                          <div className="flex flex-col">
                            <span className="font-semibold text-xs opacity-60">
                              Source
                            </span>
                            <span>{p?.source || "-"}</span>
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
                          <Dropdown
                            options={result.variations.map(
                              (variation) =>
                                `${variation.name} — ₱${variation.price}`
                            )}
                            onChange={(option) => {
                              const [name] = option.value.split(" — ₱");
                              const selected = result.variations.find(
                                (v) => v.name === name
                              );
                              setSelectedVariations((prev) => ({
                                ...prev,
                                [p.id]: selected,
                              }));
                            }}
                            value={
                              selectedVar
                                ? `${selectedVar.name} — ₱${selectedVar.price}`
                                : "Select variation "
                            }
                            placeholder="Select a variation"
                            className="w-full text-sm font-vagRounded"
                            controlClassName=""
                            menuClassName="!absolute !static !rounded-none !bg-[rgba(255,255,255,0.01)] !backdrop-blur-none"
                            arrowClassName="text-white"
                          />
                        </div>

                        <div className="text-center pt-6">
                          <button
                            onClick={() =>
                              window.open(
                                p?.source === "Lazada"
                                  ? "https://www.lazada.com.ph/"
                                  : "https://shopee.ph/",
                                "_blank"
                              )
                            }
                            className={`${
                              p?.source === "Lazada"
                                ? "bg-pink-700/20 hover:bg-pink-800/20"
                                : "bg-orange-700/20 hover:bg-orange-800/20"
                            } text-white text-sm px-5 py-2 rounded-full shadow-md compare-button1`}
                          >
                            Buy Now
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div> */}
            </div>
          ) : (
            <>
              <div className="overflow-x-hidden overflow-hidden relative z-10">
                <div className="w-3/4 mx-auto flex gap-4">
                  {comparisonResults.map((result, index) => {
                    const p = products.find(
                      (x) => x.id === selectedProducts[index]
                    );

                    if (!result || result.error) {
                      return (
                        <div
                          key={p?.id || index}
                          className="flex flex-col flex-1 min-w-[220px] pb-5"
                        >
                          <div className="glass-button1 rounded-[23px] h-full min-h-[600px] flex flex-col items-center justify-center p-6 text-center gap-4 border border-red-500/30">
                            {p?.image && (
                              <img
                                src={p.image}
                                className="w-24 h-24 object-contain opacity-50 grayscale rounded-lg"
                                alt="Unavailable"
                              />
                            )}
                            <div>
                              <p className="font-bold text-red-300 text-lg">
                                Data Unavailable
                              </p>
                              <p className="text-sm text-white/60 mt-1">
                                We couldn't fetch the latest details for this
                                item.
                              </p>
                            </div>
                            <button
                              onClick={() => window.open(p?.link, "_blank")}
                              className="bg-white/10 hover:bg-white/20 text-white text-sm px-4 py-2 rounded-full transition-colors"
                            >
                              View on Store
                            </button>
                          </div>
                        </div>
                      );
                    }

                    const variations = result?.variations || [];
                    let minPrice = null;
                    let maxPrice = null;

                    if (variations.length > 0) {
                      const prices = variations
                        .map((v) => Number(v.price))
                        .filter((v) => !isNaN(v));

                      if (prices.length > 0) {
                        minPrice = Math.min(...prices);
                        maxPrice = Math.max(...prices);
                      }
                    }

                    const selectedVar = selectedVariations[p?.id];
                    const variationPrice =
                      selectedVar && !isNaN(Number(selectedVar.price))
                        ? Number(selectedVar.price)
                        : null;

                    let displayPrice = "-";
                    if (variationPrice !== null) {
                      displayPrice = variationPrice;
                    } else if (minPrice !== null && maxPrice !== null) {
                      displayPrice =
                        minPrice === maxPrice
                          ? `${minPrice}`
                          : `${minPrice} - ${maxPrice}`;
                    }

                    return (
                      <div
                        key={p?.id || index}
                        className="flex flex-col flex-1 min-w-[220px] pb-5"
                      >
                        <Link href={p?.link} target="_blank">
                          <div className="glass-button1 rounded-t-[23px] min-h-[250px]">
                            <div className="flex justify-center items-center flex-col p-4">
                              <img
                                crossOrigin="anonymous"
                                src={p?.image}
                                alt={result.title}
                                className="w-32 h-32 object-contain rounded-lg"
                              />
                              <p className="font-semibold line-clamp-2 text-ellipsis overflow-hidden text-center mt-3">
                                {result.title}
                              </p>
                              {result.brand && (
                                <p className="text-xs text-white/60 mt-1">
                                  {result.brand}
                                </p>
                              )}
                            </div>
                          </div>
                        </Link>

                        <div className="glass-button1 h-16 rounded-0 flex items-center justify-center text-center">
                          <div className="flex flex-col">
                            <span className="font-semibold text-xs opacity-60 ">
                              Price
                            </span>
                            <span>₱{displayPrice}</span>
                          </div>
                        </div>

                        <div className="glass-button1 h-16 rounded-0 flex items-center justify-center text-center">
                          <div className="flex flex-col">
                            <span className="font-semibold text-xs opacity-60">
                              Rating
                            </span>
                            <span>{result.rating || "-"} ⭐</span>
                          </div>
                        </div>

                        <div className="glass-button1 h-16 rounded-0 flex items-center justify-center text-center">
                          <div className="flex flex-col">
                            <span className="font-semibold text-xs opacity-60">
                              Store
                            </span>
                            <span>{p?.source || "-"}</span>
                          </div>
                        </div>

                        <div className="glass-button1 min-h-24 rounded-0 flex items-center justify-center text-center p-3">
                          <div className="flex flex-col">
                            <span className="font-semibold text-xs opacity-60">
                              Description
                            </span>
                            <span className="text-xs mt-1 line-clamp-3 text-ellipsis overflow-hidden">
                              {result.description || "-"}
                            </span>
                          </div>
                        </div>

                        <div className="glass-button1 py-3 min-h-16 h-auto rounded-0 flex flex-col items-center justify-center text-center relative">
                          <span className="font-semibold text-xs opacity-60 mb-2">
                            Variations
                          </span>
                          <Dropdown
                            // ✅ FIXED: Using the safe local 'variations' array
                            options={variations.map(
                              (variation) =>
                                `${variation.name} — ₱${variation.price}`
                            )}
                            onChange={(option) => {
                              const [name] = option.value.split(" — ₱");
                              const selected = variations.find(
                                (v) => v.name === name
                              );
                              setSelectedVariations((prev) => ({
                                ...prev,
                                [p.id]: selected,
                              }));
                            }}
                            value={
                              selectedVar
                                ? `${selectedVar.name} — ₱${selectedVar.price}`
                                : "Select variation "
                            }
                            placeholder="Select a variation"
                            className="w-full text-sm font-vagRounded"
                            controlClassName="Dropdown-control !w-full"
                            menuClassName="Dropdown-menu !absolute !static !w-full rounded-none "
                            arrowClassName="text-white"
                          />
                        </div>

                        <div className="text-center pt-6">
                          <button
                            onClick={() => window.open(p?.link, "_blank")}
                            className={`
                              glass-button1
                              rounded-full shadow-md compare-button1 text-white text-sm px-5 py-2
                            `}
                          >
                            Buy Now
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {selectedProducts.length === 2 && (
                <span
                  onClick={() => {
                    setLockedProducts([...selectedProducts]);
                    setIsAddingOneMore(true);
                    setShowComparisonTable(false);
                    setShowCompare(true);
                  }}
                  className="absolute top-[180px] right-[40px] text-white/80 text-[15px] 
                     font-medium hover:text-gray-300 cursor-pointer select-none z-50"
                >
                  + Add 1 more item
                </span>
              )}
            </>
          )}
        </motion.div>
      )}

      <div className="p-[50px] fixed bottom-5 right-5 flex flex-col items-end gap-3 z-50">
        {!showCompare && !isMinimized && !showComparisonTable && (
          <button
            onClick={() => setShowCompare(true)}
            className="compare-button transition-all text-center text-[20px] text-white rounded-full font-bold w-[215px] h-[52px]"
          >
            Compare
          </button>
        )}
        {showCompare && !showComparisonTable && !isAddingOneMore && (
          <div className="flex flex-col items-center gap-3">
            <div className="text-white text-lg font-semibold bg-black/60 px-4 py-2 rounded-full shadow-md flex justify-center items-center">
              {selectedProducts.length}/3
            </div>

            <button
              disabled={
                selectedProducts.length < 2 || selectedProducts.length > 3
              }
              onClick={async () => {
                await CompareAction();
                setShowComparisonTable(true);
              }}
              className={`text-center text-[20px] rounded-full font-bold w-[215px] h-[52px] compare-button ${
                selectedProducts.length >= 2 && selectedProducts.length <= 3
                  ? "text-white bg-blue-500 hover:bg-black-200"
                  : "text-gray-300 bg-gray-300 cursor-not-allowed pointer-events-none"
              }`}
            >
              Compare Now
            </button>
          </div>
        )}
        {showComparisonTable && (
          <PopoverDemo
            compareId={compareid}
            results={comparisonResults}
            aiReply={aiReply}
            setAiReply={setAiReply}
            aiLoading={aiLoading}
            setAiLoading={setAiLoading}
            images={selectedImages}
          />
        )}
      </div>
      {isMinimized && minimizedSnapshot.current.length >= 2 && (
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -50 }}
          className="absolute top-30 left-5 bg-white/10 backdrop-blur-md rounded-full flex 
        items-center gap-2 p-3 pl-5 shadow-lg border border-white/20 cursor-pointer z-50"
          onClick={() => {
            setShowCompare(true);
            setIsMinimized(false);
            setShowComparisonTable(true);
            setSelectedProducts(minimizedSnapshot.current);
          }}
        >
          {minimizedSnapshot.current.map((id) => {
            const p = products.find((x) => x.id === id);
            return (
              <img
                crossOrigin="anonymous"
                key={p.id}
                src={p.image}
                alt={p.name}
                className="w-8 h-8 rounded-lg border border-white/30"
              />
            );
          })}
          <span className="ml-2 text-white/70 text-sm">(Click to reopen)</span>
        </motion.div>
      )}
  </>}
  
   {isTabletOrMobile &&
  <>
      {!showComparisonTable && (
        <motion.div
          key="motion-container"
          initial={false}
          animate={
            
            showCompare
              ? { y: 0, backdropFilter: "blur(35px)" }
              : { y: 0, backdropFilter: "blur(0px)" }
          }
          transition={{ type: "spring", stiffness: 200, damping: 25 }}
          className={`relative z-30 min-h-screen ${
            showCompare ? "inner-shadow-y" : "bg-transparent"
          }`}
          style={{ top: "5px", overflow: "visible" }}
        >
          {/* ✕ and ━ Buttons */}
          <AnimatePresence>
            {showCompare && showClose && (
              <motion.div
                key="top-buttons"
                className="absolute top-4 right-8 flex gap-4 z-[101]"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: -5 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
              >
                
                <button
                  onClick={() => {
                    setShowCompare(false);
                    setSelectedProducts([]);
                    setIsMinimized(false);
                    minimizedSnapshot.current = [];
                  }}
                  className="text-white text-[20px] font-vagRounded font-light cursor-pointer"
                  title="Close"
                >
                  ✕
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="text-center px-8 py-15 grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-4">
            {loading ? (
              // <div className="col-span-full flex flex-col justify-center items-center gap-4 min-h-[60vh]">
              //   <motion.div
              //     animate={{ rotate: 360 }}
              //     transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
              //     className="w-12 h-12 border-4 border-t-white border-gray-400 rounded-full"
              //   />
              //   <p className="text-white text-lg font-vagRounded tracking-wide">
              //     Loading Products...
              //   </p>
              // </div>
              <SkeletonResult />
            ) : error ? (
              <p className="text-center text-red-400 font-vagRounded mt-10">
                {error}
              </p>
            ) : (
              products.map((product) => (
                <Card
                  key={product.id}
                  showCompare={showCompare}
                  products={product}
                  isSelected={selectedProducts.includes(product.id)}
                  onToggle={() => handleToggle(product.id)}
                  isDisabled={
                    selectedProducts.length >= 3 &&
                    !selectedProducts.includes(product.id)
                  }
                  isLiked={likedProducts.some((item) => item.id === product.id)}
                  onLikeToggle={(isLiked) => {
                    setLikedProducts((prev) =>
                      isLiked
                        ? [...prev, product]
                        : prev.filter((p) => p.id !== product.id)
                    );
                  }}
                />
              ))
            )}
          </div>
        </motion.div>
      )}

      {showComparisonTable && (
        <motion.div
          ref={targetRef}
          key="comparison-view"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="backdrop-blur-lg border border-white/20 relative w-full min-h-screen p-0 text-white flex flex-col overflow-hidden z-40"
        >
          <motion.div
            key="top-buttons"
            className="absolute top-4 right-10 flex gap-4 z-[101]"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: -5 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            {/* ━ Minimize */}
            <button
              onClick={() => {
                minimizedSnapshot.current = [...selectedProducts];
                setIsMinimized(true);
                setShowComparisonTable(false);
                setShowCompare(true);
              }}
              className="text-white text-[20px] font-vagRounded font-light cursor-pointer"
              title="Minimize"
            >
              ━
            </button>

            {/* ✕ Close */}
            <button
              onClick={() => {
                setShowCompare(false);
                setShowComparisonTable(false);
                setSelectedProducts([]);
                setIsMinimized(false);
                setComparisonResults([]);
                setSelectedVariations({});
                minimizedSnapshot.current = [];
              }}
              className="text-white text-[20px] font-vagRounded font-light cursor-pointer"
              title="Close"
            >
              ✕
            </button>
          </motion.div>
          <h2 className="!text-[24px] font-bold mb-8 text-center z-10 mt-16">
            Product Comparison
          </h2>
          {loadingCompare ? (
            <div className="  grid grid-cols-3 w-3/4 mx-auto gap-4">
              <CompareSkeleton />
              {/* <div className="overflow-x-hidden overflow-hidden relative z-10">
                <div className="pb-5 w-3/4 mx-auto flex gap-4">
                  {comparisonResults.map((result, index) => {
                    const p = products.find(
                      (x) => x.id === selectedProducts[index]
                    );
                    const selectedVar = selectedVariations[p?.id];
                    const displayPrice = selectedVar
                      ? selectedVar.price
                      : `${result.lowestPrice} - ${result.highestPrice}`;

                    return (
                      <div
                        key={p?.id || index}
                        className="flex flex-col flex-1 min-w-[220px]"
                      >
                        <div className="glass-button1 rounded-t-[23px]">
                          <div className="flex justify-center items-center flex-col p-4">
                            <img
                              crossOrigin="anonymous"
                              src={p?.image}
                              alt={result.title}
                              className="w-32 h-32 object-contain rounded-lg"
                            />
                            <p className="font-semibold text-center mt-3">
                              {result.title}
                            </p>
                            {result.brand && (
                              <p className="text-xs text-white/60 mt-1">
                                {result.brand}
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="glass-button1 h-16 rounded-0 flex items-center justify-center text-center">
                          <div className="flex flex-col">
                            <span className="font-semibold text-xs opacity-60">
                              Price
                            </span>
                            <span>₱{displayPrice}</span>
                          </div>
                        </div>

                        <div className="glass-button1 h-16 rounded-0 flex items-center justify-center text-center">
                          <div className="flex flex-col">
                            <span className="font-semibold text-xs opacity-60">
                              Rating
                            </span>
                            <span>{result.rating || "-"} ⭐</span>
                          </div>
                        </div>

                        <div className="glass-button1 h-16 rounded-0 flex items-center justify-center text-center">
                          <div className="flex flex-col">
                            <span className="font-semibold text-xs opacity-60">
                              Source
                            </span>
                            <span>{p?.source || "-"}</span>
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
                          <Dropdown
                            options={result.variations.map(
                              (variation) =>
                                `${variation.name} — ₱${variation.price}`
                            )}
                            onChange={(option) => {
                              const [name] = option.value.split(" — ₱");
                              const selected = result.variations.find(
                                (v) => v.name === name
                              );
                              setSelectedVariations((prev) => ({
                                ...prev,
                                [p.id]: selected,
                              }));
                            }}
                            value={
                              selectedVar
                                ? `${selectedVar.name} — ₱${selectedVar.price}`
                                : "Select variation "
                            }
                            placeholder="Select a variation"
                            className="w-full text-sm font-vagRounded"
                            controlClassName=""
                            menuClassName="!absolute !static !rounded-none !bg-[rgba(255,255,255,0.01)] !backdrop-blur-none"
                            arrowClassName="text-white"
                          />
                        </div>

                        <div className="text-center pt-6">
                          <button
                            onClick={() =>
                              window.open(
                                p?.source === "Lazada"
                                  ? "https://www.lazada.com.ph/"
                                  : "https://shopee.ph/",
                                "_blank"
                              )
                            }
                            className={`${
                              p?.source === "Lazada"
                                ? "bg-pink-700/20 hover:bg-pink-800/20"
                                : "bg-orange-700/20 hover:bg-orange-800/20"
                            } text-white text-sm px-5 py-2 rounded-full shadow-md compare-button1`}
                          >
                            Buy Now
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div> */}
            </div>
          ) : (
            <>
              <div className="p-8 overflow-x-hidden overflow-hidden relative z-10">
                <div className="w-full mx-auto flex gap-4">
                  {comparisonResults.map((result, index) => {
                    const p = products.find(
                      (x) => x.id === selectedProducts[index]
                    );

                    if (!result || result.error) {
                      return (
                        <div
                          key={p?.id || index}
                          className="flex flex-col m-h-[150px] !w-[120px] pb-5"
                        >
                          <div className="glass-button1 rounded-[23px] 
                          h-full min-h-[600px] flex flex-col items-center 
                          justify-center p-6 text-center gap-4 border border-red-500/30">
                            {p?.image && (
                              <img
                                src={p.image}
                                className="w-24 h-24 object-contain opacity-50 grayscale rounded-lg"
                                alt="Unavailable"
                              />
                            )}
                            <div>
                              <p className="font-bold text-red-300 text-[12px]">
                                Data Unavailable
                              </p>
                              <p className="text-[8px] text-white/60 mt-1">
                                We couldn't fetch the latest details for this
                                item.
                              </p>
                            </div>
                            <button
                              onClick={() => window.open(p?.link, "_blank")}
                              className="bg-white/10 hover:bg-white/20 text-white text-[10px] px-4 py-2 rounded-[16px] transition-colors"
                            >
                              View on Store
                            </button>
                          </div>
                        </div>
                      );
                    }

                    const variations = result?.variations || [];
                    let minPrice = null;
                    let maxPrice = null;

                    if (variations.length > 0) {
                      const prices = variations
                        .map((v) => Number(v.price))
                        .filter((v) => !isNaN(v));

                      if (prices.length > 0) {
                        minPrice = Math.min(...prices);
                        maxPrice = Math.max(...prices);
                      }
                    }

                    const selectedVar = selectedVariations[p?.id];
                    const variationPrice =
                      selectedVar && !isNaN(Number(selectedVar.price))
                        ? Number(selectedVar.price)
                        : null;

                    let displayPrice = "-";
                    if (variationPrice !== null) {
                      displayPrice = variationPrice;
                    } else if (minPrice !== null && maxPrice !== null) {
                      displayPrice =
                        minPrice === maxPrice
                          ? `${minPrice}`
                          : `${minPrice} - ${maxPrice}`;
                    }

                    return (
                      <div
                        key={p?.id || index}
                        className="flex flex-col flex-1  pb-5"
                      >

                        <div className="!w-[150px]">
                        <Link href={p?.link} target="_blank">
                        


                     
                          <div className="glass-button1 rounded-t-[23px] !w-[150px]
                           ">
                            <div className="flex justify-center items-center flex-col p-2">
                              <img
                                crossOrigin="anonymous"
                                src={p?.image}
                                alt={result.title}
                                className="w-22 h-22 object-contain rounded-lg"
                              />
                              <p className="font-semibold line-clamp-2
                               text-ellipsis !text-[10px] overflow-hidden text-center mt-3">
                                {result.title}
                              </p>
                              {result.brand && (
                                <p className="text-[8px] text-white/60 mt-1">
                                  {result.brand}
                                </p>
                              )}
                            </div>
                          </div>
                        </Link>

                        <div className="glass-button1 h-16 
                        !w-[150px]
                        rounded-0 flex items-center justify-center text-center">
                          <div className="flex flex-col">
                            <span className="font-semibold text-[10px] opacity-60 ">
                              Price
                            </span>
                            <span className="text-[12px]">₱{displayPrice}</span>
                          </div>
                        </div>

                        <div className="glass-button1 h-16 rounded-0 flex items-center justify-center text-center">
                          <div className="flex flex-col">
                            <span className="font-semibold text-[10px] opacity-60">
                              Rating
                            </span>
                              <span className="text-[12px]">{result.rating || "-"} ⭐</span>
                          </div>
                        </div>

                        <div className="glass-button1 h-16 rounded-0 flex items-center justify-center text-center">
                          <div className="flex flex-col">
                            <span className="font-semibold text-[10px] opacity-60">
                              Store
                            </span>
                              <span className="text-[12px]">{p?.source || "-"}</span>
                          </div>
                        </div>

                        <div className="glass-button1 min-h-24 rounded-0 flex items-center justify-center text-center p-3">
                          <div className="flex flex-col">
                            <span className="font-semibold text-[10px] opacity-60">
                              Description
                            </span>
                            <span className="text-[10px] mt-1 line-clamp-3 text-ellipsis overflow-hidden">
                              {result.description || "-"}
                            </span>
                          </div>
                        </div>

                        <div className="glass-button1 py-3 min-h-16 h-auto rounded-0 flex flex-col items-center justify-center text-center relative">
                          <span className="font-semibold text-[10px] opacity-60 mb-2">
                            Variations
                          </span>
                          <Dropdown
                            // ✅ FIXED: Using the safe local 'variations' array
                            options={variations.map(
                              (variation) =>
                                `${variation.name} — ₱${variation.price}`
                            )}
                            onChange={(option) => {
                              const [name] = option.value.split(" — ₱");
                              const selected = variations.find(
                                (v) => v.name === name
                              );
                              setSelectedVariations((prev) => ({
                                ...prev,
                                [p.id]: selected,
                              }));
                            }}
                            value={
                              selectedVar
                                ? `${selectedVar.name} — ₱${selectedVar.price}`
                                : "Select variation "
                            }
                            placeholder="Select a variation"
                            className="w-full text-[12px] font-vagRounded"
                            controlClassName="Dropdown-control !w-full"
                            menuClassName="Dropdown-menu !absolute !static !w-full rounded-none "
                            arrowClassName="text-white"
                          />
                        </div>

                        <div className="text-center pt-6">
                          <button
                            onClick={() => window.open(p?.link, "_blank")}
                            className={`
                              glass-button1
                              rounded-full shadow-md compare-button1 text-white text-sm px-5 py-2
                            `}
                          >
                            Buy Now
                          </button>
                        </div>
                      </div></div>
                    );
                  })}
                </div>
              </div>

              {selectedProducts.length === 2 && (
                <span
                  onClick={() => {
                    setLockedProducts([...selectedProducts]);
                    setIsAddingOneMore(true);
                    setShowComparisonTable(false);
                    setShowCompare(true);
                  }}
                  className="absolute top-[180px] right-[40px] text-white/80 text-[15px] 
                     font-medium hover:text-gray-300 cursor-pointer select-none z-50"
                >
                  + Add 1 more item
                </span>
              )}
            </>
          )}
        </motion.div>
      )}

      <div className="pb-[100px] pr-[8px] fixed bottom-5 right-5 flex flex-col items-end gap-3 z-50">
        {!showCompare && !isMinimized && !showComparisonTable && (
          <button
            onClick={() => setShowCompare(true)}
            className="compare-button transition-all text-center text-[16px] text-white 
            !rounded-[16px] font-bold w-[164px] h-[48px]"
          >
            Compare
          </button>
        )}
        {showCompare && !showComparisonTable && !isAddingOneMore && (
          <div className="flex flex-col items-center gap-3">
            <div className="text-white text-[14px] backdrop-blur-md font-semibold bg-black/60
             px-4 py-2 rounded-full shadow-md flex justify-center items-center">
              {selectedProducts.length}/3
            </div>

            <button
              disabled={
                selectedProducts.length < 2 || selectedProducts.length > 3
              }
              onClick={async () => {
                await CompareAction();
                setShowComparisonTable(true);
              }}
              className={`text-center text-[16px]
                !rounded-[16px] font-bold w-[164px] h-[48px] compare-button ${
                selectedProducts.length >= 2 && selectedProducts.length <= 3
                  ? "text-white bg-blue-500 hover:bg-black-200"
                  : "text-gray-300 bg-gray-300 cursor-not-allowed pointer-events-none"
              }`}
            >
              Compare Now
            </button>
          </div>
        )}
        {showComparisonTable && (
          <PopoverDemo
            compareId={compareid}
            results={comparisonResults}
            aiReply={aiReply}
            setAiReply={setAiReply}
            aiLoading={aiLoading}
            setAiLoading={setAiLoading}
            images={selectedImages}
          />
        )}
      </div>
      {isMinimized && minimizedSnapshot.current.length >= 2 && (
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -50 }}
          className="absolute top-30 left-5 bg-white/10 backdrop-blur-md rounded-full flex 
        items-center gap-2 p-3 pl-5 shadow-lg border border-white/20 cursor-pointer z-50"
          onClick={() => {
            setShowCompare(true);
            setIsMinimized(false);
            setShowComparisonTable(true);
            setSelectedProducts(minimizedSnapshot.current);
          }}
        >
          {minimizedSnapshot.current.map((id) => {
            const p = products.find((x) => x.id === id);
            return (
              <img
                crossOrigin="anonymous"
                key={p.id}
                src={p.image}
                alt={p.name}
                className="w-8 h-8 rounded-lg border border-white/30"
              />
            );
          })}
          <span className="ml-2 text-white/70 text-sm">(Click to reopen)</span>
        </motion.div>
      )}
  </>}
  </>
  );
}
export default SearchResults;