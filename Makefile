ifneq (,$(wildcard ./.env))
include .env
export
ENV_FILE_PARAM = --env-file .env
endif

ifneq (,$(wildcard ./.env.local))
include .env.local
export
endif

.PHONY: help install dev dev-stable build start clean lint test docker-build docker-up docker-down tunnel tunnel-frontend tunnel-url tunel-lt-fixed tunnel-ssh tunnel-ngrok tunnel-ngrok-fe
.DEFAULT_GOAL := help

# ─── Colors ───
CYAN    := \033[0;36m
GREEN   := \033[0;32m
YELLOW  := \033[0;33m
RED     := \033[0;31m
BOLD    := \033[1m
NC      := \033[0m

PNPM ?= pnpm.cmd
NGROK ?= $(PNPM) dlx --package ngrok@4 ngrok
NEXT_DEV_HOST ?= 0.0.0.0
NEXT_DEV_PORT ?= 3000
NEXT_DEV_MEMORY_MB ?= 3072
NEXT_DEV_ENV = NODE_OPTIONS=--max-old-space-size=$(NEXT_DEV_MEMORY_MB)

##@ Help

help: ## Display this help message
	@echo "$(BOLD)$(CYAN)━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━$(NC)"
	@echo "$(BOLD)$(CYAN)  FASHIONISTAR AI — Frontend Developer Commands$(NC)"
	@echo "$(CYAN)  Next.js 15 · TypeScript 5.8+ · Tailwind CSS v4 · Shadcn/ui$(NC)"
	@echo "$(BOLD)$(CYAN)━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━$(NC)"
	@echo ""
	@awk 'BEGIN {FS = ":.*##"; printf "Usage:\n  make $(CYAN)<target>$(NC)\n"} /^[a-zA-Z_0-9-]+:.*?##/ { printf "  $(CYAN)%-22s$(NC) %s\n", $$1, $$2 } /^##@/ { printf "\n$(YELLOW)%s$(NC)\n", substr($$0, 5) } ' $(MAKEFILE_LIST)

# ═══════════════════════════════════════════════════════════════
##@ Development
# ═══════════════════════════════════════════════════════════════

install: ## Install Node.js dependencies with pnpm
	@echo "$(CYAN)Installing dependencies with pnpm...$(NC)"
	pnpm install
	@echo "$(GREEN)✓ Dependencies installed$(NC)"

dev: ## Start Next.js development server (Turbopack — port 3000)
	@echo "$(CYAN)Starting Next.js dev server with Turbopack...$(NC)"
	@echo "$(YELLOW)  Node memory: $(NEXT_DEV_MEMORY_MB)MB$(NC)"
	@echo "$(YELLOW)  URL: http://localhost:$(NEXT_DEV_PORT)$(NC)"
	$(NEXT_DEV_ENV) $(PNPM) exec next dev --turbo --hostname $(NEXT_DEV_HOST) --port $(NEXT_DEV_PORT)

dev-stable: ## Start Next.js dev server without Turbopack (fallback for live QA)
	@echo "$(CYAN)Starting Next.js dev server without Turbopack...$(NC)"
	$(NEXT_DEV_ENV) $(PNPM) exec next dev --hostname $(NEXT_DEV_HOST) --port $(NEXT_DEV_PORT)

build: ## Build production bundle
	@echo "$(CYAN)Building for production...$(NC)"
	pnpm build
	@echo "$(GREEN)✓ Production build complete$(NC)"

start: ## Start production server (requires build first)
	@echo "$(CYAN)Starting production server...$(NC)"
	pnpm start

preview: build start ## Build + start production server locally

setup: install dev ## First-time setup → start dev server

# ═══════════════════════════════════════════════════════════════
##@ Code Quality
# ═══════════════════════════════════════════════════════════════

lint: ## Run ESLint
	@echo "$(CYAN)Running ESLint...$(NC)"
	pnpm lint
	@echo "$(GREEN)✓ Linting passed$(NC)"

lint-fix: ## Run ESLint with auto-fix
	@echo "$(CYAN)Running ESLint with auto-fix...$(NC)"
	pnpm lint:fix
	@echo "$(GREEN)✓ Lint issues fixed$(NC)"

type-check: ## Run TypeScript type checking
	@echo "$(CYAN)Running TypeScript type check...$(NC)"
	pnpm type-check
	@echo "$(GREEN)✓ Type check passed$(NC)"

format: ## Format code with Prettier
	@echo "$(CYAN)Formatting code...$(NC)"
	pnpm format
	@echo "$(GREEN)✓ Code formatted$(NC)"

format-check: ## Check formatting without writing changes
	pnpm format:check

quality: lint type-check format-check ## Run all quality checks (lint + types + format)
	@echo "$(GREEN)✓ All quality checks passed$(NC)"

# ═══════════════════════════════════════════════════════════════
##@ Testing
# ═══════════════════════════════════════════════════════════════

test: ## Run unit tests (Vitest)
	@echo "$(CYAN)Running unit tests...$(NC)"
	pnpm test
	@echo "$(GREEN)✓ Tests passed$(NC)"

test-watch: ## Run tests in watch mode
	pnpm test:watch

test-cov: ## Run tests with coverage report
	@echo "$(CYAN)Running tests with coverage...$(NC)"
	pnpm test:cov
	@echo "$(GREEN)✓ Coverage report generated$(NC)"

test-ui: ## Open Vitest UI dashboard
	pnpm test:ui

test-e2e: ## Run Playwright end-to-end tests
	@echo "$(CYAN)Running E2E tests...$(NC)"
	pnpm test:e2e
	@echo "$(GREEN)✓ E2E tests passed$(NC)"

test-e2e-ui: ## Run Playwright tests with headed browser
	pnpm test:e2e:ui

test-e2e-report: ## Show last Playwright test report
	pnpm test:e2e:report

test-e2e-install: ## Install Playwright browsers
	pnpm dlx playwright install --with-deps

test-stress: ## Run cURL stress tests (Pillar 1)
	@echo "$(CYAN)Running cURL stress tests...$(NC)"
	bash tests/stress/auth.stress.sh
	@echo "$(GREEN)✓ Stress tests complete$(NC)"

# ═══════════════════════════════════════════════════════════════
##@ Docker — Development
# ═══════════════════════════════════════════════════════════════

docker-dev-build: ## Build development Docker image
	@echo "$(CYAN)Building dev Docker image...$(NC)"
	docker build -t fashionista-frontend:dev -f Dockerfile.dev .
	@echo "$(GREEN)✓ Dev image built$(NC)"

docker-dev: ## Start development container with hot reload
	@echo "$(CYAN)Starting dev container...$(NC)"
	docker-compose -f docker-compose.dev.yml up
	@echo "$(GREEN)✓ Dev server at http://localhost:3000$(NC)"

docker-dev-d: ## Start development container (detached)
	docker-compose -f docker-compose.dev.yml up -d
	@echo "$(GREEN)✓ Dev server at http://localhost:3000$(NC)"

docker-dev-stop: ## Stop development container
	docker-compose -f docker-compose.dev.yml down

docker-dev-logs: ## Tail development container logs
	docker-compose -f docker-compose.dev.yml logs -f

docker-dev-shell: ## Open shell in development container
	docker exec -it fashionista-frontend-dev sh

# ═══════════════════════════════════════════════════════════════
##@ Docker — Production
# ═══════════════════════════════════════════════════════════════

docker-build: ## Build production Docker image
	@echo "$(CYAN)Building production Docker image...$(NC)"
	docker build -t fashionista-frontend:latest \
		--build-arg NEXT_PUBLIC_API_URL=$${NEXT_PUBLIC_API_URL:-http://localhost:8000} \
		-f Dockerfile .
	@echo "$(GREEN)✓ Production image built$(NC)"

docker-up: ## Start production container (detached)
	@echo "$(CYAN)Starting production container...$(NC)"
	docker-compose up -d
	@echo "$(GREEN)✓ Production at http://localhost:3000$(NC)"

docker-down: ## Stop production container
	docker-compose down

docker-restart: docker-down docker-up ## Restart production container

docker-logs: ## Tail production container logs
	docker-compose logs -f fashionista-frontend

docker-shell: ## Open shell in production container
	docker exec -it fashionista-frontend sh

# ═══════════════════════════════════════════════════════════════
##@ Docker — Maintenance
# ═══════════════════════════════════════════════════════════════

docker-clean: ## Remove all Docker containers and images
	@echo "$(YELLOW)Cleaning Docker containers and images...$(NC)"
	docker-compose down -v 2>/dev/null || true
	docker-compose -f docker-compose.dev.yml down -v 2>/dev/null || true
	docker rmi fashionista-frontend:latest fashionista-frontend:dev 2>/dev/null || true
	@echo "$(GREEN)✓ Docker cleaned$(NC)"

docker-stats: ## Show container resource usage
	docker stats fashionista-frontend

docker-inspect: ## Inspect production container
	docker inspect fashionista-frontend

# ═══════════════════════════════════════════════════════════════
##@ CI/CD Pipeline
# ═══════════════════════════════════════════════════════════════

ci: install quality build ## Run full CI pipeline (install → quality → build)
	@echo "$(GREEN)✓ CI pipeline passed$(NC)"

ci-test: install quality test build ## Run CI pipeline with tests
	@echo "$(GREEN)✓ CI pipeline with tests passed$(NC)"

ci-e2e: ci test-e2e ## Run CI pipeline with E2E tests
	@echo "$(GREEN)✓ Full CI + E2E pipeline passed$(NC)"

# ═══════════════════════════════════════════════════════════════
##@ Deployment
# ═══════════════════════════════════════════════════════════════

deploy-vercel: ## Deploy to Vercel (production)
	@echo "$(CYAN)Deploying to Vercel...$(NC)"
	npx vercel --prod
	@echo "$(GREEN)✓ Deployed to Vercel$(NC)"

deploy-vercel-preview: ## Deploy to Vercel (preview)
	@echo "$(CYAN)Deploying preview to Vercel...$(NC)"
	npx vercel
	@echo "$(GREEN)✓ Preview deployed$(NC)"

deploy-docker: docker-build docker-up ## Deploy via Docker
	@echo "$(GREEN)✓ Deployed via Docker$(NC)"

# ═══════════════════════════════════════════════════════════════
##@ Cleanup
# ═══════════════════════════════════════════════════════════════

clean: ## Clean build artifacts (.next, out)
	@echo "$(YELLOW)Cleaning build artifacts...$(NC)"
	rm -rf .next out .turbo
	@echo "$(GREEN)✓ Cleaned$(NC)"

clean-deps: ## Remove node_modules and pnpm lock
	@echo "$(YELLOW)Removing node_modules and lockfile...$(NC)"
	rm -rf node_modules pnpm-lock.yaml
	@echo "$(GREEN)✓ node_modules removed$(NC)"

clean-all: clean clean-deps docker-clean ## Nuclear clean (build + deps + Docker)
	@echo "$(GREEN)✓ Everything cleaned$(NC)"

# ═══════════════════════════════════════════════════════════════
##@ Environment
# ═══════════════════════════════════════════════════════════════

env-setup: ## Create .env.local from .env.example (safe — won't overwrite)
	@if [ ! -f .env.local ]; then \
		cp .env.example .env.local 2>/dev/null || echo "NEXT_PUBLIC_API_V1_URL=http://localhost:8000/api" > .env.local; \
		echo "$(GREEN)✓ Created .env.local — edit with your values$(NC)"; \
	else \
		echo "$(YELLOW)⚠ .env.local already exists$(NC)"; \
	fi

tunnel: ## 🌐 ⭐ PRIMARY — localtunnel on port 3000 (free, no auth conflict with backend ngrok)
	@echo "$(CYAN)╔════════════════════════════════════════════════════════════╗$(NC)"
	@echo "$(CYAN)  FASHIONISTAR FRONTEND — Secure Public Tunnel               $(NC)"
	@echo "$(CYAN)╚════════════════════════════════════════════════════════════╝$(NC)"
	@echo ""
	@echo "$(YELLOW)Using: localtunnel (free, IPv4 fix, no ngrok conflict)$(NC)"
	@echo "$(YELLOW)URL  : https://fashionistar-fe.loca.lt$(NC)"
	@echo "$(YELLOW)Tip  : If subdomain taken, a random URL will be assigned.$(NC)"
	@echo ""
	pnpm dlx localtunnel --port 3000 --subdomain fashionistar-fe --local-host 127.0.0.1

tunel-lt-fixed: ## 🌐 Fallback: localtunnel with IPv4 fix (-l 127.0.0.1)
	@echo "$(CYAN)Starting localtunnel (IPv4 fix) for frontend on port 3000...$(NC)"
	@echo "$(YELLOW)URL: https://fashionistar-frontend.loca.lt$(NC)"
	pnpm dlx localtunnel --port 3000 --subdomain fashionistar-frontend --local-host 127.0.0.1

tunnel-ssh: ## 🌐 Zero-install tunnel via localhost.run (SSH — requires SSH)
	@echo "$(CYAN)Starting localhost.run SSH tunnel on port 3000...$(NC)"
	@echo "$(YELLOW)No install needed. URL will be printed below.$(NC)"
	ssh -o StrictHostKeyChecking=no -o ServerAliveInterval=60 -R 80:localhost:3000 localhost.run

tunnel-frontend: ## 🌐 localtunnel frontend (zero-install, no ngrok conflict — Windows-safe)
	@echo "$(CYAN)╔════════════════════════════════════════════════════════════╗$(NC)"
	@echo "$(CYAN)  FASHIONISTAR TUNNEL — localtunnel Frontend (port 3000)     $(NC)"
	@echo "$(CYAN)╚════════════════════════════════════════════════════════════╝$(NC)"
	@echo ""
	@echo "$(YELLOW)Strategy: localtunnel via pnpm dlx (no install needed, Windows-safe)$(NC)"
	@echo "$(YELLOW)URL will appear below after startup. Copy it to .env.local$(NC)"
	@echo ""
	pnpm dlx localtunnel --port 3000 --subdomain fashionistar-fe --local-host 127.0.0.1

tunnel-ngrok: ## 🌐 ngrok (global token, use only when backend ngrok is stopped)
	@echo "$(YELLOW)⚠ WARNING: Free ngrok only supports 1 tunnel at a time.$(NC)"
	@echo "$(YELLOW)  Stop backend ngrok first, or use 'make tunnel' instead.$(NC)"
	@echo ""
	$(NGROK) http 3000

tunnel-ngrok-fe: ## 🌐 Dedicated frontend ngrok tunnel via ngrok-frontend.yml
	@echo "$(CYAN)Starting dedicated frontend ngrok tunnel on port 3000...$(NC)"
	@echo "$(YELLOW)Using project-local ngrok via pnpm dlx and the token from .env.local$(NC)"
	@test -n "$(NGROK_FRONTEND_TOKEN)" || (echo "$(RED)NGROK_FRONTEND_TOKEN is missing from .env.local$(NC)" && exit 1)
	$(NGROK) config check --config ngrok-frontend.yml
	$(NGROK) start fashionista-frontend --config ngrok-frontend.yml --authtoken "$(NGROK_FRONTEND_TOKEN)"

tunnel-url: ## 🔍 Print active tunnel URLs (ngrok inspector)
	@echo "$(CYAN)Active ngrok tunnels:$(NC)"
	@curl -s http://127.0.0.1:4040/api/tunnels 2>/dev/null | \
		python3 -c "import sys,json; d=json.load(sys.stdin); [print('  ✔ ' + t['public_url'] + ' → ' + t['config']['addr']) for t in d.get('tunnels',[])]" \
		|| echo "$(YELLOW) ngrok not running. Try: make tunnel (uses localtunnel)$(NC)"

playwright-install: ## Install Playwright browsers
	@echo "$(CYAN)Installing Playwright browsers...$(NC)"
	pnpm dlx playwright install --with-deps
	@echo "$(GREEN)✓ Playwright browsers installed$(NC)"

env-check: ## Display current environment configuration
	@echo "$(CYAN)Environment variables:$(NC)"
	@if [ -f .env.local ]; then \
		grep -v '^\s*#' .env.local | grep -v '^\s*$$'; \
	else \
		echo "$(RED)✗ .env.local not found — run 'make env-setup'$(NC)"; \
	fi

# ═══════════════════════════════════════════════════════════════
##@ Backend Integration
# ═══════════════════════════════════════════════════════════════

backend-check: ## Check if backend API is running
	@echo "$(CYAN)Checking backend connection...$(NC)"
	@curl -sf http://localhost:8000/api/ > /dev/null 2>&1 && \
		echo "$(GREEN)✓ Backend is running at http://localhost:8000$(NC)" || \
		echo "$(RED)✗ Backend not available — run 'make dev' in fashionistar_backend/$(NC)"

full-stack: ## Display instructions for full-stack development
	@echo "$(BOLD)$(CYAN)━━━ Full-Stack Development ━━━$(NC)"
	@echo "  $(CYAN)Terminal 1 (Backend):$(NC)  cd ../fashionistar_backend && make dev"
	@echo "  $(CYAN)Terminal 2 (Frontend):$(NC) make dev"
	@echo "  $(CYAN)Terminal 3 (Workers):$(NC)  cd ../fashionistar_backend && make celery"
	@echo ""
	@echo "$(BOLD)  URLs:$(NC)"
	@echo "  $(CYAN)Frontend:$(NC)  http://localhost:3000"
	@echo "  $(CYAN)Backend:$(NC)   http://localhost:8000"
	@echo "  $(CYAN)Swagger:$(NC)   http://localhost:8000/swagger/"

# ═══════════════════════════════════════════════════════════════
##@ Project Information
# ═══════════════════════════════════════════════════════════════

info: ## Display project information
	@echo "$(BOLD)$(CYAN)━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━$(NC)"
	@echo "$(BOLD)  FASHIONISTAR AI — Frontend V8.0$(NC)"
	@echo "$(CYAN)━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━$(NC)"
	@echo "  Node:         $$(node --version 2>/dev/null || echo 'not installed')"
	@echo "  pnpm:         $$(pnpm --version 2>/dev/null || echo 'not installed')"
	@echo "  Framework:    Next.js 15.2+ (App Router + Turbopack)"
	@echo "  Language:     TypeScript 5.8+ (Strict Mode)"
	@echo "  Styling:      Tailwind CSS v3.4 + Shadcn/ui"
	@echo "  State:        Zustand v5 + TanStack Query v5 + Nuqs v2"
	@echo "  API Clients:  Axios (DRF Sync) + Ky (Ninja Async)"
	@echo "  Testing:      Vitest (Unit) + Playwright (E2E) + cURL Stress"
	@echo "  Tunnel:       cloudflared | localtunnel | localhost.run (SSH)"
	@echo "$(CYAN)━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━$(NC)"

deps: ## List installed packages (pnpm)
	pnpm list --depth=0

outdated: ## Check for outdated packages
	pnpm outdated

update: ## Update packages
	@echo "$(CYAN)Updating dependencies...$(NC)"
	pnpm update
	@echo "$(GREEN)✓ Dependencies updated$(NC)"

analyze: ## Analyze production bundle size
	@echo "$(CYAN)Analyzing bundle...$(NC)"
	ANALYZE=true pnpm build

# ═══════════════════════════════════════════════════════════════
##@ Quick Commands
# ═══════════════════════════════════════════════════════════════

quick-start: install dev ## 🚀 Install dependencies → start dev server

quick-prod: build docker-build docker-up ## 🐳 Build → Docker → deploy

full-reset: clean-all install dev ## 🔄 Nuclear reset → fresh start

lighthouse: ## 🔦 Run Lighthouse audit (requires Chrome)
	@echo "$(CYAN)Running Lighthouse audit...$(NC)"
	npx lighthouse http://localhost:3000 --output html --output-path ./lighthouse-report.html --chrome-flags="--headless" 2>/dev/null || echo "$(YELLOW)Start the dev server first: make dev$(NC)"
