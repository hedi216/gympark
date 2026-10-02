import { useId, useState } from "react";
import styles from "./TextField.module.css";

interface TextFieldProps {
  label: string;
  type?: string;
  value: string;
  onChange: (value: string) => void;
  autoComplete?: string;
  required?: boolean;
  error?: string;
  placeholder?: string;
}

export function TextField({
  label,
  type = "text",
  value,
  onChange,
  autoComplete,
  required,
  error,
  placeholder,
}: TextFieldProps) {
  const id = useId();
  const [reveal, setReveal] = useState(false);
  const isPassword = type === "password";
  const resolvedType = isPassword && reveal ? "text" : type;

  return (
    <div className={styles.field}>
      <label className={styles.label} htmlFor={id}>
        {label}
        {required ? " *" : ""}
      </label>
      <div className={styles.inputRow}>
        <input
          id={id}
          type={resolvedType}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          autoComplete={autoComplete}
          required={required}
          placeholder={placeholder}
          className={`${styles.input} ${error ? styles.hasError : ""} ${isPassword ? styles.withToggle : ""}`}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${id}-error` : undefined}
        />
        {isPassword && (
          <button
            type="button"
            className={styles.toggle}
            onClick={() => setReveal((v) => !v)}
            tabIndex={-1}
          >
            {reveal ? "Masquer" : "Afficher"}
          </button>
        )}
      </div>
      {error && (
        <span className={styles.error} id={`${id}-error`}>
          {error}
        </span>
      )}
    </div>
  );
}
