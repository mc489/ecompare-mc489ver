import { Popover } from "radix-ui";
import { HiSparkles } from "react-icons/hi2";
import axios from "axios";
import { React, useState } from "react";
import { toast } from "sonner";
import { VscLoading } from "react-icons/vsc";
import ReactMarkdown from "react-markdown";import { useMediaQuery } from 'react-responsive';
function PopoverDemo({
  compareId,
  results,
  aiReply,
  setAiReply,
  aiLoading,
  setAiLoading,
}) {
  async function AI() {
    try {
      if (aiLoading || aiReply) return;
      setAiLoading(true);
      const res = await axios.post("/api/recommendation", {
        comparisonId: compareId,
        reply: results,
      });
      setAiReply(res.data.message);
    } catch (error) {
      toast.error(`${error}`);
    } finally {
      setAiLoading(false);
    }
  }
const isDesktopOrLaptop = useMediaQuery({ query: '(min-width: 700px)' });

    const isTabletOrMobile = useMediaQuery({ query: '(max-width: 699px)' });
  return (
    <>
{isDesktopOrLaptop &&
    <>
      <Popover.Root>
        <Popover.Trigger asChild>
          <button
            onClick={AI}
            className={` text-center text-white mr-20  text-[20px] rounded-full font-bold w-[220px] h-[52px] compare-button flex  flex-row justify-center items-center font-vagRounded cursor-pointer`}
          >
            <HiSparkles className="text-2xl text-white" />
            AI Recomendation
          </button>
        </Popover.Trigger>
        <Popover.Portal>
          <Popover.Content
            className="glass-button1 text-white z-90 !w-[260px] rounded shadow-[0_10px_38px_-10px_hsla(206,22%,7%,.35),0_10px_20px_-15px_hsla(206,22%,7%,.2)] will-change-[transform,opacity] focus:shadow-[0_10px_38px_-10px_hsla(206,22%,7%,.35),0_10px_20px_-15px_hsla(206,22%,7%,.2),0_0_0_2px_theme(colors.violet7)] data-[state=open]:data-[side=bottom]:animate-slideUpAndFade data-[state=open]:data-[side=left]:animate-slideRightAndFade data-[state=open]:data-[side=right]:animate-slideLeftAndFade data-[state=open]:data-[side=top]:animate-slideDownAndFade"
            sideOffset={5}
            side="top"
          >
            <div className="min-h-96 flex flex-col justify-center items-center gap-2.5 px-10 py-5">
              {aiLoading ? (
                <VscLoading className="animate-spin text-white text-4xl" />
              ) : (
                <>
                  <p className="mb-2.5  text-[15px] font-medium leading-[19px]">
                    AI Recommendations
                  </p>
                  <div className="text-center text-sm whitespace-pre-wrap">
                    <ReactMarkdown>{aiReply}</ReactMarkdown>
                  </div>
                </>
              )}
            </div>

            <Popover.Arrow
              className="fill-white drop-shadow-md"
              width={15}
              height={8}
            />
          </Popover.Content>
        </Popover.Portal>
      </Popover.Root>
    </>
    }
    {isTabletOrMobile &&
    <>
      <Popover.Root>
        <Popover.Trigger asChild>
          <button
            onClick={AI}
            className={` text-center text-white mr-3 text-[14px]   !rounded-[12px] 
              font-bold w-[160px] h-[40px] compare-button flex  flex-row justify-center items-center font-vagRounded cursor-pointer`}
          >
            <HiSparkles className="text-[12px] text-white" />
            AI Recomendation
          </button>
        </Popover.Trigger>
        <Popover.Portal>
          <Popover.Content
            className="glass-button1 text-white z-90 !w-[260px] rounded shadow-[0_10px_38px_-10px_hsla(206,22%,7%,.35),0_10px_20px_-15px_hsla(206,22%,7%,.2)] will-change-[transform,opacity] focus:shadow-[0_10px_38px_-10px_hsla(206,22%,7%,.35),0_10px_20px_-15px_hsla(206,22%,7%,.2),0_0_0_2px_theme(colors.violet7)] data-[state=open]:data-[side=bottom]:animate-slideUpAndFade data-[state=open]:data-[side=left]:animate-slideRightAndFade data-[state=open]:data-[side=right]:animate-slideLeftAndFade data-[state=open]:data-[side=top]:animate-slideDownAndFade"
            sideOffset={5}
            side="top"
          >
            <div className="min-h-96 flex flex-col justify-center items-center gap-2.5 px-10 py-5">
              {aiLoading ? (
                <VscLoading className="animate-spin text-white text-4xl" />
              ) : (
                <>
                  <p className="mb-2.5  text-[15px] font-medium leading-[19px]">
                    AI Recommendations
                  </p>
                  <div className="text-center text-sm whitespace-pre-wrap">
                    <ReactMarkdown>{aiReply}</ReactMarkdown>
                  </div>
                </>
              )}
            </div>

            <Popover.Arrow
              className="fill-white drop-shadow-md"
              width={15}
              height={8}
            />
          </Popover.Content>
        </Popover.Portal>
      </Popover.Root>
    </>
    }
     </>
  );
}

export default PopoverDemo;
