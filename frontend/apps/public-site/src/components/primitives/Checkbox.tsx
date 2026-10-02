import type { ReactNode } from "react";
import { useId } from "react";
import styles from "./Checkbox.module.css";

interface CheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  children: ReactNode;
  required?: boolean;
}

export function Checkbox({
  checked,
  onChange,
  children,
  required,
}: CheckboxProps) {
  const id = useId();

  return (
    <label className={styles.row} htmlFor={id}>
      <input
        id={id}
        type="checkbox"
        className={styles.input}
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        required={required}
      />
      <span className={styles.text}>{children}</span>
    </label>
  );
}
