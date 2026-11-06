"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

import { siteConfig } from "@/site.config";
import { cn } from "@/lib/utils";
import { useFrameIndex } from "@/components/ui/living-picture";

/* 캐릭터 — 한옥 도서관을 지키는 사모예드 선비.
   그림은 site.config.ts 의 libraryFrames (장면 5장). 동그란 액자 안에 사모예드 얼굴만 확대해 보여주고,
   첫 화면처럼 장면이 천천히 겹쳐 바뀌어서 웃고 책장을 넘기는 듯 움직임.
   - Buddy  : 동그란 액자 속 캐릭터 (실천 레이스 말로도 씀)
   - Mascot : 통통 튀는 캐릭터 + 옆 말풍선 (글이 몇 초마다 바뀜, 말풍선 꼬리는 캐릭터 쪽을 가리킴)
   - side   : 말풍선이 캐릭터의 어느 쪽에 있을지 ("left" 면 말풍선이 왼쪽)
   움직임 줄이기 설정을 켠 컴퓨터에서는 멈춰 있음 */

const ZOOM = 1.6;

/** 동그란 액자 속 사모예드 */
export function Buddy({ className }: { className?: string }) {
  const frames = siteConfig.libraryFrames;
  const current = useFrameIndex(frames.length);
  return (
    <div
      className={cn(
        "relative aspect-square w-full overflow-hidden rounded-full border-[2.5px] border-line bg-card shadow-pop-sm",
        className,
      )}
    >
      {frames.map((f, k) => (
        <Image
          key={f.src}
          src={f.src}
          alt=""
          fill
          sizes="320px"
          className={cn("object-cover transition-opacity duration-[2200ms] ease-in-out", k === current ? "opacity-100" : "opacity-0")}
          style={{
            objectPosition: `${f.face[0]}% ${f.face[1]}%`,
            transform: `scale(${ZOOM})`,
            transformOrigin: `${f.face[0]}% ${f.face[1]}%`,
          }}
        />
      ))}
      {/* 액자 안쪽 은은한 빛 */}
      <span aria-hidden className="absolute inset-0 rounded-full shadow-[inset_0_0_0_3px_color-mix(in_oklab,var(--card)_70%,transparent)]" />
    </div>
  );
}

export function Mascot({
  messages,
  side = "left",
  className,
}: {
  messages: string[];
  side?: "left" | "right";
  className?: string;
}) {
  const [i, setI] = useState(0);

  useEffect(() => {
    if (messages.length < 2) return;
    const timer = setInterval(() => setI((n) => (n + 1) % messages.length), 3200);
    return () => clearInterval(timer);
  }, [messages.length]);

  return (
    <div className={cn("pointer-events-none flex items-end gap-2", side === "right" && "flex-row-reverse", className)} aria-live="polite">
      {/* 말풍선 */}
      <p
        key={i}
        className="relative mb-8 max-w-[11rem] rounded-2xl border-[2.5px] border-line bg-card px-3 py-2 font-display text-sm leading-snug text-foreground shadow-pop-sm animate-in fade-in zoom-in-90 duration-300"
      >
        {messages[i]}
        <span
          aria-hidden
          className={cn(
            "absolute bottom-3 size-4 rotate-45 bg-card",
            side === "left"
              ? "-right-[9px] border-r-[2.5px] border-t-[2.5px] border-line"
              : "-left-[9px] border-b-[2.5px] border-l-[2.5px] border-line",
          )}
        />
      </p>

      {/* 캐릭터 */}
      <div className="w-24 shrink-0 animate-bob motion-reduce:animate-none sm:w-28">
        <Buddy />
      </div>
    </div>
  );
}
