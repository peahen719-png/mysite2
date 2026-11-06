import { cn } from "@/lib/utils";

/* 성과 서가에 놓이는 전통 소품 그림 (성과 글자에 맞춰 골라짐) — 한옥 도서관 컨셉.
   운동 → 짚신, 책·독서 → 실로 꿰맨 고서, 기상·아침 → 산 위 해돋이, 포트폴리오·완성 → 두루마리,
   저축 → 엽전 꾸러미, 발표·강의 → 태극 부채, 자격증·합격 → 붉은 도장 찍힌 교지, 여행 → 보따리,
   그 밖에는 붓과 벼루 · 청사초롱 · 매화 가지가 돌아가며 나옴.
   선은 짙은 먹선(stroke-line), 안은 사이트 토큰 색 */

export type HanokArtKind =
  | "jipsin"
  | "oldbooks"
  | "sunrise"
  | "scroll"
  | "coins"
  | "fan"
  | "gyoji"
  | "bottari"
  | "brush"
  | "lantern"
  | "plum";

const rules: [RegExp, HanokArtKind][] = [
  [/운동|러닝|달리|걷기|헬스|요가/, "jipsin"],
  [/책|독서|완독|읽기/, "oldbooks"],
  [/기상|새벽|아침|일찍/, "sunrise"],
  [/포트폴리오|작품|완성|프로젝트/, "scroll"],
  [/저축|저금|돈|적금|절약/, "coins"],
  [/발표|강의|말하기|수업|강사/, "fan"],
  [/자격증|합격|수료|시험|취득/, "gyoji"],
  [/여행|휴가/, "bottari"],
];
const fallback: HanokArtKind[] = ["brush", "lantern", "plum"];

export function hanokArtFor(label: string, index: number): HanokArtKind {
  return rules.find(([re]) => re.test(label))?.[1] ?? fallback[index % fallback.length];
}

const ink = "stroke-line";

export function HanokArt({ kind, className }: { kind: HanokArtKind; className?: string }) {
  return (
    <svg
      viewBox="0 0 80 80"
      aria-hidden
      className={cn("h-full w-full", className)}
      strokeWidth="2.4"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    >
      {kind === "jipsin" ? (
        <>
          {/* 짚신 한 켤레 */}
          {[0, 1].map((k) => (
            <g key={k} transform={`translate(${k * 22} ${k * 6})`}>
              <path d="M14 30 Q14 18 24 18 Q34 18 34 30 L34 54 Q34 64 24 64 Q14 64 14 54 Z" className={cn("fill-yellow/70", ink)} />
              <path d="M17 26 H31 M16 34 H32 M16 42 H32 M16 50 H32 M17 58 H31" className="stroke-wood/60" strokeWidth="1.6" />
              <path d="M24 18 V8 M18 24 Q24 14 30 24" className={cn("", ink)} strokeWidth="2" />
            </g>
          ))}
        </>
      ) : null}
      {kind === "oldbooks" ? (
        <>
          {/* 실로 꿰맨 고서 세 권 */}
          <rect x="14" y="52" width="52" height="10" rx="1.5" className={cn("fill-sky", ink)} />
          <rect x="18" y="42" width="46" height="10" rx="1.5" className={cn("fill-yellow", ink)} />
          <rect x="12" y="32" width="50" height="10" rx="1.5" className={cn("fill-teal", ink)} />
          <path d="M20 32 V42 M26 32 V42 M24 42 V52 M30 42 V52 M22 52 V62 M28 52 V62" className="stroke-primary" strokeWidth="1.8" />
          <rect x="40" y="34" width="14" height="6" className="fill-card stroke-line/60" strokeWidth="1.2" />
          <path d="M60 14 l2 5 5 2 -5 2 -2 5 -2 -5 -5 -2 5 -2 Z" className={cn("fill-yellow", ink)} strokeWidth="1.4" />
        </>
      ) : null}
      {kind === "sunrise" ? (
        <>
          {/* 산 너머 해돋이 */}
          <circle cx="40" cy="40" r="14" className={cn("fill-primary", ink)} />
          <path d="M40 16 V10 M22 24 L18 20 M58 24 L62 20 M16 40 H10 M64 40 H70" className="stroke-orange" strokeWidth="2.6" />
          <path d="M6 64 L24 40 L34 52 L46 34 L74 64 Z" className={cn("fill-teal", ink)} />
          <path d="M40 40 L46 34 L52 42" className="fill-card stroke-line" strokeWidth="1.6" />
          <path d="M6 64 H74" className={ink} />
        </>
      ) : null}
      {kind === "scroll" ? (
        <>
          {/* 반쯤 펼친 두루마리 */}
          <rect x="16" y="20" width="44" height="40" className={cn("fill-card", ink)} />
          <path d="M24 30 H52 M24 38 H50 M24 46 H46" className="stroke-line/40" strokeWidth="2" />
          <rect x="10" y="14" width="56" height="8" rx="4" className={cn("fill-wood", ink)} />
          <rect x="10" y="58" width="56" height="8" rx="4" className={cn("fill-wood", ink)} />
          <circle cx="8" cy="18" r="3.5" className={cn("fill-primary", ink)} strokeWidth="1.6" />
          <circle cx="68" cy="62" r="3.5" className={cn("fill-primary", ink)} strokeWidth="1.6" />
        </>
      ) : null}
      {kind === "coins" ? (
        <>
          {/* 붉은 끈에 꿴 엽전 */}
          <path d="M40 8 V22" className="stroke-primary" strokeWidth="3" />
          {[24, 36, 48, 60].map((y, k) => (
            <g key={y} transform={`translate(${k % 2 ? 4 : -4} 0)`}>
              <circle cx="40" cy={y} r="10" className={cn("fill-yellow", ink)} />
              <rect x="36" y={y - 4} width="8" height="8" className="fill-secondary stroke-line" strokeWidth="1.6" />
            </g>
          ))}
          <path d="M34 72 L40 66 L46 72" className="stroke-primary" strokeWidth="3" />
        </>
      ) : null}
      {kind === "fan" ? (
        <>
          {/* 태극 부채 */}
          <path d="M40 66 L12 30 Q40 6 68 30 Z" className={cn("fill-card", ink)} />
          <path d="M40 66 L20 24 M40 66 L30 16 M40 66 L40 14 M40 66 L50 16 M40 66 L60 24" className="stroke-line/30" strokeWidth="1.4" />
          <circle cx="40" cy="34" r="9" className={cn("fill-primary", ink)} strokeWidth="1.8" />
          <path d="M31 34 Q35.5 29 40 34 Q44.5 39 49 34 A9 9 0 0 1 31 34 Z" className="fill-sky" />
          <path d="M36 66 H44 V74 H36 Z" className={cn("fill-wood", ink)} strokeWidth="1.8" />
        </>
      ) : null}
      {kind === "gyoji" ? (
        <>
          {/* 붉은 도장 찍힌 교지(합격증) */}
          <rect x="14" y="12" width="52" height="56" className={cn("fill-card", ink)} />
          <rect x="19" y="17" width="42" height="46" className="stroke-primary/50" strokeWidth="1.4" />
          <path d="M52 22 V54 M44 22 V50 M36 22 V46 M28 22 V40" className="stroke-line/50" strokeWidth="2" />
          <rect x="22" y="46" width="12" height="12" rx="1" className="fill-primary stroke-line" strokeWidth="1.4" />
          <path d="M25 49 H31 M25 52 H31 M28 49 V55" className="stroke-card" strokeWidth="1.2" />
        </>
      ) : null}
      {kind === "bottari" ? (
        <>
          {/* 보따리 */}
          <path d="M14 40 Q14 66 40 66 Q66 66 66 40 Q66 28 40 28 Q14 28 14 40 Z" className={cn("fill-pink", ink)} />
          <path d="M24 34 Q40 44 56 34 M30 50 l4 4 M44 46 l4 4 M36 58 l4 4" className="stroke-card/70" strokeWidth="2" />
          <path d="M30 30 Q24 12 38 18 Q40 24 40 28 Q40 24 42 18 Q56 12 50 30" className={cn("fill-pink", ink)} />
        </>
      ) : null}
      {kind === "brush" ? (
        <>
          {/* 붓과 벼루 */}
          <rect x="10" y="48" width="44" height="18" rx="4" className={cn("fill-line/80", ink)} />
          <ellipse cx="32" cy="55" rx="14" ry="4" className="fill-line stroke-card/40" strokeWidth="1.4" />
          <path d="M70 10 L46 52" className={ink} strokeWidth="6" />
          <path d="M70 10 L46 52" className="stroke-wood" strokeWidth="3.6" />
          <path d="M48 48 L42 60 Q40 64 44 62 L50 52 Z" className={cn("fill-line", ink)} strokeWidth="1.6" />
        </>
      ) : null}
      {kind === "lantern" ? (
        <>
          {/* 청사초롱 */}
          <path d="M40 6 V14" className={ink} />
          <rect x="30" y="14" width="20" height="6" rx="1" className={cn("fill-wood", ink)} />
          <path d="M26 20 H54 L56 42 H24 Z" className={cn("fill-primary", ink)} />
          <path d="M24 42 H56 L54 62 H26 Z" className={cn("fill-sky", ink)} />
          <rect x="30" y="62" width="20" height="6" rx="1" className={cn("fill-wood", ink)} />
          <path d="M36 68 V76 M44 68 V76" className="stroke-primary" strokeWidth="2" />
          <ellipse cx="40" cy="42" rx="6" ry="9" className="fill-yellow/70" />
        </>
      ) : null}
      {kind === "plum" ? (
        <>
          {/* 매화 가지 */}
          <path d="M8 68 Q30 52 36 34 Q40 22 60 14 M36 34 Q48 40 66 38" className={ink} strokeWidth="3.4" />
          <path d="M8 68 Q30 52 36 34 Q40 22 60 14 M36 34 Q48 40 66 38" className="stroke-wood" strokeWidth="1.6" />
          {[
            [24, 54],
            [40, 26],
            [58, 16],
            [52, 40],
            [66, 36],
          ].map(([x, y]) => (
            <g key={`${x}-${y}`}>
              {[0, 72, 144, 216, 288].map((a) => (
                <circle
                  key={a}
                  cx={x + 4 * Math.cos((a * Math.PI) / 180)}
                  cy={y + 4 * Math.sin((a * Math.PI) / 180)}
                  r="3.4"
                  className="fill-pink stroke-line"
                  strokeWidth="1"
                />
              ))}
              <circle cx={x} cy={y} r="1.6" className="fill-yellow" />
            </g>
          ))}
        </>
      ) : null}
    </svg>
  );
}
