#!/usr/bin/env ts-node

/**
 * Database Helper - Connect to DB and run service functions
 *
 * This helper file provides easy access to all database services
 * and can be run directly using ts-node for database operations.
 *
 * Usage:
 * 1. Run directly: `npx ts-node lib/db-helper.ts`
 * 2. Import in other files: `import { db } from '@/lib/db-helper'`
 */

// Load environment variables from .env.local
import { config } from 'dotenv';
config({ path: '.env.local' });

import dbConnect from './dbConnect';

// Import all services
import { EventService } from './services/event.service';
import { FighterService } from './services/fighter.service';
import { FightService } from './services/fight.service';
import { MerchService } from './services/merch.service';
import { TicketTierService } from './services/ticketTier.service';
import { TransactionService } from './services/transaction.service';

// Export individual services for granular access
export {
  EventService,
  FighterService,
  FightService,
  MerchService,
  TicketTierService,
  TransactionService,
};

/**
 * Main database helper object that provides access to all services
 * and connection management
 */
export const db = {
  // Connection management
  connect: dbConnect,

  // Service access
  events: EventService,
  fighters: FighterService,
  fights: FightService,
  merch: MerchService,
  ticketTiers: TicketTierService,
  transactions: TransactionService,

  // Utility methods
  async disconnect() {
    const mongoose = await import('mongoose');
    return await mongoose.disconnect();
  },

  async dropDatabase() {
    await dbConnect();
    const mongoose = await import('mongoose');
    if (process.env.NODE_ENV !== 'production') {
      return await mongoose.connection.db?.dropDatabase();
    } else {
      throw new Error('Cannot drop database in production');
    }
  },

  // Quick data seeding helper
  async seed() {
    console.log('🌱 Starting database seeding...');

    try {
      await dbConnect();
      console.log('✅ Database connected');

      // Example: Create a sample fighter
      const sampleFighter = await db.fighters.createFighter({
        name: 'John "Thunder" Smith',
        nickname: 'Thunder',
        age: 28,
        weight: '185 lbs',
        height: '6\'0"',
        reach: '72"',
        hometown: 'Houston, TX',
        record: '15-3-0',
        achievements: ['Regional Champion', 'Fight of the Night'],
        stats: {
          knockouts: 8,
          submissions: 4,
          decisions: 3,
          winStreak: 5,
        },
      });
      console.log('✅ Sample fighter created:', sampleFighter.name);

      // Example: Create a sample event
      const sampleEvent = await db.events.createEvent({
        title: 'Texas Combat Sports: Fight Night 1',
        subtitle: 'The Beginning',
        slug: 'fight-night-1',
        date: new Date('2024-06-15T19:00:00Z'),
        location: 'Downtown Houston',
        address: '1510 Polk St, Houston, TX 77002',
        venue: 'Toyota Center',
        city: 'Houston',
        capacity: '18,500',
        ticketPrice: 'Starting at $50',
        description:
          'Our inaugural fight night featuring the best local talent',
      });
      console.log('✅ Sample event created:', sampleEvent.title);

      console.log('🎉 Database seeding completed!');
      return { fighter: sampleFighter, event: sampleEvent };
    } catch (error) {
      console.error('❌ Seeding failed:', error);
      throw error;
    }
  },
};

/**
 * Example usage functions - uncomment and modify as needed
 */
export const examples = {
  // Fighter examples
  async createFighter() {
    const fighter = await db.fighters.createFighter({
      name: 'Mike "The Hammer" Johnson',
      nickname: 'The Hammer',
      age: 25,
      weight: '170 lbs',
      height: '5\'10"',
      reach: '70"',
      hometown: 'Dallas, TX',
      record: '12-1-0',
      stats: {
        knockouts: 10,
        submissions: 1,
        decisions: 1,
        winStreak: 12,
      },
    });
    console.log('Fighter created:', fighter);
    return fighter;
  },

  async listAllFighters() {
    const fighters = await db.fighters.getAllFighters();
    console.log('All fighters:', fighters);
    return fighters;
  },

  // Event examples
  async createEvent() {
    const event = await db.events.createEvent({
      title: 'Texas Combat Sports: Summer Showdown',
      subtitle: 'The Ultimate Competition',
      slug: 'summer-showdown-2024',
      date: new Date('2024-08-15T20:00:00Z'),
      location: 'Downtown Dallas',
      address: '2500 Victory Ave, Dallas, TX 75219',
      venue: 'American Airlines Center',
      city: 'Dallas',
      capacity: '20,000',
      ticketPrice: 'Starting at $75',
      description: 'The biggest fight card of the summer',
    });
    console.log('Event created:', event);
    return event;
  },

  async getUpcomingEvents() {
    const events = await db.events.getUpcomingEvents();
    console.log('Upcoming events:', events);
    return events;
  },

  // Merch examples
  async createMerch() {
    const merch = await db.merch.createMerch({
      name: 'TCS Championship T-Shirt',
      description: 'Official Texas Combat Sports championship t-shirt',
      price: 2999, // in cents
      category: 'Apparel',
      images: ['/images/tcs-tshirt.jpg'],
      productId: 'tcs-championship-tshirt',
      stripePriceId: 'price_1234567890', // Required Stripe price ID
      inventory: {
        total: 100,
        available: 100,
        reserved: 0,
        lowStockThreshold: 10,
      },
      isActive: true,
    });
    console.log('Merch created:', merch);
    return merch;
  },
};

// CLI functionality - only runs when script is executed directly
if (require.main === module) {
  async function main() {
    console.log('🚀 Texas Combat Sports - Database Helper');
    console.log('==========================================');

    const args = process.argv.slice(2);
    const command = args[0];

    try {
      switch (command) {
        case 'seed':
          await db.seed();
          break;

        case 'test-connection':
          await db.connect();
          console.log('✅ Database connection successful!');
          break;

        case 'list-fighters':
          await examples.listAllFighters();
          break;

        case 'list-events':
          await examples.getUpcomingEvents();
          break;

        case 'create-sample-fighter':
          await examples.createFighter();
          break;

        case 'create-sample-event':
          await examples.createEvent();
          break;

        case 'create-sample-merch':
          await examples.createMerch();
          break;

        case 'setup-complete-event':
          const { setupCompleteEvent } = await import('./setup-complete-event');
          await setupCompleteEvent();
          break;

        default:
          console.log('Available commands:');
          console.log(
            '  seed                    - Seed database with sample data'
          );
          console.log('  test-connection         - Test database connection');
          console.log('  list-fighters           - List all fighters');
          console.log('  list-events             - List upcoming events');
          console.log('  create-sample-fighter   - Create a sample fighter');
          console.log('  create-sample-event     - Create a sample event');
          console.log('  create-sample-merch     - Create sample merchandise');
          console.log(
            '  setup-complete-event    - Create a complete event with fighters, tiers, and fights'
          );
          console.log('');
          console.log('Usage: npx ts-node lib/db-helper.ts <command>');
      }
    } catch (error) {
      console.error('❌ Error:', error);
      process.exit(1);
    } finally {
      await db.disconnect();
      console.log('🔌 Database disconnected');
    }
  }

  main();
}
