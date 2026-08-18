#!/usr/bin/env bash
#
# Run the whole migration chain against a throwaway local Postgres, in the
# order a fresh setup would, and then run the audit query over the result.
#
# This is the answer to "how do I know this migration works before I paste it
# into the live SQL editor?", which is the question nobody could answer when
# `0006` silently never got applied and `0009` (then numbered `0005`) died on
# `42P01: relation "trainer_documents" does not exist`.
#
# Needs a local Postgres 16 server binary. No network, no Supabase project, no
# credentials — it builds its own cluster in a temp directory and deletes it.
#
#   ./supabase/reconcile/local_migration_check.sh
#
# Exits non-zero on the first migration that fails.

set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
MIGRATIONS="$REPO_ROOT/supabase/migrations"
RECONCILE="$REPO_ROOT/supabase/reconcile"

PGBIN="${PGBIN:-/usr/lib/postgresql/16/bin}"
WORKDIR="$(mktemp -d)"
PORT="${PGPORT:-5433}"

# initdb refuses to run as root, so drop to the `postgres` system user when we
# are root (CI containers, the Claude build workspace).
RUNAS=""
if [ "$(id -u)" = "0" ] && id postgres >/dev/null 2>&1; then
  RUNAS="postgres"
  chown postgres:postgres "$WORKDIR"
fi

as_pg() { if [ -n "$RUNAS" ]; then su "$RUNAS" -c "$*"; else eval "$*"; fi; }

cleanup() {
  as_pg "$PGBIN/pg_ctl -D $WORKDIR/data stop -m immediate" >/dev/null 2>&1 || true
  rm -rf "$WORKDIR"
}
trap cleanup EXIT

echo "Building a throwaway cluster in $WORKDIR"
as_pg "$PGBIN/initdb -D $WORKDIR/data -U postgres --auth=trust" >/dev/null
as_pg "$PGBIN/pg_ctl -D $WORKDIR/data -o '-k $WORKDIR -p $PORT -c listen_addresses=' -l $WORKDIR/log start" >/dev/null
sleep 2

psql() { command psql -h "$WORKDIR" -p "$PORT" -U postgres -v ON_ERROR_STOP=1 "$@"; }

psql -q -d postgres -c "create database migration_check;" >/dev/null

apply() {
  printf '  %-46s' "$(basename "$1")"
  if psql -q -d migration_check -f "$1" >/dev/null 2>"$WORKDIR/err"; then
    echo "ok"
  else
    echo "FAILED"
    sed 's/^/      /' "$WORKDIR/err" >&2
    exit 1
  fi
}

echo "Applying Supabase stubs and migrations in fresh-setup order:"
apply "$RECONCILE/local_supabase_stub.sql"
for f in "$MIGRATIONS"/*.sql; do
  apply "$f"
done

echo
echo "Audit of the resulting schema:"
psql -d migration_check -f "$RECONCILE/01_audit_live_schema.sql"

echo
echo "Everything above should read PRESENT except the 0007/0008 GymMaster rows,"
echo "which live on an unmerged branch and are not in supabase/migrations/ yet."
