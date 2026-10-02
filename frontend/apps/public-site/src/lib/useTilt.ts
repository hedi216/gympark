import { useRef, useCallback } from "react";
import type { MouseEvent } from "react";

/**
 * Mouse-tracked 3D tilt, applied via direct style writes (not React state)
 * so it stays smooth at 60fps instead of re-rendering on every pointer move.
 * The global prefers-reduced-motion rule (`transition-duration: .001ms !important`
 * on `*`) already neutralizes the CSS transition this relies on for reset.
 */
export function useTilt<T extends HTMLElement>(maxTilt = 10) {
  const ref = useRef<T>(null);

  const onMouseMove = useCallback(
    (e: MouseEvent) => {
      const el = ref.current;
      if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches)
        return;
      const rect = el.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      el.style.transform = `perspective(1400px) rotateY(${x * maxTilt}deg) rotateX(${-y * maxTilt}deg) scale3d(1.015, 1.015, 1.015)`;
    },
    [maxTilt],
  );

  const onMouseLeave = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    el.style.transform =
      "perspective(1400px) rotateY(0deg) rotateX(0deg) scale3d(1, 1, 1)";
  }, []);

  return { ref, onMouseMove, onMouseLeave };
}
