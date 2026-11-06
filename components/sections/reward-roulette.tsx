"use client";

import { useEffect, useState, type FormEvent } from "react";
import { Check, Gift, Lock, Pencil, Plus, ShoppingBag, Sparkles, Trash2, type LucideIcon } from "lucide-react";

import { siteConfig } from "@/site.config";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { TrophyFountain } from "@/components/ui/trophy-fountain";

/* 보상 룰렛 — 04 결과 섹션 안, 성과 그래프 아래.
   - 이번 달 성공 개수(achievements.months 의 이번 달 숫자)가 기준(roulette.rules)을 넘으면 룰렛을 돌릴 수 있음
     예) 5개 이상 → 그 달에 1번, 10개 이상 → 2번
   - 룰렛 칸 = 내가 사고 싶은 것 / 갖고 싶은 것 / 하고 싶은 것. '보상 목록 고치기'에서 추가·삭제
   - 돌린 횟수, 고친 목록, 당첨 기록은 이 브라우저에 저장됨
   - 색: 사고 싶은 것 = 분홍, 갖고 싶은 것 = 하늘, 하고 싶은 것 = 노랑 (파스텔) */

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
  const earned = rules.filter((r) => successes >= r.min).reduce((best, r) => Math.max(best, r.spins), 0);
  const left = Math.max(0, earned - used);
  const nextRule = rules.find((r) => successes < r.min);

  const n = rewards.length;
  const slice = 360 / n;

  function spin() {
    if (spinning || left <= 0 || n < 2) return;
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

  const won = result !== null ? rewards[result] : null;

  return (
    <div className="relative mt-20">
      {/* 노랑 거리 표지판 제목 */}
      <div className="absolute inset-x-0 -top-8 z-20 flex justify-center px-4">
        <p className="relative rotate-1 rounded-2xl border-4 border-card bg-yellow px-6 py-3 text-center font-display text-xl text-foreground shadow-pop sm:px-10 sm:text-3xl">
          <span aria-hidden className="absolute inset-1.5 rounded-xl border-2 border-card/70" />
          {cfg.boardTitle}
        </p>
      </div>

      <div className="grid items-start gap-8 rounded-[2rem] border-[6px] border-card bg-card/50 p-4 pt-14 shadow-pop backdrop-blur sm:p-8 sm:pt-16 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        {/* ───── 룰렛 ───── */}
        <div className="relative mx-auto flex w-full max-w-sm flex-col items-center">
          {burst > 0 ? <TrophyFountain key={burst} label={cfg.winLabel} className="-inset-x-10 -top-10" /> : null}

          <div className="relative w-full">
            {/* 맨 위 바늘 */}
            <div className="absolute left-1/2 top-0 z-10 -translate-x-1/2 -translate-y-1">
              <div className="h-0 w-0 border-x-[14px] border-t-[24px] border-x-transparent border-t-foreground drop-shadow" />
            </div>

            <svg viewBox={`0 0 ${R * 2} ${R * 2}`} className="w-full drop-shadow-[0_8px_0_color-mix(in_oklab,var(--foreground)_15%,transparent)]" role="img" aria-label={`${cfg.boardTitle}, 칸 ${n}개`}>
              <g
                style={{
                  transform: `rotate(${rotation}deg)`,
                  transformOrigin: "50% 50%",
                  transition: spinning ? "transform 4.5s cubic-bezier(0.17, 0.67, 0.12, 1)" : "none",
                }}
              >
                {rewards.map((r, i) => {
                  const a0 = i * slice;
                  const a1 = (i + 1) * slice;
                  const p0 = point(a0, R - 4);
                  const p1 = point(a1, R - 4);
                  const large = slice > 180 ? 1 : 0;
                  const mid = a0 + slice / 2;
                  const ep = point(mid, R * 0.7); // 그림 (바깥쪽)
                  const np = point(mid, R * 0.4); // 번호 (안쪽) — 이름은 오른쪽 '보상 목록'에서
                  const look = catLooks[r.cat] ?? catLooks.do;
                  return (
                    <g key={`${r.text}-${i}`}>
                      <path
                        d={`M${R},${R} L${p0.x},${p0.y} A${R - 4},${R - 4} 0 ${large} 1 ${p1.x},${p1.y} Z`}
                        className={cn(look.fill, "stroke-card", result === i && !spinning && "fill-primary/50")}
                        strokeWidth="3"
                      />
                      <text
                        x={ep.x}
                        y={ep.y}
                        textAnchor="middle"
                        dominantBaseline="middle"
                        transform={`rotate(${mid} ${ep.x} ${ep.y})`}
                        className="text-[30px]"
                      >
                        {emojiOf(r)}
                      </text>
                      <circle cx={np.x} cy={np.y} r="11" className="fill-card" />
                      <text
                        x={np.x}
                        y={np.y}
                        textAnchor="middle"
                        dominantBaseline="central"
                        transform={`rotate(${-rotation} ${np.x} ${np.y})`}
                        className="fill-foreground font-display text-[13px]"
                      >
                        {i + 1}
                      </text>
                    </g>
                  );
                })}
                <circle cx={R} cy={R} r={R - 4} className="fill-none stroke-card" strokeWidth="8" />
              </g>
              {/* 가운데 단추 */}
              <circle cx={R} cy={R} r="26" className="fill-card stroke-primary/40" strokeWidth="4" />
              <text x={R} y={R} textAnchor="middle" dominantBaseline="middle" className="fill-primary font-display text-[13px]">
                {left > 0 ? `${left}번` : "잠김"}
              </text>
            </svg>
          </div>

          <Button type="button" size="lg" className="mt-5" onClick={spin} disabled={spinning || left <= 0 || n < 2}>
            {left > 0 ? <Sparkles /> : <Lock />}
            {spinning ? "돌아가는 중…" : cfg.spinLabel}
          </Button>

          {/* 당첨 결과 */}
          <p aria-live="polite" className="mt-4 min-h-[3.5rem] text-center">
            {won ? (
              <span className="inline-flex animate-in zoom-in-75 items-center gap-2 rounded-2xl border-4 border-card bg-card px-4 py-2 font-display text-lg text-foreground shadow-pop-sm duration-500">
                <span className="text-2xl">{emojiOf(won)}</span> {won.text} {cfg.winLabel}
              </span>
            ) : null}
          </p>

        </div>

        {/* ───── 기준 + 목록 + 기록 ───── */}
        <div className="space-y-4">
          {/* 기준 */}
          <div className="rounded-2xl border-4 border-card bg-card p-4 shadow-pop-sm">
            <p className="font-display text-base text-foreground">
              {monthLabel || "이번 달"} 성공 <span className="text-2xl text-primary">{successes}</span>개
            </p>
            <ul className="mt-3 space-y-2">
              {rules.map((r) => {
                const ok = successes >= r.min;
                return (
                  <li key={r.min} className="flex items-center gap-2 text-sm text-foreground">
                    <span
                      className={cn(
                        "flex size-6 shrink-0 items-center justify-center rounded-full",
                        ok ? "bg-green text-foreground" : "bg-muted text-muted-foreground",
                      )}
                    >
                      {ok ? <Check className="size-4" strokeWidth={3} /> : <Lock className="size-3.5" />}
                    </span>
                    한 달에 {r.min}개 이상 성공 → 룰렛 {r.spins}번
                  </li>
                );
              })}
            </ul>
            <p className="mt-3 rounded-xl bg-muted/60 px-3 py-2 text-sm text-muted-foreground">
              {earned > 0
                ? `이번 달 ${earned}번 중 ${Math.min(used, earned)}번 돌렸어요. ${left > 0 ? `${left}번 더 돌릴 수 있어요!` : "다음 달에 또 만나요!"}`
                : nextRule
                  ? `${nextRule.min - successes}개만 더 성공하면 룰렛을 돌릴 수 있어요!`
                  : ""}
            </p>
          </div>

          {/* 보상 목록: 룰렛 번호 = 목록 번호. '고치기'를 누르면 추가·삭제 */}
          <div className="rounded-2xl border-4 border-card bg-card p-4 shadow-pop-sm">
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

          {/* 당첨 기록 */}
          {history.length > 0 ? (
            <div className="rounded-2xl border-4 border-card bg-card p-4 shadow-pop-sm">
              <p className="font-display text-base text-foreground">{cfg.historyTitle}</p>
              <ul className="mt-2 space-y-1.5">
                {history.slice(0, 5).map((w, i) => {
                  const look = catLooks[w.cat] ?? catLooks.do;
                  return (
                    <li key={i} className="flex items-center gap-2 text-sm text-foreground">
                      <span className="w-10 shrink-0 font-display text-xs text-muted-foreground">{w.month}</span>
                      <span className={cn("flex size-6 shrink-0 items-center justify-center rounded-full", look.chip)}>
                        <look.Icon className="size-3.5" />
                      </span>
                      {emojiOf(w)} {w.text}
                    </li>
                  );
                })}
              </ul>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
