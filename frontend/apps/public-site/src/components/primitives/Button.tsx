import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import styles from "./Button.module.css";

type Variant =
  "primary" | "secondary" | "onInk" | "ghost" | "invert" | "ghostInvert";

interface ButtonProps {
  children: ReactNode;
  to?: string;
  href?: string;
  variant?: Variant;
  onClick?: () => void;
  type?: "button" | "submit";
  className?: string;
  disabled?: boolean;
}

export function Button({
  children,
  to,
  href,
  variant = "primary",
  onClick,
  type = "button",
  disabled = false,
  className: extraClassName,
}: ButtonProps) {
  const className = `${styles.btn} ${styles[variant]} ${extraClassName ?? ""}`;
  const content =
    variant === "ghost" || variant === "ghostInvert" ? (
      <>
        {children}
        <span className={styles.arrow} aria-hidden="true">
          →
        </span>
      </>
    ) : (
      children
    );

  if (to) {
    return (
      <Link to={to} className={className} onClick={onClick}>
        {content}
      </Link>
    );
  }

  if (href) {
    return (
      <a
        href={href}
        className={className}
        target={href.startsWith("http") ? "_blank" : undefined}
        rel="noreferrer"
      >
        {content}
      </a>
    );
  }

  return (
    <button disabled={disabled} type={type} className={className} onClick={onClick}>
      {content}
    </button>
  );
}
