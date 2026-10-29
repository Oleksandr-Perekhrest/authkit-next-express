# CLAUDE.md

## Project overview

Full-stack auth demo: email/password + Google OAuth with JWT access tokens and rotating refresh
tokens in httpOnly cookies.

- `apps/web` — Next.js 16 (App Router), React 19, Tailwind CSS v4 · deployed on Vercel
- `apps/api` — Express 5, bundled to ESM via tsdown · deployed on Render
- `packages/shared` — Zod schemas and inferred types consumed by both apps

The browser targets the Vercel domain. Next.js rewrites `/api/*` → Render so cookies stay
first-party. Database: Prisma Postgres (Frankfurt), accessed from the API only.

## Commands

```bash
pnpm install                            # install deps + install git hooks (lefthook)
pnpm dev                                # web :3000 and api :4000 in parallel
pnpm db:up / pnpm db:down               # start / stop local Postgres via Docker

pnpm --filter @authkit/api db:migrate   # prisma migrate dev
pnpm --filter @authkit/api db:generate  # prisma generate
pnpm --filter @authkit/api db:studio    # prisma studio

pnpm typecheck                          # tsc across all packages
pnpm lint                               # ESLint across the whole repo
pnpm format:check                       # Prettier check (write: pnpm format)
pnpm build                              # build all packages
```

## Code style

**Indentation:** 4 spaces everywhere; JSON, YAML, and Markdown use 2. Enforced by Prettier.

**Imports:** two groups separated by a blank line, each sorted by line length (shortest first):

```ts
// outsource dependencies
import { z } from "zod";
import { useForm } from "react-hook-form";
import { loginSchema } from "@authkit/shared";

// local dependencies
import TextField from "@/components/text-field";
import { applyApiError } from "@/lib/form-errors";
```

- **outsource** — npm packages, Node built-ins (`node:*`), workspace packages (`@authkit/*`)
- **local** — relative paths, and the `@/` alias (`apps/web/src/`, web only)

**Shared types:** Zod schemas and inferred types live in `packages/shared/src/`. Always import
them as `@authkit/shared` — they go in the outsource group.

## Workflow rules

- **Do NOT** commit, push, or create/switch branches — the developer does that.
- Finish every task by running: `pnpm typecheck && pnpm lint && pnpm format:check`
- When adding or changing API routes, update the matching `.http` file in `apps/api/http/`.
- Commit messages and PR titles follow **Conventional Commits** — the PR title becomes the squash commit.
- **Git hooks (lefthook):** pre-commit auto-fixes lint/format on staged files; pre-push mirrors CI.
