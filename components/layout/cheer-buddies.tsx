"use client";

import { useEffect, useState } from "react";
import { BicepsFlexed, Lightbulb, ThumbsUp, type LucideIcon } from "lucide-react";

import { siteConfig } from "@/site.config";
import { cn } from "@/lib/utils";

/* 화면 가장자리에 둥실 떠 있는 응원 친구들 (아이디어 전구, 화이팅 팔, 최고 엄지).
   - 화면에 고정되어 있어서 아래로 내려도 계속 따라옵니다.
   - 스크롤할 때는 살짝 늦게 따라오며 흔들렸다가 제자리로 돌아옵니다.
   - 글자: site.config.ts 의 cheerBuddies */

const icons: Record<string, LucideIcon> = {
  lightbulb: Lightbulb,
  biceps: BicepsFlexed,
  thumbs: ThumbsUp,
};

/* 위치·색·크기 (순서대로). lag = 스크롤할 때 늦게 따라오는 정도 */
const looks = [
  { pos: "right-3 top-24 sm:right-6", color: "bg-orange", size: "size-12 sm:size-16", lag: 0.5, delay: "[animation-delay:-1s]" },
  { pos: "left-3 top-[55%] sm:left-6", color: "bg-pink", size: "size-12 sm:size-16", lag: 0.8, delay: "[animation-delay:-3s]" },
  { pos: "right-3 bottom-8 sm:right-6", color: "bg-teal", size: "size-11 sm:size-14", lag: 0.35, delay: "[animation-delay:-4.5s]" },
];

export function CheerBuddies() {
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    let last = window.scrollY;
    let timer: ReturnType<typeof setTimeout>;
    const onScroll = () => {
      const delta = window.scrollY - last;
      last = window.scrollY;
      setOffset(Math.max(-40, Math.min(40, -delta)));
      clearTimeout(timer);
      timer = setTimeout(() => setOffset(0), 120);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      clearTimeout(timer);
    };
  }, []);

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-40 motion-reduce:hidden">
      {siteConfig.cheerBuddies.map((buddy, i) => {
        const look = looks[i % looks.length];
        const Icon = icons[buddy.icon] ?? Lightbulb;
        return (
          <div
            key={buddy.label}
            className={cn("absolute transition-transform duration-500 ease-out", look.pos)}
            style={{ transform: `translateY(${offset * look.lag}px)` }}
          >
            <div
              className={cn(
                "relative flex animate-float items-center justify-center rounded-full border-4 border-card text-card shadow-pop",
                look.color,
                look.size,
                look.delay,
              )}
            >
              <Icon className="size-1/2" strokeWidth={2.5} />
              <span className="absolute -bottom-3 left-1/2 hidden -translate-x-1/2 whitespace-nowrap rounded-full border-2 border-card bg-card px-2 py-0.5 font-display text-xs text-foreground shadow-pop-sm sm:block">
                {buddy.label}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
