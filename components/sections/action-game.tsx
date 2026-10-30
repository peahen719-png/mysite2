"use client";

import { useEffect, useState } from "react";
import { Check, Pause, PartyPopper, RotateCcw, RotateCw, Sparkles, X, type LucideIcon } from "lucide-react";

import { siteConfig } from "@/site.config";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

/* 실천 레이스 — 03 실천 섹션 안에 들어가는 놀이판.
   - 칸 20개(0 = 출발, 19 = 도착)가 위에서 아래로 뱀처럼 이어짐
   - 주사위 없이, 칸을 누르면 내 캐릭터 말이 그 칸으로 폴짝 이동 (지금 하는 실천 계획 표시)
   - 캐릭터가 있는 칸에 결과 표시(성공·보류·재도전·취소)를 붙일 수 있음
   - 말 위치와 결과 표시는 이 브라우저에 기억됨 (다시 와도 그대로)
   - 글자, 미션, 사다리 위치: site.config.ts 의 actionGame
   - 색: 사이트 토큰 (미션 칸 = 표지판 색, 위로 사다리 = 주황, 아래로 사다리 = 분홍) */

const COLS = 5;
const ROWS = 4;
const GOAL = COLS * ROWS - 1;

const STORAGE_KEY = "haeboja-race-position";
const STATUS_KEY = "haeboja-race-status";

/* 결과 표시 모양 (글자는 site.config.ts 의 actionGame.statuses) */
const statusLooks: Record<string, { color: string; Icon: LucideIcon }> = {
  done: { color: "bg-teal", Icon: Check },
  hold: { color: "bg-orange", Icon: Pause },
  retry: { color: "bg-sky", Icon: RotateCw },
  cancel: { color: "bg-pink", Icon: X },
};

/* 미션 칸의 색과 모양 (차례대로 돌아가며) */
const missionStyles = [
  { color: "bg-teal text-card", shape: "rounded-[42%]" }, // 구름
  { color: "bg-orange text-card", shape: "rounded-[1.75rem_1.75rem_1.75rem_0.4rem]" }, // 말풍선
  { color: "bg-sky text-card", shape: "rounded-[50%_50%_45%_45%/60%_60%_40%_40%]" }, // 동글
  { color: "bg-pink text-card", shape: "rounded-[1.75rem_0.4rem_1.75rem_1.75rem]" }, // 말풍선
];

/** 칸 번호 → 놀이판 위치 (열, 위에서부터의 줄). 줄마다 방향이 바뀜 (출발 = 왼쪽 위, 도착 = 왼쪽 아래) */
function cellPlace(i: number) {
  const row = Math.floor(i / COLS);
  const col = row % 2 === 0 ? i % COLS : COLS - 1 - (i % COLS);
  return { col, row };
}

/** 칸 중심 좌표 (가로 0~500, 세로 0~400 기준 — 그림 좌표) */
function cellCenter(i: number) {
  const { col, row } = cellPlace(i);
  return { x: (col + 0.5) * 100, y: (row + 0.5) * 100 };
}

/** 두 칸 사이의 사다리 그림 (기둥 2개 + 가로대) */
function Ladder({ from, to }: { from: number; to: number }) {
  const a = cellCenter(from);
  const b = cellCenter(to);
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const len = Math.hypot(dx, dy);
  const nx = (-dy / len) * 11;
  const ny = (dx / len) * 11;
  const rungs = Math.floor(len / 24);
  const up = to > from;

  return (
    <g className={up ? "stroke-orange" : "stroke-pink"} strokeWidth="5" strokeLinecap="round">
      <line x1={a.x + nx} y1={a.y + ny} x2={b.x + nx} y2={b.y + ny} />
      <line x1={a.x - nx} y1={a.y - ny} x2={b.x - nx} y2={b.y - ny} />
      {Array.from({ length: rungs }, (_, k) => {
        const t = (k + 1) / (rungs + 1);
        const x = a.x + dx * t;
        const y = a.y + dy * t;
        return <line key={k} x1={x + nx} y1={y + ny} x2={x - nx} y2={y - ny} strokeWidth="4" />;
      })}
    </g>
  );
}

/** 내 캐릭터 말: 보라색 동글이 + 새싹, 눈·볼·웃는 입 */
function CharacterPiece() {
  return (
    <div className="flex flex-col items-center">
      {/* 새싹 */}
      <span className="-mb-1 h-3 w-3 rotate-45 rounded-br-full rounded-tl-full border-2 border-card bg-teal sm:h-4 sm:w-4" />
      <div className="relative aspect-square w-full rounded-[46%_46%_40%_40%] border-4 border-card bg-primary shadow-pop">
        {/* 눈 */}
        <span className="absolute left-[24%] top-[30%] flex size-[20%] items-center justify-center rounded-full bg-card">
          <span className="size-1/2 rounded-full bg-foreground" />
        </span>
        <span className="absolute right-[24%] top-[30%] flex size-[20%] items-center justify-center rounded-full bg-card">
          <span className="size-1/2 rounded-full bg-foreground" />
        </span>
        {/* 볼 */}
        <span className="absolute left-[10%] top-[56%] h-[12%] w-[18%] rounded-full bg-pink/80" />
        <span className="absolute right-[10%] top-[56%] h-[12%] w-[18%] rounded-full bg-pink/80" />
        {/* 웃는 입 */}
        <span className="absolute left-1/2 top-[55%] h-[14%] w-[22%] -translate-x-1/2 rounded-b-full border-b-[3px] border-card" />
      </div>
      {/* 바닥 그림자 */}
      <span className="mt-0.5 h-1.5 w-3/4 rounded-full bg-foreground/15" />
    </div>
  );
}

export function ActionGame() {
  const game = siteConfig.actionGame;
  const [pos, setPos] = useState(0);
  const [hop, setHop] = useState(0); // 놓을 때마다 1씩 늘려 폴짝 움직임을 다시 보여줌
  const [message, setMessage] = useState(game.hint);
  const [statuses, setStatuses] = useState<Record<number, string>>({});

  const missionAt = (tile: number) => game.missions.find((m) => m.tile === tile);

  // 지난번에 놓아 둔 위치 불러오기
  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        const saved = Number(window.localStorage.getItem(STORAGE_KEY));
        if (Number.isInteger(saved) && saved > 0 && saved <= GOAL) setPos(saved);
        const savedStatus = JSON.parse(window.localStorage.getItem(STATUS_KEY) ?? "{}");
        if (savedStatus && typeof savedStatus === "object") setStatuses(savedStatus);
      } catch {
        // 저장 공간을 못 쓰는 브라우저면 출발에서 시작
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
    const jump = game.jumps.find((j) => j.from === i);
    if (i === 0) setMessage(game.hint);
    else if (i === GOAL) setMessage(game.goalMessage);
    else if (mission) setMessage(`${i}번 칸 “${mission.text}” 실천 중! 화이팅!`);
    else if (jump && jump.to > jump.from) setMessage(`${i}번 칸! ${game.upText}`);
    else setMessage(`${i}번 칸에 캐릭터를 놓았어요.`);
  }

  /** 지금 캐릭터가 있는 칸에 결과 표시 붙이기 (같은 걸 다시 누르면 떼기) */
  function mark(key: string) {
    const next = { ...statuses };
    const option = game.statuses.find((o) => o.key === key);
    if (next[pos] === key) {
      delete next[pos];
      setMessage(`${pos}번 칸의 표시를 지웠어요.`);
    } else {
      next[pos] = key;
      const mission = missionAt(pos);
      setMessage(`${mission ? `“${mission.text}”` : `${pos}번 칸`} → ${option?.label ?? ""}`);
    }
    setStatuses(next);
    try {
      window.localStorage.setItem(STATUS_KEY, JSON.stringify(next));
    } catch {
      // 기억 못 해도 괜찮아요
    }
  }

  const token = cellCenter(pos);
  const canMark = pos > 0 && pos < GOAL;

  return (
    <div className="relative mx-auto mt-20 max-w-4xl">
      {/* 주황 거리 표지판 제목 */}
      <div className="absolute inset-x-0 -top-8 z-10 flex justify-center px-4">
        <p className="relative rotate-1 rounded-2xl border-4 border-card bg-orange px-6 py-3 text-center font-display text-xl text-card shadow-pop sm:px-10 sm:text-3xl">
          <span aria-hidden className="absolute inset-1.5 rounded-xl border-2 border-card/70" />
          {game.boardTitle}
        </p>
      </div>

      <div className="rounded-[2rem] border-[6px] border-card bg-linear-to-br from-secondary to-muted p-3 pt-12 shadow-pop sm:p-6 sm:pt-14">
        {/* 놀이판 (가로:세로 = 5:4) */}
        <div className="relative aspect-[5/4] w-full" role="group" aria-label={`${game.boardTitle}. 지금 ${pos}번 칸`}>
          {/* 길과 사다리 */}
          <svg
            aria-hidden
            viewBox="0 0 500 400"
            preserveAspectRatio="none"
            className="pointer-events-none absolute inset-0 size-full"
          >
            <polyline
              points={Array.from({ length: GOAL + 1 }, (_, i) => {
                const c = cellCenter(i);
                return `${c.x},${c.y}`;
              }).join(" ")}
              fill="none"
              className="stroke-card"
              strokeWidth="38"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <polyline
              points={Array.from({ length: GOAL + 1 }, (_, i) => {
                const c = cellCenter(i);
                return `${c.x},${c.y}`;
              }).join(" ")}
              fill="none"
              className="stroke-primary/25"
              strokeWidth="3"
              strokeDasharray="8 10"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>

          {/* 칸 */}
          {Array.from({ length: GOAL + 1 }, (_, i) => {
            const { col, row } = cellPlace(i);
            const mission = missionAt(i);
            const missionIndex = mission ? game.missions.indexOf(mission) : -1;
            const style = missionIndex >= 0 ? missionStyles[missionIndex % missionStyles.length] : null;
            const here = pos === i;
            const status = statuses[i];
            const statusLook = status ? statusLooks[status] : null;
            const statusLabel = game.statuses.find((o) => o.key === status)?.label;

            let content;
            let look;
            if (i === 0) {
              look = "bg-pink text-pink-foreground rounded-[45%]";
              content = (
                <>
                  <span className="absolute -right-1 -top-2 rounded-full border-2 border-card bg-accent px-1.5 font-display text-[10px] text-accent-foreground sm:text-xs">
                    GO!
                  </span>
                  <span className="font-display text-lg sm:text-3xl">{game.startLabel}</span>
                </>
              );
            } else if (i === GOAL) {
              look = "bg-primary text-primary-foreground rounded-2xl";
              content = (
                <>
                  <PartyPopper className="size-5 sm:size-8" />
                  <span className="font-display text-lg sm:text-3xl">{game.goalLabel}</span>
                </>
              );
            } else if (mission && style) {
              look = cn(style.color, style.shape);
              content = (
                <>
                  <span className="font-display text-sm opacity-80 sm:text-base">{i}</span>
                  <Sparkles className="size-4 sm:hidden" />
                  <span className="hidden px-1 text-center font-display text-xs leading-tight sm:block lg:text-sm">
                    {mission.text}
                  </span>
                </>
              );
            } else {
              look = "bg-card text-foreground/70 rounded-2xl";
              content = <span className="font-display text-xl sm:text-3xl">{i}</span>;
            }

            return (
              <button
                key={i}
                type="button"
                onClick={() => place(i)}
                aria-pressed={here}
                aria-label={`${i === 0 ? game.startLabel : i === GOAL ? game.goalLabel : `${i}번 칸`}${mission ? ` ${mission.text}` : ""}${statusLabel ? ` (${statusLabel})` : ""}에 캐릭터 놓기`}
                className="group/tile absolute cursor-pointer rounded-2xl p-1 outline-none sm:p-2.5 lg:p-3"
                style={{
                  left: `${(col / COLS) * 100}%`,
                  top: `${(row / ROWS) * 100}%`,
                  width: `${100 / COLS}%`,
                  height: `${100 / ROWS}%`,
                }}
              >
                <div
                  className={cn(
                    "relative flex size-full flex-col items-center justify-center gap-0.5 border-4 border-card shadow-pop-sm transition-transform group-hover/tile:-translate-y-1 group-focus-visible/tile:ring-4 group-focus-visible/tile:ring-ring",
                    look,
                    here && "scale-105 ring-4 ring-primary/40",
                    status === "cancel" && "opacity-55 grayscale",
                  )}
                >
                  {content}
                </div>
                {/* 결과 표시 도장 */}
                {statusLook ? (
                  <span
                    className={cn(
                      "absolute -right-1 -top-1 z-10 flex -rotate-6 items-center gap-0.5 rounded-full border-2 border-card px-1 py-0.5 font-display text-[10px] text-card shadow-pop-sm sm:-right-3 sm:-top-3 sm:px-2.5 sm:text-sm",
                      statusLook.color,
                    )}
                  >
                    <statusLook.Icon className="size-3 sm:size-4" strokeWidth={3} />
                    <span className="hidden sm:inline">{statusLabel}</span>
                  </span>
                ) : null}
              </button>
            );
          })}

          {/* 사다리 (칸 위에 그려서 잘 보이게) */}
          <svg
            aria-hidden
            viewBox="0 0 500 400"
            preserveAspectRatio="none"
            className="pointer-events-none absolute inset-0 size-full"
          >
            {game.jumps.map((j) => (
              <Ladder key={`${j.from}-${j.to}`} from={j.from} to={j.to} />
            ))}
          </svg>
          {game.jumps.map((j) => {
            const a = cellCenter(j.from);
            const b = cellCenter(j.to);
            return (
              <span
                key={`label-${j.from}`}
                aria-hidden
                className="absolute -translate-x-1/2 -translate-y-1/2 whitespace-nowrap rounded-full border-2 border-card bg-card px-2 py-0.5 font-display text-[10px] text-foreground shadow-pop-sm sm:text-sm"
                style={{ left: `${(a.x + b.x) / 10}%`, top: `${(a.y + b.y) / 8}%` }}
              >
                {j.to > j.from ? game.upText : game.downText}
              </span>
            );
          })}

          {/* 내 캐릭터 말 (칸 사이를 미끄러지듯 이동하고, 도착하면 폴짝) */}
          <div
            aria-hidden
            className="pointer-events-none absolute z-20 w-[14%] -translate-x-1/2 sm:w-[9%] -translate-y-[108%] transition-all duration-500 ease-out"
            style={{ left: `${token.x / 5}%`, top: `${token.y / 4}%` }}
          >
            <div key={hop} className="animate-in fade-in zoom-in-75 slide-in-from-bottom-4 duration-500">
              <CharacterPiece />
            </div>
          </div>
        </div>

        {/* 안내 + 처음으로 */}
        <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center">
          <p
            aria-live="polite"
            className="flex-1 rounded-2xl border-4 border-card bg-card px-4 py-3 font-display text-base text-foreground shadow-pop-sm sm:text-lg"
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

        {/* 캐릭터가 있는 칸에 결과 표시 고르기 */}
        {canMark ? (
          <div className="mt-3 flex flex-wrap items-center gap-2 rounded-2xl border-4 border-card bg-card/70 px-4 py-3">
            <span className="mr-1 font-display text-sm text-foreground">
              {pos}번 칸 {game.statusPrompt}
            </span>
            {game.statuses.map((option) => {
              const look = statusLooks[option.key];
              const active = statuses[pos] === option.key;
              return (
                <button
                  key={option.key}
                  type="button"
                  onClick={() => mark(option.key)}
                  aria-pressed={active}
                  className={cn(
                    "flex items-center gap-1 rounded-full border-4 border-card px-3 py-1 font-display text-sm shadow-pop-sm transition-transform hover:-translate-y-0.5",
                    active ? cn(look?.color, "text-card") : "bg-card text-foreground",
                  )}
                >
                  {look ? <look.Icon className="size-4" strokeWidth={3} /> : null}
                  {option.label}
                </button>
              );
            })}
          </div>
        ) : null}
      </div>
    </div>
  );
}
