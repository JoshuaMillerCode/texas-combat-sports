# Stripe Transfer Quick Start

## TL;DR

This system automatically transfers 4% of every successful payment to your developer Stripe account and reverses it on refunds.

## Setup in 5 Steps

### 1. Get Your Stripe Account ID

```bash
# Login to YOUR developer Stripe account
# Go to: Settings > Account details
# Copy your Account ID: acct_XXXXXXXXXXXXX
```

### 2. Add Environment Variables

```bash
# Add to .env.local
SERVICE_ACCOUNT_ID=acct_XXXXXXXXXXXXX  # Your account ID from step 1
STRIPE_SECRET_KEY=sk_test_...          # Client's Stripe secret key
STRIPE_WEBHOOK_SECRET=whsec_...        # From webhook setup (step 3)
```

### 3. Create Stripe Webhook

**In Client's Stripe Dashboard:**

1. Go to: **Developers** → **Webhooks** → **Add endpoint**
2. **URL**: `https://yourdomain.com/api/webhooks/stripe`
3. **Events**:
   - `checkout.session.completed`
   - `charge.refunded`
4. **Copy webhook secret** → Add to `STRIPE_WEBHOOK_SECRET`

### 4. Test Locally (Optional)

```bash
# Install Stripe CLI
brew install stripe/stripe-cli/stripe

# Login
stripe login

# Forward webhooks to localhost
stripe listen --forward-to localhost:3000/api/webhooks/stripe

# In another terminal, trigger test event
stripe trigger checkout.session.completed
```

### 5. Deploy and Verify

```bash
# Deploy your Next.js app
npm run build
npm run deploy  # or your deployment method

# Test with a real payment using test card
# Card: 4242 4242 4242 4242, any future date, any CVC

# Check transfer in YOUR Stripe Dashboard:
# Stripe Dashboard > Transfers
```

## How It Works

```
Customer Checkout ($100)
        ↓
[checkout.session.completed event]
        ↓
Webhook creates transfer
        ↓
Client gets: $96
You get: $4 ✅

Customer Refund ($50)
        ↓
[charge.refunded event]
        ↓
Webhook reverses 50% of transfer
        ↓
You return: $2 ✅
```

## Key Files

```
lib/services/transfer.service.ts     # Transfer logic
app/api/webhooks/stripe/route.ts     # Webhook handlers
lib/models/Transaction.ts            # Stores transfer info
```

## Common Issues & Fixes

| Issue                                 | Fix                                              |
| ------------------------------------- | ------------------------------------------------ |
| "Transfer failed: Insufficient funds" | Client needs balance in Stripe account           |
| "Destination account not found"       | Check `SERVICE_ACCOUNT_ID` is correct            |
| "Webhook signature failed"            | Verify `STRIPE_WEBHOOK_SECRET` matches dashboard |
| Transfer not showing                  | Ensure both accounts in same region (US/EU)      |

## Monitoring

**Check webhook logs:**

```bash
# In your application logs, look for:
"Creating service fee transfer for ticket order"
"Service fee transfer created: tr_XXXXX"
"Reversing service fee transfer"
"Service fee transfer reversed: trr_XXXXX"
```

**Check Stripe Dashboard:**

- Client's Dashboard: **Transfers** (outgoing)
- Your Dashboard: **Balance** → **Transfers** (incoming)

## Change Fee Percentage

Edit `lib/services/transfer.service.ts`:

```typescript
const SERVICE_FEE_PERCENTAGE = 4; // Change this to 5, 3, etc.
```

## Production Checklist

- [ ] Replace `SERVICE_ACCOUNT_ID` with **live** account ID
- [ ] Use client's **live** Stripe keys (not test)
- [ ] Create webhook in **live** mode
- [ ] Test with small real payment
- [ ] Verify transfer in live account
- [ ] Set up monitoring/alerts

## Need Help?

See detailed guide: [STRIPE_TRANSFER_SETUP.md](./STRIPE_TRANSFER_SETUP.md)

---

**Ready to go!** Just add the 3 environment variables and create the webhook endpoint. 🚀
