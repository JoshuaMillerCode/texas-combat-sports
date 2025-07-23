#!/usr/bin/env ts-node

/**
 * Complete Event Setup Script
 *
 * This script runs the complete event setup example from the usage guide.
 * It creates fighters, an event, ticket tiers, and a main fight.
 *
 * Usage: npx ts-node --esm lib/setup-complete-event.ts
 * Or: npm run setup-complete-event
 */

// Load environment variables from .env.local
import { config } from 'dotenv';
config({ path: '.env.local' });

import { db } from './db-helper';

async function setupCompleteEvent() {
  console.log('🚀 Setting up complete event...');

  try {
    await db.connect();
    console.log('✅ Database connected');

    // 1. Create fighters
    console.log('👥 Creating fighters...');
    const fighter1 = await db.fighters.createFighter({
      name: 'Alex "The Destroyer" Rodriguez',
      nickname: 'The Destroyer',
      age: 29,
      weight: '185 lbs',
      height: '6\'1"',
      reach: '74"',
      hometown: 'San Antonio, TX',
      record: '18-2-0',
      achievements: ['Regional Champion', 'Fighter of the Year'],
      stats: {
        knockouts: 12,
        submissions: 4,
        decisions: 2,
        winStreak: 8,
      },
    });
    console.log('✅ Fighter 1 created:', fighter1.name);

    const fighter2 = await db.fighters.createFighter({
      name: 'Marcus "Iron Fist" Johnson',
      nickname: 'Iron Fist',
      age: 31,
      weight: '185 lbs',
      height: '6\'0"',
      reach: '73"',
      hometown: 'Houston, TX',
      record: '16-3-1',
      achievements: ['Former Champion', 'Knockout of the Year'],
      stats: {
        knockouts: 10,
        submissions: 3,
        decisions: 3,
        winStreak: 4,
      },
    });
    console.log('✅ Fighter 2 created:', fighter2.name);

    // 2. Create event
    console.log('🎪 Creating event...');
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
    console.log('✅ Event created:', event.title);

    // 3. Create ticket tiers
    console.log('🎫 Creating ticket tiers...');
    const vipTier = await db.ticketTiers.createTicketTier({
      event: event._id,
      tierId: 'vip-ringside',
      name: 'VIP Ringside',
      description: 'Premium ringside seats with exclusive perks',
      price: 25000, // $250.00
      stripePriceId: 'price_vip_rivalry_night',
      maxQuantity: 16,
      availableQuantity: 16,
      features: [
        'Ringside seating',
        'Meet & greet with fighters',
        'Premium amenities',
        'Exclusive merchandise',
      ],
      isActive: true,
      sortOrder: 2,
    });
    console.log('✅ VIP tier created:', vipTier.name);

    // const premiumTier = await db.ticketTiers.createTicketTier({
    //   event: event._id,
    //   tierId: 'premium',
    //   name: 'Premium',
    //   description: 'Great seats with premium amenities',
    //   price: 15000, // $150.00
    //   stripePriceId: 'price_premium_rivalry_night',
    //   maxQuantity: 100,
    //   availableQuantity: 100,
    //   features: [
    //     'Premium seating',
    //     'Complimentary drinks',
    //     'Priority entrance',
    //   ],
    //   isActive: true,
    //   sortOrder: 2,
    // });
    // console.log('✅ Premium tier created:', premiumTier.name);

    const generalTier = await db.ticketTiers.createTicketTier({
      event: event._id,
      tierId: 'general',
      name: 'General Admission',
      description: 'Standard admission tickets',
      price: 5000, // $50.00
      stripePriceId: 'price_1RnuUeP4zC66HIIggPWaR9Zb',
      maxQuantity: 500,
      availableQuantity: 500,
      features: ['Stadium seating', 'Access to concessions'],
      isActive: true,
      sortOrder: 1,
    });
    console.log('✅ General tier created:', generalTier.name);

    // 4. Create the main fight
    console.log('🥊 Creating main fight...');
    const mainFight = await db.fights.createFight({
      fighter1: fighter1._id,
      fighter2: fighter2._id,
      event: event._id,
      title: 'Middleweight Championship - Rodriguez vs Johnson',
      rounds: 5,
      isMainEvent: true,
    });
    console.log('✅ Main fight created:', mainFight.title);

    // 5. Set as main event
    console.log('⭐ Setting main event...');
    await db.events.setMainEvent(
      event._id.toString(),
      mainFight._id.toString()
    );
    console.log('✅ Main event set');

    // 6. Add the fight to the event
    console.log('📋 Adding fight to event...');
    await db.events.addFightToEvent(
      event._id.toString(),
      mainFight._id.toString()
    );
    console.log('✅ Fight added to event');

    console.log('🎉 Complete event setup finished!');
    console.log('');
    console.log('📊 Summary:');
    console.log(`   Event: ${event.title}`);
    console.log(`   Date: ${event.date.toLocaleDateString()}`);
    console.log(`   Venue: ${event.venue}, ${event.city}`);
    console.log(`   Main Fight: ${fighter1.name} vs ${fighter2.name}`);
    console.log(`   Ticket Tiers: ${vipTier.name}, ${generalTier.name}`);
    console.log('');
    console.log('🔗 Event Details:');
    console.log(`   Event ID: ${event._id}`);
    console.log(`   Event Slug: ${event.slug}`);
    console.log(`   Fighter 1 ID: ${fighter1._id}`);
    console.log(`   Fighter 2 ID: ${fighter2._id}`);
    console.log(`   Main Fight ID: ${mainFight._id}`);

    return {
      event,
      fighters: [fighter1, fighter2],
      fight: mainFight,
      ticketTiers: [vipTier, generalTier],
    };
  } catch (error) {
    console.error('❌ Setup failed:', error);
    throw error;
  } finally {
    await db.disconnect();
    console.log('🔌 Database disconnected');
  }
}

// Run the setup if this file is executed directly
if (require.main === module) {
  setupCompleteEvent()
    .then((result) => {
      console.log('✨ Complete event setup completed successfully!');
      console.log(
        '💡 You can now test your event in the frontend or run additional database operations.'
      );
    })
    .catch((error) => {
      console.error('💥 Setup failed:', error);
      process.exit(1);
    });
}

export { setupCompleteEvent };
