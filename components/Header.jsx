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

  const isDesktopOrLaptop = useMediaQuery({ query: '(min-width: 700px)' });

  const isTabletOrMobile = useMediaQuery({ query: '(max-width: 699px)' });
  // Mocking "Real" Popular Lazada Searches (Trending in PH)
  const popularSearches = [
    "Aquaflask", "iPhone 15 Pro Max", "Bluetooth Speaker", "Mechanical Keyboard", "Sunscreen"
  ];
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



  const handleSubmit = (e) => {
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
  const { openUserProfile } = useClerk();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const isSearchPage = pathname === "/search";
  const [query, setQuery] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const [showIcon, setShowIcon] = useState(false);
  const hoverTimer = useRef(null);
  const [recentSearches, setRecentSearches] = useState([]);
 const [fadeText, setFadeText] = useState("");
  const [fadeState, setFadeState] = useState("fade-in");

   const handleTipsClick = () => {
    router.push("/Tips"); 
  };
  useEffect(() => {
    const q = searchParams.get("q") || "";
    setQuery(q);
  }, [searchParams]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    router.push(`/search?q=${encodeURIComponent(query)}`);
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
                <form onSubmit={handleSearch}>

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
              <div onClick={handleSearch}>
                <button
                  type="button"
                  className="flex-[1] h-[48px] search-button flex items-center justify-center rounded-r-2xl px-6"
                >
                  <FaMagnifyingGlass className="text-white/70 text-lg" />
                </button>
              </div>
                {/* --- DROPDOWN (Now shows Popular if Recent is empty) --- */}
                                {isFocused && (
                                  <div className="absolute top-[52px] left-0 w-full glass-button border-none rounded-2xl p-5 z-50 shadow-2xl animate-in fade-in slide-in-from-top-2 duration-200">
                                    
                                    {/* Popular Section (Always shows) */}
                                    <div className="mb-4">
                                      <div className="flex items-center gap-2 mb-3 text-orange-400 text-xs font-bold uppercase tracking-wider">
                                        <FaFire size={12} />
                                        Popular Searches
                                      </div>
                                      <div className="flex flex-wrap gap-2">
                                        {popularSearches.map((term, i) => (
                                          <button 
                                            key={i}
                                            onClick={() => handleSuggestionClick(term)}
                                            className="bg-white/5 hover:bg-white/20 border border-white/10 text-white/80 text-xs px-3 py-1.5 rounded-full transition-all"
                                          >
                                            {term}
                                          </button>
                                        ))}
                                      </div>
                                    </div>
              
                                    {/* Recent Section (Only shows if history exists) */}
                                 {recentSearches.length > 0 && (
                                      <div className="mt-4 pt-4 border-t border-white/10">
                                        <div className="flex items-center gap-2 mb-2 text-white/40 text-xs font-bold uppercase">
                                          <FaClock size={11} /> Recent History
                                        </div>
                                        <ul className="flex flex-col gap-1">
                {recentSearches.map((term, i) => (
                  <li 
                    key={i}
                    onClick={() => handleSuggestionClick(term)}
                    className="text-white/70 hover:text-white hover:bg-white/5 p-2 px-3 rounded-lg cursor-pointer text-sm transition-all flex justify-between items-center group"
                  >
                    <span>{term}</span>
                    <button 
                      // Use onMouseDown to prevent blur
                      onMouseDown={(e) => removeRecentSearch(e, term)}
                      className="opacity-0 group-hover:opacity-100 hover:text-red-400 p-1 transition-all"
                    >
                      <IoClose size={18} />
                    </button>
                  </li>
                                          ))}
                                        </ul>
                                      </div>
                                    )}
                                  </div>
                                )}
                              </div>
           
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
