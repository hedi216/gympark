import { gym } from "../../lib/gymInfo";
import type { FormEvent, ReactNode } from "react";
import styles from "./AuthLayout.module.css";

interface AuthLayoutProps {
  title: string;
  subtitle: string;
  onSubmit: (e: FormEvent) => void;
  children: ReactNode;
  footer: ReactNode;
}

export function AuthLayout({
  title,
  subtitle,
  onSubmit,
  children,
  footer,
}: AuthLayoutProps) {
  return (
    <div className={styles.screen}>
      <div className={styles.panel}>
        <form className={styles.form} onSubmit={onSubmit}>
          <img className="auth-logo" src={gym.logo} alt="Gym Park" />
          <div className="demo-banner">
            Parcours de démonstration. Aucun compte réel n’est créé. N’utilisez
            pas votre mot de passe habituel.
          </div>
          <h1 className={styles.title}>{title}</h1>
          <p className={styles.subtitle}>{subtitle}</p>

          <div className={styles.fields}>{children}</div>

          {footer}
        </form>
      </div>
    </div>
  );
}
