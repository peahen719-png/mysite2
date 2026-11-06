"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

/* 스크롤해서 화면에 들어오면 아래에서 부드럽게 떠오르는 상자.
   - 모양은 app/globals.css 의 [data-reveal]
   - delay : 늦게 시작할 시간 (ms). 여러 개를 차례로 띄울 때 사용
   - 한 번 나타나면 다시 숨지 않음 */
export function Reveal({ children, delay = 0, className }: { children: ReactNode; delay?: number; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShown(true);
          observer.disconnect();
        }
      },
      { rootMargin: "0px 0px -10% 0px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      data-reveal={shown ? "in" : "out"}
      className={className}
      style={{ "--reveal-delay": `${delay}ms` } as React.CSSProperties}
    >
      {children}
    </div>
  );
}
