import { useLocation, useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/button';
import { Card, CardContent } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { ArrowLeft, MapPin, Calendar, Users, DollarSign } from 'lucide-react';
import { TripDraft } from './TripStepper';
import { resolveMediaUrl } from '../../services/api';
import { getItineraryLabel } from '../../utils/itinerary';

export function TripPreviewPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const backTarget = location.state?.from;
  
  // Load draft from localStorage
  const draftStr =
    localStorage.getItem('trip-draft-preview') || localStorage.getItem('trip-draft');
  const draft: TripDraft | null = draftStr ? JSON.parse(draftStr) : null;

  if (!draft) {
    return (
      <div className="bg-[var(--cms-background)] flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <p className="text-[var(--cms-muted-foreground)] mb-4">No trip data found</p>
          <Button
            onClick={() => navigate('/cms/trips/new')}
            style={{ backgroundColor: 'var(--cms-primary)', color: 'var(--cms-primary-foreground)' }}
          >
            Create New Trip
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[var(--cms-background)]">
      {/* Header */}
      <div className="border-b border-[var(--cms-border)] bg-white">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              onClick={() => {
                if (backTarget) {
                  navigate(backTarget);
                } else {
                  navigate(-1);
                }
              }}
              className="border-[var(--cms-border)]"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Edit
            </Button>
            {draft.status === 'draft' && (
              <Badge variant="outline" className="border-[var(--cms-border)]">
                Draft
              </Badge>
            )}
          </div>
        </div>
      </div>

      {/* Preview Content */}
      <div className="max-w-4xl mx-auto px-6 py-8">
        <Card className="border-[var(--cms-border)] bg-white">
          {/* Hero Image */}
          {draft.mainImage && (
            <div className="w-full h-96 overflow-hidden rounded-t-lg">
              <img
                src={draft.mainImage}
                alt={draft.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          <CardContent className="p-8">
            {/* Title and Meta */}
            <div className="mb-6">
              <h1 className="text-3xl font-semibold mb-4" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Inter, sans-serif' }}>
                {draft.title || 'Untitled Trip'}
              </h1>
              
              <div className="flex flex-wrap items-center gap-4 text-sm text-[var(--cms-muted-foreground)]">
                {draft.region && draft.country && (
                  <div className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    <span>{draft.region}, {draft.country}</span>
                  </div>
                )}
                {draft.duration && (
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    <span>{draft.duration} days</span>
                  </div>
                )}
                {draft.price && (
                  <div className="flex items-center gap-1">
                    <DollarSign className="h-4 w-4" />
                    <span>US ${draft.price}</span>
                  </div>
                )}
                {draft.difficulty && (
                  <Badge variant="outline" className="border-[var(--cms-border)] capitalize">
                    {draft.difficulty}
                  </Badge>
                )}
              </div>
            </div>

            {/* Description */}
            {draft.description && (
              <div className="mb-6">
                <p className="text-[var(--cms-foreground)] leading-relaxed whitespace-pre-wrap">
                  {draft.description}
                </p>
              </div>
            )}

            {/* Highlights */}
            {draft.highlights.length > 0 && (
              <div className="mb-6">
                <h2 className="text-lg font-semibold mb-3">Highlights</h2>
                <ul className="space-y-2">
                  {draft.highlights.map((highlight, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-[var(--cms-primary)] mt-1">•</span>
                      <span className="text-[var(--cms-foreground)]">{highlight}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Trip Tags */}
            {draft.sustainabilityBadges.length > 0 && (
              <div className="mb-6">
                <h2 className="text-lg font-semibold mb-3">Trip tags</h2>
                <div className="flex flex-wrap gap-2">
                  {draft.sustainabilityBadges.map((badge, i) => (
                    <Badge
                      key={i}
                      variant="outline"
                      className="border-[var(--cms-primary)] text-[var(--cms-primary)]"
                    >
                      {badge}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Gallery */}
            {draft.gallery.length > 0 && (
              <div className="mb-6">
                <h2 className="text-lg font-semibold mb-3">Gallery</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {draft.gallery.map((image, index) => (
                    <div key={`${image}-${index}`} className="aspect-[4/3] overflow-hidden rounded-lg border border-[var(--cms-border)]">
                      <img
                        src={image}
                        alt={`${draft.title} gallery ${index + 1}`}
                        className="h-full w-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Itinerary */}
            {draft.itinerary.length > 0 && (
              <div className="mb-6">
                <h2 className="text-lg font-semibold mb-2">
                  {draft.itineraryTitle || 'Daily Itinerary'}
                </h2>
                <p className="text-sm text-[var(--cms-muted-foreground)] mb-4">
                  {draft.itineraryDescription || 'Each day brings new landscapes, cultures, and connections'}
                </p>
                <div className="space-y-4">
                  {draft.itinerary.map((day, i) => {
                    const dayLabel = getItineraryLabel(day.day, i);
                    return (
                      <div key={i} className="border border-[var(--cms-border)] rounded-lg p-4">
                        <div className="flex items-start gap-4">
                          <div className="flex-shrink-0 w-12 h-12 rounded-full bg-[var(--cms-muted)] flex items-center justify-center font-semibold">
                            {dayLabel}
                          </div>
                          <div className="flex-1">
                            {day.title && (
                              <h3 className="font-semibold mb-2">
                                {day.title}
                                {day.location && (
                                  <span className="ml-2 text-xs font-normal text-[var(--cms-muted-foreground)]">· {day.location}</span>
                                )}
                              </h3>
                            )}
                            {day.image && (
                              <div className="mb-3 overflow-hidden rounded-lg border border-[var(--cms-border)]">
                                <img
                                  src={resolveMediaUrl(day.image)}
                                  alt={day.title || dayLabel}
                                  className="h-44 w-full object-cover"
                                />
                              </div>
                            )}
                            {day.description && (
                              <p className="text-sm text-[var(--cms-foreground)] mb-2">
                                {day.description}
                              </p>
                            )}
                            <div className="flex flex-wrap gap-4 text-xs text-[var(--cms-muted-foreground)]">
                              {day.accommodation && (
                                <span>Accommodation: {day.accommodation}</span>
                              )}
                              {day.meals && <span>Meals: {day.meals}</span>}
                              {day.distance && <span>Distance: {day.distance}</span>}
                              {day.elevation && <span>Elevation: {day.elevation}</span>}
                            </div>
                            {day.highlights && day.highlights.length > 0 && (
                              <div className="mt-2">
                                <p className="text-xs uppercase tracking-widest text-[var(--cms-muted-foreground)] font-medium mb-1">Included activities</p>
                                <ul className="text-xs text-[var(--cms-foreground)] space-y-0.5">
                                  {day.highlights.filter(Boolean).map((h, hi) => <li key={hi}>• {h}</li>)}
                                </ul>
                              </div>
                            )}
                            {day.optional && day.optional.length > 0 && (
                              <div className="mt-2">
                                <p className="text-xs uppercase tracking-widest text-[var(--cms-muted-foreground)] font-medium mb-1">Optional extras</p>
                                <ul className="text-xs text-[var(--cms-foreground)] space-y-0.5">
                                  {day.optional.filter(o => o.name).map((o, oi) => (
                                    <li key={oi}>• {o.name}{o.price ? ` (${o.price})` : ''}</li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="mb-6">
              <h2 className="text-lg font-semibold mb-2">
                {draft.guidesSectionTitle || 'Expert Guides & Safety'}
              </h2>
              <p className="text-sm text-[var(--cms-muted-foreground)] mb-3">
                {draft.guidesSectionSubtitle ||
                  'Multilingual, highly trained professionals with decades of mountain experience'}
              </p>
              <blockquote className="text-sm italic text-[var(--cms-foreground)] mb-2">
                {draft.guidesQuote || '"Mountains are not fair or unfair, they are just dangerous."'}
              </blockquote>
              <p className="text-sm text-[var(--cms-muted-foreground)] mb-3">
                {draft.guidesQuoteAuthor || '— Reinhold Messner'}
              </p>
              <p className="text-sm text-[var(--cms-foreground)]">
                {draft.guidesSafetyStatement ||
                  'Your safety is non-negotiable. Our guides excel at risk assessment, multilingual communication, and radical transparency backed by internationally recognized certifications and decades of high-altitude experience.'}
              </p>
            </div>

            <div className="mb-6">
              <h2 className="text-lg font-semibold mb-2">
                {draft.pricingTitle || 'Pricing & Booking'}
              </h2>
              <p className="text-sm text-[var(--cms-muted-foreground)]">
                {draft.pricingDescription || 'Transparent pricing with responsible impact included'}
              </p>
            </div>

            {/* Inclusions */}
            {draft.inclusions.length > 0 && (
              <div>
                <h2 className="text-lg font-semibold mb-3">Inclusions</h2>
                <ul className="space-y-2">
                  {draft.inclusions.map((inclusion, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-[var(--cms-primary)] mt-1">•</span>
                      <span className="text-[var(--cms-foreground)]">{inclusion}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Guest responsibilities */}
            {draft.exclusions.length > 0 && (
              <div>
                <h2 className="text-lg font-semibold mb-3 text-red-600">Guest responsibilities</h2>
                <ul className="space-y-2">
                  {draft.exclusions.map((exclusion, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-red-600 mt-1">•</span>
                      <span className="text-[var(--cms-foreground)]">{exclusion}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
