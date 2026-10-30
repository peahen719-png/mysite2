import { ArrowRight } from "lucide-react";

import { siteConfig } from "@/site.config";
import { getHeroTexts } from "@/lib/data";
import { cn } from "@/lib/utils";
import { Container } from "@/components/layout/container";
import { AnalogClock } from "@/components/ui/analog-clock";
import { CheerBurst } from "@/components/ui/cheer-burst";
import { Button } from "@/components/ui/button";
import { TypewriterText } from "@/components/ui/typewriter-text";

/* 첫 화면(히어로) — 말랑말랑한 3D 여행 이정표 포스터 느낌.
   - 글자는 관리자 페이지(/admin → 히어로 글자)에서 바꿉니다.
     저장한 적 없는 칸은 site.config.ts 의 hero 글자가 보입니다.
   - 버튼 주소(href)와 이정표 글자(decor)는 site.config.ts 에서 바꿉니다.
   - 화살표 표지판은 site.config.ts 의 steps(생각, 계획, 실천, 결과)를 써서, 누르면 해당 섹션으로 이동합니다.
   - 색은 app/globals.css 의 토큰을 씁니다. (primary = 보라 판, sky / teal / orange / pink = 화살표 표지판, pink = 스티커)
   - 21st.dev 의 멋진 히어로로 바꾸고 싶다면: 그 컴포넌트를 components/ui 에 넣고,
     이 파일의 <section> 안쪽을 그 컴포넌트로 감싸면 됩니다. (Claude에게 /add-component 로 요청) */

/* 잘린 모양(화살표)에도 볼록한 그림자가 보이도록 */
const popShadow =
  "[filter:drop-shadow(0_6px_0_color-mix(in_oklab,var(--foreground)_18%,transparent))_drop-shadow(0_16px_18px_color-mix(in_oklab,var(--foreground)_25%,transparent))]";

/* 화살표 표지판 모양과 색 (순서대로 돌아가며 사용) */
const signStyles = [
  { color: "bg-sky", rotate: "-rotate-3", side: "self-start", shape: "polygon(12% 0, 100% 0, 100% 100%, 12% 100%, 0 50%)" },
  { color: "bg-teal", rotate: "rotate-3", side: "self-end", shape: "polygon(0 0, 88% 0, 100% 50%, 88% 100%, 0 100%)" },
  { color: "bg-orange", rotate: "-rotate-2", side: "self-start", shape: "polygon(12% 0, 100% 0, 100% 100%, 12% 100%, 0 50%)" },
  { color: "bg-pink", rotate: "rotate-2", side: "self-end", shape: "polygon(0 0, 88% 0, 100% 50%, 88% 100%, 0 100%)" },
];

/* 흐릿한 흰 구름 */
const clouds = [
  "left-[-6%] top-[10%] h-32 w-72",
  "right-[-8%] top-[38%] h-40 w-96",
  "left-[30%] bottom-[-6%] h-36 w-[28rem]",
];

export async function Hero() {
  const { hero, steps } = siteConfig;
  const texts = await getHeroTexts();
  const { decor } = hero;

  return (
    <section
      id="top"
      className="relative isolate overflow-hidden bg-linear-to-b from-secondary via-background to-background"
    >
      {/* 흐릿한 구름 (떠다니는 응원 친구들은 components/layout/cheer-buddies.tsx) */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        {clouds.map((pos) => (
          <div key={pos} className={cn("absolute rounded-full bg-card/80 blur-2xl", pos)} />
        ))}
      </div>

      <Container className="grid min-h-[90svh] items-center gap-10 py-20 lg:grid-cols-[1.1fr_1fr]">
        {/* 왼쪽 글자 */}
        <div className="flex flex-col items-start">
          {/* 분홍 스티커 라벨 */}
          <p className="origin-left -rotate-3 animate-breathe rounded-full border-4 border-card bg-pink motion-reduce:animate-none px-5 py-1.5 font-display text-lg text-pink-foreground shadow-pop-sm">
            {texts.eyebrow}
          </p>
          <h1 className="mt-6 max-w-2xl whitespace-pre-line font-display text-5xl leading-[1.15] text-primary [text-shadow:0_4px_0_var(--card),0_14px_28px_color-mix(in_oklab,var(--primary)_35%,transparent)] sm:text-6xl lg:text-7xl">
            {texts.title}
          </h1>
          {/* 설명은 한 글자씩 타이핑되듯 나타남 */}
          <TypewriterText
            loop
            key={texts.description}
            text={texts.description}
            className="mt-6 min-h-[1.7em] max-w-md text-lg font-medium leading-relaxed text-muted-foreground"
          />
          <div className="mt-10 flex flex-wrap gap-4">
            <Button asChild size="lg">
              <a href={hero.primaryCta.href}>
                {texts.primaryCtaLabel}
                <ArrowRight />
              </a>
            </Button>
            <Button asChild size="lg" variant="outline">
              <a href={hero.secondaryCta.href}>{texts.secondaryCtaLabel}</a>
            </Button>
          </div>
        </div>

        {/* 오른쪽 이정표 */}
        <div className="relative mx-auto h-[600px] w-full max-w-md">
          {/* 기둥 */}
          <div
            aria-hidden
            className="absolute bottom-0 left-1/2 top-24 -ml-5 w-10 rounded-full border-4 border-card bg-linear-to-r from-accent via-primary/60 to-primary shadow-pop"
          />

          {/* 맨 위 마름모 + 아날로그 시계 */}
          <div className="absolute inset-x-0 top-0 flex justify-center">
            <div className="flex size-24 rotate-45 items-center justify-center rounded-3xl border-[6px] border-card bg-primary/85 shadow-pop">
              <AnalogClock className="size-[78px] -rotate-45" />
            </div>
          </div>

          {/* 보라색 큰 판 + 분홍 스티커. 마우스를 올리면 decor.hoverText 글자가 크게 펼쳐졌다 하트와 함께 사라짐 */}
          {decor.board ? (
            <div aria-hidden className="absolute inset-x-0 top-[104px] flex justify-center">
              <div className="group relative -rotate-2 cursor-default rounded-[2rem] border-[6px] border-card bg-primary px-10 py-6 shadow-pop transition-transform duration-300 hover:-rotate-4 hover:scale-105">
                <div className="absolute inset-x-5 top-2 h-3 rounded-full bg-card/30" />
                <p className="whitespace-pre-line text-center font-display text-5xl leading-[1.05] text-primary-foreground">
                  {decor.board}
                </p>
                {decor.hoverText ? <CheerBurst text={decor.hoverText} /> : null}
                {decor.sticker ? (
                  <span className="absolute -bottom-4 -right-8 rotate-12 rounded-xl border-4 border-card bg-pink px-3 py-1 font-display text-sm text-pink-foreground shadow-pop-sm">
                    {decor.sticker}
                  </span>
                ) : null}
              </div>
            </div>
          ) : null}

          {/* 화살표 표지판 (생각 → 계획 → 실천 → 결과) */}
          <nav aria-label="단계 바로가기" className="absolute inset-x-0 top-[300px] flex flex-col gap-3">
            {steps.map((step, i) => {
              const style = signStyles[i % signStyles.length];
              return (
                <a
                  key={step.key}
                  href={`#${step.key}`}
                  className={cn(
                    "group/sign relative w-[62%] transition-transform hover:z-30 hover:-translate-y-1 focus-visible:z-30",
                    style.side,
                    style.rotate,
                    popShadow,
                  )}
                >
                  <span
                    className={cn("flex items-center justify-center px-10 py-3", style.color)}
                    style={{ clipPath: style.shape }}
                  >
                    <span className="rounded-full bg-card px-5 py-1 font-display text-xl text-card-foreground">
                      {step.title}
                    </span>
                  </span>
                  {/* 마우스를 올리면 표지판 위에 톡 튀어나오는 한마디 (site.config.ts 의 steps.signTip) */}
                  {step.signTip ? (
                    <span
                      aria-hidden
                      className="pointer-events-none absolute bottom-[calc(100%+0.6rem)] left-1/2 -translate-x-1/2 scale-50 whitespace-nowrap rounded-2xl border-4 border-card bg-card px-4 py-2 font-display text-lg text-foreground opacity-0 shadow-pop transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] group-hover/sign:scale-100 group-hover/sign:opacity-100 group-focus-visible/sign:scale-100 group-focus-visible/sign:opacity-100"
                    >
                      {step.signTip}
                      <span className="absolute -bottom-2.5 left-1/2 size-4 -translate-x-1/2 rotate-45 border-b-4 border-r-4 border-card bg-card" />
                    </span>
                  ) : null}
                </a>
              );
            })}
          </nav>
        </div>
      </Container>
    </section>
  );
}
