import { siteConfig } from "@/site.config";
import { getItems } from "@/lib/data";
import type { Frame } from "@/components/sections/thought-film-client";
import { ThoughtBook } from "@/components/sections/thought-book-client";
import { Hyeonpan } from "@/components/ui/hyeonpan";

/* 생각 책 — 01 생각 섹션 안(설명 아래)에 들어가는 펼친 옛 책.
   - 쪽: 관리자 페이지 「생각 필름」 탭(think)에서 추가한 카드 (없으면 site.config.ts 의 thoughts.samples)
   - 책장 넘기기와 기록 칸: thought-book-client.tsx
   - 글자: site.config.ts 의 thoughts
   - 예전 필름 모양으로 되돌리려면 app/page.tsx 에서 <ThoughtBookBoard /> 대신 <ThoughtFilmBoard /> */

export async function ThoughtBookBoard() {
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
      {/* 현판 제목 */}
      <Hyeonpan title={thoughts.title} tilt="rotate-1" />

      {/* 보드 */}
      <div className="rounded-[2rem] border-[3px] border-line bg-card/50 px-4 pb-6 pt-14 shadow-pop backdrop-blur sm:px-8">
        <p className="text-center text-sm text-muted-foreground sm:text-base">{thoughts.description}</p>
        <ThoughtBook frames={frames} />
      </div>
    </div>
  );
}
