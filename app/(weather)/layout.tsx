import { CitySelector } from '@/app/_components/CitySelector/CitySelector';

export default function WeatherLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background">
      {/* Sticky search bar */}
      <div className="sticky top-0 z-10 bg-white dark:bg-zinc-900 border-b border-gray-200 dark:border-gray-800 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <CitySelector />
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        {children}
      </div>
    </div>
  );
}
