# unfold

A whiteboard app built on [Excalidraw](https://excalidraw.com). Sign in with Google or email (verified with a one-time code), organise boards in nested folders, and everything is stored in Postgres.

## Stack
- Turborepo + pnpm monorepo
- `apps/web`: Next.js 14 (App Router) UI and API route handlers, Better Auth, TanStack Query, Tailwind/shadcn-style components
- `packages/db`: Prisma schema, migrations and client (`@unfold/db`)

## Getting started
Requires Node 20+, pnpm and a Postgres database.

```bash
pnpm install
cp apps/web/.env.example apps/web/.env.local     # fill in values
cp packages/db/.env.example packages/db/.env     # DATABASE_URL / DIRECT_URL for Prisma CLI
pnpm --filter @unfold/db db:migrate          # create tables
pnpm dev                                         # http://localhost:3000
```

Without `RESEND_API_KEY`, verification codes are printed in the dev server console. Google sign-in is available only when `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` are set.

## Commands
| Command | What it does |
| --- | --- |
| `pnpm dev` | start the web app |
| `pnpm build` | generate the Prisma client and build everything |
| `pnpm lint` | ESLint for `apps/web`, type-check for `packages/db` |
| `pnpm --filter @unfold/db db:migrate` | create/apply a migration in development |
| `pnpm --filter @unfold/db db:studio` | browse the database |

## Deploying
See [DEPLOY.md](DEPLOY.md). Development history is in [PLAN.md](PLAN.md) and [PROGRESS.md](PROGRESS.md).
