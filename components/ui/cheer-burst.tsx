import type { CSSProperties } from "react";
import { Heart } from "lucide-react";

import { cn } from "@/lib/utils";

/* 마우스를 올리면(부모에 group 클래스 필요) 글자가 한 자씩 튀어나와 크게 펼쳐졌다가 사라지고,
   마지막에 하트가 뿅뿅 터지는 효과. 약 3초.
   - 글자: animate-burst (한 자씩 조금씩 늦게 시작)
   - 하트: animate-heartpop (--dx, --dy 방향으로 퍼짐)
   - 움직임 줄이기 설정을 켠 컴퓨터에서는 나타나지 않음 */

const hearts = [
  { dx: "-150px", dy: "-70px", color: "fill-pink", size: "size-8" },
  { dx: "150px", dy: "-80px", color: "fill-primary", size: "size-7" },
  { dx: "-190px", dy: "30px", color: "fill-orange", size: "size-6" },
  { dx: "190px", dy: "25px", color: "fill-pink", size: "size-9" },
  { dx: "-60px", dy: "-120px", color: "fill-sky", size: "size-6" },
  { dx: "70px", dy: "-115px", color: "fill-pink", size: "size-7" },
  { dx: "0px", dy: "90px", color: "fill-primary", size: "size-6" },
];

export function CheerBurst({ text }: { text: string }) {
  return (
    <span
      aria-hidden
      className="pointer-events-none absolute left-1/2 top-1/2 z-30 -translate-x-1/2 -translate-y-1/2 motion-reduce:hidden"
    >
      {/* 글자 (점점 넓게 펼쳐짐) */}
      <span className="flex whitespace-nowrap font-display text-5xl text-pink [-webkit-text-stroke:7px_var(--card)] [paint-order:stroke_fill] [text-shadow:0_6px_0_color-mix(in_oklab,var(--foreground)_18%,transparent)] group-hover:animate-spread lg:text-6xl">
        {Array.from(text).map((char, i) => (
          <span
            key={i}
            className={cn("inline-block opacity-0 group-hover:animate-burst", char === " " && "w-[0.3em]")}
            style={{ animationDelay: `${i * 0.05}s` }}
          >
            {char}
          </span>
        ))}
      </span>

      {/* 마지막에 뿅뿅 터지는 하트 */}
      {hearts.map((h, i) => (
        <Heart
          key={i}
          className={cn(
            "absolute left-1/2 top-1/2 -ml-4 -mt-4 text-card opacity-0 group-hover:animate-heartpop",
            h.color,
            h.size,
          )}
          style={{ "--dx": h.dx, "--dy": h.dy, animationDelay: `${i * 0.04}s` } as CSSProperties}
          strokeWidth={2.5}
        />
      ))}
    </span>
  );
}
