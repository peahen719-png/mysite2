import { Fragment } from "react";

import { siteConfig } from "@/site.config";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { CheerBuddies } from "@/components/layout/cheer-buddies";
import { Hero } from "@/components/sections/hero";
import { StepSection } from "@/components/sections/step";
import { ThoughtFilmBoard } from "@/components/sections/thought-film";
import { ScheduleBoard } from "@/components/sections/schedule";
import { ActionGame } from "@/components/sections/action-game";
import { ResultTrophy } from "@/components/sections/result-trophy";
import { Contact } from "@/components/sections/contact";

/* 메인 페이지 = 섹션 블록을 위에서 아래로 쌓아 놓은 것.
   - 섹션 순서 바꾸기: 아래 줄의 순서를 바꾸면 됩니다.
   - 섹션 빼기: 해당 줄을 지우면 됩니다.
   - 새 섹션 추가: components/sections 에 파일을 만들고 여기에 한 줄 추가.
   - 단계 섹션(생각·계획·실천·결과)은 site.config.ts 의 steps 개수만큼 자동으로 생깁니다.
   - "생각" 섹션 안에는 생각 필름(ThoughtFilmBoard)이 들어갑니다. 생각 카드는 필름에만 보입니다.
   - "계획" 섹션 안에는 일정표(ScheduleBoard), "실천" 섹션 안에는 주사위 보드게임(ActionGame),
     "결과" 섹션 안에는 성과 뽑기 기계 + 트로피(ResultTrophy)가 들어갑니다.
     글자는 site.config.ts 의 schedule, actionGame, clawGame 에서 바꿉니다.
   - 예전 소개 / 기능 섹션으로 되돌리려면: StepSection 줄 대신
     import { About } from "@/components/sections/about";  →  <About />
     import { Features } from "@/components/sections/features";  →  <Features /> */

// 관리자 페이지에서 내용을 바꾸면 최대 60초 안에 반영 (저장 즉시 반영도 되어 있음)
export const revalidate = 60;

export default function HomePage() {
  return (
    <>
      <Navbar />
      {/* 화면 가장자리에서 계속 따라오는 응원 친구들 */}
      <CheerBuddies />
      <main className="flex-1">
        <Hero />
        {siteConfig.steps.map((step, i) => (
          <Fragment key={step.key}>
            <StepSection step={step} index={i} showCards={step.key !== "think" && step.key !== "result"}>
              {step.key === "think" ? <ThoughtFilmBoard /> : null}
              {step.key === "plan" ? <ScheduleBoard /> : null}
              {step.key === "do" ? <ActionGame /> : null}
              {step.key === "result" ? <ResultTrophy /> : null}
            </StepSection>
          </Fragment>
        ))}
        <Contact />
      </main>
      <Footer />
    </>
  );
}
