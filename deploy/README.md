# FASHIONISTAR Frontend — Deployment Directory

This directory centralizes all deployment-related files for the FASHIONISTAR Next.js frontend.

## Structure

```
deploy/
├── vercel/           # Vercel deployment configuration
│   ├── Dockerfile              # Production Dockerfile (CI build testing)
│   ├── Dockerfile.dev          # Development Dockerfile
│   ├── vercel.json             # Vercel project configuration
│   ├── sync-env-vars.sh        # Script to sync all env vars to Vercel
│   ├── env-vars-list.txt       # Reference list of all env vars
│   └── README.md               # Vercel-specific deployment guide
├── docker/           # Docker auxiliary files
│   ├── docker-compose.ci.yml   # CI testing compose file
│   └── .dockerignore           # Docker ignore for CI builds
└── README.md         # This file
```

## Deployment Target

- **Platform**: Vercel (Hobby Plan)
- **Domain**: https://fashionistar.net
- **Framework**: Next.js 16.2.4 (standalone output)
- **Package Manager**: pnpm 10.33.0
- **Node Version**: 24

## CI/CD Workflow

The GitHub Actions workflow lives at:
`../../.github/workflows/deploy-vercel-frontend.yml`

It uses the `--prebuilt` pattern:
1. Docker build test (validates the Dockerfile builds successfully)
2. Static analysis (ESLint + TypeScript)
3. Vercel deploy (`vercel pull` → `vercel build --prod` → `vercel deploy --prebuilt --prod`)
4. Health check (curl production URL)

## Environment Variables

All environment variables are sourced from:
`../../fashionistar_backend/fashionistar_backend_production.env`

Use `vercel/sync-env-vars.sh` to upload all variables to Vercel programmatically.
