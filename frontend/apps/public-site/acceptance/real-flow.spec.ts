import { test, expect, type Page } from "@playwright/test";
import { randomBytes } from "node:crypto";
const adminURL = "http://localhost:5192";
const password = `Gp-7${randomBytes(16).toString("hex")}`;
async function login(page: Page, email: string, secret: string) {
  await page.goto("/connexion");
  await page.getByLabel(/^Email(?: \*)?$/).fill(email);
  await page.getByLabel(/^Mot de passe(?: \*)?$/).fill(secret);
  await page.getByRole("button", { name: "Se connecter", exact: true }).click();
}
async function change(page: Page, secret: string) {
  await expect(page).toHaveURL(/changer-mot-de-passe/);
  await page
    .getByLabel(/^Mot de passe temporaire \/ actuel(?: \*)?$/)
    .fill(secret);
  await page.getByLabel(/^Nouveau mot de passe(?: \*)?$/).fill(password);
  await page
    .getByLabel(/^Confirmer le nouveau mot de passe(?: \*)?$/)
    .fill(password);
  await page
    .getByRole("button", { name: "Enregistrer mon mot de passe", exact: true })
    .click();
}
async function create(page: Page, email: string, employee = false) {
  await page.goto(`${adminURL}/${employee ? "employes" : "adherents"}`);
  await page
    .getByRole("button", {
      name: employee ? "Créer un employé" : "Créer un adhérent",
      exact: true,
    })
    .click();
  await page
    .getByRole("dialog")
    .getByLabel(/^Email(?: \*)?$/)
    .fill(email);
  await page
    .getByRole("dialog")
    .getByRole("button", { name: "Créer le compte", exact: true })
    .click();
  await expect(page.locator(".secret-value")).toBeVisible();
  const secret = (await page.locator(".secret-value").textContent())!;
  await page.getByRole("button", { name: "J’ai conservé les accès" }).click();
  await expect(page.locator(".secret-value")).toHaveCount(0);
  return secret;
}
test("admin and employee publish real sessions; members book, see full state and cancel", async ({
  browser,
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await login(
    page,
    process.env.GYMPARK_BOOTSTRAP_ADMIN_EMAIL!,
    process.env.GYMPARK_BOOTSTRAP_ADMIN_TEMP_PASSWORD!,
  );
  await change(page, process.env.GYMPARK_BOOTSTRAP_ADMIN_TEMP_PASSWORD!);
  await expect(page).toHaveURL(`${adminURL}/`);
  await expect(page.getByRole("link", { name: "Employés" })).toBeVisible();
  const memberSecret = await create(page, "member@example.com");
  const employeeSecret = await create(page, "employee@example.com", true);
  await page.getByRole("button", { name: "Se déconnecter" }).click();
  await login(page, "employee@example.com", employeeSecret);
  await change(page, employeeSecret);
  await expect(page).toHaveURL(`${adminURL}/`);
  await expect(page.getByRole("link", { name: "Employés" })).toHaveCount(0);
  await page.goto(`${adminURL}/employes`);
  await expect(
    page.getByRole("heading", { name: "Accès refusé" }),
  ).toBeVisible();
  await create(page, "second@example.com");
  // Keep an anonymous public page open before publication to test focus refresh.
  const publicContext = await browser.newContext();
  const publicPage = await publicContext.newPage();
  await publicPage.goto("http://localhost:5190/cours");
  await expect(publicPage.locator(".session")).toHaveCount(0);
  await page.goto(`${adminURL}/cours`);
  await page
    .getByRole("button", { name: "Créer un cours", exact: true })
    .click();
  await page
    .getByLabel("Nom du cours", { exact: true })
    .fill("Spinning acceptance");
  await page
    .getByLabel("Description", { exact: true })
    .fill("Test de publication");
  await page.getByLabel("Catégorie", { exact: true }).fill("Cardio");
  await page.getByLabel("Coach", { exact: true }).fill("Coach test");
  await page.getByLabel("Capacité par défaut").fill("1");
  await page
    .getByRole("button", { name: "Enregistrer le cours", exact: true })
    .click();
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await page
    .getByRole("button", { name: "Programmer des séances", exact: true })
    .click();
  await page.getByLabel("Récurrence").selectOption("Weekly");
  await page.getByLabel("Lun", { exact: true }).check();
  await page.getByLabel("Mer", { exact: true }).check();
  // Next Monday is future even if test runs on Monday.
  const today = new Date(
    new Intl.DateTimeFormat("en-CA", { timeZone: "Africa/Tunis" }).format(
      new Date(),
    ) + "T12:00:00Z",
  );
  const nextMonday = new Date(today);
  nextMonday.setUTCDate(
    today.getUTCDate() + ((8 - today.getUTCDay()) % 7 || 7),
  );
  const monday = nextMonday.toISOString().slice(0, 10);
  await page.getByLabel("Date de début", { exact: true }).fill(monday);
  await page.getByRole("button", { name: "Enregistrer le planning" }).click();
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await publicPage.getByRole("button", { name: "Semaine suivante" }).click();
  await expect(publicPage.locator(".session")).toHaveCount(2);
  await expect(publicPage.locator(".session").first()).toContainText("18:00");
  await expect(publicPage.locator(".session").first()).toContainText(
    "Coach test",
  );
  await expect(publicPage.getByText("member@example.com")).toHaveCount(0);
  // Staff edits this occurrence; already-open public planner refreshes on focus.
  await page.getByRole("button", { name: "Semaine suivante" }).click();
  await page
    .getByRole("button", { name: "Cette séance", exact: true })
    .first()
    .click();
  await page.getByLabel("Coach de cette séance").fill("Coach actualisé");
  await page.getByRole("button", { name: "Enregistrer cette séance" }).click();
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await publicPage.evaluate(() => window.dispatchEvent(new Event("focus")));
  await expect(publicPage.locator(".session").first()).toContainText(
    "Coach actualisé",
  );
  await expect(publicPage.locator(".activity-card")).toContainText(
    "Spinning acceptance",
  );
  const memberContext = await browser.newContext();
  const memberPage = await memberContext.newPage();
  await memberPage.goto("http://localhost:5190/connexion");
  await memberPage.getByLabel(/^Email(?: \*)?$/).fill("member@example.com");
  await memberPage.getByLabel(/^Mot de passe(?: \*)?$/).fill(memberSecret);
  await memberPage
    .getByRole("button", { name: "Se connecter", exact: true })
    .click();
  await change(memberPage, memberSecret);
  await expect(memberPage).toHaveURL(/\/espace-membre$/);
  await memberPage.goto("http://localhost:5190/cours");
  await memberPage.getByRole("button", { name: "Semaine suivante" }).click();
  await memberPage
    .getByRole("button", { name: "Réserver", exact: true })
    .first()
    .click();
  await expect(
    memberPage.getByText("Votre réservation est confirmée"),
  ).toBeVisible();
  await publicPage.evaluate(() => window.dispatchEvent(new Event("focus")));
  await expect(publicPage.locator(".session").first()).toContainText("COMPLET");
  await page
    .getByRole("button", { name: "Participants", exact: true })
    .first()
    .click();
  await expect(page.getByRole("dialog")).toContainText("member@example.com");
  await page
    .getByRole("dialog")
    .getByRole("button", { name: "Fermer" })
    .click();
  await memberPage
    .getByRole("button", { name: "Annuler ma réservation", exact: true })
    .click();
  await memberPage
    .getByRole("button", { name: "Confirmer l’annulation", exact: true })
    .click();
  await expect(
    memberPage.getByText(
      "Réservation annulée. La place est à nouveau disponible.",
    ),
  ).toBeVisible();
  await publicPage.evaluate(() => window.dispatchEvent(new Event("focus")));
  await expect(publicPage.locator(".session").first()).toContainText(
    "1 / 1 places disponibles",
  );
  for (const width of [1440, 390, 320]) {
    await memberPage.setViewportSize({width,height:900});
    for (const route of ['', '/abonnement', '/carte', '/assiduite', '/paiements', '/historique', '/profil', '/cours', '/reservations']) {
      await memberPage.goto(`http://localhost:5190/espace-membre${route}`);
      await expect(memberPage.locator('h1')).toBeVisible();
      await expect(memberPage.locator('.loading-state')).toHaveCount(0);
      await expect(memberPage.getByRole('alert')).toHaveCount(0);
      expect(await memberPage.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),`member ${route} overflow ${width}`).toBe(true);
    }
  }
  await memberPage.screenshot({path:'artifacts/member-mobile-functional.png',fullPage:true});
  await memberPage.goto("http://localhost:5192");
  await expect(
    memberPage.getByRole("heading", { name: "Accès refusé" }),
  ).toBeVisible();
  for (const width of [1440, 390, 320]) {
    await page.setViewportSize({ width, height: 900 });
    for (const route of [
      "adherents",
      "abonnements",
      "presences",
      "paiements",
      "cours",
      "reservations",
      "parametres",
    ]) {
      await page.goto(`${adminURL}/${route}`);
      await expect(page.locator("h1")).toBeVisible();
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth + 1,
        ),
        `${route} overflow ${width}`,
      ).toBe(true);
      await expect(page.getByRole("alert")).toHaveCount(0);
    }
  }
  await page.screenshot({
    path: "artifacts/admin-mobile-functional.png",
    fullPage: true,
  });
  await publicPage.locator("h1").click();
  await publicPage.screenshot({
    path: "artifacts/public-published-sessions.png",
    fullPage: true,
  });
  expect(errors).toEqual([]);
  await memberContext.close();
  await publicContext.close();
});
