'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { getRecentCities as getRecentCitiesFromStore, saveCity } from '@/app/_lib/citiesStore';
import { cityToSlug } from '@/app/_config/cities';
import type { RecentCity } from '@/types/weather';

/**
 * Server Action: Get recent cities list
 *
 * Used by: RecentSearches component (Server Component)
 * Pattern: Direct async call in Server Component
 */
export async function getRecentCities(): Promise<RecentCity[]> {
  // Pure read from store
  return getRecentCitiesFromStore();
}

/**
 * Server Action: Extract city from FormData and redirect to its weather page
 *
 * Used by: RecentSearches component as form action
 * Pattern: Direct form action assignment, errors bubble up to framework
 */
export async function saveRecentCityFromFormData(formData: FormData): Promise<void> {
  const city = formData.get('city') as string;

  // Pure business logic (store) - validation + save
  const normalizedCity = saveCity(city);

  // Side effects (Next.js specific)
  revalidatePath('/');
  const slug = cityToSlug(normalizedCity);
  redirect(`/weather/${encodeURIComponent(slug)}`);
}
