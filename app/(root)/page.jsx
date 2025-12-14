"use client";
import Footer from "@/components/Footer";
import { useUser } from "@clerk/nextjs";
import { FaMagnifyingGlass } from "react-icons/fa6";
import lazada from "@/public/lazada.svg";
import shopee from "@/public/shopee.svg";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

import { useMediaQuery } from 'react-responsive';

function HomePage() {
  const router = useRouter();
  const { user } = useUser();
  const [search, setSearch] = useState("");
  const [fadeText, setFadeText] = useState("");
  const [fadeState, setFadeState] = useState("fade-in"); // 'fade-in' | 'fade-out'
 const isDesktopOrLaptop = useMediaQuery({ query: '(min-width: 700px)' });
  const isTabletOrMobile = useMediaQuery({ query: '(max-width: 699px)' });

  useEffect(() => {
    const textOptions = [
      'Start your <span class="font-bold ">smart</span> online shopping.',
      'Compare <span class="font-semibold">prices</span> easily.',
      'Find the <span class="font-bold">best deals</span> today.',
      'Shop confidently with <span class="font-baloo">E-Compare</span>.',
    ];

    let index = 0;
    setFadeText(textOptions[index]);

    const interval = setInterval(() => {
      setFadeState("fade-out");
      setTimeout(() => {
        index = (index + 1) % textOptions.length;
        setFadeText(textOptions[index]);
        setFadeState("fade-in");
      }, 500); // fade-out duration
    }, 3000); // each phrase visible for 4s

    return () => clearInterval(interval);
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!search.trim()) return;
    router.push(`/search?q=${encodeURIComponent(search)}`);
  };
  const res = process.env.KAMELEO;

  return (
    <>

    {isDesktopOrLaptop &&
    <>
      <div className="min-h-[calc(screen-120px)] ">
        <div className="py-15 px-16"></div>
        <div className="min-h-80 flex justify-center items-center w-full flex-col gap-10">
          {/* Search Section */}
          <div className="flex flex-row justify-center items-center w-full">
            <div className="w-full flex max-w-[700px]  relative">
              {/* Fading Placeholder */}
              {!search && (
                <div
                  className={`absolute left-12 top-1/2 transform -translate-y-1/2 
                    text-white/50 pointer-events-none z-10 transition-opacity duration-500 ${fadeState === "fade-in" ? "opacity-100" : "opacity-0"
                    }`}
                  style={{ whiteSpace: "nowrap" }}
                  dangerouslySetInnerHTML={{ __html: fadeText }}
                />
              )}

              <div className="glass-search relative flex-[22]">
                <form onSubmit={handleSubmit}>
                  <FaMagnifyingGlass className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50 text-[16px] pointer-events-none" />
                  <input
                    className="w-full rounded-l-2xl text-white placeholder-white/50 text-[16px] font-normal"
                    type="text" 
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </form>
              </div>
              {/* Search Button */}
              <div onClick={handleSubmit}>
                <button
                  type="button"
                  className="flex-[1] h-[48px] search-button flex items-center justify-center rounded-r-2xl px-6"
                >
                  <FaMagnifyingGlass className=" text-white/70 text-lg" />
                </button>
              </div>
            </div>
          </div>

          {/* Below content */}
          <div
            className="flex justify-center items-center flex-row gap-3 font-vagRounded text-white font-medium text-1xl "
            style={{ width: "40%" }}
          >
            <p className="cursor-default">Powered by </p>


            <Image className="cursor-pointer items-center" src={lazada} alt="Lazada" width={24} height={24} onClick={() =>
              window.open(
                "https://www.lazada.com.ph/"

              )
            } />
            <Image className="cursor-pointer tems-center" src={shopee} alt="Shopee" width={16} height={16} onClick={() =>
              window.open(
                "https://shopee.ph/"

              )
            } />
          </div>
        </div>
      </div>

      <Footer />
      </>
      }
      
    {isTabletOrMobile &&
    <>
      <div className="min-h-[calc(screen-120px)]">
      
        <div className="min-h-80 flex justify-center items-center w-full flex-col gap-10">
          {/* Search Section */}
          <div className="flex flex-row justify-center items-center w-full">
            <div className="flex w-[40%] min-w-[300px] relative">
              {/* Fading Placeholder */}
              {!search && (
                <div
                  className={`absolute left-8 top-1/2 transform -translate-y-1/2 text-[10px]
                    text-white/50 pointer-events-none z-10 transition-opacity duration-500 ${fadeState === "fade-in" ? "opacity-100" : "opacity-0"
                    }`}
                  style={{ whiteSpace: "nowrap" }}
                  dangerouslySetInnerHTML={{ __html: fadeText }}
                />
              )}

              <div className="!h-[40px] glass-search relative flex-[22]">
                <form onSubmit={handleSubmit}>
                  <FaMagnifyingGlass className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50 
                  text-[10px] pointer-events-none" />
                  <input
                    className="!px-[32px] -w-full rounded-l-2xl text-white placeholder-white/50 !text-[10px] font-normal"
                    type="text" 
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </form>
              </div>
              {/* Search Button */}
              <div onClick={handleSubmit}>
                <button
                  type="button"
                  className="flex-[1] !h-[40px] search-button flex items-center justify-center rounded-r-2xl px-5"
                >
                  <FaMagnifyingGlass className=" text-white/70 text-[10px]" />
                </button>
              </div>
            </div>
          </div>

          {/* Below content */}
          <div
            className="flex justify-center items-center flex-row gap-3 font-vagRounded text-white font-medium text-[12px]"
            style={{ width: "40%" }}
          >
            <p className="cursor-default">Powered by </p>


            <Image className="cursor-pointer !items-center" src={lazada} alt="Lazada" width={14} height={24} onClick={() =>
              window.open(
                "https://www.lazada.com.ph/"

              )
            } />
            <Image className="cursor-pointer items-center " src={shopee} alt="Shopee" width={10} height={16} onClick={() =>
              window.open(
                "https://shopee.ph/"

              )
            } />
          </div>
        </div>
      </div>
<div className="[&_footer]:!fixed [&_footer]:!bottom">
      <Footer />
      </div></>
      }
    </>
  );
}

export default HomePage;
