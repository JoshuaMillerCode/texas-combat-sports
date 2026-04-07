# ARCHITECTURE.md

Internal architecture reference for the Texas Combat Sports platform.

## Overview

Texas Combat Sports is a Next.js 14 full-stack application deployed on Vercel. It sells event tickets and merchandise for combat sport events in Texas. The app handles the full lifecycle: event creation, ticket tier configuration, Stripe checkout, PDF ticket generation with QR codes, email delivery via Resend, and day-of-event ticket scanning. An admin dashboard provides CRUD management for all entities. The codebase is a monolith -- there are no separate backend or frontend packages. All server logic lives in Next.js API routes. MongoDB Atlas is the sole datastore.

## Repo Map

```
app/                        Next.js App Router (pages + API routes)
  api/
    auth/                   Login, token refresh, logout
    checkout/               Stripe session creation + retrieval
    webhooks/stripe/        Stripe webhook handler (payment lifecycle)
    events/                 Event CRUD
    fighters/               Fighter CRUD
    fights/                 Fight CRUD
    ticket-tiers/           Ticket tier CRUD
    flash-sales/            Flash sale CRUD + per-tier lookup
    tickets/                Ticket download (PDF) + mark-as-used
    dolls/                  Doll CRUD
    merch/                  Merchandise CRUD
    videos/                 Video/streaming CRUD
    gallery/                Cloudinary image listing (events, random)
    images/                 Cloudinary image search with pagination
    contact/                Contact form (sends email via Resend)
  admin/                    Admin pages (login, dashboard, ticket-scan)
  checkout/                 Checkout success page
  events/                   Public event listing and detail pages
  fighters/                 Public fighter profiles
  dolls/                    Combat dolls catalog
  gallery/                  Photo gallery
  streaming/                Live streaming page

components/
  ui/                       55+ Radix UI primitives (button, dialog, tabs, etc.)
  adminDashboard/           Admin panel components
  home/                     Homepage sections
  events/                   Event display components
  dolls/                    Doll catalog components
  streaming/                Live stream and video components
  header.tsx, footer.tsx    Site-wide navigation and footer

lib/
  models/                   Mongoose schemas (see Data Model section)
  services/                 Business logic layer -- one static class per model
  middleware/auth.ts        JWT extraction, verification, admin guard
  dbConnect.ts              MongoDB connection with global cache for hot reloads
  stripe.ts                 Client-side Stripe loader + currency helpers
  feature-flags.ts          TICKET_SALES_ENABLED, FLASH_SALES_ENABLED
  utils/
    ticket-generator.ts     PDF ticket creation (pdf-lib + qrcode)
    order-id-generator.ts   Order ID and ticket number generation (CryptoJS)
  db-helper.ts              CLI tool for DB operations (seed, test-connection)

contexts/
  auth-context.tsx          Admin auth state (JWT in memory, refresh via cookie)
  query-context.tsx         TanStack React Query provider
  current-event-context.tsx Shared current event state

hooks/
  use-queries.ts            All TanStack Query hooks (~1000 lines)
  use-ticket-purchase.ts    Feature-flagged ticket purchase redirect
  use-toast.ts              Toast notifications
  use-mobile.tsx            Mobile viewport detection

types/
  stripe.ts                 Stripe-related TypeScript interfaces
```

## Runtime Architecture

### Request Flow

```
Browser
  |
  +--> Next.js page (React, client components)
  |      |
  |      +--> TanStack Query hook (hooks/use-queries.ts)
  |             |
  |             +--> fetch() to /api/* route
  |                    |
  |                    +--> (optional) auth middleware check
  |                    +--> Service class method (lib/services/*.ts)
  |                           |
  |                           +--> dbConnect() (cached Mongoose connection)
  |                           +--> Mongoose model operation
  |                           +--> Response JSON
```

All API routes follow the same pattern:
1. GET routes are public (no auth required)
2. POST/PUT/DELETE routes call `authenticateToken()` and `requireAdmin()` from `lib/middleware/auth.ts`
3. The route delegates to a service class, which calls `dbConnect()` before any DB operation
4. Responses are JSON with appropriate HTTP status codes

### Authentication Flow

```
POST /api/auth/login
  --> Validate credentials (bcryptjs compare)
  --> Issue access token (JWT, 15min expiry, in response body)
  --> Issue refresh token (JWT, 7d expiry, httpOnly cookie)

POST /api/auth/refresh
  --> Read refresh token from cookie
  --> Verify with JWT_REFRESH_SECRET
  --> Issue new access token
  --> Rotate refresh token

Client-side:
  --> auth-context.tsx stores access token in React state
  --> Attaches Bearer token to API requests via Authorization header
  --> Refresh logic runs on 401 responses
```

### Checkout and Ticket Flow

```
1. User selects tickets on event page
2. POST /api/checkout
     --> Validate ticket availability (TicketTierService)
     --> Check for active flash sales (FlashSaleService)
     --> Create Stripe checkout session with metadata
     --> Return session URL
3. User pays on Stripe-hosted checkout
4. Stripe sends webhook to POST /api/webhooks/stripe
     --> checkout.session.completed:
         a. Deduplicate by stripeSessionId (unique index)
         b. Create Transaction record with generated orderId
         c. Deduct ticket availability from TicketTier
         d. Generate PDF tickets with QR codes (ticket-generator.ts)
         e. Email tickets via Resend (email.service.ts)
         f. Create 4% service fee transfer (transfer.service.ts)
     --> charge.refunded:
         a. Update transaction status to "refunded"
         b. Reverse service fee transfer
         c. Restore ticket availability
5. User lands on /checkout/success
     --> Fetches transaction, displays summary
     --> Download button re-generates tickets via /api/tickets/[orderId]/download
```

### QR Code Data

Each ticket's QR code encodes:
```json
{
  "ticketNumber": "TXCS-20241215-A1B2C3D4E5F6",
  "transactionId": "<MongoDB ObjectId>",
  "timestamp": "<ISO 8601>"
}
```

Scanned at the event via `/admin/ticket-scan` using html5-qrcode. The scan calls `POST /api/tickets/use/[transactionId]/[ticketNumber]` to mark the ticket as used.

## Data Model

All models use Mongoose with `timestamps: true` unless noted.

### Event
- `slug` (unique), `title`, `subtitle`, `date`, `venue`, `address`, `city`, `capacity`
- `posterImage`, `heroVideo` (URLs)
- `fights` --> array of ObjectId refs to Fight
- `ticketTiers` --> array of ObjectId refs to TicketTier
- `mainEventFight` --> ObjectId ref to Fight
- `isActive`, `isPastEvent` flags

### TicketTier
- `name`, `description`, `price` (cents), `stripePriceId`
- `maxQuantity`, `availableQuantity`
- `features` (string array), `sortOrder`, `isActive`
- Referenced by Event.ticketTiers

### Transaction
- `type`: "event_tickets" | "merchandise" | "mixed"
- `orderId` (unique, format: `ORD-YYYYMMDD-HEX12`)
- `event` --> ObjectId ref to Event
- `ticketItems[]`: each has `ticketTier` ref, `tierName`, `quantity`, `price`, nested `tickets[]` with `ticketNumber` (unique sparse), `isUsed`, `usedAt`
- `merchItems[]`: each has `merch` ref, `productName`, `selectedVariants[]`
- `stripeSessionId` (unique), `stripePaymentIntentId`
- `serviceAccountTransfer`: `{ transferId, amount, status, reversalId }`
- `customerDetails`: email, name, phone, address
- `summary`: totalItems, subtotal, taxes, fees, totalAmount (all cents), currency
- `status`: "pending" | "confirmed" | "cancelled" | "refunded"
- `shipping`: address, trackingNumber, shipping status (for merch)
- Pre-save hook auto-generates ticket numbers

### Fighter
- `name`, `nickname`, `age`, `weight`, `height`, `reach`, `hometown`
- `record` (string), `achievements[]`, `stats` (knockouts, submissions, decisions, winStreak)
- `image`, `bio`

### Fight
- `fighter1`, `fighter2` --> ObjectId refs to Fighter
- `event` --> ObjectId ref to Event
- `weightClass`, `rounds`, `roundLength`
- `status`, `result`, `method`

### FlashSale
- `title`, `description`, `startAt`, `endAt`
- `targetTicketTypes[]` (ticket tier ID strings)
- `stripePriceId` (sale price), `originalStripePriceId`
- `isActive`
- Overlap detection prevents two active sales on the same tier at the same time

### Merch
- `productId` (unique), `name`, `description`, `price`, `stripePriceId`
- `images[]`, `category`, `variants[]` (name, options, required)
- `inventory`: { total, available, reserved, lowStockThreshold }
- Supports reserve/release/confirm inventory operations

### Video
- `title`, `description`, `videoUrl`, `thumbnailUrl`
- `isLiveEvent`, `scheduledStartTime`, `liveStreamUrl`
- `associatedEvent` --> ObjectId ref to Event
- `viewCount`, `isPublic`
- Indexes on isLiveEvent, associatedEvent, scheduledStartTime

### Doll
- `name`, `description`, `image`, `price`, `quantity`

### User (admin only)
- `username` (unique), `email` (unique), `password` (bcrypt hashed)
- `role` (default "admin"), `isActive`, `lastLogin`
- `refreshToken` (stored for session management)
- Pre-save hook hashes password on change

## Integration Architecture

### Stripe
- **Client library**: `@stripe/stripe-js` for frontend redirect, `stripe` (Node) for server operations
- **Checkout**: Stripe-hosted checkout page with `allow_promotion_codes: true`
- **Webhooks**: `POST /api/webhooks/stripe` with signature verification via `STRIPE_WEBHOOK_SECRET`
- **Transfers**: 4% service fee to `SERVICE_ACCOUNT_ID` using `source_transaction` linking
- **Refunds**: Handled via `charge.refunded` webhook, reverses transfers and restores inventory
- **Idempotency**: Database-level via unique `stripeSessionId` index on Transaction. No Stripe-level idempotency keys used.
- **Flash sales**: Use separate Stripe Price IDs. Active sale price replaces regular price at checkout time.

### Resend (Email)
- Sends ticket confirmation emails with PDF attachments after successful payment
- Sends contact form submissions to category-specific inboxes (general, fight, venue, sponsor)
- From address: `tickets@texascombatsportsllc.com`
- No retry logic. Fallback: if attachment email fails, sends a simpler confirmation without PDFs.

### Cloudinary
- Used for event photo galleries. No SDK installed. Uses REST API directly with Basic auth.
- Three API routes query Cloudinary: `/api/gallery/events`, `/api/gallery/random-images`, `/api/images`
- Image optimization via URL transforms (f_auto, q_auto, c_fill)
- Responses cached with `Cache-Control` and `next: { revalidate: 1800 }` (30 minutes)

### Vercel
- Deployed via GitHub integration. No `vercel.json` present.
- Uses `@vercel/analytics` for page view tracking.
- `next.config.mjs` ignores ESLint and TypeScript build errors.
- Image optimization disabled (`unoptimized: true`).

### YouTube
- Embedded via iframe for live streaming (no API integration, just URL references)
- Channel links in header and footer

## Feature Flags

Defined in `lib/feature-flags.ts` as a plain object (not env-var driven):

| Flag | Purpose |
|------|---------|
| `TICKET_SALES_ENABLED` | When false, ticket purchase buttons show "Coming Soon" modal instead of checkout |
| `FLASH_SALES_ENABLED` | When false, flash sale price overrides are skipped during checkout |

## Assumptions and Unknowns

- **No test framework** is configured (no Jest, Vitest, Playwright, etc.). The `test:*` npm scripts are standalone TypeScript scripts run via `tsx`, not test suites.
- **No rate limiting** on any API route.
- **No Next.js middleware** (`middleware.ts`) exists. Auth checks happen inside each API route handler.
- **Promo deal logic** in the webhook has a special case: each "Promo Deal" purchase deducts from both the promo tier and 3x from the General Admission tier. The naming is hardcoded to look for "General Admission" tier by name.
- **The `.env` file is committed to the repo** and contains test-mode Stripe keys. The `.env.local` file (gitignored) contains the active credentials.
- It is unknown whether the organizer's Stripe account (`ORGANIZER_STRIPE_ACCOUNT_ID` in `.env.local`) is still used or if it has been fully replaced by `SERVICE_ACCOUNT_ID`. The codebase only references `SERVICE_ACCOUNT_ID`, but `.env.local` still defines `ORGANIZER_STRIPE_ACCOUNT_ID`.
