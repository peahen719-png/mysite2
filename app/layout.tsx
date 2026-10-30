import type { Metadata } from "next";
import { Jua, Nunito } from "next/font/google";

import { siteConfig } from "@/site.config";
import "./globals.css";

/* 말랑말랑한 3D 포스터 느낌 폰트 (app/globals.css 의 --font-display 에서 사용)
   - Nunito : 둥글고 굵은 영문 제목용
   - Jua    : 둥글고 귀여운 한글 제목용 (영문이 없는 글자는 이 폰트로 보임) */
const nunito = Nunito({
  weight: ["800", "900"],
  subsets: ["latin"],
  variable: "--font-nunito",
});
const jua = Jua({
  weight: "400",
  subsets: ["latin"],
  preload: false, // 한글 글자는 필요한 만큼만 나눠 받음
  variable: "--font-jua",
});

/* 모든 페이지를 감싸는 가장 바깥 틀. 보통은 수정할 일이 거의 없습니다.
   다크 모드로 시작하고 싶으면 <html> 의 className 에 "dark" 를 추가하세요. */
export const metadata: Metadata = {
  title: siteConfig.title,
  description: siteConfig.description,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="ko" className={`h-full ${nunito.variable} ${jua.variable}`}>
      <body className="flex min-h-full flex-col">{children}</body>
    </html>
  );
}
