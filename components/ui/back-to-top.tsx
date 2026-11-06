"use client";

import { useEffect, useState } from "react";
import { ArrowUp } from "lucide-react";

import { cn } from "@/lib/utils";

/* 오른쪽 아래 '맨 위로' 동그란 단추. 조금 내려오면 톡 나타남 */
export function BackToTop({ label }: { label: string }) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > window.innerHeight * 0.8);
    const first = requestAnimationFrame(onScroll);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(first);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  return (
    <a
      href="#top"
      aria-label={label}
      title={label}
      className={cn(
        "fixed bottom-5 right-5 z-40 flex size-12 items-center justify-center rounded-full border-4 border-card bg-primary text-primary-foreground shadow-pop transition-all duration-300 hover:-translate-y-1 sm:bottom-8 sm:right-8",
        show ? "scale-100 opacity-100" : "pointer-events-none scale-50 opacity-0",
      )}
    >
      <ArrowUp className="size-5" strokeWidth={3} />
    </a>
  );
}
