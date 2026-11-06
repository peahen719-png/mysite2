"use client";

import { useEffect, useRef, useState } from "react";
import { Check, Lightbulb, Pause, RotateCw, TrendingDown, TrendingUp, Target, type LucideIcon } from "lucide-react";

import { siteConfig } from "@/site.config";
import { cn } from "@/lib/utils";
import { STATUS_EVENT, STATUS_KEY } from "@/components/sections/action-game";
import { Mascot } from "@/components/ui/mascot";
import { CountUp } from "@/components/ui/count-up";

/* 성과 그래프 — 04 결과 섹션 안, 트로피 아래.
   - 왼쪽: 달마다 성공한 실천 개수 막대 그래프 (site.config.ts 의 achievements.months)
     막대는 화면에 보일 때 아래에서 쑥 자라고, 마우스를 올리면 값이 보임
   - 그래프 아래: 숫자를 보고 자동으로 만든 조언 (처음과 비교, 줄었던 달, 다음 달 목표, 보류·재도전)
   - 오른쪽: 실천 레이스에서 표시한 성공·보류·재도전 개수와 성공률 (이 브라우저에 저장된 표시를 셈)
   - 색: 막대는 보라(primary) 한 가지, 결과 칸은 실천 레이스와 같은 색 + 아이콘 + 글자 */

const statusLooks: Record<string, { color: string; Icon: LucideIcon }> = {
  done: { color: "bg-red text-foreground", Icon: Check },
  hold: { color: "bg-yellow text-foreground", Icon: Pause },
  retry: { color: "bg-green text-foreground", Icon: RotateCw },
};

type Month = { label: string; value: number };
type Advice = { Icon: LucideIcon; text: string };

/** 그래프 숫자와 실천 레이스 표시를 보고 조언 몇 줄 만들기 */
function makeAdvice(months: Month[], unit: string, counts: Record<string, number>): Advice[] {
  const list: Advice[] = [];
  if (months.length < 2) return list;
  const first = months[0];
  const last = months[months.length - 1];

  // 1) 처음과 지금 비교
  if (last.value > first.value) {
    const growth = first.value > 0 ? `${(last.value / first.value).toFixed(1)}배` : `${last.value - first.value}${unit}`;
    list.push({
      Icon: TrendingUp,
      text: `${first.label}(${first.value}${unit})에 비해 ${last.label}은 ${last.value}${unit}로 ${growth} 늘었어요. 꾸준함이 쌓이고 있어요!`,
    });
  } else if (last.value < first.value) {
    list.push({
      Icon: TrendingDown,
      text: `${last.label}은 ${first.label}보다 ${first.value - last.value}${unit} 적어요. 처음 마음을 떠올리며 작은 것 하나부터 다시 시작해 봐요.`,
    });
  }

  // 2) 가장 크게 줄었던 달
  let dropAt = -1;
  let drop = 0;
  for (let i = 1; i < months.length; i++) {
    const d = months[i - 1].value - months[i].value;
    if (d > drop) {
      drop = d;
      dropAt = i;
    }
  }
  if (dropAt > 0) {
    list.push({
      Icon: TrendingDown,
      text: `${months[dropAt].label}은 ${months[dropAt - 1].label}보다 ${drop}${unit} 줄었어요. 바쁜 달엔 목표를 더 작게 쪼개서 '하나라도' 해내는 걸 목표로 해 보세요.`,
    });
  } else {
    list.push({ Icon: TrendingUp, text: "한 번도 줄어든 달이 없어요. 지금 리듬을 그대로 지켜요!" });
  }

  // 3) 다음 달 목표 (평균으로 늘어난 만큼)
  let streak = 0;
  for (let i = months.length - 1; i > 0 && months[i].value > months[i - 1].value; i--) streak++;
  const avgStep = (last.value - first.value) / (months.length - 1);
  const goal = last.value + Math.max(1, Math.round(avgStep));
  list.push({
    Icon: Target,
    text:
      streak >= 2
        ? `최근 ${streak}달 연속 늘고 있어요. 이 흐름이면 다음 달은 ${goal}${unit}에 도전해 볼 만해요!`
        : `다음 달 목표는 ${goal}${unit}! 이번 달보다 딱 하나씩만 더 해 봐요.`,
  });

  // 4) 실천 레이스의 보류·재도전
  const hold = counts.hold ?? 0;
  const retry = counts.retry ?? 0;
  if (hold > 0 && hold >= retry) {
    list.push({ Icon: Lightbulb, text: `보류 중인 실천이 ${hold}개 있어요. 이번 주에 하나만 골라 다시 시작해 봐요.` });
  } else if (retry > 0) {
    list.push({ Icon: Lightbulb, text: `재도전 ${retry}개 — 다시 하는 것도 실천이에요. 가장 작은 단계부터 한 번 더!` });
  }

  return list;
}

/* 그래프 그림 크기 (그림 좌표) */
const W = 600;
const H = 300;
const PAD = { top: 34, right: 12, bottom: 36, left: 34 };

export function AchievementGraph() {
  const data = siteConfig.achievements;
  const months = data.months;
  const game = siteConfig.actionGame;

  const [grown, setGrown] = useState(false); // 화면에 보이면 막대가 자람
  const [hover, setHover] = useState<number | null>(null);
  const [counts, setCounts] = useState<Record<string, number>>({});
  const boxRef = useRef<HTMLDivElement>(null);

  // 화면에 보이면 막대 자라기
  useEffect(() => {
    const el = boxRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setGrown(true);
          io.disconnect();
        }
      },
      { threshold: 0.3 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // 실천 레이스 결과 표시 세기 (바뀔 때마다 다시)
  useEffect(() => {
    const read = () => {
      try {
        const saved: Record<string, string> = JSON.parse(window.localStorage.getItem(STATUS_KEY) ?? "{}");
        const next: Record<string, number> = {};
        for (const key of Object.values(saved)) next[key] = (next[key] ?? 0) + 1;
        setCounts(next);
      } catch {
        setCounts({});
      }
    };
    const timer = setTimeout(read, 0);
    window.addEventListener(STATUS_EVENT, read);
    window.addEventListener("storage", read);
    return () => {
      clearTimeout(timer);
      window.removeEventListener(STATUS_EVENT, read);
      window.removeEventListener("storage", read);
    };
  }, []);

  // 눈금: 최댓값을 보기 좋은 수로 올림
  const maxValue = Math.max(...months.map((m) => m.value), 1);
  const step = maxValue <= 5 ? 1 : maxValue <= 10 ? 2 : Math.ceil(maxValue / 5);
  const top = Math.ceil(maxValue / step) * step;
  const ticks = Array.from({ length: top / step + 1 }, (_, k) => k * step);

  const plotW = W - PAD.left - PAD.right;
  const plotH = H - PAD.top - PAD.bottom;
  const slot = plotW / months.length;
  const barW = Math.min(56, slot * 0.56);
  const y = (v: number) => PAD.top + plotH - (v / top) * plotH;

  // 글자는 최고 달과 마지막 달에만 (모든 막대에 숫자를 달지 않음)
  const peak = months.reduce((best, m, i) => (m.value > months[best].value ? i : best), 0);
  const labeled = new Set([peak, months.length - 1]);
  const change = months[months.length - 1].value - months[0].value;

  const marked = game.statuses.reduce((sum, o) => sum + (counts[o.key] ?? 0), 0);
  const advice = makeAdvice(months, data.unit, counts);
  const rate = marked > 0 ? Math.round(((counts.done ?? 0) / marked) * 100) : null;

  return (
    <div className="relative mt-20">
      {/* 보라 거리 표지판 제목 */}
      <div className="absolute inset-x-0 -top-8 z-20 flex justify-center px-4">
        <p className="relative -rotate-1 rounded-2xl border-[2.5px] border-line bg-primary px-6 py-3 text-center font-display text-xl text-primary-foreground shadow-pop sm:px-10 sm:text-3xl">
          <span aria-hidden className="absolute inset-1.5 rounded-xl border-2 border-line/70" />
          {data.boardTitle}
        </p>
      </div>

      <div className="grid gap-5 rounded-[2rem] border-[3px] border-line bg-card/50 p-4 pt-14 shadow-pop backdrop-blur sm:p-8 sm:pt-16 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        {/* ───── 달마다 성공한 실천 (막대) ───── */}
        <div ref={boxRef} className="rounded-2xl border-[2.5px] border-line bg-card p-4 shadow-pop-sm sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3 className="font-display text-lg text-foreground sm:text-xl">{data.chartTitle}</h3>
            {change > 0 ? (
              <span className="flex items-center gap-1 rounded-full bg-accent px-3 py-1 font-display text-sm text-accent-foreground">
                <TrendingUp className="size-4 text-primary" strokeWidth={3} />
                {months[0].label}보다 +{change}
                {data.unit}
              </span>
            ) : null}
          </div>

          <div className="relative mt-4">
            <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label={`${data.chartTitle} 막대 그래프`}>
              {/* 눈금선 (흐리게) */}
              {ticks.map((t) => (
                <g key={t}>
                  <line x1={PAD.left} x2={W - PAD.right} y1={y(t)} y2={y(t)} className="stroke-border" strokeWidth={t === 0 ? 2 : 1} />
                  <text x={PAD.left - 8} y={y(t)} dy="0.35em" textAnchor="end" className="fill-muted-foreground text-[13px]">
                    {t}
                  </text>
                </g>
              ))}

              {/* 막대 (위쪽만 둥글게, 바닥에 붙음) */}
              {months.map((m, i) => {
                const cx = PAD.left + slot * (i + 0.5);
                const h = (m.value / top) * plotH;
                const x = cx - barW / 2;
                const yb = PAD.top + plotH;
                const r = Math.min(6, h / 2);
                const d = `M${x},${yb} V${yb - h + r} Q${x},${yb - h} ${x + r},${yb - h} H${x + barW - r} Q${x + barW},${yb - h} ${x + barW},${yb - h + r} V${yb} Z`;
                return (
                  <g key={m.label}>
                    <path
                      d={d}
                      className={cn(
                        "origin-bottom fill-primary transition-[transform,opacity] duration-700 ease-out [transform-box:fill-box]",
                        grown ? "scale-y-100" : "scale-y-0",
                        hover !== null && hover !== i && "opacity-50",
                      )}
                      style={{ transitionDelay: `${i * 90}ms` }}
                    />
                    {labeled.has(i) ? (
                      <text
                        x={cx}
                        y={yb - h - 8}
                        textAnchor="middle"
                        className={cn("fill-foreground font-display text-[15px] transition-opacity duration-500", grown ? "opacity-100" : "opacity-0")}
                        style={{ transitionDelay: `${months.length * 90 + 200}ms` }}
                      >
                        {m.value}
                        {data.unit}
                      </text>
                    ) : null}
                    <text x={cx} y={H - 10} textAnchor="middle" className="fill-muted-foreground text-[13px]">
                      {m.label}
                    </text>
                    {/* 마우스 올리는 자리 (막대보다 넓게) */}
                    <rect
                      x={PAD.left + slot * i}
                      y={PAD.top}
                      width={slot}
                      height={plotH}
                      fill="transparent"
                      onMouseEnter={() => setHover(i)}
                      onMouseLeave={() => setHover(null)}
                    />
                  </g>
                );
              })}
            </svg>

            {/* 말풍선 */}
            {hover !== null ? (
              <div
                className="pointer-events-none absolute -translate-x-1/2 -translate-y-full rounded-xl border-2 border-line bg-foreground px-3 py-1.5 font-display text-sm text-card shadow-pop-sm"
                style={{
                  left: `${((PAD.left + slot * (hover + 0.5)) / W) * 100}%`,
                  top: `${(y(months[hover].value) / H) * 100 - 3}%`,
                }}
              >
                {months[hover].label} · {months[hover].value}
                {data.unit}
              </div>
            ) : null}
          </div>

          {/* 그래프가 알려주는 조언 */}
          {advice.length > 0 ? (
            <div className="mt-5 rounded-2xl bg-accent/70 p-4">
              <p className="flex items-center gap-1.5 font-display text-base text-foreground">
                <Lightbulb className="size-5 text-primary" />
                {data.adviceTitle}
              </p>
              <ul className="mt-3 space-y-2.5">
                {advice.map((a, i) => (
                  <li key={i} className="flex gap-2.5 text-sm leading-relaxed text-foreground sm:text-base">
                    <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-card text-primary shadow-pop-sm">
                      <a.Icon className="size-3.5" strokeWidth={2.5} />
                    </span>
                    <span>{a.text}</span>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          {/* 표로 보기 (화면 읽기 프로그램용) */}
          <table className="sr-only">
            <caption>{data.chartTitle}</caption>
            <tbody>
              {months.map((m) => (
                <tr key={m.label}>
                  <th scope="row">{m.label}</th>
                  <td>
                    {m.value}
                    {data.unit}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* ───── 실천 레이스 결과 한눈에 ───── */}
        <div className="flex flex-col gap-3">
          <div className="lift rounded-2xl border-[2.5px] border-line bg-card p-4 text-center shadow-pop-sm">
            <p className="font-display text-sm text-muted-foreground">{data.rateLabel}</p>
            <p className="font-display text-5xl text-foreground">{rate === null ? "–" : <CountUp value={rate} suffix="%" />}</p>
            <p className="mt-1 text-xs text-muted-foreground">
              {marked > 0 ? `${data.statusTitle} ${marked}개 중 성공 ${counts.done ?? 0}개` : data.emptyStatus}
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {game.statuses.map((option) => {
              const look = statusLooks[option.key];
              return (
                <div
                  key={option.key}
                  className="lift flex items-center gap-2 rounded-2xl border-[2.5px] border-line bg-card p-3 shadow-pop-sm"
                >
                  <span className={cn("flex size-9 shrink-0 items-center justify-center rounded-full", look?.color)}>
                    {look ? <look.Icon className="size-5" strokeWidth={3} /> : null}
                  </span>
                  <span className="min-w-0">
                    <span className="block font-display text-xs text-muted-foreground">{option.label}</span>
                    <span className="block font-display text-2xl leading-none text-foreground">
                      <CountUp value={counts[option.key] ?? 0} />
                    </span>
                  </span>
                </div>
              );
            })}
          </div>

          {/* 아래: 잘했다고 축하해 주는 캐릭터 (오른쪽 칸 가운데) */}
          <Mascot
            className="mt-auto justify-center pt-4"
            side="left"
           
            messages={[
              `${months[months.length - 1].label}에 ${months[months.length - 1].value}${data.unit}! 정말 잘했어요!`,
              change > 0 ? `${months[0].label}보다 ${change}${data.unit} 늘었어요. 축하해요!` : "꾸준히 하는 게 제일 멋져요!",
              "오늘의 나도 최고예요!",
            ]}
          />
        </div>
      </div>
    </div>
  );
}
