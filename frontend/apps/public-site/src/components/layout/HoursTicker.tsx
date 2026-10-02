import { dayLabels, openingHours } from "../../lib/gymInfo";
import { useOpenStatus } from "../../lib/useOpenStatus";
export function HoursTicker() {
  const status = useOpenStatus();
  return (
    <div className="hours-strip">
      <div className="open-status" aria-live="polite">
        <span className={status.isOpen ? "status-dot" : "status-dot closed"} />
        <strong>{status.label}</strong>
        <span>{status.detail}</span>
      </div>
      <div className="hours-week">
        {[1, 6, 0].map((day) => {
          const h = openingHours.find((item) => item.day === day)!;
          return (
            <span key={day}>
              {day === 1
                ? "LUN – VEN"
                : dayLabels[day].slice(0, 3).toUpperCase()}{" "}
              <b>
                {h.open} — {h.close}
              </b>
            </span>
          );
        })}
      </div>
    </div>
  );
}
