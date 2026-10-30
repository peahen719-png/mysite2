import { cn } from "@/lib/utils";

/* 글자마다 색을 바꿔 가며 통통 튀는 글자 (로고용).
   색은 디자인 토큰(primary, pink, sky)을 차례대로 씁니다.
   움직임을 줄이도록 설정한 컴퓨터에서는 멈춰 있습니다. */
const defaultColors = ["text-primary", "text-pink", "text-sky"];

export function BouncyText({
  text,
  className,
  colors = defaultColors,
}: {
  text: string;
  className?: string;
  /** 글자 색 목록 (차례대로 돌아가며 사용). 한 가지 색만 넣으면 모두 같은 색 */
  colors?: string[];
}) {
  return (
    <span aria-label={text} className={cn("inline-flex", className)}>
      {Array.from(text).map((char, i) => (
        <span
          key={i}
          aria-hidden
          className={cn(
            "inline-block animate-hop motion-reduce:animate-none",
            colors[i % colors.length],
            char === " " && "w-[0.3em]",
          )}
          style={{ animationDelay: `${i * 0.15}s` }}
        >
          {char}
        </span>
      ))}
    </span>
  );
}
