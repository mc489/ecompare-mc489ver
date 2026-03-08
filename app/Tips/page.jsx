"use client" 
import {  useRouter } from "next/navigation";
import { FaMagnifyingGlass, FaExclamation } from "react-icons/fa6";
import { FaSearch } from "react-icons/fa";
import { FaBalanceScaleLeft } from "react-icons/fa";
import { TbShoppingCartHeart } from "react-icons/tb";
import { useMediaQuery } from 'react-responsive';


function Tips (){
     const router = useRouter();
     const handleTipsClick = () => {
    router.push("/"); 
  };
  
const isDesktopOrLaptop = useMediaQuery({ query: '(min-width: 700px)' });

  const isTabletOrMobile = useMediaQuery({ query: '(max-width: 699px)' });
    return(
<>
{isDesktopOrLaptop&&
<>
<div className="px-13 flex flex-col gap-15  text-white whitespace  ">
<h1
          onClick={handleTipsClick}
            className="mt-5 relative text-[16px] font-vagRounded font-bold cursor-pointer group text-white w-fit"
          >
            Go to home
            <span className="absolute left-1/2 bottom-0 h-[2px] 
            w-0 bg-white transition-all duration-300 group-hover:w-full group-hover:left-0"></span>
          </h1>


          <div className="flex flex-col items-center justify-center ">
<span className="text-[50px] font-baloo font-semibold "> Finding the Best Deals Just Got Easier.</span>
<span className="text-[16px] font-vagrounded mb-10 ">Search. Compare. Save. You’re just a few clicks away from being a smarter buyer.</span>
<button   onClick={handleTipsClick} className="search-button  !backdrop-blur-lg px-10 !h-[50px] !rounded-[16px]">

  Compare Now
</button>



<div className="flex  mt-25 flex-row gap-40   justify-between">

<div className="flex flex-col items-center ">
    <FaMagnifyingGlass className=" mb-5 text-white text-[64px]" />
<span className="text-[20px] font-semibold">Step 1: Search</span>
<span className="text-[14px] w-[200px] text-justify">Enter any product. We scan Lazada and Shopee to find your best matches instantly.</span>
</div>
<div className="flex flex-col items-center">
  <FaBalanceScaleLeft  className=" mb-5 text-white text-[64px]"/>
<span className="text-[20px] font-semibold">Step 2: Compare</span> 
<span className="text-[14px] w-[200px] text-justify   ">View prices and ratings side-by-side. No more switching tabs just the best deals in one view.</span>
</div>
<div className="flex flex-col items-center">
  <TbShoppingCartHeart className=" mb-5 text-white text-[64px]"/>
<span className="text-[20px] font-semibold">Step 3: Save</span> 
<span className="text-[14px] w-[200px] text-justify ">Save your top picks for later or click to redirect straight to the store and grab the deal.</span>
</div>


</div>

</div>


</div>
</>
}

{isTabletOrMobile &&
<>
<div  onCopy={(e) => e.preventDefault()} onContextMenu={(e) => e.preventDefault()}      className="select-none 
px-10 py-8 flex flex-col gap-10  text-white whitespace  ">
<h1
    onClick={handleTipsClick}
            className="  mt-5 relative text-[16px] font-vagRounded font-bold cursor-pointer group text-white w-fit"
          >
            Go to home
            <span className="absolute left-1/2 bottom-0 h-[2px] 
            w-0 bg-white transition-all duration-300 group-hover:w-full group-hover:left-0"></span>
          </h1>


          <div className="flex flex-col items-center justify-center ">
<span className="text-[24px] font-baloo font-semibold "> Finding the Best Deals Just Got Easier.</span>
<span className="text-[12px] font-vagrounded mb-10 ">Search. Compare. Save. You’re just a few clicks away from being a smarter buyer.</span>
<button   onClick={handleTipsClick} className="search-button text-[16px] !backdrop-blur-lg px-10 !h-[42px] !rounded-[16px]">

  Compare Now
</button>



<div className="flex flex-col mt-25 gap-20 mb-20">

<div className="flex flex-col items-center ">
    <FaMagnifyingGlass className=" mb-5 text-white text-[50px]" />
<span className="text-[14px] font-semibold">Step 1: Search</span>
<span className="text-[8px] w-[150px] text-justify">Enter any product. We scan Lazada and Shopee to find your best matches instantly.</span>
</div>
<div className="flex flex-col items-center">
  <FaBalanceScaleLeft  className=" mb-5 text-white text-[50px]"/>
<span className="text-[14px] font-semibold">Step 2: Compare</span> 
<span className="text-[8px] w-[150px] text-justify ">View prices and ratings side-by-side. No more switching tabs just the best deals in one view.</span>
</div>
<div className="flex flex-col items-center">
  <TbShoppingCartHeart className=" mb-5 text-white text-[50px]"/>
<span className="text-[14px] font-semibold">Step 3: Save</span> 
<span className="text-[8px] w-[150px] text-justify ">Save your top picks for later or click to redirect straight to the store and grab the deal.</span>
</div>


</div>

</div>


</div>
</>
}
  </>
  
  )
}
export default Tips;