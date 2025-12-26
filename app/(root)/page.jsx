"use client";
import Footer from "@/components/Footer";
import { useUser } from "@clerk/nextjs";
import { FaMagnifyingGlass, FaExclamation } from "react-icons/fa6";
import lazada from "@/public/lazada.svg";
import shopee from "@/public/shopee.svg";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { IoMdInformationCircleOutline } from "react-icons/io";
import { useMediaQuery } from 'react-responsive';
import * as Popover from '@radix-ui/react-popover';

function HomePage() {
  const router = useRouter();
  const { user } = useUser();
  const [search, setSearch] = useState("");
  const [fadeText, setFadeText] = useState("");
  const [fadeState, setFadeState] = useState("fade-in");
  // 1. New state to track if the search bar is active
  const [isFocused, setIsFocused] = useState(false);

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
      }, 500);
    }, 3000);

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
            className="flex justify-center items-center flex-row  font-vagRounded text-white font-medium text-1xl "
            style={{ width: "40%" }}
          > 
          
          <div className="flex !items-center gap-1 ">

          
           <Popover.Root>
              <Popover.Trigger asChild>
                 <IoMdInformationCircleOutline className="cursor-pointer "size={18} color="white" />
              </Popover.Trigger>
              
              <Popover.Portal>
                <Popover.Content 
                  className="  !cursor-text z-50 w-64 rounded-md !border-none glass-button max-w-[210px] p-4 text-white 
                  shadow-md animate-in fade-in zoom-in duration-200 !outline-none"
                  sideOffset={5}
                >
                  <div className=" gap-1 items-center flex flex-row font-bold border-b border-white mb-2 pb-1">
              <FaExclamation size={10} />
                   Notice
                  </div>
                  <p className="text-sm">
                    <span className="text-orange-500">Shopee</span> products are currently not available.
                  </p>
                  <Popover.Arrow className="fill-white/50" />
                </Popover.Content>
              </Popover.Portal>
            </Popover.Root>


            <p className=" cursor-default ml-1 mr-3 ">Powered by </p>

                <div className="flex gap-4">
              
            <Image className="cursor-pointer items-center" src={lazada} alt="Lazada" width={24} height={24} onClick={() =>
              window.open(
                "https://www.lazada.com.ph/"

              )
            } />
            <Image className="cursor-pointer tems-center" src={shopee} alt="Shopee" width={16} height={16} onClick={() =>
              window.open(
                "https://shopee.ph/"

              )
            } /> </div>

          </div></div>
        </div>
      </div>

      <Footer />
      </>
      }
      
    {isTabletOrMobile &&
  <>
          <div className="!overflow-hidden h-[calc(100vh-200px)] flex flex-col">
            {/* 3. Mobile Transitioning Spacer */}
            <div className={`transition-all duration-300 ease-in-out ${isFocused ? "h-2" : "h-1/3"}`}></div>
            
            <div className="flex !justify-center items-center w-full flex-col gap-5">
              <div className="flex flex-row !justify-center !items-center ">
                <div className="flex w-[clamp(320px,85vw,800px)] relative mx-auto">
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
                    <form onSubmit={handleSubmit}>
                      <FaMagnifyingGlass className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50 text-[14px] pointer-events-none" />
                      <input
                        className="!px-[40px] w-full rounded-l-2xl text-white placeholder-white/50 !text-[14px] font-normal"
                        type="text"
                        value={search}
                        onFocus={() => setIsFocused(true)}
                        onBlur={() => !search && setIsFocused(false)}
                        onChange={(e) => setSearch(e.target.value)}
                      />
                    </form>
                  </div>
                  <div onClick={handleSubmit}>
                    <button
                      type="button"
                      className="flex-[1] !h-[52px] search-button flex items-center justify-center rounded-r-2xl px-5"
                    >
                      <FaMagnifyingGlass className=" text-white/70 text-[12px]" />
                    </button>
                  </div>
                </div>
              </div>

              <div className={`flex justify-center items-center flex-row font-vagRounded text-white font-medium transition-opacity 
                ${isFocused ? "opacity-0" : "opacity-100"}`} style={{ width: "40%" }}>
                <div className="flex !items-center gap-1 !mb-0">
                <Popover.Root>
  <Popover.Trigger asChild>
    <IoMdInformationCircleOutline className="items-center cursor-pointer mb-[1.5px]" size={12} color="white" />
  </Popover.Trigger>
  
  <Popover.Portal>
    {/* Added sideOffset to give the arrow some breathing room */}
    <Popover.Content 
      sideOffset={5} 
      className="z-50  !rounded-[16px] !border-none glass-button max-w-[120px] p-3 text-white shadow-md !outline-none"
    >
      <div className="items-center flex flex-row font-bold border-b border-white mb-2 pb-1">
        <FaExclamation size={10} />
        <span className="text-[10px]">Notice</span>
      </div>
      <p className="text-[8px]">
        <span className="text-orange-500">Shopee</span> roducts are currently not available.
      </p>

      {/* --- The Arrowhead --- */}
      <Popover.Arrow className="fill-white/50" width={10} height={5} />
    </Popover.Content>
  </Popover.Portal>
</Popover.Root>
                  <p className=" cursor-default mr-2 text-[10px]">Powered by </p>
                </div>
                <div className="flex gap-2">
                  <Image src={lazada} alt="Lazada" width={14} height={24} onClick={() => window.open("https://www.lazada.com.ph/")} />
                  <Image src={shopee} alt="Shopee" width={10} height={16} onClick={() => window.open("https://shopee.ph/")} />
                </div>
              </div>
            </div>
          </div>
          <div onCopy={(e) => e.preventDefault()} onContextMenu={(e) => e.preventDefault()} className="select-none">
            <Footer />
          </div>
        </>
      
      }
    </>
  );
}

export default HomePage;
