# syntax=docker/dockerfile:1

# ─── base: pinned Node + pnpm ─────────────────────────────────────────────────
FROM node:24-slim AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
# Match the exact version from the root packageManager field
RUN corepack enable && corepack prepare pnpm@12.15.0 --activate

# ─── build: install deps, generate Prisma client, compile to ESM ──────────────
FROM base AS build
WORKDIR /app

# Build tools for native addons (argon2 may need to compile if no prebuilt binary matches the platform)
RUN apt-get update && apt-get install -y --no-install-recommends python3 make g++ && \
    rm -rf /var/lib/apt/lists/*

# Workspace manifests only — long-lived cache layer rebuilt only when deps change
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml tsconfig.base.json ./
COPY apps/api/package.json ./apps/api/
COPY apps/web/package.json ./apps/web/
COPY packages/shared/package.json ./packages/shared/

# Mount the pnpm content-store for layer-cache reuse across builds
# CI=true mirrors lefthook's own postinstall.js skip condition so the prepare
# script does not call "lefthook install" (which needs git, absent in this image)
RUN --mount=type=cache,id=pnpm,target=/pnpm/store \
    CI=true pnpm install --frozen-lockfile

# Application source — separate layer so code changes don't bust the install cache
COPY apps/api ./apps/api
COPY packages/shared ./packages/shared

# Runs: prisma generate --no-hints && tsdown → dist/index.mjs
# prisma.config.ts reads DATABASE_URL at generate time; a dummy URL is safe — no DB connection happens during generate
RUN DATABASE_URL="postgresql://dummy:dummy@localhost:5432/dummy" \
    pnpm --filter @authkit/api build

# Self-contained production directory: resolves workspace:* references and keeps prod deps only
# pnpm v10+ requires running from the workspace root with --filter
RUN pnpm --filter @authkit/api deploy --prod /prod

# ─── runtime: minimal production image ────────────────────────────────────────
FROM node:24-slim AS runtime
WORKDIR /app

ENV NODE_ENV=production

# OpenSSL: the Prisma CLI (migrate deploy) detects it at startup
RUN apt-get update && apt-get install -y --no-install-recommends openssl && \
    rm -rf /var/lib/apt/lists/*

# Least-privilege: dedicated system user to avoid running as root
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 --ingroup nodejs apiuser

# Deployed bundle: dist/ (compiled ESM), node_modules/ (prod only), prisma/ (migrations + schema), prisma.config.ts
COPY --from=build --chown=apiuser:nodejs /prod ./

USER apiuser

EXPOSE 4000

# Run migrations before the server; a non-zero exit from prisma stops the container before starting the app
CMD ["sh", "-c", "node_modules/.bin/prisma migrate deploy && exec node dist/index.mjs"]
