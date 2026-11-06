/* 실천 레이스 퍼즐 그림 — 보물섬 지도.
   - 처음엔 모든 조각에 지도가 옅게 깔려 있고, '성공'한 조각만 진하게 살아남 (action-game.tsx)
   - 출발(왼쪽 위)부터 도착(왼쪽 아래)까지 칸 순서를 따라가는 점선 길(route)이 그려짐
   - 출발에는 깃발, 도착에는 X 표시와 보물 상자
   - 그림 좌표 500 × 400 = 놀이판(5칸 × 4줄)과 같은 비율, 색은 사이트 토큰 */

/** 야자수 한 그루 */
function Palm({ x, y, s = 1 }: { x: number; y: number; s?: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <path d="M0 0 Q3 -14 -2 -28" className="fill-none stroke-orange" strokeWidth="5" strokeLinecap="round" />
      <path d="M-2 -28 Q-16 -36 -24 -24 Q-14 -30 -2 -28 Z" className="fill-green-deep" />
      <path d="M-2 -28 Q12 -38 22 -26 Q10 -31 -2 -28 Z" className="fill-green-deep" />
      <path d="M-2 -28 Q-8 -44 2 -48 Q-2 -38 -2 -28 Z" className="fill-green-deep" />
      <circle cx="-2" cy="-27" r="3" className="fill-orange" />
    </g>
  );
}

/** 꽃 무리 */
function Flowers({ x, y }: { x: number; y: number }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      {[[0, 0], [10, 4], [-9, 5], [4, -7]].map(([dx, dy]) => (
        <g key={`${dx}-${dy}`}>
          <circle cx={dx} cy={dy} r="4.5" className="fill-pink" />
          <circle cx={dx} cy={dy} r="1.6" className="fill-yellow" />
        </g>
      ))}
    </g>
  );
}

export function PuzzleArt({ route }: { route?: string }) {
  const points = route ? route.split(" ").map((p) => p.split(",").map(Number)) : [];
  const start = points[0];
  const goal = points[points.length - 1];

  return (
    <svg viewBox="0 0 500 400" preserveAspectRatio="none" className="size-full" aria-hidden>
      {/* 바다 */}
      <rect width="500" height="400" className="fill-sky" />
      {[[30, 22], [440, 30], [470, 210], [20, 250], [250, 392], [440, 388]].map(([x, y]) => (
        <path key={`${x}-${y}`} d={`M${x - 12} ${y} q6 -6 12 0 t12 0`} className="fill-none stroke-card/70" strokeWidth="2.5" strokeLinecap="round" />
      ))}

      {/* 섬: 모래 테두리 + 풀밭 */}
      <path
        d="M40 46 C110 6 250 30 340 18 C440 6 492 60 484 150 C478 220 496 300 452 352 C404 398 290 378 190 386 C96 394 14 372 12 300 C10 230 34 170 20 110 C12 76 18 58 40 46 Z"
        className="fill-yellow"
      />
      <path
        d="M56 60 C120 26 250 46 338 34 C428 24 470 70 464 150 C460 220 478 296 438 338 C396 378 290 362 192 370 C104 376 34 360 30 296 C28 232 50 172 38 114 C32 86 38 70 56 60 Z"
        className="fill-green"
      />
      {/* 언덕 무늬 */}
      <ellipse cx="160" cy="205" rx="70" ry="22" className="fill-green-deep/25" />
      <ellipse cx="350" cy="110" rx="60" ry="16" className="fill-green-deep/25" />
      <ellipse cx="280" cy="300" rx="80" ry="20" className="fill-green-deep/20" />

      {/* 산 */}
      <path d="M220 222 L258 168 L296 222 Z" className="fill-teal" />
      <path d="M246 185 L258 168 L270 185 L262 181 L258 188 L253 181 Z" className="fill-card" />
      <path d="M268 222 L294 186 L320 222 Z" className="fill-teal/80" />

      {/* 호수 */}
      <ellipse cx="400" cy="205" rx="42" ry="22" className="fill-sky stroke-card" strokeWidth="4" />
      <path d="M386 204 q5 -4 10 0 t10 0" className="fill-none stroke-card" strokeWidth="2" strokeLinecap="round" />

      {/* 작은 집 */}
      <rect x="330" y="290" width="26" height="20" rx="2" className="fill-card" />
      <path d="M325 292 L343 274 L361 292 Z" className="fill-red" />
      <rect x="340" y="299" width="7" height="11" className="fill-orange" />

      {/* 야자수 · 꽃 */}
      <Palm x={140} y={118} />
      <Palm x={420} y={120} s={0.9} />
      <Palm x={40} y={215} s={0.85} />
      <Palm x={200} y={318} />
      <Palm x={460} y={318} s={0.85} />
      <Flowers x={300} y={110} />
      <Flowers x={110} y={300} />
      <Flowers x={420} y={260} />

      {/* 칸 순서를 따라가는 길 */}
      {route ? (
        <>
          <polyline points={route} className="fill-none stroke-card/80" strokeWidth="14" strokeLinecap="round" strokeLinejoin="round" />
          <polyline
            points={route}
            className="fill-none stroke-red-deep"
            strokeWidth="4"
            strokeDasharray="1 10"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </>
      ) : null}

      {/* 출발 깃발 */}
      {start ? (
        <g transform={`translate(${start[0] + 26} ${start[1] - 6})`}>
          <path d="M0 18 L0 -18" className="stroke-foreground/60" strokeWidth="3" strokeLinecap="round" />
          <path d="M0 -18 L18 -11 L0 -4 Z" className="fill-red" />
        </g>
      ) : null}

      {/* 도착: X 표시 + 보물 상자 */}
      {goal ? (
        <g transform={`translate(${goal[0]} ${goal[1]})`}>
          <path d="M-12 -12 L12 12 M12 -12 L-12 12" className="stroke-red" strokeWidth="6" strokeLinecap="round" />
          <g transform="translate(22 6)">
            <rect x="0" y="0" width="28" height="18" rx="3" className="fill-orange" />
            <path d="M0 6 Q14 -10 28 6 Z" className="fill-yellow" />
            <circle cx="14" cy="9" r="2.5" className="fill-yellow" />
          </g>
        </g>
      ) : null}

      {/* 나침반 */}
      <g transform="translate(470 368)">
        <circle r="18" className="fill-card stroke-foreground/30" strokeWidth="2" />
        <path d="M0 -14 L5 0 L0 14 L-5 0 Z" className="fill-red" />
        <path d="M0 0 L5 0 L0 14 L-5 0 Z" className="fill-foreground/40" />
      </g>
    </svg>
  );
}
