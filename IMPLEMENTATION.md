# Gym Park — phase 2 implementation report

The existing branding is preserved. Authentication, staff account management, scheduling and reservations now use the .NET API and PostgreSQL. The public `/cours` planner and member planner display the same materialized sessions as staff management, with no participant data in public responses.

## 1. Authentication architecture

Central `UserAccount` identity, ASP.NET Core `PasswordHasher<UserAccount>` (PBKDF2, 210,000 iterations), signed HS256 JWT access tokens and database-backed `AuthSession` records. JWTs travel in HttpOnly cookies, Secure outside Development/Testing, SameSite=Lax, scoped to `/api`, with a one-hour expiry. No refresh tokens or browser localStorage authorization. Each request revalidates session status, account status, version, password readiness and role from the database. Explicit CORS origins, a required mutation header/origin check, login throttling and five-failure/15-minute account lockout are included. DTOs never expose password hashes.

## 2. Roles and permissions

| Operation | ADMIN | EMPLOYEE | MEMBER |
|---|---|---|---|
| Member accounts, subscriptions, attendance, payment records | Yes | Yes | Own data/profile only |
| Courses, schedules, participants, manual reservations | Yes | Yes | No |
| Employee accounts and password/status changes | Yes | No (403) | No (403) |
| Personal reservations | Staff can manage for members | Staff can manage for members | Own bookings only |

Exactly one bootstrap ADMIN is protected by a unique filtered database index. No UI/API role selector can create another ADMIN. Controllers use explicit RequireAdmin, RequireStaff and RequireMember policies. Members' own endpoints take member identity from the authenticated principal.

## 3. Entities and constraints

Added `UserAccount`, `AuthSession`, `Course`, `ClassSeries`, `ClassSession` and `ClassReservation`. Existing `Member`/`StaffUser` profiles remain linked one-to-one to identity. Legacy password columns remain for data safety but are not authoritative. `MembershipPlan` now has catalog code, access mode, duration months, session limit and optional morning access hours, preserving existing duration days.

Unique normalized email, unique account/profile relationships, unique ADMIN, valid role/profile check, unique series/occurrence date, unique session/member reservation and bounded session capacity constraints protect data. Existing member-number uniqueness is retained. Restrictive foreign keys preserve historical records. Creator/updater IDs and timestamps cover accounts, courses, series, sessions and reservations.

## 4. Migrations

- PostgreSQL baseline: `20261002195534_InitialPostgres`.
- Additive PostgreSQL phase: `20261002195536_AuthenticationAndCourses`.
- Additive legacy SQL Server path: `20261002195539_AuthenticationAndCoursesSqlServer`.

The original SQL Server initial migration is unchanged. PostgreSQL is the runtime provider; data transfer from an existing SQL Server installation is not automatic. Its additive migration has been generated but not executed against SQL Server. The PostgreSQL baseline-to-phase-2 migration was tested with an existing legacy member row.

## 5. Authentication endpoints

`POST /api/auth/login`, `GET /api/auth/me`, `POST /api/auth/change-password`, `POST /api/auth/logout`.

Unsafe requests require `X-GymPark-Request: 1`. Browser calls include credentials. Unknown/expired/revoked sessions receive 401; insufficient permissions receive 403. There is no self-registration or credential-retrieval endpoint.

## 6. Member management endpoints

Staff: `GET/POST /api/members`, `GET/PUT /api/members/{accountId}`, `POST /api/members/{accountId}/reset-password`, `/deactivate`, `/reactivate`. Listing supports search, active-state filter and pagination.

Member-owned data: `GET /api/me`, `PUT /api/me/profile`.

Operational staff routes: `GET /api/operations/overview`, `GET /api/operations/members/{memberId}`, `POST /api/operations/members/{memberId}/subscriptions`, `GET /api/operations/subscriptions`, `POST /api/operations/subscriptions/{id}/cancel`, `GET/POST /api/operations/attendance`, `GET/POST /api/operations/payments`.

Account IDs and member profile IDs are deliberately distinct in the typed DTOs.

## 7. Employee management endpoints

Administrator only: `GET/POST /api/employees`, `GET/PUT /api/employees/{accountId}`, `POST /api/employees/{accountId}/reset-password`, `/deactivate`, `/reactivate`. Employee requests receive 403 regardless of frontend visibility.

## 8. Course and reservation endpoints

Public: `GET /api/courses`, `GET /api/class-sessions?from=YYYY-MM-DD&to=YYYY-MM-DD`, `GET /api/class-sessions/{id}`. Only active, publicly visible courses and their sessions appear; cancelled occurrences remain visibly cancelled. Internal notes and participants are excluded.

Staff: `GET /api/courses/manage`, `POST /api/courses`, `PUT /api/courses/{id}`; `GET/POST /api/class-series`, `PUT /api/class-series/{id}`, `POST /api/class-series/generate`; `GET /api/class-sessions/manage`, `PUT /api/class-sessions/{id}`, `POST /api/class-sessions/{id}/cancel`; `GET/POST /api/class-sessions/{id}/reservations`, `DELETE /api/class-sessions/{id}/reservations/{memberId}`.

Members: `GET /api/me/class-reservations`, `POST/DELETE /api/me/class-reservations/{sessionId}`.

## 9. Frontend pages

Public-site: real `/connexion`, `/changer-mot-de-passe`, contact-only `/rejoindre`, API-backed `/cours`. Protected `/espace-membre` and subscription, card, attendance, payments, history and profile pages use own data; new `/espace-membre/cours` and `/espace-membre/reservations` support booking/cancellation.

Admin-console: `/connexion`, `/changer-mot-de-passe`, `/`, `/adherents`, `/employes` (ADMIN only), `/abonnements`, `/presences`, `/paiements`, `/cours`, `/reservations`, `/parametres`. Creation/reset dialogs show the temporary secret once, with a copy action. Branded dialogs confirm status changes and cancellations. Shared typed API client centralizes all requests/errors/authentication. The separate member-portal continues to link to the authoritative public-site member area.

Public planning and course catalog refresh on focus, visibility restoration and every 30 seconds while visible. Date changes reload the selected week; stale responses cannot overwrite a newer week. A course definition needs scheduled dates before it can appear in the weekly planner.

## 10. Bootstrap administrator

Startup serializes initialization using a PostgreSQL advisory transaction lock, imports unlinked legacy profiles safely, and creates the administrator only if none exists. Production requires configured bootstrap email/password. Development defaults to `admin@gympark.local` and a cryptographically random temporary password. The database enforces the single-admin invariant even with concurrent application startups. Duplicate legacy emails or multiple administrators abort import for correction.

## 11. Exact initial credential instructions

From the repository root:

```sh
scripts/start-postgres.sh
scripts/start-api.sh
```

In another terminal, retrieve the development first-run output:

```sh
sed -n '/GYMPARK FIRST SETUP/,+2p' .gympark/api.log
```

Use the displayed email/password at **http://localhost:5182/connexion**. Change it immediately when redirected. The log lives in ignored, private `.gympark/`; remove the first-setup log once the password is changed. Subsequent restarts neither reveal a password through the API nor reset it. Production credentials come from `GYMPARK_BOOTSTRAP_ADMIN_EMAIL` / `GYMPARK_BOOTSTRAP_ADMIN_TEMP_PASSWORD` in your secret manager, not development log output.

## 12. Temporary passwords

Provisioning/reset generates 96 random bits encoded as a copyable hexadecimal string with a policy-compliant prefix. Only its PBKDF2 hash is persisted. The plaintext appears only in the successful provisioning/reset response and the current modal; closing the modal clears frontend state. Password reset creates a new secret, sets `MustChangePassword`, clears lockout and increments session version. No email delivery is implemented.

## 13. Forced password change

Temporary login creates a restricted authenticated session. UI redirects immediately to the change page, while API middleware independently rejects every unrelated API request with 403 and `password_change_required`. Auth me/change/logout/login remain available. Successful password change verifies the current password and policy/confirmation, invalidates old sessions, clears the flag and issues a replacement cookie. Old temporary passwords fail thereafter.

## 14. Recurrence and timezone

Once/Daily/Weekly series materialize a rolling horizon of 84 days in configured `Africa/Tunis`. Generation runs at startup, on schedule save, through an explicit staff endpoint and every six hours. Unique `(SeriesId, OccurrenceDate)` makes repeated generation idempotent. Local dates/time rules are converted to UTC timestamps for storage; UI converts back using the configured timezone, independently of the browser zone.

Editing supports one occurrence or future series from an effective date. Past sessions are untouched. Booked occurrences and explicit per-session overrides are preserved with a warning; other future occurrences update or soft-cancel. Staff cancellation marks a session cancelled and preserves all reservation links. No infinite generation or hard deletion occurs.

## 15. Capacity and eligibility

Booking uses a transaction with a conditional PostgreSQL row update (`BookedCount < Capacity`) before inserting/reactivating the unique member/session reservation. Concurrent writers serialize on the session row and recheck capacity; failed bookings roll back the increment. Cancellation uses the same lock order and releases a place once. Single-session capacity cannot be reduced below active bookings. Staff bookings obey the same limit.

Inactive/suspended accounts cannot reserve. Optional active-subscription validation is isolated in `BookingEligibility` and defaults off until real membership records are validated. It checks status/dates when enabled; morning windows and session-pack consumption are not enforced in this phase.

## 16. Tests

- Two PostgreSQL-backed .NET integration scenarios pass. They cover administrator/employee/member permissions, anonymous 401, normalization/uniqueness, ignored client role escalation, forced password change, old-password rejection, reset/deactivation revocation, single bootstrap, no hash/secret retrieval, own identity, public/privacy filters, recurring publication, UTC conversion, idempotency, booked-session preservation, cancellation, manual booking and real operation records.
- Concurrent booking: six members race for one remaining place in a capacity-two session; exactly one succeeds and five receive 409. Duplicate reservations and lowering capacity below current bookings are rejected.
- Migration scenario upgrades a baseline PostgreSQL database containing a legacy member, preserves its profile/hash columns and imports a separate reset-required identity.
- Eleven existing Playwright tests pass: public/protected route behavior at 1440/1024/768/390/320px, runtime errors, overflow, images, mobile keyboard navigation, pricing/promotion and Tunis opening hours.
- One real browser acceptance scenario passes with an isolated PostgreSQL database: administrator first login, creation of member/employee, employee restrictions and member provisioning, recurring Monday/Wednesday publication, already-open public planner/catalog refresh, per-session coach edit, member first login, booking/full/cancel/capacity recovery, private participant visibility and responsive staff/member routes (including 320px member cards).

Tests generate temporary data only in isolated databases and remove them after completion. Screenshots are generated under ignored `frontend/apps/public-site/artifacts/`.

## 17. Builds

All three React/TypeScript production builds pass. .NET solution builds successfully. Workspace lint passes. PostgreSQL migrations apply successfully on both fresh and baseline databases. See README for exact commands and local prerequisites.

## 18. Limitations

No refresh tokens, automatic emails, password self-service recovery, waitlist, class attendance/no-show workflow or cancellation notifications. Sessions expire after one hour. No bank processing or reconciliation; subscriptions/payments/attendance are manual staff records. The operation lists show the latest 200 records. Loyalty, rewards, challenges, referrals, notifications and support remain clearly labelled demonstrations. No QR admission hardware integration. Production needs HTTPS, same-site frontend/API deployment, configured secrets/CORS, backups and operator-managed migration rollout. SQL Server data transfer and SQL Server migration execution were not performed.

## 19. Changed files

- Domain: `backend/src/GymPlatform.Domain/Entities/{Accounts,Courses,Membership,Staff}.cs`.
- Persistence: `GymDbContext.cs`, `PostgresGymDbContext.cs`, infrastructure package reference, provider migrations/snapshots and migration tooling host.
- API: `Program.cs`, configuration/package reference, `Auth/`, `Contracts/`, `Services/` and account/auth/course/member-data controllers.
- Frontend shared: `packages/api-client` types/requests/auth provider; `packages/design-system` modal and functional styles.
- Admin-console: router/guards/shell, authentication screens and `pages/{AccountsPage,CoursesPage,OperationsPage}.tsx`, styles and app entry.
- Public-site: routes/guards, login/change/signup, real classes/planner, member data/courses/reservations, auth/member layouts, button disabled support and minimal functional copy/styles.
- Member-portal: environment-aware member-entry copy/link and dependencies.
- Verification/operations: backend integration tests, browser acceptance/config and existing route assertions; `scripts/start-postgres.sh`, `start-api.sh`, `test-web.sh`; app `.env.example` files; solution, package lock, `.gitignore`, README and this report.

`prompt1.txt` contains the user's updated task input and was not rewritten by this implementation. No commit or push was performed in this phase.
