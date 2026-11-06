"use client";

import { useState } from "react";
import { RotateCcw, Sparkles, Star, Trophy } from "lucide-react";

import { siteConfig } from "@/site.config";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { TrophyFountain } from "@/components/ui/trophy-fountain";
import { AchievementArt, artFor } from "@/components/ui/achievement-art";
import { Mascot } from "@/components/ui/mascot";

/* 나의 성과 자판기 — 04 결과 섹션 안에 들어가는 '집게 자판기' + 옆의 성과 트로피.
   ('북페어링' 포스터처럼 상품이 진열된 자판기에, 위 레일을 따라 움직이는 집게가 달려 있음)
   - 진열칸의 상품 = 내가 얻은 성과 (prizes, 관리자 「성과 (트로피)」 탭의 카드 제목)
     상품 그림은 성과 글자에 맞춰 골라짐 (components/ui/achievement-art.tsx)
   - 상품을 눌러 고른 뒤 '선택해서 담기' → 집게가 가서 집어 올린 뒤 툭 떨어뜨림 → 꺼내는 곳 → 트로피
   - 오른쪽 위(넓은 화면) 또는 트로피 위(작은 화면)에 응원하는 캐릭터
   - 글자: site.config.ts 의 clawGame
   - 색: 몸통 = 파스텔 빨강, 위 간판 = 진한 남색, 아래 이름판 = 파스텔 초록, 상품마다 사이트 토큰 색 */

const productLooks = ["bg-primary/80", "bg-pink/80", "bg-sky/80", "bg-teal/80", "bg-orange/80", "bg-yellow"];
const COLS = 3;
const TOP_SPACE = "3.5rem"; // 진열칸 위, 집게가 매달려 있는 자리

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/** 진열칸 상품 하나 (색 상자 + 손그림 + 큰 이름표) */
function Product({ label, index, className }: { label: string; index: number; className?: string }) {
  return (
    <span
      className={cn(
        "relative flex aspect-[3/4] w-full flex-col overflow-hidden rounded-xl border-[2.5px] border-line p-1.5 shadow-pop-sm",
        productLooks[index % productLooks.length],
        className,
      )}
    >
      {/* 상자 윗면 빛 */}
      <span aria-hidden className="absolute inset-x-2 top-1 z-10 h-1.5 rounded-full bg-card/40" />
      {/* 그림 */}
      <span className="flex min-h-0 flex-1 items-center justify-center rounded-lg bg-card/85 p-1">
        <AchievementArt kind={artFor(label, index)} />
      </span>
      {/* 이름표 */}
      <span className="mt-1.5 line-clamp-2 rounded-md bg-card px-1 py-1 text-center font-display text-xs leading-tight text-foreground sm:text-sm">
        {label}
      </span>
    </span>
  );
}

export function ClawMachine({ prizes }: { prizes: string[] }) {
  const game = siteConfig.clawGame;
  const rows = Math.ceil(prizes.length / COLS);

  const [taken, setTaken] = useState<number[]>([]); // 트로피에 담긴 순서
  const [selected, setSelected] = useState<number | null>(null);
  const [busy, setBusy] = useState(false);
  const [clawX, setClawX] = useState(50); // 집게 가로 위치 (%)
  const [rope, setRope] = useState("0.25rem"); // 집게 줄 길이
  const [closed, setClosed] = useState(false);
  const [holding, setHolding] = useState<number | null>(null);
  const [dropping, setDropping] = useState(false);
  const [tray, setTray] = useState<number | null>(null); // 방금 꺼낸 상품
  const [message, setMessage] = useState(game.hint);
  const [celebrate, setCelebrate] = useState(0); // 담을 때마다 1씩 늘려 축하 효과를 다시 터뜨림

  const left = prizes.length - taken.length;

  function choose(i: number) {
    if (busy || taken.includes(i)) return;
    setSelected(i);
    setMessage(`“${prizes[i]}”을(를) 골랐어요. ‘${game.pickLabel}’를 눌러 주세요!`);
  }

  async function pick() {
    const i = selected;
    if (busy || i === null) return;
    const col = i % COLS;
    const row = Math.floor(i / COLS);
    setBusy(true);
    setSelected(null);
    setMessage(`집게가 “${prizes[i]}”을(를) 향해 가요…`);

    setClawX(((col + 0.5) / COLS) * 100); // 그 상품 위로
    await sleep(650);
    setRope(`calc(${row} * (100% - ${TOP_SPACE}) / ${rows} + 1rem)`); // 내려가기
    await sleep(650);
    setClosed(true); // 집기
    setHolding(i);
    await sleep(300);
    setRope("0.25rem"); // 올라가기
    await sleep(650);
    setClawX(50); // 가운데로
    await sleep(550);
    setClosed(false); // 놓기 → 툭 떨어짐
    setDropping(true);
    await sleep(700);
    setDropping(false);
    setHolding(null);
    const next = [...taken, i];
    setTaken(next);
    setTray(i);
    setCelebrate((n) => n + 1);
    setMessage(next.length === prizes.length ? game.doneMessage : `“${prizes[i]}”을(를) 트로피에 담았어요!`);
    setBusy(false);
  }

  function reset() {
    if (busy) return;
    setTaken([]);
    setSelected(null);
    setTray(null);
    setMessage(game.hint);
  }

  return (
    <div className="relative mt-20">
      {/* 분홍 거리 표지판 제목 — 자판기와 트로피 전체의 가운데 위 */}
      <div className="absolute inset-x-0 -top-8 z-20 flex justify-center px-4">
        <p className="relative -rotate-1 rounded-2xl border-[2.5px] border-line bg-pink px-6 py-3 text-center font-display text-xl text-card shadow-pop sm:px-10 sm:text-3xl">
          <span aria-hidden className="absolute inset-1.5 rounded-xl border-2 border-line/70" />
          {game.title}
        </p>
      </div>

      <div className="relative rounded-[2rem] border-[3px] border-line bg-card/50 p-4 pt-14 shadow-pop backdrop-blur sm:p-8 sm:pt-16">
        <div className="relative grid items-end gap-10 lg:grid-cols-[minmax(0,1fr)_17rem]">
          {/* ───────── 성과 자판기 ───────── */}
          <div className="relative mx-auto w-full max-w-xl">

            <div className="rounded-[2rem] border-[3px] border-line bg-red/80 p-3 shadow-pop sm:p-4">
              {/* 위 간판 (글자 사이를 넓게) */}
              <p className="rounded-2xl bg-foreground/85 px-3 py-3 text-center font-display text-base tracking-[0.35em] text-card sm:text-2xl sm:tracking-[0.5em]">
                {game.vendingTitle}
              </p>

              {/* 진열창 */}
              <div className="relative mt-3 overflow-hidden rounded-2xl border-[2.5px] border-line bg-card/85 p-3 sm:p-4">
                {/* 유리에 비친 빛줄기 */}
                <div
                  aria-hidden
                  className="pointer-events-none absolute inset-0 z-10 bg-[repeating-linear-gradient(120deg,transparent_0_80px,color-mix(in_oklab,var(--card)_55%,transparent)_80px_92px,transparent_92px_140px)]"
                />

                <div className="relative" style={{ paddingTop: TOP_SPACE }}>
                  {/* 집게 레일 */}
                  <div aria-hidden className="absolute inset-x-0 top-0 h-2.5 rounded-full bg-orange" />

                  <ul className="grid grid-cols-3 gap-x-3 gap-y-4 sm:gap-x-5">
                    {prizes.map((label, i) => {
                      const gone = taken.includes(i) || holding === i;
                      const isSelected = selected === i;
                      return (
                        <li key={i} className="flex flex-col items-center">
                          {gone ? (
                            // 꺼낸 자리
                            <span className="flex aspect-[3/4] w-full items-center justify-center rounded-xl border-2 border-dashed border-border font-display text-xs text-muted-foreground sm:text-sm">
                              {game.soldLabel}
                            </span>
                          ) : (
                            <button
                              type="button"
                              onClick={() => choose(i)}
                              disabled={busy}
                              aria-pressed={isSelected}
                              aria-label={`${label} 고르기`}
                              className={cn(
                                "w-full rounded-xl transition-transform hover:-translate-y-1 disabled:cursor-wait",
                                isSelected && "-translate-y-2 ring-4 ring-primary ring-offset-2",
                              )}
                            >
                              <Product label={label} index={i} />
                            </button>
                          )}
                          {/* 진열 선반 (용수철) */}
                          <span
                            aria-hidden
                            className="mt-1.5 h-2 w-full rounded-full bg-[repeating-linear-gradient(90deg,color-mix(in_oklab,var(--foreground)_25%,transparent)_0_3px,transparent_3px_7px)] bg-foreground/10"
                          />
                        </li>
                      );
                    })}
                  </ul>

                  {/* 집게 (레일을 따라 움직이고 줄이 늘었다 줄었다) */}
                  <div
                    aria-hidden
                    className="pointer-events-none absolute inset-y-0 z-20 flex w-[26%] -translate-x-1/2 flex-col items-center transition-[left] duration-500 ease-in-out sm:w-[22%]"
                    style={{ left: `${clawX}%` }}
                  >
                    <div className="w-1.5 shrink-0 bg-orange transition-[height] duration-[600ms] ease-in-out" style={{ height: rope }} />
                    <div className="relative flex w-full flex-col items-center">
                      <div className="h-3 w-1/4 rounded-t-md border-2 border-line bg-orange" />
                      <div className="h-4 w-1/2 rounded-md border-2 border-line bg-orange" />
                      {/* 집게 팔 2개 (벌렸다 오므림) */}
                      <span
                        className={cn(
                          "absolute left-[22%] top-[calc(100%-4px)] z-10 h-10 w-2.5 origin-top rounded-full border-2 border-line bg-sky transition-transform duration-300",
                          closed ? "rotate-[-8deg]" : "rotate-[28deg]",
                        )}
                      />
                      <span
                        className={cn(
                          "absolute right-[22%] top-[calc(100%-4px)] z-10 h-10 w-2.5 origin-top rounded-full border-2 border-line bg-sky transition-transform duration-300",
                          closed ? "rotate-[8deg]" : "rotate-[-28deg]",
                        )}
                      />
                      {/* 집은 상품 (놓으면 툭 떨어짐) */}
                      {holding !== null ? (
                        <span className={cn("absolute top-[calc(100%+0.25rem)] w-[90%]", dropping && "animate-dropout")}>
                          <Product label={prizes[holding]} index={holding} />
                        </span>
                      ) : null}
                    </div>
                  </div>
                </div>
              </div>

              {/* 아래: 꺼내는 곳(왼쪽) + 버튼(오른쪽) 한 줄 */}
              <div className="mt-3 flex items-stretch gap-2">
                <div className="flex min-w-0 flex-1 items-center gap-2 rounded-xl border-[2.5px] border-line bg-foreground/75 px-3 py-2">
                  <span className="shrink-0 font-display text-[10px] tracking-widest text-card/60">{game.trayLabel}</span>
                  {tray !== null ? (
                    <span
                      key={`${tray}-${celebrate}`}
                      className="flex min-w-0 items-center gap-1.5 truncate rounded-lg bg-card px-2.5 py-1 font-display text-sm text-foreground animate-in fade-in slide-in-from-top-6 duration-500"
                    >
                      <Trophy className="size-3.5 shrink-0 text-orange" />
                      <span className="truncate">{prizes[tray]}</span>
                    </span>
                  ) : null}
                </div>
                {left > 0 ? (
                  <Button type="button" size="sm" className="h-auto shrink-0 px-4" onClick={pick} disabled={busy || selected === null}>
                    {game.pickLabel}
                  </Button>
                ) : null}
                {taken.length > 0 ? (
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    className="h-auto shrink-0 px-3"
                    onClick={reset}
                    disabled={busy}
                    aria-label={game.resetLabel}
                    title={game.resetLabel}
                  >
                    <RotateCcw />
                  </Button>
                ) : null}
              </div>
              {/* 안내 한 줄 (작게) */}
              <p aria-live="polite" className="mt-2 px-1 text-center text-xs text-foreground/70 sm:text-sm">
                {message}
              </p>
            </div>
            {/* 다리 */}
            <div aria-hidden className="flex justify-between px-10">
              <span className="h-5 w-10 rounded-b-xl border-4 border-t-0 border-line bg-red" />
              <span className="h-5 w-10 rounded-b-xl border-4 border-t-0 border-line bg-red" />
            </div>
          </div>

          {/* ───────── 성과 트로피 ───────── */}
          <div className="mx-auto w-full max-w-xs">
            {/* 트로피 위: 응원하는 캐릭터 (말풍선은 왼쪽) */}
            <Mascot className="mb-1 justify-center" side="left" messages={game.mascotMessages} />
            <p className="text-center font-display text-xl text-foreground">
              {game.trophyTitle}{" "}
              <span className="text-primary">
                {taken.length}/{prizes.length}
              </span>
            </p>

            <div className="relative mx-auto mt-2 h-80 w-64">
              {/* 담을 때마다 트로피에서 색종이 분수 + 빛 고리 + "+1" (실천 레이스 폭죽과 다른 모양) */}
              {celebrate > 0 ? (
                <TrophyFountain key={celebrate} label={game.trophyCheer} className="-inset-x-10 -top-16 bottom-16" />
              ) : null}
              {/* 트로피가 차면 반짝반짝 */}
              {taken.length > 0 ? (
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
                {taken.map((i) => (
                  <span
                    key={i}
                    className={cn(
                      "max-w-[7rem] truncate rounded-lg border-2 border-line px-2 py-1.5 font-display text-xs text-foreground shadow-pop-sm animate-in fade-in zoom-in-50 duration-500",
                      productLooks[i % productLooks.length],
                    )}
                  >
                    {prizes[i]}
                  </span>
                ))}
              </div>

              {/* 컵 테두리 */}
              <span aria-hidden className="absolute bottom-[14.25rem] left-1/2 z-20 h-6 w-48 -translate-x-1/2 rounded-full border-[2.5px] border-line bg-orange shadow-pop-sm" />
              {/* 컵 */}
              <div className="absolute bottom-24 left-1/2 z-20 flex h-[8.5rem] w-44 -translate-x-1/2 items-center justify-center overflow-hidden rounded-b-[45%] rounded-t-md border-[2.5px] border-line bg-linear-to-b from-orange to-pink shadow-pop">
                <span aria-hidden className="absolute bottom-3 left-4 top-3 w-3 rounded-full bg-card/40" />
                <Star aria-hidden className="size-12 fill-card/90 text-card" />
              </div>
              {/* 기둥 + 받침 */}
              <span aria-hidden className="absolute bottom-14 left-1/2 z-10 h-11 w-7 -translate-x-1/2 border-x-4 border-line bg-orange" />
              <span aria-hidden className="absolute bottom-12 left-1/2 z-20 h-4 w-20 -translate-x-1/2 rounded-full border-[2.5px] border-line bg-pink" />
              <div className="absolute bottom-0 left-1/2 z-20 flex h-12 w-40 -translate-x-1/2 items-center justify-center rounded-xl border-[2.5px] border-line bg-primary shadow-pop">
                <span className="rounded-md bg-card px-3 py-0.5 font-display text-xs tracking-widest text-primary">
                  {game.trophyPlate}
                </span>
              </div>
            </div>

            {/* 담긴 성과 이름 */}
            {taken.length > 0 ? (
              <ul className="mt-4 flex flex-wrap justify-center gap-1.5">
                {taken.map((i) => (
                  <li
                    key={i}
                    className="rounded-full border bg-card px-3 py-1 font-display text-sm text-foreground animate-in fade-in zoom-in-75"
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
