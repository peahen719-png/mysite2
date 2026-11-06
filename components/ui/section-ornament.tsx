import { cn } from "@/lib/utils";

/** 섹션 사이 구분선: 가는 선 ─ 매듭 문양 ─ 가는 선 (단계 섹션, 서신 섹션 위에 공통으로) */
export function SectionOrnament({ className }: { className?: string }) {
  return (
    <div aria-hidden className={cn("flex items-center justify-center gap-3", className)}>
      <span className="h-px w-16 bg-linear-to-r from-transparent to-line/40 sm:w-40" />
      <svg viewBox="0 0 40 20" className="h-5 w-10" strokeLinejoin="round">
        <path d="M20 2 L28 10 L20 18 L12 10 Z" className="fill-primary/80 stroke-line" strokeWidth="1.5" />
        <path d="M20 6 L24 10 L20 14 L16 10 Z" className="fill-card stroke-line/60" strokeWidth="1" />
        <circle cx="5" cy="10" r="2.5" className="fill-wood" />
        <circle cx="35" cy="10" r="2.5" className="fill-wood" />
      </svg>
      <span className="h-px w-16 bg-linear-to-l from-transparent to-line/40 sm:w-40" />
    </div>
  );
}
