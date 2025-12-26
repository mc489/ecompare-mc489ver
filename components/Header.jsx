"use client";

import { useMediaQuery } from 'react-responsive';
import { useEffect, useState, useRef } from "react";
import { FaMagnifyingGlass } from "react-icons/fa6";
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

function Header({ visible = false }) {

  const isDesktopOrLaptop = useMediaQuery({ query: '(min-width: 700px)' });

  const isTabletOrMobile = useMediaQuery({ query: '(max-width: 699px)' });

  const { openUserProfile } = useClerk();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const isSearchPage = pathname === "/search";
  const [query, setQuery] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const [showIcon, setShowIcon] = useState(false);
  const hoverTimer = useRef(null);
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
      <header className="flex justify-between items-center pl-13 pr-10 py-15 h-16 font font-black bg-header-gradient text-white relative z-10">
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
            </div>
          )}
        </div>

        {/* RIGHT SIDE */}
        <div className="flex justify-center items-center gap-1">
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
        <div className="flex justify-center items-center gap-8">
          <SignedOut>
            <Link href="/sign-in">
              <button className="font-normal text-[14px] text-white font-vagRounded cursor-pointer rounded-full py-3 hover:text-gray-300 ease duration-500">
                Login
              </button>
            </Link>
            <Link href="/sign-up">
              <button className="whitespace-nowrap font-normal text-[14px] text-white 
              font-vagRounded cursor-pointer rounded-full py-3 hover:text-gray-300 ease duration-500">
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
