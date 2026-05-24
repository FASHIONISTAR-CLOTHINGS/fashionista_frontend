# Multi-stage build for optimized production frontend image

# ═══════════════════════════════════════════════════════════
# Stage 1: Builder - Build Next.js application
# ═══════════════════════════════════════════════════════════
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY pnpm-lock.yaml* ./

# Install dependencies
RUN npm install -g pnpm && \
    pnpm install --frozen-lockfile

# Copy source code
COPY . .

# Build arguments for environment variables
ARG VITE_API_BASE_URL=http://localhost:8000/api/v1
ARG VITE_APP_NAME=FASHIONISTAR
ARG VITE_GOOGLE_CLIENT_ID=
ARG VITE_ENVIRONMENT=production

# Set environment variables for build
ENV VITE_API_BASE_URL=${VITE_API_BASE_URL}
ENV VITE_APP_NAME=${VITE_APP_NAME}
ENV VITE_GOOGLE_CLIENT_ID=${VITE_GOOGLE_CLIENT_ID}
ENV VITE_ENVIRONMENT=${VITE_ENVIRONMENT}
ENV NODE_ENV=production

# Build the application
RUN pnpm build && \
    pnpm prune --prod && \
    rm -rf .next/cache

# ═══════════════════════════════════════════════════════════
# Stage 2: Production - Nginx serving
# ═══════════════════════════════════════════════════════════
FROM nginx:1.27-alpine

# Install curl for health checks
RUN apk add --no-cache curl

# Create non-root user for nginx
RUN addgroup -g 1000 appuser && \
    adduser -D -u 1000 -G appuser appuser

# Copy custom nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Create required directories with correct permissions
RUN mkdir -p /app/static /app/media && \
    chown -R appuser:appuser /app /var/cache/nginx /var/log/nginx /var/run

# Copy built Next.js assets from builder stage
COPY --from=builder --chown=appuser:appuser /app/.next/static /usr/share/nginx/html/_next/static
COPY --from=builder --chown=appuser:appuser /app/public /usr/share/nginx/html

# Copy entrypoint script
COPY docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh

# Switch to non-root user
USER appuser

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD curl -f http://localhost:3000/ || exit 1

# Set entrypoint
ENTRYPOINT ["/docker-entrypoint.sh"]

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
