export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center p-8 space-y-8">
        <h1 className="text-4xl font-bold text-foreground animate-pulse">
          Loading weather...
        </h1>
        <div className="bg-white dark:bg-zinc-900 rounded-lg shadow-lg p-8 min-w-[300px]">
          <div className="text-center animate-pulse">
            <div className="h-16 bg-gray-200 dark:bg-gray-700 rounded w-32 mx-auto mb-2"></div>
            <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-48 mx-auto"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24 mx-auto mt-4"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
