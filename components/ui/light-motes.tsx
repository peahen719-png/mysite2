import { cn } from "@/lib/utils";

/* 도서관 햇살 속에 떠다니는 반짝이는 빛 먼지 (첫 화면 배경).
   - 늘 같은 자리·같은 박자 (새로고침해도 그대로)
   - 마우스 클릭을 방해하지 않음, 움직임 줄이기 설정이면 숨김
   - 움직임은 app/globals.css 의 animate-mote */

function seeded(seed: number) {
  let s = seed;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

const rand = seeded(1106);
const motes = Array.from({ length: 22 }, () => ({
  left: rand() * 100,
  top: 30 + rand() * 70,
  size: 3 + rand() * 5,
  delay: -rand() * 12,
  duration: 9 + rand() * 7,
}));

export function LightMotes({ className }: { className?: string }) {
  return (
    <div aria-hidden className={cn("pointer-events-none absolute inset-0 overflow-hidden motion-reduce:hidden", className)}>
      {motes.map((m, i) => (
        <span
          key={i}
          className="absolute animate-mote rounded-full bg-yellow shadow-[0_0_10px_3px_color-mix(in_oklab,var(--yellow)_70%,transparent)]"
          style={{
            left: `${m.left}%`,
            top: `${m.top}%`,
            width: m.size,
            height: m.size,
            animationDelay: `${m.delay}s`,
            animationDuration: `${m.duration}s`,
          }}
        />
      ))}
    </div>
  );
}
