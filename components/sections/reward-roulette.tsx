"use client";

import { useEffect, useState, type FormEvent } from "react";
import { Check, Gift, Pencil, Plus, ShoppingBag, Sparkles, Trash2, X, type LucideIcon } from "lucide-react";

import { siteConfig } from "@/site.config";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { TrophyFountain } from "@/components/ui/trophy-fountain";
import { Hyeonpan } from "@/components/ui/hyeonpan";

/* 행운의 물레 (예전 보상 룰렛) — 04 결과 섹션 안, 성과 그래프 아래.
   - 룰렛 가운데 '돌리기'를 누르면 언제든 돌아감 (잠금 없음)
   - 맨 위 줄: 이번 달 성공 개수(achievements.months)와 기준(roulette.rules)을 참고용으로 보여줌
   - 룰렛 칸 = 내가 사고 싶은 것 / 갖고 싶은 것 / 하고 싶은 것. '보상 목록'의 고치기에서 추가·삭제
   - 돌린 횟수, 고친 목록, 당첨 기록은 이 브라우저에 저장됨
   - 색: 사고 싶은 것 = 분홍, 갖고 싶은 것 = 하늘, 하고 싶은 것 = 노랑 (파스텔). 물레는 살과 지그재그 끈으로 엮은 나무 바퀴 */

type Reward = { cat: string; text: string; emoji?: string };

/* 직접 추가한 보상의 그림 (종류별 기본) */
const catEmoji: Record<string, string> = { buy: "🛍️", have: "🎁", do: "✨" };
const emojiOf = (r: Reward) => r.emoji || catEmoji[r.cat] || "🎁";
type Win = { month: string; text: string; cat: string; emoji?: string };

const REWARDS_KEY = "haeboja-roulette-rewards";
const HISTORY_KEY = "haeboja-roulette-history";
const usedKey = (y: number, m: number) => `haeboja-roulette-used-${y}-${m}`;

const catLooks: Record<string, { fill: string; chip: string; Icon: LucideIcon }> = {
  buy: { fill: "fill-pink/45", chip: "bg-pink/25", Icon: ShoppingBag },
  have: { fill: "fill-sky/40", chip: "bg-sky/25", Icon: Gift },
  do: { fill: "fill-yellow/70", chip: "bg-yellow/50", Icon: Sparkles },
};

const R = 140; // 룰렛 반지름 (그림 좌표)

/* 물레로 자아 짠 무명천 무늬 (가로·세로 실이 엇갈린 결) */
const fabric =
  "bg-card bg-[repeating-linear-gradient(0deg,color-mix(in_oklab,var(--wood)_7%,transparent)_0_1px,transparent_1px_4px),repeating-linear-gradient(90deg,color-mix(in_oklab,var(--wood)_7%,transparent)_0_1px,transparent_1px_4px)]";

/** 천 맨 위에 덧댄 조각보 띠 (여러 색 천 조각을 이어 붙인 모양) */
function Jogakbo() {
  const pieces = ["bg-primary/70", "bg-yellow", "bg-teal/70", "bg-sky/70", "bg-pink/70", "bg-green", "bg-orange/70", "bg-card"];
  return (
    <div aria-hidden className="absolute inset-x-0 top-0 flex h-3 border-b-2 border-line">
      {Array.from({ length: 16 }, (_, k) => (
        <span key={k} className={cn("h-full flex-1 border-r border-line/40 last:border-r-0", pieces[(k * 5) % pieces.length])} style={{ flexGrow: 1 + ((k * 7) % 3) }} />
      ))}
    </div>
  );
}

/** 실이 감긴 실패 그림 (당첨 기록 머리) */
function Spool() {
  return (
    <svg aria-hidden viewBox="0 0 24 24" className="size-5" strokeLinejoin="round">
      <rect x="4" y="2" width="16" height="4" rx="1" className="fill-wood stroke-line" strokeWidth="1.5" />
      <rect x="4" y="18" width="16" height="4" rx="1" className="fill-wood stroke-line" strokeWidth="1.5" />
      <rect x="7" y="6" width="10" height="12" className="fill-primary stroke-line" strokeWidth="1.5" />
      <path d="M7 9 L17 11 M7 12 L17 14 M7 15 L17 17" className="stroke-card/70" strokeWidth="1.2" />
    </svg>
  );
}


/** 원 둘레 위의 점 (0도 = 맨 위, 시계 방향) */
function point(angle: number, radius: number) {
  const rad = ((angle - 90) * Math.PI) / 180;
  return { x: R + radius * Math.cos(rad), y: R + radius * Math.sin(rad) };
}

export function RewardRoulette() {
  const cfg = siteConfig.roulette;
  const [rewards, setRewards] = useState<Reward[]>(cfg.rewards);
  const [history, setHistory] = useState<Win[]>([]);
  const [now, setNow] = useState<{ y: number; m: number } | null>(null);
  const [used, setUsed] = useState(0);
  const [rotation, setRotation] = useState(0);
  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState<number | null>(null);
  const [burst, setBurst] = useState(0);
  const [newCat, setNewCat] = useState(cfg.categories[0].key);
  const [newText, setNewText] = useState("");
  const [editing, setEditing] = useState(false);
  const [editingHistory, setEditingHistory] = useState(false);

  // 저장해 둔 목록·기록·이번 달 돌린 횟수 불러오기
  useEffect(() => {
    const timer = setTimeout(() => {
      const d = new Date();
      const t = { y: d.getFullYear(), m: d.getMonth() + 1 };
      setNow(t);
      try {
        const savedRewards = JSON.parse(window.localStorage.getItem(REWARDS_KEY) ?? "null");
        if (Array.isArray(savedRewards) && savedRewards.length >= 2) setRewards(savedRewards);
        const savedHistory = JSON.parse(window.localStorage.getItem(HISTORY_KEY) ?? "[]");
        if (Array.isArray(savedHistory)) setHistory(savedHistory);
        setUsed(Number(window.localStorage.getItem(usedKey(t.y, t.m)) ?? 0) || 0);
      } catch {
        // 저장 공간을 못 쓰면 처음 상태로
      }
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  function store(key: string, value: unknown) {
    try {
      window.localStorage.setItem(key, typeof value === "string" ? value : JSON.stringify(value));
    } catch {
      // 기억 못 해도 괜찮아요
    }
  }

  // 이번 달 성공 개수 → 돌릴 수 있는 횟수
  const monthLabel = now ? `${now.m}월` : "";
  const successes = siteConfig.achievements.months.find((x) => x.label === monthLabel)?.value ?? 0;
  const rules = [...cfg.rules].sort((a, b) => a.min - b.min);

  const n = rewards.length;
  const slice = 360 / n;

  function spin() {
    if (spinning || n < 2) return; // 잠금 없이 언제든 돌릴 수 있음
    const target = Math.floor(Math.random() * n);
    const center = target * slice + slice / 2;
    // 당첨 칸의 가운데가 맨 위 바늘 아래로 오도록 + 5바퀴
    const current = ((rotation % 360) + 360) % 360;
    const delta = (((360 - center - current) % 360) + 360) % 360;
    setResult(null);
    setSpinning(true);
    setRotation(rotation + 5 * 360 + delta);
    window.setTimeout(() => {
      setSpinning(false);
      setResult(target);
      setBurst((b) => b + 1);
      const win: Win = { month: monthLabel, text: rewards[target].text, cat: rewards[target].cat, emoji: emojiOf(rewards[target]) };
      const nextHistory = [win, ...history].slice(0, 20);
      setHistory(nextHistory);
      store(HISTORY_KEY, nextHistory);
      if (now) {
        setUsed(used + 1);
        store(usedKey(now.y, now.m), String(used + 1));
      }
    }, 4600);
  }

  function addReward(e: FormEvent) {
    e.preventDefault();
    const text = newText.trim();
    if (!text || rewards.length >= 12) return;
    const next = [...rewards, { cat: newCat, text, emoji: catEmoji[newCat] }];
    setRewards(next);
    store(REWARDS_KEY, next);
    setNewText("");
  }

  function removeReward(i: number) {
    if (rewards.length <= 2) return;
    const next = rewards.filter((_, k) => k !== i);
    setRewards(next);
    store(REWARDS_KEY, next);
    setResult(null);
  }

  /** 당첨 기록 한 줄 고치기 / 지우기 (바로 저장) */
  function editHistory(i: number, change: Partial<Win>) {
    const next = history.map((w, k) => (k === i ? { ...w, ...change } : w));
    setHistory(next);
    store(HISTORY_KEY, next);
  }

  function removeHistory(i: number) {
    const next = history.filter((_, k) => k !== i);
    setHistory(next);
    store(HISTORY_KEY, next);
    if (next.length === 0) setEditingHistory(false);
  }

  const won = result !== null ? rewards[result] : null;

  return (
    <div className="relative mt-20">
      {/* 현판 제목 */}
      <Hyeonpan title={cfg.boardTitle} tilt="rotate-1" />

      <div className="space-y-8 rounded-[2rem] border-[3px] border-line bg-card/50 p-4 pt-14 shadow-pop backdrop-blur sm:p-8 sm:pt-16">
        {/* 기준: 한 줄로 */}
        <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 rounded-2xl border-[2.5px] border-line bg-card px-4 py-3 text-sm shadow-pop-sm">
          <span className="font-display text-base text-foreground">
            {monthLabel || "이번 달"} 성공 <span className="text-xl text-primary">{successes}</span>개
          </span>
          {rules.map((r) => {
            const ok = successes >= r.min;
            return (
              <span key={r.min} className="flex items-center gap-1.5 text-foreground">
                <span
                  className={cn(
                    "flex size-5 shrink-0 items-center justify-center rounded-full",
                    ok ? "bg-green text-foreground" : "bg-muted text-muted-foreground",
                  )}
                >
                  {ok ? <Check className="size-3.5" strokeWidth={3} /> : <span className="size-1.5 rounded-full bg-muted-foreground/60" />}
                </span>
                {r.min}개 이상 → 물레 {r.spins}번
              </span>
            );
          })}
          <span className="rounded-full bg-muted/70 px-3 py-1 text-muted-foreground">
            {used > 0 ? `이번 달 ${used}번 돌렸어요. ` : ""}물레 가운데를 눌러 돌려 보세요!
          </span>
        </div>

        {/* 물레(왼쪽) + 보상 목록(오른쪽) */}
        <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
          {/* ───── 물레 ───── */}
          <div className="relative mx-auto flex w-full max-w-sm flex-col items-center">
            {burst > 0 ? <TrophyFountain key={burst} label={cfg.winLabel} className="-inset-x-10 -top-10" /> : null}

            <div className="relative ml-[24%] w-[76%] pb-[16.7%]">
              {/* 물레 받침대 (돌지 않는 부분)
                  - 바퀴를 받치는 기둥 + 버팀대, 길게 뻗은 바닥 널
                  - 왼쪽 끝: 가락(실 감는 쇠꼬챙이)과 가락옷, 그 끝에서 목화솜이 실로 자아져 나옴
                  - 바퀴 위·아래에서 가락으로 이어지는 '물레줄' (바퀴가 돌면 가락이 돌아 실이 감김) */}
              <svg aria-hidden viewBox="0 0 280 342" className="absolute inset-x-0 top-0 w-full overflow-visible" strokeLinejoin="round" strokeLinecap="round">
                {/* 바닥 널 (왼쪽 가락 받침까지 길게) */}
                <rect x="-46" y="318" width="318" height="18" rx="5" className="fill-wood stroke-line" strokeWidth="2.5" />
                <path d="M-36 327 H260" className="stroke-line/25" strokeWidth="2" />
                {/* 물레줄: 바퀴 테두리 위·아래 → 가락 도르래 */}
                <path d="M96 12 L-12 270 M112 272 L-12 288" className="stroke-line/70" strokeWidth="3.6" />
                <path d="M96 12 L-12 270 M112 272 L-12 288" className="stroke-card" strokeWidth="1.8" />
                {/* 기둥 + 버팀대 */}
                <path d="M140 132 V320 M140 250 L196 320 M140 250 L84 320" className="stroke-line" strokeWidth="14" />
                <path d="M140 132 V320 M140 250 L196 320 M140 250 L84 320" className="stroke-wood" strokeWidth="9" />
                {/* 가락 받침 기둥 두 개 */}
                <rect x="-26" y="268" width="8" height="52" className="fill-wood stroke-line" strokeWidth="1.8" />
                <rect x="2" y="268" width="8" height="52" className="fill-wood stroke-line" strokeWidth="1.8" />
                {/* 가락 (가로로 누운 꼬챙이) + 도르래 + 감긴 실(가락옷) */}
                <path d="M-58 279 H24" className="stroke-line" strokeWidth="4.5" />
                <path d="M-58 279 H24" className="stroke-yellow" strokeWidth="2" />
                <ellipse cx="-12" cy="279" rx="4" ry="9" className="fill-primary stroke-line" strokeWidth="1.6" />
                <ellipse cx="-40" cy="279" rx="11" ry="8" className="fill-card stroke-line" strokeWidth="1.8" />
                <path d="M-48 275 Q-40 272 -32 275 M-49 281 Q-40 278 -31 281" className="stroke-line/30" strokeWidth="1.1" />
                {/* 목화 가지: 마른 갈색 꽃받침이 벌어지며 하얀 솜 덩이가 몽글몽글 터져 나온 모양 */}
                <g transform="translate(-84 246)" strokeLinejoin="round" strokeLinecap="round">
                  {/* 가지 + 잎 */}
                  <path d="M-10 64 Q-6 36 0 14" className="fill-none stroke-line" strokeWidth="5" />
                  <path d="M-10 64 Q-6 36 0 14" className="fill-none stroke-wood" strokeWidth="3" />
                  <path d="M-7 42 Q-16 38 -20 30" className="fill-none stroke-wood" strokeWidth="2" />
                  <path d="M-20 30 Q-30 22 -24 14 Q-14 18 -20 30 Z" className="fill-green-deep/80 stroke-line" strokeWidth="1.3" />
                  <path d="M-20 30 Q-23 22 -24 16" className="fill-none stroke-line/40" strokeWidth="0.8" />
                  {/* 꽃받침 (솜 사이로 뾰족하게 보이는 갈색 껍질) */}
                  <path
                    d="M0 14 L-10 20 L-9 10 L-21 8 L-12 1 L-20 -9 L-7 -6 L-4 -19 L3 -8 L13 -16 L11 -3 L22 2 L11 7 L14 18 Z"
                    className="fill-wood stroke-line"
                    strokeWidth="1.4"
                  />
                  {/* 솜 덩이 다섯 (가장자리는 몽글몽글, 안쪽은 크림빛 그늘) */}
                  {[
                    [0, -9, 8.5, 7.5],
                    [-9, -1, 8.5, 8],
                    [9, -1, 8.5, 8],
                    [-5, 8, 8, 7],
                    [6, 8, 8, 7],
                  ].map(([cx, cy, rx, ry]) => (
                    <g key={`${cx}-${cy}`}>
                      <ellipse cx={cx} cy={cy} rx={rx} ry={ry} className="fill-fur stroke-line/55" strokeWidth="1.2" />
                      <ellipse cx={cx + 1.5} cy={cy + 2} rx={rx * 0.55} ry={ry * 0.45} className="fill-yellow/20" />
                      <path d={`M${cx - 3} ${cy - 2} q2 -2 4 0`} className="fill-none stroke-line/20" strokeWidth="0.8" />
                    </g>
                  ))}
                  {/* 솜털 몇 가닥 */}
                  <path d="M-15 -6 q-3 -1 -5 1 M16 -5 q3 -2 5 0 M-1 -18 q0 -3 2 -4" className="fill-none stroke-line/30" strokeWidth="0.8" />
                </g>
                {/* 솜에서 자아져 가락으로 감기는 실 (살짝 꼬인 실) */}
                <path d="M-74 250 Q-64 258 -66 266 Q-68 274 -58 279" className="fill-none stroke-card" strokeWidth="2" />
                <path d="M-74 250 Q-64 258 -66 266 Q-68 274 -58 279" className="fill-none stroke-line/45" strokeWidth="0.7" strokeDasharray="2 2" />
              </svg>

              {/* 맨 위 바늘 = 아래를 가리키는 붓 */}
              <svg aria-hidden viewBox="0 0 24 60" className="absolute left-1/2 top-0 z-10 h-20 w-8 -translate-x-1/2 -translate-y-10 drop-shadow" strokeLinejoin="round">
                <rect x="8" y="1" width="8" height="34" rx="3" className="fill-wood stroke-line" strokeWidth="2" />
                <rect x="7" y="30" width="10" height="6" rx="1" className="fill-yellow stroke-line" strokeWidth="1.6" />
                <path d="M6 36 Q12 33 18 36 L13 58 Q12 60 11 58 Z" className="fill-line stroke-line" strokeWidth="1.6" />
              </svg>

              <svg viewBox={`0 0 ${R * 2} ${R * 2}`} className="relative w-full drop-shadow-[0_6px_0_color-mix(in_oklab,var(--foreground)_15%,transparent)]" role="img" aria-label={`${cfg.boardTitle}, 칸 ${n}개`}>
                <g
                  style={{
                    transform: `rotate(${rotation}deg)`,
                    transformOrigin: "50% 50%",
                    transition: spinning ? "transform 4.5s cubic-bezier(0.17, 0.67, 0.12, 1)" : "none",
                  }}
                >
                  {/* 당첨 칸만 은은하게 빛남 */}
                  {result !== null && !spinning
                    ? (() => {
                        const p0 = point(result * slice, R - 6);
                        const p1 = point((result + 1) * slice, R - 6);
                        return (
                          <path
                            d={`M${R},${R} L${p0.x},${p0.y} A${R - 6},${R - 6} 0 ${slice > 180 ? 1 : 0} 1 ${p1.x},${p1.y} Z`}
                            className="fill-yellow/45"
                          />
                        );
                      })()
                    : null}

                  {/* 바퀴살: 칸마다 두 줄씩 (물레처럼 촘촘하게), 끝에 둥근 꼭지 */}
                  {Array.from({ length: n * 2 }, (_, k) => {
                    const ang = (k * slice) / 2;
                    const a = point(ang, 28);
                    const b = point(ang, R - 10);
                    return (
                      <g key={`spoke-${k}`} strokeLinecap="round">
                        <line x1={a.x} y1={a.y} x2={b.x} y2={b.y} className="stroke-line" strokeWidth={k % 2 ? 5 : 8} />
                        <line x1={a.x} y1={a.y} x2={b.x} y2={b.y} className="stroke-wood" strokeWidth={k % 2 ? 2.5 : 4.5} />
                        <circle cx={b.x} cy={b.y} r={k % 2 ? 3 : 4.5} className="fill-wood stroke-line" strokeWidth="1.5" />
                      </g>
                    );
                  })}

                  {/* 바퀴 테두리 = 살 끝을 지그재그로 엮은 끈 (물레 바퀴의 특징) */}
                  {[0, 1].map((layer) => {
                    const pts = Array.from({ length: n * 4 + 1 }, (_, k) => {
                      const ang = (k * slice) / 4 + (layer ? slice / 4 : 0);
                      const p = point(ang, k % 2 ? R - 20 : R - 6);
                      return `${p.x.toFixed(1)},${p.y.toFixed(1)}`;
                    }).join(" ");
                    return (
                      <g key={`cord-${layer}`}>
                        <polyline points={pts} className="fill-none stroke-line/70" strokeWidth="3.4" strokeLinejoin="round" />
                        <polyline points={pts} className={cn("fill-none", layer ? "stroke-primary/80" : "stroke-card")} strokeWidth="1.8" strokeLinejoin="round" />
                      </g>
                    );
                  })}
                  <circle cx={R} cy={R} r={R - 6} className="fill-none stroke-line/60" strokeWidth="1.5" />

                  {/* 보상 그림(한지 원판)과 번호 */}
                  {rewards.map((r, i) => {
                    const mid = i * slice + slice / 2;
                    const ep = point(mid, R * 0.66);
                    const np = point(mid, R * 0.4);
                    return (
                      <g key={`${r.text}-${i}`}>
                        <circle cx={ep.x} cy={ep.y} r="20" className={cn("stroke-line", result === i && !spinning ? "fill-yellow" : "fill-card")} strokeWidth="1.8" />
                        <text
                          x={ep.x}
                          y={ep.y}
                          textAnchor="middle"
                          dominantBaseline="central"
                          transform={`rotate(${mid} ${ep.x} ${ep.y})`}
                          className="text-[22px]"
                        >
                          {emojiOf(r)}
                        </text>
                        <circle cx={np.x} cy={np.y} r="10" className="fill-card stroke-line" strokeWidth="1.5" />
                        <text
                          x={np.x}
                          y={np.y}
                          textAnchor="middle"
                          dominantBaseline="central"
                          transform={`rotate(${-rotation} ${np.x} ${np.y})`}
                          className="fill-foreground font-display text-[12px]"
                        >
                          {i + 1}
                        </text>
                      </g>
                    );
                  })}

                  {/* 손잡이: 굴대에서 뻗은 나무 팔 + 쥐는 자루 (함께 돎) */}
                  {(() => {
                    const k0 = point(slice / 2 + 180, 26);
                    const k1 = point(slice / 2 + 180, 58);
                    return (
                      <g strokeLinecap="round">
                        <line x1={k0.x} y1={k0.y} x2={k1.x} y2={k1.y} className="stroke-line" strokeWidth="10" />
                        <line x1={k0.x} y1={k0.y} x2={k1.x} y2={k1.y} className="stroke-primary" strokeWidth="6" />
                        <circle cx={k1.x} cy={k1.y} r="8" className="fill-primary stroke-line" strokeWidth="2" />
                        <circle cx={k1.x} cy={k1.y} r="3" className="fill-yellow" />
                      </g>
                    );
                  })()}
                </g>
                {/* 가운데 굴대 (나무 바퀴통) */}
                <circle cx={R} cy={R} r="32" className="fill-wood stroke-line" strokeWidth="2.5" />
                <circle cx={R} cy={R} r="26" className="fill-card stroke-line" strokeWidth="2.5" />
                {/* 가운데 글자 (그림 안에 함께 그려서 늘 가운데에 붙어 있음) */}
                <text x={R} y={R} textAnchor="middle" dominantBaseline="central" className="pointer-events-none fill-primary font-display text-[14px]">
                  {spinning ? "· · ·" : "돌리기"}
                </text>
              </svg>

              {/* 가운데를 누르면 룰렛이 돌아감 */}
              <button
                type="button"
                onClick={spin}
                disabled={spinning || n < 2}
                aria-label={spinning ? "물레가 돌아가는 중" : "물레 돌리기"}
                className="group absolute left-1/2 top-[40.9%] flex aspect-square w-[19%] -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full outline-none transition-transform hover:scale-110 focus-visible:ring-4 focus-visible:ring-ring active:scale-95 disabled:cursor-wait sm:text-base"
              >
                {!spinning ? <span aria-hidden className="absolute inset-0 animate-ping rounded-full border-2 border-primary/50 motion-reduce:hidden" /> : null}

              </button>
            </div>

            {/* 물레 설명 한 줄 */}
            <p className="mt-2 text-center text-xs text-muted-foreground">
              목화솜에서 실을 잣듯, 물레를 돌려 이번 달의 보상을 뽑아요
            </p>

            {/* 당첨 결과 */}
            <p aria-live="polite" className="mt-4 min-h-[3.5rem] text-center">
              {won ? (
                <span className="inline-flex animate-in zoom-in-75 items-center gap-2 rounded-2xl border-[2.5px] border-line bg-card px-4 py-2 font-display text-lg text-foreground shadow-pop-sm duration-500">
                  <span className="text-2xl">{emojiOf(won)}</span> {won.text} {cfg.winLabel}
                </span>
              ) : null}
            </p>

          </div>

          {/* 보상 목록 = 물레로 자아 짠 무명천: 위에 조각보 띠, 둘레에 바느질 자국. 물레 번호 = 목록 번호 */}
          <div className={cn("relative overflow-hidden rounded-md border-[2.5px] border-line p-4 pt-7 shadow-pop-sm", fabric)}>
            <Jogakbo />
            <span aria-hidden className="pointer-events-none absolute inset-2 top-5 rounded-sm border-2 border-dashed border-primary/45" />
            <div className="flex items-center gap-2">
              <p className="flex-1 font-display text-base text-foreground">
                {cfg.listTitle} <span className="text-sm text-muted-foreground">({n}/12)</span>
              </p>
              <Button type="button" size="sm" variant={editing ? "default" : "outline"} onClick={() => setEditing(!editing)}>
                {editing ? <Check /> : <Pencil />}
                {editing ? "다 했어요" : "고치기"}
              </Button>
            </div>
            <ol className="mt-3 grid gap-1.5 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
              {rewards.map((r, i) => {
                const look = catLooks[r.cat] ?? catLooks.do;
                const winner = result === i && !spinning;
                return (
                  <li
                    key={`${r.text}-${i}`}
                    className={cn(
                      "flex items-center gap-2 rounded-xl px-2 py-1.5 text-sm transition-colors",
                      winner ? "bg-primary/15 ring-2 ring-primary" : "bg-background",
                    )}
                  >
                    <span className={cn("flex size-6 shrink-0 items-center justify-center rounded-full font-display text-xs text-foreground", look.chip)}>
                      {i + 1}
                    </span>
                    <span className="shrink-0 text-lg leading-none">{emojiOf(r)}</span>
                    <span className="min-w-0 flex-1 leading-snug text-foreground">{r.text}</span>
                    {editing ? (
                      <button
                        type="button"
                        onClick={() => removeReward(i)}
                        disabled={n <= 2 || spinning}
                        aria-label={`${r.text} 빼기`}
                        className="flex size-7 shrink-0 items-center justify-center rounded-full text-muted-foreground hover:bg-muted disabled:opacity-30"
                      >
                        <Trash2 className="size-3.5" />
                      </button>
                    ) : null}
                  </li>
                );
              })}
            </ol>
            {editing ? (
              <form onSubmit={addReward} className="mt-3 space-y-2 border-t-2 border-dashed border-border pt-3">
                <div className="flex flex-wrap gap-1.5" role="group" aria-label="보상 종류">
                  {cfg.categories.map((c) => {
                    const look = catLooks[c.key];
                    return (
                      <button
                        key={c.key}
                        type="button"
                        onClick={() => setNewCat(c.key)}
                        aria-pressed={newCat === c.key}
                        className={cn(
                          "flex items-center gap-1 rounded-full border-2 px-3 py-1 font-display text-xs sm:text-sm",
                          newCat === c.key ? "border-primary bg-primary text-primary-foreground" : cn("border-transparent text-foreground", look?.chip),
                        )}
                      >
                        {look ? <look.Icon className="size-3.5" /> : null}
                        {c.label}
                      </button>
                    );
                  })}
                </div>
                <div className="flex gap-2">
                  <input
                    value={newText}
                    onChange={(e) => setNewText(e.target.value)}
                    placeholder="예) 새 가방, 제주도 여행"
                    aria-label="새 보상"
                    className="h-10 min-w-0 flex-1 rounded-xl border-2 bg-background px-3 text-sm outline-none focus:border-primary"
                  />
                  <Button type="submit" size="sm" className="h-10" disabled={!newText.trim() || n >= 12}>
                    <Plus />
                    추가
                  </Button>
                </div>
              </form>
            ) : null}
          </div>
        </div>

        {/* 당첨 기록: 맨 위 '기준' 줄과 짝을 이루는 아래 줄 (책갈피 모양 칩). '고치기'로 글을 바꾸거나 지울 수 있음 */}
        <div className={cn("relative overflow-hidden rounded-md border-[2.5px] border-line px-4 pb-3 pt-6 shadow-pop-sm", fabric)}>
          <Jogakbo />
          <span aria-hidden className="pointer-events-none absolute inset-x-2 bottom-1.5 top-4 rounded-sm border-2 border-dashed border-primary/45" />
          <div className="relative flex flex-wrap items-center justify-center gap-2">
            <span className="mr-1 flex items-center gap-1.5 font-display text-base text-foreground">
              <Spool />
              {cfg.historyTitle}
            </span>
            {history.length > 0 ? (
              history.slice(0, editingHistory ? history.length : 6).map((w, i) => {
                const look = catLooks[w.cat] ?? catLooks.do;
                return editingHistory ? (
                  <span key={i} className={cn("flex items-center gap-1 rounded-full border-2 border-line/30 py-0.5 pl-2 pr-1 text-sm", look.chip)}>
                    <input
                      value={w.month}
                      onChange={(e) => editHistory(i, { month: e.target.value })}
                      aria-label="당첨한 달"
                      className="w-12 rounded-full bg-card/80 px-1.5 text-center font-display text-xs outline-none focus:ring-2 focus:ring-ring"
                    />
                    <span>{emojiOf(w)}</span>
                    <input
                      value={w.text}
                      onChange={(e) => editHistory(i, { text: e.target.value })}
                      aria-label="당첨 보상"
                      className="w-36 rounded-full bg-card/80 px-2 text-foreground outline-none focus:ring-2 focus:ring-ring"
                    />
                    <button
                      type="button"
                      onClick={() => removeHistory(i)}
                      aria-label={`${w.text} 기록 지우기`}
                      className="flex size-6 items-center justify-center rounded-full text-muted-foreground hover:bg-card hover:text-foreground"
                    >
                      <X className="size-3.5" />
                    </button>
                  </span>
                ) : (
                  <span
                    key={i}
                    className={cn(
                      "flex items-center gap-1.5 rounded-sm border-2 border-dashed border-line/35 px-3 py-1 text-sm text-foreground shadow-sm",
                      look.chip,
                      i === 0 && "animate-in zoom-in-75 duration-500",
                    )}
                  >
                    <span className="font-display text-xs text-muted-foreground">{w.month}</span>
                    <span>{emojiOf(w)}</span>
                    {w.text}
                  </span>
                );
              })
            ) : (
              <span className="text-sm text-muted-foreground">아직 당첨 기록이 없어요. 물레를 돌려 첫 보상을 받아 보세요!</span>
            )}
            {history.length > 0 ? (
              <Button type="button" size="sm" variant={editingHistory ? "default" : "outline"} className="ml-1" onClick={() => setEditingHistory(!editingHistory)}>
                {editingHistory ? <Check /> : <Pencil />}
                {editingHistory ? "다 했어요" : "고치기"}
              </Button>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
