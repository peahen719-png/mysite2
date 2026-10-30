"use client";

import { useEffect, useState } from "react";

import { cn } from "@/lib/utils";

/** 지금 시각을 보여주는 아날로그 시계. 1초마다 초침이 움직입니다.
    색은 디자인 토큰(card, foreground, primary, pink)을 씁니다. */
export function AnalogClock({ className }: { className?: string }) {
  // 처음 화면을 그릴 때는 시각을 모르므로 바늘을 숨겼다가, 브라우저에서 시각을 읽은 뒤 보여줌
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    const tick = () => setNow(new Date());
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  const seconds = now ? now.getSeconds() : 0;
  const minutes = now ? now.getMinutes() + seconds / 60 : 0;
  const hours = now ? (now.getHours() % 12) + minutes / 60 : 0;

  return (
    <svg
      viewBox="0 0 100 100"
      role="img"
      aria-label={now ? `현재 시각 ${now.getHours()}시 ${now.getMinutes()}분` : "시계"}
      className={cn("drop-shadow-sm", className)}
    >
      {/* 시계판 */}
      <circle cx="50" cy="50" r="46" className="fill-card stroke-primary" strokeWidth="5" />

      {/* 눈금 12개 (3·6·9·12시는 길게) */}
      {Array.from({ length: 12 }, (_, i) => (
        <line
          key={i}
          x1="50"
          y1={i % 3 === 0 ? 12 : 14}
          x2="50"
          y2="20"
          transform={`rotate(${i * 30} 50 50)`}
          className="stroke-foreground/70"
          strokeWidth={i % 3 === 0 ? 4 : 2.5}
          strokeLinecap="round"
        />
      ))}

      {now ? (
        <>
          {/* 시침 */}
          <line
            x1="50" y1="50" x2="50" y2="29"
            transform={`rotate(${hours * 30} 50 50)`}
            className="stroke-foreground"
            strokeWidth="6"
            strokeLinecap="round"
          />
          {/* 분침 */}
          <line
            x1="50" y1="50" x2="50" y2="19"
            transform={`rotate(${minutes * 6} 50 50)`}
            className="stroke-primary"
            strokeWidth="4.5"
            strokeLinecap="round"
          />
          {/* 초침 */}
          <line
            x1="50" y1="58" x2="50" y2="16"
            transform={`rotate(${seconds * 6} 50 50)`}
            className="stroke-pink"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </>
      ) : null}

      {/* 가운데 점 */}
      <circle cx="50" cy="50" r="4.5" className="fill-pink" />
    </svg>
  );
}
