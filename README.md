# Route Groups + Organization - Next.js POC

Weather application demonstrating **Route Groups**, **different layouts per section**, **code organization without URL changes**, and **nested layout patterns** with Next.js 16 App Router.

## Overview

This POC explores Next.js Route Groups by organizing code into logical sections (home, weather) with different layouts, while keeping URLs unchanged. The application demonstrates how to use parentheses folders `(name)` for organization and layout isolation without affecting routing.

**Key concepts:** Route Groups `(folder)`, per-group layouts, sticky navigation, code organization, layout composition.

## Tech Stack

- **Next.js 16.3.4** - React framework with App Router
- **React 19.2.8** - Server Components & form hooks
- **TypeScript** - Type safety across frontend and backend
- **Zod** - Runtime schema validation
- **Tailwind CSS v4** - Styling with CSS-based config
- **Turbopack** - Fast dev server (Rust-based)

## Key Features

### Route Groups
- `(home)` - landing page with centered hero layout
- `(weather)` - weather pages with sticky search bar
- Folders with parentheses are **ignored by routing**
- Organize code by functionality, not by URL structure

### Different Layouts Per Group
- **Home layout:** Centered, hero-style presentation
- **Weather layout:** Sticky search bar on top, always accessible
- Layouts defined per group, no code duplication
- Nested layout composition (root → group → page)

### Code Organization
- Group routes by feature/section, not URL
- Shared loading/error states per group
- Clear separation of concerns
- Zero impact on routing

## Project Structure

```
app/
  layout.tsx                    # Root layout (fonts, metadata)
  error.tsx                     # Global error boundary
  globals.css                   # Tailwind + theme config
  _components/                  # Shared components
    CitySelector/
      CitySelector.tsx
      actions.ts
    RecentSearches/
      RecentSearches.tsx
      actions.ts
  _config/
    cities.ts                   # Popular cities config
  _lib/
    citiesStore.ts              # Pure business logic
  (home)/                       # ← Route Group (not in URL!)
    layout.tsx                  # Centered hero layout
    page.tsx                    # Homepage (URL: /)
  (weather)/                    # ← Route Group (not in URL!)
    layout.tsx                  # Sticky search bar layout
    weather/
      [city]/
        page.tsx                # Weather detail (URL: /weather/warsaw)
        loading.tsx             # Loading UI
        not-found.tsx           # 404 page
      _services/
        weatherService.ts       # Weather API logic
types/
  weather.ts                    # Shared Zod schemas
```

**Key changes from POC #5:**
- ✅ **Added:** Route Groups `(home)` and `(weather)`
- ✅ **Added:** Per-group layouts (centered vs sticky)
- 🔄 **Moved:** `app/page.tsx` → `app/(home)/page.tsx`
- 🔄 **Moved:** `app/weather/` → `app/(weather)/weather/`
- 📁 **Organization:** Code grouped by section, not URL

**URLs (unchanged!):**
- `/` → `(home)/page.tsx`
- `/weather/warsaw` → `(weather)/weather/[city]/page.tsx`

## Getting Started

### Prerequisites
- Node.js 20+
- npm

### Installation

```bash
# Install dependencies
npm install

# Run dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### Usage

1. **Homepage (`/`):** Centered layout with search form
2. **Search city:** Type city name → Submit
3. **Weather page (`/weather/warsaw`):** **Sticky search bar on top** (scroll to see)
4. **Switch cities:** Search bar always accessible (sticky)
5. **Recent searches:** Click any city

## How It Works

### Route Groups - Organization Without URL Impact

**Folders with parentheses are ignored by routing:**

```
app/
  (home)/
    page.tsx          → URL: /         (NOT /(home)/)
  (weather)/
    weather/[city]/
      page.tsx        → URL: /weather/warsaw  (NOT /(weather)/weather/)
```

**The `(home)` and `(weather)` folders exist only for organization!**

### Different Layouts Per Group

**Home Layout (centered, hero style):**

```typescript
// app/(home)/layout.tsx
export default function HomeLayout({ children }) {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-full max-w-2xl px-8">
        {children}  {/* page.tsx content */}
      </div>
    </div>
  );
}
```

**Weather Layout (sticky search bar):**

```typescript
// app/(weather)/layout.tsx
import { CitySelector } from '@/app/_components/CitySelector/CitySelector';

export default function WeatherLayout({ children }) {
  return (
    <div className="min-h-screen">
      {/* Sticky search bar */}
      <div className="sticky top-0 z-10 bg-white border-b shadow-sm">
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
```

**How layouts compose:**

```
Root Layout (fonts, metadata)
  ├─ HomeLayout (centered)
  │   └─ HomePage
  └─ WeatherLayout (sticky search)
      └─ WeatherPage
```

### When to Use Route Groups

✅ **Use Route Groups when:**
- Different sections need different layouts
- You want to organize code by functionality
- Need shared loading/error states per section
- Want to group routes without affecting URLs

❌ **Don't use Route Groups when:**
- URL structure matches your organization (just use folders)
- All pages share the same layout
- You want the folder to appear in the URL

### Route Groups vs Regular Folders

| Type | Folder | URL | Use case |
|------|--------|-----|----------|
| **Regular** | `app/dashboard/page.tsx` | `/dashboard` | Folder = URL segment |
| **Route Group** | `app/(app)/dashboard/page.tsx` | `/dashboard` | Organization only |

**Route Groups = invisible folders for organization!**

### Layout Hierarchy

```typescript
// app/layout.tsx (Root)
<html>
  <body>
    {children}  // ← HomeLayout or WeatherLayout
  </body>
</html>

// app/(home)/layout.tsx
<div className="centered">
  {children}  // ← HomePage
</div>

// app/(weather)/layout.tsx
<div>
  <StickySearchBar />
  {children}  // ← WeatherPage
</div>
```

**Each layout wraps its children, creating nested structure.**

## Build for Production

```bash
npm run build
npm start
```

## Docker Build

Multi-stage Dockerfile optimized for Cloud Run:

```bash
# Build locally
docker build -t nextjs-route-groups:latest .

# Run locally
docker run -p 3000:3000 nextjs-route-groups:latest
```

## Cloud Run Deployment

### Prerequisites

**GCP Setup (one-time):**

1. **Create Artifact Registry repository:**
```bash
gcloud artifacts repositories create nextjs-apps \
  --repository-format=docker \
  --location=YOUR_REGION \
  --project=YOUR_PROJECT_ID
```

2. **Create Service Account:**
```bash
gcloud iam service-accounts create nextjs-apps-sa \
  --display-name="Next.js Apps Service Account" \
  --project=YOUR_PROJECT_ID
```

### Deploy to Cloud Run

```bash
# Set variables
PROJECT_ID=YOUR_PROJECT_ID
REGION=YOUR_REGION  # e.g., europe-central2, us-central1
SERVICE_NAME=nextjs-route-groups
ACCOUNT=YOUR_EMAIL@gmail.com

# 1. Build Docker image with Cloud Build
gcloud builds submit \
  --account=${ACCOUNT} \
  --project=${PROJECT_ID} \
  --tag ${REGION}-docker.pkg.dev/${PROJECT_ID}/nextjs-apps/${SERVICE_NAME}:latest

# 2. Deploy to Cloud Run
gcloud run deploy ${SERVICE_NAME} \
  --account=${ACCOUNT} \
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
  --account=${ACCOUNT} \
  --project=${PROJECT_ID} \
  --region=${REGION} \
  --format='value(status.url)'
```

### Verify in Production

```bash
# Get the service URL
SERVICE_URL=$(gcloud run services describe ${SERVICE_NAME} \
  --account=${ACCOUNT} \
  --project=${PROJECT_ID} \
  --region=${REGION} \
  --format='value(status.url)')

# Test homepage (centered layout)
curl -s ${SERVICE_URL}/ | grep "Route Groups"

# Test weather page (sticky search bar layout)
curl -s ${SERVICE_URL}/weather/warsaw | grep "Weather in Warsaw"
```

## What I Learned

### Route Groups Pattern

**Problem:** Different sections need different layouts, but folders affect URLs.

**Solution:** Route Groups `(name)` - folders that don't create URL segments.

```
Before (POC #5):
app/
  page.tsx                     # Landing
  weather/[city]/page.tsx      # Weather
  # All pages share root layout

After (POC #6):
app/
  (home)/
    layout.tsx                 # Centered layout
    page.tsx                   # Landing
  (weather)/
    layout.tsx                 # Sticky search bar
    weather/[city]/page.tsx    # Weather
  # Each group has its own layout
```

### Why Parentheses?

**Next.js ignores folders with `(name)` when building routes:**

```typescript
// File structure:
app/(marketing)/pricing/page.tsx

// URL:
/pricing  (NOT /(marketing)/pricing)
```

**The `(marketing)` folder:**
- ✅ Organizes code
- ✅ Can have its own layout
- ✅ Can have shared loading/error states
- ❌ Does NOT appear in URL

### Layout Composition

**Layouts nest from root to leaf:**

```
Request: /weather/warsaw

Rendered as:
<RootLayout>           {/* app/layout.tsx */}
  <WeatherLayout>      {/* app/(weather)/layout.tsx */}
    <WeatherPage />    {/* app/(weather)/weather/[city]/page.tsx */}
  </WeatherLayout>
</RootLayout>
```

**Each layout receives the next level as `children` prop.**

### Sticky Navigation Pattern

**Weather layout with sticky search:**

```typescript
<div className="sticky top-0 z-10 bg-white border-b">
  <CitySelector />  {/* Always visible at top */}
</div>
<div>
  {children}  {/* Weather content scrolls */}
</div>
```

**Benefits:**
- Search bar always accessible
- Easy to switch between cities
- No need to scroll back up
- Better UX for exploring multiple cities

### When to Use Route Groups

| Scenario | Use Route Group? | Why |
|----------|------------------|-----|
| Marketing vs App sections | ✅ Yes | Different layouts (landing vs dashboard) |
| Public vs authenticated pages | ✅ Yes | Different navigation/sidebar |
| Desktop vs mobile views | ❌ No | Use responsive CSS instead |
| v1 vs v2 API | ❌ No | Use `/api/v1/` vs `/api/v2/` URLs |
| Features grouped by team | ✅ Yes | Organize code by ownership |

**Rule:** Use Route Groups for **layout isolation** and **code organization**, not for **URL versioning** or **responsive design**.

## Development Progress

### Phase 1: Project Setup ✅
- Forked from POC #5 (nextjs-isr-ssg)
- Removed `.git`, `.next`, `node_modules`
- Updated `package.json` name to `nextjs-route-groups`
- Initialized fresh git repo with personal GitHub config
- Created initial commit

### Phase 2: Create Route Groups ✅
- Created `app/(home)/` folder
- Created `app/(weather)/` folder
- Moved `app/page.tsx` → `app/(home)/page.tsx`
- Moved `app/weather/` → `app/(weather)/weather/`

### Phase 3: Add Group Layouts ✅
- Created `app/(home)/layout.tsx` - centered hero layout
- Created `app/(weather)/layout.tsx` - sticky search bar layout
- Updated page components to remove duplicate layout code
- Tested layout composition (root → group → page)

### Phase 4: Deployment ✅
- Built Docker image with Cloud Build
- Deployed to Cloud Run
- Verified sticky search bar works
- URLs unchanged from POC #5

## Commits

Clean git history:
1. `Initial commit - forked from POC #5 (nextjs-isr-ssg)`
2. `Add Route Groups with per-section layouts`

Each commit represents a complete working state.

**GitHub:** (to be created after deployment)

## Part of Next.js POC Series

This is POC #6 in a series exploring Next.js App Router patterns:
1. ✅ **Next.js SSR Basics** - Server-Side Rendering fundamentals
2. ✅ **Interactive Weather Dashboard** - Client Components + API Routes
3. ✅ **Dynamic Routes Weather Dashboard** - File-based routing patterns
4. ✅ **Server Actions + Forms** - React 19 form hooks, progressive enhancement
5. ✅ **ISR/SSG + Caching** - Static generation + revalidation
6. ✅ **Route Groups + Organization** ← You are here
7. 🔄 **Optimizations** - Image, Script, Bundle analysis
8. 🔄 **Advanced Routing** - Parallel + Intercepting Routes
9. 🔄 **Auth + Middleware** - NextAuth.js + protected routes
10. 🔄 **Database Integration** - Firestore + Server Components

---

**Learning focus:** Route Groups, layout composition, sticky navigation, code organization  
**Status:** ✅ Complete  
**Production:** Deployed to Cloud Run (use deployment instructions above)  
**Repository:** https://github.com/pawel-janus/nextjs-route-groups  
**Next POC:** #7 - Optimizations
