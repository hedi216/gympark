import { test, expect } from "@playwright/test";
import { computeStatus } from "../src/lib/useOpenStatus";
import {
  isPromotionVisible,
  plans,
  priceFor,
  promotion,
} from "../src/lib/gymInfo";

test("opening boundaries use Tunis local time, including weekends", () => {
  for (const [instant, expected] of [
    ["2026-10-02T05:59:00Z", false],
    ["2026-10-02T06:00:00Z", true],
    ["2026-10-02T20:59:00Z", true],
    ["2026-10-02T21:00:00Z", false],
    ["2026-10-03T06:59:00Z", false],
    ["2026-10-03T07:00:00Z", true],
    ["2026-10-03T17:00:00Z", false],
    ["2026-10-04T07:59:00Z", false],
    ["2026-10-04T08:00:00Z", true],
    ["2026-10-04T17:00:00Z", false],
    ["2026-10-04T23:30:00Z", false],
  ] as const)
    expect(computeStatus(new Date(instant)).isOpen, instant).toBe(expected);
  expect(computeStatus(new Date("2026-10-02T21:00:00Z")).detail).toContain(
    "samedi à 08:00",
  );
});

test("promotion respects both flags and optional inclusive end date", () => {
  const now = new Date("2026-10-02T12:00:00Z");
  expect(isPromotionVisible(now)).toBe(false);
  const active = { ...promotion, active: true };
  expect(isPromotionVisible(now, active)).toBe(true);
  expect(isPromotionVisible(now, { ...active, publiclyVisible: false })).toBe(
    false,
  );
  expect(isPromotionVisible(new Date("2026-08-27T12:00:00Z"), active)).toBe(
    false,
  );
  expect(isPromotionVisible(new Date("2026-08-27T23:00:00Z"), active)).toBe(
    true,
  );
  expect(isPromotionVisible(now, { ...active, endDate: "2026-10-01" })).toBe(
    false,
  );
  expect(
    isPromotionVisible(new Date("2026-10-02T22:59:00Z"), {
      ...active,
      endDate: "2026-10-02",
    }),
  ).toBe(true);
  expect(
    isPromotionVisible(new Date("2026-10-02T23:00:00Z"), {
      ...active,
      endDate: "2026-10-02",
    }),
  ).toBe(false);
  expect(plans.map((plan) => priceFor(plan, now).price)).toEqual([
    80, 210, 130, 320, 530, 890, 200, 70,
  ]);
});


test("active promotion changes eligible plans only and retains original amounts", () => {
  const wasActive = promotion.active;
  try {
    promotion.active = true;
    const now = new Date("2026-10-02T12:00:00Z");
    expect(plans.map(plan => priceFor(plan, now).price)).toEqual([80, 210, 130, 280, 450, 710, 200, 70]);
    expect(priceFor(plans.find(plan => plan.id === "libre-12")!, now)).toEqual({ price: 710, original: 890 });
    expect(priceFor(plans[0], now).original).toBeUndefined();
  } finally {
    promotion.active = wasActive;
  }
});
