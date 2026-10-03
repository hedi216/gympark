import { test, expect } from "@playwright/test";
const routes = [
  "/",
  "/le-club",
  "/cours",
  "/abonnements",
  "/offres",
  "/contact",
  "/fidelite",
  "/connexion",
  "/rejoindre",
  "/espace-membre",
  "/espace-membre/abonnement",
  "/espace-membre/carte",
  "/espace-membre/assiduite",
  "/espace-membre/fidelite",
  "/espace-membre/recompenses",
  "/espace-membre/defis",
  "/espace-membre/parrainage",
  "/espace-membre/paiements",
  "/espace-membre/historique",
  "/espace-membre/notifications",
  "/espace-membre/support",
  "/espace-membre/profil",
  "/legal",
  "/mot-de-passe-oublie",
  "/page-inconnue",
];
for (const width of [1440, 1024, 768, 390, 320])
  test(`routes render without overflow or runtime errors at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 900 });
    const errors: string[] = [];
    page.on("pageerror", (error) => errors.push(error.message));
    for (const route of routes) {
      await page.goto(route);
      await expect(
        page.locator("h1"),
        `heading missing on ${route}; errors: ${errors.join("; ")}`,
      ).toBeVisible();
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth > innerWidth + 1,
      );
      expect
        .soft(overflow, `horizontal overflow at ${width}px on ${route}`)
        .toBe(false);
      const broken = await page
        .locator("img")
        .evaluateAll((imgs) =>
          imgs
            .filter((img) => !img.complete || img.naturalWidth === 0)
            .map((img) => img.src),
        );
      expect.soft(broken, `broken images on ${route}`).toEqual([]);
      if (route.startsWith("/espace-membre"))
        await expect(page).toHaveURL(/\/connexion$/);
    }
    expect(errors).toEqual([]);
  });
test("mobile menu is keyboard accessible and restores focus", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  const toggle = page.getByRole("button", { name: "Ouvrir le menu" });
  await toggle.click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).not.toBeVisible();
  await expect(toggle).toBeFocused();
  await toggle.click();
  await page.getByRole("dialog").getByRole("link", { name: "Cours" }).click();
  await expect(page).toHaveURL(/\/cours$/);
  await expect(page.getByRole("dialog")).not.toBeVisible();
});
test("pricing choice and registration total follow the selected plan", async ({
  page,
}) => {
  await page.goto("/rejoindre?plan=libre-12");
  await expect(page.locator("#signup-plan")).toHaveValue("libre-12");
  await expect(page.locator(".signup-total")).toContainText(
    "Total initial : 920 DT",
  );
  await page.locator("#signup-plan").selectOption("matin-1");
  await expect(page.locator(".signup-total")).toContainText(
    "Total initial : 110 DT",
  );
  await page.goto("/offres");
  await expect(page.locator(".promotion-block")).toHaveCount(0);
  await expect(page.locator(".empty-offer")).toBeVisible();
  await page.goto("/cours");
  await expect(page.locator(".schedule-days article")).toHaveCount(7);
  await expect(page.locator(".session")).toHaveCount(0);
});
test("capture desktop and mobile design", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto("/");
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot({ path: "artifacts/hero-desktop.png" });
  await page.screenshot({ path: "artifacts/home-desktop.png", fullPage: true });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await page.screenshot({ path: "artifacts/hero-mobile.png" });
  await page.screenshot({ path: "artifacts/home-mobile.png", fullPage: true });
  await page.goto("/espace-membre");
  await page.screenshot({
    path: "artifacts/member-mobile.png",
    fullPage: true,
  });
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto("/espace-membre");
  await page.screenshot({
    path: "artifacts/member-desktop.png",
    fullPage: true,
  });
});
