"use client";

import { useEffect, useState, type FormEvent } from "react";
import Image from "next/image";
import { ArrowUpRight, ChevronLeft, ChevronRight, NotebookPen, Plus, Trash2, X } from "lucide-react";

import { siteConfig } from "@/site.config";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Doodle, doodleFor, type DoodleKind } from "@/components/ui/doodles";
import type { Frame } from "@/components/sections/thought-film-client";

/* 생각 책 (움직이는 부분) — 펼쳐 놓은 옛 책.
   - 넓은 화면은 두 쪽씩, 휴대폰은 한 쪽씩 보임
   - ‹ › 단추(또는 책 모서리)를 누르면 종이가 3D로 넘어감 (app/globals.css 의 animate-turn-*)
   - 쪽을 누르면 아래에 '기록 칸'이 열림 (꼬리표 + 한 줄 + 날짜, 이 브라우저에 저장)
   - 글자: site.config.ts 의 thoughts */

type Note = { id: string; tag: string; text: string; date: string };
type Turn = { dir: "next" | "prev"; to: number };

const NOTES_KEY = "haeboja-thought-notes"; // 생각 필름과 같은 저장 칸 (기록이 이어짐)

/* 꼬리표 색 (차례대로) */
const tagColors = ["bg-sky/25", "bg-pink/25", "bg-teal/25", "bg-orange/25"];

const today = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

/** 책 한 쪽 (한지 + 붉은 테두리 괘선 + 세로줄) */
function Page({
  frame,
  index,
  side,
  active,
  count,
  onPick,
}: {
  frame?: Frame;
  index: number;
  side: "left" | "right";
  active?: boolean;
  count?: number;
  onPick?: () => void;
}) {
  const inner = (
    <span
      className={cn(
        "relative flex h-full flex-col border-[1.5px] border-primary/35 p-4 outline outline-1 outline-offset-[3px] outline-primary/25 sm:p-6",
        "bg-[repeating-linear-gradient(90deg,transparent_0_31px,color-mix(in_oklab,var(--primary)_9%,transparent)_31px_32px)]",
      )}
    >
      {frame ? (
        <>
          <span className="flex items-center justify-between">
            <span className="font-display text-sm text-primary">제{index + 1}장</span>
            {count ? (
              <span className="flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 font-display text-xs text-primary">
                <NotebookPen className="size-3" />
                {count}
              </span>
            ) : null}
          </span>
          {frame.image_url ? (
            <span className="relative mt-3 block aspect-video overflow-hidden rounded border border-line/30">
              <Image src={frame.image_url} alt="" fill sizes="320px" className="object-cover sepia-[0.2]" />
            </span>
          ) : (
            // 사진이 없으면 제목에 맞는 손그림 (components/ui/doodles.tsx)
            <span className="mx-auto mt-3 block aspect-video w-4/5">
              <Doodle kind={doodleFor(frame.title, index)} />
            </span>
          )}
          <span className="mt-auto block pt-3 font-display text-2xl text-foreground">{frame.title}</span>
          {frame.description ? (
            <span className="mt-2 line-clamp-3 block text-sm leading-relaxed text-muted-foreground">{frame.description}</span>
          ) : null}
          <span className="mt-3 inline-flex items-center gap-1 self-start font-display text-sm text-primary underline-offset-4 group-hover/page:underline">
            <NotebookPen className="size-3.5" />
            {active ? "기록 닫기" : "기록 적기"}
          </span>
        </>
      ) : (
        // 남은 빈 쪽
        <span className="m-auto text-center font-display text-sm text-muted-foreground/70">
          아직 비어 있는 쪽
          <br />새 생각을 기다려요
        </span>
      )}
      {/* 쪽 번호 */}
      <span className="absolute inset-x-0 bottom-1.5 text-center font-display text-xs text-muted-foreground">
        · {index + 1} ·
      </span>
    </span>
  );

  const paper = cn(
    "group/page block h-full w-full bg-card p-3 text-left sm:p-4",
    side === "left"
      ? "rounded-l-md bg-linear-to-l from-line/10 via-transparent to-transparent"
      : "rounded-r-md bg-linear-to-r from-line/10 via-transparent to-transparent",
  );

  return frame && onPick ? (
    <button
      type="button"
      onClick={onPick}
      aria-pressed={active}
      aria-label={`${frame.title} 기록 칸 ${active ? "닫기" : "열기"}`}
      className={cn(paper, "outline-none focus-visible:ring-4 focus-visible:ring-inset focus-visible:ring-ring", active && "ring-4 ring-inset ring-primary/40")}
    >
      {inner}
    </button>
  ) : (
    <div className={paper}>{inner}</div>
  );
}

export function ThoughtBook({ frames }: { frames: Frame[] }) {
  const { thoughts } = siteConfig;
  const [perPage, setPerPage] = useState(2);
  const [page, setPage] = useState(0); // 지금 펼친 첫 쪽 번호
  const [turn, setTurn] = useState<Turn | null>(null);
  const [selected, setSelected] = useState<number | null>(null);
  const [notes, setNotes] = useState<Record<string, Note[]>>({});
  const [tag, setTag] = useState("");
  const [text, setText] = useState("");
  const [date, setDate] = useState("");

  // 저장해 둔 기록 불러오기 + 화면 폭에 맞춰 한 쪽/두 쪽
  useEffect(() => {
    const media = window.matchMedia("(min-width: 768px)");
    const apply = () => {
      const n = media.matches ? 2 : 1;
      setPerPage(n);
      setPage((p) => Math.floor(p / n) * n);
    };
    const timer = setTimeout(() => {
      apply();
      try {
        const saved = JSON.parse(window.localStorage.getItem(NOTES_KEY) ?? "{}");
        if (saved && typeof saved === "object") setNotes(saved);
      } catch {
        // 저장 공간을 못 쓰면 빈 상태로
      }
    }, 0);
    media.addEventListener("change", apply);
    return () => {
      clearTimeout(timer);
      media.removeEventListener("change", apply);
    };
  }, []);

  const total = Math.max(perPage, Math.ceil(frames.length / perPage) * perPage);
  const canPrev = page > 0 && !turn;
  const canNext = page + perPage < total && !turn;

  function flip(dir: "next" | "prev") {
    if (dir === "next" ? !canNext : !canPrev) return;
    const to = dir === "next" ? page + perPage : page - perPage;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setPage(to);
      return;
    }
    setTurn({ dir, to });
  }

  /** 목차에서 고른 장이 있는 쪽으로 바로 넘기기 */
  function jump(i: number) {
    if (turn) return;
    const to = Math.floor(i / perPage) * perPage;
    if (to === page) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setPage(to);
      return;
    }
    setTurn({ dir: to > page ? "next" : "prev", to });
  }

  function finishTurn() {
    if (!turn) return;
    setPage(turn.to);
    setTurn(null);
  }

  // ── 기록 칸 ──
  const frame = selected !== null ? frames[selected] : null;
  const kind: DoodleKind | null = frame && selected !== null ? doodleFor(frame.title, selected) : null;
  const tags = kind ? thoughts.noteTags[kind] : [];
  const list = frame ? (notes[frame.title] ?? []) : [];

  function save(next: Record<string, Note[]>) {
    setNotes(next);
    try {
      window.localStorage.setItem(NOTES_KEY, JSON.stringify(next));
    } catch {
      // 기억 못 해도 괜찮아요
    }
  }

  function choose(i: number) {
    if (selected === i) {
      setSelected(null);
      return;
    }
    setSelected(i);
    const k = doodleFor(frames[i].title, i);
    setTag(thoughts.noteTags[k][0] ?? "");
    setText("");
    setDate(today());
  }

  function add(e: FormEvent) {
    e.preventDefault();
    if (!frame || !text.trim()) return;
    const note: Note = { id: `${Date.now()}`, tag, text: text.trim(), date: date || today() };
    save({ ...notes, [frame.title]: [note, ...list] });
    setText("");
  }

  function remove(id: string) {
    if (!frame) return;
    save({ ...notes, [frame.title]: list.filter((n) => n.id !== id) });
  }

  const pageOf = (i: number, side: "left" | "right", interactive = true) => (
    <Page
      frame={frames[i]}
      index={i}
      side={side}
      active={selected === i}
      count={frames[i] ? (notes[frames[i].title]?.length ?? 0) : 0}
      onPick={interactive && frames[i] ? () => choose(i) : undefined}
    />
  );

  /* 넘기는 동안 아래에 깔려 보이는 쪽 */
  const two = perPage === 2;
  const leftIndex = turn?.dir === "prev" ? turn.to : page;
  const rightIndex = turn?.dir === "next" ? (two ? turn.to + 1 : turn.to) : two ? page + 1 : page;

  return (
    <>
      <div className="mx-auto mt-6 max-w-4xl">
        {/* 목차: 모든 장을 한눈에 (누르면 그 쪽으로 넘어감, 지금 펼친 장은 붉게) */}
        <nav aria-label="사색록 목차" className="mb-6 flex flex-wrap items-center justify-center gap-2">
          <span className="mr-1 font-display text-sm tracking-[0.2em] text-muted-foreground">목차</span>
          {frames.map((f, i) => {
            const open = i >= page && i < page + perPage;
            const count = notes[f.title]?.length ?? 0;
            return (
              <button
                key={f.id}
                type="button"
                onClick={() => jump(i)}
                aria-current={open ? "page" : undefined}
                className={cn(
                  "flex items-center gap-1.5 rounded-md border-2 px-3 py-1.5 font-display text-sm transition-all",
                  open
                    ? "-translate-y-0.5 border-line bg-primary text-primary-foreground shadow-pop-sm"
                    : "border-line/30 bg-card text-foreground hover:-translate-y-0.5 hover:border-line",
                )}
              >
                <span className={cn("text-xs", open ? "text-primary-foreground/80" : "text-primary")}>제{i + 1}장</span>
                {f.title}
                {count > 0 ? (
                  <span className={cn("rounded-full px-1.5 text-[10px]", open ? "bg-card/25" : "bg-primary/10 text-primary")}>{count}</span>
                ) : null}
              </button>
            );
          })}
        </nav>

        {/* 책: 나무색 표지 위에 펼친 한지 쪽 */}
        <div className="relative rounded-xl border-[2.5px] border-line bg-wood p-2 shadow-pop sm:p-3">
          {/* 책갈피 끈 */}
          <span aria-hidden className="absolute -top-3 left-1/2 z-20 h-24 w-2 -translate-x-1/2 rounded-b-full bg-primary shadow-sm" />
          {/* 쌓인 종이 두께 */}
          <span aria-hidden className="absolute inset-x-4 -bottom-1.5 h-3 rounded-b-md border-x-[2.5px] border-b-[2.5px] border-line bg-card" />

          <div className="relative grid min-h-[22rem] sm:min-h-[26rem] md:grid-cols-2" style={{ perspective: "2200px" }}>
            {two ? pageOf(leftIndex, "left") : null}
            {pageOf(two ? rightIndex : turn?.dir === "prev" ? page : rightIndex, "right")}

            {/* 가운데 접힌 곳 그림자 */}
            {two ? (
              <span aria-hidden className="pointer-events-none absolute inset-y-0 left-1/2 w-10 -translate-x-1/2 bg-linear-to-r from-transparent via-line/25 to-transparent" />
            ) : null}

            {/* 넘어가는 종이 한 장 */}
            {turn ? (
              <div
                key={`${turn.dir}-${turn.to}`}
                onAnimationEnd={finishTurn}
                className={cn(
                  "absolute inset-y-0 z-10 [transform-style:preserve-3d]",
                  two ? "w-1/2" : "w-full",
                  turn.dir === "next"
                    ? cn(two ? "left-1/2" : "left-0", "origin-left animate-turn-next")
                    : two
                      ? "left-0 origin-right animate-turn-prev"
                      : "left-0 origin-left animate-turn-back",
                )}
              >
                {/* 앞면 */}
                <div className="absolute inset-0 [backface-visibility:hidden]">
                  {turn.dir === "next"
                    ? pageOf(two ? page + 1 : page, "right", false)
                    : two
                      ? pageOf(page, "left", false)
                      : pageOf(turn.to, "right", false)}
                  <span aria-hidden className="absolute inset-0 bg-linear-to-l from-line/0 to-line/15" />
                </div>
                {/* 뒷면 */}
                <div className="absolute inset-0 [backface-visibility:hidden] [transform:rotateY(180deg)]">
                  {two
                    ? turn.dir === "next"
                      ? pageOf(turn.to, "left", false)
                      : pageOf(turn.to + 1, "right", false)
                    : <div className="h-full rounded-md bg-card" />}
                </div>
              </div>
            ) : null}
          </div>
        </div>

        {/* 넘기기 단추 */}
        <div className="mt-6 flex items-center justify-center gap-4">
          <Button type="button" variant="outline" size="icon" onClick={() => flip("prev")} disabled={!canPrev} aria-label="앞 쪽으로 넘기기">
            <ChevronLeft />
          </Button>
          <span className="min-w-20 text-center font-display text-sm text-muted-foreground">
            {Math.min(page + 1, total)}
            {two ? `–${Math.min(page + 2, total)}` : ""} / {total} 쪽
          </span>
          <Button type="button" variant="outline" size="icon" onClick={() => flip("next")} disabled={!canNext} aria-label="다음 쪽으로 넘기기">
            <ChevronRight />
          </Button>
        </div>
      </div>

      {/* 기록 칸 (쪽을 누르면 열림) */}
      {frame && kind ? (
        <div
          key={frame.id}
          className="mx-auto mb-4 mt-6 max-w-4xl rounded-2xl border-[2.5px] border-line bg-card p-4 shadow-pop-sm animate-in fade-in slide-in-from-top-3 duration-300 sm:p-6"
        >
          <div className="flex items-center gap-3">
            <span className="h-12 w-20 shrink-0 rounded-lg bg-muted/60 p-1">
              <Doodle kind={kind} />
            </span>
            <p className="flex-1 font-display text-xl text-foreground">
              {frame.title} {thoughts.notesTitle}
            </p>
            {frame.link_url ? (
              <a href={frame.link_url} target="_blank" rel="noreferrer" className="flex items-center gap-1 font-display text-sm text-primary">
                원문 <ArrowUpRight className="size-4" />
              </a>
            ) : null}
            <button
              type="button"
              onClick={() => setSelected(null)}
              aria-label="기록 칸 닫기"
              className="flex size-9 items-center justify-center rounded-full text-muted-foreground hover:bg-muted"
            >
              <X className="size-5" />
            </button>
          </div>

          {/* 새 기록 적기 */}
          <form onSubmit={add} className="mt-4 space-y-3">
            <div className="flex flex-wrap gap-2" role="group" aria-label="꼬리표 고르기">
              {tags.map((t, k) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTag(t)}
                  aria-pressed={tag === t}
                  className={cn(
                    "rounded-full border-2 px-3 py-1 font-display text-sm transition-colors",
                    tag === t ? "border-primary bg-primary text-primary-foreground" : cn("border-transparent text-foreground", tagColors[k % tagColors.length]),
                  )}
                >
                  #{t}
                </button>
              ))}
            </div>
            <div className="flex flex-col gap-2 sm:flex-row">
              <input
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder={thoughts.notePlaceholders[kind]}
                aria-label={`${frame.title} 기록 내용`}
                className="h-11 flex-1 rounded-xl border-2 bg-background px-3 text-base outline-none focus:border-primary"
              />
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                aria-label="날짜"
                className="h-11 rounded-xl border-2 bg-background px-3 text-sm outline-none focus:border-primary"
              />
              <Button type="submit" disabled={!text.trim()}>
                <Plus />
                {thoughts.addLabel}
              </Button>
            </div>
          </form>

          {/* 쌓인 기록 */}
          {list.length === 0 ? (
            <p className="mt-5 rounded-xl bg-muted/50 px-4 py-3 text-sm text-muted-foreground">{thoughts.notesEmpty}</p>
          ) : (
            <ul className="mt-5 space-y-2">
              {list.map((n) => (
                <li
                  key={n.id}
                  className="flex items-center gap-3 rounded-xl border-2 bg-background px-3 py-2.5 animate-in fade-in slide-in-from-left-2 duration-300"
                >
                  <span
                    className={cn(
                      "shrink-0 rounded-full px-2.5 py-0.5 font-display text-xs text-foreground",
                      tagColors[Math.max(0, tags.indexOf(n.tag)) % tagColors.length],
                    )}
                  >
                    #{n.tag}
                  </span>
                  <span className="min-w-0 flex-1 text-sm text-foreground sm:text-base">{n.text}</span>
                  <span className="shrink-0 text-xs text-muted-foreground">{n.date.replaceAll("-", ".")}</span>
                  <button
                    type="button"
                    onClick={() => remove(n.id)}
                    aria-label={`"${n.text}" 지우기`}
                    className="flex size-8 shrink-0 items-center justify-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      ) : (
        <p className="mb-2 mt-4 text-center text-sm text-muted-foreground">{thoughts.pickHint}</p>
      )}
    </>
  );
}
