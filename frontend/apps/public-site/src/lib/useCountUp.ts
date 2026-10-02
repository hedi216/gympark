import { useEffect, useState } from "react";
import { useInView } from "./useInView";

const EASE = (t: number) => 1 - Math.pow(1 - t, 3);

export function useCountUp<T extends HTMLElement>(
  target: number,
  duration = 1400,
) {
  const { ref, inView } = useInView<T>(0.4);
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!inView) return;

    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (reduceMotion) {
      setValue(target);
      return;
    }

    let frame: number;
    const start = performance.now();

    const tick = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      setValue(Math.round(target * EASE(progress)));
      if (progress < 1) frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [inView, target, duration]);

  return { ref, value };
}
