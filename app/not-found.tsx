import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { siteConfig } from "@/site.config";
import { Button } from "@/components/ui/button";
import { Buddy } from "@/components/ui/mascot";

/* 없는 주소로 들어왔을 때 보이는 페이지 — 사모예드 사서가 길을 안내해 줌.
   글자는 아래에서 바로 바꾸면 됩니다. */
export default function NotFound() {
  return (
    <main className="flex flex-1 items-center justify-center px-5 py-24">
      <div className="w-full max-w-md rounded-[2rem] border-[3px] border-line bg-card/70 p-8 text-center shadow-pop backdrop-blur">
        <div className="mx-auto w-32">
          <Buddy />
        </div>
        <p className="mt-6 font-display text-sm tracking-[0.3em] text-muted-foreground">404</p>
        <h1 className="mt-2 text-balance font-display text-3xl text-foreground">이 서가에는 찾는 책이 없어요</h1>
        <p className="mt-3 text-pretty text-muted-foreground">
          주소가 바뀌었거나 사라진 페이지예요. 사서 사모예드가 처음 서재로 안내해 드릴게요.
        </p>
        <Button asChild size="lg" className="mt-8">
          <Link href="/">
            <ArrowLeft />
            {siteConfig.name} 처음으로
          </Link>
        </Button>
      </div>
    </main>
  );
}
