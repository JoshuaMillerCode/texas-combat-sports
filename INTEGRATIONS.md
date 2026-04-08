# INTEGRATIONS.md

Reference for all external service integrations in the Texas Combat Sports platform.

---

## Stripe

| Field | Details |
|-------|---------|
| **Purpose** | Payment processing for event tickets and merchandise |
| **SDK** | `stripe` (server, Node), `@stripe/stripe-js` (client, browser) |
| **API version** | `2025-06-30.basil` (set in each server-side Stripe instantiation) |
| **Configuration files** | `lib/stripe.ts` (client loader + currency helpers), `lib/services/transfer.service.ts`, `lib/services/flashSale.service.ts`, `app/api/checkout/route.ts`, `app/api/webhooks/stripe/route.ts` |
| **Env vars** | `STRIPE_SECRET_KEY`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`, `STRIPE_WEBHOOK_SECRET`, `SERVICE_ACCOUNT_ID` |

### Checkout Session

Created in `app/api/checkout/route.ts` via `stripe.checkout.sessions.create()`:
- Mode: `payment`
- Payment methods: `card` only
- Promotion codes: enabled (`allow_promotion_codes: true`)
- Session expiry: 30 minutes
- Billing address: required
- Shipping address: US only
- Phone collection: enabled
- Success URL: `/checkout/success?session_id={CHECKOUT_SESSION_ID}`
- Cancel URL: `/events/{eventId}?checkout=cancelled`

Line items reference Stripe Price IDs stored in the TicketTier and FlashSale models. Prices are verified by calling `stripe.prices.retrieve()` before session creation.

### Webhook Endpoint

| Field | Details |
|-------|---------|
| **Path** | `POST /api/webhooks/stripe` |
| **Signature verification** | Yes, via `stripe.webhooks.constructEvent()` |

**Events handled:**

| Event | Action |
|-------|--------|
| `checkout.session.completed` | Create Transaction record, deduct ticket availability, generate PDF tickets, email via Resend, create 4% service fee transfer |
| `charge.refunded` | Mark transaction as refunded, reverse service fee transfer, restore ticket availability |
| `checkout.session.expired` | Logged only (no ticket reservation to reverse) |
| `payment_intent.succeeded` | Logged only |
| `payment_intent.payment_failed` | Logged only |
| `payment_intent.canceled` | Logged only |
| `charge.dispute.created` | Logged only |
| `charge.dispute.closed` | Logged only |
| `charge.updated` | Logged only |

### Stripe Connect (Transfers)

Configured in `lib/services/transfer.service.ts`:
- 4% of order total is transferred to `SERVICE_ACCOUNT_ID` (developer's Stripe account)
- Uses `source_transaction` to link transfer to the original charge
- Transfer metadata includes: transactionId, paymentIntentId, serviceFeePercentage, originalAmount
- On refund: transfer is reversed via `stripe.transfers.createReversal()`, proportional to refund amount

### Idempotency Strategy

- **No Stripe-level idempotency keys** are used on API calls
- **Database-level deduplication**: Transaction model has a unique index on `stripeSessionId`. The webhook checks for existing transactions before creating new ones.
- Double-processing risk: If the unique index check and the insert race, MongoDB's unique constraint prevents duplicate records.

### Flash Sale Pricing

Configured in `lib/services/flashSale.service.ts`:
- Each flash sale stores a `stripePriceId` (sale price) and `originalStripePriceId` (regular price)
- At checkout, `getEffectiveStripePriceId()` returns the flash sale price if a sale is active for that tier
- Flash sale overlap detection prevents two sales on the same tier at the same time

### Failure Modes

| Symptom | Likely cause | Fix |
|---------|-------------|-----|
| Webhook returns 400 | Invalid signature | Check `STRIPE_WEBHOOK_SECRET` matches the endpoint. For local dev, use the secret from `stripe listen`. |
| Checkout session creation fails | Missing or invalid `STRIPE_SECRET_KEY` | Verify the key in `.env.local`. Check Stripe dashboard for key status. |
| Transfers fail with "destination account not found" | `SERVICE_ACCOUNT_ID` is not set or invalid | Verify the account ID format (`acct_*`) and that the account exists. |
| Flash sale price not applied | Feature flag `FLASH_SALES_ENABLED` is false, or sale is outside its time window | Check `lib/feature-flags.ts` and the flash sale's `startAt`/`endAt` in the database. |
| Duplicate transactions | Webhook retried by Stripe | Should be caught by unique index on `stripeSessionId`. Check MongoDB logs if duplicates appear. |

---

## Resend (Email)

| Field | Details |
|-------|---------|
| **Purpose** | Transactional email delivery (ticket confirmations, contact form) |
| **SDK** | `resend` (Node) |
| **Configuration files** | `lib/services/email.service.ts`, `app/api/contact/route.ts` |
| **Env vars** | `RESEND_API_KEY`, `RESEND_GENERAL_EMAIL`, `RESEND_FIGHT_EMAIL`, `RESEND_VENUE_EMAIL`, `RESEND_SPONSOR_EMAIL` |

### Email Types

| Email | Trigger | From address | Attachments |
|-------|---------|-------------|-------------|
| Ticket confirmation | Stripe `checkout.session.completed` webhook | `tickets@texascombatsportsllc.com` | PDF ticket files (one per ticket) |
| Simple confirmation (fallback) | Ticket confirmation email fails | `tickets@texascombatsportsllc.com` | None |
| Contact form | `POST /api/contact` | `Texas Combat Sports <onboarding@resend.dev>` (or configured domain) | None |

### Contact Form Routing

The contact form sends to different inboxes based on the `reason` field:
- General inquiry --> `RESEND_GENERAL_EMAIL`
- Fight-related --> `RESEND_FIGHT_EMAIL`
- Venue-related --> `RESEND_VENUE_EMAIL`
- Sponsorship --> `RESEND_SPONSOR_EMAIL`

### Templates

All email templates are inline HTML strings in `EmailService` methods. There are no external template files. Templates use inline CSS for email client compatibility.

### Failure Modes

| Symptom | Likely cause | Fix |
|---------|-------------|-----|
| Ticket emails not sent | `RESEND_API_KEY` missing or invalid | Check env var. Check Resend dashboard for API key status. |
| Emails rejected/bounced | From domain not verified in Resend | Verify `texascombatsportsllc.com` domain in Resend dashboard. |
| Ticket email fails but payment succeeds | PDF generation error or Resend API error | Check Vercel function logs. The webhook sends a simpler fallback email without attachments. Users can still download tickets from the success page. |
| Contact form emails not received | Recipient env vars not set | Check `RESEND_*_EMAIL` env vars are set to valid email addresses. |

---

## MongoDB Atlas

| Field | Details |
|-------|---------|
| **Purpose** | Primary datastore for all application data |
| **ODM** | Mongoose v8.16 |
| **Configuration files** | `lib/dbConnect.ts`, `lib/models/*.ts` |
| **Env vars** | `MONGODB_URI` |

### Connection Pattern

`lib/dbConnect.ts` uses a global variable to cache the Mongoose connection across hot reloads in development. `bufferCommands` is set to `false`. The connection is established lazily on first API call.

Outside of Next.js (e.g., CLI scripts), the file attempts to load `dotenv` from `.env.local`.

### Collections

| Model | Collection | Key indexes |
|-------|-----------|-------------|
| Event | events | slug (unique) |
| TicketTier | tickettiers | -- |
| Transaction | transactions | orderId (unique), stripeSessionId (unique), ticketItems.tickets.ticketNumber (unique, sparse) |
| Fighter | fighters | -- |
| Fight | fights | -- |
| FlashSale | flashsales | startAt+endAt (compound), targetTicketTypes, isActive, compound index on all four |
| Merch | merches | productId (unique) |
| Video | videos | isLiveEvent, associatedEvent, isPublic, scheduledStartTime, date, createdAt |
| Doll | dolls | -- |
| User | users | username (unique), email (unique) |

### Failure Modes

| Symptom | Likely cause | Fix |
|---------|-------------|-----|
| "MONGODB_URI environment variable not defined" | Env var missing | Set `MONGODB_URI` in `.env.local` or Vercel env vars |
| Connection timeout | IP not whitelisted in Atlas | Add your IP (or `0.0.0.0/0`) in Atlas Network Access |
| Authentication failed | Wrong credentials in connection string | Check username/password in `MONGODB_URI` |
| "buffering timed out" errors | Connection established but queries failing | Check Atlas cluster status. May indicate the cluster is paused (free tier) or under load. |

---

## Cloudinary

| Field | Details |
|-------|---------|
| **Purpose** | Event photo storage and gallery delivery |
| **SDK** | None (direct REST API calls with Basic auth) |
| **Configuration files** | `app/api/images/route.ts`, `app/api/gallery/events/route.ts`, `app/api/gallery/random-images/route.ts` |
| **Env vars** | `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` |

### API Usage

- **Search API** (`POST /v1_1/{cloud}/resources/search`): Used to find images in `events/*` folders
- **Folders API** (`GET /v1_1/{cloud}/folders/events`): Lists event photo folders
- **URL transforms**: Images are optimized via URL path rewriting (e.g., `/upload/f_auto,q_auto:eco,w_250,h_170,c_fill/`)

### Caching

- API responses use `next: { revalidate: 1800 }` (30-minute ISR cache)
- Response headers include `Cache-Control: public, max-age=1800, s-maxage=3600`

### Failure Modes

| Symptom | Likely cause | Fix |
|---------|-------------|-----|
| Gallery returns empty arrays | Cloudinary credentials wrong or no `events/` folder | Verify env vars. Check that images exist in Cloudinary under `events/` folder. |
| 401 from Cloudinary API | API key or secret incorrect | Regenerate credentials in Cloudinary dashboard. |
| Slow gallery load | Too many folders or images | The random-images endpoint limits to 15 images per folder. Check folder count. |

---

## Vercel

| Field | Details |
|-------|---------|
| **Purpose** | Hosting and deployment |
| **Configuration files** | `next.config.mjs` (no `vercel.json`) |
| **Env vars** | `NEXT_PUBLIC_DOMAIN` (used for Stripe redirect URLs) |

### Deployment

- Automatic deploys via GitHub integration on push to main
- Preview deployments on pull requests
- No custom build command; uses Next.js defaults (`next build`)
- Build ignores ESLint errors (`eslint.ignoreDuringBuilds: true`)
- Build ignores TypeScript errors (`typescript.ignoreBuildErrors: true`)

### Vercel Analytics

`@vercel/analytics` package is installed and imported in `app/layout.tsx`. Provides automatic page view tracking in the Vercel dashboard.

### Failure Modes

| Symptom | Likely cause | Fix |
|---------|-------------|-----|
| Deploy succeeds but app crashes | Missing env vars on Vercel | Check all required env vars are set in Vercel project settings. |
| Functions timeout | MongoDB connection slow or Stripe API slow | Check Atlas cluster region matches Vercel function region. Default function timeout is 10s. |
| `NEXT_PUBLIC_DOMAIN` wrong in checkout redirects | Env var not set or set to localhost | Set to production URL (e.g., `https://texascombatsportsllc.com`) in Vercel env vars. Fallback is `http://localhost:3000`. |

---

## YouTube (Embedded)

| Field | Details |
|-------|---------|
| **Purpose** | Live event streaming and fight recordings |
| **SDK** | None (iframe embeds only) |
| **Configuration files** | `components/streaming/live-stream-section.tsx`, `lib/models/Video.ts` |
| **Env vars** | None |

YouTube is used only via iframe embeds. Video URLs and live stream URLs are stored in the Video model and rendered in iframes. There is no YouTube Data API integration. Channel links appear in the header and footer.

---

## QR Code Libraries

| Field | Details |
|-------|---------|
| **Purpose** | Ticket generation (server) and ticket scanning (client) |
| **Libraries** | `qrcode` (server-side PNG generation), `html5-qrcode` (client-side camera scanning) |
| **Configuration files** | `lib/utils/ticket-generator.ts` (generation), `app/admin/ticket-scan/page.tsx` (scanning) |
| **Env vars** | None |

- Server: `qrcode` generates PNG QR codes encoded as base64, embedded into PDF tickets via pdf-lib
- Client: `html5-qrcode` provides camera-based QR scanning on the admin ticket scan page
- QR data format: JSON with `ticketNumber`, `transactionId`, and `timestamp`
