"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import { CalendarHeart, ChevronLeft, ChevronRight, Pencil, Plus, Search, Star, Trash2, X } from "lucide-react";

import { siteConfig } from "@/site.config";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

/* 일정표 — 02 계획 섹션 안(설명 아래)에 들어가는 다이어리.
   - 한 달을 1일(위)부터 말일(아래)까지 한 줄씩 보여줌. 왼쪽에는 달, 줄마다 날짜와 요일
   - 하루짜리 계획은 그날 줄에, 기간 계획(며칠~며칠)은 오른쪽에 그 기간만큼 세로 칸으로 표시
   - 양옆의 긴 화살표로 지난달·다음 달 (어느 달이든 넘어감). 처음에는 오늘이 속한 달
   - '계획 추가'로 직접 적고, 계획을 누르면 고치기·지우기. 이 브라우저에 저장됨
   - 위쪽 검색창으로 저장한 계획을 찾고, 결과를 누르면 그 달로 이동
   - 처음 보여줄 예시 계획: site.config.ts 의 schedule.months (그 달을 한 번 고치면 저장한 내용이 대신 쓰임) */

const colors = [
  { dot: "bg-sky", soft: "bg-sky/15", border: "border-sky/60", text: "text-sky" },
  { dot: "bg-teal", soft: "bg-teal/15", border: "border-teal/60", text: "text-teal" },
  { dot: "bg-pink", soft: "bg-pink/15", border: "border-pink/60", text: "text-pink" },
  { dot: "bg-primary", soft: "bg-primary/15", border: "border-primary/60", text: "text-primary" },
  { dot: "bg-orange", soft: "bg-orange/15", border: "border-orange/60", text: "text-orange" },
];

const weekdays = ["일", "월", "화", "수", "목", "금", "토"];
const STORE_KEY = "haeboja-schedule";

type Plan = { start: number; end: number; time?: string; title: string; note?: string };
type Ym = { y: number; m: number };
type Draft = { index: number | null; title: string; start: string; end: string; time: string; note: string };

const keyOf = ({ y, m }: Ym) => `${y}-${m}`;
const daysIn = ({ y, m }: Ym) => new Date(y, m, 0).getDate();
const shift = ({ y, m }: Ym, by: number): Ym => {
  const d = new Date(y, m - 1 + by, 1);
  return { y: d.getFullYear(), m: d.getMonth() + 1 };
};

/** 기간 계획들이 겹치지 않게 줄(lane) 나누기 */
function assignLanes<T extends Plan>(ranges: T[]) {
  const laneEnds: number[] = [];
  return ranges.map((r) => {
    let lane = laneEnds.findIndex((end) => end < r.start);
    if (lane === -1) {
      lane = laneEnds.length;
      laneEnds.push(r.end);
    } else laneEnds[lane] = r.end;
    return { ...r, lane };
  });
}

/** 지난달 / 다음 달로 넘기는 긴 화살표 (보드 옆에 세로로 길게). 글자는 "10" 아래 "월" */
function LongArrow({ side, target, onClick }: { side: "left" | "right"; target: Ym; onClick: () => void }) {
  const Icon = side === "left" ? ChevronLeft : ChevronRight;
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={`${target.y}년 ${target.m}월 일정 보기`}
      className="group w-11 shrink-0 self-stretch rounded-2xl border-[2.5px] border-line bg-teal/15 text-foreground shadow-pop-sm transition-colors hover:bg-teal/30 sm:w-16"
    >
      {/* 다이어리가 길어도 화살표가 늘 보이도록 화면 가운데에 붙어 있음 */}
      <span className="sticky top-[45vh] flex flex-col items-center gap-1 py-6">
        <Icon
          className={cn(
            "size-7 transition-transform sm:size-9",
            side === "left" ? "group-hover:-translate-x-1" : "group-hover:translate-x-1",
          )}
          strokeWidth={3}
        />
        <span className="font-display text-xl leading-none sm:text-2xl">{target.m}</span>
        <span className="font-display text-xs text-foreground/70 sm:text-sm">월</span>
      </span>
    </button>
  );
}

const inputClass = "h-10 rounded-xl border-2 bg-background px-3 text-sm outline-none focus:border-primary";

export function ScheduleBoard() {
  const { schedule } = siteConfig;
  const first = schedule.months[0];
  const [view, setView] = useState<Ym>({ y: first.year, m: first.month });
  const [dir, setDir] = useState<1 | -1>(1); // 넘긴 방향 (그림이 들어오는 쪽)
  const [today, setToday] = useState<{ y: number; m: number; d: number } | null>(null);
  const [stored, setStored] = useState<Record<string, Plan[]>>({});
  const [draft, setDraft] = useState<Draft | null>(null);
  const [query, setQuery] = useState("");
  const [flash, setFlash] = useState(""); // 검색으로 찾아간 계획 잠깐 반짝

  // 처음에는 오늘이 속한 달로 + 오늘 줄 표시 + 저장해 둔 계획 불러오기
  useEffect(() => {
    const timer = setTimeout(() => {
      const now = new Date();
      setToday({ y: now.getFullYear(), m: now.getMonth() + 1, d: now.getDate() });
      setView({ y: now.getFullYear(), m: now.getMonth() + 1 });
      try {
        const saved = JSON.parse(window.localStorage.getItem(STORE_KEY) ?? "{}");
        if (saved && typeof saved === "object") setStored(saved);
      } catch {
        // 저장 공간을 못 쓰면 예시만
      }
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  /** 그 달의 계획: 저장한 게 있으면 그것, 없으면 site.config.ts 예시 */
  const plansOf = (ym: Ym): Plan[] =>
    stored[keyOf(ym)] ?? schedule.months.find((x) => x.year === ym.y && x.month === ym.m)?.events ?? [];

  function persist(ym: Ym, list: Plan[]) {
    const next = { ...stored, [keyOf(ym)]: list };
    setStored(next);
    try {
      window.localStorage.setItem(STORE_KEY, JSON.stringify(next));
    } catch {
      // 기억 못 해도 괜찮아요
    }
  }

  function go(by: number) {
    setDir(by > 0 ? 1 : -1);
    setView((v) => shift(v, by));
    setDraft(null);
  }

  const days = daysIn(view);
  const plans = plansOf(view).map((p, i) => ({ ...p, index: i, color: i }));
  const singles = plans.filter((p) => p.start === p.end);
  const ranges = assignLanes(plans.filter((p) => p.start !== p.end).sort((a, b) => a.start - b.start));
  const lanes = Math.max(0, ...ranges.map((r) => r.lane + 1));
  const prev = shift(view, -1);
  const next = shift(view, 1);

  // ── 추가 / 고치기 ──
  function openAdd(day?: number) {
    const d = String(day ?? (today && today.y === view.y && today.m === view.m ? today.d : 1));
    setDraft({ index: null, title: "", start: d, end: d, time: "", note: "" });
  }
  function openEdit(i: number) {
    const p = plansOf(view)[i];
    setDraft({ index: i, title: p.title, start: String(p.start), end: String(p.end), time: p.time ?? "", note: p.note ?? "" });
  }
  function saveDraft(e: FormEvent) {
    e.preventDefault();
    if (!draft || !draft.title.trim()) return;
    let start = Math.min(Math.max(1, Number(draft.start) || 1), days);
    let end = Math.min(Math.max(1, Number(draft.end) || start), days);
    if (end < start) [start, end] = [end, start];
    const plan: Plan = { start, end, title: draft.title.trim(), time: draft.time.trim(), note: draft.note.trim() };
    const list = [...plansOf(view)];
    if (draft.index === null) list.push(plan);
    else list[draft.index] = plan;
    persist(view, list.sort((a, b) => a.start - b.start));
    setDraft(null);
  }
  function removeDraft() {
    if (!draft || draft.index === null) return;
    persist(
      view,
      plansOf(view).filter((_, i) => i !== draft.index),
    );
    setDraft(null);
  }

  // ── 검색 (저장한 달 + 예시 달 모두) ──
  const results = useMemo(() => {
    const q = query.trim();
    if (!q) return [];
    const months = new Map<string, Ym>();
    for (const x of schedule.months) months.set(`${x.year}-${x.month}`, { y: x.year, m: x.month });
    for (const k of Object.keys(stored)) {
      const [y, m] = k.split("-").map(Number);
      months.set(k, { y, m });
    }
    const found: { ym: Ym; plan: Plan }[] = [];
    for (const ym of months.values()) {
      const list = stored[keyOf(ym)] ?? schedule.months.find((x) => x.year === ym.y && x.month === ym.m)?.events ?? [];
      for (const plan of list) {
        if (`${plan.title} ${plan.note ?? ""}`.includes(q)) found.push({ ym, plan });
      }
    }
    return found.sort((a, b) => a.ym.y - b.ym.y || a.ym.m - b.ym.m || a.plan.start - b.plan.start).slice(0, 20);
  }, [query, stored, schedule.months]);

  function jump(ym: Ym, title: string) {
    setDir(ym.y * 12 + ym.m >= view.y * 12 + view.m ? 1 : -1);
    setView(ym);
    setQuery("");
    setDraft(null);
    setFlash(title);
    window.setTimeout(() => setFlash(""), 2200);
  }

  return (
    <div id="schedule" className="relative mt-20 scroll-mt-24">
      {/* 둥실둥실 장식 */}
      <div aria-hidden className="pointer-events-none absolute inset-0 hidden md:block">
        <div className="absolute -right-4 -top-14 z-10 flex size-14 animate-float items-center justify-center rounded-full border-[2.5px] border-line bg-pink text-card shadow-pop">
          <CalendarHeart className="size-7" />
        </div>
        <div className="absolute -bottom-6 -left-5 z-10 flex size-12 animate-float items-center justify-center rounded-full border-[2.5px] border-line bg-sky text-card shadow-pop [animation-delay:-3s]">
          <Star className="size-6 fill-card" />
        </div>
      </div>

      {/* 보드 */}
      <div className="relative rounded-[2rem] border-[3px] border-line bg-card/50 p-2 pt-12 shadow-pop backdrop-blur sm:p-5 sm:pt-14">
        {/* 청록 거리 표지판 제목 */}
        <div className="absolute inset-x-0 -top-8 flex justify-center px-4">
          <p className="relative -rotate-1 rounded-2xl border-[2.5px] border-line bg-teal px-6 py-3 text-center font-display text-xl text-card shadow-pop sm:px-10 sm:text-3xl">
            <span aria-hidden className="absolute inset-1.5 rounded-xl border-2 border-line/70" />
            {schedule.boardTitle}
          </p>
        </div>

        {/* 검색 + 계획 추가 */}
        <div className="relative mb-4 flex flex-col gap-2 sm:flex-row sm:items-center">
          <label className="relative flex-1">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={schedule.searchPlaceholder}
              aria-label="계획 검색"
              className={cn(inputClass, "h-11 w-full pl-9")}
            />
          </label>
          <Button type="button" onClick={() => openAdd()}>
            <Plus />
            {schedule.addLabel}
          </Button>

          {/* 검색 결과 */}
          {query.trim() ? (
            <div className="absolute inset-x-0 top-full z-30 mt-2 max-h-80 overflow-auto rounded-2xl border-[2.5px] border-line bg-card p-2 shadow-pop">
              {results.length === 0 ? (
                <p className="px-3 py-2 text-sm text-muted-foreground">“{query.trim()}”(이)가 들어간 계획이 없어요.</p>
              ) : (
                <ul>
                  {results.map(({ ym, plan }, i) => (
                    <li key={i}>
                      <button
                        type="button"
                        onClick={() => jump(ym, plan.title)}
                        className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left hover:bg-muted"
                      >
                        <span className="w-28 shrink-0 font-display text-xs text-teal">
                          {ym.y}.{ym.m} · {plan.start === plan.end ? `${plan.start}일` : `${plan.start}~${plan.end}일`}
                        </span>
                        <span className="min-w-0 flex-1 truncate text-sm text-foreground">
                          {plan.title}
                          {plan.note ? <span className="text-muted-foreground"> · {plan.note}</span> : null}
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ) : null}
        </div>

        {/* 계획 적기 / 고치기 */}
        {draft ? (
          <form
            onSubmit={saveDraft}
            className="mb-4 grid gap-2 rounded-2xl border-[2.5px] border-line bg-card p-4 shadow-pop-sm animate-in fade-in slide-in-from-top-2 duration-300 sm:grid-cols-[1fr_auto]"
          >
            <p className="flex items-center gap-2 font-display text-base text-foreground sm:col-span-2">
              <Pencil className="size-4 text-primary" />
              {view.m}월 {draft.index === null ? "계획 추가" : "계획 고치기"}
              <button
                type="button"
                onClick={() => setDraft(null)}
                aria-label="닫기"
                className="ml-auto flex size-8 items-center justify-center rounded-full text-muted-foreground hover:bg-muted"
              >
                <X className="size-4" />
              </button>
            </p>
            <input
              value={draft.title}
              onChange={(e) => setDraft({ ...draft, title: e.target.value })}
              placeholder="무엇을 할까요? 예) 독서지도사 강의 듣기"
              aria-label="계획 이름"
              className={cn(inputClass, "sm:col-span-2")}
              autoFocus
            />
            <div className="flex flex-wrap items-center gap-2 text-sm text-foreground sm:col-span-2">
              <input
                type="number"
                min={1}
                max={days}
                value={draft.start}
                onChange={(e) => setDraft({ ...draft, start: e.target.value, end: Number(e.target.value) > Number(draft.end) ? e.target.value : draft.end })}
                aria-label="시작일"
                className={cn(inputClass, "w-20")}
              />
              일부터
              <input
                type="number"
                min={1}
                max={days}
                value={draft.end}
                onChange={(e) => setDraft({ ...draft, end: e.target.value })}
                aria-label="끝나는 날"
                className={cn(inputClass, "w-20")}
              />
              일까지
              <input
                value={draft.time}
                onChange={(e) => setDraft({ ...draft, time: e.target.value })}
                placeholder="시간 (예: 7PM)"
                aria-label="시간"
                className={cn(inputClass, "w-32")}
              />
            </div>
            <input
              value={draft.note}
              onChange={(e) => setDraft({ ...draft, note: e.target.value })}
              placeholder="메모 (없어도 돼요)"
              aria-label="메모"
              className={inputClass}
            />
            <div className="flex gap-2">
              {draft.index !== null ? (
                <Button type="button" variant="outline" onClick={removeDraft}>
                  <Trash2 />
                  지우기
                </Button>
              ) : null}
              <Button type="submit" disabled={!draft.title.trim()}>
                저장
              </Button>
            </div>
          </form>
        ) : null}

        <div className="flex gap-2 sm:gap-3">
          <LongArrow side="left" target={prev} onClick={() => go(-1)} />

          {/* 이번에 보는 한 달 (넘길 때 옆에서 미끄러져 들어옴) */}
          <div
            key={keyOf(view)}
            aria-live="polite"
            className={cn(
              "flex min-w-0 flex-1 flex-col gap-3 animate-in fade-in duration-500 md:flex-row",
              dir === 1 ? "slide-in-from-right-8" : "slide-in-from-left-8",
            )}
          >
            {/* 왼쪽: 달 */}
            <div className="shrink-0 md:w-28">
              <div className="flex items-center justify-center gap-3 rounded-2xl border-[2.5px] border-line bg-linear-to-br from-teal/35 to-sky/20 px-4 py-3 shadow-pop-sm md:sticky md:top-24 md:flex-col md:gap-1 md:py-6">
                <span className="font-display text-sm text-foreground/60">{view.y}</span>
                <span className="font-display text-6xl leading-none text-teal [text-shadow:0_4px_0_var(--card)] md:text-7xl">
                  {view.m}
                </span>
                <span className="font-display text-lg text-foreground/70">월</span>
                <span className="font-display text-xs text-muted-foreground md:mt-2">1일 ~ {days}일</span>
              </div>
            </div>

            {/* 다이어리: 1일 ~ 말일 */}
            <div className="min-w-0 flex-1 overflow-hidden rounded-2xl border-[2.5px] border-line bg-card shadow-pop-sm">
              <div
                className="grid"
                style={{
                  gridTemplateColumns: `3.4rem minmax(0,1fr)${lanes > 0 ? ` repeat(${lanes}, minmax(4.5rem, 8.5rem))` : ""}`,
                  gridTemplateRows: `repeat(${days}, minmax(2.6rem, auto))`,
                }}
              >
                {Array.from({ length: days }, (_, k) => {
                  const d = k + 1;
                  const wd = new Date(view.y, view.m - 1, d).getDay();
                  const isToday = today?.y === view.y && today?.m === view.m && today?.d === d;
                  const dayPlans = singles.filter((p) => p.start === d);
                  return (
                    <div key={d} className="contents">
                      {/* 줄 바탕 (주말은 옅게, 오늘은 강조). 빈 곳을 누르면 그날 계획 추가 */}
                      <button
                        type="button"
                        tabIndex={-1}
                        aria-hidden
                        onClick={() => openAdd(d)}
                        className={cn(
                          "border-b border-border/50 hover:bg-muted/50",
                          wd === 0 && "bg-pink/5",
                          wd === 6 && "bg-sky/5",
                          isToday && "bg-accent",
                        )}
                        style={{ gridColumn: "1 / -1", gridRow: d }}
                      />
                      {/* 날짜 + 요일 */}
                      <div className="pointer-events-none relative flex items-center gap-1 pl-2.5 sm:pl-3" style={{ gridColumn: 1, gridRow: d }}>
                        <span
                          className={cn(
                            "font-display text-base leading-none sm:text-lg",
                            wd === 0 ? "text-red-deep" : wd === 6 ? "text-sky" : "text-foreground",
                            isToday && "flex size-7 items-center justify-center rounded-full bg-primary text-primary-foreground",
                          )}
                        >
                          {d}
                        </span>
                        <span className="text-[10px] text-muted-foreground sm:text-xs">{weekdays[wd]}</span>
                      </div>
                      {/* 그날 계획 (누르면 고치기) */}
                      <div
                        className="pointer-events-none relative flex flex-wrap items-center gap-1.5 py-1 pr-2"
                        style={{ gridColumn: 2, gridRow: d }}
                      >
                        {dayPlans.map((p) => {
                          const c = colors[p.color % colors.length];
                          return (
                            <button
                              key={`${p.title}-${p.index}`}
                              type="button"
                              onClick={() => openEdit(p.index)}
                              className={cn(
                                "pointer-events-auto flex items-center gap-1.5 rounded-lg px-2 py-1 text-left text-sm text-foreground transition-shadow hover:ring-2 hover:ring-primary/40",
                                c.soft,
                                flash === p.title && "animate-pulse ring-4 ring-primary",
                              )}
                            >
                              <span className={cn("size-2 shrink-0 rounded-full", c.dot)} />
                              <span className="font-display">{p.title}</span>
                              {p.time ? <span className="text-xs text-muted-foreground">{p.time}</span> : null}
                              {p.note ? <span className="hidden text-xs text-muted-foreground sm:inline">· {p.note}</span> : null}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}

                {/* 기간 계획: 시작일 ~ 끝날 줄을 세로로 차지 (누르면 고치기) */}
                {ranges.map((r) => {
                  const c = colors[r.color % colors.length];
                  return (
                    <button
                      key={`${r.title}-${r.index}`}
                      type="button"
                      onClick={() => openEdit(r.index)}
                      className={cn(
                        "relative z-10 m-1 flex flex-col rounded-xl border-2 p-2 text-left transition-shadow hover:ring-2 hover:ring-primary/40",
                        c.soft,
                        c.border,
                        flash === r.title && "animate-pulse ring-4 ring-primary",
                      )}
                      style={{ gridColumn: 3 + r.lane, gridRow: `${r.start} / ${r.end + 1}` }}
                    >
                      <span className={cn("font-display text-xs", c.text)}>
                        {r.start}일 ~ {r.end}일
                      </span>
                      <span className="mt-0.5 font-display text-sm leading-snug text-foreground">{r.title}</span>
                      {r.time ? <span className="text-xs text-muted-foreground">{r.time}</span> : null}
                      {r.note ? <span className="mt-1 text-xs leading-snug text-muted-foreground">{r.note}</span> : null}
                      {/* 기간 동안 이어지는 세로 막대 */}
                      <span aria-hidden className={cn("mt-2 w-1.5 flex-1 self-center rounded-full opacity-60", c.dot)} />
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <LongArrow side="right" target={next} onClick={() => go(1)} />
        </div>
      </div>
    </div>
  );
}
