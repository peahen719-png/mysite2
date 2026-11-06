"use client";

import { useEffect, useState, type FormEvent } from "react";
import Image from "next/image";
import { ArrowUpRight, NotebookPen, Plus, Trash2, X } from "lucide-react";

import { siteConfig } from "@/site.config";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Doodle, doodleFor, type DoodleKind } from "@/components/ui/doodles";

/* 생각 필름 (움직이는 부분).
   - 필름 칸을 누르면 그 칸이 살짝 떠오르고, 아래에 '기록 칸'이 열림
   - 기록 칸: 꼬리표(자격증·수료 등)를 고르고 한 줄 적어 추가 → 목록에 쌓임, 지우기 가능
   - 기록은 이 브라우저에 저장됨 (다시 와도 그대로)
   - 꼬리표와 예시 글: site.config.ts 의 thoughts.noteTags, thoughts.notePlaceholders */

export type Frame = {
  id: string;
  title: string;
  description: string | null;
  image_url: string | null;
  link_url: string | null;
};

type Note = { id: string; tag: string; text: string; date: string };

const NOTES_KEY = "haeboja-thought-notes";

/* 칸마다 돌아가며 쓰는 옅은 바탕색 */
const frameTints = [
  "from-sky/25 to-primary/15",
  "from-pink/25 to-orange/15",
  "from-teal/25 to-sky/15",
  "from-primary/25 to-pink/15",
];

/* 필름이 물결치도록 칸마다 살짝 다르게 기울이고 높낮이를 줌 */
const waves = [
  "-rotate-2 translate-y-1",
  "rotate-1 -translate-y-2",
  "rotate-2 translate-y-0",
  "-rotate-1 translate-y-3",
];

/* 꼬리표 색 (차례대로) */
const tagColors = ["bg-sky/25", "bg-pink/25", "bg-teal/25", "bg-orange/25"];

/* 필름 위아래의 둥근 구멍 줄 */
function Sprockets() {
  return (
    <div
      aria-hidden
      className="h-2.5 bg-[radial-gradient(closest-side,var(--card)_75%,transparent_100%)] bg-size-[18px_10px] bg-repeat-x opacity-90"
    />
  );
}

const today = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

export function ThoughtFilm({ frames }: { frames: Frame[] }) {
  const { thoughts } = siteConfig;
  const [selected, setSelected] = useState<number | null>(null);
  const [notes, setNotes] = useState<Record<string, Note[]>>({});
  const [tag, setTag] = useState("");
  const [text, setText] = useState("");
  const [date, setDate] = useState("");

  // 저장해 둔 기록 불러오기
  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        const saved = JSON.parse(window.localStorage.getItem(NOTES_KEY) ?? "{}");
        if (saved && typeof saved === "object") setNotes(saved);
      } catch {
        // 저장 공간을 못 쓰면 빈 상태로
      }
    }, 0);
    return () => clearTimeout(timer);
  }, []);

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

  return (
    <>
      <div className="mt-6 flex items-center">
        {/* 필름 통 (데스크톱에서만) */}
        <div
          aria-hidden
          className="relative z-10 hidden h-64 w-24 shrink-0 -rotate-6 items-center justify-center rounded-[1.5rem] border-4 border-card bg-linear-to-r from-teal via-sky to-primary shadow-pop md:flex"
        >
          <div className="absolute inset-x-3 -top-3.5 h-4 rounded-t-lg border-4 border-b-0 border-card bg-primary" />
          <div className="absolute inset-x-3 -bottom-3.5 h-4 rounded-b-lg border-4 border-t-0 border-card bg-primary" />
          {/* 반짝이는 빛 */}
          <div className="absolute inset-y-6 left-3 w-2 rounded-full bg-card/40" />
          <p className="rotate-180 whitespace-pre-line text-center font-display text-xl leading-tight text-card [writing-mode:vertical-rl]">
            {thoughts.filmLabel}
          </p>
        </div>

        {/* 필름 띠 (옆으로 넘기기). 오른쪽 끝은 흐려지게 */}
        <div className="min-w-0 flex-1 snap-x overflow-x-auto py-8 md:-ml-4 md:[mask-image:linear-gradient(to_right,black_82%,transparent)]">
          <ul className="flex w-max items-center pr-24">
            {frames.map((f, i) => {
              const active = selected === i;
              const count = notes[f.title]?.length ?? 0;
              return (
                // 칸 하나 = 필름 한 조각 (구멍 + 사진칸 + 구멍). 조각끼리 살짝 겹쳐 이어짐
                <li
                  key={f.id}
                  className={cn(
                    "-ml-1 snap-start bg-primary/90 px-2.5 py-2 shadow-pop-sm transition-transform first:ml-0 first:rounded-l-lg last:rounded-r-lg hover:z-10 hover:-translate-y-3",
                    waves[i % waves.length],
                    active && "z-10 -translate-y-4",
                  )}
                >
                  <Sprockets />
                  <div className="py-2">
                    <button
                      type="button"
                      onClick={() => choose(i)}
                      aria-pressed={active}
                      aria-label={`${f.title} 기록 칸 ${active ? "닫기" : "열기"}`}
                      className={cn(
                        "group flex aspect-[4/5] w-52 flex-col rounded-md bg-card bg-linear-to-br p-4 text-left outline-none transition-shadow focus-visible:ring-4 focus-visible:ring-ring sm:w-56",
                        frameTints[i % frameTints.length],
                        active && "ring-4 ring-pink",
                      )}
                    >
                      <span className="flex items-center justify-between">
                        <span className="font-display text-sm text-primary">#{String(i + 1).padStart(2, "0")}</span>
                        {count > 0 ? (
                          <span className="flex items-center gap-1 rounded-full bg-card px-2 py-0.5 font-display text-xs text-primary shadow-pop-sm">
                            <NotebookPen className="size-3" />
                            {count}
                          </span>
                        ) : null}
                      </span>
                      {f.image_url ? (
                        <span className="relative mt-3 block aspect-video overflow-hidden rounded">
                          <Image src={f.image_url} alt="" fill sizes="224px" className="object-cover" />
                        </span>
                      ) : (
                        // 사진이 없으면 제목에 맞는 손그림 (components/ui/doodles.tsx)
                        <span className="mt-3 block aspect-video rounded-lg bg-card/70 p-1.5">
                          <Doodle kind={doodleFor(f.title, i)} />
                        </span>
                      )}
                      <span className="mt-auto block pt-3 font-display text-xl text-foreground">{f.title}</span>
                      {f.description ? (
                        <span className="mt-1.5 line-clamp-3 block text-sm leading-relaxed text-muted-foreground">
                          {f.description}
                        </span>
                      ) : null}
                    </button>
                  </div>
                  <Sprockets />
                </li>
              );
            })}
          </ul>
        </div>
      </div>

      {/* 기록 칸 (필름 칸을 누르면 열림) */}
      {frame && kind ? (
        <div
          key={frame.id}
          className="mb-4 rounded-2xl border-4 border-card bg-card p-4 shadow-pop-sm animate-in fade-in slide-in-from-top-3 duration-300 sm:p-6"
        >
          <div className="flex items-center gap-3">
            <span className="h-12 w-20 shrink-0 rounded-lg bg-muted/60 p-1">
              <Doodle kind={kind} />
            </span>
            <p className="flex-1 font-display text-xl text-foreground">
              {frame.title} {thoughts.notesTitle}
            </p>
            {frame.link_url ? (
              <a
                href={frame.link_url}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1 font-display text-sm text-primary"
              >
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
        <p className="mb-4 text-center text-sm text-muted-foreground">{thoughts.pickHint}</p>
      )}
    </>
  );
}
