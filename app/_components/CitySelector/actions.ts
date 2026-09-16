'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { saveCity } from '@/app/_lib/citiesStore';
import { cityToSlug } from '@/app/_config/cities';

/**
 * Server Action: Save a city to recent searches and navigate to its weather page
 *
 * Used by: CitySelector component with useActionState
 * Pattern: Returns error state for UI display
 */
export async function saveRecentCity(
  prevState: { error?: string } | null,
  formData: FormData
): Promise<{ error?: string }> {
  const rawCity = formData.get('city');
  const city = typeof rawCity === 'string' ? rawCity.trim() : '';

  try {
    // Pure business logic (store) - validation + save
    const normalizedCity = saveCity(city);

    // Side effects (Next.js specific)
    revalidatePath('/');
    const slug = cityToSlug(normalizedCity);
    redirect(`/weather/${encodeURIComponent(slug)}`);

    return {};
  } catch (error) {
    // redirect() throws NEXT_REDIRECT - must re-throw it
    if (error instanceof Error && error.message === 'NEXT_REDIRECT') {
      throw error;
    }
    // Validation failed - return error for UI
    return { error: 'Please enter a valid city name' };
  }
}
