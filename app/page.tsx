import { Suspense } from 'react';
import { CitySelector } from '@/app/_components/CitySelector/CitySelector';
import { RecentSearches } from '@/app/_components/RecentSearches/RecentSearches';

export default function HomePage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center p-8 space-y-8">
        <h1 className="text-4xl font-bold text-foreground">
          Dynamic Routes Weather Dashboard
        </h1>

        <p className="text-lg text-gray-600 dark:text-gray-400 max-w-md mx-auto">
          Search for a city to see current weather conditions. Each city gets its own URL!
        </p>

        {/* City search form (Client Component) */}
        <CitySelector />

        {/* Recent searches (Client Component with useSearchParams) */}
        <Suspense fallback={<div className="text-gray-500">Loading recent searches...</div>}>
          <RecentSearches />
        </Suspense>
      </div>
    </div>
  );
}
