"use client";

import { useState } from "react";
import { DoorOpen, PackageOpen, RotateCcw } from "lucide-react";

import { siteConfig } from "@/site.config";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { TrophyFountain } from "@/components/ui/trophy-fountain";
import { HanokArt, hanokArtFor } from "@/components/ui/hanok-art";
import { Mascot } from "@/components/ui/mascot";

/* 성취 서가 — 04 결과 섹션 안의 기와지붕 얹은 '서가' + 옆의 '나무 보물함'.
   - 처음엔 서가의 창살 문 두 짝이 닫혀 있고, 누르면 양옆으로 천천히 열린 뒤 스르르 사라짐 (app/globals.css 의 shelf-door)
   - 서가 칸의 소품 = 내가 얻은 성취 (prizes, 관리자 「성과 (트로피)」 탭의 카드 제목)
     소품 그림은 글자에 맞춰 골라짐 (components/ui/hanok-art.tsx — 짚신, 고서, 교지, 엽전 …)
   - 소품을 눌러 고른 뒤 '함에 담기' → 소품이 날아가 보물함에 쏙 → 함 위로 축하 꽃가루
   - 담긴 소품은 함 위로 살짝 삐져나와 보이고, 함 앞 이름판에 담긴 개수가 보임
   - 글자: site.config.ts 의 clawGame
   - 예전 자판기 모양으로 되돌리려면 components/sections/result-trophy.tsx 에서 ResultShelf 대신 ClawMachine */

const COLS = 3;
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/** 서가 위 기와지붕 (용마루 · 기와 골 · 막새 · 서까래) */
function HanokRoof() {
  return (
    <svg aria-hidden viewBox="0 0 400 74" preserveAspectRatio="none" className="block h-14 w-full overflow-visible sm:h-16" strokeLinejoin="round" strokeLinecap="round">
      {/* 서까래 (처마 밑 나무 끝) */}
      <rect x="22" y="58" width="356" height="12" className="fill-wood stroke-line" strokeWidth="2" />
      {Array.from({ length: 22 }, (_, k) => 34 + k * 15.5).map((x) => (
        <circle key={x} cx={x} cy="64" r="3.2" className="fill-yellow/80 stroke-line" strokeWidth="1" />
      ))}
      {/* 기와 지붕면 (양 끝이 하늘로 살짝 들림) */}
      <path d="M2 40 Q26 52 56 18 L344 18 Q374 52 398 40 Q394 56 380 60 L20 60 Q6 56 2 40 Z" className="fill-sky stroke-line" strokeWidth="2.5" />
      {Array.from({ length: 21 }, (_, k) => 66 + k * 13.4).map((x) => (
        <path key={x} d={`M${x} 20 Q${x - 1} 40 ${x - 2} 58`} className="fill-none stroke-line/35" strokeWidth="2" />
      ))}
      {/* 막새 (처마 끝 둥근 기와) */}
      {Array.from({ length: 25 }, (_, k) => 18 + k * 15.2).map((x) => (
        <circle key={x} cx={x} cy="59" r="3.6" className="fill-line/80" />
      ))}
      {/* 용마루 (지붕 꼭대기) + 양 끝 치미 */}
      <path d="M48 18 Q200 8 352 18 L352 10 Q200 0 48 10 Z" className="fill-line stroke-line" strokeWidth="2" />
      <path d="M48 10 Q40 2 46 -2 Q52 6 56 14 Z M352 10 Q360 2 354 -2 Q348 6 344 14 Z" className="fill-line" />
    </svg>
  );
}

/** 서가 문 한 짝 (나무 틀 + 창살 + 둥근 고리) */
function ShelfDoor({ side, open }: { side: "left" | "right"; open: boolean }) {
  return (
    <div
      aria-hidden
      className={cn(
        "shelf-door pointer-events-none absolute inset-y-0 z-20 w-1/2 rounded-sm border-[2.5px] border-line bg-wood p-2",
        side === "left" ? "shelf-door-left left-0 origin-left" : "shelf-door-right right-0 origin-right",
        open && "is-open",
      )}
    >
      <div className="h-full rounded-sm border-2 border-line/60 bg-card/85 bg-[repeating-linear-gradient(90deg,transparent_0_14px,var(--line)_14px_17px),repeating-linear-gradient(0deg,transparent_0_14px,var(--line)_14px_17px)]" />
      <span className={cn("absolute top-1/2 size-5 -translate-y-1/2 rounded-full border-[2.5px] border-line bg-yellow", side === "left" ? "right-2" : "left-2")} />
    </div>
  );
}

export function ResultShelf({ prizes }: { prizes: string[] }) {
  const game = siteConfig.clawGame;
  const [taken, setTaken] = useState<number[]>([]); // 함에 담긴 순서
  const [selected, setSelected] = useState<number | null>(null);
  const [flying, setFlying] = useState<number | null>(null);
  const [message, setMessage] = useState(game.hint);
  const [celebrate, setCelebrate] = useState(0);
  const [doorsOpen, setDoorsOpen] = useState(false); // 서가 문을 열었는지

  const left = prizes.length - taken.length;
  const shelves = Array.from({ length: Math.ceil(prizes.length / COLS) }, (_, r) =>
    prizes.slice(r * COLS, r * COLS + COLS).map((label, k) => ({ label, i: r * COLS + k })),
  );

  function choose(i: number) {
    if (flying !== null || taken.includes(i)) return;
    setSelected(i);
    setMessage(`“${prizes[i]}”을(를) 골랐어요. ‘${game.pickLabel}’를 눌러 주세요!`);
  }

  async function pick() {
    const i = selected;
    if (i === null || flying !== null) return;
    setSelected(null);
    setFlying(i);
    await sleep(650);
    const next = [...taken, i];
    setTaken(next);
    setFlying(null);
    setCelebrate((n) => n + 1);
    setMessage(next.length === prizes.length ? game.doneMessage : `“${prizes[i]}”을(를) 보물함에 담았어요!`);
  }

  function reset() {
    if (flying !== null) return;
    setTaken([]);
    setSelected(null);
    setMessage(game.hint);
  }

  return (
    <div className="relative mt-20">
      <div className="relative rounded-[2rem] border-[3px] border-line bg-card/50 p-4 shadow-pop backdrop-blur sm:p-8">
        <div className="grid items-end gap-10 lg:grid-cols-[minmax(0,1fr)_18rem]">
          {/* ───────── 성취 서가 ───────── */}
          <div className="mx-auto w-full max-w-xl">
            {/* 서가 머리: 양 끝이 들린 기와지붕 + 처마 아래 걸린 현판 */}
            <div className="relative z-30 -mx-3 sm:-mx-6">
              <HanokRoof />
              <p className="relative mx-auto -mt-2 w-fit rounded-md border-[2.5px] border-line bg-line px-6 py-1.5 font-display text-base tracking-[0.35em] text-card shadow-pop-sm sm:text-xl">
                <span aria-hidden className="absolute inset-1 rounded-sm border border-yellow/50" />
                {game.vendingTitle}
              </p>
            </div>
            <div className="-mt-5 rounded-b-md border-[2.5px] border-line bg-wood p-2.5 pt-7 shadow-pop sm:p-3 sm:pt-8">
              {/* 칸 (어두운 서가 속 + 선반 널빤지) + 처음에 열리는 문 두 짝 */}
              <div className="relative rounded-lg border-2 border-line bg-[color-mix(in_oklab,var(--wood)_45%,var(--line))] px-2 pt-3 [perspective:1200px] sm:px-3">
                <ShelfDoor side="left" open={doorsOpen} />
                <ShelfDoor side="right" open={doorsOpen} />
                {/* 닫힌 문 위: 누르면 문이 열림 */}
                {!doorsOpen ? (
                  <button
                    type="button"
                    onClick={() => setDoorsOpen(true)}
                    aria-label={game.doorLabel}
                    className="group absolute inset-0 z-30 flex items-center justify-center rounded-lg outline-none focus-visible:ring-4 focus-visible:ring-ring"
                  >
                    <span className="flex animate-bob items-center gap-1.5 rounded-md border-[2.5px] border-line bg-line px-4 py-2 font-display text-sm text-card shadow-pop-sm transition-transform group-hover:scale-105 motion-reduce:animate-none sm:text-base">
                      <DoorOpen className="size-4" />
                      {game.doorLabel}
                    </span>
                  </button>
                ) : null}
                {shelves.map((row, r) => (
                  <div key={r} className="mb-3 last:mb-2">
                    <div className="grid grid-cols-3 gap-2 px-1 sm:gap-3">
                      {row.map(({ label, i }) => {
                        const isTaken = taken.includes(i);
                        const isSelected = selected === i;
                        const isFlying = flying === i;
                        return (
                          <button
                            key={i}
                            type="button"
                            onClick={() => choose(i)}
                            disabled={isTaken || flying !== null}
                            aria-pressed={isSelected}
                            aria-label={`${label}${isTaken ? ` (${game.soldLabel})` : ""}`}
                            className={cn(
                              "group relative flex flex-col items-center rounded-lg pb-1 pt-2 outline-none transition-all duration-300 focus-visible:ring-4 focus-visible:ring-ring",
                              isSelected && "-translate-y-2 bg-yellow/25 shadow-[0_0_24px_4px_color-mix(in_oklab,var(--yellow)_55%,transparent)]",
                              !isTaken && !isSelected && "hover:-translate-y-1",
                              isFlying && "animate-[fly-to-chest_0.65s_ease-in_forwards]",
                            )}
                          >
                            <span className={cn("block size-16 transition-opacity sm:size-20", isTaken && "opacity-20 grayscale")}>
                              <HanokArt kind={hanokArtFor(label, i)} />
                            </span>
                            {/* 실로 매단 한지 꼬리표 */}
                            <span aria-hidden className="h-2 w-px bg-card/60" />
                            <span
                              className={cn(
                                "line-clamp-2 rounded-sm border border-line/60 bg-card px-1.5 py-0.5 text-center font-display text-[11px] leading-tight text-foreground shadow-sm sm:text-xs",
                                isTaken && "border-dashed bg-card/40 text-card",
                              )}
                            >
                              {isTaken ? game.soldLabel : label}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                    {/* 선반 널빤지 */}
                    <div aria-hidden className="mt-1 h-3 rounded-sm border-2 border-line bg-wood shadow-[0_4px_0_0_color-mix(in_oklab,var(--line)_60%,transparent)]" />
                  </div>
                ))}
              </div>
            </div>
            {/* 서가 다리 */}
            <div aria-hidden className="flex justify-between px-6">
              <span className="h-4 w-8 rounded-b-md border-[2.5px] border-t-0 border-line bg-wood" />
              <span className="h-4 w-8 rounded-b-md border-[2.5px] border-t-0 border-line bg-wood" />
            </div>

            {/* 안내 + 단추 */}
            <div className="mt-3 flex items-center gap-2">
              <p aria-live="polite" className="min-w-0 flex-1 rounded-xl border-2 border-line/30 bg-card px-3 py-2 text-xs text-foreground/80 sm:text-sm">
                {doorsOpen ? message : game.doorHint}
              </p>
              {left > 0 ? (
                <Button size="sm" className="h-auto shrink-0 self-stretch px-4" onClick={pick} disabled={flying !== null || selected === null}>
                  <PackageOpen />
                  {game.pickLabel}
                </Button>
              ) : null}
              {taken.length > 0 ? (
                <Button
                  size="sm"
                  variant="outline"
                  className="h-auto shrink-0 self-stretch px-3"
                  aria-label={game.resetLabel}
                  title={game.resetLabel}
                  onClick={reset}
                  disabled={flying !== null}
                >
                  <RotateCcw />
                </Button>
              ) : null}
            </div>
          </div>

          {/* ───────── 나무 보물함 ───────── */}
          <div className="mx-auto w-full max-w-xs">
            <Mascot className="mb-3 justify-center" side="left" messages={game.mascotMessages} />

            <div className="relative mx-auto w-60">
              {celebrate > 0 ? <TrophyFountain key={celebrate} label={game.trophyCheer} className="-inset-x-10 -top-20 bottom-10" /> : null}

              {/* 열린 뚜껑 */}
              <div aria-hidden className="relative z-0 mx-2 h-12 origin-bottom -skew-x-6 rounded-t-2xl border-[2.5px] border-line bg-wood">
                <span className="absolute inset-x-3 bottom-1.5 top-2 rounded-t-xl border-2 border-line/40" />
              </div>
              {/* 함 속 (담긴 소품이 삐져나옴) */}
              <div className="relative z-10 -mt-1 flex h-16 items-end justify-center overflow-hidden rounded-t-md border-x-[2.5px] border-t-[2.5px] border-line bg-[color-mix(in_oklab,var(--wood)_40%,var(--line))] px-2">
                {taken.length === 0 ? (
                  <span className="mb-3 text-xs text-card/70">{game.trophyEmpty}</span>
                ) : (
                  taken.map((i, k) => (
                    <span
                      key={i}
                      className="-mx-1.5 block size-14 shrink-0 translate-y-2 animate-in fade-in slide-in-from-top-8 duration-500"
                      style={{ rotate: `${(k % 2 ? 1 : -1) * (6 + (k % 3) * 4)}deg` }}
                    >
                      <HanokArt kind={hanokArtFor(prizes[i], i)} />
                    </span>
                  ))
                )}
              </div>
              {/* 함 몸통 + 놋쇠 장식 + 이름판(담긴 개수) */}
              <div className="relative z-20 h-32 rounded-b-xl border-[2.5px] border-line bg-wood shadow-pop">
                <span aria-hidden className="absolute inset-x-0 top-3 h-2 bg-line/20" />
                <span aria-hidden className="absolute inset-x-0 bottom-4 h-2 bg-line/20" />
                {["left-1.5 top-1.5", "right-1.5 top-1.5", "left-1.5 bottom-1.5", "right-1.5 bottom-1.5"].map((pos) => (
                  <span key={pos} aria-hidden className={cn("absolute size-5 rounded-sm border-2 border-line bg-yellow", pos)} />
                ))}
                <span aria-hidden className="absolute left-1/2 top-6 flex size-12 -translate-x-1/2 items-center justify-center rounded-full border-[2.5px] border-line bg-yellow">
                  <span className="h-4 w-2 rounded-full bg-line" />
                </span>
                <p className="absolute inset-x-0 bottom-5 text-center font-display text-sm tracking-[0.2em] text-card">
                  {game.trophyPlate} {taken.length}/{prizes.length}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
