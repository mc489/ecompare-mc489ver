"use client";
import { cn } from "@/lib/utils";
import axios from "axios";
import React, { useEffect, useRef, useState } from "react";
import { FaRegHeart, FaHeart, FaStar } from "react-icons/fa";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

import { useMediaQuery } from 'react-responsive';
function Card({
  products,
  showCompare,
  isSelected,
  onToggle,
  isDisabled,
  onLongPress,
  isLiked,
  onLikeToggle,
}) {
  const { isSignedIn } = useUser();
  const router = useRouter();
  const pressTimer = useRef(null);
  const [isPressed, setIsPressed] = useState(false);
  const [liked, setLiked] = useState(isLiked);

    const isDesktopOrLaptop = useMediaQuery({ query: '(min-width: 700px)' });

    const isTabletOrMobile = useMediaQuery({ query: '(max-width: 699px)' });
  useEffect(() => {
    if (showCompare && pressTimer.current) {
      clearTimeout(pressTimer.current);
      pressTimer.current = null;
      setIsPressed(false);
    }
  }, [showCompare]);

  const handlePressStart = (e) => {
    e.preventDefault();
    setIsPressed(true);
    pressTimer.current = setTimeout(() => {
      if (onLongPress) onLongPress(products.id);
      setIsPressed(false);
    }, 500);
  };

  const handlePressEnd = () => {
    setIsPressed(false);
    if (pressTimer.current) {
      clearTimeout(pressTimer.current);
      pressTimer.current = null;
    }
  };

  const handleLike = async (e) => {
    e.stopPropagation();
    const newLiked = !liked;
    setLiked(newLiked);
    onLikeToggle(newLiked);

    if (!isSignedIn) {
      router.push("/sign-in");
      return;
    }

    try {
      if (newLiked) {
        await axios.post("/api/likes", {
          snapshot: {
            id: products.id,
            source: products.source,
            name: products.name,
            merchant: products.merchant,
            image: products.image,
            price: products.price,
            link: products.link,
          },
        });
        console.log("❤️ Like saved!");
      } else {
        await axios.delete(`/api/likes`, {
          data: { product_id: products.id },
        });
        console.log("Like removed!");
      }
    } catch (error) {
      console.error("Error saving like:", error);
      setLiked(!newLiked); // revert UI if failed
      onLikeToggle(!newLiked);
    }
  };

  return (
    <>
    
  {isDesktopOrLaptop &&
    <>
    <div
      className={cn(
       "flex flex-col w-full glass-button  rounded-2xl p-4 gap-3 relative cursor-pointer transition-all duration-150 ",
    showCompare && "z-30",
        isDisabled && "opacity-50",
        isPressed && "scale-95"
      )}
      onMouseDown={!showCompare ? handlePressStart : undefined}
      onMouseUp={!showCompare ? handlePressEnd : undefined}
      onMouseLeave={!showCompare ? handlePressEnd : undefined}
      onTouchStart={!showCompare ? handlePressStart : undefined}
      onTouchEnd={!showCompare ? handlePressEnd : undefined}
      onTouchCancel={!showCompare ? handlePressEnd : undefined}
       onClick={() => {
    if (showCompare && !isDisabled) {
      onToggle?.();
    } else if (!showCompare && !isDisabled) {
      // Redirect logic
      if (products?.source === "Shopee" && products?.link) {
        window.open(products.link, "_blank");
      } else if (products?.source === "Lazada" && products?.link) {
        window.open(products.link, "_blank");
      }
    }
  }}
>
      {/* Header Section */}
      <div className="flex justify-center items-start">
        <div className="flex flex-col flex-1 min-w-0">
          <p className="text-xl font-bold text-white truncate">
            {products.name}
          </p>
          <p className="text-white text-[14px] truncate">
            {products.merchant || "merchant"}
          </p>
        </div>

     {showCompare ? (
  <input
    type="checkbox"
    className="glass-checkbox cursor-pointer"
    checked={isSelected}
    onChange={(e) => {
      e.stopPropagation(); 
      onToggle(e);
    }}
    onClick={(e) => e.stopPropagation()} 
    disabled={isDisabled && !isSelected}
  />
) : (
          <button
            type="button"
            onClick={handleLike}
            className="transition-transform hover:scale-110"
          >
            {liked ? (
              <FaHeart className="text-2xl text-red-500" />
            ) : (
              <FaRegHeart className="text-2xl text-white" />
            )}
          </button>
        )}
      </div>

      {/* Image Section */}
      <div className="flex items-center justify-center">
        <img
          className="w-full aspect-square object-cover pointer-events-none rounded-xl"
          src={products.image}
          alt={products.name}
        />
      </div>

      {/* Price and Button */}
      <div className="flex justify-between items-center ml-2">
        <div className="flex flex-col items-start">
          <p className="text-white text-xl font-medium">₱ {products.price}</p>
          <div className="flex items-center">
            <p className="text-white/90 text-md">
              {products.rating}
              <span className="text-transparent">_</span>
            </p>
            <FaStar className="text-lg text-gray-200" />{" "}
          </div>
        </div>
        <Link href={products.link} target="_blank">
          <button className="flex justify-center items-center gap-2 w-[116px] h-[44px] text-[16px] compare-button text-white rounded-2xl hover:opacity-80 transition-opacity">
            Buy Now
            <Image
              alt = ""
              width={"20"}
              height={"20"}
              src={products.source == "Shopee" ? "/shopee.svg" : "/lazada.svg"}
            />
          </button>
        </Link>
      </div>
    </div>
    </>
    }
    {isTabletOrMobile &&
    <>
    <div
      className={cn(
       "flex flex-col w-full glass-button  rounded-2xl p-4 gap-3 relative cursor-pointer transition-all duration-150 ",
    showCompare && "z-30",
        isDisabled && "opacity-50",
        isPressed && "scale-95"
      )}
      onMouseDown={!showCompare ? handlePressStart : undefined}
      onMouseUp={!showCompare ? handlePressEnd : undefined}
      onMouseLeave={!showCompare ? handlePressEnd : undefined}
      onTouchStart={!showCompare ? handlePressStart : undefined}
      onTouchEnd={!showCompare ? handlePressEnd : undefined}
      onTouchCancel={!showCompare ? handlePressEnd : undefined}
       onClick={() => {
    if (showCompare && !isDisabled) {
      onToggle?.();
    } else if (!showCompare && !isDisabled) {
      // Redirect logic
      if (products?.source === "Shopee" && products?.link) {
        window.open(products.link, "_blank");
      } else if (products?.source === "Lazada" && products?.link) {
        window.open(products.link, "_blank");
      }
    }
  }}
>
      {/* Header Section */}
      <div className="flex justify-center items-start">
        <div className="flex flex-col flex-1 min-w-0">
          <p className="text-[12px] font-bold text-white truncate">
            {products.name}
          </p>
          <p className="text-white text-[8px] text-left truncate">
            {products.merchant || "merchant"}
          </p>
        </div>

     {showCompare ? (
  <input
    type="checkbox"
    className="glass-checkbox cursor-pointer"
    checked={isSelected}
    onChange={(e) => {
      e.stopPropagation(); 
      onToggle(e);
    }}
    onClick={(e) => e.stopPropagation()} 
    disabled={isDisabled && !isSelected}
  />
) : (
          <button
            type="button"
            onClick={handleLike}
            className="transition-transform hover:scale-110"
          >
            {liked ? (
              <FaHeart className="text-[14px] text-red-500" />
            ) : (
              <FaRegHeart className="text-[14px] text-white" />
            )}
          </button>
        )}
      </div>

      {/* Image Section */}
      <div className="flex items-center justify-center">
        <img
          className="w-full aspect-square object-cover pointer-events-none rounded-xl"
          src={products.image}
          alt={products.name}
        />
      </div>

      {/* Price and Button */}
      <div className="flex justify-between items-center ml-">
        <div className="flex flex-col items-start">
          <p className="text-white text-[12px] font-medium">₱ {products.price}</p>
        
          <div className="flex items-center gap-1">
              <FaStar className="text-[8px] text-gray-200" />{" "}
            <p className="text-white/90 text-[10px]">
              {products.rating}
              <span className="text-transparent">_</span>
            </p>
          
          </div>
       
        </div>
        <Link href={products.link} target="_blank">
          <button className="whitespace-nowrap flex justify-center items-center 
          gap-2 w-[69px] h-[28px] 
          text-[8px] compare-button text-white rounded-[16px] hover:opacity-80 transition-opacity">
            Buy Now
            <Image
              alt = ""
              width={"12"}
              height={"12"}
              src={products.source == "Shopee" ? "/shopee.svg" : "/lazada.svg"}
            />
          </button>
        </Link>
      </div>
    </div>
    </>}
    </> 
  );
}

export default Card;
