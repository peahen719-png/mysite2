"use client";

import { useEffect, useState } from "react";
import { Check, Flag, Pause, PartyPopper, Puzzle, RotateCcw, RotateCw, type LucideIcon } from "lucide-react";

import { siteConfig } from "@/site.config";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Celebration } from "@/components/ui/celebration";
import { StatusBurst } from "@/components/ui/status-burst";
import { PuzzleArt } from "@/components/ui/puzzle-art";
import { Buddy } from "@/components/ui/mascot";
import { Hyeonpan } from "@/components/ui/hyeonpan";

/* 실천 레이스 — 03 실천 섹션 안에 들어가는 직소 퍼즐 놀이판.
   - 칸 = 퍼즐 조각. 조각마다 공원 보물 지도(components/ui/puzzle-art.tsx)가 옅게 깔려 있고,
     '성공'으로 표시한 조각은 지도가 선명해져
     15칸을 모두 성공하면 그림이 완성됨
   - 출발 → 1~15번 칸 → 도착이 위에서 아래로 뱀처럼 이어짐 (6·9·13번은 넓은 조각)
   - 칸을 누르면 내 캐릭터 말이 그 칸으로 폴짝 이동 (지금 하는 실천 계획 표시)
   - 위쪽 '결과 표시' 줄에서 성공(빨강)·보류(노랑)·재도전(초록)을 고르면
     캐릭터가 있는 칸의 색이 바뀌고, 숫자 자리에 큰 도장이 찍히며 응원이 팡팡
     (성공 = 폭죽 + "최고야!", 보류 = "화이팅!", 재도전 = "다시 해보자!")
   - 캐릭터가 있는 칸에는 위쪽 '○번 칸 할 일' 칸에 직접 글을 적을 수 있음
   - 말 위치, 결과 표시, 적은 글은 이 브라우저에 기억됨 (다시 와도 그대로)
   - 글자, 실천 계획, 결과 이름: site.config.ts 의 actionGame */

const COLS = 5;
const ROWS = 4;
/* 칸: 0 = 출발, 1~15 = 숫자 칸, 16 = 도착.
   20자리(5 × 4)에 17칸을 놓으려고 6·9·13번(할 일 칸)은 두 자리를 합친 넓은 조각 */
const GOAL = 16;
const WIDE: Record<number, number> = { 6: 2, 9: 2, 13: 2 };

const STORAGE_KEY = "haeboja-race-position";
const TEXTS_KEY = "haeboja-race-texts"; // 칸마다 직접 적은 할 일
export const STATUS_KEY = "haeboja-race-status";
/** 결과 표시가 바뀌면 알리는 신호 (성과 그래프가 듣고 다시 그림) */
export const STATUS_EVENT = "haeboja-race-updated";

/* 결과 표시 모양: 칸 색, 칸 글자색, 도장 아이콘 색 (글자는 site.config.ts 의 actionGame.statuses)
   성공 = 파스텔 빨강, 보류 = 파스텔 노랑, 재도전 = 파스텔 초록 */
const statusLooks: Record<string, { tile: string; ink: string; text: string; Icon: LucideIcon }> = {
  done: { tile: "bg-red", ink: "text-foreground", text: "text-red-deep", Icon: Check },
  hold: { tile: "bg-yellow", ink: "text-foreground", text: "text-yellow-deep", Icon: Pause },
  retry: { tile: "bg-green", ink: "text-foreground", text: "text-green-deep", Icon: RotateCw },
};

/* 실천 계획 칸의 번호 색 (차례대로 돌아가며) */
const numberColors = ["bg-teal", "bg-orange", "bg-sky", "bg-pink"];

/** 칸마다 놀이판 위치 (열, 위에서부터의 줄, 차지하는 자리 수 w).
    줄마다 방향이 바뀜 (출발 = 왼쪽 위 → … → 도착 = 왼쪽 아래) */
const LAYOUT = (() => {
  const places: { col: number; row: number; w: number }[] = [];
  let row = 0;
  let used = 0;
  for (let i = 0; i <= GOAL; i++) {
    const w = WIDE[i] ?? 1;
    if (used + w > COLS) {
      row += 1;
      used = 0;
    }
    const col = row % 2 === 0 ? used : COLS - used - w;
    places.push({ col, row, w });
    used += w;
  }
  return places;
})();

function cellPlace(i: number) {
  return LAYOUT[i];
}

/** 칸 중심 좌표 (가로 0~500, 세로 0~400 기준 — 그림 좌표) */
function cellCenter(i: number) {
  const { col, row, w } = cellPlace(i);
  return { x: (col + w / 2) * 100, y: (row + 0.5) * 100 };
}

/** 지도 위 점선 길: 출발 → 도착까지 칸 가운데를 차례로 잇기 */
const ROUTE = LAYOUT.map((_, i) => {
  const c = cellCenter(i);
  return `${c.x},${c.y}`;
}).join(" ");

export function ActionGame() {
  const game = siteConfig.actionGame;
  const [pos, setPos] = useState(0);
  const [hop, setHop] = useState(0); // 놓을 때마다 1씩 늘려 폴짝 움직임을 다시 보여줌
  const [message, setMessage] = useState(game.hint);
  const [statuses, setStatuses] = useState<Record<number, string>>({});
  const [texts, setTexts] = useState<Record<number, string>>({}); // 직접 적은 할 일 (빈 글자 = 지움)
  const [burst, setBurst] = useState<{ key: number; tile: number; kind: string } | null>(null); // 응원이 터질 칸

  /** 칸의 할 일: 직접 적은 게 있으면 그것, 없으면 site.config.ts 의 missions */
  const missionAt = (tile: number) => {
    if (tile <= 0 || tile >= GOAL) return undefined;
    const text = texts[tile] !== undefined ? texts[tile] : game.missions.find((m) => m.tile === tile)?.text;
    return text ? { tile, text } : undefined;
  };

  function writeText(tile: number, value: string) {
    const next = { ...texts, [tile]: value };
    setTexts(next);
    try {
      window.localStorage.setItem(TEXTS_KEY, JSON.stringify(next));
    } catch {
      // 기억 못 해도 괜찮아요
    }
  }
  const canMark = pos > 0 && pos < GOAL;
  const doneCount = Object.entries(statuses).filter(([k, v]) => v === "done" && Number(k) > 0 && Number(k) < GOAL).length;

  // 지난번에 놓아 둔 위치와 결과 표시 불러오기
  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        const saved = Number(window.localStorage.getItem(STORAGE_KEY));
        if (Number.isInteger(saved) && saved > 0 && saved <= GOAL) setPos(saved);
        const savedStatus = JSON.parse(window.localStorage.getItem(STATUS_KEY) ?? "{}");
        if (savedStatus && typeof savedStatus === "object") setStatuses(savedStatus);
        const savedTexts = JSON.parse(window.localStorage.getItem(TEXTS_KEY) ?? "{}");
        if (savedTexts && typeof savedTexts === "object") setTexts(savedTexts);
      } catch {
        // 저장 공간을 못 쓰는 브라우저면 처음 상태로 시작
      }
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  function place(i: number) {
    setPos(i);
    setHop((n) => n + 1);
    try {
      window.localStorage.setItem(STORAGE_KEY, String(i));
    } catch {
      // 기억 못 해도 괜찮아요
    }
    const mission = missionAt(i);
    if (i === 0) setMessage(game.hint);
    else if (i === GOAL) setMessage(game.goalMessage);
    else if (mission) setMessage(`${i}번 칸 “${mission.text}” 실천 중! 위에서 결과를 표시해 보세요.`);
    else setMessage(`${i}번 칸에 캐릭터를 놓았어요.`);
  }

  /** 지금 캐릭터가 있는 칸에 결과 표시 붙이기 (같은 걸 다시 누르면 떼기) */
  function mark(key: string) {
    if (!canMark) return;
    const next = { ...statuses };
    const option = game.statuses.find((o) => o.key === key);
    const mission = missionAt(pos);
    if (next[pos] === key) {
      delete next[pos];
      setMessage(`${pos}번 칸의 표시를 지웠어요.`);
    } else {
      next[pos] = key;
      const solved = Object.entries(next).filter(([k, v]) => v === "done" && Number(k) > 0 && Number(k) < GOAL).length;
      setMessage(
        key === "done" && solved === GOAL - 1
          ? game.puzzleDoneMessage
          : `${mission ? `“${mission.text}”` : `${pos}번 칸`} → ${option?.label ?? ""}!`,
      );
      setBurst((b) => ({ key: (b?.key ?? 0) + 1, tile: pos, kind: key })); // 응원 팡팡!
    }
    setStatuses(next);
    try {
      window.localStorage.setItem(STATUS_KEY, JSON.stringify(next));
      window.dispatchEvent(new Event(STATUS_EVENT));
    } catch {
      // 기억 못 해도 괜찮아요
    }
  }

  const token = cellCenter(pos);
  const burstPlace = burst ? cellPlace(burst.tile) : null;

  return (
    <div className="relative mx-auto mt-20 max-w-4xl">
      {/* 현판 제목 */}
      <Hyeonpan title={game.boardTitle} tilt="rotate-1" />

      <div className="rounded-[2rem] border-[3px] border-line bg-linear-to-br from-secondary to-muted p-3 pt-12 shadow-pop sm:p-6 sm:pt-14">
        {/* 결과 표시 고르기 (캐릭터가 있는 칸에 적용) */}
        <div className="mb-5 flex flex-wrap items-center justify-center gap-2 rounded-2xl border-[2.5px] border-line bg-card/80 px-4 py-3">
          <span className="mr-1 font-display text-sm text-foreground sm:text-base">
            {canMark ? `${pos}번 칸 ${game.statusPrompt}` : game.statusHint}
          </span>
          {game.statuses.map((option) => {
            const look = statusLooks[option.key];
            const active = canMark && statuses[pos] === option.key;
            return (
              <button
                key={option.key}
                type="button"
                onClick={() => mark(option.key)}
                disabled={!canMark}
                aria-pressed={active}
                className={cn(
                  "flex items-center gap-1 rounded-full border-[2.5px] border-line px-3 py-1 font-display text-sm shadow-pop-sm transition-transform enabled:hover:-translate-y-0.5 disabled:opacity-40 sm:text-base",
                  active ? cn(look?.tile, look?.ink) : "bg-card text-foreground",
                )}
              >
                {look ? <look.Icon className="size-4" strokeWidth={3} /> : null}
                {option.label}
              </button>
            );
          })}
          <span className="ml-1 flex items-center gap-1 rounded-full bg-accent px-3 py-1 font-display text-sm text-accent-foreground">
            <Puzzle className="size-4 text-primary" />
            {doneCount}/{GOAL - 1}
          </span>
          {/* 캐릭터가 있는 칸에 할 일 적기 */}
          {canMark ? (
            <label className="flex w-full items-center gap-2 border-t-2 border-dashed border-border pt-3">
              <span className="shrink-0 font-display text-sm text-foreground">{pos}번 칸 할 일</span>
              <input
                value={missionAt(pos)?.text ?? ""}
                onChange={(e) => writeText(pos, e.target.value)}
                placeholder={game.textPlaceholder}
                maxLength={20}
                aria-label={`${pos}번 칸 할 일`}
                className="h-10 min-w-0 flex-1 rounded-xl border-2 bg-background px-3 text-sm outline-none focus:border-primary"
              />
            </label>
          ) : null}
        </div>

        {/* 놀이판: 직소 퍼즐 (가로:세로 = 5:4). 성공한 칸마다 그림 조각이 드러남 */}
        <div className="relative aspect-[5/4] w-full" role="group" aria-label={`${game.boardTitle}. 지금 ${pos}번 칸`}>
          <div className="absolute inset-0 overflow-hidden rounded-2xl border-[2.5px] border-line shadow-pop-sm">
            {Array.from({ length: GOAL + 1 }, (_, i) => {
              const { col, row, w } = cellPlace(i);
              const mission = missionAt(i);
              const here = pos === i;
              const status = i > 0 && i < GOAL ? statuses[i] : undefined;
              const statusLook = status ? statusLooks[status] : null;
              const statusLabel = game.statuses.find((o) => o.key === status)?.label;
              const done = status === "done";

              // 조각: 모두 보물 지도. 옅게 깔려 있다가 성공하면 진하게 (출발은 처음부터, 도착은 15칸 모두 성공하면)
              // 보류·재도전 = 파스텔 색 위에 옅은 지도
              const vivid = i === 0 || done || (i === GOAL && doneCount === GOAL - 1);
              const face = statusLook && !done ? cn(statusLook.tile, statusLook.ink) : "bg-card text-foreground";

              /** 그림에서 이 조각 자리만 보이게 (cqw·cqh = 이 조각의 너비·높이, 한 자리 너비 = 100cqw / w) */
              const slice = (left: string, top: string) => (
                <span
                  aria-hidden
                  className={cn(
                    "pointer-events-none absolute block transition-[opacity,filter] duration-700",
                    vivid ? "opacity-100 saturate-[1.1]" : "opacity-45 grayscale sepia-[0.35]",
                  )}
                  style={{ width: `${(COLS * 100) / w}cqw`, height: `${ROWS * 100}cqh`, left, top }}
                >
                  <PuzzleArt route={ROUTE} />
                </span>
              );

              let content;
              if (i === 0) {
                // 출발·도착: 지도 위에 작은 이름표만
                content = (
                  <span className="flex items-center gap-1 rounded-full border-2 border-line bg-pink px-2 py-0.5 font-display text-xs text-card shadow-pop-sm sm:px-3 sm:text-base">
                    <Flag className="size-3 sm:size-4" />
                    {game.startLabel}
                  </span>
                );
              } else if (i === GOAL) {
                content = (
                  <span className="flex items-center gap-1 rounded-full border-2 border-line bg-primary px-2 py-0.5 font-display text-xs text-primary-foreground shadow-pop-sm sm:px-3 sm:text-base">
                    <PartyPopper className="size-3 sm:size-4" />
                    {game.goalLabel}
                  </span>
                );
              } else if (statusLook && !done) {
                // 보류·재도전: 숫자 자리에 큰 도장
                content = (
                  <span
                    key={status}
                    className="relative flex aspect-square w-[46%] -rotate-12 items-center justify-center rounded-full border-[2.5px] border-line bg-card shadow-pop-sm animate-in zoom-in-50 spin-in-12 duration-500"
                  >
                    <statusLook.Icon className={cn("size-3/5", statusLook.text)} strokeWidth={3.5} />
                    <span className="absolute -bottom-1.5 -right-2 rounded-full border-2 border-line bg-foreground px-1 font-display text-[9px] text-card sm:text-xs">
                      {i}
                    </span>
                  </span>
                );
              } else {
                content = (
                  <span
                    className={cn(
                      "flex items-center justify-center rounded-full font-display",
                      done
                        ? "size-6 bg-card/90 text-xs text-foreground shadow-pop-sm sm:size-8 sm:text-base"
                        : mission
                          ? cn("size-7 text-sm text-card sm:size-10 sm:text-xl", numberColors[i % numberColors.length])
                          : "size-8 bg-card/85 text-lg text-foreground/80 sm:size-11 sm:text-2xl",
                    )}
                  >
                    {i}
                  </span>
                );
              }

              const knob = "pointer-events-none absolute z-10 overflow-hidden rounded-full border-2 border-primary/30";

              return (
                <button
                  key={i}
                  type="button"
                  onClick={() => place(i)}
                  aria-pressed={here}
                  aria-label={`${i === 0 ? game.startLabel : i === GOAL ? game.goalLabel : `${i}번 칸`}${mission ? ` ${mission.text}` : ""}${statusLabel ? ` (${statusLabel})` : ""}에 캐릭터 놓기`}
                  className="group/tile absolute outline-none"
                  style={{
                    left: `${(col / COLS) * 100}%`,
                    top: `${(row / ROWS) * 100}%`,
                    width: `${(w / COLS) * 100}%`,
                    height: `${100 / ROWS}%`,
                    containerType: "size",
                  }}
                >
                  {/* 조각 면 */}
                  <span
                    className={cn(
                      "absolute inset-0 flex flex-col items-center justify-center gap-1 overflow-hidden border-2 border-primary/30 transition-[filter,background-color] duration-500 group-hover/tile:brightness-105 group-focus-visible/tile:ring-4 group-focus-visible/tile:ring-inset group-focus-visible/tile:ring-ring",
                      face,
                      here && "ring-4 ring-inset ring-primary/50",
                    )}
                  >
                    {slice(`${(-col * 100) / w}cqw`, `${-row * 100}cqh`)}
                    {done ? (
                      // 성공한 조각: 그림 위에 작은 체크 도장
                      <span className="absolute left-1 top-1 flex size-5 items-center justify-center rounded-full border-2 border-line bg-card text-red-deep shadow-pop-sm animate-in zoom-in-50 duration-500 sm:size-7">
                        <Check className="size-3 sm:size-4" strokeWidth={3.5} />
                      </span>
                    ) : null}
                    <span className="relative flex flex-col items-center gap-1">
                      {content}
                      {mission ? (
                        <span
                          className={cn(
                            "hidden px-1 text-center font-display text-sm leading-tight sm:block lg:text-base",
                            "rounded-full bg-card/90 px-2 py-0.5",
                          )}
                        >
                          {mission.text}
                        </span>
                      ) : null}
                      {statusLabel && !done ? (
                        <span className="font-display text-[10px] leading-none sm:hidden">{statusLabel}</span>
                      ) : null}
                    </span>
                  </span>

                  {/* 퍼즐 볼록 이음새 (오른쪽, 아래) — 조각과 같은 색, 성공하면 그림도 이어짐 */}
                  {col + w < COLS ? (
                    <span
                      aria-hidden
                      className={cn(knob, face)}
                      style={{ width: "26cqmin", height: "26cqmin", right: "-13cqmin", top: "calc(50cqh - 13cqmin)" }}
                    >
                      {slice(`calc(${(-col * 100) / w}cqw - 100cqw + 13cqmin)`, `calc(${-row * 100}cqh - 50cqh + 13cqmin)`)}
                    </span>
                  ) : null}
                  {row < ROWS - 1 ? (
                    <span
                      aria-hidden
                      className={cn(knob, face)}
                      style={{ width: "26cqmin", height: "26cqmin", bottom: "-13cqmin", left: "calc(50cqw - 13cqmin)" }}
                    >
                      {slice(`calc(${(-col * 100) / w}cqw - 50cqw + 13cqmin)`, `calc(${-row * 100}cqh - 100cqh + 13cqmin)`)}
                    </span>
                  ) : null}
                </button>
              );
            })}
          </div>

          {/* 결과를 표시한 칸에서 팡팡: 성공 = 폭죽 + 최고야!, 보류 = 화이팅!, 재도전 = 다시 해보자! */}
          {burst && burstPlace ? (
            <div
              className="pointer-events-none absolute z-30"
              style={{
                left: `${(burstPlace.col / COLS) * 100}%`,
                top: `${(burstPlace.row / ROWS) * 100}%`,
                width: `${(burstPlace.w / COLS) * 100}%`,
                height: `${100 / ROWS}%`,
              }}
            >
              {burst.kind === "done" ? <Celebration key={`c-${burst.key}`} className="-inset-x-16 -inset-y-12" /> : null}
              <StatusBurst
                key={`s-${burst.key}`}
                kind={burst.kind}
                text={game.statuses.find((o) => o.key === burst.kind)?.cheer ?? ""}
              />
            </div>
          ) : null}

          {/* 내 캐릭터 말 (칸 사이를 미끄러지듯 이동하고, 도착하면 폴짝) */}
          <div
            aria-hidden
            className="pointer-events-none absolute z-20 w-[14%] -translate-x-1/2 -translate-y-[92%] transition-all duration-500 ease-out sm:w-[9%]"
            style={{ left: `${token.x / 5}%`, top: `${token.y / 4}%` }}
          >
            <div key={hop} className="animate-in fade-in zoom-in-75 slide-in-from-bottom-4 duration-500">
              <Buddy />
            </div>
          </div>
        </div>

        {/* 안내 + 처음으로 */}
        <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center">
          <p
            aria-live="polite"
            className="flex-1 rounded-2xl border-[2.5px] border-line bg-card px-4 py-3 font-display text-base text-foreground shadow-pop-sm sm:text-lg"
          >
            {message}
          </p>
          {pos > 0 ? (
            <Button type="button" variant="outline" size="lg" onClick={() => place(0)}>
              <RotateCcw />
              {game.resetLabel}
            </Button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
