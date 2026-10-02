import type { ReactNode } from "react";
import styles from "./Eyebrow.module.css";

export function Eyebrow({
  children,
  onInk = false,
}: {
  children: ReactNode;
  onInk?: boolean;
}) {
  return (
    <div className={`${styles.eyebrow} ${onInk ? styles.onInk : ""}`}>
      <span className={styles.tick} aria-hidden="true" />
      {children}
    </div>
  );
}
