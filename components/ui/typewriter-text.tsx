"use client";

import { useEffect, useState } from "react";

/** 글자를 한 자씩 타이핑하듯 보여주는 글. 끝에 깜빡이는 커서(|)가 붙습니다.
    loop 를 켜면 다 쓴 뒤 잠깐 멈췄다가 지우고, 다시 처음부터 계속 반복합니다.
    움직임 줄이기 설정을 켠 컴퓨터에서는 처음부터 전부 보여줍니다. */
export function TypewriterText({
  text,
  className,
  speed = 90,
  startDelay = 600,
  loop = false,
  holdTime = 2200,
  eraseSpeed = 40,
}: {
  text: string;
  className?: string;
  /** 한 글자 나오는 간격 (밀리초) */
  speed?: number;
  /** 처음 시작하기 전 기다리는 시간 (밀리초) */
  startDelay?: number;
  /** true 면 쓰고 → 멈추고 → 지우고를 계속 반복 */
  loop?: boolean;
  /** 다 쓴 뒤 멈춰 있는 시간 (밀리초, loop 일 때) */
  holdTime?: number;
  /** 한 글자 지우는 간격 (밀리초, loop 일 때) */
  eraseSpeed?: number;
}) {
  const chars = Array.from(text);
  const [count, setCount] = useState(0);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const total = chars.length;
    let timer: ReturnType<typeof setTimeout>;
    let n = 0;
    let typing = true;

    const tick = () => {
      if (reduce) {
        setCount(total);
        return;
      }
      if (typing) {
        n += 1;
        setCount(n);
        if (n < total) timer = setTimeout(tick, speed);
        else if (loop) {
          typing = false;
          timer = setTimeout(tick, holdTime);
        }
      } else {
        n -= 1;
        setCount(n);
        if (n > 0) timer = setTimeout(tick, eraseSpeed);
        else {
          typing = true;
          timer = setTimeout(tick, 500);
        }
      }
    };
    timer = setTimeout(tick, reduce ? 0 : startDelay);
    return () => clearTimeout(timer);
  }, [chars.length, speed, startDelay, loop, holdTime, eraseSpeed]);

  return (
    <p className={className} aria-label={text}>
      <span aria-hidden>{chars.slice(0, count).join("")}</span>
      <span aria-hidden className="ml-0.5 inline-block h-[1.1em] w-[2px] animate-pulse bg-current align-[-0.15em]" />
    </p>
  );
}
