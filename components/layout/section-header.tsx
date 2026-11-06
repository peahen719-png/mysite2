import { cn } from "@/lib/utils";

/** 섹션 위쪽의 작은 영문 라벨 + 제목 + 설명. 모든 섹션이 같은 모양을 쓰도록 한 곳에 모아 둠.
    - 라벨: 점이 깜빡이는 작은 알약 모양
    - 제목: 형광펜으로 칠한 듯한 노란 밑줄 */
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
        <p className="inline-flex items-center gap-2 rounded-full border-2 border-card bg-card/80 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground shadow-pop-sm backdrop-blur">
          <span className="relative flex size-2">
            <span className="absolute inset-0 animate-ping rounded-full bg-primary/60 motion-reduce:hidden" />
            <span className="relative size-2 rounded-full bg-primary" />
          </span>
          {eyebrow}
        </p>
      ) : null}
      <h2 className="mt-4 text-4xl leading-tight tracking-tight text-foreground sm:text-5xl">
        <span
          className="box-decoration-clone px-1"
          style={{
            backgroundImage:
              "linear-gradient(transparent 62%, color-mix(in oklab, var(--yellow) 75%, transparent) 62%, color-mix(in oklab, var(--yellow) 75%, transparent) 92%, transparent 92%)",
          }}
        >
          {title}
        </span>
      </h2>
      {description ? (
        <p className="mt-4 text-base leading-relaxed text-muted-foreground sm:text-lg">{description}</p>
      ) : null}
    </div>
  );
}
