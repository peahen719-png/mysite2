"use client";

import { useEffect, useState } from "react";

import { cn } from "@/lib/utils";

/* 캐릭터 — 말랑한 찹쌀떡 토끼.
   - Buddy      : 캐릭터 그림만 (실천 레이스 말로도 씀)
   - Mascot     : 통통 튀면서(animate-bob) 손을 흔들고(animate-wave), 옆 말풍선의 글이 몇 초마다 바뀜
   - tone       : 몸 색 ("primary" 보라, "sky" 하늘, "pink" 분홍)
   - side       : 말풍선이 캐릭터의 어느 쪽에 있을지 ("left" 면 말풍선이 왼쪽)
   움직임 줄이기 설정을 켠 컴퓨터에서는 멈춰 있음 */

type Tone = "primary" | "sky" | "pink";

const tones: Record<Tone, { body: string; ear: string }> = {
  primary: { body: "fill-primary/80", ear: "fill-pink" },
  sky: { body: "fill-sky", ear: "fill-pink" },
  pink: { body: "fill-pink", ear: "fill-yellow" },
};

/** 캐릭터 그림 (가로:세로 = 100:110) */
export function Buddy({ tone = "primary", wave = false, className }: { tone?: Tone; wave?: boolean; className?: string }) {
  const t = tones[tone];
  return (
    <svg viewBox="0 0 100 110" className={cn("block w-full overflow-visible", className)} aria-hidden>
      {/* 바닥 그림자 */}
      <ellipse cx="50" cy="104" rx="30" ry="4.5" className="fill-foreground/10" />
      {/* 귀 */}
      <g className="stroke-card" strokeWidth="4">
        <path d="M30 40 C22 18 26 4 34 6 C42 8 44 24 42 40 Z" className={t.body} />
        <path d="M70 40 C78 18 74 4 66 6 C58 8 56 24 58 40 Z" className={t.body} />
      </g>
      <path d="M33 34 C29 22 31 13 34 13 C37 14 39 24 38 34 Z" className={t.ear} />
      <path d="M67 34 C71 22 69 13 66 13 C63 14 61 24 62 34 Z" className={t.ear} />
      {/* 몸: 동글납작한 찹쌀떡 */}
      <path
        d="M50 34 C78 34 92 54 92 74 C92 94 74 102 50 102 C26 102 8 94 8 74 C8 54 22 34 50 34 Z"
        className={cn(t.body, "stroke-card")}
        strokeWidth="4"
      />
      {/* 손 (wave 면 흔들흔들) */}
      <g className="stroke-card" strokeWidth="3">
        <ellipse cx="9" cy="80" rx="8" ry="7" className={cn(t.body, wave && "origin-[16px_80px] animate-wave motion-reduce:animate-none")} />
        <ellipse cx="91" cy="80" rx="8" ry="7" className={cn(t.body, wave && "origin-[84px_80px] animate-wave [animation-direction:alternate-reverse] motion-reduce:animate-none")} />
      </g>
      {/* 반짝 윤기 */}
      <ellipse cx="30" cy="50" rx="8" ry="4" transform="rotate(-25 30 50)" className="fill-card/60" />
      {/* 눈: 크고 반짝반짝 */}
      <g className="fill-foreground">
        <ellipse cx="36" cy="68" rx="6" ry="7" />
        <ellipse cx="64" cy="68" rx="6" ry="7" />
      </g>
      <circle cx="38" cy="65.5" r="2.4" className="fill-card" />
      <circle cx="66" cy="65.5" r="2.4" className="fill-card" />
      <circle cx="34.5" cy="71" r="1" className="fill-card" />
      <circle cx="62.5" cy="71" r="1" className="fill-card" />
      {/* 볼 */}
      <ellipse cx="25" cy="80" rx="7" ry="4" className="fill-red/60" />
      <ellipse cx="75" cy="80" rx="7" ry="4" className="fill-red/60" />
      {/* 입: ω */}
      <path d="M44 78 Q47 82 50 78 Q53 82 56 78" className="fill-none stroke-foreground" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function Mascot({
  messages,
  side = "left",
  tone = "primary",
  className,
}: {
  messages: string[];
  side?: "left" | "right";
  tone?: Tone;
  className?: string;
}) {
  const [i, setI] = useState(0);

  useEffect(() => {
    if (messages.length < 2) return;
    const timer = setInterval(() => setI((n) => (n + 1) % messages.length), 3200);
    return () => clearInterval(timer);
  }, [messages.length]);

  return (
    <div className={cn("pointer-events-none flex items-end gap-1", side === "right" && "flex-row-reverse", className)} aria-live="polite">
      {/* 말풍선 */}
      <p
        key={i}
        className="relative mb-12 max-w-[11rem] rounded-2xl border-4 border-card bg-card px-3 py-2 font-display text-sm leading-snug text-foreground shadow-pop-sm animate-in fade-in zoom-in-90 duration-300"
      >
        {messages[i]}
        <span
          aria-hidden
          className={cn(
            "absolute -bottom-2.5 size-4 rotate-45 border-b-4 border-r-4 border-card bg-card",
            side === "left" ? "right-4" : "left-4",
          )}
        />
      </p>

      {/* 캐릭터 */}
      <div className="w-20 shrink-0 animate-bob motion-reduce:animate-none sm:w-24">
        <Buddy tone={tone} wave />
      </div>
    </div>
  );
}
