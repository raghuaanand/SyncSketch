#!/usr/bin/env bash
# Build command for the Vercel project (Root Directory: apps/web).
# Applies pending Prisma migrations on production deploys only, so preview
# deployments never alter the production schema.
set -euo pipefail
cd "$(dirname "$0")/.."

if [ "${VERCEL_ENV:-}" = "production" ]; then
  pnpm --filter @unfold/db db:deploy
fi

pnpm turbo build --filter=web
