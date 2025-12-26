"use client";

import { useRouter, useSearchParams } from 'next/navigation';
import { useMediaQuery } from 'react-responsive';
import { useState, Suspense, useEffect, useRef } from "react";
import SearchResults from "@/components/SearchResults";
import SkeletonResult from "@/components/SkeletonResult";
import Dropdown from "react-dropdown";
import "react-dropdown/style.css";
import { FaMagnifyingGlass } from "react-icons/fa6";
import dynamic from "next/dynamic";


function SearchResult() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const q = searchParams.get("q") || "";
 const [isFocused, setIsFocused] = useState(false); 
  const handleSearch = (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    router.push(`/search?q=${encodeURIComponent(query)}`);
  };
  // Added state to detect comparison view
  const [isComparisonView, setIsComparisonView] = useState(false);
const isDesktopOrLaptop = useMediaQuery({ query: '(min-width: 700px)' });

  const isTabletOrMobile = useMediaQuery({ query: '(max-width: 699px)' });

  const options = [
    "Best Match",
    "Top Sales",
    "Price: Low to High",
    "Price: High to Low",
  ];
  const [selectedOption, setSelectedOption] = useState(options[0]);
const [query, setQuery] = useState("");
  const handleSelect = (option) => setSelectedOption(option.value || option);
  
  useEffect(() => {
    const q = searchParams.get("q") || "";
    setQuery(q);
  }, [searchParams]);

  return (
<>

{isDesktopOrLaptop &&
<>

 <div className="flex flex-col items-center justify-center w-full min-h-screen h-fit">
      <div className="px-10 mt-10 items-center justify-center flex w-full">

        {/* ⬇⬇ HIDE SORT BAR ONLY WHEN isComparisonView === true */}
        {!isComparisonView && (
          <div className="flex justify-end w-full text-white">
            <div className="font-vagRounded py-1 text-[16px] text-white font-bold">
              <p>Sort by:</p>
            </div>
            <Dropdown
              options={options}
              onChange={handleSelect}
              value={selectedOption}
              className="text-sm font-vagRounded "
              controlClassName="Dropdown-control"
              menuClassName="Dropdown-menu"
              arrowClassName="text-white"
            />
          </div>
        )}
      </div>

      <div className="w-full">
        <SearchResults
          query={q}
          sortBy={selectedOption}
          // Pass setter so SearchResults can toggle the comparison view
          setIsComparisonView={setIsComparisonView}
        />
      </div>
    </div>
</>
}
{isTabletOrMobile &&
    <>
    <div className="!flex !flex-col items-center justify-center w-full ">
      <div className="!flex  px-8 mt-2 items-center justify-center flex w-full">

        {/* ⬇⬇ HIDE SORT BAR ONLY WHEN isComparisonView === true */}
        {!isComparisonView && (
          

         
          <div className="z-35  flex flex-col justify-end w-full text-white">
            <div className="flex w-full">
              {/* Search Input */}
                 <div className="!h-[52px] glass-search relative !flex-grow">
                <form onSubmit={handleSearch}>

                  <input
                    name="q"
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search"
                     onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    className={`!p-0 w-full  rounded-2xl text-white placeholder-white/50 !text-[14px] 
              font-normal transition-all duration-300  
               ${isFocused ? "!pl-10" : "!pl-4"}
                }`}
                  />
                  <FaMagnifyingGlass className={`absolute left-[14px] top-1/2 
                  -translate-y-1/2 text-white/70 text-[14px] transition-all duration-300 z-100 ${isFocused
                    ? "opacity-100 translate-x-0"
                    : "opacity-0 -translate-x-3"
                    }`}
                  />
                </form>
              </div>

              {/* Search Button */}
              <div onClick={handleSearch}>
                <button
                  type="button"
                  className=" !h-[52px] search-button flex items-center justify-center rounded-r-2xl px-5"
                >
                  <FaMagnifyingGlass className="text-white/70 !text-[12px]" />
                </button>
              </div>
            </div>

            <div className="relative z-50 pt-10 flex justify-end items-center font-vagRounded py-1 !text-[12px] text-white font-bold">
              <p>Sort by:</p>
          
            <Dropdown
              options={options}
              onChange={handleSelect}
              value={selectedOption}
              className="!text-[12px]  font-vagRounded whitespace-nowrap"
              controlClassName="Dropdown-control"
              menuClassName="Dropdown-menu"
              arrowClassName="text-white"
            />
          </div>  </div>
        )}
      </div>

      <div className="w-full">
        <SearchResults
          query={q}
          sortBy={selectedOption}
          // Pass setter so SearchResults can toggle the comparison view
          setIsComparisonView={setIsComparisonView}
        />
      </div>
    </div>
  </>}
</>
  );
}

export default dynamic(() => Promise.resolve(SearchResult), {
  ssr: false,
});
