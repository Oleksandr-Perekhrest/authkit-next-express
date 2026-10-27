# authkit-next-express

Full-stack authentication pet project: a Next.js frontend and an Express API in a pnpm monorepo. Email/password sign-up and login, JWT access/refresh tokens in httpOnly cookies, Google OAuth, deployed to Vercel and Render.

> Work in progress.

## Stack

- `apps/web` — Next.js 16 (App Router), TypeScript, Tailwind CSS
- `apps/api` — Express 5, TypeScript, bundled with tsdown
- `packages/shared` — zod schemas and types shared by both apps

## Requirements

- Node.js 24 (see `.nvmrc`)
- pnpm via corepack

## Getting started

```bash
nvm use
corepack enable pnpm
pnpm install
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env.local
pnpm dev
```

- Web: http://localhost:3000
- API: http://localhost:4000/health

## Scripts

| Script              | Description                      |
| ------------------- | -------------------------------- |
| `pnpm dev`          | Run web and api in watch mode    |
| `pnpm build`        | Build all packages               |
| `pnpm lint`         | Lint the whole repo              |
| `pnpm typecheck`    | Type-check all packages          |
| `pnpm format`       | Format with Prettier             |
| `pnpm format:check` | Check formatting without writing |
