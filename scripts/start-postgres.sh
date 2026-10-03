#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
mkdir -p .gympark
chmod 700 .gympark
export PATH="/opt/homebrew/opt/postgresql@16/bin:$PATH"
if ! command -v initdb >/dev/null; then
  echo "Install PostgreSQL 16+ (macOS: brew install postgresql@16), then run this script again."; exit 1
fi
if [ ! -f .gympark/database.env ]; then
  umask 077
  database_password=$(openssl rand -hex 24)
  printf 'export PGPASSWORD=%s\nexport ConnectionStrings__GymDb="Host=localhost;Port=55432;Database=gympark;Username=gympark;Password=%s"\n' "$database_password" "$database_password" > .gympark/database.env
fi
source .gympark/database.env
if [ ! -d .gympark/postgres ]; then
  password_file=$(mktemp)
  chmod 600 "$password_file"
  printf '%s' "$PGPASSWORD" > "$password_file"
  trap 'rm -f "$password_file"' EXIT
  initdb -D .gympark/postgres -U gympark --auth=scram-sha-256 --pwfile="$password_file" --encoding=UTF8 --locale=C >/dev/null
fi
if ! pg_ctl -D .gympark/postgres status >/dev/null 2>&1; then
  pg_ctl -D .gympark/postgres -l .gympark/postgres.log -o '-h 127.0.0.1 -p 55432' start
fi
if ! psql -h 127.0.0.1 -p 55432 -U gympark -d postgres -tAc "SELECT 1 FROM pg_database WHERE datname='gympark'" | grep -q 1; then
  createdb -h 127.0.0.1 -p 55432 -U gympark gympark
fi
printf 'PostgreSQL ready on localhost:55432. Credentials are in ignored .gympark/database.env (mode 600).\n'
