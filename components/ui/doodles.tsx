import { cn } from "@/lib/utils";

/* 손으로 쓱쓱 그린 듯한 작은 그림 4가지 (생각 필름 칸 안에 들어감).
   - study(공부): 펼친 책 + 연필
   - work(일): 노트북 + 커피
   - habit(습관): 체크한 달력 + 새싹 화분
   - future(미래): 산꼭대기 깃발로 가는 길 + 해
   - 선은 진한 글자색, 안은 사이트의 파스텔 색을 옅게 채움 */

export type DoodleKind = "study" | "work" | "habit" | "future";

/** 칸 제목에 맞는 그림 고르기 (모르는 제목이면 순서대로 돌아가며) */
export function doodleFor(title: string, index: number): DoodleKind {
  if (title.includes("공부")) return "study";
  if (title.includes("일")) return "work";
  if (title.includes("습관")) return "habit";
  if (title.includes("미래")) return "future";
  return (["study", "work", "habit", "future"] as const)[index % 4];
}

const line = "fill-none stroke-foreground/75";

export function Doodle({ kind, className }: { kind: DoodleKind; className?: string }) {
  return (
    <svg
      viewBox="0 0 160 90"
      aria-hidden
      className={cn("h-full w-full", className)}
      strokeWidth="2.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {kind === "study" ? (
        <>
          {/* 펼친 책 */}
          <path d="M22 64 Q48 54 79 61 L78 25 Q49 17 21 28 Z" className="fill-sky/35 stroke-foreground/75" />
          <path d="M79 61 Q109 53 137 63 L136 27 Q108 18 78 25 Z" className="fill-sky/20 stroke-foreground/75" />
          <path d="M31 36 Q46 32 66 35 M31 44 Q48 40 68 43 M33 52 Q46 49 60 51" className={line} strokeWidth="2" />
          <path d="M91 34 Q108 30 125 35 M90 42 Q106 39 126 43" className={line} strokeWidth="2" />
          {/* 연필 */}
          <path d="M108 76 L141 43 L148 50 L115 83 Z" className="fill-orange/55 stroke-foreground/75" />
          <path d="M108 76 L104 87 L115 83" className="fill-card stroke-foreground/75" />
          <path d="M141 43 L145 39 Q148 37 151 40 Q154 43 152 46 L148 50" className="fill-pink/50 stroke-foreground/75" />
          {/* 반짝 */}
          <path d="M14 14 l2 6 6 2 -6 2 -2 6 -2 -6 -6 -2 6 -2 Z" className="fill-orange/60 stroke-foreground/60" strokeWidth="1.6" />
        </>
      ) : null}

      {kind === "work" ? (
        <>
          {/* 노트북 */}
          <path d="M38 20 Q38 15 43 15 L105 15 Q110 15 110 20 L110 57 L38 57 Z" className="fill-primary/20 stroke-foreground/75" />
          <path d="M27 59 L121 59 Q119 68 112 68 L36 68 Q29 68 27 59 Z" className="fill-primary/35 stroke-foreground/75" />
          <polyline points="48,47 60,39 72,43 86,28 98,33" className="fill-none stroke-teal" strokeWidth="3" />
          <circle cx="98" cy="33" r="3.2" className="fill-teal stroke-none" />
          {/* 커피 + 김 */}
          <path d="M126 42 L148 42 L146 66 Q146 71 141 71 L132 71 Q127 71 127 66 Z" className="fill-pink/40 stroke-foreground/75" />
          <path d="M147 48 Q156 48 155 56 Q154 62 146 61" className={line} />
          <path d="M132 34 Q129 29 133 25 Q137 21 134 16 M141 34 Q138 29 142 25" className={line} strokeWidth="2" />
        </>
      ) : null}

      {kind === "habit" ? (
        <>
          {/* 달력 */}
          <path d="M22 22 Q22 18 26 18 L90 18 Q94 18 94 22 L94 72 Q94 76 90 76 L26 76 Q22 76 22 72 Z" className="fill-card stroke-foreground/75" />
          <path d="M22 22 Q22 18 26 18 L90 18 Q94 18 94 22 L94 31 L22 31 Z" className="fill-teal/45 stroke-foreground/75" />
          <path d="M38 13 L38 23 M78 13 L78 23" className={line} />
          <path d="M31 44 l4 4 7 -8 M53 44 l4 4 7 -8 M75 44 l4 4 7 -8 M31 61 l4 4 7 -8 M53 61 l4 4 7 -8" className="fill-none stroke-teal" strokeWidth="2.6" />
          <circle cx="80" cy="62" r="7" className="fill-none stroke-pink" strokeWidth="2.4" strokeDasharray="3 3" />
          {/* 새싹 화분 */}
          <path d="M109 56 L147 56 L142 79 Q141 82 138 82 L118 82 Q115 82 114 79 Z" className="fill-orange/45 stroke-foreground/75" />
          <path d="M128 56 Q127 44 129 34" className={line} />
          <path d="M129 42 Q115 40 113 28 Q126 27 129 42 Z" className="fill-teal/50 stroke-foreground/75" />
          <path d="M129 36 Q140 31 146 20 Q133 19 129 36 Z" className="fill-teal/40 stroke-foreground/75" />
          <path d="M151 34 q-3 5 0 6 q3 -1 0 -6 Z M146 42 q-2 4 0 5 q2 -1 0 -5 Z" className="fill-sky/60 stroke-foreground/60" strokeWidth="1.4" />
        </>
      ) : null}

      {kind === "future" ? (
        <>
          {/* 해 */}
          <circle cx="132" cy="20" r="9" className="fill-orange/45 stroke-foreground/70" />
          <path d="M132 4 L132 7 M148 20 L145 20 M143 9 L141 11 M121 9 L123 11" className={line} strokeWidth="2" />
          {/* 산 */}
          <path d="M34 76 L78 26 L100 50 L114 38 L150 76 Z" className="fill-primary/20 stroke-foreground/75" />
          <path d="M70 35 L78 26 L86 35 L80 33 L76 37 Z" className="fill-card stroke-foreground/60" strokeWidth="1.8" />
          {/* 깃발 */}
          <path d="M78 26 L78 8" className={line} />
          <path d="M78 9 L94 13 L78 18 Z" className="fill-pink/60 stroke-foreground/75" />
          {/* 산으로 가는 길 */}
          <path d="M6 86 Q24 80 30 72 Q38 62 52 64 Q62 66 66 56" className="fill-none stroke-foreground/50" strokeWidth="2.2" strokeDasharray="1 7" />
          {/* 발자국 */}
          <ellipse cx="14" cy="80" rx="2.4" ry="3.4" className="fill-foreground/40 stroke-none" transform="rotate(-30 14 80)" />
          <ellipse cx="22" cy="75" rx="2.4" ry="3.4" className="fill-foreground/40 stroke-none" transform="rotate(-40 22 75)" />
        </>
      ) : null}
    </svg>
  );
}
