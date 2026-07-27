#!/usr/bin/env bash
# =============================================================================
# FASHIONISTAR — Vercel Environment Variables Sync Script
# =============================================================================
# Reads the unified production .env file and uploads every variable to Vercel.
#
# Usage:
#   bash deploy/vercel/sync-env-vars.sh [--env production|preview|development]
#
# Requirements:
#   - Vercel CLI installed: npm i -g vercel
#   - VERCEL_TOKEN set in environment or passed via --token
#   - Project linked: vercel link (creates .vercel/project.json)
#
# Source of truth:
#   ../../fashionistar_backend/fashionistar_backend_production.env
# =============================================================================

set -euo pipefail

# ── Configuration ────────────────────────────────────────────────────────────
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ENV_FILE="${SCRIPT_DIR}/../../fashionistar_backend/fashionistar_backend_production.env"
TARGET_ENV="production"
VERCEL_TOKEN="${VERCEL_TOKEN:-}"

# ── Parse arguments ──────────────────────────────────────────────────────────
while [[ $# -gt 0 ]]; do
  case "$1" in
    --env)
      TARGET_ENV="$2"
      shift 2
      ;;
    --token)
      VERCEL_TOKEN="$2"
      shift 2
      ;;
    --file)
      ENV_FILE="$2"
      shift 2
      ;;
    -h|--help)
      echo "Usage: bash sync-env-vars.sh [--env production|preview|development] [--token VERCEL_TOKEN] [--file PATH_TO_ENV]"
      exit 0
      ;;
    *)
      echo "Unknown option: $1"
      exit 1
      ;;
  esac
done

# ── Validate ─────────────────────────────────────────────────────────────────
if [ -z "$VERCEL_TOKEN" ]; then
  echo "ERROR: VERCEL_TOKEN is not set."
  echo "Set it with: export VERCEL_TOKEN=your_token"
  echo "Or pass it:  bash sync-env-vars.sh --token your_token"
  exit 1
fi

if [ ! -f "$ENV_FILE" ]; then
  echo "ERROR: Env file not found at: $ENV_FILE"
  exit 1
fi

if ! command -v vercel &> /dev/null; then
  echo "ERROR: Vercel CLI is not installed."
  echo "Install with: npm i -g vercel"
  exit 1
fi

# ── Counters ─────────────────────────────────────────────────────────────────
TOTAL=0
SUCCESS=0
SKIPPED=0
FAILED=0

echo "========================================"
echo "  FASHIONISTAR — Vercel Env Var Sync"
echo "========================================"
echo "  Env file:  $ENV_FILE"
echo "  Target:    $TARGET_ENV"
echo "  Token:     ${VERCEL_TOKEN:0:8}..."
echo "========================================"
echo ""

# ── Process each line ────────────────────────────────────────────────────────
while IFS= read -r line || [ -n "$line" ]; do
  # Skip empty lines
  [ -z "$line" ] && continue

  # Skip comments (lines starting with #)
  [[ "$line" =~ ^[[:space:]]*# ]] && continue

  # Skip section headers (lines starting with # ██ or # ──)
  [[ "$line" =~ ^[[:space:]]*# ]] && continue

  # Extract KEY and VALUE
  KEY="${line%%=*}"
  VALUE="${line#*=}"

  # Skip lines without = (malformed)
  [ "$KEY" = "$line" ] && continue

  # Trim whitespace from key
  KEY="$(echo "$KEY" | xargs)"

  # Skip empty keys
  [ -z "$KEY" ] && continue

  # Remove surrounding quotes from value
  VALUE="${VALUE#\"}"
  VALUE="${VALUE%\"}"
  VALUE="${VALUE#\'}"
  VALUE="${VALUE%\'}"

  # Skip placeholder tokens
  if [[ "$VALUE" == *"PLACEHOLDER"* ]]; then
    echo "  ⏭️  SKIPPED (placeholder): $KEY"
    SKIPPED=$((SKIPPED + 1))
    TOTAL=$((TOTAL + 1))
    continue
  fi

  # Skip empty values
  if [ -z "$VALUE" ]; then
    echo "  ⏭️  SKIPPED (empty): $KEY"
    SKIPPED=$((SKIPPED + 1))
    TOTAL=$((TOTAL + 1))
    continue
  fi

  TOTAL=$((TOTAL + 1))

  # Remove existing var (ignore errors if it doesn't exist)
  vercel env rm "$KEY" "$TARGET_ENV" --yes --token="$VERCEL_TOKEN" 2>/dev/null || true

  # Upload the variable
  echo "$VALUE" | vercel env add "$KEY" "$TARGET_ENV" --token="$VERCEL_TOKEN" 2>/dev/null

  if [ $? -eq 0 ]; then
    echo "  ✅ UPLOADED: $KEY"
    SUCCESS=$((SUCCESS + 1))
  else
    echo "  ❌ FAILED:   $KEY"
    FAILED=$((FAILED + 1))
  fi

done < "$ENV_FILE"

# ── Summary ──────────────────────────────────────────────────────────────────
echo ""
echo "========================================"
echo "  Sync Complete"
echo "========================================"
echo "  Total:    $TOTAL"
echo "  Success:  $SUCCESS"
echo "  Skipped:  $SKIPPED"
echo "  Failed:   $FAILED"
echo "========================================"

if [ "$FAILED" -gt 0 ]; then
  exit 1
fi
