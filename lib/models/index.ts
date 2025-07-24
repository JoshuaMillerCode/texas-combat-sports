// Import all models to ensure they're registered with Mongoose
// This prevents "Schema hasn't been registered" errors

import Event from './Event';
import Fight from './Fight';
import Fighter from './Fighter';
import Merch from './Merch';
import TicketTier from './TicketTier';
import Transaction from './Transaction';

// Export all models for easy access
export { Event, Fight, Fighter, Merch, TicketTier, Transaction };

// Ensure all models are registered when this file is imported
export const registerModels = () => {
  // Models are already registered by importing them above
  console.log('✅ All models registered with Mongoose');
};
