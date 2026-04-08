# RUNBOOK.md

Operational guide for developing, testing, and deploying the Texas Combat Sports platform.

## Prerequisites

| Requirement | Details |
|-------------|---------|
| Node.js | v18+ (no `.nvmrc` or `.node-version` file exists; Next.js 14.2 requires Node 18.17+) |
| Package manager | npm (lockfile is `package-lock.json`) or pnpm (lockfile `pnpm-lock.yaml` also present) |
| MongoDB Atlas | A cluster with a database. Free tier works for development. |
| Stripe account | Test-mode keys for local development. Live keys for production. |
| Resend account | API key for sending transactional emails. |
| Cloudinary account | Cloud name, API key, and API secret for gallery features. |

## Local Setup

1. Clone the repo and install dependencies:

```bash
git clone <repo-url>
cd texas-combat-sports
npm install
```

2. Create `.env.local` at the repo root. Copy from `.env.example` and fill in real values. The app reads from `.env.local` first, falling back to `.env`.

3. Test your database connection:

```bash
npm run db:test-connection
```

4. (Optional) Seed the database with sample data:

```bash
npm run db:seed
```

5. (Optional) Set up a complete event with ticket tiers:

```bash
npm run db:setup-complete-event
```

## Running the App

### Development Server

```bash
npm run dev
```

Starts on `http://localhost:3000`. Hot reload is enabled. The MongoDB connection is cached globally to avoid connection leaks during hot reloads (see `lib/dbConnect.ts`).

### Production Build

```bash
npm run build
npm run start
```

Note: `next.config.mjs` ignores ESLint and TypeScript errors during build. This means the build will succeed even if there are type errors.

## Linting

```bash
npm run lint
```

Runs Next.js built-in ESLint configuration. There is no Prettier config or formatting command.

## Testing

There is no test framework (no Jest, Vitest, or Playwright). The `test:*` scripts are standalone verification scripts:

```bash
npm run test:tickets         # Generates a sample ticket PDF to verify pdf-lib and qrcode work
npm run test:order-id-qr     # Generates sample order IDs and QR codes to verify crypto-js works
```

These scripts use `tsx` to run TypeScript directly and load `.env.local` via dotenv.

## Database Scripts

All database scripts use `tsx` and load environment from `.env.local`:

```bash
npm run db:test-connection       # Verify MongoDB connectivity
npm run db:seed                  # Insert sample fighters and event data
npm run db:setup-complete-event  # Create a full event with ticket tiers
npm run db:helper                # General-purpose DB access (interactive)
```

The `db-helper.ts` file also exports a `db` object that can be imported in other scripts for programmatic database access.

## Stripe Webhook Testing

For local development, use the Stripe CLI to forward webhooks:

```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

This prints a webhook signing secret. Set it as `STRIPE_WEBHOOK_SECRET` in `.env.local`.

The webhook handler is at `app/api/webhooks/stripe/route.ts` and processes these events:
- `checkout.session.completed` -- creates transaction, deducts tickets, sends email, creates transfer
- `charge.refunded` -- marks transaction refunded, reverses transfer, restores ticket availability
- `checkout.session.expired`, `payment_intent.*`, `charge.dispute.*`, `charge.updated` -- logged only

## Feature Flags

Feature flags are hardcoded in `lib/feature-flags.ts` (not env-var driven). To toggle:

1. Edit `lib/feature-flags.ts`
2. Set `TICKET_SALES_ENABLED` or `FLASH_SALES_ENABLED` to `true` or `false`
3. Redeploy (or restart dev server)

When `TICKET_SALES_ENABLED` is false, the ticket purchase button shows a "Coming Soon" modal instead of navigating to checkout.

## Admin Access

The admin dashboard is at `/admin/dashboard`. To log in:

1. Navigate to `/admin/login`
2. Enter admin credentials
3. After login, you can manage events, fighters, fights, ticket tiers, flash sales, merchandise, videos, dolls, and transactions

To create an admin user programmatically:

```bash
npm run db:helper
# Then use UserService.createUser() with role: 'admin'
```

The ticket scanner is at `/admin/ticket-scan`. It uses the device camera to scan QR codes and marks tickets as used.

## Deployment (Vercel)

### How It Deploys

The repo is connected to Vercel via GitHub integration. Pushes to the main branch trigger automatic production deployments. Pull requests get preview deployments.

There is no `vercel.json`. Vercel auto-detects Next.js and uses default settings.

### Environment Variables

All env vars from `.env.example` must be set in the Vercel project settings (Settings > Environment Variables). Make sure to use production/live values:
- Stripe live keys (`sk_live_*`, `pk_live_*`)
- Production `STRIPE_WEBHOOK_SECRET` (from the Vercel-hosted webhook endpoint in Stripe dashboard)
- Production `MONGODB_URI` (ensure the Atlas cluster allows Vercel's IP range, or use `0.0.0.0/0`)
- Production `NEXT_PUBLIC_DOMAIN` (e.g., `https://texascombatsportsllc.com`)

### Validating a Deploy

1. Visit the deployment URL
2. Verify the homepage loads with event data
3. Check that the events page loads and displays ticket tiers
4. If ticket sales are enabled, verify the checkout flow reaches Stripe
5. Check the admin login at `/admin/login`
6. Check Vercel function logs for any startup errors (MongoDB connection failures are the most common)

### Rollback

Use the Vercel dashboard: Deployments > find the previous working deployment > Promote to Production.

## Common Issues and Fixes

### "MONGODB_URI environment variable not defined"

The app requires `MONGODB_URI` in `.env.local` for local dev or in Vercel env vars for production. Make sure the variable is set and the connection string is valid.

### MongoDB connection timeout

- Check that your IP is whitelisted in MongoDB Atlas (Network Access)
- For Vercel deploys, add `0.0.0.0/0` to allow all IPs (or use Vercel's IP list)
- Check that the database user credentials in the connection string are correct

### Stripe webhook signature verification failed

- For local dev: make sure you are using the signing secret printed by `stripe listen`, not the one from the Stripe dashboard
- For production: make sure `STRIPE_WEBHOOK_SECRET` matches the webhook endpoint configured in the Stripe dashboard

### Tickets not being emailed after purchase

- Check that `RESEND_API_KEY` is set
- Check Vercel function logs for the webhook handler -- email errors are logged but do not fail the webhook
- The from address (`tickets@texascombatsportsllc.com`) must be verified in Resend's domain settings

### Gallery images not loading

- Verify `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, and `CLOUDINARY_API_SECRET` are set
- Check that the Cloudinary account has an `events/` folder structure
- Gallery API responses are cached for 30 minutes; changes may take time to appear

### Build succeeds but types are broken

`next.config.mjs` has `ignoreBuildErrors: true` for both ESLint and TypeScript. The build will not fail on type errors. Run `npm run lint` and `npx tsc --noEmit` manually to catch issues.
