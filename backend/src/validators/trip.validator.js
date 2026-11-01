import { z } from 'zod';

const emptyToUndefined = (value) => (value === '' ? undefined : value);

const itineraryItemSchema = z.object({
  day: z.preprocess((value) => {
    if (typeof value === 'number') return String(value);
    if (typeof value === 'string') return value.trim();
    return value;
  }, z.string().min(1, 'Day label is required')),
  title: z.string().min(1),
  description: z.string().min(1),
  location: z.string().optional(),
  accommodation: z.string().optional(),
  meals: z.string().optional(),
  distance: z.string().optional(),
  elevation: z.string().optional(),
  image: z.string().optional(),
  highlights: z.array(z.string()).optional().default([]),
  optional: z.array(z.object({
    name: z.string().optional(),
    price: z.string().optional(),
  })).optional().default([]),
});

const departureSchema = z.object({
  startDate: z.string().datetime(),
  endDate: z.string().datetime().optional(),
  pricePerPerson: z.number().min(0).optional(),
  totalSeats: z.number().int().positive().optional(),
  seatsAvailable: z.number().int().nonnegative().optional(),
  status: z.enum(['scheduled', 'sold_out', 'cancelled']).optional(),
  badges: z.array(z.string()).optional(),
  notes: z.string().optional(),
});

const baseTripSchema = z.object({
  title: z.preprocess(emptyToUndefined, z.string().optional()),
  slug: z.preprocess(emptyToUndefined, z.string().optional()),
  categoryId: z.preprocess(emptyToUndefined, z.string().optional()),
  categorySlug: z.preprocess(emptyToUndefined, z.string().optional()),
  subcategoryId: z.preprocess(emptyToUndefined, z.string().optional()),
  subcategorySlug: z.preprocess(emptyToUndefined, z.string().optional()),
  regionId: z.preprocess(emptyToUndefined, z.string().optional()),
  countryId: z.preprocess(emptyToUndefined, z.string().optional()),
  region: z.preprocess(emptyToUndefined, z.string().optional()),
  country: z.preprocess(emptyToUndefined, z.string().optional()),
  duration: z.preprocess(emptyToUndefined, z.string().optional()),
  difficulty: z.preprocess(emptyToUndefined, z.enum(['easy', 'moderate', 'challenging', 'expert']).optional()),
  price: z.number().optional(),
  image: z.preprocess(emptyToUndefined, z.string().optional()),
  brochureUrl: z.preprocess(emptyToUndefined, z.string().optional()),
  description: z.preprocess(emptyToUndefined, z.string().optional()),
  highlights: z.array(z.string()).optional().default([]),
  sustainabilityBadges: z.array(z.string()).optional().default([]),
  maxGroupSize: z.number().int().optional(),
  season: z.preprocess(emptyToUndefined, z.string().optional()),
  departureScheduleType: z.enum(['specific_dates', 'recurring']).optional().default('specific_dates'),
  recurrenceRule: z.object({
    frequency: z.enum(['daily', 'weekly', 'monthly']).optional(),
    weekdays: z.preprocess(
      (val) => (Array.isArray(val) ? val.map((d) => (typeof d === 'string' ? parseInt(d, 10) : d)) : val),
      z.array(z.number().int().min(0).max(6)).optional().default([])
    ),
    monthDay: z.preprocess(
      (val) => (val !== undefined && val !== null && val !== '' ? Number(val) : undefined),
      z.number().int().min(1).max(31).optional()
    ),
    // Accept date-only (YYYY-MM-DD), full ISO datetime, or Date so validFrom/validTo always persist
    validFrom: z.union([z.string().min(1), z.date()]).optional(),
    validTo: z.union([z.string().min(1), z.date()]).optional(),
  }).optional(),
  departures: z.array(departureSchema).optional().default([]),
  inclusions: z.array(z.string()).optional().default([]),
  exclusions: z.array(z.string()).optional().default([]),
  itinerary: z.array(itineraryItemSchema).optional().default([]),
  zeroWasteNotes: z.preprocess(emptyToUndefined, z.string().optional()),
  distance: z.preprocess(emptyToUndefined, z.string().optional()),
  transport: z.preprocess(emptyToUndefined, z.string().optional()),
  heroSubtitle: z.preprocess(emptyToUndefined, z.string().optional()),
  itineraryTitle: z.preprocess(emptyToUndefined, z.string().optional()),
  itineraryDescription: z.preprocess(emptyToUndefined, z.string().optional()),
  guidesSectionTitle: z.preprocess(emptyToUndefined, z.string().optional()),
  guidesSectionSubtitle: z.preprocess(emptyToUndefined, z.string().optional()),
  guidesQuote: z.preprocess(emptyToUndefined, z.string().optional()),
  guidesQuoteAuthor: z.preprocess(emptyToUndefined, z.string().optional()),
  guidesSafetyStatement: z.preprocess(emptyToUndefined, z.string().optional()),
  pricingTitle: z.preprocess(emptyToUndefined, z.string().optional()),
  pricingDescription: z.preprocess(emptyToUndefined, z.string().optional()),
  faqs: z.array(z.object({
    question: z.string().min(1),
    answer: z.string().min(1),
  })).optional().default([]),
  highlightGallery: z.array(
    z.object({
      image: z.preprocess(emptyToUndefined, z.string().optional()),
      caption: z.preprocess(emptyToUndefined, z.string().optional()),
    })
  ).optional().default([]),
  accommodationAndMeals: z.object({
    title: z.string().optional(),
    subtitle: z.string().optional(),
    items: z.array(z.object({
      imageUrl: z.string().optional(),
      title: z.string().optional(),
      description: z.string().optional(),
      features: z.array(z.string()).optional().default([]),
    })).optional().default([]),
  }).optional(),
  beforeYouBook: z.object({
    sections: z.array(z.object({
      heading: z.string().optional(),
      items: z.array(z.string()).optional().default([]),
    })).optional().default([]),
    ctaHeading: z.string().optional(),
    ctaSubtitle: z.string().optional(),
    ctaLinkLabel: z.string().optional(),
    ctaLinkUrl: z.string().optional(),
  }).optional(),
  comfortAddOns: z.array(z.object({
    title: z.string().optional(),
    description: z.string().optional(),
    type: z.enum(['flat', 'choice']).optional().default('flat'),
    price: z.string().optional(),
    priceUnit: z.string().optional(),
    options: z.array(z.object({
      label: z.string().optional(),
      price: z.string().optional(),
      priceUnit: z.string().optional(),
    })).optional().default([]),
  })).optional().default([]),
  offeredAddOns: z.array(z.string()).optional().default([]),
  tripNotes: z.object({
    enabled: z.boolean().optional(),
    overview: z.object({
      tripStyle: z.string().optional(),
      accommodationSummary: z.string().optional(),
      mealsSummary: z.string().optional(),
      bestSeason: z.string().optional(),
      tripCode: z.string().optional(),
    }).optional(),
    sections: z.array(z.object({
      key: z.string().optional(),
      title: z.string().optional(),
      icon: z.string().optional(),
      enabled: z.boolean().optional(),
      blocks: z.array(z.object({
        type: z.enum(['paragraph', 'subheading', 'bullets', 'numbered', 'tip', 'warning', 'note', 'contact', 'pricegrid']).optional(),
        text: z.string().optional(),
        items: z.array(z.string()).optional().default([]),
        rows: z.array(z.object({
          label: z.string().optional(),
          value: z.string().optional(),
        })).optional().default([]),
        tone: z.enum(['default', 'danger']).optional(),
      })).optional().default([]),
    })).optional().default([]),
  }).optional(),
  guides: z.array(z.string()).optional().default([]),
  featured: z.boolean().optional().default(false),
  status: z.enum(['draft', 'published', 'archived']).optional().default('draft'),
});

export const createTripSchema = z.object({
  body: baseTripSchema.superRefine((data, ctx) => {
    const status = data.status ?? 'draft';
    if (status !== 'published') {
      return;
    }
    if (!data.title || !data.title.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Title is required',
        path: ['title'],
      });
    }
    if (!data.duration || !data.duration.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Duration is required',
        path: ['duration'],
      });
    }
    if (!data.difficulty) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Difficulty is required',
        path: ['difficulty'],
      });
    }
    if (data.price === undefined || data.price < 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Price must be positive',
        path: ['price'],
      });
    }
    if (!data.description || !data.description.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Description is required',
        path: ['description'],
      });
    }
    if (!data.maxGroupSize || data.maxGroupSize <= 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Max group size is required',
        path: ['maxGroupSize'],
      });
    }
    if (!data.categoryId && !data.categorySlug) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Category is required',
        path: ['categoryId'],
      });
    }
    if (!data.subcategoryId && !data.subcategorySlug) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Subcategory is required',
        path: ['subcategoryId'],
      });
    }
    if (!data.regionId && !data.region) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Region is required',
        path: ['regionId'],
      });
    }
    if (!data.countryId && !data.country) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Country is required',
        path: ['countryId'],
      });
    }
  }),
});

export const updateTripSchema = z.object({
  body: baseTripSchema.partial(),
});

export const tripQuerySchema = z.object({
  query: z.object({
    page: z.string().optional().transform((val) => (val ? parseInt(val, 10) : 1)),
    limit: z.string().optional().transform((val) => (val ? parseInt(val, 10) : 10)),
    categoryId: z.string().optional(),
    categorySlug: z.string().optional(),
    subcategoryId: z.string().optional(),
    subcategorySlug: z.string().optional(),
    regionId: z.string().optional(),
    countryId: z.string().optional(),
    country: z.string().optional(),
    region: z.string().optional(),
    difficulty: z.enum(['easy', 'moderate', 'challenging', 'expert']).optional(),
    minPrice: z.string().optional().transform((val) => (val ? parseFloat(val) : undefined)),
    maxPrice: z.string().optional().transform((val) => (val ? parseFloat(val) : undefined)),
    minDuration: z.string().optional().transform((val) => (val ? parseFloat(val) : undefined)),
    maxDuration: z.string().optional().transform((val) => (val ? parseFloat(val) : undefined)),
    minDepartureDate: z.string().optional(),
    maxDepartureDate: z.string().optional(),
    status: z.enum(['draft', 'published', 'archived', 'all']).optional(),
    featured: z.string().transform((val) => val === 'true').optional(),
    search: z.string().optional(),
    sort: z.string().optional().default('createdAt'),
    order: z.enum(['asc', 'desc']).optional().default('desc'),
  }),
});
