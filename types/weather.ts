// Shared types for frontend and API (Zod schemas + inferred types)

import { z } from 'zod';

// Weather data schema
export const weatherDataSchema = z.object({
  temperature: z.string(),
  condition: z.string(),
  iconUrl: z.string().url(),
  windSpeed: z.string(),
});

export type WeatherData = z.infer<typeof weatherDataSchema>;

// Recent city schema
export const recentCitySchema = z.object({
  name: z
    .string()
    .min(1, 'City name is required')
    .max(50, 'City name is too long'),
  timestamp: z.number().int().positive(),
});

export type RecentCity = z.infer<typeof recentCitySchema>;

// API request/response schemas
export const addCityRequestSchema = z.object({
  city: z
    .string()
    .trim()
    .min(1, 'City name is required')
    .max(50, 'City name is too long (max 50 characters)')
    .regex(
      /^[a-zA-ZÀ-ſ\s.\-']+$/,
      'City name can only contain letters, spaces, dots, hyphens, and apostrophes'
    ),
});

export type AddCityRequest = z.infer<typeof addCityRequestSchema>;

export const addCityResponseSchema = z.object({
  success: z.boolean(),
  city: z.string(),
});

export type AddCityResponse = z.infer<typeof addCityResponseSchema>;

export const recentCitiesResponseSchema = z.object({
  cities: z.array(recentCitySchema),
});

export type RecentCitiesResponse = z.infer<typeof recentCitiesResponseSchema>;
