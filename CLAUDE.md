# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

Run from the repo root (pnpm + Turborepo; `AGENTS.md` notes that turbo behaviour is version-specific, so check the installed version):

- `pnpm dev` — Next.js dev server for `apps/web` on :3000
- `pnpm build` — `turbo build`: `@unfold/db` runs `prisma generate`, then `next build`
- `pnpm lint` — ESLint (`--max-warnings 0`) in `apps/web`, `tsc --noEmit` in `packages/db`
- `pnpm --filter @unfold/db db:migrate` — create/apply a dev migration; `db:deploy` applies existing ones; `db:studio` opens Prisma Studio
- `pnpm --filter web exec tsc --noEmit` — type-check the app

No test suite. Env: `apps/web/.env.local` (see `.env.example`) and `packages/db/.env` for the Prisma CLI. Without `RESEND_API_KEY` OTP emails are printed to the server console. `pnpm install` depends on `allowBuilds` in `pnpm-workspace.yaml`; a new package with install scripts must be approved there (`pnpm approve-builds`) or install exits non-zero.

## Architecture

- **`packages/db`** (`@unfold/db`): Prisma 6 schema, migrations and a global-cached `prisma` client, consumed as TypeScript source (`transpilePackages` in `apps/web/next.config.mjs`). Models: Better Auth tables (`User`, `Session`, `Account`, `Verification`, `RateLimit`, mapped to lowercase table names), plus `Folder` (self-relation via `parentId`, cascade delete) and `Board` (nullable `folderId`, `kind` enum `SKETCH` | `WHITEBOARD`, JSON `data` holding the editor snapshot). `DATABASE_URL` is the pooled runtime URL, `DIRECT_URL` is for migrations.
- **Auth** (`apps/web/src/lib/auth.ts`): Better Auth with email+password (`requireEmailVerification`, so unverified accounts cannot sign in), the `emailOTP` plugin (OTP sent on sign-up, replaces default verification), Google OAuth only when its env vars are set, and database-backed rate limiting. Mounted at `app/api/auth/[...all]`; browser client in `lib/auth-client.ts`. `middleware.ts` only checks cookie presence; real authorization is `requireUser()` in `lib/session.ts`.
- **API** (`apps/web/src/app/api`): `items` (folder contents + breadcrumbs), `folders`, `boards` (incl. `duplicate`). Every handler uses `requireUser()` and filters by `ownerId`; other users' ids return 404. Shared helpers in `lib/api/` (`handle` error wrapper, zod schemas, folder path/cycle checks). Saves are capped at ~4 MB (Vercel body limit).
- **Frontend**: `lib/api-client.ts` (typed fetch) and `lib/queries.ts` (TanStack Query; mutations invalidate `["items"]`). `components/dashboard.tsx` renders both `/` and `/folder/[folderId]`. `app/board/[boardId]/page.tsx` loads a board (`useBoard`) and renders the editor for its `kind` from `components/editors/` (each a client-only dynamic chunk: Excalidraw for `SKETCH`, tldraw for `WHITEBOARD`, optional `NEXT_PUBLIC_TLDRAW_LICENSE_KEY`). `use-board-session.ts` is the shared autosave (`PATCH /api/boards/:id`) and back-navigation; Excalidraw serialises with `serializeAsJSON(..., "local")` to drop volatile app state. Board tiles prefetch the board and editor chunk on hover. Kind labels live in `lib/board-kinds.ts`; folders default to the list view (Name/Type/Edited). UI primitives live in `components/ui` (shadcn style). Theme: colours are HSL tokens in `app/globals.css` (warm ivory/charcoal neutrals, clay `primary`, plus `kraft` for folders, `success`, and the dark `panel` used on the auth screens); style with tokens (`bg-card`, `text-muted-foreground`, `text-primary`), not raw Tailwind colours. Fonts: Inter (`font-sans`) and Newsreader (`font-serif`, used for headings). Both editors follow the app theme. Better Auth uses a 5-minute session cookie cache to skip DB lookups.
- **Deploy**: Vercel project with Root Directory `apps/web`; see `DEPLOY.md`. `scripts/vercel-build.sh` migrates only on production. `turbo.json` `globalEnv` must list every env var the build needs.
- `PLAN.md` / `PROGRESS.md` record the migration from the original Vite + IndexedDB app.
