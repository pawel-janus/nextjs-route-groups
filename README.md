# ISR/SSG + Caching - Next.js POC

Weather application demonstrating **Incremental Static Regeneration (ISR)**, **Static Site Generation (SSG)**, **time-based revalidation**, and **cache strategies** with Next.js 16 App Router.

## Overview

This POC explores Next.js static generation strategies by pre-rendering popular cities at build time and implementing time-based cache revalidation. The application demonstrates the difference between SSR (on-demand), SSG (build-time), and ISR (static + revalidation), along with SEO-friendly URL slugs.

**Key concepts:** `generateStaticParams`, `revalidate`, SSG vs ISR vs SSR, cache strategies, kebab-case URL slugs, Cloud Run limitations.

## Tech Stack

- **Next.js 16.3.4** - React framework with App Router
- **React 19.2.8** - Server Components & form hooks
- **TypeScript** - Type safety across frontend and backend
- **Zod** - Runtime schema validation
- **Tailwind CSS v4** - Styling with CSS-based config
- **Turbopack** - Fast dev server (Rust-based)

## Key Features

### Static Site Generation (SSG)
- `generateStaticParams` - pre-render popular cities at build time
- Static HTML files in Docker image
- Instant page load (no API call on request)
- SEO-optimized (crawlers see full HTML)

### Incremental Static Regeneration (ISR)
- `revalidate: 3600` - rebuild cached pages after 1 hour
- Stale-while-revalidate pattern (show old, rebuild in background)
- Per-page revalidation (only rebuild what's needed)
- **Note:** Limited on Cloud Run (ephemeral filesystem)

### Cache Strategies
- **force-cache** - cache forever (pure SSG)
- **no-store** - no cache (pure SSR)
- **revalidate: N** - cache for N seconds, then rebuild (ISR)

### SEO-Friendly URLs
- Kebab-case slugs: `/weather/new-york` (not `/weather/newyork`)
- Automatic normalization: `/weather/New York` → redirect → `/weather/new-york`
- Proper capitalization: "New York" (not "New york")

## Project Structure

```
app/
  layout.tsx                    # Root layout, fonts, metadata
  page.tsx                      # Homepage (landing page with form)
  error.tsx                     # Global error boundary
  globals.css                   # Tailwind + theme config
  _config/
    cities.ts                   # Popular cities config + slug helpers
  _lib/
    citiesStore.ts              # Pure business logic (no framework dependencies)
  _components/
    CitySelector/
      CitySelector.tsx          # Client Component: form with Server Actions
      actions.ts                # Server Actions for CitySelector
    RecentSearches/
      RecentSearches.tsx        # Server Component: displays recent cities
      actions.ts                # Server Actions for RecentSearches
  weather/                      # Weather feature module
    _services/                  # Server-side services
      weatherService.ts         # Shared data fetching with Zod validation + revalidate
    [city]/                     # Dynamic route segment
      page.tsx                  # Weather page (Server Component) + generateStaticParams
      loading.tsx               # Loading UI (automatic)
      not-found.tsx             # 404 page for invalid cities
types/
  weather.ts                    # Shared Zod schemas + TypeScript types
```

**Key changes from POC #4:**
- ✅ **Added:** `app/_config/cities.ts` - Popular cities configuration
- ✅ **Added:** `generateStaticParams()` - Pre-render popular cities
- ✅ **Added:** `revalidate: 3600` in fetch() - ISR with 1h cache
- ✅ **Added:** Kebab-case URL slugs (`new-york`, not `newyork`)
- ✅ **Added:** Slug normalization helpers (`slugToCity`, `cityToSlug`)
- 🔄 **Updated:** `weatherService.ts` - changed from `cache: 'no-store'` to `revalidate: 3600`
- 🔄 **Updated:** `page.tsx` - added URL normalization (redirect to canonical slug)

## Getting Started

### Prerequisites
- Node.js 20+
- npm

### Installation

```bash
# Install dependencies
npm install

# Build for production (see SSG in action)
npm run build

# Run production server
node .next/standalone/server.js
```

Open [http://localhost:3000](http://localhost:3000)

### Usage

1. **Homepage:** Landing page with city search form
2. **Search city:** Type city name (e.g., "New York") → Submit
3. **Popular cities:** Pre-rendered (instant load) - Warsaw, London, New York, Tokyo, Paris
4. **Other cities:** SSR on-demand (fetch from API, then cache for 1h)
5. **Recent searches:** Click any recent city (Server Action redirect)

## How It Works

### Static Site Generation (SSG)

**Pre-render popular cities at build time:**

```typescript
// app/_config/cities.ts
export const POPULAR_CITIES = [
  'warsaw',
  'london',
  'new-york',    // ← kebab-case for SEO
  'tokyo',
  'paris',
] as const;
```

```typescript
// app/weather/[city]/page.tsx
import { POPULAR_CITIES } from '@/app/_config/cities';

export async function generateStaticParams() {
  return POPULAR_CITIES.map((city) => ({ city }));
}
```

**Build output:**
```
● (SSG) prerendered as static HTML (uses generateStaticParams)
  ├ ● /weather/warsaw
  ├ ● /weather/london
  ├ ● /weather/new-york
  ├ ● /weather/tokyo
  └ ● /weather/paris
```

**Physical files:**
```
.next/server/app/weather/
  warsaw.html       ← Pre-rendered HTML (instant load)
  london.html
  new-york.html
  tokyo.html
  paris.html
  [city]/           ← Dynamic route handler (for non-popular cities)
```

### Incremental Static Regeneration (ISR)

**Time-based revalidation:**

```typescript
// app/weather/_services/weatherService.ts
const res = await fetch(`https://wttr.in/${city}?format=j1`, {
  next: { revalidate: 3600 },  // Cache for 1 hour, then rebuild
});
```

**How it works (theory):**
1. Build time (10:00): Pre-render Warsaw with weather data
2. User A (10:30): Cache HIT → instant load (data from 10:00)
3. User B (11:01): Cache EXPIRED → show old data, rebuild in background
4. User C (11:02): Cache HIT → show fresh data (from rebuild at 11:01)

**Stale-while-revalidate pattern:**
- User never waits for fresh data (always instant)
- Rebuild happens in background
- Next user gets fresh data

### Cloud Run Limitations

⚠️ **ISR has limitations on Cloud Run:**

| Issue | Problem | Impact |
|-------|---------|--------|
| **Scale-to-zero** | Container stops → cache lost | Cold start = empty cache |
| **Ephemeral FS** | `.next/cache/` is temporary | Cache doesn't persist |
| **Multi-instance** | Each instance has own cache | Cache not shared between containers |

**What works:**
- ✅ `generateStaticParams` - pre-rendered pages in Docker image (persistent)
- ✅ `revalidate` - within single instance lifetime (if container lives)

**What doesn't work:**
- ❌ `revalidate` - after cold start (cache lost)
- ❌ `revalidate` - across multiple instances (not shared)

**Why we use it anyway:**
- Pre-rendered popular cities = instant load (always works)
- Revalidation = nice-to-have (works when container is warm)
- Each instance caches independently = still reduces API calls at scale

**Production solution (if needed):**
- Redis/Memorystore for shared distributed cache
- Vercel (ISR works perfectly, distributed cache built-in)
- `min-instances=1` to keep container warm (costs ~$10-20/month)

### SEO-Friendly URL Slugs

**Problem:** `/weather/newyork` is hard to read

**Solution:** Kebab-case slugs

```typescript
// app/_config/cities.ts
export function slugToCity(slug: string): string {
  return slug.replace(/-/g, ' ');  // 'new-york' → 'new york'
}

export function cityToSlug(city: string): string {
  return city.toLowerCase().trim().replace(/\s+/g, '-');  // 'New York' → 'new-york'
}

export function capitalizeCity(city: string): string {
  return city
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');  // 'new york' → 'New York'
}
```

**URL normalization:**

```typescript
// app/weather/[city]/page.tsx
export default async function WeatherPage({ params }) {
  const { city: rawSlug } = await params;
  
  // Normalize: convert to slug format (lowercase, kebab-case)
  const normalizedSlug = cityToSlug(rawSlug);
  if (rawSlug !== normalizedSlug) {
    redirect(`/weather/${encodeURIComponent(normalizedSlug)}`);
  }
  
  // Convert slug to city name for API and display
  const cityName = slugToCity(normalizedSlug);  // 'new york'
  const cityDisplay = capitalizeCity(cityName);  // 'New York'
  
  const weather = await getWeather(cityName);
  
  return <h1>Weather in {cityDisplay}</h1>;
}
```

**Examples:**
```
/weather/new-york      → OK (canonical)
/weather/New%20York    → redirect → /weather/new-york
/weather/NEW-YORK      → redirect → /weather/new-york
/weather/london        → OK (canonical)
/weather/London        → redirect → /weather/london
```

### Cache Strategies Comparison

| Strategy | Config | Use case |
|----------|--------|----------|
| **SSG (force-cache)** | `cache: 'force-cache'` | Static content (blog posts, docs) |
| **SSR (no-store)** | `cache: 'no-store'` | Real-time data (stock prices, live scores) |
| **ISR (revalidate)** | `next: { revalidate: 3600 }` | Semi-static data (weather, news, product pages) |

**This POC uses ISR:**
- Popular cities: pre-rendered (SSG) + revalidate 1h (ISR)
- Other cities: SSR on-demand, then cached 1h

## Build for Production

```bash
# Build (see pre-rendered pages)
npm run build

# Output shows:
# ● (SSG) prerendered as static HTML
#   ├ ● /weather/warsaw
#   ├ ● /weather/london
#   └ ● /weather/new-york

# Run production server
node .next/standalone/server.js
```

**Verify pre-rendering:**
```bash
# Check physical files
ls -la .next/server/app/weather/

# Output:
# warsaw.html       ← Pre-rendered!
# london.html
# new-york.html
# tokyo.html
# paris.html
```

**Test locally:**
```bash
# Popular city (instant load, no API call in logs)
curl http://localhost:3000/weather/warsaw

# Non-popular city (API call in logs)
curl http://localhost:3000/weather/krakow

# Check logs:
# [weatherService] Fetching weather for: krakow  ← SSR on-demand
```

## Docker Build

Multi-stage Dockerfile optimized for Cloud Run:

```bash
# Build locally
docker build -t nextjs-isr-ssg:latest .

# Run locally
docker run -p 3000:3000 nextjs-isr-ssg:latest
```

**Pre-rendered pages are in Docker image** (not lost on cold start!)

## Cloud Run Deployment

### Prerequisites

**GCP Setup (one-time for all Next.js POCs):**
```bash
# Artifact Registry repository already exists: nextjs-apps
# Service Account already exists: nextjs-apps-sa
# See POC #1 documentation for initial setup
```

### Deploy to Cloud Run

```bash
# Set variables
PROJECT_ID=native-dev-506112
REGION=europe-central2
SERVICE_NAME=nextjs-isr-ssg

# 1. Build Docker image with Cloud Build
gcloud builds submit \
  --account=paweljanus.gcp@gmail.com \
  --project=${PROJECT_ID} \
  --tag ${REGION}-docker.pkg.dev/${PROJECT_ID}/nextjs-apps/${SERVICE_NAME}:latest

# 2. Deploy to Cloud Run
gcloud run deploy ${SERVICE_NAME} \
  --account=paweljanus.gcp@gmail.com \
  --project=${PROJECT_ID} \
  --image=${REGION}-docker.pkg.dev/${PROJECT_ID}/nextjs-apps/${SERVICE_NAME}:latest \
  --platform=managed \
  --region=${REGION} \
  --service-account=nextjs-apps-sa@${PROJECT_ID}.iam.gserviceaccount.com \
  --allow-unauthenticated \
  --port=3000 \
  --memory=512Mi \
  --cpu=1 \
  --min-instances=0 \
  --max-instances=10
```

### Get Service URL

```bash
gcloud run services describe ${SERVICE_NAME} \
  --account=paweljanus.gcp@gmail.com \
  --project=${PROJECT_ID} \
  --region=${REGION} \
  --format='value(status.url)'
```

### Verify in Production

```bash
# Get the service URL
SERVICE_URL=$(gcloud run services describe ${SERVICE_NAME} \
  --account=paweljanus.gcp@gmail.com \
  --project=${PROJECT_ID} \
  --region=${REGION} \
  --format='value(status.url)')

# Test pre-rendered city (instant)
curl -s ${SERVICE_URL}/weather/warsaw | grep "°C"

# Test non-popular city (SSR on-demand)
curl -s ${SERVICE_URL}/weather/krakow | grep "°C"

# Test URL normalization
curl -I ${SERVICE_URL}/weather/New%20York
# Should return 307 redirect to /weather/new-york
```

## What I Learned

### SSG vs ISR vs SSR

| | SSG | ISR | SSR |
|---|-----|-----|-----|
| **Render time** | Build time | Build + runtime | Runtime only |
| **Data freshness** | Stale (from build) | Fresh (revalidate) | Always fresh |
| **Performance** | Instant | Instant (stale) | Slow (fetch) |
| **Use case** | Static content | Semi-static content | Real-time data |
| **Next.js config** | `generateStaticParams` | `+ revalidate: N` | `cache: 'no-store'` |

### generateStaticParams

```typescript
export async function generateStaticParams() {
  return [
    { city: 'warsaw' },
    { city: 'london' },
  ];
}
```

**What it does:**
- Pre-renders these routes at build time
- Creates static HTML files
- Instant page load (no API call)
- SEO-friendly (crawlers see full HTML)

**When to use:**
- Popular pages (top 20% traffic = 80% coverage)
- Known routes (blog posts, product pages)
- Static content (docs, marketing)

**When NOT to use:**
- User-generated routes (infinite possibilities)
- Personalized pages (different for each user)
- Real-time data (stock prices, live scores)

### Next.js fetch() Extensions

**Standard Web API:**
```typescript
fetch(url, {
  cache: 'default' | 'no-store' | 'reload' | 'no-cache' | 'force-cache',
})
```

**Next.js extensions:**
```typescript
fetch(url, {
  next: {
    revalidate: 3600,        // ISR: cache for 1h
    tags: ['weather'],       // On-demand revalidation
  }
})
```

⚠️ **Only works in Server Components/Actions!** (Client Components use standard fetch)

### Cloud Run + Ephemeral Filesystem

**The problem:**
- Cloud Run containers have temporary filesystem
- `.next/cache/` is not persistent
- Scale-to-zero = cache lost
- Multi-instance = cache not shared

**What persists:**
- Docker image files (pre-rendered HTML ✅)
- Environment variables ✅
- Code ✅

**What doesn't persist:**
- `.next/cache/` (ISR cache ❌)
- In-memory state (recentCities Map ❌)
- Uploaded files ❌

**Solutions:**
1. **Use what persists:** `generateStaticParams` works (in Docker image)
2. **External cache:** Redis/Memorystore for distributed cache
3. **Accept limitations:** Pre-render popular pages, SSR for rest
4. **min-instances=1:** Keep container warm (costs money)

### Kebab-case URL Slugs

**Why:**
- SEO: `/weather/new-york` is more readable than `/weather/newyork`
- Accessibility: Screen readers pronounce "new-york" correctly
- Standards: Google recommends hyphens over underscores/spaces

**Implementation:**
```typescript
// User input: "New York"
cityToSlug("New York")  // → "new-york" (URL)
slugToCity("new-york")  // → "new york" (API)
capitalizeCity("new york")  // → "New York" (display)
```

## Development Progress

### Phase 1: Project Setup ✅
- Forked from POC #4 (nextjs-server-actions)
- Removed `.git`, `.next`, `node_modules`
- Updated `package.json` name to `nextjs-isr-ssg`
- Initialized fresh git repo with personal GitHub config
- Created initial commit

### Phase 2: Popular Cities Config ✅
- Created `app/_config/cities.ts`
- Defined `POPULAR_CITIES` array (kebab-case slugs)
- Added helper functions: `slugToCity`, `cityToSlug`, `capitalizeCity`

### Phase 3: Static Site Generation ✅
- Added `generateStaticParams()` in `app/weather/[city]/page.tsx`
- Maps `POPULAR_CITIES` to pre-rendered routes
- Build output shows `● (SSG)` for popular cities

### Phase 4: ISR Revalidation ✅
- Changed `weatherService.ts` from `cache: 'no-store'` to `next: { revalidate: 3600 }`
- Added console logs to track API calls
- Popular cities: no logs (pre-rendered)
- Other cities: logs show API fetch (SSR on-demand)

### Phase 5: URL Normalization ✅
- Added slug normalization in `page.tsx`
- Redirect `/weather/New York` → `/weather/new-york`
- Updated Server Actions to use `cityToSlug()`
- Proper capitalization in display (`capitalizeCity`)

### Phase 6: Documentation ✅
- Updated README for POC #5
- Explained SSG vs ISR vs SSR
- Documented Cloud Run limitations
- Added slug helpers documentation

## Commits

Clean git history:
1. `Initial commit - forked from POC #4 (nextjs-server-actions)`
2. `Add ISR/SSG with generateStaticParams and revalidate`

Each commit represents a complete working state.

**GitHub:** (to be created after deployment)

## Part of Next.js POC Series

This is POC #5 in a series exploring Next.js App Router patterns:
1. ✅ **Next.js SSR Basics** - Server-Side Rendering fundamentals
2. ✅ **Interactive Weather Dashboard** - Client Components + API Routes
3. ✅ **Dynamic Routes Weather Dashboard** - File-based routing patterns
4. ✅ **Server Actions + Forms** - React 19 form hooks, progressive enhancement
5. ✅ **ISR/SSG + Caching** ← You are here
6. 🔄 **Route Groups** - Organizing routes without URL changes
7. 🔄 **Optimizations** - Image, Script, Bundle analysis
8. 🔄 **Advanced Routing** - Parallel + Intercepting Routes
9. 🔄 **Auth + Middleware** - NextAuth.js + protected routes
10. 🔄 **Database Integration** - Firestore + Server Components

---

**Learning focus:** ISR, SSG, generateStaticParams, cache strategies, Cloud Run limitations  
**Status:** ✅ Complete  
**Production:** Deployed to Cloud Run (see deployment instructions above for URL)  
**Repository:** https://github.com/pawel-janus/nextjs-isr-ssg  
**Next POC:** #6 - Route Groups
