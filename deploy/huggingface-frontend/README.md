---
title: FASHIONISTAR Frontend
emoji: 🛍️
colorFrom: purple
colorTo: pink
sdk: docker
pinned: true
license: mit
app_port: 7860
short_description: FASHIONISTAR AI Fashion Platform — Next.js 16 Frontend
---

# 🛍️ FASHIONISTAR AI — Next.js Frontend

**Production Frontend for the FASHIONISTAR AI Fashion Platform**

## Architecture

This space runs the **Next.js 16.2.1 frontend** using:
- **React 19** Server/Client Components
- **TypeScript 5.6.3** strict mode
- **Tailwind CSS v4** + Shadcn/ui
- **Standalone output** mode (custom server)
- **Port 7860** (HF Spaces mandatory)

## Backend Connection

All API requests proxy to the backend HF Space:
```
https://fashionistar-fashionistar-api-v1.hf.space
```

## Companion Spaces

| Space | Role | Hardware |
|---|---|---|
| `fashionistar/fashionistar-frontend` | **This space** — Next.js Frontend | CPU |
| `fashionistar/fashionistar-api-v1` | Django ASGI API Gateway | CPU (16GB) |
| `fashionistar/fashionistar-celery-beat` | Task scheduler | CPU (16GB) |
| `fashionistar/fashionistar-celery-queues` | AI task workers | ZeroGPU |
| `fashionistar/fashionistar-ai-engine` | ML models (MediaPipe, SigLIP) | ZeroGPU |

## Health Check

```
GET https://fashionistar-fashionistar-frontend.hf.space/
```
