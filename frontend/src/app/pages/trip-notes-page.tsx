import { useParams, Link } from 'react-router-dom';
import { useState, useMemo } from 'react';
import {
  ChevronDown, ChevronUp, ArrowLeft, MapPin, Users, Clock,
  TrendingUp, Calendar, Phone, Shield, Wallet, Backpack,
  Wifi, CloudSun, Star, Leaf, Heart, AlertTriangle, Utensils,
  Bed, Bus, Info, FileText, Globe, Mountain,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { Button } from '../components/ui/button';
import { useTrip } from '../hooks/useTrips';
import { SeoHead } from '../components/SeoHead';
import {
  DEFAULT_TRIP_NOTES,
  type TripNotes,
  type TripNoteBlock,
  type TripNoteSection,
} from '../data/trip-notes-defaults';

// ── Icon lookup for section headers ─────────────────────────────────────────

const SECTION_ICONS: Record<string, LucideIcon> = {
  info: Info,
  heart: Heart,
  phone: Phone,
  'file-text': FileText,
  shield: Shield,
  utensils: Utensils,
  bed: Bed,
  bus: Bus,
  wallet: Wallet,
  backpack: Backpack,
  wifi: Wifi,
  'cloud-sun': CloudSun,
  users: Users,
  leaf: Leaf,
  star: Star,
  globe: Globe,
  mountain: Mountain,
};

// ── Sub-components ───────────────────────────────────────────────────────────

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="text-xs font-bold uppercase tracking-widest text-gray-500 mt-5 mb-1.5">
      {children}
    </h3>
  );
}

function Prose({ children }: { children: React.ReactNode }) {
  return <p className="text-sm text-gray-700 leading-relaxed">{children}</p>;
}

function BulletList({ items }: { items: string[] }) {
  return (
    <ul className="space-y-1.5 mt-1">
      {items.map((item, i) => (
        <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
          <span className="mt-2 w-1.5 h-1.5 rounded-full bg-[var(--color-forest-600)] flex-shrink-0" />
          {item}
        </li>
      ))}
    </ul>
  );
}

function NumberedList({ items }: { items: string[] }) {
  return (
    <ol className="space-y-2 mt-1">
      {items.map((item, i) => (
        <li key={i} className="flex items-start gap-3 text-sm text-gray-700">
          <span className="flex-shrink-0 w-5 h-5 rounded-full bg-gray-100 text-gray-500 text-xs font-bold flex items-center justify-center mt-0.5">
            {i + 1}
          </span>
          {item}
        </li>
      ))}
    </ol>
  );
}

function InfoBox({ type, children }: { type: 'tip' | 'warning' | 'note'; children: React.ReactNode }) {
  const styles = {
    tip:     'bg-[var(--color-forest-600)]/5 border-[var(--color-forest-600)]/20 text-[var(--color-forest-600)]',
    warning: 'bg-amber-50 border-amber-200 text-amber-700',
    note:    'bg-[var(--color-navy-600)]/5 border-[var(--color-navy-600)]/20 text-[var(--color-navy-600)]',
  };
  const icons = { tip: <Leaf size={13} />, warning: <AlertTriangle size={13} />, note: <Info size={13} /> };
  return (
    <div className={`flex items-start gap-2.5 p-3 rounded-lg border mt-3 ${styles[type]}`}>
      <span className="flex-shrink-0 mt-0.5">{icons[type]}</span>
      <p className="text-xs leading-relaxed">{children}</p>
    </div>
  );
}

function ContactCard({ title, lines, tone }: { title?: string; lines: string[]; tone?: 'default' | 'danger' }) {
  const danger = tone === 'danger';
  return (
    <div
      className={`mt-3 p-3 rounded-lg border space-y-1 ${
        danger ? 'bg-red-50 border-red-100' : 'bg-gray-50 border-gray-100'
      }`}
    >
      {title && (
        <p className={`text-sm font-semibold ${danger ? 'text-red-700' : 'text-[#121212]'}`}>{title}</p>
      )}
      {lines.map((line, i) => (
        <p key={i} className={`text-sm ${danger ? 'text-red-600' : 'text-gray-600'}`}>{line}</p>
      ))}
    </div>
  );
}

function PriceGrid({ rows }: { rows: Array<{ label?: string; value?: string }> }) {
  if (rows.length === 0) return null;
  return (
    <div className="mt-3 grid grid-cols-3 gap-2">
      {rows.map((row, i) => (
        <div key={i} className="text-center p-2.5 rounded-lg bg-gray-50 border border-gray-100">
          <p className="text-xs font-bold text-[#121212]">{row.value}</p>
          <p className="text-xs text-gray-500">{row.label}</p>
        </div>
      ))}
    </div>
  );
}

function NotesBlocks({ blocks }: { blocks: TripNoteBlock[] }) {
  return (
    <>
      {blocks.map((block, i) => {
        switch (block.type) {
          case 'subheading':
            return <SectionHeading key={i}>{block.text}</SectionHeading>;
          case 'bullets':
            return <BulletList key={i} items={block.items || []} />;
          case 'numbered':
            return <NumberedList key={i} items={block.items || []} />;
          case 'tip':
          case 'warning':
          case 'note':
            return <InfoBox key={i} type={block.type}>{block.text}</InfoBox>;
          case 'contact':
            return <ContactCard key={i} title={block.text} lines={block.items || []} tone={block.tone} />;
          case 'pricegrid':
            return <PriceGrid key={i} rows={block.rows || []} />;
          case 'paragraph':
          default:
            return block.text ? <Prose key={i}>{block.text}</Prose> : null;
        }
      })}
    </>
  );
}

// ── Accordion wrapper ────────────────────────────────────────────────────────

function AccordionSection({
  id, icon, title, children, defaultOpen = false,
}: {
  id: string; icon: React.ReactNode; title: string; children: React.ReactNode; defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div id={id} className="border-b border-gray-100 last:border-0">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-5 py-4 text-left group"
        aria-expanded={open}
      >
        <div className="flex items-center gap-3">
          <span className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 group-hover:bg-[var(--color-forest-600)]/10 group-hover:text-[var(--color-forest-600)] transition-colors flex-shrink-0">
            {icon}
          </span>
          <span className="text-sm font-semibold text-[#121212] group-hover:text-[var(--color-forest-600)] transition-colors">
            {title}
          </span>
        </div>
        {open
          ? <ChevronUp size={16} className="text-gray-500 flex-shrink-0" />
          : <ChevronDown size={16} className="text-gray-500 flex-shrink-0" />}
      </button>
      {open && (
        <div className="pb-5 pl-16 pr-5">
          {children}
        </div>
      )}
    </div>
  );
}

// ── Main page ────────────────────────────────────────────────────────────────

export function TripNotesPage() {
  const { id } = useParams<{ id: string }>();
  const { trip, loading, error } = useTrip(id || '');
  const [activeSection, setActiveSection] = useState('overview');

  const tripId = trip?.slug || id || trip?.id || trip?._id || '';

  const notes: TripNotes = useMemo(() => {
    const raw = (trip as any)?.tripNotes;
    if (raw && Array.isArray(raw.sections) && raw.sections.length > 0) {
      return { enabled: raw.enabled !== false, overview: raw.overview || {}, sections: raw.sections };
    }
    return DEFAULT_TRIP_NOTES;
  }, [trip]);

  const sections: TripNoteSection[] = useMemo(
    () => (notes.sections || []).filter((s) => s.enabled !== false),
    [notes],
  );

  const navItems = useMemo(
    () => [{ key: 'overview', title: 'Overview' }, ...sections.map((s) => ({ key: s.key, title: s.title }))],
    [sections],
  );

  const scrollTo = (sectionId: string) => {
    const el = document.getElementById(sectionId);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const itinerary = trip?.itinerary || [];
  const firstDay = itinerary[0];
  const lastDay = itinerary[itinerary.length - 1];
  const startPoint = firstDay?.location || firstDay?.accommodation || trip?.region || '—';
  const finishPoint = lastDay?.location || lastDay?.accommodation || trip?.region || '—';

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-4 animate-pulse">
          <div className="h-8 w-2/3 bg-gray-200 rounded" />
          <div className="h-4 w-1/3 bg-gray-200 rounded" />
          <div className="h-64 w-full bg-gray-100 rounded-xl mt-6" />
        </div>
      </div>
    );
  }

  if (!trip || error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center p-10">
          <Mountain size={40} className="mx-auto mb-4 text-[var(--color-navy-600)]" />
          <p className="text-gray-500 text-sm mb-4">Trip not found.</p>
          <Link to="/all-trips"><Button>Browse All Trips</Button></Link>
        </div>
      </div>
    );
  }

  const overview = notes.overview || {};
  const overviewItems = [
    { icon: <MapPin size={13} />, label: 'Start / Finish', value: `${startPoint} / ${finishPoint}` },
    { icon: <Clock size={13} />, label: 'Duration', value: `${trip.duration} ${Number(trip.duration) === 1 ? 'day' : 'days'}` },
    { icon: <Users size={13} />, label: 'Group size', value: trip.maxGroupSize ? `Max ${trip.maxGroupSize} people` : '6 – 12 people' },
    { icon: <TrendingUp size={13} />, label: 'Physical rating', value: trip.difficulty ? `${trip.difficulty.charAt(0).toUpperCase()}${trip.difficulty.slice(1)}` : 'Moderate' },
    { icon: <Star size={13} />, label: 'Trip style', value: overview.tripStyle || 'Regenerative trekking' },
    { icon: <Calendar size={13} />, label: 'Best season', value: overview.bestSeason || trip.season || 'Mar – May, Sep – Nov' },
    { icon: <Bed size={13} />, label: 'Accommodation', value: overview.accommodationSummary || 'Eco-lodges & homestays' },
    { icon: <Utensils size={13} />, label: 'Meals', value: overview.mealsSummary || 'Most meals included' },
    { icon: <Globe size={13} />, label: 'Trip code', value: overview.tripCode || `NDX-${String(tripId).toUpperCase().slice(0, 6) || 'TREK'}` },
  ];

  const notesDisabled = notes.enabled === false;

  return (
    <div className="min-h-screen bg-white text-[#121212]">
      <SeoHead
        title={`Trip notes — ${trip.title}`}
        description={`Essential trip information for ${trip.title}: health, safety, visas, packing and everything else you need to know before you go.`}
        type="article"
      />

      {/* ── Top bar ── */}
      <div className="border-b border-gray-200 bg-white sticky top-0 z-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between gap-4">
          <Link
            to={`/trip/${tripId}`}
            className="flex items-center gap-2 text-sm text-gray-500 hover:text-[var(--color-forest-600)] transition-colors font-medium"
          >
            <ArrowLeft size={15} />
            Back to {trip.title}
          </Link>
          <span className="text-xs text-gray-500 hidden sm:block">Essential trip information</span>
          <Link to={`/trip/${tripId}`} state={{ scrollToDates: true }}>
            <Button size="sm" className="bg-[var(--color-forest-600)] hover:bg-[var(--color-forest-700)] text-white text-xs h-8 px-4">
              Book this trip
            </Button>
          </Link>
        </div>
      </div>

      {/* ── Page title ── */}
      <div className="border-b border-gray-100 bg-gray-50/60">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <p className="text-xs uppercase tracking-widest text-[var(--color-forest-600)] font-semibold mb-1">Trip notes</p>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#121212]" style={{ fontFamily: 'Outfit, sans-serif' }}>
            {trip.title}
          </h1>
          <div className="flex flex-wrap items-center gap-4 mt-3 text-xs text-gray-500">
            <span className="flex items-center gap-1"><MapPin size={11} />{trip.region}</span>
            <span className="flex items-center gap-1"><Clock size={11} />{trip.duration} {Number(trip.duration) === 1 ? 'day' : 'days'}</span>
            <span className="flex items-center gap-1"><Users size={11} />{trip.maxGroupSize ? `Max ${trip.maxGroupSize}` : '6–12 people'}</span>
            <span className="flex items-center gap-1"><TrendingUp size={11} />{trip.difficulty ? `${trip.difficulty.charAt(0).toUpperCase()}${trip.difficulty.slice(1)}` : 'Moderate'}</span>
            <span className="flex items-center gap-1"><Calendar size={11} />{trip.season || 'Year-round'}</span>
          </div>
        </div>
      </div>

      {/* ── Body: jump nav + content ── */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex gap-10 items-start">

        {/* Jump nav — desktop only */}
        <nav className="hidden lg:block w-52 flex-shrink-0 sticky top-[65px]">
          <p className="text-xs uppercase tracking-widest font-bold text-gray-500 mb-3">What's on this page</p>
          <ul className="space-y-0.5">
            {navItems.map(s => (
              <li key={s.key}>
                <button
                  onClick={() => { scrollTo(s.key); setActiveSection(s.key); }}
                  className={`w-full text-left text-xs px-3 py-1.5 rounded-md transition-colors ${
                    activeSection === s.key
                      ? 'bg-[var(--color-forest-600)]/8 text-[var(--color-forest-600)] font-semibold'
                      : 'text-gray-500 hover:text-[#121212] hover:bg-gray-100'
                  }`}
                >
                  {s.title}
                </button>
              </li>
            ))}
          </ul>
        </nav>

        {/* Main content */}
        <div className="flex-1 min-w-0">

          {/* ── Overview ── */}
          <div id="overview" className="mb-8">
            <h2 className="text-base font-bold mb-4 pb-2 border-b border-gray-200" style={{ fontFamily: 'Outfit, sans-serif' }}>
              Overview
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {overviewItems.map((item, i) => (
                <div key={i} className="flex items-start gap-2.5 p-3 rounded-lg bg-gray-50 border border-gray-100">
                  <span className="flex-shrink-0 mt-0.5 text-[var(--color-navy-600)]">{item.icon}</span>
                  <div>
                    <p className="text-xs uppercase tracking-widest text-gray-500 font-medium">{item.label}</p>
                    <p className="text-xs font-semibold text-[#121212] mt-0.5">{item.value}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {notesDisabled ? (
            <div className="p-6 rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-500">
              Detailed trip notes for this trip are being finalised. Please contact us for the latest
              information before you book.
            </div>
          ) : (
            <div className="border border-gray-200 rounded-xl overflow-hidden divide-y divide-gray-100">
              {sections.map((section, i) => {
                const IconComp = SECTION_ICONS[section.icon] || Info;
                return (
                  <AccordionSection
                    key={section.key || i}
                    id={section.key || `section-${i}`}
                    icon={<IconComp size={15} />}
                    title={section.title}
                    defaultOpen={i === 0}
                  >
                    <NotesBlocks blocks={section.blocks || []} />
                  </AccordionSection>
                );
              })}
            </div>
          )}

          {/* ── Was this helpful ── */}
          <div className="mt-8 p-5 rounded-xl bg-gray-50 border border-gray-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-[#121212]">Was this page helpful?</p>
              <p className="text-xs text-gray-500 mt-0.5">Your feedback helps us improve our trip information.</p>
            </div>
            <div className="flex gap-2">
              <button className="px-4 py-1.5 text-sm border border-gray-300 rounded-lg hover:border-[var(--color-forest-600)] hover:text-[var(--color-forest-600)] transition-colors font-medium">
                Yes
              </button>
              <button className="px-4 py-1.5 text-sm border border-gray-300 rounded-lg hover:border-red-400 hover:text-red-500 transition-colors font-medium">
                No
              </button>
            </div>
          </div>

          {/* ── Bottom CTA ── */}
          <div className="mt-6 flex flex-col sm:flex-row gap-3">
            <Link to={`/trip/${tripId}`} state={{ scrollToDates: true }} className="flex-1">
              <Button className="w-full bg-[var(--color-forest-600)] hover:bg-[var(--color-forest-700)] text-white h-11 font-semibold">
                Book this trip
              </Button>
            </Link>
            <Link to={`/trip/${tripId}`} className="flex-1">
              <Button variant="outline" className="w-full h-11 border-gray-300">
                Back to trip overview
              </Button>
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
}
