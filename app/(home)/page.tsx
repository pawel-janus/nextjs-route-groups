import { Suspense } from 'react';
import { CitySelector } from '@/app/_components/CitySelector/CitySelector';
import { RecentSearches } from '@/app/_components/RecentSearches/RecentSearches';

export default function HomePage() {
  return (
    <div className="text-center space-y-8">
      <h1 className="text-4xl font-bold text-foreground">
        Route Groups Weather Dashboard
      </h1>

      <p className="text-lg text-gray-600 dark:text-gray-400">
        Search for a city to see current weather conditions with a sticky search bar!
      </p>

      {/* City search form (Client Component) */}
      <CitySelector />

      {/* Recent searches */}
      <Suspense fallback={<div className="text-gray-500">Loading recent searches...</div>}>
        <RecentSearches />
      </Suspense>
    </div>
  );
}
