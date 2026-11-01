import { Link } from 'react-router-dom';
import { useState } from 'react';
import { Calendar, MapPin, Users, Leaf, Heart, ArrowRight, Mountain } from 'lucide-react';
import { Badge, SustainabilityBadge } from './ui/badge';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { resolveMediaUrl, mediaSrcSet } from '../services/api';

const CARD_WIDTHS = [360, 480, 640, 800, 1100];
const CARD_SIZES = '(max-width: 640px) 92vw, (max-width: 1024px) 46vw, 30vw';

interface Trip {
  id?: string;
  _id?: string;
  title: string;
  slug?: string; // used to build the public /trip/:slug URL, falls back to id
  image?: string;
  featuredImage?: string;
  description: string;
  heroSubtitle?: string;
  region: string;
  duration: string | number;
  difficulty: 'easy' | 'moderate' | 'challenging' | 'expert';
  maxGroupSize: number;
  sustainabilityBadges?: string[];
  price: number;
  country?: string;
  categoryLabel?: string;
  subcategoryLabel?: string;
  departures?: Array<{ startDate: string; seatsAvailable?: number; status?: string }>;
}

interface TripCardProps {
  trip: Trip;
  variant?: 'default' | 'compact';
  layout?: 'grid' | 'list';
}

const difficultyColors = {
  easy: 'bg-green-100 text-green-900',
  moderate: 'bg-sky-100 text-sky-900',
  challenging: 'bg-orange-100 text-orange-900',
  expert: 'bg-red-100 text-red-900',
};

const formatDeparture = (iso?: string) =>
  iso ? new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : null;

function nextDeparture(trip: Trip) {
  const now = Date.now();
  return (trip.departures || [])
    .filter((d) => d.startDate && new Date(d.startDate).getTime() >= now && d.status !== 'cancelled')
    .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())[0];
}

const coreSustainabilityBadges = new Set(['zerowaste', 'lowcarbon', 'localhire', 'inclusivegrowth']);
const normalizeBadgeLabel = (label: string) => label.toLowerCase().replace(/[^a-z]/g, '');

function SustainabilityBadgeList({ trip }: { trip: Trip }) {
  if (!trip.sustainabilityBadges || trip.sustainabilityBadges.length === 0) return null;
  return (
    <div className="flex flex-wrap gap-1">
      {trip.sustainabilityBadges.slice(0, 3).map((badge) => (
        coreSustainabilityBadges.has(normalizeBadgeLabel(badge)) ? (
          <SustainabilityBadge key={badge} label={badge} size="sm" className="w-fit" />
        ) : (
          <SustainabilityBadge
            key={badge}
            label={badge}
            size="sm"
            icon={<Leaf size={10} />}
            className="bg-green-50 text-green-700 border-green-200 text-xs"
          />
        )
      ))}
    </div>
  );
}

export function TripCard({ trip, variant = 'default', layout = 'grid' }: TripCardProps) {
  const href = `/trip/${trip.slug || trip.id || trip._id}`;
  const [saved, setSaved] = useState(false);

  if (variant === 'compact') {
    return (
      <Link to={href} className="block h-[500px]">
        <Card
          variant="trip"
          elevation={2}
          className="h-full flex flex-col overflow-hidden rounded-3xl border-0 shadow-md hover:shadow-2xl hover:-translate-y-1 transition-all duration-300"
        >
          <div className="relative h-60 overflow-hidden shrink-0">
            <img
              src={resolveMediaUrl(trip.image || trip.featuredImage, { width: 700, ar: '16:11', crop: 'c_fill' })}
              srcSet={mediaSrcSet(trip.image || trip.featuredImage, CARD_WIDTHS, { ar: '16:11', crop: 'c_fill' })}
              sizes={CARD_SIZES}
              alt={trip.title}
              className="w-full h-full object-cover"
              loading="lazy"
              decoding="async"
            />
            {/* Subtle overall tint so centered white text stays legible anywhere on the image */}
            <div className="absolute inset-0 bg-black/20" aria-hidden />
            <div className="absolute top-4 left-4 z-10">
              <Badge className={`${difficultyColors[trip.difficulty]} shadow-lg`}>
                {trip.difficulty}
              </Badge>
            </div>
            <div className="absolute inset-0 flex items-center justify-center p-4 text-center">
              <h3 className="text-xl font-medium leading-snug text-white glass-text-contrast-heavy">
                {trip.title}
              </h3>
            </div>
          </div>

          <CardContent className="relative bg-white/95 backdrop-blur-sm p-4 flex-1 flex flex-col min-h-0">
            {trip.heroSubtitle && (
              <p className="text-sm leading-5 text-gray-600 line-clamp-2 min-h-[2.5rem] mb-3">{trip.heroSubtitle}</p>
            )}

            <div className="text-sm text-gray-600 space-y-1.5 mb-3">
              <div className="flex items-center gap-2">
                <MapPin size={16} className="text-[var(--color-forest-500)]" />
                <span>{trip.region}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar size={16} className="text-[var(--color-forest-500)]" />
                <span>
                  {trip.duration} {Number(trip.duration) === 1 ? 'day' : 'days'}
                </span>
              </div>
            </div>

            {trip.sustainabilityBadges && trip.sustainabilityBadges.length > 0 && (
              <div className="mb-3 pb-3 border-b border-gray-100">
                <SustainabilityBadgeList trip={trip} />
              </div>
            )}

            <div className="mt-auto pt-2 flex items-baseline justify-end gap-1.5">
              <span className="text-xs text-gray-500">From</span>
              <span className="text-base font-medium">US ${trip.price}</span>
            </div>
          </CardContent>
        </Card>
      </Link>
    );
  }

  const departure = nextDeparture(trip);
  const departureLabel = formatDeparture(departure?.startDate);
  const lowSeats = typeof departure?.seatsAvailable === 'number' && departure.seatsAvailable > 0 && departure.seatsAvailable <= 4;
  const days = Number(trip.duration);
  const place = [trip.region, trip.country].filter(Boolean).join(', ');
  const isList = layout === 'list';

  return (
    <article
      className={`group relative bg-white rounded-3xl overflow-hidden border border-[var(--color-navy-100)] shadow-sm hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 ${
        isList ? 'flex flex-col sm:flex-row' : 'flex flex-col'
      }`}
    >
      <Link
        to={href}
        className={`relative block overflow-hidden bg-[var(--color-navy-100)] ${isList ? 'sm:w-72 lg:w-80 flex-shrink-0 aspect-[16/10] sm:aspect-auto' : 'aspect-[4/3]'}`}
        aria-label={trip.title}
      >
        <img
          src={resolveMediaUrl(trip.image || trip.featuredImage, { width: 800, ar: '4:3', crop: 'c_fill' })}
          srcSet={mediaSrcSet(trip.image || trip.featuredImage, CARD_WIDTHS, { ar: '4:3', crop: 'c_fill' })}
          sizes={CARD_SIZES}
          alt=""
          className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
          loading="lazy"
          decoding="async"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent" />
        <Badge className={`absolute top-4 left-4 capitalize ${difficultyColors[trip.difficulty]} shadow`}>{trip.difficulty}</Badge>
        {trip.categoryLabel && (
          <span className="absolute bottom-4 left-4 text-xs font-medium text-white/95 bg-black/45 backdrop-blur-sm rounded-full px-3 py-1">
            {trip.subcategoryLabel || trip.categoryLabel}
          </span>
        )}
      </Link>

      <button
        type="button"
        onClick={() => setSaved((v) => !v)}
        aria-pressed={saved}
        aria-label={saved ? 'Remove from saved trips' : 'Save trip'}
        className="absolute top-3.5 right-3.5 z-10 w-9 h-9 rounded-full bg-white/95 shadow flex items-center justify-center hover:scale-105 transition-transform cursor-pointer"
      >
        <Heart size={17} className={saved ? 'fill-red-500 text-red-500' : 'text-[var(--color-navy-700)]'} />
      </button>

      <div className="flex flex-col flex-1 p-5 md:p-6">
        <p className="flex items-center gap-1.5 text-sm text-[var(--color-forest-700)] font-medium mb-1.5">
          <MapPin size={14} aria-hidden />
          <span className="truncate">{place}</span>
        </p>
        <Link to={href}>
          <h3 className="text-xl font-semibold leading-snug text-[var(--color-navy-900)] line-clamp-2 group-hover:text-[var(--color-forest-700)] transition-colors">
            {trip.title}
          </h3>
        </Link>
        <p className="text-gray-700 text-sm leading-relaxed mt-2 line-clamp-2">{trip.heroSubtitle || trip.description}</p>

        <ul className="flex flex-wrap gap-2 mt-4 text-sm text-[var(--color-navy-800)]">
          <li className="inline-flex items-center gap-1.5 rounded-full bg-[var(--color-navy-50)] px-3 py-1">
            <Calendar size={14} aria-hidden />
            {trip.duration} {days === 1 ? 'day' : 'days'}
          </li>
          <li className="inline-flex items-center gap-1.5 rounded-full bg-[var(--color-navy-50)] px-3 py-1">
            <Users size={14} aria-hidden />
            Max {trip.maxGroupSize}
          </li>
          {trip.sustainabilityBadges?.[0] && (
            <li className="inline-flex items-center gap-1.5 rounded-full bg-[var(--color-forest-50)] text-[var(--color-forest-800)] px-3 py-1">
              <Leaf size={14} aria-hidden />
              {trip.sustainabilityBadges[0]}
            </li>
          )}
        </ul>

        <div className="mt-auto pt-5 flex items-end justify-between gap-3">
          <div>
            {departureLabel ? (
              <p className={`text-xs font-medium mb-1 ${lowSeats ? 'text-red-700' : 'text-gray-600'}`}>
                {lowSeats ? `Only ${departure?.seatsAvailable} ${departure?.seatsAvailable === 1 ? "spot" : "spots"} left · ` : 'Next departure · '}
                {departureLabel}
              </p>
            ) : (
              <p className="text-xs text-gray-600 mb-1">Flexible dates</p>
            )}
            <p className="text-sm text-gray-600 leading-none">
              From <span className="text-2xl font-semibold text-[var(--color-navy-900)] align-middle">US ${trip.price}</span>
            </p>
          </div>
          <Link
            to={href}
            className="inline-flex items-center gap-1.5 rounded-full bg-[var(--color-forest-600)] hover:bg-[var(--color-forest-700)] text-white text-sm font-medium px-5 h-11 transition-colors flex-shrink-0"
          >
            View trip <ArrowRight size={15} aria-hidden />
          </Link>
        </div>
      </div>
    </article>
  );
}
