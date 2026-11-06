"use client";

import { useEffect, useState, type ReactNode } from "react";
import { ArrowUpRight, Bell, ChevronLeft, ChevronRight, Newspaper, Quote, type LucideIcon } from "lucide-react";

import { siteConfig } from "@/site.config";
import { cn } from "@/lib/utils";
import type { NewsItem } from "@/lib/news";

/* 오늘의 성장 레터 — 세 장의 카드 (관심사 기사 / 알아둘 소식 / 오늘의 한마디).
   - 세 카드 모두 같은 모양: 위에 아이콘·제목·"3 / 23" 쪽수와 ‹ › 넘김 단추, 아래 내용
   - 몇 초마다 다음 글이 아래에서 스르륵 올라옴 (세 카드 모두 같은 움직임, 서로 조금씩 시간차)
   - 마우스를 올리면 잠깐 멈춤
   - 색: 카드 바탕은 흰색으로 통일, 아이콘 동그라미만 sky / orange / pink */

type Notice = { label: string; text: string; link: string; meta: string };

/** ms 마다 다음 순서로 (멈춤 가능, 단추로 이동하면 거기서부터 다시 셈) */
function useRotation(count: number, ms: number) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  useEffect(() => {
    if (count < 2 || paused) return;
    const timer = setTimeout(() => setIndex((i) => (i + 1) % count), ms);
    return () => clearTimeout(timer);
  }, [count, ms, paused, index]);
  const go = (by: number) => setIndex((i) => (i + by + count) % count);
  return { index, go, setPaused };
}

/** 세 카드가 함께 쓰는 틀 */
function LetterCard({
  title,
  Icon,
  iconBg,
  count,
  rotation,
  children,
}: {
  title: string;
  Icon: LucideIcon;
  iconBg: string;
  count: number;
  rotation: ReturnType<typeof useRotation>;
  children: ReactNode;
}) {
  return (
    <div
      className="lift flex min-h-[15rem] flex-col rounded-[1.75rem] border-[2.5px] border-line bg-card p-5 shadow-pop-sm sm:p-6"
      onMouseEnter={() => rotation.setPaused(true)}
      onMouseLeave={() => rotation.setPaused(false)}
      onFocus={() => rotation.setPaused(true)}
      onBlur={() => rotation.setPaused(false)}
    >
      {/* 머리: 아이콘 + 제목 + 쪽수 + 넘김 단추 */}
      <div className="flex items-center gap-2.5 border-b-2 border-dashed border-border pb-3">
        <span className={cn("flex size-9 shrink-0 items-center justify-center rounded-full text-card", iconBg)}>
          <Icon className="size-5" />
        </span>
        <p className="flex-1 font-display text-lg text-foreground">{title}</p>
        {count > 1 ? (
          <span className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => rotation.go(-1)}
              aria-label={`${title} 이전 글`}
              className="flex size-7 items-center justify-center rounded-full text-muted-foreground hover:bg-muted"
            >
              <ChevronLeft className="size-4" />
            </button>
            <span className="min-w-[3.2rem] text-center font-display text-xs text-muted-foreground">
              {rotation.index + 1} / {count}
            </span>
            <button
              type="button"
              onClick={() => rotation.go(1)}
              aria-label={`${title} 다음 글`}
              className="flex size-7 items-center justify-center rounded-full text-muted-foreground hover:bg-muted"
            >
              <ChevronRight className="size-4" />
            </button>
          </span>
        ) : null}
      </div>
      {/* 내용: 바뀔 때마다 아래에서 스르륵 */}
      <div key={rotation.index} className="flex flex-1 flex-col pt-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
        {children}
      </div>
    </div>
  );
}

export function InterestRotator({ articles, notices }: { articles: NewsItem[]; notices: Notice[] }) {
  const data = siteConfig.interests;
  const ms = data.intervalSec * 1000;
  // 세 카드가 한꺼번에 넘어가지 않게 간격을 조금씩 다르게
  const a = useRotation(articles.length, ms);
  const n = useRotation(notices.length, ms + 1300);
  const q = useRotation(data.quotes.length, ms + 2600);

  const article = articles[a.index];
  const notice = notices[n.index];
  const quote = data.quotes[q.index];

  return (
    <div className="mt-12 grid gap-6 lg:grid-cols-3">
      {/* 관심사 기사 */}
      <LetterCard title={data.articlesTitle} Icon={Newspaper} iconBg="bg-sky" count={articles.length} rotation={a}>
        {article ? (
          <a href={article.link} target="_blank" rel="noreferrer" className="group flex flex-1 flex-col">
            <span className="self-start rounded-full bg-sky/15 px-2.5 py-0.5 font-display text-xs text-foreground">
              #{article.topic}
            </span>
            <span className="mt-2 line-clamp-3 font-display text-lg leading-snug text-foreground group-hover:text-primary">
              {article.title}
            </span>
            <span className="mt-auto flex items-center justify-between gap-2 pt-3 text-xs text-muted-foreground">
              <span className="truncate">{[article.source, article.date].filter(Boolean).join(" · ")}</span>
              <span className="flex shrink-0 items-center gap-0.5 font-display text-primary">
                {data.readLabel}
                <ArrowUpRight className="size-3.5" />
              </span>
            </span>
          </a>
        ) : (
          <p className="text-sm text-muted-foreground">기사를 불러오지 못했어요. 잠시 뒤 다시 확인해 주세요.</p>
        )}
      </LetterCard>

      {/* 알아둘 소식 */}
      <LetterCard title={data.noticesTitle} Icon={Bell} iconBg="bg-orange" count={notices.length} rotation={n}>
        {notice ? (
          <a
            href={notice.link || undefined}
            target={notice.link ? "_blank" : undefined}
            rel="noreferrer"
            className="group flex flex-1 flex-col"
          >
            <span className="self-start rounded-full bg-orange/15 px-2.5 py-0.5 font-display text-xs text-foreground">
              #{notice.label}
            </span>
            <span className="mt-2 line-clamp-3 font-display text-lg leading-snug text-foreground group-hover:text-primary">
              {notice.text}
            </span>
            {notice.meta ? (
              <span className="mt-auto flex items-center justify-between gap-2 pt-3 text-xs text-muted-foreground">
                <span className="truncate">{notice.meta}</span>
                <ArrowUpRight className="size-3.5 shrink-0 text-primary" />
              </span>
            ) : null}
          </a>
        ) : null}
      </LetterCard>

      {/* 오늘의 한마디 */}
      <LetterCard title={data.quotesTitle} Icon={Quote} iconBg="bg-pink" count={data.quotes.length} rotation={q}>
        {quote ? (
          <figure className="flex flex-1 flex-col justify-center">
            <blockquote className="font-display text-xl leading-relaxed text-foreground">“{quote.text}”</blockquote>
            {quote.by ? <figcaption className="mt-3 text-sm text-muted-foreground">— {quote.by}</figcaption> : null}
          </figure>
        ) : null}
      </LetterCard>
    </div>
  );
}
