import config from "../../../../../config/gym-park.json" with { type: "json" };
export interface Plan {
  id: string;
  name: string;
  accessMode: string;
  durationLabel: string;
  price: number;
  accessStartTime?: string;
  accessEndTime?: string;
  sessionLimit?: number;
  validityMonths?: number;
  validityDays?: number;
}
export interface Activity {
  id: string;
  name: string;
  category: string;
  intensity: string | null;
  description: string;
  reservationRequired: boolean;
}
export interface ClassSession {
  id: string;
  activityId: string;
  startsAt: string;
  endsAt: string;
  coach?: string;
  intensity?: string;
  womenOnly: boolean;
  reservationRequired: boolean;
  specialEvent?: boolean;
}
export interface Promotion {
  id: string;
  name: string;
  startDate: string;
  endDate: string | null;
  active: boolean;
  publiclyVisible: boolean;
  prices: { planId: string; originalPrice: number; promotionalPrice: number }[];
}
export const gym = {
  ...config,
  mapsHref: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(config.mapsQuery)}`,
};
export const openingHours = config.openingHours;
export const dayLabels = [
  "Dimanche",
  "Lundi",
  "Mardi",
  "Mercredi",
  "Jeudi",
  "Vendredi",
  "Samedi",
];
export const plans: Plan[] = config.plans;
export const activities: Activity[] = config.activities;
export interface GalleryImage {
  src: string;
  alt: string;
  caption?: string;
}
export const gallery: GalleryImage[] = config.gallery;
// Replace this adapter with a future class-session API; never infer recurring dates from activity names.
export const classSessions: ClassSession[] = config.classSessions;
export const promotion: Promotion = config.promotion;
export function localDate(now = new Date()) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: gym.timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
}
export function isPromotionVisible(
  now = new Date(),
  offer: Promotion = promotion,
) {
  const date = localDate(now);
  return (
    offer.active &&
    offer.publiclyVisible &&
    date >= offer.startDate &&
    (!offer.endDate || date <= offer.endDate)
  );
}
export function priceFor(plan: Plan, now = new Date()) {
  const offer = isPromotionVisible(now)
    ? promotion.prices.find((p) => p.planId === plan.id)
    : undefined;
  return {
    price: offer?.promotionalPrice ?? plan.price,
    original: offer?.originalPrice,
  };
}
