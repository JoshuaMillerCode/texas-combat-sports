# Database Helper Usage Guide

This guide shows you how to use the `db-helper.ts` file to interact with your Texas Combat Sports database.

## Quick Start

### 1. Command Line Usage

Test your database connection:

```bash
npx ts-node lib/db-helper.ts test-connection
```

Seed database with sample data:

```bash
npx ts-node lib/db-helper.ts seed
```

List all available commands:

```bash
npx ts-node lib/db-helper.ts
```

### 2. Import in Your Code

```typescript
import { db, EventService, FighterService } from '@/lib/db-helper';

// Use the unified db object
const fighters = await db.fighters.getAllFighters();

// Or use individual services
const events = await EventService.getAllEvents();
```

## Available Services

### Fighter Operations

```typescript
import { db } from '@/lib/db-helper';

// Create a new fighter
const newFighter = await db.fighters.createFighter({
  name: 'Jane "Lightning" Doe',
  nickname: 'Lightning',
  age: 26,
  weight: '135 lbs',
  height: '5\'6"',
  reach: '65"',
  hometown: 'Austin, TX',
  record: '10-0-0',
  achievements: ['Regional Champion', 'Performance of the Night'],
  stats: {
    knockouts: 5,
    submissions: 3,
    decisions: 2,
    winStreak: 10,
  },
});

// Get fighter by ID
const fighter = await db.fighters.getFighterById('fighter-id');

// Search fighters
const searchResults = await db.fighters.searchFighters('Lightning');

// Get fighter statistics
const stats = await db.fighters.getFighterStats('fighter-id');

// Update fighter record after a fight
await db.fighters.updateFighterRecord('fighter-id', {
  wins: 11,
  losses: 0,
  draws: 0,
});
```

### Event Operations

```typescript
// Create a new event
const newEvent = await db.events.createEvent({
  title: 'Texas Combat Sports: Championship Night',
  subtitle: 'Title Fight Extravaganza',
  slug: 'championship-night-2024',
  date: new Date('2024-09-15T20:00:00Z'),
  location: 'Arlington Entertainment District',
  address: '1 AT&T Way, Arlington, TX 76011',
  venue: 'AT&T Stadium',
  city: 'Arlington',
  capacity: '80,000',
  ticketPrice: 'Starting at $100',
  description: 'The biggest championship night in Texas',
});

// Get upcoming events
const upcomingEvents = await db.events.getUpcomingEvents();

// Get event by slug
const event = await db.events.getEventBySlug('championship-night-2024');

// Get event statistics
const eventStats = await db.events.getEventStats('event-id');

// Add a fight to an event
await db.events.addFightToEvent('event-id', 'fight-id');

// Set main event
await db.events.setMainEvent('event-id', 'main-fight-id');
```

### Fight Operations

```typescript
// Create a new fight
const newFight = await db.fights.createFight({
  fighter1: 'fighter1-id',
  fighter2: 'fighter2-id',
  event: 'event-id',
  title: 'Welterweight Showdown',
  rounds: 3,
  isMainEvent: false,
});

// Get fights for an event
const eventFights = await db.fights.getFightsByEvent('event-id');

// Record fight result
await db.fights.recordFightResult('fight-id', {
  winner: 'fighter1-id',
  method: 'KO',
  round: 2,
  time: '2:34',
});
```

### Merchandise Operations

```typescript
// Create new merch
const newMerch = await db.merch.createMerch({
  name: 'Official Fight Night Hoodie',
  description: 'Premium quality hoodie with event logo',
  price: 5999, // $59.99 in cents
  category: 'Apparel',
  images: ['/images/hoodie-front.jpg', '/images/hoodie-back.jpg'],
  productId: 'fight-night-hoodie-2024',
  stripePriceId: 'price_1234567890abcdef',
  inventory: {
    total: 50,
    available: 50,
    reserved: 0,
    lowStockThreshold: 5,
  },
  variants: [
    {
      name: 'Size',
      options: ['S', 'M', 'L', 'XL', 'XXL'],
      required: true,
    },
  ],
  isActive: true,
});

// Get merch by category
const apparel = await db.merch.getMerchByCategory('Apparel');

// Update inventory after purchase
await db.merch.updateInventory('merch-id', {
  total: 49,
  available: 48,
  reserved: 1,
  lowStockThreshold: 5,
});
```

### Transaction Operations

```typescript
// Create a ticket purchase transaction
const ticketTransaction = await db.transactions.createTransaction({
  type: 'ticket',
  event: 'event-id',
  ticketTier: 'vip-tier-id',
  stripeSessionId: 'cs_test_1234567890',
  stripePriceId: 'price_1234567890',
  quantity: 2,
  unitPrice: 15000, // $150.00 in cents
  totalAmount: 30000, // $300.00 in cents
  customerDetails: {
    email: 'customer@example.com',
    name: 'John Smith',
  },
  metadata: {
    itemName: 'VIP Ringside Tickets',
    eventTitle: 'Championship Night',
    eventDate: '2024-09-15',
    eventVenue: 'AT&T Stadium',
  },
  status: 'pending',
});

// Create a merch purchase transaction
const merchTransaction = await db.transactions.createTransaction({
  type: 'merch',
  merch: 'merch-id',
  stripeSessionId: 'cs_test_0987654321',
  stripePriceId: 'price_0987654321',
  quantity: 1,
  unitPrice: 5999,
  totalAmount: 5999,
  customerDetails: {
    email: 'customer@example.com',
    name: 'Jane Doe',
  },
  metadata: {
    itemName: 'Official Fight Night Hoodie',
    category: 'Apparel',
  },
  status: 'confirmed',
});

// Get transaction history
const transactions = await db.transactions.getTransactionsByCustomer(
  'customer@example.com'
);
```

### Ticket Tier Operations

```typescript
// Create ticket tiers for an event
const vipTier = await db.ticketTiers.createTicketTier({
  event: 'event-id',
  tierId: 'vip-ringside',
  name: 'VIP Ringside',
  description: 'Premium ringside seats with meet & greet',
  price: 20000, // $200.00 in cents
  stripePriceId: 'price_vip_1234567890',
  maxQuantity: 20,
  availableQuantity: 20,
  features: [
    'Ringside seating',
    'Meet & greet with fighters',
    'Premium amenities',
  ],
  isActive: true,
});

const generalTier = await db.ticketTiers.createTicketTier({
  event: 'event-id',
  tierId: 'general-admission',
  name: 'General Admission',
  description: 'Standard admission tickets',
  price: 7500, // $75.00 in cents
  stripePriceId: 'price_general_1234567890',
  maxQuantity: 500,
  availableQuantity: 500,
  features: ['Stadium seating', 'Access to concessions'],
  isActive: true,
});
```

## Advanced Usage Examples

### Create a Complete Event Setup

```typescript
import { db } from '@/lib/db-helper';

async function setupCompleteEvent() {
  // 1. Create fighters
  const fighter1 = await db.fighters.createFighter({
    name: 'Alex "The Destroyer" Rodriguez',
    nickname: 'The Destroyer',
    age: 29,
    weight: '185 lbs',
    height: '6\'1"',
    reach: '74"',
    hometown: 'San Antonio, TX',
    record: '18-2-0',
  });

  const fighter2 = await db.fighters.createFighter({
    name: 'Marcus "Iron Fist" Johnson',
    nickname: 'Iron Fist',
    age: 31,
    weight: '185 lbs',
    height: '6\'0"',
    reach: '73"',
    hometown: 'Houston, TX',
    record: '16-3-1',
  });

  // 2. Create event
  const event = await db.events.createEvent({
    title: 'Texas Combat Sports: Rivalry Night',
    subtitle: 'Rodriguez vs Johnson',
    slug: 'rivalry-night-2024',
    date: new Date('2024-11-15T20:00:00Z'),
    location: 'Downtown Houston',
    address: '1510 Polk St, Houston, TX 77002',
    venue: 'Toyota Center',
    city: 'Houston',
    capacity: '18,500',
    ticketPrice: 'Starting at $75',
    description: 'Epic rivalry settles in the ring',
  });

  // 3. Create ticket tiers
  const vipTier = await db.ticketTiers.createTicketTier({
    event: event._id,
    tierId: 'vip-ringside',
    name: 'VIP Ringside',
    price: 25000,
    stripePriceId: 'price_vip_rivalry_night',
    maxQuantity: 16,
    availableQuantity: 16,
    isActive: true,
  });

  const premiumTier = await db.ticketTiers.createTicketTier({
    event: event._id,
    tierId: 'premium',
    name: 'Premium',
    price: 15000,
    stripePriceId: 'price_premium_rivalry_night',
    maxQuantity: 100,
    availableQuantity: 100,
    isActive: true,
  });

  // 4. Create the main fight
  const mainFight = await db.fights.createFight({
    fighter1: fighter1._id,
    fighter2: fighter2._id,
    event: event._id,
    title: 'Middleweight Championship',
    rounds: 5,
    isMainEvent: true,
  });

  // 5. Set as main event
  await db.events.setMainEvent(event._id, mainFight._id);

  console.log('✅ Complete event setup finished!');
  return { event, fighters: [fighter1, fighter2], fight: mainFight };
}
```

### Bulk Data Operations

```typescript
async function bulkCreateFighters() {
  const fighterData = [
    {
      name: 'Carlos "El Matador" Vasquez',
      nickname: 'El Matador',
      age: 27,
      weight: '170 lbs',
    },
    {
      name: 'Tommy "The Tank" Williams',
      nickname: 'The Tank',
      age: 30,
      weight: '205 lbs',
    },
    {
      name: 'Lisa "Lightning" Chen',
      nickname: 'Lightning',
      age: 24,
      weight: '125 lbs',
    },
  ];

  const createdFighters = [];
  for (const data of fighterData) {
    const fighter = await db.fighters.createFighter({
      ...data,
      height: '5\'10"',
      reach: '70"',
      hometown: 'Texas',
      record: '10-5-0',
    });
    createdFighters.push(fighter);
  }

  return createdFighters;
}
```

## Database Management

### Connection Management

```typescript
// Manual connection control
await db.connect();

// Do your operations...

await db.disconnect();
```

### Development Utilities

```typescript
// Drop database (development only)
if (process.env.NODE_ENV === 'development') {
  await db.dropDatabase();
}

// Seed with sample data
await db.seed();
```

## Running the Helper as a Script

The helper can be run directly from the command line:

```bash
# Available commands:
npx ts-node lib/db-helper.ts seed                    # Seed with sample data
npx ts-node lib/db-helper.ts test-connection         # Test DB connection
npx ts-node lib/db-helper.ts list-fighters           # List all fighters
npx ts-node lib/db-helper.ts list-events             # List upcoming events
npx ts-node lib/db-helper.ts create-sample-fighter   # Create sample fighter
npx ts-node lib/db-helper.ts create-sample-event     # Create sample event
npx ts-node lib/db-helper.ts create-sample-merch     # Create sample merch
```

## Environment Setup

Make sure you have your environment variables set up:

```bash
# .env.local
MONGODB_URI=mongodb://localhost:27017/texas-combat-sports
# or for MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/texas-combat-sports
```

## Tips and Best Practices

1. **Always handle errors**: Wrap database operations in try-catch blocks
2. **Use transactions**: For operations that need to be atomic
3. **Clean up connections**: Always disconnect when done (especially in scripts)
4. **Validate data**: Ensure required fields are present before creating records
5. **Use environment checks**: Be careful with destructive operations like dropDatabase()

```typescript
// Good error handling example
try {
  const fighter = await db.fighters.createFighter(fighterData);
  console.log('Fighter created successfully:', fighter.name);
} catch (error) {
  console.error('Failed to create fighter:', error.message);
  throw error;
} finally {
  await db.disconnect();
}
```
