import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { Textarea } from '../../../components/ui/textarea';
import { TripDraft } from '../TripStepper';
import { Plus, X, GripVertical, ChevronDown, ChevronUp, Upload } from 'lucide-react';
import { useRef, useState } from 'react';
import { cn } from '../../../components/ui/utils';
import { getItineraryLabel } from '../../../utils/itinerary';
import { mediaApi, resolveMediaUrl } from '../../../services/api';
import { toast } from 'sonner';

interface ItineraryStepProps {
  data: TripDraft;
  updateData: (updates: Partial<TripDraft>) => void;
  errors?: Partial<Record<keyof TripDraft, string>>;
}

export function ItineraryStep({ data, updateData, errors }: ItineraryStepProps) {
  const [expandedDays, setExpandedDays] = useState<Set<number>>(new Set([0]));
  const dayFileInputRef = useRef<HTMLInputElement | null>(null);
  const [uploadingDayIndex, setUploadingDayIndex] = useState<number | null>(null);
  const [pendingDayIndex, setPendingDayIndex] = useState<number | null>(null);

  const addDay = () => {
    const newDay = {
      day: getItineraryLabel(undefined, data.itinerary.length),
      title: '',
      description: '',
    };
    updateData({ itinerary: [...data.itinerary, newDay] });
    setExpandedDays(new Set([...expandedDays, data.itinerary.length]));
  };

  const removeDay = (index: number) => {
    const newItinerary = data.itinerary.filter((_, i) => i !== index);
    updateData({ itinerary: newItinerary });
    const newExpanded = new Set(expandedDays);
    newExpanded.delete(index);
    setExpandedDays(newExpanded);
  };

  const updateDay = (index: number, updates: Partial<TripDraft['itinerary'][0]>) => {
    const newItinerary = [...data.itinerary];
    newItinerary[index] = { ...newItinerary[index], ...updates };
    updateData({ itinerary: newItinerary });
  };

  const addHighlight = (index: number) => {
    const highlights = [...(data.itinerary[index].highlights || []), ''];
    updateDay(index, { highlights });
  };

  const updateHighlight = (index: number, hIndex: number, value: string) => {
    const highlights = [...(data.itinerary[index].highlights || [])];
    highlights[hIndex] = value;
    updateDay(index, { highlights });
  };

  const removeHighlight = (index: number, hIndex: number) => {
    const highlights = (data.itinerary[index].highlights || []).filter((_, i) => i !== hIndex);
    updateDay(index, { highlights });
  };

  const addOptionalExtra = (index: number) => {
    const optional = [...(data.itinerary[index].optional || []), { name: '', price: '' }];
    updateDay(index, { optional });
  };

  const updateOptionalExtra = (index: number, oIndex: number, updates: Partial<{ name: string; price: string }>) => {
    const optional = [...(data.itinerary[index].optional || [])];
    optional[oIndex] = { ...optional[oIndex], ...updates };
    updateDay(index, { optional });
  };

  const removeOptionalExtra = (index: number, oIndex: number) => {
    const optional = (data.itinerary[index].optional || []).filter((_, i) => i !== oIndex);
    updateDay(index, { optional });
  };

  const handleDayImageUpload = async (index: number, file: File) => {
    try {
      setUploadingDayIndex(index);
      const uploaded = await mediaApi.upload(file, { category: 'image' });
      const url = resolveMediaUrl(uploaded?.url);
      if (url) {
        updateDay(index, { image: url });
      }
    } catch (error: any) {
      toast.error(error?.message || 'Failed to upload image');
    } finally {
      setUploadingDayIndex(null);
    }
  };

  const toggleDay = (index: number) => {
    const newExpanded = new Set(expandedDays);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedDays(newExpanded);
  };

  const moveDay = (index: number, direction: 'up' | 'down') => {
    if (
      (direction === 'up' && index === 0) ||
      (direction === 'down' && index === data.itinerary.length - 1)
    ) {
      return;
    }

    const newItinerary = [...data.itinerary];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    [newItinerary[index], newItinerary[targetIndex]] = [
      newItinerary[targetIndex],
      newItinerary[index],
    ];
    updateData({ itinerary: newItinerary });
  };

  return (
    <div className="space-y-6" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Inter, sans-serif' }}>
      <div>
        <h2 className="text-xl font-semibold mb-1 text-[var(--cms-foreground)]">Itinerary</h2>
        <p className="text-sm text-[var(--cms-muted-foreground)]">Build your trip day by day</p>
      </div>

      <div className="space-y-3">
        {errors?.itinerary && (
          <p className="text-xs text-red-500">{errors.itinerary}</p>
        )}
        <div className="space-y-3">
          <div>
            <h3 className="text-sm font-semibold text-[var(--cms-foreground)] mb-2">
              Section titles and descriptions
            </h3>
            <p className="text-xs text-[var(--cms-muted-foreground)] mb-4">
              These labels and subtitles appear above the guides and pricing sections on the public site.
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label className="text-sm font-medium">Guides Section Title</Label>
              <Input
                value={data.guidesSectionTitle}
                onChange={(e) => updateData({ guidesSectionTitle: e.target.value })}
                placeholder="Expert Guides & Safety"
                className="border-[var(--cms-border)] focus:border-[var(--cms-primary)]"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium">Guides Section Subtitle</Label>
              <Input
                value={data.guidesSectionSubtitle}
                onChange={(e) => updateData({ guidesSectionSubtitle: e.target.value })}
                placeholder="Multilingual, highly trained professionals with decades of mountain experience"
                className="border-[var(--cms-border)] focus:border-[var(--cms-primary)]"
              />
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label className="text-sm font-medium">Guides Quote</Label>
              <Textarea
                value={data.guidesQuote}
                onChange={(e) => updateData({ guidesQuote: e.target.value })}
                placeholder='"Mountains are not fair or unfair, they are just dangerous."'
                rows={3}
                className="border-[var(--cms-border)] focus:border-[var(--cms-primary)] resize-none"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium">Quote Attribution</Label>
              <Input
                value={data.guidesQuoteAuthor}
                onChange={(e) => updateData({ guidesQuoteAuthor: e.target.value })}
                placeholder="— Reinhold Messner"
                className="border-[var(--cms-border)] focus:border-[var(--cms-primary)]"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label className="text-sm font-medium">Guides Safety Statement</Label>
            <Textarea
              value={data.guidesSafetyStatement}
              onChange={(e) => updateData({ guidesSafetyStatement: e.target.value })}
              placeholder="Your safety is non-negotiable. Our guides excel at risk assessment..."
              rows={3}
              className="border-[var(--cms-border)] focus:border-[var(--cms-primary)] resize-none"
            />
          </div>
          <div className="border-t border-dashed border-[var(--cms-border)] pt-4 mt-2" />
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label className="text-sm font-medium">Pricing Section Title</Label>
              <Input
                value={data.pricingTitle}
                onChange={(e) => updateData({ pricingTitle: e.target.value })}
                placeholder="Pricing & Booking"
                className="border-[var(--cms-border)] focus:border-[var(--cms-primary)]"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium">Pricing Section Description</Label>
              <Textarea
                value={data.pricingDescription}
                onChange={(e) => updateData({ pricingDescription: e.target.value })}
                placeholder="Transparent pricing with responsible impact included"
                rows={3}
                className="border-[var(--cms-border)] focus:border-[var(--cms-primary)] resize-none"
              />
            </div>
          </div>
          <div className="border-t border-dashed border-[var(--cms-border)] pt-4 mt-2" />
        </div>
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-[var(--cms-foreground)] mb-2">
            Itinerary title and description
          </h3>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label className="text-sm font-medium">Itinerary Title</Label>
              <Input
                value={data.itineraryTitle}
                onChange={(e) => updateData({ itineraryTitle: e.target.value })}
                placeholder="Daily Itinerary"
                className="border-[var(--cms-border)] focus:border-[var(--cms-primary)]"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium">Itinerary Description</Label>
              <Textarea
                value={data.itineraryDescription}
                onChange={(e) => updateData({ itineraryDescription: e.target.value })}
                placeholder="Each day brings new landscapes, cultures, and connections"
                rows={3}
                className="border-[var(--cms-border)] focus:border-[var(--cms-primary)] resize-none"
              />
            </div>
          </div>
        </div>
        <input
          ref={dayFileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (file && pendingDayIndex !== null) {
              handleDayImageUpload(pendingDayIndex, file);
              setPendingDayIndex(null);
              event.currentTarget.value = '';
            }
          }}
        />
        {data.itinerary.length === 0 ? (
          <div className="border-2 border-dashed border-[var(--cms-border)] rounded-lg p-12 text-center">
            <p className="text-sm text-[var(--cms-muted-foreground)] mb-4">No days added yet</p>
            <Button
              onClick={addDay}
              variant="outline"
              className="border-[var(--cms-border)]"
            >
              <Plus className="mr-2 h-4 w-4" />
              Add First Day
            </Button>
          </div>
        ) : (
          data.itinerary.map((day, index) => {
            const isExpanded = expandedDays.has(index);
            const dayLabel = getItineraryLabel(day.day, index);
            return (
              <div
                key={index}
                className="border border-[var(--cms-border)] rounded-lg bg-white"
              >
                {/* Day Header */}
                <div className="flex items-center gap-3 p-4 border-b border-[var(--cms-border)]">
                  <div className="flex items-center gap-2 text-[var(--cms-muted-foreground)]">
                    <GripVertical className="h-4 w-4 cursor-move" />
                    <span className="text-sm font-medium">{dayLabel}</span>
                  </div>
                  <div className="flex-1">
                    {day.title && (
                      <span className="text-sm font-medium">{day.title}</span>
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    {index > 0 && (
                      <button
                        onClick={() => moveDay(index, 'up')}
                        className="p-1 hover:bg-[var(--cms-muted)] rounded"
                      >
                        <ChevronUp className="h-4 w-4" />
                      </button>
                    )}
                    {index < data.itinerary.length - 1 && (
                      <button
                        onClick={() => moveDay(index, 'down')}
                        className="p-1 hover:bg-[var(--cms-muted)] rounded"
                      >
                        <ChevronDown className="h-4 w-4" />
                      </button>
                    )}
                    <button
                      onClick={() => toggleDay(index)}
                      className="p-1 hover:bg-[var(--cms-muted)] rounded"
                    >
                      {isExpanded ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                    </button>
                    <button
                      onClick={() => removeDay(index)}
                      className="p-1 hover:bg-red-50 rounded text-red-500"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* Day Content */}
                {isExpanded && (
                  <div className="p-4 space-y-4">
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Day label</Label>
                      <Input
                        value={day.day}
                        onChange={(e) => updateDay(index, { day: e.target.value })}
                        placeholder={getItineraryLabel(undefined, index)}
                        className="border-[var(--cms-border)] focus:border-[var(--cms-primary)]"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Day Title</Label>
                      <Input
                        value={day.title}
                        onChange={(e) => updateDay(index, { title: e.target.value })}
                        placeholder="Arrival and welcome"
                        className={cn(
                          'border-[var(--cms-border)] focus:border-[var(--cms-primary)]',
                          errors?.itinerary && !day.title.trim() && 'border-red-400 focus:border-red-400'
                        )}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Location</Label>
                      <Input
                        value={day.location || ''}
                        onChange={(e) => updateDay(index, { location: e.target.value })}
                        placeholder="Base town"
                        className="border-[var(--cms-border)] focus:border-[var(--cms-primary)]"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Description</Label>
                      <Textarea
                        value={day.description}
                        onChange={(e) => updateDay(index, { description: e.target.value })}
                        placeholder="Describe what happens on this day..."
                        rows={4}
                        className={cn(
                          'border-[var(--cms-border)] focus:border-[var(--cms-primary)] resize-none',
                          errors?.itinerary && !day.description.trim() && 'border-red-400 focus:border-red-400'
                        )}
                      />
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">Accommodation</Label>
                        <Input
                          value={day.accommodation || ''}
                          onChange={(e) => updateDay(index, { accommodation: e.target.value })}
                          placeholder="Hotel name"
                          className="border-[var(--cms-border)] focus:border-[var(--cms-primary)]"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label className="text-sm font-medium">Meals</Label>
                        <Input
                          value={day.meals || ''}
                          onChange={(e) => updateDay(index, { meals: e.target.value })}
                          placeholder="B, L, D"
                          className="border-[var(--cms-border)] focus:border-[var(--cms-primary)]"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label className="text-sm font-medium">Distance</Label>
                        <Input
                          value={day.distance || ''}
                          onChange={(e) => updateDay(index, { distance: e.target.value })}
                          placeholder="12 km"
                          className="border-[var(--cms-border)] focus:border-[var(--cms-primary)]"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label className="text-sm font-medium">Elevation</Label>
                        <Input
                          value={day.elevation || ''}
                          onChange={(e) => updateDay(index, { elevation: e.target.value })}
                          placeholder="3,840m"
                          className="border-[var(--cms-border)] focus:border-[var(--cms-primary)]"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Included activities</Label>
                      <div className="space-y-2">
                        {(day.highlights || []).map((highlight, hIndex) => (
                          <div key={hIndex} className="flex items-center gap-2">
                            <Input
                              value={highlight}
                              onChange={(e) => updateHighlight(index, hIndex, e.target.value)}
                              placeholder="Airport pickup"
                              className="border-[var(--cms-border)] focus:border-[var(--cms-primary)]"
                            />
                            <button
                              onClick={() => removeHighlight(index, hIndex)}
                              className="p-2 hover:bg-red-50 rounded text-red-500 flex-shrink-0"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                        ))}
                        <Button
                          onClick={() => addHighlight(index)}
                          variant="outline"
                          size="sm"
                          className="border-[var(--cms-border)] border-dashed"
                        >
                          <Plus className="mr-2 h-3.5 w-3.5" />
                          Add activity
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Optional extras</Label>
                      <div className="space-y-2">
                        {(day.optional || []).map((extra, oIndex) => (
                          <div key={oIndex} className="flex items-center gap-2">
                            <Input
                              value={extra.name}
                              onChange={(e) => updateOptionalExtra(index, oIndex, { name: e.target.value })}
                              placeholder="Pashupatinath Temple tour"
                              className="border-[var(--cms-border)] focus:border-[var(--cms-primary)] flex-1"
                            />
                            <Input
                              value={extra.price || ''}
                              onChange={(e) => updateOptionalExtra(index, oIndex, { price: e.target.value })}
                              placeholder="$15"
                              className="border-[var(--cms-border)] focus:border-[var(--cms-primary)] w-24 flex-shrink-0"
                            />
                            <button
                              onClick={() => removeOptionalExtra(index, oIndex)}
                              className="p-2 hover:bg-red-50 rounded text-red-500 flex-shrink-0"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                        ))}
                        <Button
                          onClick={() => addOptionalExtra(index)}
                          variant="outline"
                          size="sm"
                          className="border-[var(--cms-border)] border-dashed"
                        >
                          <Plus className="mr-2 h-3.5 w-3.5" />
                          Add optional extra
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Day Image (optional)</Label>
                      <div className="border-2 border-dashed border-[var(--cms-border)] rounded-lg p-4 text-center">
                        {day.image ? (
                          <div className="relative inline-block">
                            <img
                              src={day.image}
                              alt={day.title || dayLabel}
                              className="h-32 w-auto rounded object-cover"
                            />
                            <button
                              onClick={() => updateDay(index, { image: undefined })}
                              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => {
                              setPendingDayIndex(index);
                              dayFileInputRef.current?.click();
                            }}
                            className="inline-flex items-center gap-2 text-sm text-[var(--cms-muted-foreground)] hover:text-[var(--cms-primary)]"
                          >
                            <Upload className="h-4 w-4" />
                            {uploadingDayIndex === index ? 'Uploading...' : 'Upload image'}
                          </button>
                        )}
                      </div>
                      <Input
                        value={day.image || ''}
                        onChange={(e) => updateDay(index, { image: e.target.value })}
                        placeholder="Paste image URL"
                        className="border-[var(--cms-border)] focus:border-[var(--cms-primary)]"
                      />
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}

        <Button
          onClick={addDay}
          variant="outline"
          className="w-full border-[var(--cms-border)] border-dashed"
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Day
        </Button>
      </div>
    </div>
  );
}
