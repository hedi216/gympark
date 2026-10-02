import { useId } from "react";
import type { CSSProperties } from "react";
import styles from "./PhotoPlaceholder.module.css";

interface PhotoPlaceholderProps {
  caption: string;
  index?: string;
  className?: string;
  style?: CSSProperties;
}

/**
 * Stands in for the documentary gym photography called for in the brief
 * (equipment detail, early-morning light, hands, chalk) until real shots
 * are shot and dropped in. Duotone + grain reads as an intentional plate
 * rather than a broken image, and the caption stays in the mono "data"
 * register so it doubles as an art-direction note for the shoot list.
 */
export function PhotoPlaceholder({
  caption,
  index,
  className,
  style,
}: PhotoPlaceholderProps) {
  const filterId = useId();

  return (
    <div className={`${styles.frame} ${className ?? ""}`} style={style}>
      <svg className={styles.grain} width="100%" height="100%">
        <filter id={filterId}>
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.85"
            numOctaves="2"
            stitchTiles="stitch"
          />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect
          width="100%"
          height="100%"
          filter={`url(#${filterId})`}
          opacity="0.35"
        />
      </svg>
      <div className={styles.caption}>
        {index && <span className={styles.index}>{index}</span>}
        <span>{caption}</span>
      </div>
    </div>
  );
}
