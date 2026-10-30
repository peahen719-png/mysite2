import Image from "next/image";
import { ArrowUpRight, Lightbulb } from "lucide-react";

import { siteConfig } from "@/site.config";
import { getItems } from "@/lib/data";
import { cn } from "@/lib/utils";

/* 생각 필름 — 01 생각 섹션 안(설명 아래)에 들어가는 필름 보드.
   - 필름 칸: 관리자 페이지 「생각 필름」 탭(think)에서 추가한 카드 (없으면 site.config.ts 의 thoughts.samples)
   - 글자: site.config.ts 의 thoughts
   - 모양: 필름 통에서 풀려 나온 필름이 물결치듯 이어지고, 오른쪽 끝은 흐려지며 사라짐
   - 색: 보라 필름(primary) + 흰 구멍(card), 칸마다 사이트의 표지판 색을 옅게 섞음 */

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

/* 필름 위아래의 둥근 구멍 줄 */
function Sprockets() {
  return (
    <div
      aria-hidden
      className="h-2.5 bg-[radial-gradient(closest-side,var(--card)_75%,transparent_100%)] bg-size-[18px_10px] bg-repeat-x opacity-90"
    />
  );
}

type Frame = {
  id: string;
  title: string;
  description: string | null;
  image_url: string | null;
  link_url: string | null;
};

export async function ThoughtFilmBoard() {
  const { thoughts } = siteConfig;
  const items = await getItems("think");
  const frames: Frame[] =
    items.length > 0
      ? items
      : thoughts.samples.map((sample, i) => ({
          id: `sample-${i}`,
          title: sample.title,
          description: sample.description,
          image_url: null,
          link_url: null,
        }));

  return (
    <div id="thoughts" className="relative mt-20 scroll-mt-24">
      {/* 하늘색 거리 표지판 제목 */}
      <div className="absolute inset-x-0 -top-8 z-20 flex justify-center px-4">
        <p className="relative rotate-1 rounded-2xl border-4 border-card bg-sky px-6 py-3 text-center font-display text-xl text-card shadow-pop sm:px-10 sm:text-3xl">
          <span aria-hidden className="absolute inset-1.5 rounded-xl border-2 border-card/70" />
          {thoughts.title}
        </p>
      </div>

      {/* 보드 */}
      <div className="overflow-hidden rounded-[2rem] border-[6px] border-card bg-card/50 px-4 pb-2 pt-14 shadow-pop backdrop-blur sm:px-6">
        <p className="text-center text-sm text-muted-foreground sm:text-base">{thoughts.description}</p>

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
              {frames.map((frame, i) => {
                const card = (
                  <article
                    className={cn(
                      "group flex aspect-[4/5] w-52 flex-col rounded-md bg-card bg-linear-to-br p-4 sm:w-56",
                      frameTints[i % frameTints.length],
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-display text-sm text-primary">
                        #{String(i + 1).padStart(2, "0")}
                      </span>
                      {frame.link_url ? <ArrowUpRight className="size-4 text-primary" /> : null}
                    </div>
                    {frame.image_url ? (
                      <div className="relative mt-3 aspect-video overflow-hidden rounded">
                        <Image src={frame.image_url} alt="" fill sizes="224px" className="object-cover" />
                      </div>
                    ) : (
                      <div className="mt-3 flex size-11 items-center justify-center rounded-full bg-card text-primary shadow-pop-sm">
                        <Lightbulb className="size-5" />
                      </div>
                    )}
                    <h3 className="mt-auto pt-4 font-display text-xl text-foreground">{frame.title}</h3>
                    {frame.description ? (
                      <p className="mt-1.5 line-clamp-4 text-sm leading-relaxed text-muted-foreground">
                        {frame.description}
                      </p>
                    ) : null}
                  </article>
                );

                return (
                  // 칸 하나 = 필름 한 조각 (구멍 + 사진칸 + 구멍). 조각끼리 살짝 겹쳐 이어짐
                  <li
                    key={frame.id}
                    className={cn(
                      "-ml-1 snap-start bg-primary/90 px-2.5 py-2 shadow-pop-sm transition-transform first:ml-0 first:rounded-l-lg last:rounded-r-lg hover:z-10 hover:-translate-y-3",
                      waves[i % waves.length],
                    )}
                  >
                    <Sprockets />
                    <div className="py-2">
                      {frame.link_url ? (
                        <a href={frame.link_url} target="_blank" rel="noreferrer">
                          {card}
                        </a>
                      ) : (
                        card
                      )}
                    </div>
                    <Sprockets />
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
