#!/usr/bin/env bash
# Run acceptance tests with an isolated PostgreSQL database; never seed the working database.
set -euo pipefail
cd "$(dirname "$0")/.."
source .gympark/database.env
export PATH="/opt/homebrew/opt/postgresql@16/bin:$PATH"
umask 077
gympark_test_db="gympark_web_$(openssl rand -hex 8)"
createdb -h 127.0.0.1 -p 55432 -U gympark "$gympark_test_db"
export ConnectionStrings__GymDb="${ConnectionStrings__GymDb/Database=gympark/Database=$gympark_test_db}"
export GYMPARK_BOOTSTRAP_ADMIN_EMAIL=admin@test.local
export GYMPARK_BOOTSTRAP_ADMIN_TEMP_PASSWORD="Gp-7$(openssl rand -hex 16)"
export GYMPARK_JWT_KEY="$(openssl rand -hex 48)"
export ASPNETCORE_ENVIRONMENT=Testing Database__AutoMigrate=true
export Frontend__Origins__0=http://localhost:5190 Frontend__Origins__1=http://localhost:5192
export Logging__LogLevel__Default=Warning
export VITE_API_BASE_URL=http://localhost:5155/api VITE_PUBLIC_SITE_URL=http://localhost:5190 VITE_ADMIN_CONSOLE_URL=http://localhost:5192
if command -v dotnet >/dev/null; then gympark_dotnet=$(command -v dotnet); else gympark_dotnet=/tmp/gym-park-dotnet/dotnet; fi
"$gympark_dotnet" backend/src/GymPlatform.Api/bin/Debug/net8.0/GymPlatform.Api.dll --contentRoot "$PWD/backend/src/GymPlatform.Api" --urls http://localhost:5155 > .gympark/web-test-api.log 2>&1 &
gympark_test_pid=$!
cleanup() { kill "$gympark_test_pid" 2>/dev/null || true; wait "$gympark_test_pid" 2>/dev/null || true; dropdb -h 127.0.0.1 -p 55432 -U gympark --force "$gympark_test_db"; }
trap cleanup EXIT
for i in $(seq 1 90); do
  if curl -fsS http://localhost:5155/api/courses >/dev/null 2>&1; then break; fi
  if ! kill -0 "$gympark_test_pid" 2>/dev/null; then echo 'Test API failed; inspect .gympark/web-test-api.log'; exit 1; fi
  sleep 1
done
cd frontend/apps/public-site
npx playwright test --config playwright.acceptance.config.ts "$@"
