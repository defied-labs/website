# syntax=docker/dockerfile:1.7
# Multi-target build for the defied monorepo.
#   docker build --target server  -t defied-server .
#   docker build --target web     -t defied-web .
#   docker build --target migrate -t defied-migrate .
# Secrets are NEVER baked into images: they are provided at runtime via env files.

ARG NODE_IMAGE=node:22-bookworm-slim

# ---------- base ----------
FROM ${NODE_IMAGE} AS base
ENV PNPM_HOME=/pnpm \
    PATH=/pnpm:$PATH \
    NEXT_TELEMETRY_DISABLED=1 \
    TURBO_TELEMETRY_DISABLED=1
RUN npm install -g pnpm@11.24.0 && npm cache clean --force
WORKDIR /repo

# ---------- deps + build ----------
FROM base AS builder
# Dummy values so env validation / prisma generate succeed at build time.
# They are only used during the build and are not present in runtime images.
ENV DATABASE_URL="mysql://build:build@localhost:3306/build"
ARG NEXT_PUBLIC_SERVER_URL
ARG INTERNAL_SERVER_URL=http://server:3005
ARG APP_ENV=production
ENV NEXT_PUBLIC_SERVER_URL=${NEXT_PUBLIC_SERVER_URL} \
    INTERNAL_SERVER_URL=${INTERNAL_SERVER_URL} \
    APP_ENV=${APP_ENV}
COPY . .
RUN --mount=type=cache,id=pnpm,target=/pnpm/store \
    pnpm install --frozen-lockfile
RUN pnpm --filter @defied/db db:generate

# ---------- server build ----------
FROM builder AS server-build
RUN pnpm turbo build --filter=server
RUN --mount=type=cache,id=pnpm,target=/pnpm/store \
    pnpm --filter server deploy --prod --legacy --ignore-scripts /out \
 && cp -r apps/server/dist /out/dist

# ---------- web build ----------
FROM builder AS web-build
RUN test -n "$NEXT_PUBLIC_SERVER_URL" || (echo "NEXT_PUBLIC_SERVER_URL build arg is required" && exit 1)
RUN pnpm turbo build --filter=web

# ---------- runtime: server ----------
FROM ${NODE_IMAGE} AS server
ENV NODE_ENV=production APP_ENV=production SERVER_PORT=3005
WORKDIR /app
COPY --from=server-build --chown=node:node /out ./
USER node
EXPOSE 3005
CMD ["node", "dist/index.mjs"]

# ---------- runtime: web ----------
FROM ${NODE_IMAGE} AS web
ENV NODE_ENV=production NEXT_TELEMETRY_DISABLED=1 PORT=3000 HOSTNAME=0.0.0.0
WORKDIR /app
COPY --from=web-build --chown=node:node /repo/apps/web/.next/standalone ./
COPY --from=web-build --chown=node:node /repo/apps/web/.next/static ./apps/web/.next/static
COPY --from=web-build --chown=node:node /repo/apps/web/public ./apps/web/public
USER node
EXPOSE 3000
CMD ["node", "apps/web/server.js"]

# ---------- one-off: prisma migrate deploy ----------
FROM builder AS migrate
RUN chown -R node:node /repo/packages/db
USER node
WORKDIR /repo/packages/db
CMD ["pnpm", "exec", "prisma", "migrate", "deploy"]
