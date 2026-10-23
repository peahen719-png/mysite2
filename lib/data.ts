import { sampleItems, siteConfig } from "@/site.config";
import { getPublicClient } from "@/lib/supabase";
import { heroTextKeys, type HeroTexts, type Item } from "@/lib/types";

/** site.config.ts 에 적힌 히어로 기본 글자 */
export function defaultHeroTexts(): HeroTexts {
  const { hero } = siteConfig;
  return {
    eyebrow: hero.eyebrow,
    title: hero.title,
    description: hero.description,
    primaryCtaLabel: hero.primaryCta.label,
    secondaryCtaLabel: hero.secondaryCta.label,
  };
}

/** site_texts 표에서 읽은 줄들을 기본 글자 위에 덮어씌움 (빈 값은 기본 글자 유지) */
export function mergeHeroTexts(rows: { key: string; value: string }[]): HeroTexts {
  const texts = defaultHeroTexts();
  for (const key of heroTextKeys) {
    const value = rows.find((row) => row.key === `hero.${key}`)?.value;
    if (value) texts[key] = value;
  }
  return texts;
}

/**
 * 히어로(첫 화면) 글자를 가져옵니다.
 * - Supabase가 연결 안 됐거나 읽기에 실패하면: site.config.ts 의 글자
 * - 연결됐으면: 관리자 페이지에서 저장한 글자 (저장 안 한 칸은 site.config.ts 글자)
 */
export async function getHeroTexts(): Promise<HeroTexts> {
  const supabase = getPublicClient();
  if (!supabase) return defaultHeroTexts();

  const { data, error } = await supabase
    .from("site_texts")
    .select("key, value")
    .like("key", "hero.%");

  if (error) {
    console.error("[getHeroTexts] Supabase 읽기 실패:", error.message);
    return defaultHeroTexts();
  }
  return mergeHeroTexts(data ?? []);
}

/**
 * 특정 섹션의 카드 목록을 가져옵니다.
 * - Supabase가 연결 안 됐으면: site.config.ts 의 예시 카드를 보여줌
 * - 연결됐으면: 데이터베이스에서 '보이기'로 설정된 카드만 순서대로 가져옴
 */
export async function getItems(section: string): Promise<Item[]> {
  const supabase = getPublicClient();
  const samples = sampleItems.filter((item) => item.section === section);
  if (!supabase) return samples;

  const { data, error } = await supabase
    .from("items")
    .select("*")
    .eq("section", section)
    .eq("is_visible", true)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });

  if (error) {
    console.error("[getItems] Supabase 읽기 실패:", error.message);
    return samples;
  }
  return (data ?? []) as Item[];
}
