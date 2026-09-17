import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center p-8 space-y-8">
        <h1 className="text-4xl font-bold text-foreground">City Not Found</h1>
        <p className="text-xl text-gray-600 dark:text-gray-400">
          Sorry, we couldn't find weather data for this city.
        </p>
        <div className="bg-white dark:bg-zinc-900 rounded-lg shadow-lg p-8 min-w-[300px]">
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Please check the city name or try searching for another city.
          </p>
          <Link
            href="/"
            className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
