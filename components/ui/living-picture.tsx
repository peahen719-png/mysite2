"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";

import { cn } from "@/lib/utils";

/* 살아 움직이는 그림 (첫 화면 배경의 한옥 도서관 그림).
   - 아주 천천히 다가갔다 물러나는 카메라 (animate-kenburns)
   - 마우스를 움직이면 그림이 살짝 따라 움직임 (깊이감)
   - 창으로 들어오는 햇살 줄기가 은은하게 일렁임 (animate-beam)
   - 오른쪽 위 단풍나무 쪽에서 잎이 팔랑팔랑 떨어짐 (animate-flutter)
   - 움직임 줄이기 설정이면 그림만 가만히 보여줌 */

function seeded(seed: number) {
  let s = seed;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

const rand = seeded(2026);
const leafColors = ["bg-orange", "bg-primary", "bg-red", "bg-yellow"];
const leaves = Array.from({ length: 14 }, (_, i) => ({
  left: 55 + rand() * 45, // 오른쪽 위 나무 근처에서 출발
  top: -5 + rand() * 25,
  width: 11 + rand() * 9,
  delay: -rand() * 16,
  duration: 9 + rand() * 7,
  sway: -(80 + rand() * 220), // 왼쪽 아래로 흩날림
  color: leafColors[i % leafColors.length],
}));

export function LivingPicture({
  src,
  focus = "55% 40%",
  className,
  imageClassName,
}: {
  src: string;
  focus?: string;
  className?: string;
  imageClassName?: string;
}) {
  const layer = useRef<HTMLDivElement>(null);

  // 마우스 위치에 따라 그림을 살짝 반대로 움직임
  useEffect(() => {
    const el = layer.current;
    if (!el) return;
    if (!window.matchMedia("(pointer: fine)").matches) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let frame = 0;
    const onMove = (e: PointerEvent) => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const x = (e.clientX / window.innerWidth - 0.5) * -18;
        const y = (e.clientY / window.innerHeight - 0.5) * -12;
        el.style.transform = `translate3d(${x}px, ${y}px, 0)`;
      });
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("pointermove", onMove);
    };
  }, []);

  return (
    <div aria-hidden className={cn("pointer-events-none absolute overflow-hidden", className)}>
      {/* 마우스 따라 움직이는 층 */}
      <div ref={layer} className="absolute -inset-6 transition-transform duration-700 ease-out">
        {/* 천천히 다가갔다 물러나는 카메라 */}
        <div className="absolute inset-0 animate-kenburns motion-reduce:animate-none">
          <Image src={src} alt="" fill priority sizes="100vw" className={cn("object-cover", imageClassName)} style={{ objectPosition: focus }} />
        </div>
      </div>

      {/* 창으로 들어오는 햇살 줄기 */}
      <div
        className="absolute inset-0 animate-beam opacity-60 mix-blend-soft-light motion-reduce:animate-none"
        style={{
          backgroundImage:
            "repeating-linear-gradient(115deg, transparent 0 60px, rgb(255 236 190 / 0.9) 60px 120px, transparent 120px 230px)",
          backgroundSize: "460px 100%",
        }}
      />

      {/* 팔랑팔랑 떨어지는 잎 */}
      <div className="absolute inset-0 motion-reduce:hidden">
        {leaves.map((leaf, i) => (
          <span
            key={i}
            className="absolute animate-leaf-fall"
            style={
              {
                left: `${leaf.left}%`,
                top: `${leaf.top}%`,
                animationDelay: `${leaf.delay}s`,
                animationDuration: `${leaf.duration}s`,
                "--sway": `${leaf.sway}px`,
              } as React.CSSProperties
            }
          >
            {/* 잎 한 장: 끝이 뾰족한 타원 + 가운데 잎맥, 앞뒤로 뒤집히며 팔랑 */}
            <span
              className={cn(
                "relative block animate-flutter rounded-[0_100%_0_100%] border border-line/30 shadow-sm",
                leaf.color,
              )}
              style={{ width: leaf.width, height: leaf.width * 1.4, animationDelay: `${leaf.delay}s` }}
            >
              <span className="absolute left-1/2 top-[15%] h-[70%] w-px -translate-x-1/2 rotate-45 bg-line/30" />
            </span>
          </span>
        ))}
      </div>
    </div>
  );
}
