import type { Metadata, Viewport } from "next";
import { Gowun_Batang } from "next/font/google";

import { siteConfig } from "@/site.config";
import "./globals.css";

/* 한옥 서재 느낌 제목 폰트 (app/globals.css 의 --font-display 에서 사용)
   - Gowun Batang : 붓으로 쓴 듯 부드러운 한글 명조 (영문도 같은 폰트) */
const gowun = Gowun_Batang({
  weight: ["700"],
  subsets: ["latin"],
  preload: false, // 한글 글자는 필요한 만큼만 나눠 받음
  variable: "--font-gowun",
});

/* 모든 페이지를 감싸는 가장 바깥 틀. 보통은 수정할 일이 거의 없습니다.
   다크 모드로 시작하고 싶으면 <html> 의 className 에 "dark" 를 추가하세요. */
export const metadata: Metadata = {
  title: siteConfig.title,
  description: siteConfig.description,
  // 카카오톡·SNS 에 링크를 붙였을 때 보이는 미리보기 (그림은 app/opengraph-image.jpg)
  openGraph: {
    title: siteConfig.title,
    description: siteConfig.description,
    siteName: siteConfig.name,
    locale: "ko_KR",
    type: "website",
  },
};

/* 휴대폰 주소창 색 = 한지 바탕색 */
export const viewport: Viewport = {
  themeColor: "#f3e2c4",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="ko" className={`h-full ${gowun.variable}`}>
      <body className="flex min-h-full flex-col">{children}</body>
    </html>
  );
}
