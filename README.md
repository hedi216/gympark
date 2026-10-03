# Gym Park / GymPlatform

Public website, member area and staff console for Gym Park, Ezzahra. React/TypeScript frontends, ASP.NET Core 8 API, EF Core 8 and **PostgreSQL 16+**. The approved dark branding and supplied assets are preserved.

## Local startup

Prerequisites: Node.js/npm, .NET 8 SDK, PostgreSQL 16+ binaries (`brew install postgresql@16` on macOS).

```sh
scripts/start-postgres.sh
scripts/start-api.sh
```

The scripts create an isolated PostgreSQL cluster under ignored `.gympark/`, listening on localhost:55432, with a generated database password. API: http://localhost:5154. Development startup applies PostgreSQL migrations. The scripts use the installed `dotnet`, with a fallback to the temporary SDK at `/tmp/gym-park-dotnet/dotnet` on this workstation.

In separate terminals:

```sh
cd frontend
npm ci
npm run dev:public   # http://localhost:5180 — public site + member area
npm run dev:admin    # http://localhost:5182 — administrator / employee console
npm run dev:portal   # http://localhost:5181 — optional link to authoritative member area
```

### Initial administrator

On the **first** API startup only, bootstrap creates `admin@gympark.local` and prints its randomly generated temporary password. Retrieve that initial output locally:

```sh
sed -n '/GYMPARK FIRST SETUP/,+2p' .gympark/api.log
```

Open http://localhost:5182/connexion, enter that email/password, then choose a personal password on the mandatory change screen. Minimum: 12 characters, uppercase, lowercase, digit and symbol. The temporary password stops working after the change. Delete the private first-setup log after saving/changing the credential. Restarting the API does not reset or create another administrator. This output is never available through HTTP. Do not share or commit `.gympark/`.

## Operational flow

1. Administrator: open **Adhérents** or **Employés**, create an account, copy the temporary password shown once.
2. Give those access details to the person. No email is sent. They must change the password at first login.
3. Administrator or employee: open **Cours**, create a course with **Cours actif** and **Visible publiquement** checked, then **Programmer des séances**.
4. Choose a single occurrence, daily recurrence, or weekdays; set dates, Tunis time and capacity, then save.
5. The materialized sessions immediately feed public `/cours`, member `/espace-membre/cours` and staff planning. Navigate to the relevant week. The public planner refreshes on tab focus/visibility and every 30 seconds while visible.
6. Members book/cancel from the planner. Staff use **Participants** to view or manage bookings. Full/cancelled sessions cannot be booked; participant identities are never public.

Creating a course alone adds the catalog entry; publishing dates requires a schedule. There is no fabricated timetable or production sample data.

## Configuration and deployment

`config/gym-park.json` remains the source for branding, supplied asset paths, contacts, Tunis timezone, opening hours, official subscription variants, registration fee and promotion. Rebuild after editing this file. The old `classSessions` configuration is no longer the planner's source: operational courses/schedules come from PostgreSQL.

Frontend build-time variables, in each app's `.env.local`:

```dotenv
VITE_API_BASE_URL=http://localhost:5154/api
VITE_PUBLIC_SITE_URL=http://localhost:5180
VITE_ADMIN_CONSOLE_URL=http://localhost:5182
```

Production backend configuration:

- `ConnectionStrings__GymDb`: PostgreSQL connection string, including deployment-appropriate TLS settings.
- `GYMPARK_JWT_KEY`: persistent cryptographically random signing secret, at least 32 bytes.
- `GYMPARK_BOOTSTRAP_ADMIN_EMAIL` and `GYMPARK_BOOTSTRAP_ADMIN_TEMP_PASSWORD`: first administrator only; supply through your secret manager, then remove the bootstrap password after use.
- `Frontend__Origins__0`, `Frontend__Origins__1`, etc.: exact permitted frontend origins.
- `Booking__RequireActiveSubscription=true` once the club has imported/validated memberships. Default false; inactive/suspended accounts are always rejected.
- `Database__AutoMigrate`: default false outside development. Prefer applying reviewed migrations before starting production.

Use HTTPS and the same site for frontend/API hosts, e.g. subdomains of one domain or a same-origin reverse proxy. Session JWTs are carried in HttpOnly, production-Secure, SameSite=Lax cookies, with explicit credentialed CORS and custom-header/origin CSRF checks. Unrelated cross-site frontend/API deployments are not supported by this cookie configuration. Access lasts one hour; sign in again after expiry. Password reset, status changes, password changes and logout revoke affected sessions.

### Migrations

PostgreSQL context: `PostgresGymDbContext`. Provider-specific migrations:

- `20261002195534_InitialPostgres`: equivalent baseline for PostgreSQL.
- `20261002195536_AuthenticationAndCourses`: additive accounts/auth, course series/sessions/reservations and plan semantics.

```sh
# Install dotnet-ef 8.x if needed, then from repository root:
source .gympark/database.env
dotnet ef database update --context PostgresGymDbContext \
  --project backend/src/GymPlatform.Infrastructure \
  --startup-project backend/tools/GymPlatform.Migrations
```

The original SQL Server initial migration is intact. `20261002195539_AuthenticationAndCoursesSqlServer` provides the additive schema path for an existing SQL Server database, but the running application now uses PostgreSQL. SQL Server-to-PostgreSQL data transfer is a separate operator-managed step; no automatic destructive conversion is performed. The SQL Server migration has not been executed against a SQL Server instance in this phase.

Legacy member/staff profiles are imported into centralized `UserAccount` identities at startup. Duplicate/invalid normalized emails or multiple legacy administrators stop import atomically for correction. Legacy columns remain intact. Imported members require a staff password reset; an unrecognized legacy administrator hash requires the configured bootstrap temporary password for recovery. Recognized ASP.NET Identity staff hashes can be retained, with mandatory password change.

## Verification

```sh
dotnet build GymPlatform.sln
source .gympark/database.env
dotnet test backend/tests/GymPlatform.Tests
cd frontend
npm run build --workspaces --if-present
npm run lint --workspaces --if-present
npm run test -w apps/public-site
cd ..
scripts/test-web.sh
```

Backend tests create/drop isolated PostgreSQL test databases using the configured local database role (requires CREATEDB). They exercise real HTTP authentication, permissions, password/session invalidation, concurrent capacity enforcement, publication, recurrence and additive migration with legacy data. Browser acceptance uses a separate temporary database and servers on 5155/5190/5192; installed Google Chrome is required. Test records never enter the working `gympark` database. Public route tests use the normal local API and expect its initially empty course schedule.

## Scope and remaining demos

Authoritative member experience: public-site `/espace-membre`. The separate member-portal is a link shell. Authentication, profile, subscriptions, payment records, attendance, courses and reservations use the backend. Staff payments/presences/subscriptions are manual records, without bank charges, reconciliation or QR hardware integration.

Loyalty, rewards, challenges, referral, notifications and support remain explicitly labelled, isolated demonstrations. There is no waitlist, class attendance/no-show tracking, email delivery or reservation notification. Recurrence edits support an individual occurrence or future series; past history is retained. Sessions with bookings or individual overrides are preserved during series changes. Active membership checks currently verify dates/status, not morning access windows or session-pack consumption.

The August promotion stays disabled pending business confirmation. Legal documents, real gallery images and loyalty policies remain future work.

See [IMPLEMENTATION.md](IMPLEMENTATION.md) for the detailed phase-2 report, API routes, security choices and validation results.
