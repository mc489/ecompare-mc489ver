"use client";

import { useRouter, useSearchParams } from 'next/navigation';
import { useMediaQuery } from 'react-responsive';
import { useState, useEffect } from "react";
import SearchResults from "@/components/SearchResults";
import Dropdown from "react-dropdown";
import "react-dropdown/style.css";
import { FaMagnifyingGlass, FaClock } from "react-icons/fa6";
import { IoClose } from "react-icons/io5";
import dynamic from "next/dynamic";




function SearchResult() {
 
const [fadeText, setFadeText] = useState("");
  const [fadeState, setFadeState] = useState("fade-in");
 

const [search, setSearch] = useState("");
  const [recentSearches, setRecentSearches] = useState([]);
  const [googleSuggestions, setGoogleSuggestions] = useState([]);
  // ... other states

  // 1. Define static data first
  const popularSearches = ["Aquaflask", "iPhone 15 Pro Max", "Bluetooth Speaker", "Mechanical Keyboard", "Sunscreen"];

// 2. Filter local matches (Recent + Popular)
const instantMatches = [...new Set([...recentSearches, ...popularSearches])]
  .filter(term => term.toLowerCase().includes(search.toLowerCase()))
  .slice(0, 3);

// 3. Combine with API results
// Ensure googleSuggestions is definitely an array before spreading
const combinedSuggestions = [
  ...new Set([
    ...instantMatches, 
    ...(Array.isArray(googleSuggestions) ? googleSuggestions : [])
  ])
].slice(0, 4);

  // 3. Your Google Fetch Effect
  const [isSearching, setIsSearching] = useState(false);

// 2. Update the Fetch Effect
useEffect(() => {
  const controller = new AbortController();
  const signal = controller.signal;

  if (search.trim().length < 2) {
    setGoogleSuggestions([]);
    setIsSearching(false);
    return;
  }

  // Set loading to true immediately when typing starts
  setIsSearching(true);

  const delayDebounceFn = setTimeout(async () => {
    try {
      // We now call OUR OWN internal API route
      const response = await fetch(`/api/suggestions?q=${encodeURIComponent(search)}`, { signal });
      
      if (!response.ok) throw new Error("API Error");
      
      const data = await response.json();
      setGoogleSuggestions(data || []);
    } catch (error) {
      if (error.name !== 'AbortError') {
        console.error("Search API error:", error);
      }
    } finally {
      // Stop the "Searching..." animation/text
      setIsSearching(false);
    }
  }, 200); // 200ms debounce

  return () => {
    clearTimeout(delayDebounceFn);
    controller.abort();
  };
}, [search]);


const filteredSuggestions = [...new Set([...recentSearches, ...popularSearches])]
  .filter((term) => term.toLowerCase().includes(search.toLowerCase()))
  .slice(0, 6); // Limit to top 6 matches

  const getRecentSearches = () => {
    if (typeof window === "undefined") return [];
    const history = localStorage.getItem("recent_searches");
    return history ? JSON.parse(history) : [];
  };

  const saveSearch = (term) => {
    let history = getRecentSearches();
    history = [term, ...history.filter(t => t !== term)].slice(0, 5); 
    localStorage.setItem("recent_searches", JSON.stringify(history));
  };
const removeRecentSearch = (e, term) => {
  // Prevent the input from losing focus
  e.preventDefault(); 
  // Prevent the click from triggering a search
  e.stopPropagation(); 

  const history = getRecentSearches().filter((t) => t !== term);
  localStorage.setItem("recent_searches", JSON.stringify(history));
  setRecentSearches(history);
};



   
  const router = useRouter();
  const searchParams = useSearchParams();
  const q = searchParams.get("q") || "";
 const [isFocused, setIsFocused] = useState(false); 
  
 


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

  const handleSelect = (option) => setSelectedOption(option.value || option);
  

  
   
 const handleSearch = (e) => {
    if (e) e.preventDefault();
    if (!search.trim()) return;
    
    saveSearch(search.trim());
    setRecentSearches(getRecentSearches());
    router.push(`/search?q=${encodeURIComponent(search)}`);
  };

const handleSuggestionClick = (term) => {
    setSearch(term);
    saveSearch(term);
    router.push(`/search?q=${encodeURIComponent(term)}`);
  };
useEffect(() => {
    setSearch(q);
    setRecentSearches(getRecentSearches());
  }, [q]);
  return (
<>

{isDesktopOrLaptop &&
<>

 <div className="flex flex-col items-center justify-center w-full min-h-screen h-fit">
      <div className="px-10 mt-10 items-center justify-center flex w-full">

        {/* ⬇⬇ HIDE SORT BAR ONLY WHEN isComparisonView === true */}
        {!isComparisonView && (
          <div className="z-35 flex justify-end w-full text-white">
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
                 <div className="flex w-[clamp(320px,85vw,800px)] relative mx-auto">
                          {/* Placeholder Text */}
                          {!search && (
                            <div
                              className={`absolute left-10 top-1/2 transform -translate-y-1/2 text-[14px]
                                text-white/50 pointer-events-none z-10 transition-opacity duration-500 ${
                                fadeState === "fade-in" ? "opacity-100" : "opacity-0"
                              }`}
                              style={{ whiteSpace: "nowrap" }}
                              dangerouslySetInnerHTML={{ __html: fadeText }}
                            />
                          )}
              
                         <div className="!h-[52px] glass-search relative !flex-grow">
              <form onSubmit={handleSearch}>
                <FaMagnifyingGlass className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50 text-[14px] pointer-events-none" />
                <input
                  className="!px-[40px] w-full rounded-l-2xl text-white placeholder-white/50 !text-[14px] font-normal"
                  type="text"
                  value={search}
                  onFocus={() => setIsFocused(true)}
                  // Delay blur so clicks on suggestions are registered
                  onBlur={() => setTimeout(() => setIsFocused(false), 200)}
                  onChange={(e) => setSearch(e.target.value)}
                              />
                            </form>
                          </div>
              
                          {/* Submit Button */}
                          <div onClick={handleSearch}>
                            <button
                              type="submit"
                              className="flex-[1] !h-[52px] search-button flex items-center justify-center rounded-r-2xl px-5"
                            >
                              <FaMagnifyingGlass className="text-white/70 text-[12px]" />
                            </button>
                          </div>
              
                        {/* --- SINGLE-COLUMN STACKED SUGGESTION DROPDOWN --- */}
              {isFocused && (
                <div className="absolute top-[58px] left-0 w-full glass-button border-none rounded-[20px] p-4 !z-100 shadow-2xl animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="flex flex-col gap-6">
                    
                   {search.length > 0 ? (
                <div className="flex flex-col gap-1">
                  <p className="text-white/40 text-[9px] font-bold uppercase tracking-wider mb-2 px-2">Suggestions</p>
                  
                  {isSearching ? (
                    /* Show this while the API is actually working */
                    <p className="text-white/20 text-[10px] animate-pulse italic px-2">Searching...</p>
                  ) : combinedSuggestions.length > 0 ? (
                    /* Show results if found */
                    combinedSuggestions.map((term, i) => (
                      <div 
                        key={i}
                        onMouseDown={() => handleSuggestionClick(term)}
                        className="flex items-center gap-3 text-white/70 cursor-pointer hover:bg-white/5 p-3 rounded-lg transition-all"
                      >
                        <FaMagnifyingGlass size={12} className="shrink-0 opacity-40" />
                        <span className="text-[14px] truncate">{term}</span>
                      </div>
                    ))
                  ) : (
                    /* Show this only if searching is finished AND no results exist */
                    <p className="text-white/20 text-[10px] italic px-2">No results found</p>
                  )}
                </div>
              ) : (
                      /* --- DEFAULT VIEW: RECENT & POPULAR --- */
                      <>
                        {recentSearches.length > 0 && (
                          <div className="flex flex-col gap-1">
                            <p className="text-white/40 text-[9px] font-bold uppercase tracking-wider mb-1 px-2">Recent</p>
                            {recentSearches.map((term, i) => (
                              <div key={i} onMouseDown={() => handleSuggestionClick(term)} className="flex items-center justify-between group cursor-pointer hover:bg-white/5 p-2 rounded-lg transition-all">
                                <div className="flex items-center gap-2 text-white/70 overflow-hidden">
                                  <FaClock size={12} className="shrink-0 opacity-50" />
                                  <span className="text-[12px] truncate">{term}</span>
                                </div>
                                <button onMouseDown={(e) => removeRecentSearch(e, term)} className="p-1 hover:text-red-400 transition-all shrink-0">
                                  <IoClose size={14} className="text-white/40" />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
              
                        <div className={`flex flex-col gap-1 ${recentSearches.length > 0 ? 'pt-4 border-t border-white/10' : ''}`}>
                          <p className="text-white/40 text-[9px] font-bold uppercase tracking-wider mb-1 px-2">Popular</p>
                          {popularSearches.slice(0, 5).map((term, i) => (
                            <div key={i} onMouseDown={() => handleSuggestionClick(term)} className="flex items-center gap-2 text-white/70 cursor-pointer hover:bg-white/5 p-2 rounded-lg transition-all group">
                              <FaMagnifyingGlass size={10} className="shrink-0 opacity-50" />
                              <span className="text-[12px] truncate font-medium">{term}</span>
                            </div>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                </div>
              )}
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
