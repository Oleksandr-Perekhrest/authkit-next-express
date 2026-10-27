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

## Security decisions

Deliberate choices, with the reasoning behind them.

### Password policy

- Minimum length is **8 characters** (OWASP). NIST SP 800-63B-4 asks for 15
  when a password is the only factor; 8 was chosen on purpose to keep sign-up
  friction low in a demo project.
- Maximum length is 128, so passphrases and password-manager output fit, but
  the server is never asked to hash arbitrarily long input.
- No composition rules (uppercase, digits, symbols): they push users toward
  predictable patterns like `Password1!` without adding real strength.
- Login only checks that the password is non-empty, so a future policy change
  never locks out existing users.

### Password hashing

- Passwords are hashed with **argon2id** (`argon2` package, default
  parameters). It is memory-hard, which makes GPU brute force expensive, and
  has no 72-byte input limit like bcrypt.
- Salt and parameters are stored inside the hash string itself.
