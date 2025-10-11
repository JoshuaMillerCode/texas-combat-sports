# Stripe Transfer Integration Setup Guide

This guide explains how to set up and use the Stripe Transfer integration that automatically transfers a 4% service fee from your client's Stripe account to your developer account on successful checkout, and reverses the transfer on refunds.

## ⚠️ Important: Transfer vs. Connect Approach

This implementation uses **Stripe Transfers** (simple post-payment transfers) instead of **Stripe Connect** (platform fees).

**What was removed from checkout:**

- ❌ `application_fee_amount` (Connect platform fees)
- ❌ `transfer_data.destination` (Connect transfers)
- ❌ `on_behalf_of` (Connect on-behalf charges)
- ❌ `ORGANIZER_STRIPE_ACCOUNT_ID` environment variable

**What this uses instead:**

- ✅ Client's account receives payment directly
- ✅ Webhook creates a transfer for 4% after payment succeeds
- ✅ Only needs `SERVICE_ACCOUNT_ID` (your account)

**Why this approach?**

- Simpler setup (no Connect onboarding)
- No platform account required
- Client maintains full control of their funds
- Transfers happen post-payment via webhook

## Overview

The system implements an automatic service fee collection mechanism:

- **On checkout completion**: Automatically transfers 4% of the total payment to the developer's Stripe account
- **On refund**: Automatically reverses the transfer (full or partial based on refund amount)
- All transfers are tracked in the Transaction model for full audit trail

## Prerequisites

### 1. Stripe Account Setup

This implementation uses **Stripe Transfers** (not Stripe Connect). Here's what you need:

1. **Client's Stripe Account** (processes payments):

   - This is the account that receives customer payments
   - You'll use their `STRIPE_SECRET_KEY`
   - Payments go to their account balance first

2. **Developer's Stripe Account** (receives service fee):
   - This is YOUR account that receives the 4% fee
   - You need your Account ID (format: `acct_XXXXXXXXXXXXX`)
   - Find it in: **Stripe Dashboard > Settings > Account details**

### 2. Important: Transfer Requirements

For transfers to work between Stripe accounts:

- **Both accounts must be in the same region** (both US, or both EU, etc.)
- The client's account must have **available balance** (transfers pull from balance, not directly from charges)
- No Stripe Connect setup required - this uses simple transfers

### 3. How Transfers Work

```
1. Customer pays $100 → Goes to CLIENT's Stripe account
2. Webhook fires → checkout.session.completed
3. System creates transfer → $4 to YOUR account (from client's balance)
4. Result: Client has $96, You have $4
```

This is simpler than Stripe Connect because:

- No platform fees setup needed
- No connected accounts configuration
- Just provide your account ID as the transfer destination

## Environment Variables

Add these to your `.env.local` file:

```bash
# Client's Stripe Secret Key (processes payments)
STRIPE_SECRET_KEY=sk_test_51XXXXXXXXXXXXX

# Stripe Webhook Signing Secret (from Stripe Dashboard)
STRIPE_WEBHOOK_SECRET=whsec_XXXXXXXXXXXXX

# Your Developer Stripe Account ID (receives 4% fee)
SERVICE_ACCOUNT_ID=acct_XXXXXXXXXXXXX
```

### Getting Your Account ID

1. Log into your **developer** Stripe account
2. Go to **Settings** > **Account details**
3. Copy your Account ID (starts with `acct_`)
4. Add it to `SERVICE_ACCOUNT_ID` in your `.env.local`

## Webhook Setup in Stripe Dashboard

### 1. Create the Webhook Endpoint

1. Log into the **client's** Stripe Dashboard
2. Navigate to **Developers** > **Webhooks**
3. Click **Add endpoint**

### 2. Configure the Endpoint

**Endpoint URL:**

```
https://yourdomain.com/api/webhooks/stripe
```

For local development with Stripe CLI:

```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

**Events to listen for:**

- `checkout.session.completed`
- `charge.refunded`

### 3. Get the Webhook Secret

1. After creating the webhook, click on it
2. Click **Reveal** under "Signing secret"
3. Copy the secret (starts with `whsec_`)
4. Add it to `STRIPE_WEBHOOK_SECRET` in your `.env.local`

## How It Works

### Checkout Flow

1. **Customer completes checkout** → Stripe triggers `checkout.session.completed` event
2. **Webhook handler**:
   - Creates the transaction in your database
   - Retrieves payment intent and total amount
   - Calculates 4% service fee
   - Creates a Stripe Transfer to your developer account using `source_transaction`
   - Stores transfer ID in the transaction record
3. **Stripe automatically processes transfer** when funds become available
4. **Result**: Client keeps 96%, you receive 4%

### Why `source_transaction`?

The transfer uses Stripe's `source_transaction` parameter, which:

- **Links the transfer to the original charge**
- **Queues the transfer** if funds aren't immediately available
- **Automatically executes** when funds become available
- **Eliminates insufficient funds errors** in both test and live mode
- **Works for first sales** when account balance is $0

### Refund Flow

1. **Refund is issued** → Stripe triggers `charge.refunded` event
2. **Webhook handler**:
   - Finds the transaction by payment intent ID
   - Updates transaction status to 'refunded'
   - Retrieves the original transfer ID
   - Creates a Transfer Reversal
   - Updates transaction with reversal information
3. **Result**: Service fee is returned proportionally to the refund amount

### Partial Refunds

The system handles partial refunds intelligently:

- If 50% of the payment is refunded → 50% of the transfer is reversed
- The calculation is: `(refund_amount / original_amount) × transfer_amount`

## Code Structure

### Files Modified/Created

1. **`/lib/models/Transaction.ts`**

   - Added `serviceAccountTransfer` field to store transfer information
   - Tracks: transferId, amount, status, reversalId, dates

2. **`/lib/services/transfer.service.ts`** (NEW)

   - `createServiceFeeTransfer()` - Creates 4% transfer on checkout
   - `reverseServiceFeeTransfer()` - Reverses transfer on refund
   - `calculateServiceFee()` - Calculates 4% of total

3. **`/lib/services/transaction.service.ts`**

   - Added `getTransactionByPaymentIntent()` - Find transaction by payment intent ID

4. **`/app/api/webhooks/stripe/route.ts`**
   - Enhanced `checkout.session.completed` handler with transfer creation
   - Enhanced `charge.refunded` handler with transfer reversal

## Testing

### Local Testing with Stripe CLI

1. **Install Stripe CLI**:

   ```bash
   brew install stripe/stripe-cli/stripe
   ```

2. **Login to Stripe**:

   ```bash
   stripe login
   ```

3. **Forward webhooks to local server**:

   ```bash
   stripe listen --forward-to localhost:3000/api/webhooks/stripe
   ```

4. **Trigger test events**:

   ```bash
   # Test successful checkout
   stripe trigger checkout.session.completed

   # Test refund
   stripe trigger charge.refunded
   ```

### Manual Testing

1. **Test Checkout**:

   - Create a test checkout session
   - Complete payment with test card `4242 4242 4242 4242`
   - Check logs for transfer creation
   - Verify in Stripe Dashboard → **Transfers**

2. **Test Refund**:
   - Find a completed payment in Stripe Dashboard
   - Issue a refund
   - Check logs for transfer reversal
   - Verify in Stripe Dashboard → **Transfers** → **Reversals**

### Monitoring Logs

The system logs all transfer activities:

```javascript
// Checkout logs
console.log('Creating service fee transfer for ticket order:', {
  paymentIntentId,
  totalAmount,
  transactionId,
});

// Success
console.log('Service fee transfer created:', transferId);

// Refund logs
console.log('Reversing service fee transfer:', {
  transferId,
  refundAmount,
});

// Success
console.log('Service fee transfer reversed:', reversalId);
```

## Important Notes

### Transfer Timing

- Transfers are created **immediately** when checkout completes
- Funds are available in your account based on your Stripe payout schedule
- Reversals happen **immediately** when refunds are processed

### Error Handling

- If transfer creation fails, the webhook doesn't fail (returns 200)
- Errors are logged for manual review
- Transaction is marked with `status: 'failed'` in `serviceAccountTransfer`
- Failed transfers can be manually created through Stripe Dashboard

### Security

- Webhook signature verification is **required** (prevents fake webhooks)
- Environment variables must be kept secure
- Never commit `.env.local` to version control

### Compliance

- All transfers are tracked in the database
- Full audit trail: transferId, amount, dates, reversal info
- Stripe Dashboard provides additional transfer logs

## Troubleshooting

### "Transfer failed: Insufficient funds in account"

**Solution**: Ensure the client's Stripe account has sufficient balance. Transfers pull from the account balance, not directly from charges.

### "Transfer failed: Destination account not found"

**Solution**: Verify `SERVICE_ACCOUNT_ID` is correct and the accounts are properly connected.

### "Webhook signature verification failed"

**Solution**:

- Verify `STRIPE_WEBHOOK_SECRET` matches the webhook in Stripe Dashboard
- Ensure you're using the webhook secret for the correct environment (test vs live)

### "No transaction found for payment intent"

**Solution**:

- Ensure `stripePaymentIntentId` is being saved when creating transactions
- Check that payment intent is attached to the checkout session

### Transfer not appearing in developer account

**Solution**:

- Check Stripe Dashboard logs for transfer
- Verify account IDs are correct
- Ensure both accounts are in the same region (US, EU, etc.)

## Changing the Service Fee Percentage

To change from 4% to a different percentage:

1. Open `/lib/services/transfer.service.ts`
2. Update this line:
   ```typescript
   const SERVICE_FEE_PERCENTAGE = 4; // Change this number
   ```
3. Redeploy the application

## Production Checklist

Before going live:

- [ ] Set `SERVICE_ACCOUNT_ID` to your **live** Stripe account ID
- [ ] Update `STRIPE_SECRET_KEY` to client's **live** secret key
- [ ] Create webhook in **live** Stripe Dashboard (not test mode)
- [ ] Update `STRIPE_WEBHOOK_SECRET` with **live** webhook secret
- [ ] Test with real (non-test) payment
- [ ] Verify transfer appears in live Stripe account
- [ ] Test refund flow with real payment
- [ ] Set up monitoring/alerts for failed transfers

## Support

For issues or questions:

1. Check Stripe Dashboard → **Logs** for detailed error messages
2. Review application logs for transfer-related errors
3. Verify all environment variables are set correctly
4. Ensure Stripe Connect is properly configured

## API Reference

### TransferService Methods

```typescript
// Create a 4% transfer
TransferService.createServiceFeeTransfer(
  paymentIntentId: string,
  totalAmount: number,
  transactionId: string
): Promise<{ success: boolean; transferId?: string; error?: string }>

// Reverse a transfer (full or partial)
TransferService.reverseServiceFeeTransfer(
  transferId: string,
  transactionId: string,
  refundAmount?: number
): Promise<{ success: boolean; reversalId?: string; error?: string }>

// Get transfer details
TransferService.getTransferDetails(
  transferId: string
): Promise<Stripe.Transfer>

// List all reversals for a transfer
TransferService.getTransferReversals(
  transferId: string
): Promise<Stripe.TransferReversal[]>
```

### Transaction Model Fields

```typescript
serviceAccountTransfer?: {
  transferId: string;        // Stripe Transfer ID
  amount: number;            // Amount in cents
  status: 'pending' | 'completed' | 'reversed' | 'failed';
  createdAt: Date;
  reversedAt?: Date;
  reversalId?: string;       // Transfer Reversal ID
}
```

## Resources

- [Stripe Transfers Documentation](https://stripe.com/docs/connect/charges-transfers)
- [Stripe Transfer Reversals](https://stripe.com/docs/connect/transfer-reversals)
- [Stripe Webhooks Guide](https://stripe.com/docs/webhooks)
- [Stripe Connect Overview](https://stripe.com/docs/connect)
