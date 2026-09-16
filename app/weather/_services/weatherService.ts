// Server-side only weather service
// NOT exposed as public API endpoint

import { z } from 'zod';

// Zod schema for wttr.in API response
const wttrApiResponseSchema = z.object({
  current_condition: z.array(
    z.object({
      temp_C: z.string(),
      weatherDesc: z.array(
        z.object({
          value: z.string(),
        })
      ),
      weatherIconUrl: z.array(
        z.object({
          value: z.string().url(),
        })
      ),
      windspeedKmph: z.string(),
    })
  ).min(1), // At least one current condition
});

// Infer TypeScript type from Zod schema
export type WeatherResponse = z.infer<typeof wttrApiResponseSchema>['current_condition'][0];

/**
 * Fetch weather data for a city
 * @param city - City name
 * @returns Weather data or null if city not found
 * @throws Error if API returns 5xx status or validation fails
 */
export async function getWeather(city: string): Promise<WeatherResponse | null> {
  // Artificial delay to see loading.tsx (comment out for production)
  // await new Promise(resolve => setTimeout(resolve, 2000)); // 2s delay

  // Simulate 500 error for testing (comment out for production)
  // Visit /weather/error500 to trigger this
  // if (city.toLowerCase() === 'error500') {
  //   throw new Error('Weather API returned 500 - Server Error (simulated)');
  // }

  try {
    console.log(`[weatherService] Fetching weather for: ${city} at ${new Date().toISOString()}`);

    const res = await fetch(
      `https://wttr.in/${encodeURIComponent(city)}?format=j1`,
      {
        next: { revalidate: 3600 }, // ISR: cache for 1 hour, then rebuild on next request
      }
    );

    console.log(`[weatherService] Response received for: ${city} - Status: ${res.status}`);

    // Get response as text first (wttr.in returns plain text for invalid cities)
    const text = await res.text();

    // Check if response is "location not found" (plain text)
    if (text.includes('location not found')) {
      return null; // City not found
    }

    // Try to parse as JSON
    let rawData;
    try {
      rawData = JSON.parse(text);
    } catch {
      // Invalid JSON response - real server error
      throw new Error(`Weather API error: ${res.status} - Invalid JSON response`);
    }

    // Validate with Zod schema
    const result = wttrApiResponseSchema.safeParse(rawData);

    if (!result.success) {
      // Validation failed - invalid data structure
      console.error('Weather API validation error:', result.error.format());
      return null;
    }

    // Return validated data (type-safe)
    return result.data.current_condition[0];
  } catch (error) {
    // Network errors or fetch failures
    if (error instanceof Error && error.message.includes('Weather API')) {
      // Re-throw our custom errors
      throw error;
    }
    // Wrap unknown errors
    throw new Error(`Failed to fetch weather data: ${error}`);
  }
}
