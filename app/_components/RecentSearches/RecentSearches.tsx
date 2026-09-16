import { getRecentCities, saveRecentCityFromFormData } from './actions';

/**
 * Server Component: fetches recent cities using Server Action
 * No 'use client' - this is a Server Component by default
 */
export async function RecentSearches() {
  const cities = await getRecentCities();

  /**
   * Server Action: handle city click
   * Delegates to saveRecentCityFromFormData - errors bubble up to Next.js framework
   */
  const handleCityClick = saveRecentCityFromFormData;

  if (cities.length === 0) {
    return (
      <div className="w-full max-w-md">
        <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
          Recent Searches
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-500">
          No recent searches yet. Try searching for a city!
        </p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md">
      <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
        Recent Searches
      </h3>
      <div className="flex flex-wrap gap-2">
        {cities.map((city) => (
          <form key={city.timestamp} action={handleCityClick}>
            <input type="hidden" name="city" value={city.name} />
            <button
              type="submit"
              className="px-4 py-1.5 rounded-full bg-gray-100 dark:bg-zinc-800 text-sm text-foreground hover:bg-gray-200 dark:hover:bg-zinc-700 transition-colors"
            >
              {city.name}
            </button>
          </form>
        ))}
      </div>
    </div>
  );
}
