import type { CSSProperties } from "react";
import { Star } from "lucide-react";

import { cn } from "@/lib/utils";

/* 축하 효과: 별이 우수수 쏟아지고 폭죽이 펑펑 터짐 (약 1.8초, 한 번만).
   다시 터뜨리려면 key 를 바꿔서 새로 그리면 됩니다. 부모는 relative 여야 해요.
   - 별: animate-starfall / 폭죽 불꽃: animate-firework (app/globals.css)
   - 색: 사이트 토큰 (orange, pink, sky, primary, teal) */

const starColors = ["fill-orange", "fill-pink", "fill-sky", "fill-primary", "fill-teal"];
const sparkColors = ["bg-orange", "bg-pink", "bg-sky", "bg-primary", "bg-teal"];

/* 떨어지는 별 (가로 위치 %, 늦게 시작하는 시간, 크기) */
const stars = [
  { x: 2, d: 0, s: "size-7" },
  { x: 10, d: 0.25, s: "size-9" },
  { x: 18, d: 0.1, s: "size-6" },
  { x: 26, d: 0.4, s: "size-8" },
  { x: 34, d: 0.05, s: "size-10" },
  { x: 42, d: 0.3, s: "size-7" },
  { x: 50, d: 0.15, s: "size-9" },
  { x: 58, d: 0.45, s: "size-6" },
  { x: 66, d: 0.2, s: "size-8" },
  { x: 74, d: 0.35, s: "size-7" },
  { x: 82, d: 0.1, s: "size-9" },
  { x: 90, d: 0.5, s: "size-6" },
  { x: 96, d: 0.3, s: "size-8" },
  { x: 14, d: 0.6, s: "size-6" },
  { x: 38, d: 0.7, s: "size-7" },
  { x: 62, d: 0.65, s: "size-6" },
  { x: 86, d: 0.75, s: "size-7" },
  { x: 46, d: 0.85, s: "size-5" },
];

/* 폭죽이 터지는 자리 (가로 %, 세로 %, 늦게 시작하는 시간) */
const bursts = [
  { x: 18, y: 16, d: 0 },
  { x: 82, y: 8, d: 0.2 },
  { x: 50, y: 26, d: 0.4 },
  { x: 30, y: 4, d: 0.6 },
  { x: 72, y: 32, d: 0.75 },
];

/* 불꽃 12개가 사방으로 퍼지는 방향 */
const sparks = Array.from({ length: 12 }, (_, i) => {
  const angle = (i / 12) * Math.PI * 2;
  const dist = i % 2 === 0 ? 110 : 75;
  return { dx: `${Math.round(Math.cos(angle) * dist)}px`, dy: `${Math.round(Math.sin(angle) * dist)}px` };
});

export function Celebration({ className }: { className?: string }) {
  return (
    <div aria-hidden className={cn("pointer-events-none absolute inset-0 z-40 motion-reduce:hidden", className)}>
      {stars.map((star, i) => (
        <Star
          key={`star-${i}`}
          className={cn("absolute top-0 animate-starfall text-card opacity-0", star.s, starColors[i % starColors.length])}
          style={{ left: `${star.x}%`, animationDelay: `${star.d}s` }}
          strokeWidth={2}
        />
      ))}

      {bursts.map((b, bi) => (
        <span key={`burst-${bi}`} className="absolute" style={{ left: `${b.x}%`, top: `${b.y}%` }}>
          {/* 가운데 반짝 */}
          <span
            className="absolute -left-6 -top-6 size-12 animate-firework rounded-full border-4 border-card opacity-0 [--dx:0px] [--dy:0px]"
            style={{ animationDelay: `${b.d}s` }}
          />
          {sparks.map((sp, si) => (
            <span
              key={si}
              className={cn(
                "absolute -left-2 -top-2 size-4 animate-firework rounded-full border-2 border-card opacity-0",
                sparkColors[(si + bi) % sparkColors.length],
              )}
              style={{ "--dx": sp.dx, "--dy": sp.dy, animationDelay: `${b.d}s` } as CSSProperties}
            />
          ))}
        </span>
      ))}
    </div>
  );
}
