# Gym Park / GymPlatform

Gym Park’s website and member experience for Ezzahra, Tunisia, built on the existing React workspaces and .NET 8 / EF Core architecture.

## Run

```sh
cd frontend
npm ci
npm run dev:public   # http://localhost:5180
npm run dev:portal   # http://localhost:5181
npm run dev:admin    # http://localhost:5182
```

From the repository root, with the .NET 8 SDK:

```sh
dotnet build GymPlatform.sln
dotnet run --project backend/src/GymPlatform.Api
```

The membership-plan endpoint requires a configured SQL Server instance. `GET /api/gymprofile` serves the shared Gym Park configuration without a database. Existing persisted settings are not overwritten. Apply database migrations only to the intended environment.

## Authoritative surfaces

- `frontend/apps/public-site`: public site, auth demonstration and the **current authoritative member prototype** at `/espace-membre` and its subroutes.
- `frontend/apps/member-portal`: branded future separation shell linking to the current prototype. No duplicate member implementation.
- `frontend/apps/admin-console`: branded preparation shell. No staff authentication, production records or administrative mutations.
- `backend/src`: existing domain, infrastructure and API retained. The initial migration remains unchanged.

For the separate shells, set `VITE_PUBLIC_SITE_URL` to the deployed public-site origin. The local default is `http://localhost:5180`.

## Business configuration

**`config/gym-park.json` is the authoritative editable source** for identity, supplied asset paths, contact information, map query, time zone, opening hours, eight standard plan variants, registration fee, promotion, activity catalog, class sessions and future gallery records.

The frontend adapter `frontend/apps/public-site/src/lib/gymInfo.ts` provides typed models. The .NET domain embeds the same JSON and uses it for `GymSettings` defaults. `OpeningHours.CreateGymParkDefaults()` creates a fresh seven-day schedule for future provisioning; it never modifies existing rows automatically. The effective date of the current hours is recorded in configuration.

The public site currently reads the build-time JSON, not membership-plan records from SQL Server. Rebuild/redeploy after changing configuration. The read-only `/api/gymprofile` endpoint is a future integration point. No schema extension is needed while access modes and schedules remain frontend-configured. Do not persist morning/session plans by overloading `DurationDays`; extend the domain additively when booking/billing is implemented.

### Promotion

The promotion announced on 28 August 2026 is saved with original and promotional amounts, a start date, optional end date, `active` and `publiclyVisible`. **`promotion.active` defaults to `false`** because continued availability has not been confirmed. Toggle that single flag after confirmation. Public rendering also requires `publiclyVisible` and a valid date window in `Africa/Tunis`. A null end date means no date was supplied; no expiry has been invented. Pricing, signup and offers share the same price selector.

### Classes

`activities` lists communicated activities, not guaranteed weekly appointments. `classSessions` is empty until confirmed sessions are supplied. Each future session supports an activity ID, ISO `startsAt`/`endsAt` with offset, coach, intensity, women-only flag, reservation flag and special-event flag. `/cours` groups dated sessions into a browsable week without creating a recurring timetable. Reservations link to the club’s phone. Dates and opening status use `Africa/Tunis`.

### Assets

The provided `gym-park-hero.png` is decorative brand imagery, not documentary facility photography. The replacement dark logo supplied on 2 October 2026 is used unchanged as `gym-park-logo-dark.png` across all three apps and favicons. Logo containers have transparent backgrounds. The accent sampled from the logo is `#A9CF03`. The pricing-reference image is not embedded in the website. Former client photography, video, backgrounds and logo files have been removed from the application.

## Demo boundaries

`public-site/src/lib/demoData.ts` contains isolated illustrative member records. All member routes carry a persistent demonstration notice. Authentication is a local demo session under `gym_park_demo_session`, not real authentication; passwords are not stored or sent. No account creation, payment, reservation, support transmission or QR admission occurs. Profile, pause and reward interactions are local demonstrations. Loyalty thresholds, rewards, pause allowances, guest benefits, member counts and historical records are fictitious examples, not Gym Park entitlements. Public marketing does not present these features as operational.

## Confirmation needed before production

- Whether the August promotion is still active; any future end date.
- Class dates/times, coaches, intensity, women-only slots and event/reservation rules.
- Real facility/gallery photos.
- Confirmed loyalty/referral/reward, pause and guest policies.
- Legal documents, data processing terms and production authentication/authorization.
- Production domain for absolute OpenGraph URLs, shell links and API integration.

## Verification

```sh
cd frontend
npm run build -w apps/public-site
npm run build -w apps/member-portal
npm run build -w apps/admin-console
npm run lint -w apps/public-site
npm run test -w apps/public-site
```

The Playwright suite uses installed Google Chrome (`channel: chrome`) and checks all routes at desktop, laptop, tablet and mobile widths, runtime errors, broken images, horizontal overflow, menu keyboard behavior, pricing totals, promotion gating and Tunis opening-hour boundaries. Screenshots are written to `frontend/apps/public-site/artifacts/`.

The original `prompt1.txt` is retained as supplied project input and intentionally excluded from application branding audits.
