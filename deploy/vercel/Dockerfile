# =============================================================================
# FASHIONISTAR — Production Dockerfile for Vercel CI Build Testing
# =============================================================================
# Purpose:  Validate that the Next.js frontend builds successfully inside a
#           Docker container before deploying to Vercel via --prebuilt.
# Target:   GitHub Actions CI runner (ubuntu-latest)
# Runtime:  Node 24 + pnpm 10.33.0
# Output:   Next.js standalone build in /app/.next/standalone
#
# This Dockerfile mirrors the production build environment:
#   - Same Node/pnpm versions as package.json engines
#   - Same env vars as fashionistar_backend_production.env
#   - Multi-stage build for minimal final image
#   - Non-root user for security
#   - Health check on port 3000
# =============================================================================

# ── Stage 1: Base with pnpm ──────────────────────────────────────────────────
FROM node:24-alpine AS base

ENV PNPM_HOME="/pnpm" \
    PATH="/pnpm:$PATH" \
    NEXT_TELEMETRY_DISABLED=1

RUN corepack enable && corepack prepare pnpm@10.33.0 --activate

# ── Stage 2: Dependency installation ─────────────────────────────────────────
FROM base AS deps

WORKDIR /app

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml .npmrc ./

RUN pnpm fetch --frozen-lockfile

# ── Stage 3: Builder ─────────────────────────────────────────────────────────
FROM base AS builder

WORKDIR /app

COPY --from=deps /pnpm /pnpm
COPY --from=deps /app/package.json /app/pnpm-lock.yaml /app/pnpm-workspace.yaml /app/.npmrc ./
RUN pnpm install --frozen-lockfile --offline

COPY . .

# Build-time environment variables (from fashionistar_backend_production.env)
# These are passed as ARGs so they're available during next build
ARG NEXT_PUBLIC_BACKEND_URL=https://fashionistar-ai-fashionistar-api-v1.hf.space
ARG NEXT_PUBLIC_API_URL=https://fashionistar-ai-fashionistar-api-v1.hf.space
ARG NEXT_PUBLIC_API_V1_URL=https://fashionistar-ai-fashionistar-api-v1.hf.space/api
ARG NEXT_PUBLIC_API_V2_URL=https://fashionistar-ai-fashionistar-api-v1.hf.space/api/v1/ninja
ARG BACKEND_INTERNAL_URL=https://fashionistar-ai-fashionistar-api-v1.hf.space
ARG NEXT_PUBLIC_APP_URL=https://fashionistar.net
ARG NEXT_PUBLIC_APP_NAME="FASHIONISTAR AI"
ARG NEXT_PUBLIC_ENV=production
ARG NEXT_PUBLIC_ENVIRONMENT=production
ARG NEXT_PUBLIC_GOOGLE_CLIENT_ID=173651651078-9i9odkm33sc6dq7ukoicd91nlcjerqtv.apps.googleusercontent.com
ARG NEXT_PUBLIC_GOOGLE_ALLOWED_ORIGINS=https://fashionistar.net,https://fashionistar-frontend.vercel.app
ARG NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=dgpdlknc1
ARG NEXT_PUBLIC_CLOUDINARY_CLOUD=dgpdlknc1
ARG NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=fashionista_ai
ARG NEXTAUTH_URL=https://fashionistar.net
ARG NEXTAUTH_SECRET="G2oxf356NwuAsLzAxgnauVpVggpm3Hi6YD9wbex7nOAvOE8RwES6EwFpYpsRajcb"
ARG JWT_SECRET="oxdEUa1I--QvbVnEEBbzXiozHz-Os6A2D64xHjD9M4oeolx2vRP6aYhmtVuZrzZA"
ARG NEXT_PUBLIC_WS_URL=wss://fashionistar-ai-fashionistar-api-v1.hf.space
ARG NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key
ARG NEXT_PUBLIC_FEATURE_AI_MEASUREMENTS=true
ARG NEXT_PUBLIC_FEATURE_SOCIAL_LOGIN=true
ARG NEXT_PUBLIC_FEATURE_BETA_CHECKOUT=false
ARG NEXT_PUBLIC_FEATURE_DESKTOP_QR_GATEWAY=true
ARG NEXT_PUBLIC_MEDIAPIPE_WASM_URL=https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/wasm
ARG NEXT_PUBLIC_POSE_MODEL_URL=https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_full/float16/latest/pose_landmarker_full.task
ARG NEXT_PUBLIC_MEDIAPIPE_MODEL_URL=https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_full/float16/latest/pose_landmarker_full.task
ARG NEXT_PUBLIC_SCAN_QUALITY_THRESHOLD=0.85
ARG NEXT_PUBLIC_SCAN_STABILITY_FRAMES=30
ARG NEXT_PUBLIC_SCAN_COUNTDOWN_SECONDS=3
ARG NEXT_PUBLIC_SCAN_BASE_URL=https://fashionistar.net/scan
ARG NEXT_PUBLIC_QR_SESSION_EXPIRY_HOURS=24
ARG NEXT_PUBLIC_GOOGLE_ANALYTICS_ID=G_MEASUREMENT_ID
ARG NEXT_PUBLIC_OTEL_ENABLED=false
ARG NEXT_PUBLIC_OTEL_ENDPOINT=https://fashionistar-ai-fashionistar-api-v1.hf.space/otlp/v1/traces
ARG NEXT_PUBLIC_TELEMETRY_ENABLED=false
ARG NEXT_PUBLIC_VERBOSE_ERROR=false
ARG DEBUG_STORAGE=false
ARG NEXT_PUBLIC_DEFAULT_LOCALE=en
ARG NEXT_PUBLIC_SUPPORTED_LOCALES=en,fr,es,pt,ar
ARG NEXT_PUBLIC_FRONTEND_TUNNEL_URL=https://fashionistar.net
ARG NEXT_PUBLIC_VERSION=1.0.0
ARG SENTRY_DSN="https://d1f4dea7757d1689e46d16d347efb97c@o4511717534138368.ingest.de.sentry.io/4511717542264912"
ARG NEXT_PUBLIC_SENTRY_DSN="https://d1f4dea7757d1689e46d16d347efb97c@o4511717534138368.ingest.de.sentry.io/4511717542264912"
ARG SENTRY_ORG=fashionistar
ARG SENTRY_PROJECT=fashionistar-sentry
ARG SENTRY_AUTH_TOKEN=""
ARG FRONTEND_URL=https://fashionistar.net
ARG FRONTEND_TUNNEL_URL=https://fashionistar.net
ARG CORS_ALLOWED_ORIGINS=https://fashionistar.net,https://fashionistar-frontend.vercel.app
ARG INTERNAL_SERVICE_TOKEN=fashionistar-internal-telemetry-2026

ENV NODE_ENV=production \
    NEXT_PUBLIC_BACKEND_URL=${NEXT_PUBLIC_BACKEND_URL} \
    NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL} \
    NEXT_PUBLIC_API_V1_URL=${NEXT_PUBLIC_API_V1_URL} \
    NEXT_PUBLIC_API_V2_URL=${NEXT_PUBLIC_API_V2_URL} \
    BACKEND_INTERNAL_URL=${BACKEND_INTERNAL_URL} \
    NEXT_PUBLIC_APP_URL=${NEXT_PUBLIC_APP_URL} \
    NEXT_PUBLIC_APP_NAME=${NEXT_PUBLIC_APP_NAME} \
    NEXT_PUBLIC_ENV=${NEXT_PUBLIC_ENV} \
    NEXT_PUBLIC_ENVIRONMENT=${NEXT_PUBLIC_ENVIRONMENT} \
    NEXT_PUBLIC_GOOGLE_CLIENT_ID=${NEXT_PUBLIC_GOOGLE_CLIENT_ID} \
    NEXT_PUBLIC_GOOGLE_ALLOWED_ORIGINS=${NEXT_PUBLIC_GOOGLE_ALLOWED_ORIGINS} \
    NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=${NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME} \
    NEXT_PUBLIC_CLOUDINARY_CLOUD=${NEXT_PUBLIC_CLOUDINARY_CLOUD} \
    NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=${NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET} \
    NEXTAUTH_URL=${NEXTAUTH_URL} \
    NEXTAUTH_SECRET=${NEXTAUTH_SECRET} \
    JWT_SECRET=${JWT_SECRET} \
    NEXT_PUBLIC_WS_URL=${NEXT_PUBLIC_WS_URL} \
    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=${NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY} \
    NEXT_PUBLIC_FEATURE_AI_MEASUREMENTS=${NEXT_PUBLIC_FEATURE_AI_MEASUREMENTS} \
    NEXT_PUBLIC_FEATURE_SOCIAL_LOGIN=${NEXT_PUBLIC_FEATURE_SOCIAL_LOGIN} \
    NEXT_PUBLIC_FEATURE_BETA_CHECKOUT=${NEXT_PUBLIC_FEATURE_BETA_CHECKOUT} \
    NEXT_PUBLIC_FEATURE_DESKTOP_QR_GATEWAY=${NEXT_PUBLIC_FEATURE_DESKTOP_QR_GATEWAY} \
    NEXT_PUBLIC_MEDIAPIPE_WASM_URL=${NEXT_PUBLIC_MEDIAPIPE_WASM_URL} \
    NEXT_PUBLIC_POSE_MODEL_URL=${NEXT_PUBLIC_POSE_MODEL_URL} \
    NEXT_PUBLIC_MEDIAPIPE_MODEL_URL=${NEXT_PUBLIC_MEDIAPIPE_MODEL_URL} \
    NEXT_PUBLIC_SCAN_QUALITY_THRESHOLD=${NEXT_PUBLIC_SCAN_QUALITY_THRESHOLD} \
    NEXT_PUBLIC_SCAN_STABILITY_FRAMES=${NEXT_PUBLIC_SCAN_STABILITY_FRAMES} \
    NEXT_PUBLIC_SCAN_COUNTDOWN_SECONDS=${NEXT_PUBLIC_SCAN_COUNTDOWN_SECONDS} \
    NEXT_PUBLIC_SCAN_BASE_URL=${NEXT_PUBLIC_SCAN_BASE_URL} \
    NEXT_PUBLIC_QR_SESSION_EXPIRY_HOURS=${NEXT_PUBLIC_QR_SESSION_EXPIRY_HOURS} \
    NEXT_PUBLIC_GOOGLE_ANALYTICS_ID=${NEXT_PUBLIC_GOOGLE_ANALYTICS_ID} \
    NEXT_PUBLIC_OTEL_ENABLED=${NEXT_PUBLIC_OTEL_ENABLED} \
    NEXT_PUBLIC_OTEL_ENDPOINT=${NEXT_PUBLIC_OTEL_ENDPOINT} \
    NEXT_PUBLIC_TELEMETRY_ENABLED=${NEXT_PUBLIC_TELEMETRY_ENABLED} \
    NEXT_PUBLIC_VERBOSE_ERROR=${NEXT_PUBLIC_VERBOSE_ERROR} \
    DEBUG_STORAGE=${DEBUG_STORAGE} \
    NEXT_PUBLIC_DEFAULT_LOCALE=${NEXT_PUBLIC_DEFAULT_LOCALE} \
    NEXT_PUBLIC_SUPPORTED_LOCALES=${NEXT_PUBLIC_SUPPORTED_LOCALES} \
    NEXT_PUBLIC_FRONTEND_TUNNEL_URL=${NEXT_PUBLIC_FRONTEND_TUNNEL_URL} \
    NEXT_PUBLIC_VERSION=${NEXT_PUBLIC_VERSION} \
    SENTRY_DSN=${SENTRY_DSN} \
    NEXT_PUBLIC_SENTRY_DSN=${NEXT_PUBLIC_SENTRY_DSN} \
    SENTRY_ORG=${SENTRY_ORG} \
    SENTRY_PROJECT=${SENTRY_PROJECT} \
    SENTRY_AUTH_TOKEN=${SENTRY_AUTH_TOKEN} \
    FRONTEND_URL=${FRONTEND_URL} \
    FRONTEND_TUNNEL_URL=${FRONTEND_TUNNEL_URL} \
    CORS_ALLOWED_ORIGINS=${CORS_ALLOWED_ORIGINS} \
    INTERNAL_SERVICE_TOKEN=${INTERNAL_SERVICE_TOKEN}

RUN pnpm build

# ── Stage 4: Production runner ───────────────────────────────────────────────
FROM node:24-alpine AS runner

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
