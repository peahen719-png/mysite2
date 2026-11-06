import Link from "next/link";

import { siteConfig } from "@/site.config";
import { Container } from "@/components/layout/container";
import { BackToTop } from "@/components/ui/back-to-top";

/** 맨 아래 영역 — 둥근 흰 판 위에 로고·한마디·메뉴.
    오른쪽 끝의 작은 점(•)이 관리자 페이지로 가는 숨은 버튼입니다.
    글자: site.config.ts 의 footer */
export function Footer() {
  const { footer } = siteConfig;
  return (
    <footer className="px-3 pb-6 pt-10 sm:px-5">
      <div className="mx-auto max-w-6xl rounded-[2rem] border-[2.5px] border-line bg-card/80 shadow-pop-sm backdrop-blur">
        <Container className="flex flex-col gap-6 py-8 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="font-display text-3xl text-primary">{siteConfig.name}</p>
            <p className="mt-1 text-sm text-muted-foreground">{footer.tagline}</p>
          </div>
          <nav aria-label="바로가기" className="flex flex-wrap items-center gap-1">
            {siteConfig.nav.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="rounded-full px-3 py-1.5 font-display text-sm text-muted-foreground transition-colors hover:bg-primary/10 hover:text-primary"
              >
                {item.label}
              </a>
            ))}
          </nav>
        </Container>
        <Container className="flex items-center justify-between border-t-2 border-dashed border-border py-4 text-xs text-muted-foreground sm:px-8">
          <p>{footer.copyright}</p>
          {/* 숨은 관리자 버튼 */}
          <Link href="/admin" aria-label="관리자" className="opacity-30 transition-opacity hover:opacity-100">
            •
          </Link>
        </Container>
      </div>
      <BackToTop label={footer.backToTop} />
    </footer>
  );
}
