/* 실천 레이스 퍼즐 그림 — 한옥 도서관에 걸린 옛 고지도.
   - 누런 한지 위에 먹선으로 그린 산·강·소나무·기와집, 구름 문양, 팔방 나침반
   - 처음엔 모든 조각에 지도가 옅게(흑백) 깔려 있고, '성공'한 조각만 색이 칠해짐 (action-game.tsx)
   - 출발(왼쪽 위)부터 도착(왼쪽 아래)까지 칸 순서를 따라가는 붉은 점선 길(route)
   - 출발에는 깃발, 도착에는 서책이 든 보물 함
   - 그림 좌표 500 × 400 = 놀이판(5칸 × 4줄)과 같은 비율, 색은 사이트 토큰 */

const ink = "stroke-line";

/** 먹선 산 (봉우리 셋) */
function Mountains({ x, y, s = 1 }: { x: number; y: number; s?: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`} strokeLinejoin="round" strokeLinecap="round">
      <path d="M-46 0 L-22 -34 L-6 -14 L10 -44 L30 -18 L46 0 Z" className={`fill-teal/70 ${ink}`} strokeWidth="2.5" />
      <path d="M-22 -34 L-16 -20 M10 -44 L14 -26 L8 -16 M30 -18 L26 -8" className="fill-none stroke-line/60" strokeWidth="2" />
      <path d="M2 -36 L10 -44 L18 -36" className="fill-card stroke-line/70" strokeWidth="1.5" />
    </g>
  );
}

/** 소나무 */
function Pine({ x, y, s = 1 }: { x: number; y: number; s?: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`} strokeLinejoin="round" strokeLinecap="round">
      <path d="M0 0 Q2 -10 -1 -22" className="fill-none stroke-wood" strokeWidth="4" />
      <ellipse cx="-4" cy="-24" rx="13" ry="6" className={`fill-green-deep/75 ${ink}`} strokeWidth="1.8" />
      <ellipse cx="4" cy="-32" rx="10" ry="5" className={`fill-green-deep/75 ${ink}`} strokeWidth="1.8" />
    </g>
  );
}

/** 기와집 */
function Giwa({ x, y, s = 1 }: { x: number; y: number; s?: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`} strokeLinejoin="round" strokeLinecap="round">
      <rect x="-14" y="-12" width="28" height="14" className={`fill-card ${ink}`} strokeWidth="2" />
      <path d="M-4 2 V-6 H4 V2" className="fill-wood stroke-line" strokeWidth="1.5" />
      <path d="M-24 -12 Q-18 -10 -14 -20 L14 -20 Q18 -10 24 -12 Q16 -24 0 -26 Q-16 -24 -24 -12 Z" className={`fill-sky ${ink}`} strokeWidth="2" />
    </g>
  );
}

/** 구름 문양 */
function Cloud({ x, y, s = 1 }: { x: number; y: number; s?: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <path
        d="M-22 4 Q-26 -6 -14 -6 Q-12 -16 0 -12 Q8 -20 16 -10 Q28 -10 24 2 Q30 6 20 8 L-18 8 Q-28 8 -22 4 Z"
        className="fill-card/80 stroke-line/50"
        strokeWidth="1.8"
      />
      <path d="M-8 2 Q-4 -4 2 0 Q6 4 10 0" className="fill-none stroke-line/40" strokeWidth="1.5" strokeLinecap="round" />
    </g>
  );
}

export function PuzzleArt({ route }: { route?: string }) {
  const points = route ? route.split(" ").map((p) => p.split(",").map(Number)) : [];
  const start = points[0];
  const goal = points[points.length - 1];

  return (
    <svg viewBox="0 0 500 400" preserveAspectRatio="none" className="size-full" aria-hidden>
      {/* 누런 한지 */}
      <rect width="500" height="400" className="fill-secondary" />
      <rect width="500" height="400" className="fill-yellow/20" />
      {/* 강 (먹선 물결) */}
      <path
        d="M500 150 C440 170 420 210 380 220 C330 232 300 200 250 210 C200 220 190 260 150 270 C110 280 60 260 0 280 L0 300 C60 282 110 300 150 292 C200 282 210 242 252 232 C300 222 330 254 382 242 C430 230 450 190 500 172 Z"
        className="fill-sky/45 stroke-line/60"
        strokeWidth="2"
      />
      {[[300, 214], [180, 262], [420, 210]].map(([x, y]) => (
        <path key={`${x}-${y}`} d={`M${x - 10} ${y} q5 -4 10 0 t10 0`} className="fill-none stroke-line/40" strokeWidth="1.5" strokeLinecap="round" />
      ))}

      {/* 산 */}
      <Mountains x={260} y={168} s={1.1} />
      <Mountains x={430} y={110} s={0.8} />
      <Mountains x={120} y={360} s={0.9} />

      {/* 소나무 숲 */}
      <Pine x={140} y={118} />
      <Pine x={160} y={124} s={0.8} />
      <Pine x={40} y={210} s={0.9} />
      <Pine x={350} y={330} />
      <Pine x={372} y={336} s={0.8} />
      <Pine x={470} y={258} s={0.85} />

      {/* 기와집 마을 */}
      <Giwa x={320} y={120} />
      <Giwa x={250} y={320} s={1.1} />
      <Giwa x={60} y={130} s={0.8} />

      {/* 구름 문양 */}
      <Cloud x={220} y={40} />
      <Cloud x={400} y={180} s={0.8} />
      <Cloud x={420} y={380} s={0.9} />

      {/* 칸 순서를 따라가는 붉은 길 */}
      {route ? (
        <>
          <polyline points={route} className="fill-none stroke-card/90" strokeWidth="12" strokeLinecap="round" strokeLinejoin="round" />
          <polyline
            points={route}
            className="fill-none stroke-red-deep"
            strokeWidth="4"
            strokeDasharray="1 9"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </>
      ) : null}

      {/* 출발 깃발 */}
      {start ? (
        <g transform={`translate(${start[0] + 28} ${start[1] - 4})`}>
          <path d="M0 18 L0 -18" className="stroke-line" strokeWidth="3" strokeLinecap="round" />
          <path d="M0 -18 L18 -11 L0 -4 Z" className="fill-primary stroke-line" strokeWidth="1.5" />
        </g>
      ) : null}

      {/* 도착: 서책이 든 보물 함 */}
      {goal ? (
        <g transform={`translate(${goal[0] + 22} ${goal[1] + 2})`} strokeLinejoin="round">
          <rect x="0" y="0" width="30" height="20" rx="2" className="fill-wood stroke-line" strokeWidth="2" />
          <path d="M0 7 H30" className="stroke-line" strokeWidth="1.5" />
          <rect x="12" y="4" width="6" height="7" rx="1" className="fill-yellow stroke-line" strokeWidth="1.2" />
          <path d="M4 0 L8 -8 L22 -8 L26 0" className="fill-card stroke-line" strokeWidth="1.5" />
        </g>
      ) : null}

      {/* 팔방 나침반 */}
      <g transform="translate(466 362)" strokeLinejoin="round">
        <circle r="20" className="fill-card stroke-line" strokeWidth="2" />
        <circle r="14" className="fill-none stroke-line/40" strokeWidth="1" />
        <path d="M0 -17 L4 0 L0 17 L-4 0 Z" className="fill-primary stroke-line" strokeWidth="1" />
        <path d="M-17 0 L0 4 L17 0 L0 -4 Z" className="fill-line/60" />
        <text y="-22" textAnchor="middle" className="fill-line font-display text-[9px]">北</text>
      </g>

      {/* 지도 테두리 (이중선) */}
      <rect x="4" y="4" width="492" height="392" className="fill-none stroke-line/50" strokeWidth="3" />
      <rect x="11" y="11" width="478" height="378" className="fill-none stroke-line/30" strokeWidth="1.5" />
    </svg>
  );
}
