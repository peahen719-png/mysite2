"use client";

import { useState } from "react";
import { Dice1, Dice2, Dice3, Dice4, Dice5, Dice6, PartyPopper, RotateCcw, Smile, Sparkles } from "lucide-react";

import { siteConfig } from "@/site.config";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

/* 실천 보드게임 — 03 실천 섹션 안에 들어가는 주사위 놀이판.
   - 칸 20개(0 = 출발, 19 = 도착)가 아래에서 위로 뱀처럼 이어짐
   - 주사위를 굴리면 말이 한 칸씩 이동하고, 사다리 칸에 멈추면 위/아래로 이동
   - 글자, 미션, 사다리 위치: site.config.ts 의 actionGame
   - 색: 사이트 토큰 (미션 칸 = 표지판 색, 위로 사다리 = 주황, 아래로 사다리 = 분홍) */

const COLS = 5;
const ROWS = 4;
const GOAL = COLS * ROWS - 1;

const diceIcons = [Dice1, Dice2, Dice3, Dice4, Dice5, Dice6];

/* 미션 칸의 색과 모양 (차례대로 돌아가며) */
const missionStyles = [
  { color: "bg-teal text-card", shape: "rounded-[42%]" }, // 구름
  { color: "bg-orange text-card", shape: "rounded-[1.75rem_1.75rem_1.75rem_0.4rem]" }, // 말풍선
  { color: "bg-sky text-card", shape: "rounded-[50%_50%_45%_45%/60%_60%_40%_40%]" }, // 동글
  { color: "bg-pink text-card", shape: "rounded-[1.75rem_0.4rem_1.75rem_1.75rem]" }, // 말풍선
];

/** 칸 번호 → 놀이판 위치 (열, 아래에서부터의 줄). 줄마다 방향이 바뀜 */
function cellPlace(i: number) {
  const row = Math.floor(i / COLS);
  const col = row % 2 === 0 ? i % COLS : COLS - 1 - (i % COLS);
  return { col, row };
}

/** 칸 중심 좌표 (가로 0~500, 세로 0~400 기준 — 그림 좌표) */
function cellCenter(i: number) {
  const { col, row } = cellPlace(i);
  return { x: (col + 0.5) * 100, y: (ROWS - 1 - row + 0.5) * 100 };
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

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
const rollDie = () => Math.floor(Math.random() * 6) + 1;

export function ActionGame() {
  const game = siteConfig.actionGame;
  const [pos, setPos] = useState(0);
  const [dice, setDice] = useState(1);
  const [rolling, setRolling] = useState(false);
  const [message, setMessage] = useState(game.hint);

  const missionAt = (tile: number) => game.missions.find((m) => m.tile === tile);
  const DiceIcon = diceIcons[dice - 1];

  async function roll() {
    if (rolling || pos === GOAL) return;
    setRolling(true);

    // 주사위가 데굴데굴 굴러가는 모습
    for (let k = 0; k < 8; k++) {
      setDice(rollDie());
      await sleep(70);
    }
    const value = rollDie();
    setDice(value);
    setMessage(`${value}이(가) 나왔어요!`);

    // 한 칸씩 이동
    let p = pos;
    for (let k = 0; k < value && p < GOAL; k++) {
      p += 1;
      setPos(p);
      await sleep(280);
    }

    // 사다리
    const jump = game.jumps.find((j) => j.from === p);
    if (jump) {
      setMessage(jump.to > jump.from ? game.upText : game.downText);
      await sleep(650);
      p = jump.to;
      setPos(p);
      await sleep(350);
    }

    const mission = missionAt(p);
    if (p === GOAL) setMessage(game.goalMessage);
    else if (mission) setMessage(`${p}번 칸 미션: “${mission.text}” 실천해 볼까요?`);
    else setMessage(`${p}번 칸! 주사위를 한 번 더 굴려요.`);
    setRolling(false);
  }

  function reset() {
    setPos(0);
    setDice(1);
    setMessage(game.hint);
  }

  const token = cellCenter(pos);

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
        <div className="relative aspect-[5/4] w-full" role="img" aria-label={`${game.boardTitle}. 지금 ${pos}번 칸`}>
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
              <div
                key={i}
                className="absolute p-1 sm:p-2.5 lg:p-3"
                style={{
                  left: `${(col / COLS) * 100}%`,
                  top: `${((ROWS - 1 - row) / ROWS) * 100}%`,
                  width: `${100 / COLS}%`,
                  height: `${100 / ROWS}%`,
                }}
              >
                <div
                  className={cn(
                    "relative flex size-full flex-col items-center justify-center gap-0.5 border-4 border-card shadow-pop-sm transition-transform",
                    look,
                    here && "scale-105 ring-4 ring-primary/40",
                  )}
                >
                  {content}
                </div>
              </div>
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

          {/* 내 말 */}
          <div
            aria-hidden
            className="absolute z-20 flex aspect-square w-[9%] -translate-x-1/2 -translate-y-3/4 items-center justify-center rounded-full border-4 border-card bg-primary text-card shadow-pop transition-all duration-300 ease-out"
            style={{ left: `${token.x / 5}%`, top: `${token.y / 4}%` }}
          >
            <Smile className="size-1/2" strokeWidth={2.5} />
          </div>
        </div>

        {/* 메시지 + 주사위 */}
        <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center">
          <p
            aria-live="polite"
            className="flex-1 rounded-2xl border-4 border-card bg-card px-4 py-3 font-display text-base text-foreground shadow-pop-sm sm:text-lg"
          >
            {message}
          </p>
          <div className="flex items-center gap-3">
            <div
              aria-hidden
              className={cn(
                "flex size-14 items-center justify-center rounded-2xl border-4 border-card bg-accent text-primary shadow-pop-sm",
                rolling && "animate-spin [animation-duration:0.5s]",
              )}
            >
              <DiceIcon className="size-8" />
            </div>
            {pos === GOAL ? (
              <Button type="button" size="lg" onClick={reset}>
                <RotateCcw />
                {game.resetLabel}
              </Button>
            ) : (
              <Button type="button" size="lg" onClick={roll} disabled={rolling}>
                {game.rollLabel}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
