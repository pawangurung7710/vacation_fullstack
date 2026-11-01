import { useState, ReactNode } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '../../components/ui/button';
import { Check, Circle, FileText } from 'lucide-react';
import { cn } from '../../components/ui/utils';
import { toast } from 'sonner';

export interface TripDraft {
  id?: string;
  _id?: string;
  // Basics
  title: string;
  slug: string;
  categoryId: string;
  subcategoryId: string;
  categoryLabel: string;
  subcategoryLabel: string;
  regionId: string;
  regionLabel: string;
  region: string;
  countryId: string;
  countryLabel: string;
  country: string;
  duration: string;
  difficulty: string;
  price: string;
  status: 'draft' | 'published' | 'archived';
  featured: boolean;
  
  // Media
  mainImage?: string;
  gallery: string[];
  highlightGallery?: { image?: string; caption?: string }[];
  brochureUrl?: string;
  
  // Details
  description: string;
  highlights: string[];
  inclusions: string[];
  exclusions: string[];
  sustainabilityBadges: string[];
  maxGroupSize: string;
  season: string;
  distance?: string;
  transport?: string;
  heroSubtitle?: string;
  faqs?: Array<{
    question: string;
    answer: string;
  }>;
  departureScheduleType?: 'specific_dates' | 'recurring';
  recurrenceRule?: {
    frequency?: 'daily' | 'weekly' | 'monthly';
    weekdays?: number[];
    monthDay?: number;
    validFrom?: string;
    validTo?: string;
  };
  departures: Array<{
    startDate: string;
    endDate?: string;
    pricePerPerson?: string;
    totalSeats?: string;
    seatsAvailable?: string;
    status?: 'scheduled' | 'sold_out' | 'cancelled';
    badges?: string[];
    notes?: string;
  }>;
  
  // Itinerary
  itinerary: Array<{
    day: string;
    title: string;
    description: string;
    location?: string;
    accommodation?: string;
    meals?: string;
    distance?: string;
    elevation?: string;
    image?: string;
    highlights?: string[];
    optional?: Array<{ name: string; price?: string }>;
  }>;
  
  // Accommodation & Meals
  accommodationAndMeals?: {
    title?: string;
    subtitle?: string;
    items?: Array<{
      imageUrl?: string;
      title?: string;
      description?: string;
      features?: string[];
    }>;
  };
  
  // Before You Book
  beforeYouBook?: {
    sections?: Array<{ heading: string; items: string[] }>;
    ctaHeading?: string;
    ctaSubtitle?: string;
    ctaLinkLabel?: string;
    ctaLinkUrl?: string;
  };

  // Comfort Add-ons (legacy embedded array — kept for back-compat, edited via the Add-ons & Activities section)
  comfortAddOns?: Array<{
    title: string;
    description?: string;
    type: 'flat' | 'choice';
    price?: string;
    priceUnit?: string;
    options?: Array<{ label: string; price?: string; priceUnit?: string }>;
  }>;
  // Add-ons (comfort upgrades + activities) offered on this trip — AddOn record ids
  offeredAddOns?: string[];

  // Guides
  guides?: string[];
  itineraryTitle: string;
  itineraryDescription: string;
  guidesSectionTitle: string;
  guidesSectionSubtitle: string;
  guidesQuote: string;
  guidesQuoteAuthor: string;
  guidesSafetyStatement: string;
  pricingTitle: string;
    pricingDescription: string;
    highlightGallery: [],
}

const STEPS = [
  { id: 'basics', label: 'Basics' },
  { id: 'media', label: 'Media' },
  { id: 'details', label: 'Details' },
  { id: 'itinerary', label: 'Itinerary' },
  { id: 'review', label: 'Review' },
] as const;

export type StepId = typeof STEPS[number]['id'];

interface TripStepperProps {
  initialData?: Partial<TripDraft>;
  initialStep?: StepId;
  onSaveDraft: (data: TripDraft) => void;
  onPublish?: (data: TripDraft) => void;
  mode: 'create' | 'edit';
  children: (
    step: StepId,
    data: TripDraft,
    updateData: (updates: Partial<TripDraft>) => void,
    setStep: (stepId: StepId) => void,
    errors: Partial<Record<keyof TripDraft, string>>
  ) => ReactNode;
}

export function TripStepper({ initialData, initialStep, onSaveDraft, onPublish, mode, children }: TripStepperProps) {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState<StepId>(initialStep || 'basics');
  const [errors, setErrors] = useState<Partial<Record<keyof TripDraft, string>>>({});
  const [draft, setDraft] = useState<TripDraft>({
    title: '',
    slug: '',
    categoryId: '',
    subcategoryId: '',
    categoryLabel: '',
    subcategoryLabel: '',
    regionId: '',
    regionLabel: '',
    region: '',
    countryId: '',
    countryLabel: '',
    country: '',
    duration: '',
    difficulty: '',
    price: '',
    status: 'draft',
    featured: false,
    gallery: [],
    brochureUrl: '',
    description: '',
    highlights: [],
    inclusions: [
      'SDF (Sustainable Development Fee)',
      'All meals and accommodation',
      'Licensed Bhutanese guide',
      'Private vehicle',
      'All entrance fees',
    ],
    exclusions: [
      'International flights',
      'Visa fees where applicable',
      'Travel insurance (required)',
      'Personal expenses & tips',
      'Alcohol & beverages',
      'Extra nights before or after the trip',
    ],
    sustainabilityBadges: [],
    maxGroupSize: '',
    season: '',
    distance: '',
    transport: '',
    heroSubtitle: '',
    faqs: [],
    departureScheduleType: 'specific_dates',
    recurrenceRule: {},
    departures: [],
    itinerary: [],
    accommodationAndMeals: {
      title: 'Accommodation & Meals',
      subtitle: 'Comfortable stays and local meals',
      items: [
        {
          imageUrl: '',
          title: 'Eco-Lodges & Homestays',
          description: 'Sleep in family-run teahouses and eco-lodges with solar power, composting toilets, and responsible design. Every night you stay directly supports local families and sustainable infrastructure.',
          features: ['Solar-powered lighting', 'Composting waste systems', 'Family-owned accommodations', 'Local meals'],
        },
        {
          imageUrl: '',
          title: 'Local Meals',
          description: 'Enjoy regional dishes made from locally sourced ingredients.',
          features: ['80%+ locally sourced ingredients', 'Refillable water filters provided', 'Zero single-use plastics'],
        },
      ],
    },
    beforeYouBook: {
      sections: [
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
            'Vaccination needs vary by destination. Check official travel health guidance at least 8 weeks before departure.',
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
      ctaHeading: 'Essential trip information',
      ctaSubtitle: 'Health, safety, visa requirements and everything else you need to know before you go.',
      ctaLinkLabel: 'Read essentials',
      ctaLinkUrl: '',
    },
    comfortAddOns: [],
    offeredAddOns: [],
    guides: [],
    itineraryTitle: 'Daily Itinerary',
    itineraryDescription: 'Each day brings new landscapes, cultures, and connections',
    guidesSectionTitle: 'Expert Guides & Safety',
    guidesSectionSubtitle: 'Multilingual, highly trained professionals with decades of mountain experience',
    guidesQuote: '"Mountains are not fair or unfair, they are just dangerous."',
    guidesQuoteAuthor: '— Reinhold Messner',
    guidesSafetyStatement:
      'Your safety is non-negotiable. Our guides excel at risk assessment, multilingual communication, and radical transparency backed by internationally recognized certifications and decades of high-altitude experience.',
    pricingTitle: 'Pricing & Booking',
    pricingDescription: 'Transparent pricing with responsible impact included',
    ...initialData,
  });

  const currentStepIndex = STEPS.findIndex((s) => s.id === currentStep);
  const completedSteps = STEPS.slice(0, currentStepIndex);

  const updateData = (updates: Partial<TripDraft>) => {
    setDraft((prev) => ({ ...prev, ...updates }));
    setErrors((prev) => {
      if (!prev || Object.keys(updates).length === 0) return prev;
      const next = { ...prev };
      Object.keys(updates).forEach((key) => {
        delete next[key as keyof TripDraft];
      });
      return next;
    });
  };

  const isPositiveNumber = (value: string) => {
    if (value === undefined || value === null || value === '') return false;
    const parsed = Number(value);
    return Number.isFinite(parsed) && parsed > 0;
  };

  const validateBasics = () => {
    const nextErrors: Partial<Record<keyof TripDraft, string>> = {};
    if (!draft.title.trim()) nextErrors.title = 'Title is required';
    if (!draft.categoryId) nextErrors.categoryId = 'Category is required';
    if (!draft.subcategoryId) nextErrors.subcategoryId = 'Subcategory is required';
    if (!draft.country.trim()) nextErrors.country = 'Country is required';
    if (!draft.regionId && !draft.region.trim()) nextErrors.region = 'Region is required';
    if (!draft.duration.trim()) nextErrors.duration = 'Duration is required';
    if (!draft.difficulty) nextErrors.difficulty = 'Difficulty is required';
    if (!isPositiveNumber(draft.price)) nextErrors.price = 'Price must be a positive number';
    return nextErrors;
  };

  const validateDetails = () => {
    const nextErrors: Partial<Record<keyof TripDraft, string>> = {};
    if (!draft.description.trim()) nextErrors.description = 'Description is required';
    if (!isPositiveNumber(draft.maxGroupSize)) {
      nextErrors.maxGroupSize = 'Max group size must be a positive number';
    }
    return nextErrors;
  };

  const validateMedia = () => {
    const nextErrors: Partial<Record<keyof TripDraft, string>> = {};
    if (!draft.mainImage) nextErrors.mainImage = 'Main image is required';
    return nextErrors;
  };

  const validateItinerary = () => {
    const nextErrors: Partial<Record<keyof TripDraft, string>> = {};
    const hasIncomplete = draft.itinerary.some(
      (day) => !day.title.trim() || !day.description.trim()
    );
    if (hasIncomplete) {
      nextErrors.itinerary = 'Each day needs a title and description';
    }
    return nextErrors;
  };

  const validateStep = (stepId: StepId) => {
    if (stepId === 'basics') return validateBasics();
    if (stepId === 'media') return validateMedia();
    if (stepId === 'details') return validateDetails();
    if (stepId === 'itinerary') return validateItinerary();
    return {};
  };

  const handleSaveDraft = () => {
    const stepErrors = validateStep(currentStep);
    if (Object.keys(stepErrors).length > 0) {
      setErrors(stepErrors);
      toast.error('Please complete the required fields before saving.');
      return;
    }
    onSaveDraft(draft);
    toast.success('Draft saved', { duration: 2000 });
  };

  const handleNext = () => {
    const stepErrors = validateStep(currentStep);
    if (Object.keys(stepErrors).length > 0) {
      setErrors(stepErrors);
      toast.error('Please complete the required fields to continue.');
      return;
    }
    const nextIndex = currentStepIndex + 1;
    if (nextIndex < STEPS.length) {
      setCurrentStep(STEPS[nextIndex].id);
    }
  };

  const handlePrevious = () => {
    const prevIndex = currentStepIndex - 1;
    if (prevIndex >= 0) {
      setCurrentStep(STEPS[prevIndex].id);
    }
  };

  const handleStepClick = (stepId: StepId) => {
    const stepIndex = STEPS.findIndex((s) => s.id === stepId);
    if (stepIndex <= currentStepIndex) {
      setCurrentStep(stepId);
    }
  };

  const handlePublish = () => {
    const basicsErrors = validateBasics();
    const mediaErrors = validateMedia();
    const detailsErrors = validateDetails();
    const itineraryErrors = validateItinerary();
    const allErrors = { ...basicsErrors, ...mediaErrors, ...detailsErrors, ...itineraryErrors };
    if (Object.keys(allErrors).length > 0) {
      setErrors(allErrors);
      if (Object.keys(basicsErrors).length > 0) {
        setCurrentStep('basics');
      } else if (Object.keys(mediaErrors).length > 0) {
        setCurrentStep('media');
      } else if (Object.keys(detailsErrors).length > 0) {
        setCurrentStep('details');
      } else if (Object.keys(itineraryErrors).length > 0) {
        setCurrentStep('itinerary');
      }
      toast.error('Please fix the required fields before publishing.');
      return;
    }
    if (onPublish) {
      onPublish(draft);
    } else {
      toast.success('Trip published', { duration: 2000 });
      navigate('/cms/trips');
    }
  };

  return (
    <div className="bg-[var(--cms-background)]">
      {/* Stepper Bar */}
      <div className="border-b border-[var(--cms-border)] bg-white" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Inter, sans-serif' }}>
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-8">
              {STEPS.map((step, index) => {
                const isCompleted = index < currentStepIndex;
                const isCurrent = step.id === currentStep;
                const isClickable = isCompleted || isCurrent;

                return (
                  <button
                    key={step.id}
                    onClick={() => isClickable && handleStepClick(step.id)}
                    className={cn(
                      'flex items-center gap-2 transition-colors',
                      isClickable ? 'cursor-pointer' : 'cursor-default',
                      isCurrent && 'text-[var(--cms-primary)]'
                    )}
                    disabled={!isClickable}
                  >
                    <div
                      className={cn(
                        'w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium border transition-colors',
                        isCurrent
                          ? 'border-[var(--cms-primary)] bg-[var(--cms-primary)] text-white'
                          : isCompleted
                          ? 'border-[var(--cms-primary)] bg-[var(--cms-primary)] text-white'
                          : 'border-[var(--cms-border)] bg-white text-[var(--cms-muted-foreground)]'
                      )}
                    >
                      {isCompleted ? <Check className="h-3 w-3" /> : index + 1}
                    </div>
                    <span
                      className={cn(
                        'text-sm font-medium',
                        isCurrent ? 'text-[var(--cms-primary)]' : 'text-[var(--cms-muted-foreground)]'
                      )}
                    >
                      {step.label}
                    </span>
                  </button>
                );
              })}
            </div>
            <div className="flex items-center gap-3">
              {mode === 'edit' && (draft.id || draft._id) && (
                <Link
                  to={`/cms/trips/${draft.id || draft._id}/notes`}
                  className="inline-flex items-center gap-1.5 text-xs font-medium text-[var(--cms-primary)] hover:underline"
                >
                  <FileText className="h-3.5 w-3.5" />
                  Trip notes
                </Link>
              )}
              {draft.status === 'draft' && (
                <div className="px-3 py-1 bg-[var(--cms-muted)] rounded text-xs font-medium text-[var(--cms-muted-foreground)]">
                  Draft
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-6 py-6" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Inter, sans-serif' }}>
        <div className="bg-white border border-[var(--cms-border)] rounded-lg p-8">
          {children(currentStep, draft, updateData, setCurrentStep, errors)}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between mt-6 pb-6">
          <div className="flex items-center gap-3">
            {currentStepIndex > 0 && (
              <Button variant="outline" onClick={handlePrevious} className="border-[var(--cms-border)] bg-white hover:bg-[var(--cms-muted)]">
                Back
              </Button>
            )}
            <Button
              variant="outline"
              onClick={handleSaveDraft}
              className="border-[var(--cms-border)] bg-white hover:bg-[var(--cms-muted)] text-[var(--cms-muted-foreground)]"
            >
              Save Draft
            </Button>
          </div>
          <div className="flex items-center gap-3">
            {currentStepIndex < STEPS.length - 1 ? (
              <Button
                onClick={handleNext}
                style={{ backgroundColor: 'var(--cms-primary)', color: 'var(--cms-primary-foreground)' }}
                className="px-6 border-0"
              >
                Continue
              </Button>
            ) : (
              <>
                <Button
                  variant="outline"
                  onClick={() => {
                    localStorage.setItem('trip-draft-preview', JSON.stringify(draft));
                    if (mode === 'edit') {
                      const id = draft.id || draft._id;
                      if (id) {
                        localStorage.setItem(`trip-draft-${id}`, JSON.stringify(draft));
                        localStorage.setItem(`trip-step-${id}`, currentStep);
                      }
                    } else {
                      localStorage.setItem('trip-draft', JSON.stringify(draft));
                      localStorage.setItem('trip-step-new', currentStep);
                    }
                    navigate('/cms/trips/preview', {
                      state: { from: mode === 'edit' ? undefined : '/cms/trips/new' },
                    });
                  }}
                  className="border-[var(--cms-border)] bg-white hover:bg-[var(--cms-muted)]"
                >
                  Preview
                </Button>
                <Button
                  onClick={handlePublish}
                  style={{ backgroundColor: 'var(--cms-primary)', color: 'var(--cms-primary-foreground)' }}
                  className="px-6 border-0"
                >
                  Publish
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
