# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Texas Combat Sports — a Next.js 14 full-stack e-commerce platform for combat sport events. Handles event management, ticket sales (via Stripe), fighter profiles, merchandise, live streaming, and an admin dashboard with QR ticket scanning.

## Commands

```bash
npm run dev          # Local dev server (Next.js)
npm run build        # Production build
npm run lint         # ESLint
npm run db:seed      # Seed MongoDB database
npm run db:test-connection  # Test MongoDB connection
npm run test:tickets        # Test ticket PDF generation
npm run test:order-id-qr    # Test order ID & QR code generation
```

## Tech Stack

- **Framework:** Next.js 14.2 (App Router) with TypeScript
- **Database:** MongoDB Atlas with Mongoose ODM
- **Auth:** JWT (access token 15m + refresh token 7d in httpOnly cookie), bcryptjs, admin-only roles
- **Payments:** Stripe (checkout sessions, webhooks, service fee transfers)
- **UI:** Tailwind CSS, Radix UI primitives, Framer Motion
- **Data Fetching:** TanStack React Query v5
- **Forms:** React Hook Form + Zod validation
- **Email:** Resend service with PDF ticket attachments (pdf-lib + qrcode)
- **Images:** Cloudinary

## Architecture

### Directory Layout

- `app/` — Next.js App Router pages and API routes
- `app/api/` — REST API endpoints (auth, checkout, events, fighters, dolls, merch, videos, tickets, flash-sales, gallery, contact)
- `app/admin/` — Protected admin pages (dashboard, ticket-scan, login)
- `components/` — React components; `components/ui/` has 55+ Radix-based primitives
- `lib/models/` — Mongoose schemas (Event, Fighter, Fight, Transaction, TicketTier, FlashSale, Merch, Video, Doll, User)
- `lib/services/` — Business logic layer (one service per model)
- `lib/middleware/auth.ts` — JWT verification middleware
- `lib/dbConnect.ts` — MongoDB connection with global caching for hot reloads
- `contexts/` — React Context providers (auth, query client, current event)
- `hooks/use-queries.ts` — All TanStack Query hooks (~1000 lines); query keys follow `['resource', 'subresource', id]` pattern
- `hooks/use-ticket-purchase.ts` — Ticket purchase flow hook
- `types/` — TypeScript type definitions

### Key Patterns

- **API routes** return JSON with consistent error messages and HTTP status codes. Feature flags in `lib/feature-flags.ts` gate ticket sales and flash sales.
- **Service layer** in `lib/services/` encapsulates all database operations and business logic; API routes delegate to services.
- **Data fetching** uses TanStack Query hooks from `hooks/use-queries.ts` with query invalidation on mutations.
- **Auth flow:** Admin login → JWT issued → access token in Authorization header (Bearer) → refresh via httpOnly cookie. Protected API routes use `lib/middleware/auth.ts`.
- **Payment flow:** Create Stripe checkout session → redirect to Stripe → success page fetches transaction → email with PDF tickets containing QR codes.
- **Path alias:** `@/*` maps to project root.

### Environment Variables

See `.env.example` for the full list with descriptions. Key vars:

```
MONGODB_URI, JWT_SECRET, JWT_REFRESH_SECRET,
STRIPE_SECRET_KEY, NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY, STRIPE_WEBHOOK_SECRET, SERVICE_ACCOUNT_ID,
RESEND_API_KEY, RESEND_GENERAL_EMAIL, RESEND_FIGHT_EMAIL, RESEND_VENUE_EMAIL, RESEND_SPONSOR_EMAIL,
CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET,
NEXT_PUBLIC_DOMAIN
```

## Build Notes

- `next.config.mjs` ignores ESLint and TypeScript errors during build (legacy v0.dev compatibility).
- Image optimization is disabled (`unoptimized: true`); images served from Cloudinary.
- No test framework is configured. The `test:*` scripts are standalone verification scripts, not test suites.

## Further Documentation

- `ARCHITECTURE.md` -- data model, request flow, integration architecture
- `RUNBOOK.md` -- local setup, deployment, common issues
- `INTEGRATIONS.md` -- Stripe, Resend, Cloudinary, Vercel details with failure modes
