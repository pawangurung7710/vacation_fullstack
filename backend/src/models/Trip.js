import mongoose from 'mongoose';
import { generateSlug } from '../utils/slugify.js';
import { DEFAULT_TRIP_NOTE_SECTIONS } from '../data/tripNotes.defaults.js';

const tripNoteBlockSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ['paragraph', 'subheading', 'bullets', 'numbered', 'tip', 'warning', 'note', 'contact', 'pricegrid'],
      default: 'paragraph',
    },
    text: { type: String, trim: true },
    items: [{ type: String, trim: true }],
    rows: [
      {
        label: { type: String, trim: true },
        value: { type: String, trim: true },
      },
    ],
    tone: { type: String, enum: ['default', 'danger'], default: 'default' },
  },
  { _id: false }
);

const tripNoteSectionSchema = new mongoose.Schema(
  {
    key: { type: String, trim: true },
    title: { type: String, trim: true },
    icon: { type: String, trim: true, default: 'info' },
    enabled: { type: Boolean, default: true },
    blocks: { type: [tripNoteBlockSchema], default: [] },
  },
  { _id: false }
);

const tripNotesSchema = new mongoose.Schema(
  {
    enabled: { type: Boolean, default: true },
    overview: {
      tripStyle: { type: String, trim: true },
      accommodationSummary: { type: String, trim: true },
      mealsSummary: { type: String, trim: true },
      bestSeason: { type: String, trim: true },
      tripCode: { type: String, trim: true },
    },
    sections: {
      type: [tripNoteSectionSchema],
      default: () => DEFAULT_TRIP_NOTE_SECTIONS,
    },
  },
  { _id: false }
);

const itineraryItemSchema = new mongoose.Schema({
  day: {
    type: String,
    required: true,
    trim: true,
  },
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  location: {
    type: String,
    trim: true,
  },
  accommodation: {
    type: String,
    trim: true,
  },
  meals: {
    type: String,
    trim: true,
  },
  distance: {
    type: String,
    trim: true,
  },
  elevation: {
    type: String,
    trim: true,
  },
  image: {
    type: String,
    trim: true,
  },
  highlights: [
    {
      type: String,
      trim: true,
    },
  ],
  optional: [
    {
      name: { type: String, trim: true },
      price: { type: String, trim: true },
    },
  ],
});

const departureSchema = new mongoose.Schema(
  {
    startDate: {
      type: Date,
      required: [true, 'Start date is required'],
    },
    endDate: {
      type: Date,
    },
    pricePerPerson: {
      type: Number,
      min: [0, 'Price must be positive'],
    },
    totalSeats: {
      type: Number,
      min: [1, 'Total seats must be at least 1'],
    },
    seatsAvailable: {
      type: Number,
      min: [0, 'Seats available must be zero or more'],
    },
    status: {
      type: String,
      enum: ['scheduled', 'sold_out', 'cancelled'],
      default: 'scheduled',
    },
    badges: [
      {
        type: String,
        trim: true,
      },
    ],
    notes: {
      type: String,
      trim: true,
    },
  },
  {
    _id: true,
  }
);

const tripSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [
        function () {
          return this.status === 'published';
        },
        'Title is required',
      ],
      trim: true,
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
      trim: true,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: [
        function () {
          return this.status === 'published';
        },
        'Category is required',
      ],
    },
    subcategory: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: [
        function () {
          return this.status === 'published';
        },
        'Subcategory is required',
      ],
    },
    regionRef: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Region',
      default: null,
    },
    countryRef: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Country',
      default: null,
    },
    region: {
      type: String,
      required: [
        function () {
          return this.status === 'published';
        },
        'Region is required',
      ],
      trim: true,
    },
    country: {
      type: String,
      required: [
        function () {
          return this.status === 'published';
        },
        'Country is required',
      ],
      trim: true,
    },
    duration: {
      type: String,
      required: [
        function () {
          return this.status === 'published';
        },
        'Duration is required',
      ],
      trim: true,
    },
    difficulty: {
      type: String,
      enum: ['easy', 'moderate', 'challenging', 'expert'],
      required: [
        function () {
          return this.status === 'published';
        },
        'Difficulty is required',
      ],
    },
    price: {
      type: Number,
      required: [
        function () {
          return this.status === 'published';
        },
        'Price is required',
      ],
      min: [0, 'Price must be positive'],
    },
    image: {
      type: String,
      trim: true,
    },
    brochureUrl: {
      type: String,
      trim: true,
    },
    description: {
      type: String,
      required: [
        function () {
          return this.status === 'published';
        },
        'Description is required',
      ],
    },
    highlights: [
      {
        type: String,
        trim: true,
      },
    ],
    sustainabilityBadges: [
      {
        type: String,
        trim: true,
      },
    ],
    maxGroupSize: {
      type: Number,
      required: [
        function () {
          return this.status === 'published';
        },
        'Max group size is required',
      ],
      min: [1, 'Group size must be at least 1'],
    },
    season: {
      type: String,
      trim: true,
    },
    /** 'specific_dates' = use departures array; 'recurring' = generate from recurrenceRule */
    departureScheduleType: {
      type: String,
      enum: ['specific_dates', 'recurring'],
      default: 'specific_dates',
    },
    /** When departureScheduleType === 'recurring': frequency = daily|weekly|monthly; weekdays = [0-6] for weekly; monthDay = 1-31 for monthly; validFrom/validTo optional range */
    recurrenceRule: {
      frequency: { type: String, enum: ['daily', 'weekly', 'monthly'], trim: true },
      weekdays: [{ type: Number, min: 0, max: 6 }], // 0=Sun, 6=Sat
      monthDay: { type: Number, min: 1, max: 31 },
      validFrom: { type: Date },
      validTo: { type: Date },
    },
    departures: [departureSchema],
    inclusions: [
      {
        type: String,
        trim: true,
      },
    ],
    exclusions: [
      {
        type: String,
        trim: true,
      },
    ],
    itinerary: [itineraryItemSchema],
    zeroWasteNotes: {
      type: String,
      trim: true,
    },
    distance: {
      type: String,
      trim: true,
    },
    transport: {
      type: String,
      trim: true,
    },
    heroSubtitle: {
      type: String,
      trim: true,
    },
    itineraryTitle: {
      type: String,
      trim: true,
      default: 'Daily Itinerary',
    },
    itineraryDescription: {
      type: String,
      trim: true,
      default: 'Each day brings new landscapes, cultures, and connections',
    },
    guidesSectionTitle: {
      type: String,
      trim: true,
      default: 'Expert Guides & Safety',
    },
    guidesSectionSubtitle: {
      type: String,
      trim: true,
      default: 'Multilingual, highly trained professionals with years of local experience',
    },
    guidesQuote: {
      type: String,
      trim: true,
      default: '"Mountains are not fair or unfair, they are just dangerous."',
    },
    guidesQuoteAuthor: {
      type: String,
      trim: true,
      default: '— Reinhold Messner',
    },
    guidesSafetyStatement: {
      type: String,
      trim: true,
      default:
        'Your safety is non-negotiable. Our guides excel at risk assessment, multilingual communication, and radical transparency backed by internationally recognized certifications and decades of high-altitude experience.',
    },
    pricingTitle: {
      type: String,
      trim: true,
      default: 'Pricing & Booking',
    },
    pricingDescription: {
      type: String,
      trim: true,
      default: 'Transparent pricing with no hidden fees',
    },
    faqs: [
      {
        question: {
          type: String,
          trim: true,
          required: true,
        },
        answer: {
          type: String,
          trim: true,
          required: true,
        },
      },
    ],
    accommodationAndMeals: {
      title: {
        type: String,
        trim: true,
      },
      subtitle: {
        type: String,
        trim: true,
      },
      items: [
        {
          imageUrl: {
            type: String,
            trim: true,
          },
          title: {
            type: String,
            trim: true,
          },
          description: {
            type: String,
            trim: true,
          },
          features: [
            {
              type: String,
              trim: true,
            },
          ],
        },
      ],
    },
    beforeYouBook: {
      sections: {
        type: [
          {
            heading: { type: String, trim: true },
            items: [{ type: String, trim: true }],
          },
        ],
        default: () => [
          {
            heading: 'Is this trip right for you?',
            items: [
              'You should be comfortable walking 5–8 hours a day on uneven mountain terrain.',
              'Altitudes can reach several thousand metres — a good level of cardiovascular fitness is required.',
              'Temperatures can drop below freezing at higher elevations, even in spring and autumn.',
              'Accommodation is simple — think cosy teahouses and family homestays, not hotels.',
              'Some days involve early starts (5–6 am) to maximise daylight and avoid afternoon weather.',
              'This trip is designed for travellers who value depth of experience over speed of sightseeing.',
            ],
          },
          {
            heading: 'Important notes',
            items: [
              'Single travellers are warmly welcomed — rooming with a same-gender group member is standard practice and helps keep costs down.',
              'Trekking permits and national park entry fees are included in your trip price and arranged by Trekkers Squad on your behalf.',
              'Your passport must be valid for at least six months beyond your return date. Name on your booking must exactly match your passport.',
              'Trekkers Squad reserves the right to alter the itinerary due to unforeseen circumstances such as weather, trail closures, or group safety.',
            ],
          },
          {
            heading: 'Visas',
            items: [
              'Visa rules depend on your passport and destination. We send entry guidance with your booking confirmation.',
              'We strongly recommend checking current entry requirements for your nationality well in advance of travel, as visa regulations can change. Your Trekkers Squad trip coordinator can point you to up-to-date resources.',
            ],
          },
          {
            heading: 'Health & vaccinations',
            items: [
              'Vaccination requirements depend on your destination. We recommend consulting a travel health clinic 6–8 weeks before departure and checking official travel health guidance.',
              'Altitude sickness is a real consideration at higher elevations. Our itineraries build in acclimatisation days and your guide monitors the group daily. Diamox (acetazolamide) is available locally but should be discussed with your doctor in advance.',
              'We carry a comprehensive first-aid kit and maintain contact with emergency services throughout. Emergency evacuation insurance is strongly recommended.',
            ],
          },
          {
            heading: 'Solo travel & group dynamics',
            items: [
              'Many of our travellers join as solo adventurers. Groups are kept small to foster genuine connection — by day two, most groups feel like old friends.',
              'Solo travellers are matched with a same-gender roommate at no extra cost. If you prefer a private room throughout, a single supplement is available — ask your trip coordinator for current pricing.',
            ],
          },
        ],
      },
      ctaHeading: {
        type: String,
        trim: true,
        default: 'Essential trip information',
      },
      ctaSubtitle: {
        type: String,
        trim: true,
        default: 'Health, safety, visa requirements and everything else you need to know before you go.',
      },
      ctaLinkLabel: {
        type: String,
        trim: true,
        default: 'Read essentials',
      },
      // No default: an empty value means "use this trip's own /notes page",
      // computed on the frontend. Only set this to override with a custom URL.
      ctaLinkUrl: {
        type: String,
        trim: true,
      },
    },
    comfortAddOns: {
      type: [
        {
          title: { type: String, trim: true },
          description: { type: String, trim: true },
          type: { type: String, enum: ['flat', 'choice'], default: 'flat' },
          price: { type: String, trim: true },
          priceUnit: { type: String, trim: true },
          options: [
            {
              label: { type: String, trim: true },
              price: { type: String, trim: true },
              priceUnit: { type: String, trim: true },
            },
          ],
        },
      ],
      default: () => [
        {
          title: 'Extra night before or after the trip',
          description: 'Upgrade your stay before or after the trek.',
          type: 'choice',
          options: [
            { label: '3-star hotel', price: '$85', priceUnit: '/pp' },
            { label: '5-star hotel', price: '$195', priceUnit: '/pp' },
          ],
        },
        {
          title: 'Additional porterage allowance',
          description: 'Extra porter for an additional 5 kg of luggage.',
          type: 'flat',
          price: '$45',
          priceUnit: 'per person',
        },
        {
          title: 'Half-day local highlights tour',
          description: 'Guided visit to Pashupatinath, Boudhanath & Swayambhunath.',
          type: 'flat',
          price: '$65',
          priceUnit: 'per person',
        },
      ],
    },
    /** Per-trip "Trip Notes" page content (the /trip/:slug/notes page). */
    tripNotes: {
      type: tripNotesSchema,
      default: () => ({}),
    },
    /** Add-ons (comfort upgrades + activities) offered on this trip, in addition to global ones. */
    offeredAddOns: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'AddOn',
      },
    ],
    guides: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Guide',
      },
    ],
    highlightGallery: [
      {
        image: {
          type: String,
          trim: true,
        },
        caption: {
          type: String,
          trim: true,
        },
      },
    ],
    featured: {
      type: Boolean,
      default: false,
    },
    views: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ['draft', 'published', 'archived'],
      default: 'draft',
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
tripSchema.index({ slug: 1 });
tripSchema.index({ category: 1, status: 1 });
tripSchema.index({ subcategory: 1, status: 1 });
tripSchema.index({ category: 1, subcategory: 1, status: 1 });
tripSchema.index({ featured: 1, status: 1 });
tripSchema.index({ regionRef: 1 });
tripSchema.index({ countryRef: 1 });
tripSchema.index({ country: 1 });
tripSchema.index({ status: 1 });
tripSchema.index({ createdAt: -1 });
tripSchema.index({ 'departures.startDate': 1 });

// Generate slug when title changes unless a custom slug was provided.
tripSchema.pre('save', function (next) {
  if (this.isModified('title') && !this.isModified('slug')) {
    this.slug = generateSlug(this.title);
  }
  next();
});

const Trip = mongoose.model('Trip', tripSchema);

export default Trip;
