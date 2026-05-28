FROM node:20-alpine AS base

ENV PNPM_HOME="/pnpm" \
    PATH="/pnpm:$PATH" \
    NEXT_TELEMETRY_DISABLED=1

RUN corepack enable

FROM base AS deps

WORKDIR /app

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml .npmrc ./

RUN pnpm fetch --frozen-lockfile

FROM base AS builder

WORKDIR /app

COPY --from=deps /pnpm /pnpm
COPY --from=deps /app/package.json /app/pnpm-lock.yaml /app/pnpm-workspace.yaml /app/.npmrc ./
RUN pnpm install --frozen-lockfile --offline

COPY . .

ARG NEXT_PUBLIC_BACKEND_URL=https://fashionistar-backend-259415881346.europe-west1.run.app
ARG NEXT_PUBLIC_API_V1_URL=https://fashionistar-backend-259415881346.europe-west1.run.app/api
ARG NEXT_PUBLIC_API_NINJA_URL=https://fashionistar-backend-259415881346.europe-west1.run.app/api/v1/ninja
ARG BACKEND_INTERNAL_URL=https://fashionistar-backend-259415881346.europe-west1.run.app
ARG NEXT_PUBLIC_APP_URL=https://fashionistar-frontend-259415881346.europe-west1.run.app
ARG NEXT_PUBLIC_APP_NAME=FASHIONISTAR
ARG NEXT_PUBLIC_GOOGLE_CLIENT_ID=

ENV NODE_ENV=production \
    NEXT_PUBLIC_BACKEND_URL=${NEXT_PUBLIC_BACKEND_URL} \
    NEXT_PUBLIC_API_V1_URL=${NEXT_PUBLIC_API_V1_URL} \
    NEXT_PUBLIC_API_NINJA_URL=${NEXT_PUBLIC_API_NINJA_URL} \
    BACKEND_INTERNAL_URL=${BACKEND_INTERNAL_URL} \
    NEXT_PUBLIC_APP_URL=${NEXT_PUBLIC_APP_URL} \
    NEXT_PUBLIC_APP_NAME=${NEXT_PUBLIC_APP_NAME} \
    NEXT_PUBLIC_GOOGLE_CLIENT_ID=${NEXT_PUBLIC_GOOGLE_CLIENT_ID}

RUN pnpm build

FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    PORT=3000 \
    HOSTNAME=0.0.0.0

RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 --ingroup nodejs nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
    CMD wget -q -O /dev/null "http://127.0.0.1:${PORT}/" || exit 1

CMD ["node", "server.js"]
