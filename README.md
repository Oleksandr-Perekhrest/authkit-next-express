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

### Tokens and sessions

- **Access token**: JWT (HS256, `jose`), lives **15 minutes**. Payload holds
  only `sub` (user id), `iat` and `exp`: a JWT is signed, not encrypted, so no
  personal data goes in it.
- **Refresh token**: an opaque random string (32 bytes), lives **30 days**.
  It is looked up in the database on every refresh anyway, so a JWT would add
  nothing but a second secret. Only its SHA-256 hash is stored: a leaked
  table cannot be used to sign in. A fast hash is safe here because the token
  is random, unlike a password.
- Registration signs the user in right away; register, login and (later)
  Google sign-in all end in the same `createSession`.

### Cookies

- Both tokens travel in cookies with `HttpOnly`, `SameSite=Lax`, `Path=/`
  and `Secure` in production. Scripts on the page cannot read them.
- `Path=/` on purpose: behind the Next.js rewrite the browser sees
  `/api/auth/...` while the API sees `/auth/...`, so a narrower path would
  not match on one side.

### Login responses

- Unknown email, wrong password and a Google-only account all return the same
  `401 INVALID_CREDENTIALS`.
- When the user does not exist, the password is still checked against a dummy
  hash, so response time does not reveal which emails are registered.

### Rate limiting

- `express-rate-limit`, per IP: login allows **10 failed attempts per 15
  minutes** (successful logins are not counted), registration **5 per hour**.
- Limits run before validation, so malformed requests count too.
- Counters live in process memory, which is enough for a single instance.
