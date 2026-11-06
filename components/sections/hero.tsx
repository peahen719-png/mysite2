import { ArrowRight, ChevronDown } from "lucide-react";

import { siteConfig } from "@/site.config";
import { getHeroTexts } from "@/lib/data";
import { cn } from "@/lib/utils";
import { Container } from "@/components/layout/container";
import { AnalogClock } from "@/components/ui/analog-clock";
import { CheerBurst } from "@/components/ui/cheer-burst";
import { Button } from "@/components/ui/button";
import { TypewriterText } from "@/components/ui/typewriter-text";
import { LightMotes } from "@/components/ui/light-motes";
import { LivingPicture } from "@/components/ui/living-picture";

/* 첫 화면(히어로) — 한옥 도서관 그림(site.config.ts 의 libraryImage)을 옅게 깐 배경 위의 3D 이정표.
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

/* 처음 열 때 차례로 떠오르는 순서 (ms) */
const enter = (delay: number) => ({ animationDelay: `${delay}ms` });
const enterClass = "animate-enter motion-reduce:animate-none";

export async function Hero() {
  const { hero, steps } = siteConfig;
  const texts = await getHeroTexts();
  const { decor } = hero;

  return (
    <section
      id="top"
      className="relative isolate overflow-hidden bg-background"
    >
      {/* 배경: 한옥 도서관 그림을 옅게 + 글자 쪽(왼쪽)은 더 옅게 덮어서 잘 읽히게 */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        {/* 그림은 오른쪽으로 치우쳐 깔아서 사모예드가 제목과 겹치지 않게. 천천히 움직이고 잎이 떨어짐 */}
        <LivingPicture
          src={siteConfig.libraryImage}
          className="inset-y-0 right-0 w-full lg:w-[78%]"
          imageClassName="opacity-50"
        />
        <div className="absolute inset-0 bg-linear-to-r from-background via-background/70 to-background/0" />
        <div className="absolute inset-x-0 bottom-0 h-48 bg-linear-to-b from-transparent to-background" />
        <div className="absolute inset-x-0 top-0 h-32 bg-linear-to-b from-background/80 to-transparent" />
      </div>

      {/* 도서관에 떠다니는 반짝이는 빛 먼지 */}
      <LightMotes className="-z-10" />

      <Container className="grid min-h-[90svh] items-center gap-10 py-20 lg:grid-cols-[1.1fr_1fr]">
        {/* 왼쪽 글자 */}
        <div className="flex flex-col items-start">
          {/* 분홍 스티커 라벨 */}
          <div className={enterClass} style={enter(0)}>
            <p className="origin-left -rotate-3 animate-breathe rounded-full border-[2.5px] border-line bg-pink motion-reduce:animate-none px-5 py-1.5 font-display text-lg text-pink-foreground shadow-pop-sm">
              {texts.eyebrow}
            </p>
          </div>
          <h1
            style={enter(120)}
            className="mt-6 animate-enter motion-reduce:animate-none max-w-2xl whitespace-pre-line font-display text-5xl leading-[1.15] text-primary [text-shadow:0_4px_0_var(--card),0_14px_28px_color-mix(in_oklab,var(--primary)_35%,transparent)] sm:text-6xl lg:text-7xl">
            {texts.title}
          </h1>
          {/* 설명은 한 글자씩 타이핑되듯 나타남 */}
          <div className={enterClass} style={enter(260)}>
            <TypewriterText
              loop
              key={texts.description}
              text={texts.description}
              className="mt-6 min-h-[1.7em] max-w-md text-lg font-medium leading-relaxed text-muted-foreground"
            />
          </div>
          <div className={cn("mt-10 flex flex-wrap gap-4", enterClass)} style={enter(380)}>
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
        <div className={cn("relative mx-auto h-[600px] w-full max-w-md", enterClass)} style={enter(220)}>
          {/* 기둥 */}
          <div
            aria-hidden
            className="absolute bottom-0 left-1/2 top-24 -ml-5 w-10 rounded-full border-[2.5px] border-line bg-linear-to-r from-accent via-primary/60 to-primary shadow-pop"
          />

          {/* 맨 위 마름모 + 아날로그 시계 */}
          <div className="absolute inset-x-0 top-0 flex justify-center">
            <div className="flex size-24 rotate-45 items-center justify-center rounded-3xl border-[3px] border-line bg-primary/85 shadow-pop">
              <AnalogClock className="size-[78px] -rotate-45" />
            </div>
          </div>

          {/* 보라색 큰 판 + 분홍 스티커. 마우스를 올리면 decor.hoverText 글자가 크게 펼쳐졌다 하트와 함께 사라짐 */}
          {decor.board ? (
            <div aria-hidden className="absolute inset-x-0 top-[104px] flex justify-center">
              <div className="group relative -rotate-2 cursor-default rounded-[2rem] border-[3px] border-line bg-primary px-10 py-6 shadow-pop transition-transform duration-300 hover:-rotate-4 hover:scale-105">
                <div className="absolute inset-x-5 top-2 h-3 rounded-full bg-card/30" />
                <p className="whitespace-pre-line text-center font-display text-5xl leading-[1.05] text-primary-foreground">
                  {decor.board}
                </p>
                {decor.hoverText ? <CheerBurst text={decor.hoverText} /> : null}
                {decor.sticker ? (
                  <span className="absolute -bottom-4 -right-8 rotate-12 rounded-xl border-[2.5px] border-line bg-pink px-3 py-1 font-display text-sm text-pink-foreground shadow-pop-sm">
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
                      className="pointer-events-none absolute bottom-[calc(100%+0.6rem)] left-1/2 -translate-x-1/2 scale-50 whitespace-nowrap rounded-2xl border-[2.5px] border-line bg-card px-4 py-2 font-display text-lg text-foreground opacity-0 shadow-pop transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] group-hover/sign:scale-100 group-hover/sign:opacity-100 group-focus-visible/sign:scale-100 group-focus-visible/sign:opacity-100"
                    >
                      {step.signTip}
                      <span className="absolute -bottom-2.5 left-1/2 size-4 -translate-x-1/2 rotate-45 border-b-4 border-r-4 border-line bg-card" />
                    </span>
                  ) : null}
                </a>
              );
            })}
          </nav>
        </div>
      </Container>

      {/* 아래로 내려 보라는 표시 */}
      <a
        href={`#${steps[0]?.key ?? "think"}`}
        aria-label="아래로 내려가기"
        className="absolute bottom-6 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-1 font-display text-xs tracking-[0.3em] text-muted-foreground transition-colors hover:text-primary lg:flex"
      >
        SCROLL
        <span className="flex size-9 animate-bounce items-center justify-center rounded-full border-2 border-line bg-card/80 shadow-pop-sm motion-reduce:animate-none">
          <ChevronDown className="size-4" />
        </span>
      </a>
    </section>
  );
}
