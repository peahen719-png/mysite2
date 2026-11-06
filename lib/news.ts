/* 관심사 뉴스 가져오기 (구글 뉴스 검색 RSS, 열쇠 필요 없음)
   - 서버에서만 실행되고, 1시간마다 새로 가져옵니다.
   - 실패하면 빈 목록을 돌려주고, 화면은 site.config.ts 의 대신 보여줄 글을 씁니다. */

export type NewsItem = {
  title: string;
  source: string;
  link: string;
  date: string; // 예: "11월 6일"
  topic: string; // 어떤 관심사로 찾았는지
};

/** &amp; 같은 글자 표시를 원래 글자로 */
function decode(text: string) {
  return text
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .trim();
}

function pick(block: string, tag: string) {
  const match = block.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`));
  return match ? decode(match[1]) : "";
}

function koreanDate(raw: string) {
  const d = new Date(raw);
  if (Number.isNaN(d.getTime())) return "";
  return `${d.getMonth() + 1}월 ${d.getDate()}일`;
}

/** 검색어 하나로 최신 기사 몇 개 */
export async function searchNews(query: string, topic: string, limit = 4): Promise<NewsItem[]> {
  const url = `https://news.google.com/rss/search?q=${encodeURIComponent(query)}&hl=ko&gl=KR&ceid=KR:ko`;
  try {
    const res = await fetch(url, { next: { revalidate: 3600 } });
    if (!res.ok) return [];
    const xml = await res.text();
    const blocks = [...xml.matchAll(/<item>([\s\S]*?)<\/item>/g)].map((m) => m[1]);
    return blocks.slice(0, limit).map((block) => {
      const fullTitle = pick(block, "title");
      const source = pick(block, "source");
      // 제목 끝의 " - 언론사" 는 따로 떼어 냄
      const title = source && fullTitle.endsWith(` - ${source}`) ? fullTitle.slice(0, -(source.length + 3)) : fullTitle;
      return { title, source, link: pick(block, "link"), date: koreanDate(pick(block, "pubDate")), topic };
    });
  } catch (error) {
    console.error("[searchNews] 뉴스 가져오기 실패:", query, error);
    return [];
  }
}

/** 순서를 무작위로 섞기 */
export function shuffle<T>(list: T[]): T[] {
  const copy = [...list];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}
