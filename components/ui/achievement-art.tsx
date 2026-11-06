import { cn } from "@/lib/utils";

/* 성과 자판기 상품에 들어가는 손그림 (성과 글자에 맞춰 골라짐).
   운동 → 운동화, 책·독서 → 책 더미, 기상·아침 → 자명종, 포트폴리오 → 서류철,
   저축 → 돼지 저금통, 발표·강의 → 마이크, 자격증·합격 → 상장, 여행 → 여행 가방,
   그 밖에는 트로피·메달·화분이 돌아가며 나옴.
   선은 진한 글자색, 안은 사이트 파스텔 색 */

export type ArtKind =
  | "shoe"
  | "books"
  | "clock"
  | "folder"
  | "piggy"
  | "mic"
  | "certificate"
  | "suitcase"
  | "trophy"
  | "medal"
  | "plant";

const rules: [RegExp, ArtKind][] = [
  [/운동|러닝|달리|걷기|헬스|요가/, "shoe"],
  [/책|독서|완독|읽기/, "books"],
  [/기상|새벽|아침|일찍/, "clock"],
  [/포트폴리오|작품|완성|프로젝트/, "folder"],
  [/저축|저금|돈|적금|절약/, "piggy"],
  [/발표|강의|말하기|수업|강사/, "mic"],
  [/자격증|합격|수료|시험|취득/, "certificate"],
  [/여행|휴가/, "suitcase"],
];
const fallback: ArtKind[] = ["trophy", "medal", "plant"];

export function artFor(label: string, index: number): ArtKind {
  return rules.find(([re]) => re.test(label))?.[1] ?? fallback[index % fallback.length];
}

const ink = "stroke-foreground/75";

export function AchievementArt({ kind, className }: { kind: ArtKind; className?: string }) {
  return (
    <svg
      viewBox="0 0 80 80"
      aria-hidden
      className={cn("h-full w-full", className)}
      strokeWidth="2.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    >
      {kind === "shoe" ? (
        <>
          <path d="M10 52 Q10 40 22 38 L34 36 Q40 26 48 30 L58 40 Q70 42 70 52 Q70 58 64 58 L16 58 Q10 58 10 52 Z" className={cn("fill-pink/55", ink)} />
          <path d="M10 50 L70 50" className={ink} />
          <path d="M36 37 L40 42 M41 34 L45 39 M46 32 L50 37" className={ink} strokeWidth="2" />
          <path d="M14 64 l6 0 M28 64 l10 0 M48 64 l6 0" className="stroke-foreground/40" strokeWidth="2" />
        </>
      ) : null}
      {kind === "books" ? (
        <>
          <rect x="14" y="50" width="52" height="10" rx="2" className={cn("fill-sky/55", ink)} />
          <rect x="18" y="40" width="46" height="10" rx="2" className={cn("fill-orange/55", ink)} />
          <rect x="12" y="30" width="48" height="10" rx="2" className={cn("fill-primary/45", ink)} />
          <path d="M20 35 h20 M24 45 h22 M22 55 h26" className="stroke-card" strokeWidth="2" />
          <path d="M56 14 l2 6 6 2 -6 2 -2 6 -2 -6 -6 -2 6 -2 Z" className={cn("fill-yellow", "stroke-foreground/60")} strokeWidth="1.6" />
        </>
      ) : null}
      {kind === "clock" ? (
        <>
          <circle cx="40" cy="44" r="20" className={cn("fill-card", ink)} />
          <circle cx="40" cy="44" r="14" className="fill-yellow/40 stroke-none" />
          <path d="M40 34 L40 44 L48 48" className={ink} />
          <path d="M22 28 Q24 20 32 22 M58 28 Q56 20 48 22" className={cn("fill-pink/60", ink)} />
          <path d="M28 64 L24 70 M52 64 L56 70" className={ink} />
          <path d="M12 16 l3 3 M68 16 l-3 3 M40 8 l0 4" className="stroke-orange" />
        </>
      ) : null}
      {kind === "folder" ? (
        <>
          <path d="M12 26 Q12 22 16 22 L32 22 L36 28 L64 28 Q68 28 68 32 L68 60 Q68 64 64 64 L16 64 Q12 64 12 60 Z" className={cn("fill-teal/50", ink)} />
          <rect x="22" y="34" width="26" height="20" rx="2" className={cn("fill-card", ink)} />
          <path d="M26 40 h18 M26 46 h12" className="stroke-foreground/50" strokeWidth="2" />
          <path d="M56 38 l2 5 5 1 -4 3 1 5 -4 -3 -4 3 1 -5 -4 -3 5 -1 Z" className={cn("fill-yellow", "stroke-foreground/60")} strokeWidth="1.6" />
        </>
      ) : null}
      {kind === "piggy" ? (
        <>
          <path d="M18 46 Q18 30 38 30 Q56 30 60 42 L66 42 L66 50 L60 52 Q56 62 46 62 L46 68 L40 68 L40 62 L32 62 L32 68 L26 68 L26 60 Q18 56 18 46 Z" className={cn("fill-pink/55", ink)} />
          <circle cx="50" cy="40" r="1.8" className="fill-foreground/70 stroke-none" />
          <path d="M34 30 L40 30" className="stroke-foreground/80" strokeWidth="3.2" />
          <circle cx="37" cy="16" r="7" className={cn("fill-yellow", ink)} />
          <path d="M37 13 L37 19" className="stroke-foreground/60" strokeWidth="2" />
        </>
      ) : null}
      {kind === "mic" ? (
        <>
          <rect x="31" y="12" width="18" height="30" rx="9" className={cn("fill-primary/45", ink)} />
          <path d="M33 22 h14 M33 28 h14" className="stroke-card" strokeWidth="2" />
          <path d="M24 34 Q24 52 40 52 Q56 52 56 34" className={ink} />
          <path d="M40 52 L40 64 M30 66 L50 66" className={ink} />
          <path d="M14 22 Q10 30 14 38 M66 22 Q70 30 66 38" className="stroke-orange" />
        </>
      ) : null}
      {kind === "certificate" ? (
        <>
          <rect x="12" y="16" width="56" height="40" rx="3" className={cn("fill-card", ink)} />
          <rect x="17" y="21" width="46" height="30" rx="2" className="stroke-sky" strokeWidth="2" />
          <path d="M24 30 h32 M28 37 h24" className="stroke-foreground/50" strokeWidth="2" />
          <circle cx="54" cy="56" r="8" className={cn("fill-red/80", ink)} />
          <path d="M50 62 L48 72 L54 68 L60 72 L58 62" className={cn("fill-red/60", ink)} />
        </>
      ) : null}
      {kind === "suitcase" ? (
        <>
          <rect x="14" y="28" width="52" height="36" rx="5" className={cn("fill-orange/55", ink)} />
          <path d="M30 28 L30 20 Q30 16 34 16 L46 16 Q50 16 50 20 L50 28" className={ink} />
          <path d="M14 42 h52" className={ink} />
          <circle cx="26" cy="54" r="4" className="fill-card stroke-foreground/60" strokeWidth="1.6" />
          <rect x="40" y="48" width="16" height="10" rx="2" className="fill-sky/60 stroke-foreground/60" strokeWidth="1.6" />
        </>
      ) : null}
      {kind === "trophy" ? (
        <>
          <path d="M26 14 L54 14 L52 38 Q50 48 40 48 Q30 48 28 38 Z" className={cn("fill-yellow", ink)} />
          <path d="M26 20 Q14 20 16 30 Q18 38 28 38 M54 20 Q66 20 64 30 Q62 38 52 38" className={ink} />
          <path d="M40 48 L40 58 M28 66 L52 66 L50 58 L30 58 Z" className={cn("fill-orange/60", ink)} />
          <path d="M36 24 l3 3 6 -7" className="stroke-foreground/60" strokeWidth="2" />
        </>
      ) : null}
      {kind === "medal" ? (
        <>
          <path d="M28 10 L36 34 M52 10 L44 34" className="stroke-sky" strokeWidth="6" />
          <circle cx="40" cy="48" r="18" className={cn("fill-yellow", ink)} />
          <circle cx="40" cy="48" r="11" className="fill-orange/40 stroke-foreground/50" strokeWidth="2" />
          <path d="M40 42 l2 4 4 1 -3 3 1 4 -4 -2 -4 2 1 -4 -3 -3 4 -1 Z" className="fill-card stroke-foreground/60" strokeWidth="1.4" />
        </>
      ) : null}
      {kind === "plant" ? (
        <>
          <path d="M22 50 L58 50 L54 70 L26 70 Z" className={cn("fill-orange/55", ink)} />
          <path d="M40 50 Q38 36 40 24" className={ink} />
          <path d="M40 36 Q26 34 24 22 Q38 22 40 36 Z" className={cn("fill-green/70", ink)} />
          <path d="M40 30 Q52 24 58 12 Q44 12 40 30 Z" className={cn("fill-green/60", ink)} />
          <path d="M60 30 q-3 5 0 6 q3 -1 0 -6 Z" className="fill-sky/60 stroke-foreground/50" strokeWidth="1.4" />
        </>
      ) : null}
    </svg>
  );
}
