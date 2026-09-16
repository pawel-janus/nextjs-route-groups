// Configuration for popular cities (used for SSG pre-rendering)
// Slugs use kebab-case for SEO-friendly URLs

export const POPULAR_CITIES = [
  'warsaw',
  'london',
  'new-york',
  'tokyo',
  'paris',
] as const;

export type PopularCity = (typeof POPULAR_CITIES)[number];

/**
 * Convert URL slug to city name for API calls
 * @example 'new-york' → 'new york'
 */
export function slugToCity(slug: string): string {
  return slug.replace(/-/g, ' ');
}

/**
 * Convert city name to URL-safe slug
 * @example 'New York' → 'new-york'
 */
export function cityToSlug(city: string): string {
  return city.toLowerCase().trim().replace(/\s+/g, '-');
}

/**
 * Capitalize each word in city name
 * @example 'new york' → 'New York'
 */
export function capitalizeCity(city: string): string {
  return city
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}
