# Ticket Sales Toggle - Quick Revert Guide

This document explains how to easily enable/disable ticket sales functionality.

## Current Status: TICKET SALES DISABLED

Ticket sales are currently **DISABLED** and customers see a "Coming Soon" popup instead.

## How to Enable Ticket Sales

To enable ticket sales and restore full functionality:

1. **Open the feature flags file:**

   ```
   lib/feature-flags.ts
   ```

2. **Change the flag value:**

   ```typescript
   export const FEATURE_FLAGS = {
     // Set to true to enable ticket sales
     TICKET_SALES_ENABLED: true, // ← Change this to true
   } as const;
   ```

3. **Save the file** - The changes take effect immediately!

## How to Disable Ticket Sales

To disable ticket sales and show "Coming Soon" popups:

1. **Open the feature flags file:**

   ```
   lib/feature-flags.ts
   ```

2. **Change the flag value:**

   ```typescript
   export const FEATURE_FLAGS = {
     // Set to false to disable ticket sales
     TICKET_SALES_ENABLED: false, // ← Change this to false
   } as const;
   ```

3. **Save the file** - The changes take effect immediately!

## What Happens When Disabled

When `TICKET_SALES_ENABLED` is set to `false`:

- ✅ All "Buy Tickets" buttons show a "Coming Soon" popup directly
- ✅ The checkout API returns a 503 error
- ✅ Customers cannot access the Stripe checkout page
- ✅ Users can still view event details and fight cards

## What Happens When Enabled

When `TICKET_SALES_ENABLED` is set to `true`:

- ✅ All "Buy Tickets" buttons work normally
- ✅ The checkout API processes payments
- ✅ Customers can complete ticket purchases
- ✅ Full Stripe integration is active

## Files Modified

The following files were modified to implement this toggle:

- `lib/feature-flags.ts` - Main configuration file
- `components/coming-soon-modal.tsx` - Coming soon popup component
- `hooks/use-ticket-purchase.ts` - Hook for handling ticket purchase logic
- `components/ticket-purchase-modal.tsx` - Updated to check feature flag
- `components/home/hero-section.tsx` - Updated to use the new hook
- `components/events/upcoming-events-list.tsx` - Updated to use the new hook
- `app/api/checkout/route.ts` - Added feature flag check

## No Database Changes Required

This implementation uses a simple boolean flag and requires no database migrations or complex setup. The toggle is immediate and reversible.

## Testing

To test the toggle:

1. Set `TICKET_SALES_ENABLED: false`
2. Visit your site and click any "Buy Tickets" button
3. Verify you see the "Coming Soon" popup
4. Set `TICKET_SALES_ENABLED: true`
5. Click "Buy Tickets" again
6. Verify normal ticket purchase flow works

---

**Quick Toggle Command:**

```bash
# To disable (show coming soon)
sed -i 's/TICKET_SALES_ENABLED: true/TICKET_SALES_ENABLED: false/' lib/feature-flags.ts

# To enable (normal functionality)
sed -i 's/TICKET_SALES_ENABLED: false/TICKET_SALES_ENABLED: true/' lib/feature-flags.ts
```
