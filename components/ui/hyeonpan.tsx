import { cn } from "@/lib/utils";

/* 현판 — 보드 위에 걸린 나무 이름판 (한옥 대문 위 현판처럼).
   짙은 나무 바탕 + 크림색 글씨 + 안쪽 테두리, 양 끝에 작은 못.
   보드 맨 위 가운데에 걸리도록 바깥 틀(absolute)까지 함께 그림 → 부모에 relative 가 있어야 함 */
export function Hyeonpan({ title, tilt = "rotate-1", className }: { title: string; tilt?: string; className?: string }) {
  return (
    <div className={cn("absolute inset-x-0 -top-8 z-30 flex justify-center px-4", className)}>
      <p
        className={cn(
          "relative rounded-xl border-[2.5px] border-line bg-wood px-8 py-3 text-center font-display text-xl text-card shadow-pop sm:px-12 sm:text-3xl",
          tilt,
        )}
      >
        <span aria-hidden className="absolute inset-1.5 rounded-lg border-2 border-card/35" />
        <span aria-hidden className="absolute left-3 top-1/2 size-2 -translate-y-1/2 rounded-full bg-yellow ring-2 ring-line" />
        <span aria-hidden className="absolute right-3 top-1/2 size-2 -translate-y-1/2 rounded-full bg-yellow ring-2 ring-line" />
        {title}
      </p>
    </div>
  );
}
