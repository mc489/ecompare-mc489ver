import React from "react";
import { Skeleton } from "@/components/ui/skeleton";

import { useMediaQuery } from 'react-responsive';



function SkeletonResult() {
   const isDesktopOrLaptop = useMediaQuery({ query: '(min-width: 700px)' });
      
        const isTabletOrMobile = useMediaQuery({ query: '(max-width: 699px)' });
  return (
    <>

    {isDesktopOrLaptop &&
    <>
      {Array.from({ length: 12 }).map((_, i) => (
        <Skeleton key={i} className="h-[300px] rounded-2xl" />
      ))}
</>
    }

       {isTabletOrMobile&&
    <>
      {Array.from({ length: 12 }).map((_, i) => (
        <Skeleton key={i} className="h-[220px] rounded-2xl" />
      ))}
</>
    }
    </>
  );
}

export default SkeletonResult;
