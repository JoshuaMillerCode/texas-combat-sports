/**
 * Feature Flags Configuration
 *
 * This file controls feature availability across the application.
 * Change TICKET_SALES_ENABLED to false to disable ticket purchasing
 * and show "coming soon" popups instead.
 */

export const FEATURE_FLAGS = {
  // Set to false to disable ticket sales and show "coming soon" popup
  TICKET_SALES_ENABLED: true,
  // Set to false to disable flash sale functionality
  FLASH_SALES_ENABLED: true,
} as const;

export type FeatureFlag = keyof typeof FEATURE_FLAGS;

/**
 * Check if a feature is enabled
 */
export function isFeatureEnabled(flag: FeatureFlag): boolean {
  return FEATURE_FLAGS[flag];
}

/**
 * Get all feature flags (useful for debugging)
 */
export function getAllFeatureFlags() {
  return { ...FEATURE_FLAGS };
}
