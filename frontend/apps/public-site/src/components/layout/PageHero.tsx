import type { ReactNode } from "react";
import styles from "./PageHero.module.css";

interface PageHeroProps {
  title: string;
  subtitle?: string;
  children?: ReactNode;
  video?: string;
  centered?: boolean;
}

export function PageHero({
  title,
  subtitle,
  children,
  video,
  centered,
}: PageHeroProps) {
  return (
    <section className={`${styles.hero} ${video ? styles.hasVideo : ""}`}>
      {video && (
        <video
          className={styles.video}
          src={video}
          autoPlay
          muted
          loop
          playsInline
          aria-hidden="true"
        />
      )}
      <div className={styles.scrim} aria-hidden="true" />
      <div className={styles.glow} aria-hidden="true" />
      <div className={`${styles.inner} ${centered ? styles.centered : ""}`}>
        <h1 className={styles.title}>{title}</h1>
        {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
        {children}
      </div>
    </section>
  );
}
