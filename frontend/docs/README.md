# Frontend Architecture & System Documentation

Welcome to the frontend technical documentation for **The Trekkers Squad** platform.

This document details the architecture, routing structure, user journeys, design system, media pipeline, and build workflows for the client-side application.

---

## 1. System Overview

The Trekkers Squad Frontend is a modern, high-performance Single Page Application (SPA) built with **React 18**, **TypeScript**, **Vite**, and **Tailwind CSS 4**. It provides two unified interfaces within a single web application:
1. **Public Customer Marketplace**: An adventure travel portal allowing travelers to discover trips by category/country/difficulty, check departure dates, review itineraries and guides, rent adventure equipment, and complete reservations.
2. **Back-Office CMS**: A full-featured management dashboard for administrators to oversee bookings, edit trips, configure pricing, write blog articles, track rentals, and customize homepage content.

---

## 2. Technology Stack

- **Framework & Runtime**: React 18 with TypeScript
- **Bundler & Dev Server**: Vite 6.x
- **Routing**: React Router DOM (v7) with route-level code splitting
- **Styling**: Tailwind CSS 4 with custom CSS design tokens
- **Headless UI Primitives**: Radix UI (`@radix-ui/react-*`)
- **Forms & Validation**: React Hook Form with `@hookform/resolvers/zod`
- **Component Variants**: Class Variance Authority (`cva`) with `tailwind-merge` (`cn` helper)
- **Icons & Motion**: Lucide React (`lucide-react`) and Framer Motion / Motion
- **Toasts & Feedback**: Sonner (`sonner`)
- **Charts & PDF**: Recharts (admin analytics) and jsPDF / html2canvas (ticket downloading)

---

## 3. Directory Layout & Architecture

```
frontend/
├── public/                 # Static assets (favicons, SVG logos)
├── docs/                   # Frontend technical documentation
├── src/
│   ├── app/
│   │   ├── cms/            # Back-office CMS pages, layouts, and forms
│   │   │   ├── components/ # CMS-specific widgets (StatCard, EmptyState, DataTable)
│   │   │   ├── layout/     # CMS Sidebar, Header, and authentication wrapper
│   │   │   ├── pages/      # CMS views (Dashboard, Bookings, Trips, Blog, Settings)
│   │   │   └── trips/      # Multi-step Trip creation & edit wizards
│   │   ├── components/     # Customer-facing domain components
│   │   │   ├── ui/         # Headless Radix UI building blocks (Button, Dialog, Card)
│   │   │   ├── navigation/ # Header, mobile drawer, category flyouts
│   │   │   ├── trip-card.tsx
│   │   │   ├── booking-widget.tsx
│   │   │   └── footer.tsx
│   │   ├── config/         # SEO metadata dictionary and app routes
│   │   ├── data/           # Default fallback JSON (homepage, default trip notes)
│   │   ├── hooks/          # Custom reusable React hooks
│   │   ├── pages/          # Public-facing routed pages
│   │   │   ├── about/      # Team and about sub-pages
│   │   │   ├── all-trips-page.tsx
│   │   │   ├── trip-detail-page.tsx
│   │   │   ├── checkout-page.tsx
│   │   │   └── booking-confirmation-page.tsx
│   │   ├── services/       # Centralized API client & media utilities
│   │   ├── styles/         # CSS design tokens, typography, and theme variables
│   │   ├── utils/          # Formatting helpers (cn, currency, date formatting)
│   │   └── App.tsx         # Main route declarations & Suspense boundaries
│   ├── index.css           # Global Tailwind CSS entry
│   └── main.tsx            # React root mount
├── .env.example            # Environment template (VITE_API_URL)
├── package.json            # Dependencies and npm scripts
└── vite.config.ts          # Vite build and plugin configurations
```

---

## 4. Routing & Performance Strategy

### 4.1 Route-Level Code Splitting
To ensure fast Time-to-Interactive (TTI) and minimal initial bundle size, all routes in `src/app/App.tsx` are code-split using `React.lazy()`:

```tsx
const TripDetailPage = lazy(() =>
  import('./pages/trip-detail-page').then((m) => ({ default: m.TripDetailPage }))
);
```

### 4.2 Suspense Boundaries & Route Categories
- **Public Customer Routes**:
  - `/`: Home page with featured trips, reviews, and dynamic content.
  - `/trips/:categorySlug` and `/trips/:categorySlug/:subcategorySlug`: Dynamic category listings with multi-faceted filtering.
  - `/all-trips`: Global search and filter catalogue.
  - `/calendar`: Interactive departure date calendar.
  - `/trip/:id` (or `/trip/:slug`): Long-form trip overview, day-by-day itinerary, guides, gear, and booking drawer.
  - `/trip/:id/details` $\rightarrow$ `/trip/:id/checkout` $\rightarrow$ `/trip/:id/confirmation/:bookingId`: Full booking funnel.
- **Admin CMS Routes (`/cms/*`)**:
  - `/cms/login`: Authentication screen for staff and admins.
  - `/cms/dashboard`: Metrics overview (total bookings, revenue, active trips).
  - `/cms/trips`, `/cms/bookings`, `/cms/rentals`, `/cms/blogs`, `/cms/settings`: Dedicated CRUD management views.

---

## 5. Key Customer & Admin Flows

### 5.1 The Traveler Booking Flow
1. **Discovery**: Traveler filters by destination, duration, difficulty, or price.
2. **Departure Selection**: Selects a verified departure date on the trip detail page.
3. **Traveler Details**: Fills passenger details, emergency contacts, and dietary requirements.
4. **Add-Ons & Rentals**: Selects optional comfort add-ons or trekking gear rentals.
5. **Checkout**: Enters payment/reservation details.
6. **Ticket Generation**: Confirmation page renders a booking voucher with a **tamper-proof signed QR Code** exportable as a PDF.

### 5.2 The CMS Management Flow
1. **Authentication**: Admin logs in using JWT credentials stored in secure local storage.
2. **Trip Authoring**: Create trips with multi-day itineraries, upload photos, configure recurrence rules, and assign certified guides.
3. **Booking Verification**: View incoming passenger manifests, inspect traveler details, and update reservation statuses.

---

## 6. Design System & Styling Conventions

### 6.1 Tailwind CSS 4 Design Tokens
The application uses a semantic design token palette declared in `src/app/styles/design-tokens.css`:
- **Forest Green** (`--color-forest-*`): Primary brand color symbolizing nature and adventure.
- **Deep Navy** (`--color-navy-*`): Secondary brand color for typography, dark headers, and cards.
- **Sun Gold** (`--color-sun-*`): Accent color for calls to action, badges, and highlights.

### 6.2 The `cn` Class Merging Helper
All dynamic class combinations must use the `cn(...)` utility helper:
```tsx
import { cn } from '../utils/cn';

export function Button({ className, variant, ...props }: ButtonProps) {
  return <button className={cn('px-4 py-2 rounded-lg font-medium', className)} {...props} />;
}
```

---

## 7. Media & Responsive Image Pipeline

Because trips and banners rely on photography, the frontend includes an automated media transformer (`src/app/services/api.ts`):

- **`resolveMediaUrl(url, transform)`**: Automatically appends responsive query parameters (`w=`, `h=`, `fit=crop`, `auto=format`) for external CDNs (Unsplash / Cloudinary) and maps local `/uploads/...` paths to the active backend origin.
- **`mediaSrcSet(url, widths)`**: Generates responsive `srcSet` strings ensuring mobile devices download lightweight variants instead of full-size assets.

---

## 8. Development & Build Commands

From the `frontend/` directory:

| Command | Purpose |
| :--- | :--- |
| `npm run dev` | Starts Vite local development server on `http://localhost:5173` |
| `npm run build` | Compiles TypeScript and creates optimized production assets in `dist/` |
| `npm run preview`| Locally serves the production `dist/` bundle for testing |

