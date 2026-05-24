#!/bin/sh
# FASHIONISTAR Frontend Entrypoint Script
# Responsibilities:
#   1. Perform environment variable substitution
#   2. Validate nginx configuration
#   3. Start nginx server

set -e

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  FASHIONISTAR Frontend Entrypoint"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# ═══════════════════════════════════════════════════════════
# 1. Perform Environment Variable Substitution
# ═══════════════════════════════════════════════════════════

echo "⚙️  Preparing application configuration..."

# Create a temporary directory for substituted files
mkdir -p /tmp/nginx-configs

# Substitute environment variables in nginx config
envsubst '${API_BASE_URL}' < /etc/nginx/conf.d/default.conf > /tmp/nginx-configs/default.conf

# Copy back the substituted config
cp /tmp/nginx-configs/default.conf /etc/nginx/conf.d/default.conf

echo "✓ Environment variables substituted"

# ═══════════════════════════════════════════════════════════
# 2. Validate Nginx Configuration
# ═══════════════════════════════════════════════════════════

echo "✓ Testing nginx configuration..."

if nginx -t 2>&1 | grep -q "successful"; then
    echo "✓ Nginx configuration is valid"
else
    echo "✗ Nginx configuration error"
    nginx -t
    exit 1
fi

# ═══════════════════════════════════════════════════════════
# 3. Verify Files Are Present
# ═══════════════════════════════════════════════════════════

echo "📂 Verifying static files..."

if [ -d "/usr/share/nginx/html" ] && [ -n "$(ls -A /usr/share/nginx/html)" ]; then
    echo "✓ Static files found"
else
    echo "⚠️  No static files found in /usr/share/nginx/html"
    echo "   Creating placeholder..."
    mkdir -p /usr/share/nginx/html
    echo "FASHIONISTAR Frontend Container Ready" > /usr/share/nginx/html/index.html
fi

# ═══════════════════════════════════════════════════════════
# 4. Start Application
# ═══════════════════════════════════════════════════════════

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ Frontend initialization complete!"
echo "   Starting nginx server..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Execute the main process
exec "$@"
