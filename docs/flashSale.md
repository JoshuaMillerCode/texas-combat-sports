# Flash Sale System Documentation

## Overview

The Flash Sale System is a comprehensive, reusable solution for managing limited-time ticket sales on the Texas Combat Sports platform. It allows admins to create, manage, and automatically enforce flash sales without requiring code changes or redeployments.

## Table of Contents

1. [Architecture](#architecture)
2. [Database Schema](#database-schema)
3. [API Endpoints](#api-endpoints)
4. [Admin Dashboard Usage](#admin-dashboard-usage)
5. [How It Works](#how-it-works)
6. [Setting Up a New Flash Sale](#setting-up-a-new-flash-sale)
7. [Frontend Integration](#frontend-integration)
8. [Feature Flags](#feature-flags)
9. [Server-Side Validation](#server-side-validation)
10. [Troubleshooting](#troubleshooting)

---

## Architecture

The Flash Sale System consists of:

- **Database Model**: `FlashSale` model in MongoDB
- **Service Layer**: `FlashSaleService` for business logic
- **API Routes**: RESTful endpoints for CRUD operations
- **Admin UI**: Dashboard section for managing flash sales
- **Frontend Components**: Banner and price display components
- **Checkout Integration**: Automatic price substitution during checkout

### Key Design Decisions

1. **Stripe Price IDs**: Flash sales use Stripe Price IDs directly, eliminating local price calculations
2. **Time-Based Activation**: Sales automatically activate/deactivate based on `startAt` and `endAt`
3. **Server-Side Enforcement**: All price logic happens server-side to prevent tampering
4. **Overlap Prevention**: System prevents multiple flash sales for the same ticket type

---

## Database Schema

### FlashSale Model

```typescript
{
  _id: ObjectId,
  title: string,                    // Display name (e.g., "General Admission Flash Sale")
  description?: string,             // Optional description
  startAt: Date,                    // When the sale begins
  endAt: Date,                      // When the sale ends
  targetTicketTypes: string[],      // Array of ticket tier IDs
  stripePriceId: string,            // Stripe Price ID for sale price
  originalStripePriceId: string,    // Stripe Price ID for original price
  isActive: boolean,                // Manual override to enable/disable
  createdAt: Date,
  updatedAt: Date
}
```

### Indexes

- `{ startAt: 1, endAt: 1 }` - For time-based queries
- `{ targetTicketTypes: 1 }` - For finding sales by ticket type
- `{ isActive: 1 }` - For filtering active sales
- `{ targetTicketTypes: 1, isActive: 1, startAt: 1, endAt: 1 }` - Compound index for active sale lookups

---

## API Endpoints

### GET /api/flash-sales

Get all flash sales or filter by status.

**Query Parameters:**

- `status` (optional): `active`, `upcoming`, `past`, or `all` (default)

**Response:**

```json
{
  "flashSales": [
    {
      "_id": "...",
      "title": "General Admission Flash Sale",
      "startAt": "2025-10-25T00:00:00Z",
      "endAt": "2025-10-28T23:59:59Z",
      "targetTicketTypes": ["tier_id_1"],
      "stripePriceId": "price_xxxxx",
      "originalStripePriceId": "price_yyyyy",
      "isActive": true
    }
  ]
}
```

### POST /api/flash-sales

Create a new flash sale.

**Body:**

```json
{
  "title": "General Admission Flash Sale",
  "description": "Limited time offer!",
  "startAt": "2025-10-25T00:00:00Z",
  "endAt": "2025-10-28T23:59:59Z",
  "targetTicketTypes": ["tier_id_1"],
  "stripePriceId": "price_sale",
  "originalStripePriceId": "price_regular",
  "isActive": true
}
```

**Response:**

```json
{
  "flashSale": {
    /* created flash sale */
  }
}
```

### PATCH /api/flash-sales/[id]

Update an existing flash sale.

**Body:** Same as POST, all fields optional

### DELETE /api/flash-sales/[id]

Delete a flash sale.

### GET /api/flash-sales/ticket-tier/[tierId]

Get active flash sale information for a specific ticket tier.

**Response:**

```json
{
  "hasFlashSale": true,
  "flashSale": {
    /* flash sale object */
  },
  "originalPrice": 55.0,
  "salePrice": 50.0,
  "currency": "usd"
}
```

---

## Admin Dashboard Usage

### Accessing Flash Sales Management

1. Log in to the admin dashboard at `/admin/dashboard`
2. Click the **Flash Sales** tab (lightning bolt icon)

### Creating a Flash Sale

1. Click **"Create Flash Sale"** button
2. Fill in the form:
   - **Title**: Display name (e.g., "Weekend Special")
   - **Description**: Optional details
   - **Start Date & Time**: When the sale begins
   - **End Date & Time**: When the sale ends
   - **Target Ticket Types**: Select which ticket tiers to apply the sale to
   - **Original Stripe Price ID**: The regular price ID from Stripe
   - **Sale Stripe Price ID**: The discounted price ID from Stripe
   - **Active**: Check to activate immediately
3. Click **"Create Flash Sale"**

### Editing a Flash Sale

1. Find the flash sale in the list
2. Click **"Edit"** button
3. Modify fields as needed
4. Click **"Update Flash Sale"**

### Activating/Deactivating

- Use the **"Activate"**/**"Deactivate"** button to quickly toggle a flash sale
- Sales still respect time boundaries even when active

### Deleting a Flash Sale

1. Click **"Delete"** button on a flash sale
2. Confirm deletion

---

## How It Works

### 1. Price Resolution

When a user adds tickets to their cart:

1. Frontend fetches flash sale status via `/api/flash-sales/ticket-tier/[tierId]`
2. If active, displays crossed-out original price and highlighted sale price
3. Order summary shows flash sale prices

### 2. Checkout Flow

When a user proceeds to checkout:

1. Checkout API (`/api/checkout`) validates ticket availability
2. For each ticket, `FlashSaleService.getEffectiveStripePriceId()` determines the correct price:
   - If flash sale active + within time range → use sale price
   - Otherwise → use original price
3. Creates Stripe Checkout Session with correct prices
4. Stripe processes payment at sale price

### 3. Time-Based Activation

Flash sales are considered active when:

- `isActive === true` (manual override)
- **AND** current time >= `startAt`
- **AND** current time <= `endAt`

### 4. Overlap Prevention

The system prevents overlapping flash sales for the same ticket type:

- When creating/updating, checks for existing sales with overlapping time ranges
- Returns error if overlap detected

---

## Setting Up a New Flash Sale

### Example: General Admission $55 → $50

**Step 1: Create Stripe Prices**

In Stripe Dashboard:

1. Create a price for $55.00 (if not exists) → `price_regular_55`
2. Create a price for $50.00 → `price_sale_50`

**Step 2: Get Ticket Tier ID**

From admin dashboard or database:

1. Go to **Tickets** tab
2. Find "General Admission" ticket
3. Copy the ticket tier ID (e.g., `674abc123def456...`)

**Step 3: Create Flash Sale**

In admin dashboard:

1. Go to **Flash Sales** tab
2. Click **"Create Flash Sale"**
3. Fill in:
   ```
   Title: General Admission Flash Sale
   Description: Save $5 on General Admission tickets!
   Start: Oct 25, 2025 12:00 AM
   End: Oct 28, 2025 11:59 PM
   Target Ticket Types: [Select General Admission]
   Original Price ID: price_regular_55
   Sale Price ID: price_sale_50
   Active: ✓
   ```
4. Click **"Create Flash Sale"**

**Step 4: Verify**

1. Visit an event page with General Admission tickets
2. Verify flash sale banner appears at top
3. Open ticket purchase modal
4. Verify prices show $55 crossed out with $50 highlighted
5. Complete a test purchase (in test mode)

---

## Frontend Integration

### Components

#### FlashSaleBanner

Displays a prominent banner with countdown timer.

```tsx
<FlashSaleBanner
  title="General Admission Flash Sale"
  endAt="2025-10-28T23:59:59Z"
/>
```

Features:

- Animated lightning bolt icon
- Real-time countdown timer
- Auto-removes when sale ends

#### FlashSalePrice

Shows crossed-out original price with sale price.

```tsx
<FlashSalePrice
  originalPrice={55.0}
  salePrice={50.0}
  currency="USD"
  size="md"
  showBadge={true}
/>
```

Features:

- Crossed-out original price
- Highlighted sale price
- Savings percentage badge

### Integration Points

1. **Event Detail Page**: Banner at top
2. **Ticket Purchase Modal**: Banner and price components
3. **Ticket Cards**: Sale price display
4. **Order Summary**: Lightning bolt indicator for sale items

---

## Feature Flags

### FLASH_SALES_ENABLED

Located in `lib/feature-flags.ts`:

```typescript
export const FEATURE_FLAGS = {
  FLASH_SALES_ENABLED: true, // Set to false to disable
};
```

**Effects when disabled:**

- API endpoints return 503 errors
- Frontend does not fetch or display flash sales
- Checkout uses regular prices only
- Admin dashboard tab remains visible for management

---

## Server-Side Validation

### Security Measures

1. **Price Verification**: All prices fetched from Stripe API, never trusted from client
2. **Time Validation**: Server enforces time boundaries
3. **Overlap Prevention**: Database-level validation prevents conflicts
4. **Stripe Price Validation**: Validates Stripe Price IDs exist before saving

### Checkout Validation

```typescript
// In checkout API route
const priceInfo = await FlashSaleService.getEffectiveStripePriceId(ticketTier);
const stripePrice = await stripe.prices.retrieve(priceInfo.stripePriceId);
// Use stripePrice.unit_amount for calculations
```

---

## Troubleshooting

### Flash Sale Not Appearing

**Check:**

1. Is `FLASH_SALES_ENABLED` set to `true`?
2. Is `isActive` set to `true` on the flash sale?
3. Is current time within `startAt` and `endAt`?
4. Does `targetTicketTypes` include the correct ticket tier ID?
5. Check browser console for API errors

### Wrong Price at Checkout

**Check:**

1. Verify Stripe Price IDs are correct in flash sale
2. Check Stripe Dashboard that prices exist and are correct amounts
3. Review server logs for flash sale detection
4. Ensure no client-side price overrides

### Overlap Error

**Solution:**

1. Check existing flash sales for the same ticket type
2. Adjust time ranges to not overlap
3. Or deactivate conflicting flash sale

### Flash Sale Doesn't End

**Check:**

1. Verify `endAt` is in the past
2. Frontend components auto-hide when expired
3. Checkout will still validate server-side
4. Consider running cleanup: `FlashSaleService.deactivateExpiredFlashSales()`

---

## Best Practices

### 1. Plan Ahead

- Create flash sales a few days in advance
- Set `isActive` to false until ready to launch
- Test in staging environment first

### 2. Pricing Strategy

- Keep sale prices at least 10-15% off for impact
- Ensure Stripe prices are created before flash sale
- Use whole dollar amounts when possible

### 3. Duration

- Weekend sales: Friday 12 AM to Sunday 11:59 PM
- Flash sales work best with 24-72 hour windows
- Avoid very short durations (< 6 hours)

### 4. Communication

- Announce flash sales via email/social media
- Use compelling titles (e.g., "48-Hour Flash Sale!")
- Set expectations about limited time

### 5. Monitoring

- Check sales progress in admin dashboard
- Monitor Stripe for payment volume
- Watch for ticket availability

---

## Technical Notes

### Performance

- Flash sale lookups are O(log n) due to indexes
- Frontend caches flash sale status per ticket tier
- Checkout performs single query per ticket type

### Scalability

- System handles unlimited concurrent flash sales (for different tickets)
- No performance impact when flash sales disabled
- Database indexes optimize queries

### Future Enhancements

Potential improvements:

- Email notifications when sale starts
- Automatic social media posting
- A/B testing for sale prices
- Multi-tier flash sales (different discounts per tier)
- Usage analytics and reporting

---

## Support

For issues or questions:

1. Check server logs at `/var/log/app.log`
2. Review MongoDB collections: `flashsales`
3. Verify Stripe webhook events
4. Contact development team

---

## Changelog

### Version 1.0.0 (October 2025)

- Initial release
- Core CRUD operations
- Admin dashboard integration
- Frontend components
- Stripe integration
- Overlap prevention
- Time-based activation
- Feature flags
