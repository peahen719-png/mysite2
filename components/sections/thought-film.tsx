import { siteConfig } from "@/site.config";
import { getItems } from "@/lib/data";
import { ThoughtFilm, type Frame } from "@/components/sections/thought-film-client";

/* 생각 필름 — 01 생각 섹션 안(설명 아래)에 들어가는 필름 보드.
   - 필름 칸: 관리자 페이지 「생각 필름」 탭(think)에서 추가한 카드 (없으면 site.config.ts 의 thoughts.samples)
   - 칸을 누르면 아래에 그 주제의 기록 칸이 열림 (thought-film-client.tsx)
   - 글자: site.config.ts 의 thoughts
   - 모양: 필름 통에서 풀려 나온 필름이 물결치듯 이어지고, 오른쪽 끝은 흐려지며 사라짐 */

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

        <ThoughtFilm frames={frames} />
      </div>
    </div>
  );
}
