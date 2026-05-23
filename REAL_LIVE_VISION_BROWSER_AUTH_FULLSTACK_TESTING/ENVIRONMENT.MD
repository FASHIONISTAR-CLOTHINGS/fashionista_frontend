# ENVIRONMENT — FASHIONISTAR Live Browser Testing

**Date:** 2026-05-22  
**Wave:** Auth B3  

## Runtime Services

| Service | Port | URL | Status |
|---------|------|-----|--------|
| Django ASGI (Uvicorn) | 8001 | http://localhost:8001 | ✅ RUNNING |
| Next.js Dev Server | 3000 | http://localhost:3000 | ✅ RUNNING |
| ngrok frontend tunnel | — | https://aeration-scabby-navy.ngrok-free.dev | ✅ ACTIVE |
| ngrok backend tunnel | — | https://hydrographically-tawdrier-hayley.ngrok-free.dev | ✅ ACTIVE |
| Celery Worker | — | Redis broker | Status: TBD |

## Canonical Test URLs

- **Frontend (PRIMARY):** `https://aeration-scabby-navy.ngrok-free.dev/`
- **Backend (API):** `https://hydrographically-tawdrier-hayley.ngrok-free.dev/`
- **Admin Panel:** `https://aeration-scabby-navy.ngrok-free.dev/api/admin/`

## Tech Stack

| Component | Version |
|-----------|---------|
| Next.js | 16.2.1 |
| Django | 6.0 LTS |
| Python | 3.12+ |
| Node.js | 20+ |
| TypeScript | 5.6.3 |
| React | 19.1.0 |

## Browser Testing Tools

| Tool | Purpose |
|------|---------|
| chrome-devtools-mcp | Real Chrome: screenshots, network inspection, console logs |
| Playwright | Automated E2E, video recording, trace archives |

## Key Auth Pages Under Test

| Page | Path | Role Guard |
|------|------|-----------|
| Choose Role | /auth/choose-role | Guest only |
| Sign Up | /auth/sign-up | Guest only |
| Sign In | /auth/sign-in | Guest only |
| OTP Verify | /auth/verify-otp | Guest only |
| Forgot Password | /auth/forgot-password | Guest only |
| Client Dashboard | /client/dashboard | Client only |
| Vendor Dashboard | /vendor/dashboard | Vendor only |
| Vendor Setup | /vendor/setup | Vendor (no profile) only |
| Admin Dashboard | /admin-dashboard | Admin/Staff only |
| Cart | /cart | Client only |
| Checkout | /cart/checkout | Client only |
| Wishlist | /wishlist | Client only |
