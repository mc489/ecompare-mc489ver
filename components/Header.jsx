"use client";

import { useMediaQuery } from 'react-responsive';
import { useEffect, useState, useRef } from "react";
import { FaMagnifyingGlass, FaExclamation, FaClock, FaFire } from "react-icons/fa6"; // Added FaFire
import { SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import Link from "next/link";
import { FaHistory } from "react-icons/fa";
import { dark } from "@clerk/themes";
import { usePathname, useSearchParams, useRouter } from "next/navigation";
import { FaHeart } from "react-icons/fa";
import dynamic from "next/dynamic";
import History from "./History";
import UserLikes from "./UserLikes";
import { useClerk } from "@clerk/nextjs";
import { RxQuestionMarkCircled } from "react-icons/rx";
import { IoClose } from "react-icons/io5"; // Added Close Icon



function Header({ visible = false }) {
 const [recentSearches, setRecentSearches] = useState([]);
  const isDesktopOrLaptop = useMediaQuery({ query: '(min-width: 700px)' });

  const isTabletOrMobile = useMediaQuery({ query: '(max-width: 699px)' });
  // Mocking "Real" Popular Lazada Searches (Trending in PH)
 
const [search, setSearch] = useState("");

  
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



 
   
  const { openUserProfile } = useClerk();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const isSearchPage = pathname === "/search";
  const [query, setQuery] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const [showIcon, setShowIcon] = useState(false);
  const hoverTimer = useRef(null);
 
 const [fadeText, setFadeText] = useState("");
  const [fadeState, setFadeState] = useState("fade-in");

   const handleTipsClick = () => {
    router.push("/Tips"); 
  };
  useEffect(() => {
    const q = searchParams.get("q") || "";
    setQuery(q);
  }, [searchParams]);

const handleSubmit = (e) => {
    if (e) e.preventDefault();
    if (!query.trim()) return;
    
    saveSearch(query.trim());
    setRecentSearches(getRecentSearches());
    router.push(`/search?q=${encodeURIComponent(query)}`);
  };

  const handleSuggestionClick = (term) => {
    setSearch(term);
    saveSearch(term);
    router.push(`/search?q=${encodeURIComponent(term)}`);
  };
  if (visible) return null; // 👈 Hide header entirely when not visible

  return (
    <>
    {isDesktopOrLaptop&& 
    <>
      <header className="z-35 flex justify-between items-center px-13 py-15 h-16 font font-black bg-header-gradient text-white relative z-10">
        {/* LEFT SIDE */}
        <div className="flex items-center font-baloo text-[24px] gap-4">
          <Link
            href="/"
            onMouseEnter={() => {
              hoverTimer.current = setTimeout(() => setShowIcon(true), 3000);
            }}
            onMouseLeave={() => {
              clearTimeout(hoverTimer.current);
              setShowIcon(false);
            }}
            className="relative inline-block"
          >
            {/* TEXT */}
            <span
              className={`absolute left-0 top-0 transition-opacity duration-300 ${showIcon ? "opacity-0" : "opacity-100"
                }`}
            >
              E-COMPARE
            </span>

            {/* ICON (perfectly overlapping text) */}
            <img
              src="/whiteicon.png"
              alt="icon"
              className={`absolute left-0 top-0 w-[40px] transition-opacity duration-300 ${showIcon ? "opacity-100" : "opacity-0"
                }`}
            />

            {/* Invisible spacer to maintain consistent width */}
            <span className="opacity-0">E-COMPARE</span>
          </Link>
        </div>


        {/* CENTER SEARCH BAR */}
        <div className="justify-center flex w-[40%] min-w-[300px] relative">
          {isSearchPage && (
            <div className="flex w-full">
              {/* Search Input */}
              <div className="glass-search relative flex-[22]">
                <form onSubmit={handleSubmit}>

                  <input
                    name="q"
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search"
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    className={` w-full h-[48px] rounded-2xl text-white placeholder-white/50 text-[16px] 
              font-normal transition-all duration-300  
               ${isFocused ? "!pl-12" : "!pl-4"}
                }`}
                  />
                  <FaMagnifyingGlass className={`absolute left-[16px] top-1/2 -translate-y-1/2 text-white/70 text-[16px] transition-all duration-300 z-100 ${isFocused
                    ? "opacity-100 translate-x-0"
                    : "opacity-0 -translate-x-3"
                    }`}
                  />
                </form>
              </div>

              {/* Search Button */}
              <div onClick={handleSubmit}>
                <button
                  type="button"
                  className="flex-[1] h-[48px] search-button flex items-center justify-center rounded-r-2xl px-6"
                >
                  <FaMagnifyingGlass className="text-white/70 text-lg" />
                </button>
              </div>
                {/* --- DROPDOWN (Now shows Popular if Recent is empty) --- */}
                              <div className="absolute top-[58px] left-0 w-full glass-button border-none rounded-[20px] p-4 z-50 shadow-2xl animate-in fade-in slide-in-from-top-2 duration-200">
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
  </div> </div>
 )}
          </div>
     

        {/* RIGHT SIDE */}
        <div className="flex justify-center items-center gap-1">
           
                <button onClick={handleTipsClick} className="items-center mt-[3px] pl-13 cursor-pointer">
          <RxQuestionMarkCircled color="white" size={16}/>
          </button>
          <SignedOut>
            
            <Link href="/sign-in">
              <button className="font-normal text-lg text-white font-vagRounded cursor-pointer rounded-full px-5 py-3 hover:text-gray-300 ease duration-500">
                Login
              </button>
            </Link>
            <Link href="/sign-up">
              <button className="font-normal text-lg text-white font-vagRounded cursor-pointer rounded-full px-5 py-3 hover:text-gray-300 ease duration-500">
                Sign Up
              </button>
            </Link>
          </SignedOut>

          <SignedIn>
            <UserButton appearance={{}}>
              <UserButton.UserProfilePage
                label="History"
                url="custom-history"
                labelIcon={<FaHistory size={16} />}
              >
                <div className="p-6">
                  <h2 className="text-xl text-center font-bold mb-4">
                    Activity History
                  </h2>
                </div>
                <History />
              </UserButton.UserProfilePage>

              <UserButton.UserProfilePage
                label="User likes"
                url="custom-likes"
                labelIcon={<FaHeart size={16} />}
              >
                <UserLikes />
              </UserButton.UserProfilePage>
            </UserButton>
          </SignedIn>
        </div>
      </header>
    </>
    }

  {isTabletOrMobile && 
  <>
    <header className="z-35 flex justify-between items-center
     pl-8 pr-8 py-10 h-16 font font-black bg-header-gradient text-white relative z-10 flex-nowrap">
      {/* LEFT SIDE */}
      <div className="flex items-center font-baloo text-[16px] gap-4 ">
        <Link
          href="/"
          onMouseEnter={() => {
            hoverTimer.current = setTimeout(() => setShowIcon(true), 3000);
          }}
          onMouseLeave={() => {
            clearTimeout(hoverTimer.current);
            setShowIcon(false);
          }}
          className="relative inline-block"
        >
          {/* TEXT - Added whitespace-nowrap */}
          <span
          onCopy={(e) => e.preventDefault()} 
  onContextMenu={(e) => e.preventDefault()}
            className={`absolute left-0 top-0 transition-opacity duration-300 whitespace-nowrap ${
              showIcon ? "opacity-0" : "opacity-100"
            }`}
          >
            E-COMPARE
          </span>

          {/* ICON (perfectly overlapping text) */}
          <img
            src="/whiteicon.png"
            alt="icon"
            className={`absolute left-0 top-0 w-[40px] transition-opacity duration-300 ${
              showIcon ? "opacity-100" : "opacity-0"
            }`}
          />

          {/* Invisible spacer - This is the MOST important one to fix */}
          {/* Added whitespace-nowrap here so the container doesn't shrink */}
          
          <span className="opacity-0 whitespace-nowrap">E-COMPARE</span>
        </Link>
      </div>



        {/* RIGHT SIDE */}
        <div className="flex justify-center items-center gap-2">
           <button onClick={handleTipsClick} className="items-center mt-[1px]  cursor-pointer">
          <RxQuestionMarkCircled color="white" size={12}/>
          </button>
          <SignedOut>
            <Link href="/sign-in">
              <button className="font-normal text-[14px] text-white font-vagRounded cursor-pointer rounded-full py-3 hover:text-gray-300 ease duration-500">
                Login
              </button>
            </Link>
            <Link href="/sign-up">
              <button className="whitespace-nowrap font-normal text-[14px] text-white 
              font-vagRounded cursor-pointer rounded-full py-3 ml-6 hover:text-gray-300 ease duration-500">
                Sign Up
              </button>
            </Link>
          </SignedOut>

          <SignedIn>
            <UserButton appearance={{}}>
              <UserButton.UserProfilePage
                label="History"
                url="custom-history"
                labelIcon={<FaHistory size={16} />}
              >
                <div className="p-6">
                  <h2 className="text-xl text-center font-bold mb-4">
                    Activity History
                  </h2>
                </div>
                <History />
              </UserButton.UserProfilePage>

              <UserButton.UserProfilePage
                label="User likes"
                url="custom-likes"
                labelIcon={<FaHeart size={16} />}
              >
                <UserLikes />
              </UserButton.UserProfilePage>
            </UserButton>
          </SignedIn>
        </div>
      
      </header>
        </>
      }
    </>
  );
}
export default dynamic(() => Promise.resolve(Header), {
  ssr: false,
});
