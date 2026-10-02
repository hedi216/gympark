import type { ReactNode } from "react";

export function Container({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={className}
      style={{
        maxWidth: "var(--content-max)",
        margin: "0 auto",
        padding: "0 var(--edge)",
      }}
    >
      {children}
    </div>
  );
}
