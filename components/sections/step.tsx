import type { ReactNode } from "react";
import Image from "next/image";
import { ArrowUpRight, Sparkles } from "lucide-react";

import { getItems } from "@/lib/data";
import { cn } from "@/lib/utils";
import { Container } from "@/components/layout/container";
import { SectionHeader } from "@/components/layout/section-header";
import { Reveal } from "@/components/ui/reveal";
import { SectionOrnament } from "@/components/ui/section-ornament";

/* 단계 섹션 (생각 → 계획 → 실천 → 결과) 하나.
   - 글자: site.config.ts 의 steps
   - 카드: 관리자 페이지(/admin)에서 단계별로 추가 (없으면 글자만 보임)
   - children: 설명 아래에 넣을 추가 내용 (계획 → 일정표, 실천 → 보드게임)
   - 번호 배지 색은 첫 화면 이정표 표지판과 같은 순서 (파랑 → 청록 → 주황 → 분홍) */


export type Step = { key: string; eyebrow: string; title: string; description: string };

export async function StepSection({
  step,
  index,
  showCards = true,
  children,
}: {
  step: Step;
  index: number;
  /** false 면 카드 목록을 숨김 (생각 카드는 생각 필름에서 보여주므로) */
  showCards?: boolean;
  /** 이 단계 섹션 안에 함께 보여줄 내용 */
  children?: ReactNode;
}) {
  const items = showCards ? await getItems(step.key) : [];

  return (
    <section
      id={step.key}
      className={cn(
        "relative isolate scroll-mt-24 overflow-hidden py-24 sm:py-28",
        index % 2 === 0 && "bg-linear-to-b from-transparent via-muted/60 to-transparent",
      )}
    >
      {/* 배경의 커다란 옅은 단계 번호 */}
      <span
        aria-hidden
        className="pointer-events-none absolute -top-6 right-[-2%] -z-10 select-none font-display text-[11rem] leading-none text-primary/[0.06] sm:text-[16rem]"
      >
        {String(index + 1).padStart(2, "0")}
      </span>
      <Container>
        {/* 섹션 사이 전통 문양 구분선 */}
        <SectionOrnament className="mb-14" />

        <Reveal className="flex flex-col gap-6 sm:flex-row sm:items-start">
          {/* 단계 번호패: 나무 판 + 안쪽 테두리 */}
          <div
            aria-hidden
            className="relative flex size-20 shrink-0 -rotate-3 items-center justify-center rounded-xl border-[2.5px] border-line bg-wood font-display text-4xl text-card shadow-pop"
          >
            <span className="absolute inset-1.5 rounded-lg border-2 border-card/35" />
            {String(index + 1).padStart(2, "0")}
          </div>
          <SectionHeader eyebrow={step.eyebrow} title={step.title} description={step.description} />
        </Reveal>

        {children ? <Reveal delay={120}>{children}</Reveal> : null}

        {items.length > 0 ? (
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((item) => {
              const card = (
                <article className="lift group h-full overflow-hidden rounded-[1.75rem] border-[2.5px] border-line bg-card shadow-pop-sm">
                  <div className="relative aspect-[4/3] bg-muted">
                    {item.image_url ? (
                      <Image
                        src={item.image_url}
                        alt={item.title}
                        fill
                        sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-muted-foreground">
                        <Sparkles className="size-8" />
                      </div>
                    )}
                  </div>
                  <div className="p-6">
                    <h3 className="flex items-center justify-between gap-2 text-lg">
                      {item.title}
                      {item.link_url ? (
                        <ArrowUpRight className="size-4 text-muted-foreground transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                      ) : null}
                    </h3>
                    {item.description ? (
                      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                        {item.description}
                      </p>
                    ) : null}
                  </div>
                </article>
              );

              return item.link_url ? (
                <a key={item.id} href={item.link_url} target="_blank" rel="noreferrer">
                  {card}
                </a>
              ) : (
                <div key={item.id}>{card}</div>
              );
            })}
          </div>
        ) : null}
      </Container>
    </section>
  );
}
