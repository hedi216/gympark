import { useEffect, useState } from "react";
import { dayLabels, gym, openingHours } from "./gymInfo";
export function computeStatus(now: Date) {
  const local = new Intl.DateTimeFormat("en-GB", {
    timeZone: gym.timezone,
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(now);
  const get = (type: string) => local.find((p) => p.type === type)!.value;
  const day = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(
    get("weekday"),
  );
  const time = `${get("hour")}:${get("minute")}`;
  const today = openingHours.find((h) => h.day === day)!;
  const isOpen = time >= today.open && time < today.close;
  const next = openingHours.find((h) => h.day === (day + 1) % 7)!;
  return {
    isOpen,
    day,
    label: isOpen ? "OUVERT" : "FERMÉ",
    detail: isOpen
      ? `Ferme à ${today.close}`
      : time < today.open
        ? `Ouvre à ${today.open}`
        : `Réouverture ${dayLabels[next.day].toLowerCase()} à ${next.open}`,
    today,
  };
}
export function useOpenStatus() {
  const [status, setStatus] = useState(() => computeStatus(new Date()));
  useEffect(() => {
    const id = window.setInterval(
      () => setStatus(computeStatus(new Date())),
      30000,
    );
    return () => window.clearInterval(id);
  }, []);
  return status;
}
