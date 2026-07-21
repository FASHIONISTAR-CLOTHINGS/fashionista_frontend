FROM node:24-alpine AS base

ENV PNPM_HOME="/pnpm" \
    PATH="/pnpm:$PATH" \
    NEXT_TELEMETRY_DISABLED=1

RUN corepack enable

FROM base AS deps

WORKDIR /app

COPY package.json pnpm-lock.yaml .npmrc ./

RUN pnpm fetch --frozen-lockfile

FROM base AS builder

WORKDIR /app

COPY --from=deps /pnpm /pnpm
COPY --from=deps /app/package.json /app/pnpm-lock.yaml /app/.npmrc ./
RUN pnpm install --frozen-lockfile --offline

COPY . .

ARG NEXT_PUBLIC_BACKEND_URL=https://fashionistar-fashionistar-api-v1.hf.space
ARG NEXT_PUBLIC_API_V1_URL=https://fashionistar-fashionistar-api-v1.hf.space/api
ARG NEXT_PUBLIC_API_NINJA_URL=https://fashionistar-fashionistar-api-v1.hf.space/api/v1/ninja
ARG BACKEND_INTERNAL_URL=https://fashionistar-fashionistar-api-v1.hf.space
ARG NEXT_PUBLIC_APP_URL=https://fashionistar-fashionistar-frontend.hf.space
ARG NEXT_PUBLIC_APP_NAME=FASHIONISTAR_AI
ARG NEXT_PUBLIC_GOOGLE_CLIENT_ID=173651651078-9i9odkm33sc6dq7ukoicd91nlcjerqtv.apps.googleusercontent.com

ENV NODE_ENV=production \
    NEXT_PUBLIC_BACKEND_URL=${NEXT_PUBLIC_BACKEND_URL} \
    NEXT_PUBLIC_API_V1_URL=${NEXT_PUBLIC_API_V1_URL} \
    NEXT_PUBLIC_API_NINJA_URL=${NEXT_PUBLIC_API_NINJA_URL} \
    BACKEND_INTERNAL_URL=${BACKEND_INTERNAL_URL} \
    NEXT_PUBLIC_APP_URL=${NEXT_PUBLIC_APP_URL} \
    NEXT_PUBLIC_APP_NAME=${NEXT_PUBLIC_APP_NAME} \
    NEXT_PUBLIC_GOOGLE_CLIENT_ID=${NEXT_PUBLIC_GOOGLE_CLIENT_ID}

RUN pnpm build

FROM node:24-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    PORT=7860 \
    HOSTNAME=0.0.0.0

# node:24-alpine already has user "node" with UID 1000 — HF Spaces requires UID 1000
COPY --from=builder /app/public ./public
COPY --from=builder --chown=node:node /app/.next/standalone ./
COPY --from=builder --chown=node:node /app/.next/static ./.next/static

USER node

EXPOSE 7860

HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
    CMD wget -q -O /dev/null "http://127.0.0.1:${PORT}/" || exit 1

CMD ["node", "server.js"]
