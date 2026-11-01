import { useParams, Link, useNavigate, useLocation } from 'react-router-dom';
import { useState, useRef, useEffect, useMemo } from 'react';
import {
  Calendar, MapPin, Users, TrendingUp, Clock, Check, Leaf, ArrowRight,
  Bed, Utensils, Mountain, Shield, ChevronDown, X,
  Star, Camera, ChevronLeft, ChevronRight, Sparkles,
  TreePine, Award, Download,
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { SustainabilityBadge } from '../components/ui/badge';
import { Breadcrumbs } from '../components/breadcrumbs';
import { TripCard } from '../components/trip-card';
import { ScrollAnimate } from '../components/scroll-animate';
import { useTrip, useTrips } from '../hooks/useTrips';
import { useTestimonials } from '../hooks/useTestimonials';
import { resolveMediaUrl, tripsApi, addOnsApi, type AddOnRecord } from '../services/api';
import { getItineraryLabel } from '../utils/itinerary';
import { SeoHead } from '../components/SeoHead';

const TABS = ['Overview', 'Itinerary', 'Guest responsibilities', 'Dates & Prices'];

const HIGHLIGHT_ICON_STYLES = [
  { Icon: TreePine, className: 'text-[var(--color-forest-600)]' },
  { Icon: Users, className: 'text-[var(--color-navy-600)]' },
  { Icon: Award, className: 'text-[var(--color-sun-500)]' },
  { Icon: Mountain, className: 'text-[var(--color-forest-600)]' },
  { Icon: Utensils, className: 'text-[var(--color-navy-600)]' },
  { Icon: Shield, className: 'text-[var(--color-sun-500)]' },
];

// Same hero image used on the /reviews page, for visual consistency between
// the two "traveller reviews" surfaces.
const REVIEWS_SECTION_BG = 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1920';

const DIFFICULTY_RATING: Record<string, number> = {
  easy: 2,
  moderate: 3,
  challenging: 4,
  expert: 5,
};

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function monthKey(iso: string) {
  const dt = new Date(iso);
  return `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}`;
}

function formatDate(iso?: string) {
  if (!iso) return '';
  const dt = new Date(iso);
  if (isNaN(dt.getTime())) return '';
  return dt.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function formatReviewDate(iso?: string) {
  if (!iso) return '';
  const dt = new Date(iso);
  if (isNaN(dt.getTime())) return '';
  return dt.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
}

const DEFAULT_BEFORE_YOU_BOOK_SECTIONS = [
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
      'Visa rules depend on your passport and destination. We send entry guidance with your booking confirmation, and you are responsible for holding a valid passport and any required visa.',
      'We strongly recommend checking current entry requirements for your nationality well in advance of travel, as visa regulations can change. Your Trekkers Squad trip coordinator can point you to up-to-date resources.',
    ],
  },
  {
    heading: 'Health & vaccinations',
    items: [
      'Vaccination needs vary by destination. Check official travel health guidance at least 8 weeks before departure and speak to your doctor.',
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
];

interface ComfortAddOnOption {
  label: string;
  price?: string;
  priceUnit?: string;
}

interface ComfortAddOn {
  title: string;
  description?: string;
  type: 'flat' | 'choice';
  price?: string;
  priceUnit?: string;
  options?: ComfortAddOnOption[];
}

const DEFAULT_COMFORT_ADD_ONS: ComfortAddOn[] = [
  {
    title: 'Extra night before or after the trip',
    description: 'Upgrade your stay before or after the trek.',
    type: 'choice',
    options: [
      { label: 'I will book my own accommodation', priceUnit: 'No accommodation upgrade' },
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
];

function comfortAddOnSummary(addOn: ComfortAddOn): string {
  if (addOn.type === 'choice' && addOn.options?.length) {
    const prices = addOn.options.map(o => o.price).filter(Boolean);
    return prices.length ? `from ${prices[0]}` : '';
  }
  return addOn.price ? `${addOn.price}${addOn.priceUnit ? ` ${addOn.priceUnit}` : ''}` : '';
}

// ── Travel dates modal ───────────────────────────────────────────────────────

interface Departure {
  _id?: string;
  startDate: string;
  endDate?: string;
  pricePerPerson?: number;
  totalSeats?: number;
  seatsAvailable?: number;
  status?: string;
  badges?: string[];
  notes?: string;
}

function TravelDatesModal({
  open, onClose, onSelect, selectedMonth, departures, basePrice,
}: {
  open: boolean;
  onClose: () => void;
  onSelect: (month: string | null) => void;
  selectedMonth: string | null;
  departures: Departure[];
  basePrice: number;
}) {
  const [localSelected, setLocalSelected] = useState(selectedMonth);
  useEffect(() => { setLocalSelected(selectedMonth); }, [selectedMonth, open]);

  const monthPrices = useMemo(() => {
    const map: Record<string, number> = {};
    departures.forEach(d => {
      const key = monthKey(d.startDate);
      const price = d.pricePerPerson ?? basePrice;
      if (!map[key] || price < map[key]) map[key] = price;
    });
    return map;
  }, [departures, basePrice]);

  const priceValues = Object.values(monthPrices);
  const lowestPrice = priceValues.length ? Math.min(...priceValues) : null;
  const lowestKey = lowestPrice !== null ? Object.entries(monthPrices).find(([, v]) => v === lowestPrice)?.[0] : undefined;

  const years = useMemo(() => {
    const set = new Set<number>();
    departures.forEach(d => set.add(new Date(d.startDate).getFullYear()));
    const currentYear = new Date().getFullYear();
    if (set.size === 0) {
      set.add(currentYear);
      set.add(currentYear + 1);
    }
    return Array.from(set).sort();
  }, [departures]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center" onClick={onClose}>
      <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" />
      <div
        className="relative bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl w-full max-w-[420px] overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-start justify-between px-6 pt-6 pb-3">
          <div>
            <h3 className="text-xl font-bold text-[#121212]" style={{ fontFamily: 'Outfit, sans-serif' }}>
              Travel dates
            </h3>
            <p className="text-sm text-[var(--color-navy-600)] mt-0.5">Select a month or range</p>
          </div>
          <button onClick={onClose} className="p-2 -mr-1 rounded-full hover:bg-gray-100 transition-colors">
            <X size={18} className="text-gray-500" />
          </button>
        </div>

        <div className="px-6 overflow-y-auto" style={{ maxHeight: '52vh' }}>
          {priceValues.length === 0 ? (
            <div className="py-8 text-center">
              <p className="text-sm text-gray-500">No upcoming departures are scheduled yet.</p>
              <p className="text-xs text-gray-500 mt-1">Contact us to plan a custom date.</p>
            </div>
          ) : (
            years.map(year => (
              <div key={year} className="mb-5">
                <p className="text-sm font-bold text-[#121212] text-center mb-3" style={{ fontFamily: 'Outfit, sans-serif' }}>
                  {year}
                </p>
                <div className="grid grid-cols-3 gap-2">
                  {MONTH_NAMES.map((mon, idx) => {
                    const key = `${year}-${String(idx + 1).padStart(2, '0')}`;
                    const price = monthPrices[key];
                    const available = !!price;
                    const selected = localSelected === key;
                    const isLowest = key === lowestKey;

                    return (
                      <button
                        key={key}
                        disabled={!available}
                        onClick={() => setLocalSelected(selected ? null : key)}
                        className={`rounded-full border-2 py-2.5 px-2 text-center transition-all duration-150 ${
                          selected
                            ? 'border-[#121212] bg-[#121212] text-white'
                            : available
                              ? 'border-gray-200 hover:border-[#121212] text-[#121212] bg-white'
                              : 'border-gray-100 text-gray-300 bg-white cursor-default'
                        }`}
                      >
                        <p className="text-xs font-semibold leading-none">{mon}</p>
                        {available && (
                          <p className={`text-[9px] mt-1 leading-none font-medium ${
                            selected ? 'text-gray-300' : isLowest ? 'text-[var(--color-forest-600)]' : 'text-gray-500'
                          }`}>
                            USD ${price.toLocaleString()}
                          </p>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))
          )}
        </div>

        <div className="px-6 pt-4 pb-6 border-t border-gray-100 mt-2 bg-white">
          <div className="flex items-center gap-2 mb-4">
            <span className="w-2 h-2 rounded-full bg-[var(--color-forest-600)] flex-shrink-0" />
            <p className="text-xs text-gray-500">Prices are the lowest available for each month</p>
          </div>
          <button
            onClick={() => { onSelect(localSelected); onClose(); }}
            className="w-full bg-[#121212] hover:bg-black text-white font-bold py-3.5 rounded-xl text-sm transition-colors mb-2"
          >
            Show departures
          </button>
          <button
            onClick={() => { setLocalSelected(null); onSelect(null); onClose(); }}
            className="w-full border border-gray-200 hover:border-gray-400 text-gray-500 hover:text-gray-700 font-medium py-3 rounded-xl text-sm transition-colors"
          >
            Clear dates
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Animated floating bar ────────────────────────────────────────────────────

function TripFloatingBar({
  price, activeTab, onTabChange, isActive, filterMonth, onOpenDateModal, onBookNow,
}: {
  price: number;
  activeTab: string;
  onTabChange: (tab: string) => void;
  isActive: boolean;
  filterMonth: string | null;
  onOpenDateModal: () => void;
  onBookNow: () => void;
}) {
  const NAV_TABS = ['Overview', 'Itinerary', 'Guest responsibilities'];

  return (
    <>
      <div
        className="hidden lg:flex fixed z-40 bg-white items-stretch overflow-hidden"
        style={{
          top: 0, left: 0, right: 0, height: '62px',
          borderRadius: isActive ? '0' : '14px 0 0 14px',
          boxShadow: isActive
            ? '0 2px 16px rgba(0,0,0,0.09), 0 1px 0 rgba(0,0,0,0.06)'
            : '0 12px 48px rgba(0,0,0,0.22)',
          transform: isActive ? 'translateX(0px) translateY(64px)' : 'translateX(110%) translateY(46vh)',
          transition: 'transform 600ms cubic-bezier(0.4,0,0.2,1), box-shadow 400ms ease, border-radius 400ms ease',
          borderBottom: isActive ? '1px solid rgba(0,0,0,0.07)' : 'none',
          willChange: 'transform',
        }}
      >
        <div className="flex items-stretch border-r border-gray-100 flex-shrink-0">
          {NAV_TABS.map(tab => (
            <button
              key={tab}
              onClick={() => onTabChange(tab)}
              className={`h-full px-5 text-sm font-medium border-b-2 transition-all whitespace-nowrap ${
                activeTab === tab
                  ? 'border-[var(--color-forest-600)] text-[var(--color-forest-600)]'
                  : 'border-transparent text-gray-500 hover:text-[#121212] hover:bg-gray-50/70'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="flex-1" />

        <button
          onClick={onOpenDateModal}
          className={`flex items-center gap-2 h-9 my-auto px-4 rounded-xl border text-sm font-medium transition-all whitespace-nowrap flex-shrink-0 ${
            filterMonth ? 'border-[#121212] bg-[#121212] text-white' : 'border-gray-200 text-gray-600 hover:border-gray-400 bg-white'
          }`}
        >
          <Calendar size={14} className={filterMonth ? 'text-white' : 'text-gray-500'} />
          {filterMonth
            ? `${MONTH_NAMES[parseInt(filterMonth.split('-')[1]) - 1]} ${filterMonth.split('-')[0]}`
            : 'Travel dates'}
        </button>

        <div className="flex items-center gap-1 px-4 border-l border-gray-100 flex-shrink-0">
          <p className="text-[9px] text-gray-500 uppercase tracking-widest font-medium">From</p>
          <p className="text-sm font-bold text-[#121212] ml-1">
            ${price}<span className="text-xs font-normal text-gray-500"> /pp</span>
          </p>
        </div>

        <button
          onClick={onBookNow}
          className="flex-shrink-0 mr-4 my-auto bg-[var(--color-forest-600)] hover:bg-[var(--color-forest-700)] text-white font-bold rounded-xl px-6 h-9 text-sm transition-colors whitespace-nowrap"
        >
          Book now
        </button>
      </div>

      <div
        className="lg:hidden fixed z-40 left-0 right-0 bottom-0 bg-white border-t border-gray-200 flex items-center px-4 gap-3"
        style={{
          height: '68px',
          transform: isActive ? 'translateY(0)' : 'translateY(100%)',
          transition: 'transform 600ms cubic-bezier(0.4,0,0.2,1)',
          boxShadow: '0 -4px 24px rgba(0,0,0,0.10)',
          willChange: 'transform',
        }}
      >
        <button
          onClick={onOpenDateModal}
          className={`flex items-center gap-1.5 h-9 px-3 rounded-xl border text-xs font-medium transition-all flex-shrink-0 ${
            filterMonth ? 'border-[#121212] bg-[#121212] text-white' : 'border-gray-200 text-gray-600 bg-white'
          }`}
        >
          <Calendar size={13} className={filterMonth ? 'text-white' : 'text-gray-500'} />
          {filterMonth
            ? `${MONTH_NAMES[parseInt(filterMonth.split('-')[1]) - 1]} '${filterMonth.split('-')[0].slice(2)}`
            : 'Travel dates'}
        </button>
        <div className="flex items-baseline gap-1 flex-1 justify-center">
          <span className="text-base font-bold text-[#121212]">From ${price}</span>
          <span className="text-xs text-gray-500">/ pp</span>
        </div>
        <button
          onClick={onBookNow}
          className="flex-shrink-0 bg-[var(--color-forest-600)] hover:bg-[var(--color-forest-700)] text-white text-sm font-bold h-10 px-5 rounded-xl transition-colors"
        >
          Book now
        </button>
      </div>
    </>
  );
}

interface BeforeYouBookSection {
  heading: string;
  items: string[];
}

function BeforeYouBook({
  sections, ctaHeading, ctaSubtitle, ctaLinkLabel, ctaLinkUrl,
}: {
  sections: BeforeYouBookSection[];
  ctaHeading: string;
  ctaSubtitle: string;
  ctaLinkLabel: string;
  ctaLinkUrl: string;
}) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [allOpen, setAllOpen] = useState(false);

  const toggle = (index: number) => {
    if (allOpen) { setAllOpen(false); setOpenIndex(index); }
    else { setOpenIndex(prev => prev === index ? null : index); }
  };
  const isOpen = (index: number) => allOpen || openIndex === index;

  if (sections.length === 0) return null;

  return (
    <div>
      <div className="flex items-center justify-between mb-4 pb-2 border-b border-gray-200">
        <h2 className="text-lg font-bold" style={{ fontFamily: 'Outfit, sans-serif' }}>
          Before you book
        </h2>
        <button
          onClick={() => { setAllOpen(prev => !prev); setOpenIndex(null); }}
          className="text-xs text-[var(--color-forest-600)] hover:underline font-medium"
        >
          {allOpen ? 'Hide all' : 'Show all'}
        </button>
      </div>

      <div className="divide-y divide-gray-100 border border-gray-200 rounded-xl overflow-hidden">
        {sections.map((section, index) => (
          <div key={index}>
            <button
              onClick={() => toggle(index)}
              className="w-full flex items-center justify-between px-5 py-4 text-left bg-white hover:bg-gray-50 transition-colors"
              aria-expanded={isOpen(index)}
            >
              <span className="text-sm font-semibold text-[#121212]">{section.heading}</span>
              <ChevronDown
                size={16}
                className={`text-gray-500 flex-shrink-0 transition-transform duration-200 ${isOpen(index) ? 'rotate-180' : ''}`}
              />
            </button>
            {isOpen(index) && (
              <div className="px-5 pb-5 bg-gray-50/50 border-t border-gray-100">
                <ul className="pt-4 space-y-1.5 text-sm text-gray-700">
                  {section.items.map((t, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-[var(--color-forest-600)] flex-shrink-0" />
                      {t}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ))}
      </div>

      {(ctaHeading || ctaSubtitle) && (
        <div className="mt-5 flex items-center gap-3 p-4 rounded-xl bg-gray-50 border border-gray-200">
          <div className="flex-1">
            {ctaHeading && <p className="text-sm font-semibold text-[#121212]">{ctaHeading}</p>}
            {ctaSubtitle && <p className="text-xs text-gray-500 mt-0.5">{ctaSubtitle}</p>}
          </div>
          <Link to={ctaLinkUrl || '/faq'} className="flex-shrink-0">
            <Button variant="outline" className="text-sm border-gray-300 hover:border-[var(--color-forest-600)] hover:text-[var(--color-forest-600)] gap-2 whitespace-nowrap">
              {ctaLinkLabel || 'Read FAQs'}
              <ArrowRight size={14} />
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

export function TripDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { trip, loading, error } = useTrip(id || '');

  const relatedTripsParams = trip?.categoryId
    ? { categoryId: trip.categoryId }
    : trip?.categorySlug
    ? { categorySlug: trip.categorySlug }
    : undefined;
  const { trips: relatedTripsRaw } = useTrips(relatedTripsParams);
  const { testimonials } = useTestimonials({ trip: trip?.id || trip?._id, status: 'approved' });
  // Most trips don't have their own reviews yet — fall back to sitewide approved
  // testimonials so the reviews carousel always has real content to show.
  const { testimonials: sitewideTestimonials } = useTestimonials({ status: 'approved' });
  const reviewSectionTestimonials = testimonials.length > 0 ? testimonials : sitewideTestimonials;

  const [activeTab, setActiveTab] = useState('Overview');
  const [activeDay, setActiveDay] = useState<number | null>(0);
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [galleryIndex, setGalleryIndex] = useState(0);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [floatingBarActive, setFloatingBarActive] = useState(false);
  const [dateModalOpen, setDateModalOpen] = useState(false);
  const [filterMonth, setFilterMonth] = useState<string | null>(null);
  const [showAllDates, setShowAllDates] = useState(false);
  const [reviewIdx, setReviewIdx] = useState(0);
  const [reviewDir, setReviewDir] = useState<'left' | 'right'>('right');
  const [comfortAddOnRecords, setComfortAddOnRecords] = useState<AddOnRecord[]>([]);
  const viewTrackedRef = useRef<string | null>(null);

  const sectionRefs = {
    Overview: useRef<HTMLDivElement>(null),
    Itinerary: useRef<HTMLDivElement>(null),
    'Guest responsibilities': useRef<HTMLDivElement>(null),
    'Dates & Prices': useRef<HTMLDivElement>(null),
  };

  useEffect(() => {
    if (!id || viewTrackedRef.current === id) return;
    viewTrackedRef.current = id;
    tripsApi.incrementView(id).catch(() => {});
  }, [id]);

  useEffect(() => {
    const tid = trip?._id || trip?.id;
    if (!tid) return;
    let active = true;
    addOnsApi
      .getAll({ status: 'active', kind: 'comfort', trip: tid })
      .then((data) => { if (active) setComfortAddOnRecords(data || []); })
      .catch(() => {});
    return () => { active = false; };
  }, [trip?._id, trip?.id]);

  // Canonicalize: if this trip has a slug and the URL is still on the raw
  // Mongo ID (e.g. an old link), swap to the pretty slug URL.
  useEffect(() => {
    if (!trip?.slug || !id) return;
    if (id !== trip.slug && /^[0-9a-fA-F]{24}$/.test(id)) {
      navigate(`/trip/${trip.slug}`, { replace: true });
    }
  }, [trip?.slug, id, navigate]);

  useEffect(() => {
    const onScroll = () => {
      try {
        const el = sectionRefs.Itinerary.current;
        if (el) setFloatingBarActive(el.getBoundingClientRect().bottom < window.innerHeight);
      } catch (_) {
        // ignore
      }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const heroImage = resolveMediaUrl(
    trip?.image || trip?.featuredImage ||
    'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&h=800&fit=crop&auto=format',
    { width: 1920, height: 1000, crop: 'c_fill' }
  );

  const galleryImages = useMemo(() => {
    if (!trip) return [];
    const rawSources =
      (trip.highlightGallery && trip.highlightGallery.length > 0
        ? trip.highlightGallery
        : trip.gallery || trip.galleryImages || trip.media || trip.photos || trip.imageHighlights || trip.images || []) || [];

    const urls = rawSources
      .map((item: any) => {
        if (!item) return null;
        if (typeof item === 'string') return resolveMediaUrl(item, { width: 1200 });
        return resolveMediaUrl(item.image || item.url || item.src || item.photo || item.path, { width: 1200 });
      })
      .filter(Boolean) as string[];

    return urls.length > 0 ? urls : [heroImage];
  }, [trip, heroImage]);

  const itinerary = useMemo(
    () => (trip?.itinerary || []).map((day: any) => ({
      ...day,
      highlights: day.highlights || [],
      optional: day.optional || [],
      image: day.image ? resolveMediaUrl(day.image, { width: 900 }) : '',
    })),
    [trip?.itinerary]
  );

  const comfortAddOns: ComfortAddOn[] = useMemo(() => {
    const fmt = (n?: number) => (n != null && n > 0 ? `$${n}` : undefined);
    const fromRecords: ComfortAddOn[] = comfortAddOnRecords.map((a) => ({
      title: a.title,
      description: a.description,
      type: a.pricingType === 'choice' ? 'choice' : 'flat',
      price: fmt(a.price),
      priceUnit: a.priceUnit,
      options: (a.options || []).map((o) => ({
        label: o.label || '',
        price: fmt(o.price),
        priceUnit: o.priceUnit,
      })),
    }));

    const base: ComfortAddOn[] = fromRecords.length
      ? fromRecords
      : trip?.comfortAddOns?.length
      ? trip.comfortAddOns
      : DEFAULT_COMFORT_ADD_ONS;

    // Every choice-type add-on (e.g. accommodation upgrade) should offer a free
    // "no upgrade" option — inject one if the data doesn't already have one.
    return base.map((addOn) => {
      if (addOn.type === 'choice' && addOn.options?.length && !addOn.options.some((o) => !o.price)) {
        return {
          ...addOn,
          options: [
            { label: 'I will book my own accommodation', priceUnit: 'No accommodation upgrade' },
            ...addOn.options,
          ],
        };
      }
      return addOn;
    });
  }, [comfortAddOnRecords, trip?.comfortAddOns]);

  const upcomingDepartures = useMemo(() => {
    if (!trip?.departures) return [];
    const now = new Date();
    return trip.departures
      .filter((d: Departure) => d.startDate && new Date(d.startDate) >= now && d.status !== 'cancelled')
      .slice()
      .sort((a: Departure, b: Departure) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());
  }, [trip?.departures]);

  const filteredDepartures = filterMonth
    ? upcomingDepartures.filter((d: Departure) => monthKey(d.startDate) === filterMonth)
    : upcomingDepartures;

  const DATES_PREVIEW_COUNT = 5;
  const visibleDepartures = showAllDates ? filteredDepartures : filteredDepartures.slice(0, DATES_PREVIEW_COUNT);

  useEffect(() => {
    setShowAllDates(false);
  }, [filterMonth]);

  const scrollToDatesAndExpand = () => {
    const departure = upcomingDepartures[0];
    if (departure) {
      setSelectedDate(departure._id || departure.startDate);
    }
    setActiveTab('Dates & Prices');
    requestAnimationFrame(() => {
      const el = sectionRefs['Dates & Prices'].current;
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  };

  useEffect(() => {
    if (!trip) return;
    if ((location.state as any)?.scrollToDates) {
      scrollToDatesAndExpand();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trip, location.state]);

  const relatedTrips = useMemo(() => {
    if (!trip) return [];
    const currentTripId = trip.id || trip._id;
    return relatedTripsRaw
      .filter((t: any) => t.id !== currentTripId && t._id !== currentTripId)
      .slice(0, 3);
  }, [trip, relatedTripsRaw]);

  const avgRating = testimonials.length > 0
    ? (testimonials.reduce((s, r) => s + (r.rating || 0), 0) / testimonials.length).toFixed(1)
    : null;

  const reviewSectionAvgRating = reviewSectionTestimonials.length > 0
    ? (reviewSectionTestimonials.reduce((s, r) => s + (r.rating || 0), 0) / reviewSectionTestimonials.length).toFixed(1)
    : null;

  const brochureUrl = (trip?.brochureUrl || '').trim();
  const brochureDownloadUrl =
    brochureUrl && brochureUrl.includes('res.cloudinary.com') && brochureUrl.includes('/upload/')
      ? brochureUrl.replace('/upload/', '/upload/fl_attachment/')
      : brochureUrl;

  const scrollToSection = (tab: string) => {
    setActiveTab(tab);
    const el = sectionRefs[tab as keyof typeof sectionRefs]?.current;
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const toPreDeparture = (d: Departure, fallbackPrice: number, fallbackMaxGroup?: number) => {
    const startDate = new Date(d.startDate);
    const endDate = d.endDate ? new Date(d.endDate) : undefined;
    const dateRange = endDate
      ? `${startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${endDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`
      : startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    const totalSeats = d.totalSeats ?? fallbackMaxGroup ?? 12;
    const seatsAvailable = d.seatsAvailable ?? totalSeats;
    return {
      id: d._id || `${startDate.toISOString()}`,
      dateRange,
      startDate,
      endDate,
      seatsAvailable,
      totalSeats,
      pricePerPerson: d.pricePerPerson ?? fallbackPrice,
      badges: d.badges?.length ? d.badges : [],
    };
  };

  const goToBooking = (d?: Departure | null) => {
    if (!trip) return;
    if (d) {
      navigate(`/trip/${tripId}/details`, { state: { departure: toPreDeparture(d, trip.price, trip.maxGroupSize) } });
    } else {
      navigate(`/trip/${tripId}/details`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <div className="bg-gray-100 p-1.5">
          <div className="h-[65vh] min-h-[460px] rounded-xl bg-gray-200 animate-pulse" />
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-4 animate-pulse">
          <div className="h-8 w-2/3 bg-gray-200 rounded" />
          <div className="h-4 w-1/3 bg-gray-200 rounded" />
          <div className="h-32 w-full bg-gray-100 rounded-xl mt-6" />
        </div>
      </div>
    );
  }

  if (!trip || error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center p-12 max-w-md">
          <Mountain size={48} className="mx-auto mb-4 text-[var(--color-navy-600)]" />
          <h1 className="text-2xl mb-3 font-semibold">Trip Not Found</h1>
          <p className="text-gray-500 mb-6 text-sm">This adventure does not exist or has been removed.</p>
          <Link to="/all-trips"><Button>Browse All Trips</Button></Link>
        </div>
      </div>
    );
  }

  const tripId = trip.slug || id || trip.id || trip._id || '';
  const categoryLabel = trip.categoryLabel || trip.category?.label || 'Trips';
  const categorySlug = trip.categorySlug || trip.category?.slug || '';
  const nextDeparture = upcomingDepartures[0];
  const currentSelectedDeparture = selectedDate
    ? upcomingDepartures.find((d: Departure) => (d._id || d.startDate) === selectedDate)
    : nextDeparture;
  const floatingBarPrice = currentSelectedDeparture?.pricePerPerson ?? trip.price;

  const tripDescription =
    trip.heroSubtitle ||
    (trip.description ? String(trip.description).replace(/<[^>]+>/g, '').slice(0, 160) : '') ||
    'Small-group adventure with The Trekkers Squad.';

  return (
    <div className="min-h-screen bg-white text-[#121212]">
      <SeoHead
        title={trip.title}
        description={tripDescription}
        image={heroImage}
        type="website"
        jsonLd={{
          '@context': 'https://schema.org',
          '@type': 'TouristTrip',
          name: trip.title,
          description: tripDescription,
          image: heroImage,
          url: typeof window !== 'undefined' ? window.location.href : undefined,
        }}
      />

      {/* ── Photo Gallery ── */}
      <section className="bg-[var(--color-navy-900)] p-2 sm:p-3">
        <div className="hidden sm:flex h-[58vh] min-h-[420px] max-h-[640px] gap-3">
          <div
            className="relative flex-1 overflow-hidden rounded-3xl bg-gray-300 cursor-zoom-in group"
            onClick={() => setGalleryOpen(true)}
          >
            <img
              key={galleryIndex}
              src={galleryImages[galleryIndex]}
              alt={trip.title}
              className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-500"
              style={{ animation: 'fadeIn 0.35s ease' }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent pointer-events-none" />
            <div className="absolute bottom-4 left-4 bg-black/50 backdrop-blur-sm text-white text-xs px-3 py-1.5 rounded-full font-medium">
              {galleryIndex + 1} / {galleryImages.length}
            </div>
            {galleryImages.length > 1 && (
              <button
                onClick={e => { e.stopPropagation(); setGalleryOpen(true); }}
                className="absolute bottom-4 right-4 bg-white/95 backdrop-blur-sm text-xs font-medium px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow hover:bg-white transition-colors border border-gray-200"
              >
                <Camera size={12} />All photos
              </button>
            )}
          </div>

          {galleryImages.length > 1 && (
            <div
              className="w-[118px] flex-shrink-0 flex flex-col gap-1.5 overflow-y-auto"
              style={{ scrollbarWidth: 'thin', scrollbarColor: '#d1d5db transparent' }}
            >
              {galleryImages.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setGalleryIndex(i)}
                  className={`relative w-full flex-shrink-0 rounded-lg overflow-hidden bg-gray-200 group transition-all duration-200 ${
                    galleryIndex === i ? 'ring-2 ring-[var(--color-forest-600)] opacity-100' : 'opacity-55 hover:opacity-90'
                  }`}
                  style={{ height: '88px' }}
                >
                  <img src={img} alt={`Photo ${i + 1}`} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="flex sm:hidden flex-col gap-1.5">
          <div
            className="relative w-full overflow-hidden rounded-3xl bg-gray-300 cursor-zoom-in group"
            style={{ height: '52vw', minHeight: '220px' }}
            onClick={() => setGalleryOpen(true)}
          >
            <img
              key={galleryIndex}
              src={galleryImages[galleryIndex]}
              alt={trip.title}
              className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-500"
              style={{ animation: 'fadeIn 0.35s ease' }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent pointer-events-none" />
            <div className="absolute bottom-3 left-3 bg-black/50 backdrop-blur-sm text-white text-xs px-2.5 py-1 rounded-full font-medium">
              {galleryIndex + 1} / {galleryImages.length}
            </div>
            {galleryImages.length > 1 && (
              <button
                onClick={e => { e.stopPropagation(); setGalleryOpen(true); }}
                className="absolute bottom-3 right-3 bg-white/95 text-xs font-medium px-2.5 py-1 rounded-full flex items-center gap-1 shadow border border-gray-200"
              >
                <Camera size={11} />All photos
              </button>
            )}
          </div>

          {galleryImages.length > 1 && (
            <div className="flex gap-1.5 overflow-x-auto pb-0.5" style={{ scrollbarWidth: 'none' }}>
              {galleryImages.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setGalleryIndex(i)}
                  className={`relative flex-shrink-0 rounded-lg overflow-hidden bg-gray-200 group transition-all duration-200 ${
                    galleryIndex === i ? 'ring-2 ring-[var(--color-forest-600)] opacity-100' : 'opacity-55 hover:opacity-90'
                  }`}
                  style={{ width: '72px', height: '52px' }}
                >
                  <img src={img} alt={`Photo ${i + 1}`} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" />
                </button>
              ))}
            </div>
          )}
        </div>
      </section>

      <style>{`
        @keyframes fadeIn { from { opacity: 0.7; transform: scale(1.01); } to { opacity: 1; transform: scale(1); } }
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
        @keyframes reviewSlideIn { from { opacity: 0; transform: translateX(40px); } to { opacity: 1; transform: translateX(0); } }
        @keyframes reviewSlideInLeft { from { opacity: 0; transform: translateX(-40px); } to { opacity: 1; transform: translateX(0); } }
      `}</style>

      {/* ── Title + Meta Row ── */}
      <div className="bg-[var(--color-forest-50)] border-b border-[var(--color-forest-100)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Breadcrumbs
            items={[
              { label: 'All Trips', path: '/all-trips' },
              { label: categoryLabel, path: categorySlug ? `/${categorySlug}` : '/all-trips' },
              { label: trip.title },
            ]}
            className="mb-3 text-xs"
          />
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-[#121212] leading-tight mb-2" style={{ fontFamily: 'Outfit, sans-serif' }}>
                {trip.title}
              </h1>
              <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600">
                <span className="flex items-center gap-1">
                  <MapPin size={13} className="text-[var(--color-forest-600)]" />
                  {trip.region}
                </span>
                {avgRating && (
                  <>
                    <span className="text-gray-300">|</span>
                    <span className="flex items-center gap-1">
                      <Star size={13} className="fill-[var(--color-sun-500)] text-[var(--color-sun-500)]" />
                      <strong className="text-[#121212]">{avgRating}</strong>
                      <span className="text-gray-500">({testimonials.length} reviews)</span>
                    </span>
                  </>
                )}
              </div>
              {trip.sustainabilityBadges && trip.sustainabilityBadges.length > 0 && (
                <div className="flex flex-wrap items-center gap-2 mt-3">
                  {trip.sustainabilityBadges.map((badge: string) => (
                    <SustainabilityBadge key={badge} label={badge} size="sm" />
                  ))}
                </div>
              )}
            </div>

            <div className="hidden lg:block text-right">
              <p className="text-xs text-gray-500 uppercase tracking-wide">From</p>
              <p className="text-4xl font-bold text-[var(--color-forest-600)]">${trip.price}</p>
              <p className="text-xs text-gray-500">per person</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Stat Bar ── */}
      <div className="bg-white py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex overflow-x-auto gap-0 gap-3 scrollbar-hide">
            {/* Duration */}
            <div className="flex-shrink-0 flex flex-col items-start gap-0.5 px-5 py-3 min-w-[140px] rounded-2xl bg-[var(--color-navy-50)] border border-[var(--color-navy-100)]">
              <span className="flex items-center gap-1 text-gray-500 text-xs uppercase tracking-widest font-medium">
                <Clock size={14} />Duration
              </span>
              <span className="text-sm font-semibold text-[#121212]">
                {trip.duration} {Number(trip.duration) === 1 ? 'day' : 'days'}
              </span>
            </div>
            {/* Group size */}
            <div className="flex-shrink-0 flex flex-col items-start gap-0.5 px-5 py-3 min-w-[140px] rounded-2xl bg-[var(--color-navy-50)] border border-[var(--color-navy-100)]">
              <span className="flex items-center gap-1 text-gray-500 text-xs uppercase tracking-widest font-medium">
                <Users size={14} />Group size
              </span>
              <span className="text-sm font-semibold text-[#121212]">
                {trip.maxGroupSize ? `Max ${trip.maxGroupSize}` : '6–12 people'}
              </span>
            </div>
            {/* Physical rating — square boxes */}
            <div className="flex-shrink-0 flex flex-col items-start gap-1 px-5 py-3 min-w-[140px] rounded-2xl bg-[var(--color-navy-50)] border border-[var(--color-navy-100)]">
              <span className="flex items-center gap-1 text-gray-500 text-xs uppercase tracking-widest font-medium">
                <TrendingUp size={14} />Physical rating
              </span>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map(n => (
                  <div
                    key={n}
                    className="w-3.5 h-3.5 rounded-full"
                    style={{ background: n <= DIFFICULTY_RATING[trip.difficulty] ? '#15803d' : '#dde7f2' }}
                  />
                ))}
              </div>
            </div>
            {/* Season */}
            <div className="flex-shrink-0 flex flex-col items-start gap-0.5 px-5 py-3 min-w-[140px] rounded-2xl bg-[var(--color-navy-50)] border border-[var(--color-navy-100)]">
              <span className="flex items-center gap-1 text-gray-500 text-xs uppercase tracking-widest font-medium">
                <Calendar size={14} />Season
              </span>
              <span className="text-sm font-semibold text-[#121212]">{trip.season || 'Year-round'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Sticky Tab Nav ── */}
      <div
        className="sticky top-0 z-30 border-b border-gray-200 bg-white/95 backdrop-blur-md shadow-sm overflow-hidden"
        style={{
          maxHeight: floatingBarActive ? '0px' : '60px',
          opacity: floatingBarActive ? 0 : 1,
          pointerEvents: floatingBarActive ? 'none' : 'auto',
          transition: 'max-height 400ms cubic-bezier(0.4,0,0.2,1), opacity 300ms ease',
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex overflow-x-auto gap-2 py-2.5 scrollbar-hide">
            {TABS.map(tab => (
              <button
                key={tab}
                onClick={() => scrollToSection(tab)}
                className={`flex-shrink-0 px-5 py-2 text-sm font-medium rounded-full transition-colors whitespace-nowrap ${
                  activeTab === tab
                    ? 'bg-[var(--color-navy-900)] text-white'
                    : 'bg-transparent text-gray-600 hover:bg-[var(--color-navy-50)]'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Main Content + Sidebar ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-10 items-start">

          {/* LEFT — content */}
          <div
            className="flex-1 min-w-0 space-y-12"
            style={{
              maxWidth: floatingBarActive ? '840px' : undefined,
              marginLeft: floatingBarActive ? 'auto' : undefined,
              marginRight: floatingBarActive ? 'auto' : undefined,
              transition: 'max-width 600ms cubic-bezier(0.4,0,0.2,1), margin 600ms cubic-bezier(0.4,0,0.2,1)',
            }}
          >

            {/* ── Overview ── */}
            <div ref={sectionRefs.Overview}>
              <h2 className="text-xl font-bold mb-5 pl-4 border-l-4 border-[var(--color-forest-500)]" style={{ fontFamily: 'Outfit, sans-serif' }}>
                Why you will love this trip
              </h2>
              <p className="text-gray-700 leading-relaxed mb-5 text-sm">
                {trip.description || `Join a small group for ${trip.duration} ${Number(trip.duration) === 1 ? 'day' : 'days'} in ${trip.region}. Expect well-planned logistics, local expertise and time to enjoy the place.`}
              </p>

              {trip.highlights && trip.highlights.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
                  {trip.highlights.map((h: string, i: number) => {
                    const { Icon, className } = HIGHLIGHT_ICON_STYLES[i % HIGHLIGHT_ICON_STYLES.length];
                    return (
                      <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                        <span className="flex-shrink-0 mt-0.5"><Icon size={16} className={className} /></span>
                        <span className="text-sm text-gray-700">{h}</span>
                      </div>
                    );
                  })}
                </div>
              )}

              {trip.sustainabilityBadges && trip.sustainabilityBadges.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {trip.sustainabilityBadges.map((tag: string) => (
                    <span key={tag} className="text-xs px-3 py-1 rounded-full border border-[var(--color-forest-600)]/30 text-[var(--color-forest-600)] bg-[var(--color-forest-600)]/5 font-medium">
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* ── Itinerary ── */}
            {itinerary.length > 0 && (
              <div ref={sectionRefs.Itinerary}>
                <h2 className="text-xl font-bold mb-5 pl-4 border-l-4 border-[var(--color-forest-500)]" style={{ fontFamily: 'Outfit, sans-serif' }}>
                  Day-by-day itinerary
                </h2>
                <div className="space-y-2">
                  {itinerary.map((day: any, i: number) => {
                    const isOpen = activeDay === i;
                    const dayLabel = getItineraryLabel(day.day, i);
                    return (
                      <div key={i} className="border border-gray-200 rounded-lg overflow-hidden hover:border-gray-300 transition-colors">
                        <button
                          onClick={() => setActiveDay(isOpen ? null : i)}
                          className="w-full text-left px-4 py-3 flex items-center gap-4 bg-white hover:bg-gray-50 transition-colors"
                          aria-expanded={isOpen}
                        >
                          <span className="flex-shrink-0 w-8 h-8 rounded-full bg-[var(--color-forest-600)] text-white text-xs font-bold flex items-center justify-center">
                            {i + 1}
                          </span>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-sm font-semibold text-[#121212]">{dayLabel} · {day.title}</span>
                              {day.location && (
                                <span className="text-xs text-gray-500 flex items-center gap-0.5">
                                  <MapPin size={10} />{day.location}
                                </span>
                              )}
                            </div>
                            {(day.accommodation || day.meals || day.distance || day.elevation) && (
                              <div className="flex items-center gap-3 mt-0.5 flex-wrap">
                                {day.accommodation && (
                                  <span className="text-xs text-gray-500 flex items-center gap-1">
                                    <Bed size={9} />{day.accommodation}
                                  </span>
                                )}
                                {day.meals && (
                                  <span className="text-xs text-gray-500 flex items-center gap-1">
                                    <Utensils size={9} />Meals: {day.meals}
                                  </span>
                                )}
                                {day.distance && (
                                  <span className="text-xs text-gray-500 flex items-center gap-1">
                                    Distance: {day.distance}
                                  </span>
                                )}
                                {day.elevation && (
                                  <span className="text-xs text-gray-500 flex items-center gap-1">
                                    Elevation: {day.elevation}
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                          <ChevronDown size={16} className={`text-gray-500 flex-shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
                        </button>

                        {isOpen && (
                          <div className="px-4 pb-4 pt-1 bg-gray-50/60 border-t border-gray-100">
                            {day.image && (
                              <div className="rounded-lg overflow-hidden mb-3 h-48">
                                <img src={day.image} alt={day.title} className="w-full h-full object-cover" />
                              </div>
                            )}
                            <p className="text-sm text-gray-700 leading-relaxed mb-3">{day.description}</p>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              {day.highlights.length > 0 && (
                                <div>
                                  <p className="text-xs uppercase tracking-widest text-gray-500 font-medium mb-1.5">Included activities</p>
                                  <ul className="space-y-1">
                                    {day.highlights.map((h: string, idx: number) => (
                                      <li key={idx} className="flex items-center gap-2 text-xs text-gray-700">
                                        <Check size={11} className="text-[var(--color-forest-600)] flex-shrink-0" />{h}
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                              {day.optional.length > 0 && (
                                <div>
                                  <p className="text-xs uppercase tracking-widest text-gray-500 font-medium mb-1.5">Optional extras</p>
                                  <ul className="space-y-1">
                                    {day.optional.map((o: { name: string; price?: string }, idx: number) => (
                                      <li key={idx} className="flex items-center justify-between text-xs text-gray-600 bg-amber-50 px-2 py-1 rounded">
                                        <span>{o.name}</span>
                                        {o.price && <span className="font-semibold text-amber-700">{o.price}</span>}
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ── Guest responsibilities ── */}
            <div ref={sectionRefs['Guest responsibilities']}>
              <h2 className="text-lg font-bold mb-1 pb-2 border-b border-gray-200" style={{ fontFamily: 'Outfit, sans-serif' }}>
                What's included &amp; guest responsibilities
              </h2>
              <p className="text-xs text-gray-500 mb-5">Everything covered so you can travel with full attention.</p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-start">
                <div>
                  <h3 className="text-xs font-semibold uppercase tracking-widest text-[var(--color-forest-600)] mb-3 flex items-center gap-1.5">
                    <Check size={12} />What is included
                  </h3>
                  <div className="space-y-2">
                    {(trip.inclusions || []).map((item: string, i: number) => (
                      <div key={i} className="flex items-start gap-2.5 p-2.5 rounded-lg border border-gray-100 hover:border-gray-200 hover:bg-gray-50/60 transition-colors">
                        <Check size={14} className="flex-shrink-0 mt-0.5 text-[var(--color-forest-600)]" />
                        <p className="text-sm text-gray-700 leading-snug">{item}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-xs font-semibold uppercase tracking-widest text-gray-500 mb-3 flex items-center gap-1.5">
                    <X size={12} />Guest responsibilities
                  </h3>
                  <div className="rounded-xl border border-gray-100 divide-y divide-gray-100 overflow-hidden">
                    {(trip.exclusions || []).map((item: string, i: number) => (
                      <div key={i} className="flex items-start gap-3 px-4 py-3 bg-white hover:bg-gray-50/60 transition-colors">
                        <X size={12} className="text-gray-300 flex-shrink-0 mt-0.5" />
                        <span className="text-sm text-gray-600">{item}</span>
                      </div>
                    ))}
                  </div>

                  <div className="mt-4 p-3 rounded-xl bg-amber-50 border border-amber-100">
                    <p className="text-xs text-amber-700 leading-relaxed">
                      <strong>Travel Insurance is compulsory.</strong> We recommend a policy that covers medical evacuation, trip cancellation, and high-altitude activities.
                    </p>
                  </div>

                  <div className="mt-5">
                    <h3 className="text-xs font-semibold uppercase tracking-widest text-[var(--color-navy-600)] mb-3 flex items-center gap-1.5">
                      <Sparkles size={12} />Comfort add-ons
                    </h3>
                    <p className="text-xs text-gray-500 mb-2.5">Optional extras to elevate your experience.</p>
                    <div className="rounded-xl border border-[var(--color-navy-600)]/15 divide-y divide-gray-100 overflow-hidden">
                      {comfortAddOns.map((addOn, i) => (
                        <div key={i} className="flex items-start justify-between gap-3 px-4 py-2.5 bg-[var(--color-navy-600)]/3 hover:bg-[var(--color-navy-600)]/8 transition-colors">
                          <div className="flex items-start gap-3">
                            <span className="flex-shrink-0 mt-0.5 text-[var(--color-navy-600)]">+</span>
                            <span className="text-sm text-gray-700">{addOn.title}</span>
                          </div>
                          <span className="text-xs font-semibold text-[#121212] flex-shrink-0 whitespace-nowrap">{comfortAddOnSummary(addOn)}</span>
                        </div>
                      ))}
                    </div>
                    <p className="text-xs text-gray-500 mt-2">Choose these on the next step when you book.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* ── Dates & Prices ── */}
            <div ref={sectionRefs['Dates & Prices']}>
              <div className="flex items-center justify-between mb-4 pb-2 border-b border-gray-200">
                <h2 className="text-lg font-bold" style={{ fontFamily: 'Outfit, sans-serif' }}>
                  Dates & prices
                </h2>
                <p className="text-xs text-gray-500">Prices can change anytime</p>
              </div>

              <div className="flex items-center gap-2 mb-4 flex-wrap">
                <button
                  onClick={() => setDateModalOpen(true)}
                  className={`flex items-center gap-2 border rounded-lg px-3 py-2 text-sm transition-colors bg-white ${
                    filterMonth ? 'border-[#121212] text-[#121212] font-medium' : 'border-gray-300 text-gray-600 hover:border-gray-400'
                  }`}
                >
                  <Calendar size={14} className={filterMonth ? 'text-[#121212]' : 'text-gray-500'} />
                  {filterMonth
                    ? `${MONTH_NAMES[parseInt(filterMonth.split('-')[1]) - 1]} ${filterMonth.split('-')[0]}`
                    : 'Travel dates'}
                  {filterMonth && (
                    <span
                      onClick={e => { e.stopPropagation(); setFilterMonth(null); }}
                      className="ml-1 text-gray-500 hover:text-gray-700 transition-colors"
                    >
                      <X size={12} />
                    </span>
                  )}
                </button>
                <div className="flex-1" />
                <div className="flex items-center gap-1.5 border border-gray-300 rounded-lg px-3 py-2 text-xs font-medium text-gray-600 bg-white">
                  <ArrowRight size={13} className="rotate-90" />
                  Start date (earliest)
                </div>
              </div>

              <div className="border border-gray-200 rounded-xl overflow-hidden divide-y divide-gray-200">
                {filteredDepartures.length === 0 && (
                  <div className="py-10 text-center">
                    <p className="text-sm font-medium text-gray-500">
                      {filterMonth
                        ? `No departures in ${MONTH_NAMES[parseInt(filterMonth.split('-')[1]) - 1]} ${filterMonth.split('-')[0]}`
                        : 'No upcoming departures are scheduled yet — contact us to plan a custom date.'}
                    </p>
                    {filterMonth && (
                      <button onClick={() => setFilterMonth(null)} className="mt-2 text-xs text-[var(--color-navy-600)] hover:underline">
                        Clear filter
                      </button>
                    )}
                  </div>
                )}
                {visibleDepartures.map((d: Departure) => {
                  const price = d.pricePerPerson ?? trip.price;
                  const hasDiscount = typeof d.pricePerPerson === 'number' && d.pricePerPerson < trip.price;
                  const rowId = d._id || d.startDate;
                  const isExpanded = selectedDate === rowId;
                  const urgency = typeof d.seatsAvailable === 'number' && d.seatsAvailable <= 3;

                  return (
                    <div key={rowId} className="bg-white">
                      <button
                        onClick={() => setSelectedDate(isExpanded ? null : rowId)}
                        className={`w-full flex items-center gap-3 sm:gap-5 px-4 py-4 text-left hover:bg-gray-50 transition-colors ${isExpanded ? 'bg-gray-50' : ''}`}
                      >
                        <div className="flex-1 min-w-0 flex flex-col sm:flex-row sm:items-center gap-0.5 sm:gap-4">
                          <span className="text-sm font-semibold text-[var(--color-navy-600)] whitespace-nowrap">{formatDate(d.startDate)}</span>
                          {d.endDate && (
                            <>
                              <span className="hidden sm:block text-gray-300">→</span>
                              <span className="text-sm font-semibold text-[var(--color-navy-600)] whitespace-nowrap">{formatDate(d.endDate)}</span>
                            </>
                          )}
                        </div>

                        {d.badges && d.badges.length > 0 && (
                          <span className="hidden sm:inline-flex text-xs bg-[var(--color-forest-600)] text-white px-2 py-0.5 rounded font-bold tracking-wide flex-shrink-0">
                            {d.badges[0]}
                          </span>
                        )}

                        {typeof d.seatsAvailable === 'number' && (
                          <div className="flex items-center gap-1.5 flex-shrink-0">
                            <span className={`w-2 h-2 rounded-full flex-shrink-0 ${urgency ? 'bg-red-500' : 'bg-gray-300'}`} />
                            <span className={`text-xs whitespace-nowrap ${urgency ? 'text-red-500 font-semibold' : 'text-gray-500'}`}>
                              {urgency ? `${d.seatsAvailable} spots left` : `${d.seatsAvailable} spots`}
                            </span>
                          </div>
                        )}

                        <div className="text-right flex-shrink-0 min-w-[80px]">
                          <div className="flex items-baseline gap-1 justify-end">
                            {hasDiscount && <span className="text-xs text-gray-500 line-through">${trip.price}</span>}
                            <span className="text-base font-bold text-[#121212]">${price}</span>
                          </div>
                        </div>

                        <ChevronDown size={16} className={`text-gray-500 flex-shrink-0 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} />
                      </button>

                      {isExpanded && (
                        <div className="border-t border-gray-100 bg-gray-50/60 px-4 py-5">
                          <div className="flex flex-col sm:flex-row gap-6">
                            <div className="flex-shrink-0 sm:w-44">
                              <div className="flex items-start gap-3">
                                <div className="flex flex-col items-center gap-0 pt-0.5">
                                  <div className="w-4 h-4 rounded-full border-2 border-[var(--color-navy-600)] bg-white flex-shrink-0" />
                                  <div className="w-px flex-1 bg-gray-300 my-1" style={{ minHeight: '40px' }} />
                                  <div className="w-4 h-4 rounded-full border-2 border-[var(--color-navy-600)] bg-[var(--color-navy-600)] flex-shrink-0" />
                                </div>
                                <div className="flex flex-col gap-4 pt-0">
                                  <div>
                                    <p className="text-xs font-bold uppercase tracking-widest text-gray-500">Start</p>
                                    <p className="text-sm font-semibold text-[#121212]">{trip.region}</p>
                                    <p className="text-xs text-gray-500">{trip.country}</p>
                                    <p className="text-xs text-[var(--color-navy-600)] font-medium mt-0.5">{formatDate(d.startDate)}</p>
                                  </div>
                                  <div>
                                    <p className="text-xs font-bold uppercase tracking-widest text-gray-500">End</p>
                                    <p className="text-sm font-semibold text-[#121212]">{trip.region}</p>
                                    <p className="text-xs text-gray-500">{trip.country}</p>
                                    <p className="text-xs text-[var(--color-navy-600)] font-medium mt-0.5">{formatDate(d.endDate) || '—'}</p>
                                  </div>
                                </div>
                              </div>
                              <div className="mt-3 inline-flex items-center gap-1.5 bg-white border border-gray-200 rounded-lg px-3 py-1.5">
                                <Clock size={12} className="text-gray-500" />
                                <span className="text-xs font-semibold text-[#121212]">{trip.duration} {Number(trip.duration) === 1 ? 'day' : 'days'}</span>
                              </div>
                            </div>

                            <div className="flex-1 min-w-0">
                              {d.badges && d.badges.length > 0 && (
                                <div className="flex flex-wrap gap-1.5 mb-3">
                                  {d.badges.map((b, bi) => (
                                    <span key={bi} className="text-xs bg-white border border-gray-200 text-gray-600 px-2 py-0.5 rounded-full font-medium">
                                      {b}
                                    </span>
                                  ))}
                                </div>
                              )}
                              {d.notes && (
                                <p className="text-sm text-gray-600 mb-4">{d.notes}</p>
                              )}
                              {typeof d.seatsAvailable === 'number' && typeof d.totalSeats === 'number' && (
                                <p className="text-xs text-gray-500 mb-4">{d.seatsAvailable} of {d.totalSeats} seats available</p>
                              )}

                              {comfortAddOns.length > 0 && (
                                <div className="mb-4">
                                  <p className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">Comfort add-ons</p>
                                  <div className="space-y-2">
                                    {comfortAddOns.map((addOn, addOnIdx) => (
                                      <div key={addOnIdx} className="bg-white border border-gray-200 rounded-xl p-3.5">
                                        <div className="flex items-center justify-between gap-3">
                                          <div className="flex-1">
                                            <p className="text-sm font-semibold text-[#121212]">{addOn.title}</p>
                                            {addOn.description && <p className="text-xs text-gray-500 mt-0.5">{addOn.description}</p>}
                                          </div>
                                          <div className="text-right flex-shrink-0">
                                            <p className="text-sm font-bold text-[#121212]">{comfortAddOnSummary(addOn) || '—'}</p>
                                          </div>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                  <p className="text-xs text-gray-500 mt-2">Select these on the next step when you book.</p>
                                </div>
                              )}

                              <button
                                onClick={() => goToBooking(d)}
                                className="w-full bg-[#121212] hover:bg-black text-white text-sm font-bold py-3 rounded-xl transition-colors"
                              >
                                Request booking
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {!showAllDates && filteredDepartures.length > DATES_PREVIEW_COUNT && (
                <button
                  onClick={() => setShowAllDates(true)}
                  className="mt-3 w-full border border-gray-200 rounded-xl py-2.5 text-sm font-medium text-gray-600 hover:border-gray-300 hover:text-[#121212] hover:bg-gray-50 transition-colors"
                >
                  Show all dates ({filteredDepartures.length})
                </button>
              )}
            </div>

            {/* ── Before you book ── */}
            <BeforeYouBook
              sections={trip.beforeYouBook?.sections?.length ? trip.beforeYouBook.sections : DEFAULT_BEFORE_YOU_BOOK_SECTIONS}
              ctaHeading={trip.beforeYouBook?.ctaHeading ?? 'Essential trip information'}
              ctaSubtitle={trip.beforeYouBook?.ctaSubtitle ?? 'Health, safety, visa requirements and everything else you need to know before you go.'}
              ctaLinkLabel={trip.beforeYouBook?.ctaLinkLabel ?? 'Read essentials'}
              ctaLinkUrl={trip.beforeYouBook?.ctaLinkUrl || `/trip/${tripId}/notes`}
            />

            {/* ── Related Trips ── */}
            {relatedTrips.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-4 pb-2 border-b border-gray-200">
                  <h2 className="text-lg font-bold" style={{ fontFamily: 'Outfit, sans-serif' }}>Similar adventures</h2>
                  <Link to="/all-trips" className="text-xs text-[var(--color-forest-600)] hover:underline flex items-center gap-1">
                    View all <ArrowRight size={12} />
                  </Link>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                  {relatedTrips.map((t: any) => (
                    <TripCard key={t.id || t._id} trip={t} variant="compact" />
                  ))}
                </div>
              </div>
            )}

          </div>

          {/* ── RIGHT SIDEBAR ── */}
          <aside
            className="hidden lg:block flex-shrink-0 sticky top-[105px] overflow-hidden"
            style={{
              width: floatingBarActive ? '0px' : '320px',
              opacity: floatingBarActive ? 0 : 1,
              pointerEvents: floatingBarActive ? 'none' : 'auto',
              transition: 'width 600ms cubic-bezier(0.4,0,0.2,1), opacity 400ms ease',
            }}
          >
            <div className="rounded-3xl overflow-hidden shadow-xl bg-white border border-[var(--color-navy-100)]">
              <div className="p-6 bg-[var(--color-navy-900)] text-white">
                <p className="text-xs uppercase tracking-widest text-[var(--color-forest-300)] font-medium mb-0.5">From</p>
                <div className="flex items-end gap-2">
                  <span className="text-4xl font-bold text-white">${trip.price}</span>
                  <span className="text-sm text-white/60 mb-1">/ person</span>
                </div>
                {avgRating && (
                  <div className="flex items-center gap-1 mt-1.5">
                    <div className="flex gap-0.5">
                      {[1, 2, 3, 4, 5].map(s => <Star key={s} size={11} className="fill-[var(--color-sun-500)] text-[var(--color-sun-500)]" />)}
                    </div>
                    <span className="text-xs text-white/70">{avgRating} · {testimonials.length} reviews</span>
                  </div>
                )}
              </div>

              {nextDeparture && (
                <div className="px-5 py-3 bg-amber-50/60 border-b border-amber-100">
                  <p className="text-xs uppercase tracking-widest text-amber-600 font-semibold mb-0.5">Next departure</p>
                  <p className="text-sm font-semibold text-[#121212]">{formatDate(nextDeparture.startDate)}</p>
                  {typeof nextDeparture.seatsAvailable === 'number' && (
                    <p className={`text-xs font-medium ${nextDeparture.seatsAvailable <= 3 ? 'text-red-500' : 'text-gray-500'}`}>
                      {nextDeparture.seatsAvailable <= 3 ? `Only ${nextDeparture.seatsAvailable} spots remaining` : `${nextDeparture.seatsAvailable} spots available`}
                    </p>
                  )}
                </div>
              )}

              <div className="px-5 py-3 border-b border-gray-100 space-y-2">
                {[
                  { label: 'Duration', value: `${trip.duration} ${Number(trip.duration) === 1 ? 'day' : 'days'}` },
                  { label: 'Group size', value: trip.maxGroupSize ? `Max ${trip.maxGroupSize}` : '6–12 people' },
                  { label: 'Difficulty', value: trip.difficulty.charAt(0).toUpperCase() + trip.difficulty.slice(1) },
                ].map((s, i) => (
                  <div key={i} className="flex justify-between text-sm">
                    <span className="text-gray-500">{s.label}</span>
                    <span className="font-semibold text-[#121212]">{s.value}</span>
                  </div>
                ))}
              </div>

              <div className="p-5 space-y-2">
                <Button
                  className="w-full bg-[var(--color-forest-500)] hover:bg-[var(--color-forest-600)] text-white h-12 font-semibold text-sm"
                  onClick={scrollToDatesAndExpand}
                >
                  Book This Trip
                </Button>
                {brochureDownloadUrl && (
                  <a href={brochureDownloadUrl} target="_blank" rel="noopener noreferrer" download>
                    <Button variant="outline" className="w-full h-10 text-sm border-gray-300 hover:border-gray-400">
                      <Download size={14} className="mr-2" />
                      Download Brochure
                    </Button>
                  </a>
                )}
                <p className="text-center text-xs text-gray-500">No booking fees</p>
              </div>
            </div>

            <div className="mt-4 rounded-3xl p-5 bg-[var(--color-forest-50)] border border-[var(--color-forest-100)]">
              <p className="text-xs uppercase tracking-widest text-gray-500 font-medium mb-3">Why book with us</p>
              <ul className="space-y-2">
                {[
                  { icon: <Shield size={13} className="text-[var(--color-forest-600)]" />, text: 'Certified local guides' },
                  { icon: <Users size={13} className="text-[var(--color-navy-600)]" />, text: 'Small groups, more attention' },
                  { icon: <Leaf size={13} className="text-[var(--color-forest-600)]" />, text: 'Clear pricing, no hidden fees' },
                ].map((b, i) => (
                  <li key={i} className="flex items-center gap-2 text-xs text-gray-700">
                    {b.icon}{b.text}
                  </li>
                ))}
              </ul>
            </div>
          </aside>

        </div>
      </div>

      {/* ── Traveller Reviews ── */}
      {reviewSectionTestimonials.length > 0 && (
        <div className="relative w-full overflow-hidden" style={{ minHeight: '560px' }}>
          {/* Background image */}
          <div
            className="absolute inset-0 bg-cover bg-center scale-105"
            style={{
              backgroundImage: `url(${REVIEWS_SECTION_BG})`,
              transition: 'transform 8s ease',
            }}
          />
          {/* Layered overlay: gradient from deep charcoal bottom → semi-transparent top */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/55 to-black/75" />

          {/* Content */}
          <div className="relative z-10 flex flex-col items-center justify-center min-h-[560px] px-6 py-20">
            {/* Eyebrow */}
            <p className="text-xs uppercase tracking-[0.25em] text-white/70 mb-10 font-medium">
              Traveller reviews
            </p>

            {/* Sliding review card */}
            <div className="w-full max-w-2xl mx-auto text-center">
              {/* Stars */}
              <div className="flex justify-center gap-1.5 mb-7">
                {Array.from({ length: reviewSectionTestimonials[reviewIdx % reviewSectionTestimonials.length].rating || 0 }).map((_, i) => (
                  <Star key={i} size={16} className="fill-[var(--color-sun-500)] text-[var(--color-sun-500)]" />
                ))}
              </div>

              {/* Quote — key forces re-mount animation on slide */}
              <div
                key={`review-${reviewIdx}`}
                style={{ animation: `reviewSlide${reviewDir === 'right' ? 'In' : 'InLeft'} 0.45s cubic-bezier(0.25,0.46,0.45,0.94) both` }}
              >
                <blockquote
                  className="text-xl sm:text-2xl text-white leading-relaxed mb-8 font-light"
                  style={{ fontFamily: "'Georgia', 'Times New Roman', serif" }}
                >
                  &ldquo;{reviewSectionTestimonials[reviewIdx % reviewSectionTestimonials.length].quote || reviewSectionTestimonials[reviewIdx % reviewSectionTestimonials.length].testimonial}&rdquo;
                </blockquote>

                {/* Divider */}
                <div className="w-10 h-px bg-white/30 mx-auto mb-6" />

                {/* Reviewer */}
                <div>
                  {reviewSectionTestimonials[reviewIdx % reviewSectionTestimonials.length].image && (
                    <img
                      src={resolveMediaUrl(reviewSectionTestimonials[reviewIdx % reviewSectionTestimonials.length].image)}
                      alt={reviewSectionTestimonials[reviewIdx % reviewSectionTestimonials.length].name}
                      className="w-12 h-12 rounded-full object-cover border-2 border-white/30 mx-auto mb-3"
                    />
                  )}
                  <p className="text-white font-semibold text-sm tracking-wide">
                    {reviewSectionTestimonials[reviewIdx % reviewSectionTestimonials.length].name}
                  </p>
                  <p className="text-white/70 text-xs mt-1 tracking-wider uppercase">
                    {[reviewSectionTestimonials[reviewIdx % reviewSectionTestimonials.length].location, formatReviewDate((reviewSectionTestimonials[reviewIdx % reviewSectionTestimonials.length] as any).createdAt)]
                      .filter(Boolean)
                      .join(' · ')}
                  </p>
                </div>
              </div>
            </div>

            {/* Navigation row */}
            {reviewSectionTestimonials.length > 1 && (
              <div className="flex items-center gap-5 mt-12">
                <button
                  onClick={() => {
                    setReviewDir('left');
                    setReviewIdx(i => (i - 1 + reviewSectionTestimonials.length) % reviewSectionTestimonials.length);
                  }}
                  className="w-10 h-10 rounded-full border border-white/30 flex items-center justify-center text-white hover:bg-white/10 transition-colors"
                >
                  <ChevronLeft size={18} />
                </button>

                {/* Dot indicators */}
                <div className="flex items-center gap-2">
                  {reviewSectionTestimonials.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => { setReviewDir(i > reviewIdx ? 'right' : 'left'); setReviewIdx(i); }}
                      className="transition-all duration-300"
                      style={{
                        width: i === reviewIdx ? '24px' : '6px',
                        height: '6px',
                        borderRadius: '3px',
                        background: i === reviewIdx ? 'white' : 'rgba(255,255,255,0.3)',
                      }}
                    />
                  ))}
                </div>

                <button
                  onClick={() => {
                    setReviewDir('right');
                    setReviewIdx(i => (i + 1) % reviewSectionTestimonials.length);
                  }}
                  className="w-10 h-10 rounded-full border border-white/30 flex items-center justify-center text-white hover:bg-white/10 transition-colors"
                >
                  <ChevronRight size={18} />
                </button>
              </div>
            )}

            {/* Aggregate + CTA */}
            <div className="mt-10 flex flex-col items-center gap-3">
              <div className="flex items-center gap-2 opacity-50">
                <div className="flex gap-0.5">
                  {[1, 2, 3, 4, 5].map(s => <Star key={s} size={11} className="fill-white text-white" />)}
                </div>
                <p className="text-white text-xs">{reviewSectionAvgRating} from {reviewSectionTestimonials.length} reviews</p>
              </div>
              <Link
                to="/reviews"
                className="flex items-center gap-2 bg-white text-[#121212] text-sm font-bold px-7 py-3 rounded-full hover:bg-white/90 transition-colors shadow-lg"
              >
                Read all reviews <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        </div>
      )}

      <TravelDatesModal
        open={dateModalOpen}
        onClose={() => setDateModalOpen(false)}
        onSelect={setFilterMonth}
        selectedMonth={filterMonth}
        departures={upcomingDepartures}
        basePrice={trip.price}
      />

      <TripFloatingBar
        price={floatingBarPrice}
        activeTab={activeTab}
        onTabChange={scrollToSection}
        isActive={floatingBarActive}
        filterMonth={filterMonth}
        onOpenDateModal={() => setDateModalOpen(true)}
        onBookNow={() => goToBooking(currentSelectedDeparture)}
      />

      {/* ── Full-screen gallery lightbox ── */}
      {galleryOpen && (
        <div className="fixed inset-0 z-50 bg-black flex items-center justify-center">
          <button
            onClick={() => setGalleryOpen(false)}
            className="absolute top-4 right-4 text-white/70 hover:text-white p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
          >
            <X size={22} />
          </button>
          {galleryImages.length > 1 && (
            <>
              <button
                onClick={() => setGalleryIndex((galleryIndex - 1 + galleryImages.length) % galleryImages.length)}
                className="absolute left-4 text-white/70 hover:text-white p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
              >
                <ChevronLeft size={28} />
              </button>
              <button
                onClick={() => setGalleryIndex((galleryIndex + 1) % galleryImages.length)}
                className="absolute right-4 text-white/70 hover:text-white p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
              >
                <ChevronRight size={28} />
              </button>
            </>
          )}
          <img
            src={galleryImages[galleryIndex]}
            alt={`Gallery ${galleryIndex + 1}`}
            className="max-w-full max-h-full object-contain"
          />
          <p className="absolute bottom-4 text-white/70 text-sm">{galleryIndex + 1} / {galleryImages.length}</p>
        </div>
      )}

    </div>
  );
}
