import type { ReactNode } from "react";
import { useInView } from "../../lib/useInView";
import styles from "./Reveal.module.css";

interface RevealProps {
  children: ReactNode;
  delay?: number;
  className?: string;
}

export function Reveal({ children, delay = 0, className }: RevealProps) {
  const { ref, inView } = useInView<HTMLDivElement>();

  return (
    <div
      ref={ref}
      className={`${styles.reveal} ${inView ? styles.in : ""} ${className ?? ""}`}
      style={{ transitionDelay: inView ? `${delay}ms` : "0ms" }}
    >
      {children}
    </div>
  );
}
