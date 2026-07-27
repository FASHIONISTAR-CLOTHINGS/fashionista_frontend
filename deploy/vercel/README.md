# Vercel Deployment — FASHIONISTAR Frontend

## Quick Start

### 1. Link the project (one-time)

```bash
cd fashionista_frontend
vercel link
```

Save the `orgId` and `projectId` from `.vercel/project.json` as GitHub Secrets:
- `VERCEL_ORG_ID`
- `VERCEL_PROJECT_ID`
- `VERCEL_TOKEN` (create at https://vercel.com/account/tokens)

### 2. Sync environment variables

```bash
cd deploy/vercel
bash sync-env-vars.sh
```

This reads `fashionistar_backend_production.env` and uploads every variable to Vercel's production environment.

### 3. Deploy manually

```bash
cd fashionista_frontend
vercel pull --yes --environment=production --token=$VERCEL_TOKEN
vercel build --prod --token=$VERCEL_TOKEN
vercel deploy --prebuilt --prod --token=$VERCEL_TOKEN
```

### 4. CI/CD (automatic)

Push to `main` triggers the GitHub Actions workflow automatically.
Pull requests trigger preview deployments.

## Files

| File | Purpose |
|------|---------|
| `Dockerfile` | Multi-stage production Dockerfile for CI build testing |
| `Dockerfile.dev` | Development Dockerfile with hot reload |
| `vercel.json` | Vercel project config (framework, build command, git integration) |
| `sync-env-vars.sh` | Bulk env var upload script |
| `env-vars-list.txt` | Reference list of all required env vars |

## Vercel Hobby Plan Limits

- 100 GB bandwidth/month
- 100 GB-hours build execution
- Automatic HTTPS + CDN
- Preview deployments
- Instant rollback

## Architecture

```
GitHub Push (main)
    ↓
GitHub Actions: Docker Build Test → Static Analysis → Vercel Deploy → Health Check
    ↓
Vercel Edge Network (126 PoPs)
    ↓
https://fashionistar.net
```
