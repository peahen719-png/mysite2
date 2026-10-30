"use client";

import { useState } from "react";
import { RotateCcw, Sparkles, Star } from "lucide-react";

import { siteConfig } from "@/site.config";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Celebration } from "@/components/ui/celebration";

/* 성과 뽑기 기계 — 04 결과 섹션 안에 들어가는 뽑기 기계 + 옆의 성과 트로피.
   - 기계 안의 캡슐 = 내가 얻은 성과 (prizes, 관리자 「성과 (트로피)」 탭의 카드 제목)
   - 캡슐을 눌러 고른 뒤 '선택해서 담기' → 집게가 꺼내서 트로피에 담음
   - 글자: site.config.ts 의 clawGame
   - 모양: 위 가운데 분홍 표지판(clawGame.title) 아래에 기계와 트로피가 나란히
   - 색: 보라 기계 몸통, 하늘 차양, 주황→분홍 트로피 (사이트 토큰) */

const capsuleColors = [
  { top: "bg-pink", ring: "ring-pink" },
  { top: "bg-sky", ring: "ring-sky" },
  { top: "bg-orange", ring: "ring-orange" },
  { top: "bg-teal", ring: "ring-teal" },
  { top: "bg-primary", ring: "ring-primary" },
];

/* 기계 안에서 캡슐이 놓이는 자리 (가로 %, 바닥에서 %). 오른쪽 아래는 꺼내는 곳이라 비워 둠 */
const slots = [
  { x: 14, b: 3 },
  { x: 38, b: 3 },
  { x: 62, b: 3 },
  { x: 26, b: 21 },
  { x: 50, b: 21 },
  { x: 74, b: 21 },
  { x: 14, b: 39 },
  { x: 38, b: 39 },
  { x: 62, b: 39 },
]; // 9자리 → 캡슐은 최대 9개 (result-trophy.tsx 에서 잘라서 넘김)

const EXIT_X = 89; // 꺼내는 곳 위치 (가로 %)
const ROPE_UP = 6; // 집게가 올라가 있을 때 줄 길이 (기계 높이의 %)

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/** 위는 색, 아래는 흰색인 뽑기 캡슐 + 성과 글자 */
function Capsule({ label, index, small, className }: { label: string; index: number; small?: boolean; className?: string }) {
  const color = capsuleColors[index % capsuleColors.length];
  return (
    <span
      className={cn(
        "relative flex flex-col overflow-hidden rounded-full border-4 border-card bg-card shadow-pop-sm",
        className,
      )}
    >
      <span aria-hidden className={cn("absolute inset-x-0 top-0 h-1/2", color.top)} />
      <span aria-hidden className="absolute left-[12%] top-[10%] h-[18%] w-[26%] -rotate-12 rounded-full bg-card/60" />
      <span
        className={cn(
          "relative m-auto line-clamp-2 rounded-full bg-card/95 text-center font-display leading-tight text-foreground",
          small ? "px-2 py-0.5 text-[11px]" : "px-1 py-0.5 text-[10px] sm:px-2 sm:text-sm",
        )}
      >
        {label}
      </span>
    </span>
  );
}

export function ClawMachine({ prizes }: { prizes: string[] }) {
  const game = siteConfig.clawGame;
  const all = prizes.map((_, i) => i);

  const [inMachine, setInMachine] = useState<number[]>(all);
  const [trophy, setTrophy] = useState<number[]>([]);
  const [selected, setSelected] = useState<number | null>(null);
  const [clawX, setClawX] = useState(50);
  const [rope, setRope] = useState(ROPE_UP);
  const [closed, setClosed] = useState(false);
  const [holding, setHolding] = useState<number | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState(game.hint);
  const [celebrate, setCelebrate] = useState(0); // 담을 때마다 1씩 늘려 축하 효과를 다시 터뜨림

  function choose(i: number) {
    if (busy) return;
    setSelected(i);
    setMessage(`“${prizes[i]}”을(를) 골랐어요. ‘${game.pickLabel}’를 눌러 주세요!`);
  }

  async function pick() {
    const i = selected;
    if (busy || i === null || !inMachine.includes(i)) return;
    const slot = slots[i % slots.length];
    const label = prizes[i];
    setBusy(true);
    setMessage(`집게가 “${label}”을(를) 향해 가요…`);

    setClawX(slot.x); // 위로 이동
    await sleep(750);
    setRope(Math.max(ROPE_UP, 100 - slot.b - 38)); // 내려가기
    await sleep(750);
    setClosed(true); // 집기
    setHolding(i);
    setSelected(null);
    setInMachine((list) => list.filter((n) => n !== i));
    await sleep(350);
    setRope(ROPE_UP); // 올라가기
    await sleep(750);
    setClawX(EXIT_X); // 꺼내는 곳으로
    await sleep(750);
    setClosed(false); // 놓기 → 트로피로
    setHolding(null);
    const next = [...trophy, i];
    setTrophy(next);
    setCelebrate((n) => n + 1);
    setMessage(next.length === prizes.length ? game.doneMessage : `“${label}”을(를) 트로피에 담았어요!`);
    await sleep(400);
    setClawX(50);
    setBusy(false);
  }

  function reset() {
    if (busy) return;
    setInMachine(all);
    setTrophy([]);
    setSelected(null);
    setMessage(game.hint);
  }

  return (
    <div className="relative mt-20">
      {/* 분홍 거리 표지판 제목 — 기계와 트로피 전체의 가운데 위 */}
      <div className="absolute inset-x-0 -top-8 z-20 flex justify-center px-4">
        <p className="relative -rotate-1 rounded-2xl border-4 border-card bg-pink px-6 py-3 text-center font-display text-xl text-card shadow-pop sm:px-10 sm:text-3xl">
          <span aria-hidden className="absolute inset-1.5 rounded-xl border-2 border-card/70" />
          {game.title}
        </p>
      </div>

      <div className="rounded-[2rem] border-[6px] border-card bg-card/50 p-4 pt-14 shadow-pop backdrop-blur sm:p-8 sm:pt-16">
        <div className="relative grid items-end gap-10 lg:grid-cols-[minmax(0,1fr)_17rem]">
          {/* ───────── 뽑기 기계 ───────── */}
          <div className="mx-auto w-full max-w-xl">
            {/* 기계 몸통 */}
            <div className="rounded-[2rem] border-[6px] border-card bg-primary p-3 shadow-pop sm:p-4">
              {/* 하늘색 차양 (아래가 물결 모양) */}
              <div aria-hidden className="h-5 rounded-t-xl bg-sky" />
              <div
                aria-hidden
                className="h-3 bg-[radial-gradient(circle_at_50%_0,var(--sky)_9px,transparent_10px)] bg-size-[22px_12px] bg-repeat-x"
              />

              {/* 유리 상자 */}
              <div className="relative mt-1 aspect-[4/3] overflow-hidden rounded-xl border-4 border-card bg-linear-to-b from-secondary/70 to-card">
                {/* 유리에 비친 빛줄기 */}
                <div
                  aria-hidden
                  className="absolute inset-0 bg-[repeating-linear-gradient(135deg,transparent_0_56px,color-mix(in_oklab,var(--card)_70%,transparent)_56px_64px,transparent_64px_80px,color-mix(in_oklab,var(--card)_50%,transparent)_80px_84px)]"
                />
                {/* 바닥에 쌓인 구름 더미 */}
                <div aria-hidden className="absolute inset-x-0 bottom-0 h-[22%]">
                  <span className="absolute -bottom-[30%] left-[-6%] h-full w-[38%] rounded-full bg-pink/25" />
                  <span className="absolute -bottom-[40%] left-[24%] h-[120%] w-[40%] rounded-full bg-sky/25" />
                  <span className="absolute -bottom-[30%] left-[56%] h-full w-[36%] rounded-full bg-primary/20" />
                </div>
                {/* 집게가 매달린 레일 */}
                <div aria-hidden className="absolute inset-x-0 top-0 h-3 bg-orange" />

                {/* 꺼내는 곳 */}
                <div
                  aria-hidden
                  className="absolute bottom-0 right-[2%] flex h-[16%] w-[16%] items-start justify-center rounded-t-2xl border-4 border-b-0 border-primary/40 bg-primary/10 pt-1 font-display text-[10px] text-primary sm:text-xs"
                >
                  OUT
                </div>

                {/* 성과 캡슐 (눌러서 고르기) */}
                {inMachine.map((i) => {
                  const slot = slots[i % slots.length];
                  const isSelected = selected === i;
                  return (
                    <button
                      key={i}
                      type="button"
                      onClick={() => choose(i)}
                      disabled={busy}
                      aria-pressed={isSelected}
                      aria-label={`${prizes[i]} 고르기`}
                      className={cn(
                        "absolute w-[23%] -translate-x-1/2 rounded-full transition-transform hover:-translate-y-1 disabled:cursor-wait",
                        isSelected && "z-10 -translate-y-2 scale-110",
                      )}
                      style={{ left: `${slot.x}%`, bottom: `${slot.b}%` }}
                    >
                      <Capsule
                        label={prizes[i]}
                        index={i}
                        className={cn(
                          "aspect-[5/3] w-full sm:aspect-[2/1]",
                          isSelected && cn("ring-4 ring-offset-2", capsuleColors[i % capsuleColors.length].ring),
                        )}
                      />
                    </button>
                  );
                })}

                {/* 집게 */}
                <div
                  aria-hidden
                  className="pointer-events-none absolute inset-y-0 z-20 flex w-[18%] -translate-x-1/2 flex-col items-center transition-[left] duration-700 ease-in-out"
                  style={{ left: `${clawX}%` }}
                >
                  <div
                    className="w-1.5 shrink-0 bg-orange transition-[height] duration-700 ease-in-out"
                    style={{ height: `${rope}%` }}
                  />
                  <div className="relative flex w-full flex-col items-center">
                    <div className="h-3 w-1/3 rounded-t-md border-2 border-card bg-orange" />
                    <div className="h-4 w-2/3 rounded-md border-2 border-card bg-orange" />
                    {/* 집게 팔 2개 (벌렸다 오므림) */}
                    <span
                      className={cn(
                        "absolute left-[14%] top-[calc(100%-4px)] h-10 w-2.5 origin-top rounded-full border-2 border-card bg-sky transition-transform duration-300 sm:h-12",
                        closed ? "rotate-[-6deg]" : "rotate-[28deg]",
                      )}
                    />
                    <span
                      className={cn(
                        "absolute right-[14%] top-[calc(100%-4px)] h-10 w-2.5 origin-top rounded-full border-2 border-card bg-sky transition-transform duration-300 sm:h-12",
                        closed ? "rotate-[6deg]" : "rotate-[-28deg]",
                      )}
                    />
                    {/* 집은 캡슐 */}
                    {holding !== null ? (
                      <Capsule
                        label={prizes[holding]}
                        index={holding}
                        className="absolute top-[calc(100%+0.75rem)] aspect-[2/1] w-[130%]"
                      />
                    ) : null}
                  </div>
                </div>
              </div>

              {/* 안내 + 버튼 */}
              <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
                <p
                  aria-live="polite"
                  className="flex-1 rounded-2xl border-4 border-card bg-card px-4 py-3 font-display text-sm text-foreground sm:text-base"
                >
                  {message}
                </p>
                <div className="flex shrink-0 gap-2">
                  {inMachine.length > 0 ? (
                    <Button type="button" variant="outline" onClick={pick} disabled={busy || selected === null}>
                      {game.pickLabel}
                    </Button>
                  ) : null}
                  {trophy.length > 0 ? (
                    <Button type="button" variant="secondary" onClick={reset} disabled={busy}>
                      <RotateCcw />
                      {game.resetLabel}
                    </Button>
                  ) : null}
                </div>
              </div>
            </div>
            {/* 다리 */}
            <div aria-hidden className="flex justify-between px-10">
              <span className="h-5 w-10 rounded-b-xl border-4 border-t-0 border-card bg-primary" />
              <span className="h-5 w-10 rounded-b-xl border-4 border-t-0 border-card bg-primary" />
            </div>
          </div>

          {/* ───────── 성과 트로피 ───────── */}
          <div className="mx-auto w-full max-w-xs">
            <p className="text-center font-display text-xl text-foreground">
              {game.trophyTitle}{" "}
              <span className="text-primary">
                {trophy.length}/{prizes.length}
              </span>
            </p>

            <div className="relative mx-auto mt-2 h-80 w-64">
            {/* 담을 때마다 별이 쏟아지고 폭죽이 터짐 */}
            {celebrate > 0 ? <Celebration key={celebrate} className="-inset-x-10 -top-16 bottom-16" /> : null}
              {/* 트로피가 차면 반짝반짝 */}
              {trophy.length > 0 ? (
                <div aria-hidden className="absolute inset-0 z-30">
                  <Sparkles className="absolute left-2 top-20 size-6 animate-pulse text-orange" />
                  <Sparkles className="absolute right-3 top-28 size-5 animate-pulse text-pink [animation-delay:0.5s]" />
                  <Star className="absolute right-10 top-12 size-4 animate-pulse fill-sky text-sky [animation-delay:1s]" />
                </div>
              ) : null}

              {/* 손잡이 (컵 뒤) */}
              <span aria-hidden className="absolute bottom-[9.5rem] left-1 z-10 size-16 rounded-full border-[10px] border-orange" />
              <span aria-hidden className="absolute bottom-[9.5rem] right-1 z-10 size-16 rounded-full border-[10px] border-orange" />

              {/* 담긴 성과 (컵 위로 빼꼼) */}
              <div className="absolute inset-x-8 bottom-[15rem] z-10 flex flex-wrap-reverse justify-center gap-1">
                {trophy.map((i) => (
                  <Capsule
                    key={i}
                    label={prizes[i]}
                    index={i}
                    small
                    className="h-9 max-w-[7rem] px-1 animate-in fade-in zoom-in-50 duration-500"
                  />
                ))}
              </div>

              {/* 컵 테두리 */}
              <span aria-hidden className="absolute bottom-[14.25rem] left-1/2 z-20 h-6 w-48 -translate-x-1/2 rounded-full border-4 border-card bg-orange shadow-pop-sm" />
              {/* 컵 */}
              <div className="absolute bottom-24 left-1/2 z-20 flex h-[8.5rem] w-44 -translate-x-1/2 items-center justify-center overflow-hidden rounded-b-[45%] rounded-t-md border-4 border-card bg-linear-to-b from-orange to-pink shadow-pop">
                <span aria-hidden className="absolute bottom-3 left-4 top-3 w-3 rounded-full bg-card/40" />
                <Star aria-hidden className="size-12 fill-card/90 text-card" />
              </div>
              {/* 기둥 + 받침 */}
              <span aria-hidden className="absolute bottom-14 left-1/2 z-10 h-11 w-7 -translate-x-1/2 border-x-4 border-card bg-orange" />
              <span aria-hidden className="absolute bottom-12 left-1/2 z-20 h-4 w-20 -translate-x-1/2 rounded-full border-4 border-card bg-pink" />
              <div className="absolute bottom-0 left-1/2 z-20 flex h-12 w-40 -translate-x-1/2 items-center justify-center rounded-xl border-4 border-card bg-primary shadow-pop">
                <span className="rounded-md bg-card px-3 py-0.5 font-display text-xs tracking-widest text-primary">
                  {game.trophyPlate}
                </span>
              </div>
            </div>

            {/* 담긴 성과 이름 */}
            {trophy.length > 0 ? (
              <ul className="mt-4 flex flex-wrap justify-center gap-1.5">
                {trophy.map((i) => (
                  <li
                    key={i}
                    className="rounded-full border bg-card px-3 py-1 font-display text-xs text-foreground animate-in fade-in zoom-in-75"
                  >
                    {prizes[i]}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-4 text-center font-display text-sm text-muted-foreground">{game.trophyEmpty}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
