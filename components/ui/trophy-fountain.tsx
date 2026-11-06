import type { CSSProperties } from "react";
import { Trophy } from "lucide-react";

import { cn } from "@/lib/utils";

/* 성과를 트로피에 담을 때의 축하: 트로피 컵에서 색종이가 분수처럼 솟았다가 흩날리고,
   컵 둘레로 빛 고리가 퍼지며, 위로 "+1" 말풍선이 떠오름 (약 2초, 한 번만).
   실천 레이스의 별·폭죽과는 다른 모양이에요.
   - 색종이: animate-fountain (--dx 옆으로, --peak 위로 솟는 높이, --rot 회전)
   - 빛 고리: animate-shine / 말풍선: animate-labelpop
   - 다시 터뜨리려면 key 를 바꿔서 새로 그리면 됩니다. 부모는 relative 여야 해요. */

const colors = ["bg-pink", "bg-sky", "bg-orange", "bg-teal", "bg-primary", "bg-yellow"];

/* 색종이 조각 (옆으로 퍼지는 정도, 솟는 높이, 회전, 늦게 출발, 모양) */
const pieces = Array.from({ length: 26 }, (_, i) => {
  const side = i % 2 === 0 ? 1 : -1;
  const spread = 20 + ((i * 37) % 120);
  return {
    dx: `${side * spread}px`,
    peak: `${-(150 + ((i * 53) % 110))}px`,
    rot: `${(i % 3 === 0 ? -1 : 1) * (360 + ((i * 71) % 360))}deg`,
    delay: `${(i % 6) * 0.06}s`,
    shape: i % 3 === 0 ? "h-2 w-4 rounded-sm" : i % 3 === 1 ? "size-2.5 rounded-full" : "h-3.5 w-1.5 rounded-full",
    color: colors[i % colors.length],
  };
});

export function TrophyFountain({ label, className }: { label: string; className?: string }) {
  return (
    <div aria-hidden className={cn("pointer-events-none absolute inset-0 z-40 motion-reduce:hidden", className)}>
      {/* 컵 둘레로 퍼지는 빛 고리 2겹 */}
      <span className="absolute left-1/2 top-[44%] size-40 animate-shine rounded-full border-[6px] border-orange/70 opacity-0" />
      <span className="absolute left-1/2 top-[44%] size-40 animate-shine rounded-full border-4 border-pink/60 opacity-0 [animation-delay:0.25s]" />

      {/* 컵에서 솟는 색종이 */}
      <span className="absolute left-1/2 top-[40%]">
        {pieces.map((p, i) => (
          <span
            key={i}
            className={cn("absolute animate-fountain border border-line opacity-0", p.shape, p.color)}
            style={{ "--dx": p.dx, "--peak": p.peak, "--rot": p.rot, animationDelay: p.delay } as CSSProperties}
          />
        ))}
      </span>

      {/* 떠오르는 +1 말풍선 */}
      <span className="absolute inset-x-0 top-[6%] flex justify-center">
        <span className="flex animate-labelpop items-center gap-1.5 whitespace-nowrap rounded-full border-[2.5px] border-line bg-orange px-4 py-1.5 font-display text-xl text-card opacity-0 shadow-pop [animation-delay:0.15s]">
          <Trophy className="size-5" strokeWidth={2.5} />
          {label}
        </span>
      </span>
    </div>
  );
}
