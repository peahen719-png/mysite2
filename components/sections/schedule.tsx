import { CalendarHeart, Star } from "lucide-react";

import { siteConfig } from "@/site.config";
import { cn } from "@/lib/utils";

/* 일정표 — 02 계획 섹션 안(설명 아래)에 들어가는 달력 보드.
   - 글자와 일정: site.config.ts 의 schedule
   - 모양: 청록 거리 표지판 제목 + 큰 달 숫자 + 날짜 타일 (첫 화면 이정표와 같은 말랑한 3D 느낌)
   - 색: 타일마다 표지판 색(sky, teal, pink, primary, orange)을 돌아가며 사용 */

const tileColors = [
  { tint: "from-sky/30", text: "text-sky", pill: "bg-sky" },
  { tint: "from-teal/30", text: "text-teal", pill: "bg-teal" },
  { tint: "from-pink/30", text: "text-pink", pill: "bg-pink" },
  { tint: "from-primary/30", text: "text-primary", pill: "bg-primary" },
  { tint: "from-orange/30", text: "text-orange", pill: "bg-orange" },
];

/* 달 숫자 칸 색 (달마다 번갈아) */
const monthColors = ["from-orange/35 to-pink/20 text-orange", "from-teal/35 to-sky/20 text-teal"];

export function ScheduleBoard() {
  const { schedule } = siteConfig;
  let tileIndex = 0; // 달이 바뀌어도 색이 이어서 돌아가도록

  return (
    <div id="schedule" className="relative mt-20 scroll-mt-24">
      {/* 둥실둥실 장식 */}
      <div aria-hidden className="pointer-events-none absolute inset-0 hidden md:block">
        <div className="absolute -right-4 -top-14 z-10 flex size-14 animate-float items-center justify-center rounded-full border-4 border-card bg-pink text-card shadow-pop">
          <CalendarHeart className="size-7" />
        </div>
        <div className="absolute -bottom-6 -left-5 z-10 flex size-12 animate-float items-center justify-center rounded-full border-4 border-card bg-sky text-card shadow-pop [animation-delay:-3s]">
          <Star className="size-6 fill-card" />
        </div>
      </div>

      {/* 보드 */}
      <div className="relative rounded-[2rem] border-[6px] border-card bg-card/50 p-4 pt-12 shadow-pop backdrop-blur sm:p-6 sm:pt-14">
        {/* 청록 거리 표지판 제목 */}
        <div className="absolute inset-x-0 -top-8 flex justify-center px-4">
          <p className="relative -rotate-1 rounded-2xl border-4 border-card bg-teal px-6 py-3 text-center font-display text-xl text-card shadow-pop sm:px-10 sm:text-3xl">
            <span aria-hidden className="absolute inset-1.5 rounded-xl border-2 border-card/70" />
            {schedule.boardTitle}
          </p>
        </div>

        <div className="space-y-4">
          {schedule.months.map((month, m) => (
            <div key={month.month} className="flex flex-col gap-3 sm:flex-row">
              {/* 큰 달 숫자 */}
              <div
                className={cn(
                  "flex h-28 shrink-0 flex-col items-center justify-center rounded-2xl border-4 border-card bg-linear-to-br shadow-pop-sm sm:h-auto sm:w-36 lg:w-44",
                  monthColors[m % monthColors.length],
                )}
              >
                <span className="font-display text-7xl leading-none [text-shadow:0_4px_0_var(--card)] lg:text-8xl">
                  {month.month}
                </span>
                <span className="mt-1 font-display text-xs tracking-[0.3em] text-foreground/60">MONTH</span>
              </div>

              {/* 날짜 타일 (빈칸이 생기지 않게 작은 타일이 앞쪽 빈자리를 채움) */}
              <div className="grid flex-1 grid-flow-dense grid-cols-2 gap-3 lg:grid-cols-3">
                {month.events.map((event) => {
                  const color = tileColors[tileIndex++ % tileColors.length];
                  return (
                    <article
                      key={`${month.month}-${event.day}`}
                      className={cn(
                        "flex min-h-36 flex-col rounded-2xl border-4 border-card bg-card bg-linear-to-br to-card p-4 shadow-pop-sm transition-transform hover:-translate-y-1",
                        color.tint,
                        event.wide && "col-span-2",
                      )}
                    >
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={cn("font-display text-4xl leading-none", color.text)}>{event.day}</span>
                        <span className={cn("rounded-full px-2 py-0.5 font-display text-xs text-card", color.pill)}>
                          {event.time}
                        </span>
                      </div>
                      <h3 className="mt-3 font-display text-lg leading-snug text-foreground">{event.title}</h3>
                      {event.note ? (
                        <p className="mt-2 self-start rounded-full border bg-card px-3 py-1 text-xs text-muted-foreground">
                          {event.note}
                        </p>
                      ) : null}
                      <span className="mt-auto self-end rounded-full bg-card px-3 py-0.5 pt-1 font-display text-xs text-muted-foreground shadow-pop-sm">
                        {event.date}
                      </span>
                    </article>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
