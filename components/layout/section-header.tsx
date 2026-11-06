import { cn } from "@/lib/utils";

/** 섹션 위쪽의 작은 영문 라벨 + 제목 + 설명. 모든 섹션이 같은 모양을 쓰도록 한 곳에 모아 둠.
    - 라벨: 점이 깜빡이는 작은 알약 모양
    - 제목: 붓으로 한 번 그은 듯한 붉은 밑줄 */
export function SectionHeader({
  eyebrow,
  title,
  description,
  className,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  className?: string;
}) {
  return (
    <div className={cn("max-w-2xl", className)}>
      {eyebrow ? (
        <p className="inline-flex items-center gap-2 rounded-full border-2 border-line bg-card/80 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground shadow-pop-sm backdrop-blur">
          <span className="relative flex size-2">
            <span className="absolute inset-0 animate-ping rounded-full bg-primary/60 motion-reduce:hidden" />
            <span className="relative size-2 rounded-full bg-primary" />
          </span>
          {eyebrow}
        </p>
      ) : null}
      <h2 className="mt-4 text-balance text-4xl leading-tight tracking-tight text-foreground sm:text-5xl">
        <span className="relative inline-block">
          {title}
          {/* 붓으로 한 번 그은 밑줄 */}
          <svg
            aria-hidden
            viewBox="0 0 200 14"
            preserveAspectRatio="none"
            className="pointer-events-none absolute -bottom-2 left-0 h-3 w-full"
          >
            <path
              d="M2 9 C40 3 80 4 120 6 C150 7 175 5 198 3 C176 10 140 11 110 11 C70 12 30 12 4 12 Z"
              className="fill-primary/60"
            />
          </svg>
        </span>
      </h2>
      {description ? (
        <p className="mt-4 text-pretty text-base leading-relaxed text-muted-foreground sm:text-lg">{description}</p>
      ) : null}
    </div>
  );
}
