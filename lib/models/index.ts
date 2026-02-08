// Import all models to ensure they're registered with Mongoose
// This prevents "Schema hasn't been registered" errors

import Event from './Event';
import Fight from './Fight';
import Fighter from './Fighter';
import Merch from './Merch';
import TicketTier from './TicketTier';
import Transaction from './Transaction';
import User from './User';
import FlashSale from './FlashSale';
import Doll from './Doll';

// Export all models for easy access
export {
  Event,
  Fight,
  Fighter,
  Merch,
  TicketTier,
  Transaction,
  User,
  FlashSale,
  Doll,
};

// Ensure all models are registered when this file is imported
export const registerModels = () => {
  // Models are already registered by importing them above
  console.log('✅ All models registered with Mongoose');
};
