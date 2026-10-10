# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

Run from the repo root (pnpm + Turborepo; `AGENTS.md` notes that turbo behaviour is version-specific, so check the installed version):

- `pnpm dev` — Next.js dev server for `apps/web` on :3000
- `pnpm build` — `turbo build`: `@syncsketch/db` runs `prisma generate`, then `next build`
- `pnpm lint` — ESLint (`--max-warnings 0`) in `apps/web`, `tsc --noEmit` in `packages/db`
- `pnpm --filter @syncsketch/db db:migrate` — create/apply a dev migration; `db:deploy` applies existing ones; `db:studio` opens Prisma Studio
- `pnpm --filter web exec tsc --noEmit` — type-check the app

No test suite. Env: `apps/web/.env.local` (see `.env.example`) and `packages/db/.env` for the Prisma CLI. Without `RESEND_API_KEY` OTP emails are printed to the server console. `pnpm install` depends on `allowBuilds` in `pnpm-workspace.yaml`; a new package with install scripts must be approved there (`pnpm approve-builds`) or install exits non-zero.

## Architecture

- **`packages/db`** (`@syncsketch/db`): Prisma 6 schema, migrations and a global-cached `prisma` client, consumed as TypeScript source (`transpilePackages` in `apps/web/next.config.mjs`). Models: Better Auth tables (`User`, `Session`, `Account`, `Verification`, `RateLimit`, mapped to lowercase table names), plus `Folder` (self-relation via `parentId`, cascade delete) and `Board` (nullable `folderId`, JSON `data` holding the Excalidraw scene). `DATABASE_URL` is the pooled runtime URL, `DIRECT_URL` is for migrations.
- **Auth** (`apps/web/src/lib/auth.ts`): Better Auth with email+password (`requireEmailVerification`, so unverified accounts cannot sign in), the `emailOTP` plugin (OTP sent on sign-up, replaces default verification), Google OAuth only when its env vars are set, and database-backed rate limiting. Mounted at `app/api/auth/[...all]`; browser client in `lib/auth-client.ts`. `middleware.ts` only checks cookie presence; real authorization is `requireUser()` in `lib/session.ts`.
- **API** (`apps/web/src/app/api`): `items` (folder contents + breadcrumbs), `folders`, `boards` (incl. `duplicate`). Every handler uses `requireUser()` and filters by `ownerId`; other users' ids return 404. Shared helpers in `lib/api/` (`handle` error wrapper, zod schemas, folder path/cycle checks). Saves are capped at ~4 MB (Vercel body limit).
- **Frontend**: `lib/api-client.ts` (typed fetch) and `lib/queries.ts` (TanStack Query; mutations invalidate `["items"]`). `components/dashboard.tsx` renders both `/` and `/folder/[folderId]`. `components/Editor.tsx` (client-only via `dynamic(..., { ssr: false })` in `app/board/[boardId]/page.tsx`) loads a board, then autosaves through `PATCH /api/boards/:id`, serialising with Excalidraw's `serializeAsJSON(..., "local")` to drop volatile app state. UI primitives live in `components/ui` (shadcn style).
- **Deploy**: Vercel project with Root Directory `apps/web`; see `DEPLOY.md`. `scripts/vercel-build.sh` migrates only on production. `turbo.json` `globalEnv` must list every env var the build needs.
- `PLAN.md` / `PROGRESS.md` record the migration from the original Vite + IndexedDB app.
