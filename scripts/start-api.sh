#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
if [ ! -f .gympark/database.env ]; then scripts/start-postgres.sh; fi
source .gympark/database.env
umask 077
if [ ! -f .gympark/auth.env ]; then
  printf 'export GYMPARK_JWT_KEY=%s\n' "$(openssl rand -hex 48)" > .gympark/auth.env
fi
source .gympark/auth.env
if command -v dotnet >/dev/null; then gympark_dotnet=$(command -v dotnet); else gympark_dotnet=/tmp/gym-park-dotnet/dotnet; fi
export ASPNETCORE_ENVIRONMENT=Development
# First-run admin credential is displayed here and in this private local log only.
"$gympark_dotnet" run --no-launch-profile --project backend/src/GymPlatform.Api --urls http://localhost:5154 2>&1 | tee -a .gympark/api.log
