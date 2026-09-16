import {
  addCityRequestSchema,
  type RecentCity,
} from '@/types/weather';

// ============================================================================
// State
// ============================================================================

// In-memory storage for recent cities (Map: city name -> RecentCity)
// This will reset when the server restarts - fine for POC
const recentCities = new Map<string, RecentCity>();

// ============================================================================
// Pure business logic (no side effects)
// ============================================================================

/**
 * Validate, normalize, and save city to storage
 * Returns normalized city name or throws validation error
 * Pure function - only state mutation, no framework side effects
 */
export function saveCity(city: string): string {
  // Validate and normalize
  const trimmedCity = city.trim();
  const validationResult = addCityRequestSchema.safeParse({ city: trimmedCity });
  if (!validationResult.success) {
    throw new Error('Invalid city name');
  }

  const normalizedCity = validationResult.data.city;

  // Save to storage
  const cityObject: RecentCity = {
    name: normalizedCity,
    timestamp: Date.now(),
  };

  recentCities.set(normalizedCity.toLowerCase(), cityObject);

  // Return normalized city for use in redirect URL
  return normalizedCity;
}

/**
 * Get recent cities from storage
 * Pure function - read-only
 */
export function getRecentCities(): RecentCity[] {
  const cities = Array.from(recentCities.values())
    .sort((a, b) => b.timestamp - a.timestamp)
    .slice(0, 5);

  return cities;
}
