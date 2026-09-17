import { notFound, redirect } from 'next/navigation';
import { getWeather } from '@/app/(weather)/weather/_services/weatherService';
import { POPULAR_CITIES, slugToCity, cityToSlug, capitalizeCity } from '@/app/_config/cities';

// Pre-render popular cities at build time (SSG)
export async function generateStaticParams() {
  return POPULAR_CITIES.map((city) => ({ city }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ city: string }>;
}) {
  const { city: slug } = await params;
  const cityName = slugToCity(slug);
  const cityDisplay = capitalizeCity(cityName);

  return {
    title: `Weather in ${cityDisplay}`,
    description: `Current weather conditions in ${cityDisplay}`,
  };
}

export default async function WeatherPage({
  params,
}: {
  params: Promise<{ city: string }>;
}) {
  const { city: rawSlug } = await params;

  // Normalize: convert to slug format (lowercase, kebab-case)
  const normalizedSlug = cityToSlug(rawSlug);
  if (rawSlug !== normalizedSlug) {
    redirect(`/weather/${encodeURIComponent(normalizedSlug)}`);
  }

  // Convert slug to city name for API and display
  const cityName = slugToCity(normalizedSlug);
  const cityDisplay = capitalizeCity(cityName);

  // Fetch weather data using shared service
  // - Throws Error for 5xx (triggers app/error.tsx)
  // - Returns null for 4xx (city not found)
  // - Special case: city='error500' simulates server error
  const weather = await getWeather(cityName);

  if (!weather) {
    notFound();
  }

  const iconUrl = weather.weatherIconUrl[0].value;

  return (
    <div className="text-center space-y-8">
      <h1 className="text-4xl font-bold text-foreground">
        Weather in {cityDisplay}
      </h1>
      <div className="bg-white dark:bg-zinc-900 rounded-lg shadow-lg p-8 max-w-md mx-auto">
        <div className="text-center">
          <img
            src={iconUrl}
            alt={weather.weatherDesc[0].value}
            width={64}
            height={64}
            loading="lazy"
            className="mx-auto mb-4"
          />
          <div className="text-6xl font-bold text-foreground mb-2">
            {weather.temp_C}°C
          </div>
          <div className="text-xl text-gray-600 dark:text-gray-400">
            {weather.weatherDesc[0].value}
          </div>
          <div className="mt-4 text-sm text-gray-500 dark:text-gray-500">
            Wind: {weather.windspeedKmph} km/h
          </div>
        </div>
      </div>
    </div>
  );
}
