import type { CSSProperties } from "react";
import { BicepsFlexed, Rocket, ThumbsUp, type LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";

/* 실천 레이스에서 결과를 표시할 때 팡팡 튀어나오는 응원 말풍선 (약 1.8초, 한 번만).
   - done(성공): 엄지 + "최고야!"
   - hold(보류): 팔근육 + "화이팅!"
   - retry(재도전): 로켓 + "다시 해보자!"
   - 가운데 큰 말풍선(animate-labelpop) + 사방으로 터지는 작은 아이콘(animate-emojipop)
   - 다시 터뜨리려면 key 를 바꿔서 새로 그리면 됩니다. 부모는 relative 여야 해요. */

const looks: Record<string, { Icon: LucideIcon; bg: string; ink: string }> = {
  done: { Icon: ThumbsUp, bg: "bg-red", ink: "text-red-deep" },
  hold: { Icon: BicepsFlexed, bg: "bg-yellow", ink: "text-yellow-deep" },
  retry: { Icon: Rocket, bg: "bg-green", ink: "text-green-deep" },
};

/* 작은 아이콘이 날아갈 방향 */
const pops = [
  { dx: "-70px", dy: "-55px" },
  { dx: "70px", dy: "-60px" },
  { dx: "-95px", dy: "5px" },
  { dx: "95px", dy: "0px" },
  { dx: "-55px", dy: "55px" },
  { dx: "60px", dy: "55px" },
  { dx: "0px", dy: "-85px" },
];

export function StatusBurst({ kind, text }: { kind: string; text: string }) {
  const look = looks[kind];
  if (!look) return null;
  const { Icon } = look;

  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 z-40 flex items-center justify-center motion-reduce:hidden">
      {pops.map((p, i) => (
        <span
          key={i}
          className={cn(
            "absolute flex size-9 animate-emojipop items-center justify-center rounded-full border-2 border-card opacity-0 shadow-pop-sm",
            look.bg,
          )}
          style={{ "--dx": p.dx, "--dy": p.dy, animationDelay: `${0.08 + i * 0.05}s` } as CSSProperties}
        >
          <Icon className={cn("size-5", look.ink)} strokeWidth={2.5} />
        </span>
      ))}
      <span
        className={cn(
          "relative flex animate-labelpop items-center gap-1.5 whitespace-nowrap rounded-full border-4 border-card px-4 py-2 font-display text-lg text-foreground opacity-0 shadow-pop sm:text-2xl",
          look.bg,
        )}
      >
        <Icon className={cn("size-6 sm:size-7", look.ink)} strokeWidth={2.5} />
        {text}
      </span>
    </div>
  );
}
