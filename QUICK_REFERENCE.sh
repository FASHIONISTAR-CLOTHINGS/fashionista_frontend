#!/usr/bin/env bash

# 🚀 FASHIONISTAR FSD 2.0 - QUICK REFERENCE CARD
# Print or bookmark this for quick access!

cat << 'EOF'

╔════════════════════════════════════════════════════════════════════════════╗
║                                                                            ║
║          💎 FASHIONISTAR - FSD 2.0 QUICK REFERENCE CARD 💎                 ║
║                                                                            ║
║       Enterprise E-commerce Platform | Next.js 16.2.1 + Django 6.0        ║
║                                                                            ║
╚════════════════════════════════════════════════════════════════════════════╝

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 📁 DIRECTORY STRUCTURE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

src/
├── core/              Infrastructure (API, types, services)
├── components/        Reusable UI component library  
├── features/          10 business domains (auth, shop, orders, etc.)
├── lib/               Utilities (validation, formatting, http)
├── styles/            Global styles & Tailwind
└── app/               Next.js pages & routing (unchanged)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 📦 IMPORT EXAMPLES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// UI Components
import { Button, Modal, Card } from "@/components"
import { Navbar, Footer } from "@/components/shared/navigation"

// Features (Domain-specific)
import { SignUpForm } from "@/features/auth/components"
import { signUp, login } from "@/features/auth/api/actions"
import { useAddProductContext } from "@/features/shop/store/product-context"
import { OrdersTable } from "@/features/orders/components"

// Utilities
import { formatCurrency } from "@/lib/formatting"
import { cn } from "@/lib/utils"
import { validator } from "@/lib/validation"

// Core Infrastructure
import { axiosInstance } from "@/core/api/client.sync"
import { fetchWithAuth } from "@/core/api/middleware"
import { checkUserRole } from "@/core/utils/role"

// Types
import type { CardProps, OrderProp } from "@/core/types"

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 🎯 QUICK COMMANDS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Setup & Run:
  npm install --legacy-peer-deps    Install dependencies
  npm run dev                        Start dev server (http://localhost:3000)
  npm run build                      Build for production

Code Quality:
  npm run lint                       Run ESLint
  npm run type-check                 Check TypeScript
  npm run format                     Format with Prettier

Testing:
  npm run test                       Run Vitest unit tests
  npm run test:ui                    Run Vitest with UI
  npm run test:e2e                   Run Playwright tests

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 🏗️ FEATURE STRUCTURE (Follow This Pattern)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

When creating a new feature, use:
  src/features/[featureName]/
  ├── api/                  Server actions
  ├── components/           Feature UI components
  ├── hooks/                Custom hooks
  ├── store/                State management (Zustand/Context)
  ├── services/             Business logic
  ├── schemas/              Zod validation schemas
  ├── types/                TypeScript types
  ├── selectors/            Store/state selectors
  └── utils/                Utilities

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 🔌 API & BACKEND
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Backend URLs:
  Django REST Framework:    http://127.0.0.1:8000
  Frontend:                 http://localhost:3000

API Clients Setup (src/core/api/):
  client.sync.ts            Axios for DRF (15s timeout)
  middleware.ts             Token refresh, auth middleware
  client.async.ts           Ky for Ninja async APIs (60s timeout)

Example Usage:
  import { axiosInstance } from "@/core/api/client.sync"
  
  const response = await axiosInstance.post("/auth/sign-up", data)
  // Token refresh & cookie handling automatic on 401

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 🎨 STYLING
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Colors Available (Tailwind v4):
  Primary colors:      blue, purple, indigo
  Status:              success (green), warning (yellow), error (red), info
  Neutral:             gray (slate, stone)
  Usage:               bg-primary, text-success, border-warning-500

Classes Utility:
  Use cn() to merge conflicting Tailwind classes:
  import { cn } from "@/lib/utils"
  <div className={cn("px-2", isMobile && "px-0")} />

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 ✅ VALIDATION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Zod Schemas Available:
  Auth:           src/features/auth/schemas/auth_schema.ts
  Product:        src/features/shop/schemas/addProduct.ts
  Forms:          src/lib/validation/schemas.ts

Example:
  import { signupSchema } from "@/features/auth/schemas/auth_schema"
  import { validator } from "@/lib/validation"
  
  const errors = validator(formData, signupSchema)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 📊 STATE MANAGEMENT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Currently Available:
  React Context:         src/features/shop/store/product-context.tsx

Ready to Use (Install & integrate):
  Zustand:               For client state (recommended)
  React Query:           For server state & caching
  URL State (Nuqs):      For pagination, filters

Example Zustand (when ready):
  import { create } from "zustand"
  
  const useCartStore = create((set) => ({
    items: [],
    add: (item) => set((state) => ...),
  }))

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 🌐 INTERNATIONALIZATION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

i18next ready at: src/core/i18n/

Setup:
  1. Add translation JSON files: src/core/i18n/locales/{en,fr,es}/
  2. Initialize in your app wrapper
  3. Use: const { t } = useTranslation()

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 🐛 DEBUGGING & MONITORING
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Error Tracking:
  Sentry configured - errors automatically captured & reported

Performance:
  OpenTelemetry ready - trace requests & performance
  Turbopack enabled - ~400% faster builds than Webpack

Browser DevTools:
  React DevTools:    Inspect components, state
  Redux DevTools:    Monitor state if using Zustand
  Network tab:       Monitor API requests (see frontend → backend)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 📖 USEFUL FILES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

tsconfig.json                    TypeScript paths & settings
tailwind.config.ts               Tailwind CSS v4 configuration  
next.config.mjs                  Next.js config (Turbopack, PPR)
package.json                     Dependencies & scripts
.env.example                     Environment variables template

Documentation:
MIGRATION_COMPLETE.md            Full migration details
MIGRATION_EXECUTIVE_SUMMARY.md   High-level overview
SETUP_GUIDE.sh                   Setup instructions
THIS FILE                        Quick reference

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 ❤️ SUPPORT & TIPS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✅ ALWAYS follow the FSD 2.0 pattern when adding features
✅ Use barrel exports (index.ts) for clean imports
✅ Keep features independent - don't import from other features
✅ Put business logic in services/ folder
✅ Validate input with Zod schemas
✅ Use TypeScript for type safety
✅ Test as you go (Vitest for units, Playwright for E2E)

❌ DON'T import from src/app/* - use imports from new structure
❌ DON'T create new utilities outside src/lib/
❌ DON'T mix concerns - keep layers separate
❌ DON'T forget to export from index.ts files

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

                   🚀 Ready to build something amazing?
                      Start with: npm run dev

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

EOF
