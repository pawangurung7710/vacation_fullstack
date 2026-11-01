import { TripDraft } from '../TripStepper';
import { Badge } from '../../../components/ui/badge';
import { Card, CardContent } from '../../../components/ui/card';
import { Check } from 'lucide-react';
import { cn } from '../../../components/ui/utils';
import { getItineraryLabel } from '../../../utils/itinerary';
import { resolveMediaUrl } from '../../../services/api';

interface ReviewStepProps {
  data: TripDraft;
  updateData: (updates: Partial<TripDraft>) => void;
  onEditStep: (step: string) => void;
}

export function ReviewStep({ data, onEditStep }: ReviewStepProps) {
  return (
    <div className="space-y-8" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Inter, sans-serif' }}>
      <div>
        <h2 className="text-xl font-semibold mb-1 text-[var(--cms-foreground)]">Review & Preview</h2>
        <p className="text-sm text-[var(--cms-muted-foreground)]">Review your trip before publishing</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basics Review */}
          <Card className="border-[var(--cms-border)] bg-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-[var(--cms-foreground)]">Basics</h3>
                <button
                  onClick={() => onEditStep('basics')}
                  className="text-sm text-[var(--cms-primary)] hover:underline"
                >
                  Edit
                </button>
              </div>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="text-[var(--cms-muted-foreground)]">Title:</span>{' '}
                  <span className="font-medium">{data.title || 'Not set'}</span>
                </div>
                <div>
                  <span className="text-[var(--cms-muted-foreground)]">Category:</span>{' '}
                  <span className="font-medium capitalize">{data.categoryLabel || 'Not set'}</span>
                </div>
                <div>
                  <span className="text-[var(--cms-muted-foreground)]">Subcategory:</span>{' '}
                  <span className="font-medium capitalize">{data.subcategoryLabel || 'Not set'}</span>
                </div>
                <div>
                  <span className="text-[var(--cms-muted-foreground)]">Location:</span>{' '}
                  <span className="font-medium">
                    {data.region && data.country ? `${data.region}, ${data.country}` : 'Not set'}
                  </span>
                </div>
                <div>
                  <span className="text-[var(--cms-muted-foreground)]">Duration:</span>{' '}
                  <span className="font-medium">{data.duration ? `${data.duration} days` : 'Not set'}</span>
                </div>
                <div>
                  <span className="text-[var(--cms-muted-foreground)]">Price:</span>{' '}
                  <span className="font-medium">{data.price ? `US $${data.price}` : 'Not set'}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Media Review */}
          <Card className="border-[var(--cms-border)] bg-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-[var(--cms-foreground)]">Media</h3>
                <button
                  onClick={() => onEditStep('media')}
                  className="text-sm text-[var(--cms-primary)] hover:underline"
                >
                  Edit
                </button>
              </div>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="text-[var(--cms-muted-foreground)]">Main Image:</span>{' '}
                  <span className="font-medium">{data.mainImage ? 'Uploaded' : 'Not set'}</span>
                </div>
                {data.mainImage && (
                  <div className="mt-3">
                    <div className="aspect-[4/3] overflow-hidden rounded-lg border border-[var(--cms-border)]">
                      <img
                        src={data.mainImage}
                        alt={data.title || 'Trip image'}
                        className="h-full w-full object-cover"
                      />
                    </div>
                  </div>
                )}
                <div>
                  <span className="text-[var(--cms-muted-foreground)]">Gallery:</span>{' '}
                  <span className="font-medium">{data.gallery.length} images</span>
                </div>
                {data.gallery.length > 0 && (
                  <div className="mt-2 grid grid-cols-3 gap-2">
                    {data.gallery.slice(0, 6).map((image, index) => (
                      <div key={`${image}-${index}`} className="aspect-[4/3] overflow-hidden rounded-md border border-[var(--cms-border)]">
                        <img
                          src={image}
                          alt={`Gallery ${index + 1}`}
                          className="h-full w-full object-cover"
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Details Review */}
          <Card className="border-[var(--cms-border)] bg-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-[var(--cms-foreground)]">Details</h3>
                <button
                  onClick={() => onEditStep('details')}
                  className="text-sm text-[var(--cms-primary)] hover:underline"
                >
                  Edit
                </button>
              </div>
              <div className="space-y-3 text-sm">
                {data.description && (
                  <div>
                    <span className="text-[var(--cms-muted-foreground)]">Description:</span>
                    <p className="mt-1 text-[var(--cms-foreground)]">{data.description.substring(0, 200)}...</p>
                  </div>
                )}
                {data.highlights.length > 0 && (
                  <div>
                    <span className="text-[var(--cms-muted-foreground)]">Highlights:</span>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {data.highlights.map((h, i) => (
                        <Badge key={i} variant="outline" className="border-[var(--cms-border)]">
                          {h}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
                {data.sustainabilityBadges.length > 0 && (
                  <div>
                    <span className="text-[var(--cms-muted-foreground)]">Trip Tags:</span>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {data.sustainabilityBadges.map((b, i) => (
                        <Badge key={i} variant="outline" className="border-[var(--cms-primary)] text-[var(--cms-primary)]">
                          {b}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Itinerary Review */}
          <Card className="border-[var(--cms-border)] bg-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-[var(--cms-foreground)]">Itinerary</h3>
                <button
                  onClick={() => onEditStep('itinerary')}
                  className="text-sm text-[var(--cms-primary)] hover:underline"
                >
                  Edit
                </button>
              </div>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="text-[var(--cms-muted-foreground)]">Days:</span>{' '}
                  <span className="font-medium">{data.itinerary.length} days</span>
                </div>
                {data.itinerary.length > 0 && (
                  <div className="mt-3 space-y-2">
                    {data.itinerary.slice(0, 3).map((day, i) => {
                      const dayLabel = getItineraryLabel(day.day, i);
                      return (
                        <div key={i} className="flex items-start gap-2 text-sm">
                          <span className="text-[var(--cms-muted-foreground)]">{dayLabel}:</span>
                          <span className="font-medium">{day.title || 'Untitled'}</span>
                          {day.image && (
                            <img
                              src={resolveMediaUrl(day.image)}
                              alt={day.title || dayLabel}
                              className="h-10 w-14 rounded-md object-cover border border-[var(--cms-border)]"
                            />
                          )}
                        </div>
                      );
                    })}
                    {data.itinerary.length > 3 && (
                      <div className="text-[var(--cms-muted-foreground)]">
                        +{data.itinerary.length - 3} more days
                      </div>
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="border-[var(--cms-border)] bg-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-[var(--cms-foreground)]">Guides Section</h3>
                <button
                  onClick={() => onEditStep('itinerary')}
                  className="text-sm text-[var(--cms-primary)] hover:underline"
                >
                  Edit
                </button>
              </div>
              <div className="space-y-3 text-sm">
                <div>
                  <span className="text-[var(--cms-muted-foreground)]">Title:</span>{' '}
                  <span className="font-medium">
                    {data.guidesSectionTitle || 'Expert Guides & Safety'}
                  </span>
                </div>
                <div>
                  <span className="text-[var(--cms-muted-foreground)]">Subtitle:</span>{' '}
                  <span className="font-medium">
                    {data.guidesSectionSubtitle ||
                      'Multilingual, highly trained professionals with decades of mountain experience'}
                  </span>
                </div>
                <div>
                  <span className="text-[var(--cms-muted-foreground)]">Quote:</span>{' '}
                  <span className="font-medium italic">
                    {data.guidesQuote || '"Mountains are not fair or unfair, they are just dangerous."'}
                  </span>
                </div>
                <div>
                  <span className="text-[var(--cms-muted-foreground)]">Quote Author:</span>{' '}
                  <span className="font-medium">{data.guidesQuoteAuthor || '— Reinhold Messner'}</span>
                </div>
                <div>
                  <span className="text-[var(--cms-muted-foreground)]">Safety Statement:</span>
                  <p className="mt-1 text-[var(--cms-foreground)]">
                    {data.guidesSafetyStatement ||
                      'Your safety is non-negotiable. Our guides excel at risk assessment, multilingual communication, and radical transparency backed by internationally recognized certifications and decades of high-altitude experience.'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-[var(--cms-border)] bg-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-[var(--cms-foreground)]">Pricing Section</h3>
                <button
                  onClick={() => onEditStep('details')}
                  className="text-sm text-[var(--cms-primary)] hover:underline"
                >
                  Edit
                </button>
              </div>
              <div className="space-y-3 text-sm">
                <div>
                  <span className="text-[var(--cms-muted-foreground)]">Title:</span>{' '}
                  <span className="font-medium">{data.pricingTitle || 'Pricing & Booking'}</span>
                </div>
                <div>
                  <span className="text-[var(--cms-muted-foreground)]">Description:</span>
                  <p className="mt-1 text-[var(--cms-foreground)]">
                    {data.pricingDescription || 'Transparent pricing with responsible impact included'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Guides Review */}
          <Card className="border-[var(--cms-border)] bg-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-[var(--cms-foreground)]">Guides</h3>
                <button
                  onClick={() => onEditStep('details')}
                  className="text-sm text-[var(--cms-primary)] hover:underline"
                >
                  Edit
                </button>
              </div>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="text-[var(--cms-muted-foreground)]">Selected:</span>{' '}
                  <span className="font-medium">{(data.guides || []).length} guides</span>
                </div>
                {(data.guides || []).length === 0 && (
                  <div className="text-[var(--cms-muted-foreground)] italic">No guides selected</div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <Card className="border-[var(--cms-border)] bg-white sticky top-4">
            <CardContent className="p-6">
              <h3 className="font-semibold mb-4 text-[var(--cms-foreground)]">Publishing Options</h3>
              <div className="space-y-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-[var(--cms-muted-foreground)]">Status:</span>
                  <Badge
                    variant={data.status === 'published' ? 'default' : 'outline'}
                    className={cn(
                      data.status === 'published'
                        ? 'bg-[var(--cms-primary)] text-white'
                        : 'border-[var(--cms-border)]'
                    )}
                  >
                    {data.status}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[var(--cms-muted-foreground)]">Featured:</span>
                  {data.featured ? (
                    <Check className="h-4 w-4 text-[var(--cms-primary)]" />
                  ) : (
                    <span className="text-[var(--cms-muted-foreground)]">No</span>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
