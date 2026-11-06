"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";

import { siteConfig } from "@/site.config";
import { Container } from "@/components/layout/container";
import { BouncyText } from "@/components/ui/bouncy-text";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/** 상단 메뉴. 메뉴 항목은 site.config.ts 의 nav 에서 바꿉니다. 모바일에서는 햄버거 버튼으로 열림.
    - 스크롤하면 유리처럼 반투명한 떠 있는 막대로 바뀜
    - 지금 보고 있는 섹션의 메뉴가 알약 모양으로 표시됨
    - 맨 아래 얇은 막대 = 페이지를 얼마나 내려왔는지 */
export function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [progress, setProgress] = useState(0);
  const [active, setActive] = useState("");

  // 스크롤 위치 → 유리 효과 + 진행 막대
  useEffect(() => {
    const onScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      setScrolled(window.scrollY > 12);
      setProgress(max > 0 ? Math.min(1, window.scrollY / max) : 0);
    };
    const first = requestAnimationFrame(onScroll);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(first);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  // 화면 가운데에 걸친 섹션 = 지금 보고 있는 섹션
  useEffect(() => {
    const sections = siteConfig.nav
      .map((item) => document.querySelector<HTMLElement>(item.href))
      .filter((el): el is HTMLElement => el !== null);
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActive(`#${entry.target.id}`);
        });
      },
      { rootMargin: "-45% 0px -50% 0px" },
    );
    sections.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  return (
    <header className="fixed inset-x-0 top-0 z-50 px-3 pt-3 sm:px-5">
      <div
        className={cn(
          "relative mx-auto max-w-6xl overflow-hidden rounded-full border-2 transition-all duration-300",
          scrolled || open
            ? "border-line bg-card/70 shadow-pop-sm backdrop-blur-xl"
            : "border-transparent bg-transparent",
          open && "rounded-[1.75rem]",
        )}
      >
        <Container className="flex h-14 items-center justify-between sm:px-6">
          <Link href="/" className="font-display text-2xl">
            <BouncyText text={siteConfig.name} />
          </Link>

          {/* 데스크톱 메뉴 */}
          <nav className="hidden items-center gap-1 md:flex">
            {siteConfig.nav.map((item) => (
              <a
                key={item.href}
                href={item.href}
                aria-current={active === item.href ? "true" : undefined}
                className={cn(
                  "rounded-full px-4 py-1.5 font-display text-sm transition-colors",
                  active === item.href
                    ? "bg-primary/15 text-primary"
                    : "text-muted-foreground hover:bg-card hover:text-foreground",
                )}
              >
                {item.label}
              </a>
            ))}
            <Button asChild size="sm" className="ml-3">
              <a href={siteConfig.secretButton.href} target="_blank" rel="noopener noreferrer">
                {siteConfig.secretButton.label}
              </a>
            </Button>
          </nav>

          {/* 모바일 메뉴 버튼 */}
          <button
            type="button"
            className="inline-flex size-10 items-center justify-center rounded-full hover:bg-card md:hidden"
            aria-label={open ? "메뉴 닫기" : "메뉴 열기"}
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </Container>

        {/* 모바일 메뉴 펼침 */}
        <nav className={cn("md:hidden", open ? "block" : "hidden")}>
          <Container className="flex flex-col gap-1 pb-4 animate-in fade-in slide-in-from-top-2 duration-300">
            {siteConfig.nav.map((item) => (
              <a
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className={cn(
                  "rounded-2xl px-4 py-3 font-display text-base",
                  active === item.href ? "bg-primary/15 text-primary" : "text-muted-foreground hover:bg-card",
                )}
              >
                {item.label}
              </a>
            ))}
            <Button asChild size="sm" className="mt-2 self-start">
              <a
                href={siteConfig.secretButton.href}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setOpen(false)}
              >
                {siteConfig.secretButton.label}
              </a>
            </Button>
          </Container>
        </nav>

        {/* 읽은 만큼 차오르는 진행 막대 */}
        <span
          aria-hidden
          className={cn(
            "absolute inset-x-6 bottom-0 h-[3px] origin-left rounded-full bg-linear-to-r from-sky via-primary to-pink transition-opacity",
            scrolled ? "opacity-100" : "opacity-0",
          )}
          style={{ transform: `scaleX(${progress})` }}
        />
      </div>
    </header>
  );
}
