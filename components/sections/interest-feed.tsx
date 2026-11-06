import { siteConfig } from "@/site.config";
import { searchNews, shuffle } from "@/lib/news";
import { Container } from "@/components/layout/container";
import { SectionHeader } from "@/components/layout/section-header";
import { Reveal } from "@/components/ui/reveal";
import { SectionOrnament } from "@/components/ui/section-ornament";
import { InterestRotator } from "@/components/sections/interest-rotator";

/* 관심사 소식함 — 맨 아래 섹션 (예전 '연락처' 자리).
   - 관심사 기사: site.config.ts 의 interests.topics 검색어로 인터넷 뉴스를 찾아 무작위로 섞음
   - 알아둘 소식: interests.noticeQueries 검색 결과 (못 가져오면 interests.notices)
   - 오늘의 한마디: interests.quotes
   - 세 칸 모두 일정 시간(intervalSec)마다 다음 글로 넘어감 → interest-rotator.tsx
   - 뉴스는 1시간마다 새로 가져옴 */

export async function InterestFeed() {
  const data = siteConfig.interests;

  const [articleLists, noticeLists] = await Promise.all([
    Promise.all(data.topics.map((t) => searchNews(t.query, t.label, 4))),
    Promise.all(data.noticeQueries.map((q) => searchNews(q.query, q.label, 3))),
  ]);
  const articles = shuffle(articleLists.flat());
  const newsNotices = shuffle(noticeLists.flat());

  const notices =
    newsNotices.length > 0
      ? newsNotices.map((n) => ({ label: n.topic, text: n.title, link: n.link, meta: [n.source, n.date].filter(Boolean).join(" · ") }))
      : data.notices.map((n) => ({ label: n.label, text: n.text, link: "", meta: "" }));

  return (
    <section id="news" className="scroll-mt-24 bg-linear-to-b from-transparent via-muted/60 to-muted/40 py-24 sm:py-28">
      <Container>
        <SectionOrnament className="mb-14" />
        <Reveal>
          <SectionHeader eyebrow={data.eyebrow} title={data.title} description={data.description} />
        </Reveal>
        <Reveal delay={120}>
          <InterestRotator articles={articles} notices={notices} />
        </Reveal>
      </Container>
    </section>
  );
}
