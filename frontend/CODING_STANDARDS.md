# Frontend Coding Standards & Architecture Guide

This document defines the strict engineering standards, architectural boundaries, and conventions for the **React 18 / Vite / TypeScript / Tailwind CSS 4 / Radix UI** frontend of **The Trekkers Squad**.

All future frontend features, bug fixes, and AI-assisted code additions ("vibe coding") must strictly follow these rules.

---

## 1. Directory Structure & Responsibilities

```
frontend/src/app/
├── cms/            # Admin CMS dashboard, layouts, and management views
├── components/     # Reusable domain components (TripCard, BookingWidget, Footer)
│   └── ui/         # Headless Radix UI primitives & basic atoms (Button, Dialog, Card)
├── config/         # SEO config, routes, and global app constants
├── data/           # Static content (e.g. fallback homepage JSON)
├── hooks/          # Custom reusable React hooks (data extraction, listeners)
├── pages/          # Public-facing routable views (HomePage, TripDetailPage)
├── services/       # Centralized API client methods and media helpers
└── utils/          # Pure UI helpers (class merging, currency, date formatting)
```

### Component Placement Rules
- **Pages (`src/app/pages/` or `src/app/cms/pages/`)**:
  - Routable components responsible for extracting URL parameters, page layout, and setting SEO tags (`<SeoHead />`).
- **Domain Components (`src/app/components/`)**:
  - Complex widgets tied to domain data (e.g., `TripCard`, `FilterSidebar`, `BookingModal`).
- **UI Primitives (`src/app/components/ui/`)**:
  - General-purpose, unstyled or atomic UI controls based on Radix UI and Class Variance Authority (CVA) (e.g., `button.tsx`, `input.tsx`, `dialog.tsx`).
  - **No domain logic or API calls belong in `ui/`**.

---

## 2. Component Guidelines & File Size Limits

1. **Keep Components Under 250 Lines**:
   - If a page or component exceeds 250 lines, split it into smaller sub-components or extract state logic into custom hooks under `src/app/hooks/`.
2. **Naming Conventions**:
   - Component files: `kebab-case.tsx` for general components or `PascalCase.tsx` for CMS pages/primitives.
   - Component exports: Named export preferred (e.g., `export function TripCard(...)`).
3. **Props Typing**:
   - Every component must define an explicit TypeScript `interface` or `type` for its props.

---

## 3. TypeScript Standards

1. **Strict Types (No `any`)**:
   - Do not use `any`. If a value is unknown at compile time, use `unknown` and narrow it with type guards.
2. **Centralized Domain Types**:
   - Define domain entity interfaces (`Trip`, `Booking`, `User`, `Review`) in `src/app/types/` or directly next to their service definitions.
3. **Forms with React Hook Form & Zod**:
   - All forms must use `react-hook-form` paired with `@hookform/resolvers/zod`:
   ```tsx
   import { useForm } from 'react-hook-form';
   import { zodResolver } from '@hookform/resolvers/zod';
   import { z } from 'zod';

   const schema = z.object({
     fullName: z.string().min(2, 'Name is required'),
     email: z.string().email('Valid email is required'),
   });

   type FormValues = z.infer<typeof schema>;

   export function ContactForm() {
     const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormValues>({
       resolver: zodResolver(schema),
     });

     const onSubmit = async (data: FormValues) => { ... };
     return <form onSubmit={handleSubmit(onSubmit)}>...</form>;
   }
   ```

---

## 4. Routing, Lazy Loading & Bundle Splitting

1. **Dynamic Route Imports**:
   - Every page component rendered in `App.tsx` must be lazily imported using `React.lazy()` to maintain fast initial load time:
   ```tsx
   const TripDetailPage = lazy(() =>
     import('./pages/trip-detail-page').then((m) => ({ default: m.TripDetailPage }))
   );
   ```
2. **Suspense Fallback**:
   - Keep route transitions wrapped in `<Suspense fallback={<PageSkeleton />}>`.
3. **Verification**:
   - Always run `npm run build` after adding routes to ensure all chunks compile cleanly and bundle sizes remain balanced.

---

## 5. Media & Responsive Image Pipeline

Do not use raw image URLs directly in cards or hero components. Always process them through the project's media utilities in `src/app/services/api.ts`:

1. **Sized Image Transforms (`resolveMediaUrl`)**:
   - Inject width and aspect ratio so clients do not download multi-MB originals:
   ```tsx
   import { resolveMediaUrl } from '../services/api';

   <img
     src={resolveMediaUrl(trip.image, { width: 640, height: 480, crop: 'c_fill' })}
     alt={trip.title}
     loading="lazy"
   />
   ```
2. **Responsive Source Sets (`mediaSrcSet`)**:
   - For listing cards, use `mediaSrcSet` with predefined card widths:
   ```tsx
   const CARD_WIDTHS = [360, 480, 640, 800];
   srcSet={mediaSrcSet(trip.image, CARD_WIDTHS, { ar: '4:3' })}
   ```
3. **Image Fallback Handling**:
   - Provide an `onError` handler or placeholder icon if external image hosts (e.g. Unsplash) fail to load.

---

## 6. Styling Standards (Tailwind CSS 4)

1. **Design Tokens & Theme Consistency**:
   - Use the project's defined color tokens instead of arbitrary HEX colors:
     - Forest greens: `forest-600`, `forest-700`, `forest-800`
     - Navy darks: `navy-800`, `navy-900`
     - Sun accents: `sun-500`, `sun-600`
2. **Dynamic Class Merging (`cn`)**:
   - Always use the `cn(...)` utility helper (`clsx` + `tailwind-merge`) when concatenating or accepting external `className` props:
   ```tsx
   import { cn } from '../utils/cn';

   export function Badge({ className, variant, ...props }: BadgeProps) {
     return <div className={cn('inline-flex items-center rounded-full px-2.5 py-0.5', className)} {...props} />;
   }
   ```
3. **Accessibility (a11y)**:
   - Use Radix UI primitives for dialogs, modals, popovers, dropdown menus, and tabs to ensure keyboard navigation, focus management, and ARIA attributes work out-of-the-box.

---

## 7. API Client & UI State Management

1. **Centralize All API Requests**:
   - Never write `fetch('http://localhost:5001/api/...')` directly inside a component.
   - Add all API endpoints as functions inside `src/app/services/api.ts`.
2. **Account for the 4 Mandatory UI States**:
   Every async data-fetching view must handle:
   - **Loading**: Skeleton placeholder (e.g., `<TripCardSkeleton />`), disabled action buttons.
   - **Empty**: Contextual `<EmptyState />` component with clear messaging and action.
   - **Error**: User-friendly notification via Sonner (`toast.error(...)`) or inline alert banner.
   - **Success**: Render the expected UI with optimistic updates where appropriate.

