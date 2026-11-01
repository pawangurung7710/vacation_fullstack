import { useState, useEffect } from 'react';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { Textarea } from '../../../components/ui/textarea';
import { Button } from '../../../components/ui/button';
import { TripDraft } from '../TripStepper';
import { X, Plus, Check } from 'lucide-react';
import { Badge } from '../../../components/ui/badge';
import { cn } from '../../../components/ui/utils';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/ui/select';
import { guidesApi, addOnsApi, type AddOnRecord } from '../../../services/api';

interface DetailsStepProps {
  data: TripDraft;
  updateData: (updates: Partial<TripDraft>) => void;
  errors?: Partial<Record<keyof TripDraft, string>>;
}

// Accommodation & Meals is no longer surfaced on trip detail pages. Flip to true
// to bring the CMS editor for it back.
const ACCOMMODATION_AND_MEALS_ENABLED: boolean = false;

const SUSTAINABILITY_BADGES = [
  'Zero Waste',
  'Low-carbon',
  'Local Hire',
  'Inclusive Growth',
] as const;

export function DetailsStep({ data, updateData, errors }: DetailsStepProps) {
  const [highlightInput, setHighlightInput] = useState('');
  const [inclusionInput, setInclusionInput] = useState('');
  const [exclusionInput, setExclusionInput] = useState('');
  const [guides, setGuides] = useState<any[]>([]);
  const [loadingGuides, setLoadingGuides] = useState(false);
  const [addOnRecords, setAddOnRecords] = useState<AddOnRecord[]>([]);
  const departures = data.departures || [];

  useEffect(() => {
    const loadGuides = async () => {
      setLoadingGuides(true);
      try {
        const allGuides = await guidesApi.getAll({ isActive: true });
        setGuides(allGuides);
      } catch (error) {
        console.error('Failed to load guides:', error);
      } finally {
        setLoadingGuides(false);
      }
    };
    loadGuides();
    addOnsApi
      .getAll({ status: 'active' })
      .then((data) => setAddOnRecords(data || []))
      .catch(() => {});
  }, []);

  const offeredAddOns = data.offeredAddOns || [];
  const toggleOfferedAddOn = (addOnId: string) => {
    updateData({
      offeredAddOns: offeredAddOns.includes(addOnId)
        ? offeredAddOns.filter((id) => id !== addOnId)
        : [...offeredAddOns, addOnId],
    });
  };
  const comfortAddOnRecords = addOnRecords.filter((a) => a.kind === 'comfort');
  const globalActivities = addOnRecords.filter((a) => a.kind === 'activity' && a.scope === 'global');

  const toggleGuide = (guideId: string) => {
    const currentGuides = data.guides || [];
    if (currentGuides.includes(guideId)) {
      updateData({ guides: currentGuides.filter((id) => id !== guideId) });
    } else {
      updateData({ guides: [...currentGuides, guideId] });
    }
  };

  const addHighlight = () => {
    if (highlightInput.trim()) {
      updateData({ highlights: [...data.highlights, highlightInput.trim()] });
      setHighlightInput('');
    }
  };

  const removeHighlight = (index: number) => {
    updateData({ highlights: data.highlights.filter((_, i) => i !== index) });
  };

  const addInclusion = () => {
    if (inclusionInput.trim()) {
      updateData({ inclusions: [...data.inclusions, inclusionInput.trim()] });
      setInclusionInput('');
    }
  };

  const removeInclusion = (index: number) => {
    updateData({ inclusions: data.inclusions.filter((_, i) => i !== index) });
  };

  const addExclusion = () => {
    if (exclusionInput.trim()) {
      updateData({ exclusions: [...data.exclusions, exclusionInput.trim()] });
      setExclusionInput('');
    }
  };

  const removeExclusion = (index: number) => {
    updateData({ exclusions: data.exclusions.filter((_, i) => i !== index) });
  };

  const toggleBadge = (badge: string) => {
    if (data.sustainabilityBadges.includes(badge)) {
      updateData({ sustainabilityBadges: data.sustainabilityBadges.filter((b) => b !== badge) });
    } else {
      updateData({ sustainabilityBadges: [...data.sustainabilityBadges, badge] });
    }
  };

  const addDeparture = () => {
    updateData({
      departures: [
        ...departures,
        {
          startDate: '',
          endDate: '',
          pricePerPerson: '',
          totalSeats: '',
          seatsAvailable: '',
          status: 'scheduled',
        },
      ],
    });
  };

  const updateDeparture = (index: number, updates: Partial<TripDraft['departures'][number]>) => {
    const next = departures.map((departure, idx) =>
      idx === index ? { ...departure, ...updates } : departure
    );
    updateData({ departures: next });
  };

  const removeDeparture = (index: number) => {
    updateData({ departures: departures.filter((_, idx) => idx !== index) });
  };

  const bybSections = data.beforeYouBook?.sections || [];

  const updateBybSections = (sections: NonNullable<TripDraft['beforeYouBook']>['sections']) => {
    updateData({ beforeYouBook: { ...data.beforeYouBook, sections } });
  };

  const addBybSection = () => {
    updateBybSections([...bybSections, { heading: '', items: [''] }]);
  };

  const removeBybSection = (index: number) => {
    updateBybSections(bybSections.filter((_, i) => i !== index));
  };

  const updateBybSectionHeading = (index: number, heading: string) => {
    updateBybSections(bybSections.map((s, i) => (i === index ? { ...s, heading } : s)));
  };

  const addBybItem = (sectionIndex: number) => {
    updateBybSections(bybSections.map((s, i) =>
      i === sectionIndex ? { ...s, items: [...s.items, ''] } : s
    ));
  };

  const updateBybItem = (sectionIndex: number, itemIndex: number, value: string) => {
    updateBybSections(bybSections.map((s, i) =>
      i === sectionIndex ? { ...s, items: s.items.map((it, j) => (j === itemIndex ? value : it)) } : s
    ));
  };

  const removeBybItem = (sectionIndex: number, itemIndex: number) => {
    updateBybSections(bybSections.map((s, i) =>
      i === sectionIndex ? { ...s, items: s.items.filter((_, j) => j !== itemIndex) } : s
    ));
  };

  const updateBybCta = (updates: Partial<NonNullable<TripDraft['beforeYouBook']>>) => {
    updateData({ beforeYouBook: { ...data.beforeYouBook, ...updates } });
  };

  return (
    <div className="space-y-8" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Inter, sans-serif' }}>
      <div>
        <h2 className="text-xl font-semibold mb-1 text-[var(--cms-foreground)]">Trip Details</h2>
        <p className="text-sm text-[var(--cms-muted-foreground)]">Provide detailed information about your trip</p>
      </div>

      {/* Description */}
      <div className="space-y-2">
        <Label htmlFor="description" className="text-sm font-medium">
          Description *
        </Label>
        <Textarea
          id="description"
          value={data.description}
          onChange={(e) => updateData({ description: e.target.value })}
          placeholder="Enter a detailed description of your trip..."
          rows={8}
          className={cn(
            'border-[var(--cms-border)] focus:border-[var(--cms-primary)] resize-none',
            errors?.description && 'border-red-400 focus:border-red-400'
          )}
        />
        {errors?.description && <p className="text-xs text-red-500">{errors.description}</p>}
        <p className="text-xs text-[var(--cms-muted-foreground)]">Rich text editor will be available here</p>
      </div>

      {/* Highlights */}
      <div className="space-y-3">
        <Label className="text-sm font-medium">Highlights</Label>
        <div className="flex gap-2">
          <Input
            value={highlightInput}
            onChange={(e) => setHighlightInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addHighlight())}
            placeholder="Add a highlight..."
            className="border-[var(--cms-border)] focus:border-[var(--cms-primary)]"
          />
          <Button
            type="button"
            onClick={addHighlight}
            variant="outline"
            className="border-[var(--cms-border)]"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        {data.highlights.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {data.highlights.map((highlight, index) => (
              <Badge
                key={index}
                variant="outline"
                className="border-[var(--cms-border)] flex items-center gap-2"
              >
                {highlight}
                <button
                  onClick={() => removeHighlight(index)}
                  className="ml-1 hover:text-red-500"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
        )}
      </div>

      {/* Inclusions */}
      <div className="space-y-3">
        <Label className="text-sm font-medium">Inclusions</Label>
        <div className="flex gap-2">
          <Input
            value={inclusionInput}
            onChange={(e) => setInclusionInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addInclusion())}
            placeholder="Add an inclusion..."
            className="border-[var(--cms-border)] focus:border-[var(--cms-primary)]"
          />
          <Button
            type="button"
            onClick={addInclusion}
            variant="outline"
            className="border-[var(--cms-border)]"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        {data.inclusions.length > 0 && (
          <ul className="space-y-2">
            {data.inclusions.map((inclusion, index) => (
              <li
                key={index}
                className="flex items-center justify-between p-2 border border-[var(--cms-border)] rounded"
              >
                <span className="text-sm">{inclusion}</span>
                <button
                  onClick={() => removeInclusion(index)}
                  className="text-[var(--cms-muted-foreground)] hover:text-red-500"
                >
                  <X className="h-4 w-4" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Guest responsibilities */}
      <div className="space-y-3">
        <Label className="text-sm font-medium">Guest responsibilities</Label>
        <div className="flex gap-2">
          <Input
            value={exclusionInput}
            onChange={(e) => setExclusionInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addExclusion())}
            placeholder="Add a guest responsibility..."
            className="border-[var(--cms-border)] focus:border-[var(--cms-primary)]"
          />
          <Button
            type="button"
            onClick={addExclusion}
            variant="outline"
            className="border-[var(--cms-border)]"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        {data.exclusions.length > 0 && (
          <ul className="space-y-2">
            {data.exclusions.map((exclusion, index) => (
              <li
                key={index}
                className="flex items-center justify-between p-2 border border-[var(--cms-border)] rounded"
              >
                <span className="text-sm">{exclusion}</span>
                <button
                  onClick={() => removeExclusion(index)}
                  className="text-[var(--cms-muted-foreground)] hover:text-red-500"
                >
                  <X className="h-4 w-4" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Trip Tags */}
      <div className="space-y-3">
        <Label className="text-sm font-medium">Trip Tags</Label>
        <div className="flex flex-wrap gap-2">
          {SUSTAINABILITY_BADGES.map((badge) => (
            <button
              key={badge}
              onClick={() => toggleBadge(badge)}
              className={cn(
                'px-4 py-2 rounded border text-sm font-medium transition-colors',
                data.sustainabilityBadges.includes(badge)
                  ? 'border-[var(--cms-primary)] bg-[var(--cms-primary)] text-white'
                  : 'border-[var(--cms-border)] bg-white hover:bg-[var(--cms-muted)]'
              )}
            >
              {badge}
            </button>
          ))}
        </div>
      </div>

      {/* Additional Fields */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="space-y-2">
          <Label htmlFor="maxGroupSize" className="text-sm font-medium">
            Max Group Size *
          </Label>
          <Input
            id="maxGroupSize"
            type="number"
            value={data.maxGroupSize}
            onChange={(e) => updateData({ maxGroupSize: e.target.value })}
            placeholder="12"
            className={cn(
              'border-[var(--cms-border)] focus:border-[var(--cms-primary)]',
              errors?.maxGroupSize && 'border-red-400 focus:border-red-400'
            )}
          />
          {errors?.maxGroupSize && <p className="text-xs text-red-500">{errors.maxGroupSize}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="season" className="text-sm font-medium">
            Season
          </Label>
          <Input
            id="season"
            value={data.season}
            onChange={(e) => updateData({ season: e.target.value })}
            placeholder="Spring, Autumn"
            className="border-[var(--cms-border)] focus:border-[var(--cms-primary)]"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="distance" className="text-sm font-medium">
            Distance
          </Label>
          <Input
            id="distance"
            value={data.distance || ''}
            onChange={(e) => updateData({ distance: e.target.value })}
            placeholder="120 km"
            className="border-[var(--cms-border)] focus:border-[var(--cms-primary)]"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="transport" className="text-sm font-medium">
            Transport
          </Label>
          <Input
            id="transport"
            value={data.transport || ''}
            onChange={(e) => updateData({ transport: e.target.value })}
            placeholder="EVs, public transport"
            className="border-[var(--cms-border)] focus:border-[var(--cms-primary)]"
          />
        </div>

        <div className="space-y-2 md:col-span-3">
          <Label htmlFor="heroSubtitle" className="text-sm font-medium">
            Hero Subtitle
          </Label>
          <Input
            id="heroSubtitle"
            value={data.heroSubtitle || ''}
            onChange={(e) => updateData({ heroSubtitle: e.target.value })}
            placeholder="A memorable journey through mountain landscapes and communities"
            className="border-[var(--cms-border)] focus:border-[var(--cms-primary)]"
          />
          <p className="text-xs text-[var(--cms-muted-foreground)]">
            Optional subtitle displayed below the trip title in the hero section
          </p>
        </div>
      </div>

      {/* FAQs Section */}
      <div className="space-y-4 border-t border-[var(--cms-border)] pt-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-[var(--cms-foreground)] mb-1">Frequently Asked Questions</h3>
            <p className="text-xs text-[var(--cms-muted-foreground)]">
              Optional: Add FAQs specific to this trip
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            className="border-[var(--cms-border)] bg-white hover:bg-[var(--cms-muted)] gap-2"
            onClick={() => {
              updateData({
                faqs: [
                  ...(data.faqs || []),
                  { question: '', answer: '' },
                ],
              });
            }}
          >
            <Plus size={14} />
            Add FAQ
          </Button>
        </div>

        {(!data.faqs || data.faqs.length === 0) ? (
          <div className="rounded-lg border border-dashed border-[var(--cms-border)] bg-[var(--cms-muted)] p-4 text-sm text-[var(--cms-muted-foreground)]">
            No FAQs added yet. Click "Add FAQ" to get started.
          </div>
        ) : (
          <div className="space-y-4">
            {data.faqs.map((faq, index) => (
              <div key={index} className="space-y-3 p-4 border border-[var(--cms-border)] rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-[var(--cms-muted-foreground)]">FAQ {index + 1}</span>
                  <button
                    type="button"
                    onClick={() => {
                      const newFaqs = data.faqs?.filter((_, i) => i !== index) || [];
                      updateData({ faqs: newFaqs });
                    }}
                    className="rounded-full p-2 text-[var(--cms-muted-foreground)] hover:bg-[var(--cms-muted)]"
                    aria-label="Remove FAQ"
                  >
                    <X size={16} />
                  </button>
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`faq-question-${index}`} className="text-xs font-medium">
                    Question
                  </Label>
                  <Input
                    id={`faq-question-${index}`}
                    value={faq.question}
                    onChange={(e) => {
                      const newFaqs = [...(data.faqs || [])];
                      newFaqs[index] = { ...newFaqs[index], question: e.target.value };
                      updateData({ faqs: newFaqs });
                    }}
                    placeholder="What fitness level is required?"
                    className="border-[var(--cms-border)] focus:border-[var(--cms-primary)]"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`faq-answer-${index}`} className="text-xs font-medium">
                    Answer
                  </Label>
                  <Textarea
                    id={`faq-answer-${index}`}
                    value={faq.answer}
                    onChange={(e) => {
                      const newFaqs = [...(data.faqs || [])];
                      newFaqs[index] = { ...newFaqs[index], answer: e.target.value };
                      updateData({ faqs: newFaqs });
                    }}
                    placeholder="This trek requires moderate fitness..."
                    rows={3}
                    className="border-[var(--cms-border)] focus:border-[var(--cms-primary)] resize-none"
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Accommodation & Meals — disabled: no longer displayed on trip detail pages */}
      {ACCOMMODATION_AND_MEALS_ENABLED && (
      <div className="space-y-4 border-t border-[var(--cms-border)] pt-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-[var(--cms-foreground)] mb-1">Accommodation & Meals</h3>
            <p className="text-xs text-[var(--cms-muted-foreground)]">
              Optional: Add details about accommodation and meal arrangements
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            className="border-[var(--cms-border)] bg-white hover:bg-[var(--cms-muted)] gap-2"
            onClick={() => {
              const currentItems = data.accommodationAndMeals?.items || [];
              updateData({
                accommodationAndMeals: {
                  ...data.accommodationAndMeals,
                  items: [
                    ...currentItems,
                    {
                      imageUrl: '',
                      title: '',
                      description: '',
                      features: [],
                    },
                  ],
                },
              });
            }}
          >
            <Plus size={14} />
            Add Item
          </Button>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="accommodation-title" className="text-sm font-medium">
              Section Title
            </Label>
            <Input
              id="accommodation-title"
              value={data.accommodationAndMeals?.title || ''}
              onChange={(e) =>
                updateData({
                  accommodationAndMeals: {
                    ...data.accommodationAndMeals,
                    title: e.target.value,
                  },
                })
              }
              placeholder="Accommodation & Meals"
              className="border-[var(--cms-border)] focus:border-[var(--cms-primary)]"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="accommodation-subtitle" className="text-sm font-medium">
              Section Subtitle
            </Label>
            <Input
              id="accommodation-subtitle"
              value={data.accommodationAndMeals?.subtitle || ''}
              onChange={(e) =>
                updateData({
                  accommodationAndMeals: {
                    ...data.accommodationAndMeals,
                    subtitle: e.target.value,
                  },
                })
              }
              placeholder="Comfortable stays and local meals"
              className="border-[var(--cms-border)] focus:border-[var(--cms-primary)]"
            />
          </div>

          {/* Items List */}
          {(!data.accommodationAndMeals?.items || data.accommodationAndMeals.items.length === 0) ? (
            <div className="rounded-lg border border-dashed border-[var(--cms-border)] bg-[var(--cms-muted)] p-4 text-sm text-[var(--cms-muted-foreground)]">
              No items added yet. Click "Add Item" to get started.
            </div>
          ) : (
            <div className="space-y-4">
              {data.accommodationAndMeals.items.map((item, itemIndex) => (
                <div key={itemIndex} className="space-y-4 p-4 border border-[var(--cms-border)] rounded-lg">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-semibold text-[var(--cms-foreground)]">
                      Item {itemIndex + 1}
                    </h4>
                    <button
                      type="button"
                      onClick={() => {
                        const newItems = data.accommodationAndMeals?.items?.filter((_, i) => i !== itemIndex) || [];
                        updateData({
                          accommodationAndMeals: {
                            ...data.accommodationAndMeals,
                            items: newItems,
                          },
                        });
                      }}
                      className="rounded-full p-2 text-[var(--cms-muted-foreground)] hover:bg-[var(--cms-muted)]"
                      aria-label="Remove item"
                    >
                      <X size={16} />
                    </button>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor={`item-image-${itemIndex}`} className="text-xs font-medium">
                      Image URL
                    </Label>
                    <Input
                      id={`item-image-${itemIndex}`}
                      value={item.imageUrl || ''}
                      onChange={(e) => {
                        const newItems = [...(data.accommodationAndMeals?.items || [])];
                        newItems[itemIndex] = { ...newItems[itemIndex], imageUrl: e.target.value };
                        updateData({
                          accommodationAndMeals: {
                            ...data.accommodationAndMeals,
                            items: newItems,
                          },
                        });
                      }}
                      placeholder="https://example.com/image.jpg"
                      className="border-[var(--cms-border)] focus:border-[var(--cms-primary)]"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor={`item-title-${itemIndex}`} className="text-xs font-medium">
                      Title
                    </Label>
                    <Input
                      id={`item-title-${itemIndex}`}
                      value={item.title || ''}
                      onChange={(e) => {
                        const newItems = [...(data.accommodationAndMeals?.items || [])];
                        newItems[itemIndex] = { ...newItems[itemIndex], title: e.target.value };
                        updateData({
                          accommodationAndMeals: {
                            ...data.accommodationAndMeals,
                            items: newItems,
                          },
                        });
                      }}
                      placeholder="Eco-Lodges & Homestays"
                      className="border-[var(--cms-border)] focus:border-[var(--cms-primary)]"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor={`item-description-${itemIndex}`} className="text-xs font-medium">
                      Description
                    </Label>
                    <Textarea
                      id={`item-description-${itemIndex}`}
                      value={item.description || ''}
                      onChange={(e) => {
                        const newItems = [...(data.accommodationAndMeals?.items || [])];
                        newItems[itemIndex] = { ...newItems[itemIndex], description: e.target.value };
                        updateData({
                          accommodationAndMeals: {
                            ...data.accommodationAndMeals,
                            items: newItems,
                          },
                        });
                      }}
                      placeholder="Sleep in family-run teahouses and eco-lodges..."
                      rows={3}
                      className="border-[var(--cms-border)] focus:border-[var(--cms-primary)] resize-none"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs font-medium">Features</Label>
                    <div className="flex gap-2">
                      <Input
                        placeholder="Add a feature..."
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            const input = e.currentTarget;
                            if (input.value.trim()) {
                              const newItems = [...(data.accommodationAndMeals?.items || [])];
                              newItems[itemIndex] = {
                                ...newItems[itemIndex],
                                features: [...(newItems[itemIndex].features || []), input.value.trim()],
                              };
                              updateData({
                                accommodationAndMeals: {
                                  ...data.accommodationAndMeals,
                                  items: newItems,
                                },
                              });
                              input.value = '';
                            }
                          }
                        }}
                        className="border-[var(--cms-border)] focus:border-[var(--cms-primary)]"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        className="border-[var(--cms-border)]"
                        onClick={(e) => {
                          const input = e.currentTarget.previousElementSibling as HTMLInputElement;
                          if (input?.value.trim()) {
                            const newItems = [...(data.accommodationAndMeals?.items || [])];
                            newItems[itemIndex] = {
                              ...newItems[itemIndex],
                              features: [...(newItems[itemIndex].features || []), input.value.trim()],
                            };
                            updateData({
                              accommodationAndMeals: {
                                ...data.accommodationAndMeals,
                                items: newItems,
                              },
                            });
                            input.value = '';
                          }
                        }}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    {item.features && item.features.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {item.features.map((feature, featureIndex) => (
                          <Badge
                            key={featureIndex}
                            variant="outline"
                            className="border-[var(--cms-border)] flex items-center gap-2"
                          >
                            {feature}
                            <button
                              onClick={() => {
                                const newItems = [...(data.accommodationAndMeals?.items || [])];
                                newItems[itemIndex] = {
                                  ...newItems[itemIndex],
                                  features: newItems[itemIndex].features?.filter((_, i) => i !== featureIndex) || [],
                                };
                                updateData({
                                  accommodationAndMeals: {
                                    ...data.accommodationAndMeals,
                                    items: newItems,
                                  },
                                });
                              }}
                              className="ml-1 hover:text-red-500"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      )}

      {/* Before You Book */}
      <div className="space-y-4 border-t border-[var(--cms-border)] pt-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-[var(--cms-foreground)] mb-1">Before You Book</h3>
            <p className="text-xs text-[var(--cms-muted-foreground)]">
              Accordion sections shown on the public trip page before booking (fitness expectations, visas, health, etc).
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            className="border-[var(--cms-border)] bg-white hover:bg-[var(--cms-muted)] gap-2"
            onClick={addBybSection}
          >
            <Plus size={14} />
            Add Section
          </Button>
        </div>

        {bybSections.length === 0 ? (
          <div className="rounded-lg border border-dashed border-[var(--cms-border)] bg-[var(--cms-muted)] p-4 text-sm text-[var(--cms-muted-foreground)]">
            No sections added yet. Click "Add Section" to get started.
          </div>
        ) : (
          <div className="space-y-4">
            {bybSections.map((section, sectionIndex) => (
              <div key={sectionIndex} className="space-y-3 p-4 border border-[var(--cms-border)] rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-[var(--cms-muted-foreground)]">Section {sectionIndex + 1}</span>
                  <button
                    type="button"
                    onClick={() => removeBybSection(sectionIndex)}
                    className="rounded-full p-2 text-[var(--cms-muted-foreground)] hover:bg-[var(--cms-muted)]"
                    aria-label="Remove section"
                  >
                    <X size={16} />
                  </button>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-medium">Heading</Label>
                  <Input
                    value={section.heading}
                    onChange={(e) => updateBybSectionHeading(sectionIndex, e.target.value)}
                    placeholder="Is this trip right for you?"
                    className="border-[var(--cms-border)] focus:border-[var(--cms-primary)]"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-medium">Bullet points</Label>
                  <div className="space-y-2">
                    {section.items.map((item, itemIndex) => (
                      <div key={itemIndex} className="flex items-center gap-2">
                        <Textarea
                          value={item}
                          onChange={(e) => updateBybItem(sectionIndex, itemIndex, e.target.value)}
                          placeholder="You should be comfortable walking 5–8 hours a day..."
                          rows={2}
                          className="border-[var(--cms-border)] focus:border-[var(--cms-primary)] resize-none"
                        />
                        <button
                          type="button"
                          onClick={() => removeBybItem(sectionIndex, itemIndex)}
                          className="p-2 hover:bg-red-50 rounded text-red-500 flex-shrink-0"
                          aria-label="Remove bullet point"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                    <Button
                      type="button"
                      onClick={() => addBybItem(sectionIndex)}
                      variant="outline"
                      size="sm"
                      className="border-[var(--cms-border)] border-dashed"
                    >
                      <Plus className="mr-2 h-3.5 w-3.5" />
                      Add bullet point
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="grid gap-4 md:grid-cols-2 pt-2">
          <div className="space-y-2">
            <Label className="text-xs font-medium">CTA Heading</Label>
            <Input
              value={data.beforeYouBook?.ctaHeading || ''}
              onChange={(e) => updateBybCta({ ctaHeading: e.target.value })}
              placeholder="Essential trip information"
              className="border-[var(--cms-border)] focus:border-[var(--cms-primary)]"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-xs font-medium">CTA Subtitle</Label>
            <Input
              value={data.beforeYouBook?.ctaSubtitle || ''}
              onChange={(e) => updateBybCta({ ctaSubtitle: e.target.value })}
              placeholder="Health, safety, visa requirements and everything else you need to know before you go."
              className="border-[var(--cms-border)] focus:border-[var(--cms-primary)]"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-xs font-medium">CTA Button Label</Label>
            <Input
              value={data.beforeYouBook?.ctaLinkLabel || ''}
              onChange={(e) => updateBybCta({ ctaLinkLabel: e.target.value })}
              placeholder="Read essentials"
              className="border-[var(--cms-border)] focus:border-[var(--cms-primary)]"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-xs font-medium">CTA Button Link (optional)</Label>
            <Input
              value={data.beforeYouBook?.ctaLinkUrl || ''}
              onChange={(e) => updateBybCta({ ctaLinkUrl: e.target.value })}
              placeholder="Leave blank to link to this trip's own /notes page"
              className="border-[var(--cms-border)] focus:border-[var(--cms-primary)]"
            />
          </div>
        </div>
      </div>

      {/* Add-ons offered on this trip */}
      <div className="space-y-4 border-t border-[var(--cms-border)] pt-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-[var(--cms-foreground)] mb-1">Add-ons &amp; activities</h3>
            <p className="text-xs text-[var(--cms-muted-foreground)]">
              Comfort upgrades and activities guests can add during checkout. Manage the catalogue in{' '}
              <a href="/cms/add-ons" target="_blank" rel="noreferrer" className="text-[var(--cms-primary)] underline">
                Add-ons &amp; Activities
              </a>.
            </p>
          </div>
        </div>

        <div className="space-y-2">
          <Label className="text-xs font-medium">Comfort upgrades offered on this trip</Label>
          {comfortAddOnRecords.length === 0 ? (
            <div className="rounded-lg border border-dashed border-[var(--cms-border)] bg-[var(--cms-muted)] p-4 text-sm text-[var(--cms-muted-foreground)]">
              No comfort add-ons in the catalogue yet.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {comfortAddOnRecords.map((addOn) => {
                const checked = offeredAddOns.includes(addOn._id);
                const priceText =
                  addOn.pricingType === 'choice'
                    ? `from $${Math.min(...(addOn.options || []).map((o) => o.price ?? 0).filter((p) => p > 0), 0) || 0}`
                    : addOn.price != null
                    ? `$${addOn.price} ${addOn.priceUnit || ''}`
                    : '';
                return (
                  <label
                    key={addOn._id}
                    className={cn(
                      'flex items-start gap-2 rounded-lg border p-3 cursor-pointer text-sm',
                      checked ? 'border-[var(--cms-primary)] bg-[var(--cms-primary)]/5' : 'border-[var(--cms-border)]'
                    )}
                  >
                    <input
                      type="checkbox"
                      className="mt-0.5"
                      checked={checked}
                      onChange={() => toggleOfferedAddOn(addOn._id)}
                    />
                    <span>
                      <span className="font-medium">{addOn.title}</span>
                      {priceText && <span className="text-[var(--cms-muted-foreground)]"> — {priceText}</span>}
                      {addOn.scope === 'global' && (
                        <span className="ml-1 text-xs uppercase tracking-wide text-[var(--cms-muted-foreground)]">
                          (also shown globally)
                        </span>
                      )}
                    </span>
                  </label>
                );
              })}
            </div>
          )}
        </div>

        {globalActivities.length > 0 && (
          <p className="text-xs text-[var(--cms-muted-foreground)]">
            {globalActivities.length} global activit{globalActivities.length === 1 ? 'y is' : 'ies are'} offered on
            every trip automatically and don't need to be selected here.
          </p>
        )}
      </div>

      {/* Guides */}
      <div className="space-y-4">
        <div>
          <h3 className="text-sm font-semibold text-[var(--cms-foreground)] mb-1">Guides</h3>
          <p className="text-xs text-[var(--cms-muted-foreground)]">
            Select guides for this trip (optional). Guides will be displayed on the trip detail page.
          </p>
        </div>

        {loadingGuides ? (
          <div className="rounded-lg border border-[var(--cms-border)] bg-[var(--cms-muted)] p-4 text-sm text-[var(--cms-muted-foreground)]">
            Loading guides...
          </div>
        ) : guides.length === 0 ? (
          <div className="rounded-lg border border-dashed border-[var(--cms-border)] bg-[var(--cms-muted)] p-4 text-sm text-[var(--cms-muted-foreground)]">
            No guides available. Create guides in the Guides section first.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {guides.map((guide) => {
              const isSelected = (data.guides || []).includes(guide._id || guide.id);
              return (
                <div
                  key={guide._id || guide.id}
                  onClick={() => toggleGuide(guide._id || guide.id)}
                  className={cn(
                    'rounded-lg border p-4 cursor-pointer transition-all',
                    isSelected
                      ? 'border-[var(--cms-primary)] bg-[var(--cms-primary)]/5'
                      : 'border-[var(--cms-border)] bg-white hover:border-[var(--cms-primary)]/50'
                  )}
                >
                  <div className="flex items-start gap-3">
                    {guide.image && (
                      <div className="w-12 h-12 rounded-full overflow-hidden flex-shrink-0">
                        <img
                          src={guide.image}
                          alt={guide.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <h4 className="text-sm font-medium text-[var(--cms-foreground)]">{guide.name}</h4>
                        {isSelected && (
                          <div className="w-5 h-5 rounded-full bg-[var(--cms-primary)] flex items-center justify-center flex-shrink-0">
                            <Check className="h-3 w-3 text-white" />
                          </div>
                        )}
                      </div>
                      <p className="text-xs text-[var(--cms-muted-foreground)] mt-1">{guide.role}</p>
                      {guide.experience && (
                        <p className="text-xs text-[var(--cms-muted-foreground)] mt-1">
                          {guide.experience} experience
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {(data.guides || []).length > 0 && (
          <div className="mt-4">
            <p className="text-xs text-[var(--cms-muted-foreground)] mb-2">
              Selected guides ({(data.guides || []).length}):
            </p>
            <div className="flex flex-wrap gap-2">
              {(data.guides || []).map((guideId) => {
                const guide = guides.find((g) => (g._id || g.id) === guideId);
                if (!guide) return null;
                return (
                  <Badge
                    key={guideId}
                    variant="outline"
                    className="border-[var(--cms-primary)] text-[var(--cms-primary)]"
                  >
                    {guide.name}
                    <button
                      type="button"
                      onClick={() => toggleGuide(guideId)}
                      className="ml-2 hover:text-red-500"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Departures */}
      <div className="space-y-4">
        <div>
          <h3 className="text-sm font-semibold text-[var(--cms-foreground)]">Departures</h3>
          <p className="text-xs text-[var(--cms-muted-foreground)]">
            Choose specific dates or a recurring schedule (e.g. daily, every Wednesday, every 15th of the month).
          </p>
        </div>

        <div className="space-y-2">
          <Label className="text-xs font-medium">Schedule type</Label>
          <Select
            value={data.departureScheduleType || 'specific_dates'}
            onValueChange={(value: 'specific_dates' | 'recurring') => {
              updateData({
                departureScheduleType: value,
                recurrenceRule: value === 'recurring' ? (data.recurrenceRule || { frequency: 'daily' }) : undefined,
              });
            }}
          >
            <SelectTrigger className="w-full max-w-xs border-[var(--cms-border)] bg-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="specific_dates">Specific dates (add one by one)</SelectItem>
              <SelectItem value="recurring">Recurring schedule (daily, weekly, monthly)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {(data.departureScheduleType || 'specific_dates') === 'recurring' ? (
          <div className="rounded-lg border border-[var(--cms-border)] bg-[var(--cms-muted)] p-4 space-y-4">
            <div className="space-y-2">
              <Label className="text-xs font-medium">Frequency</Label>
              <Select
                value={data.recurrenceRule?.frequency || 'daily'}
                onValueChange={(value: 'daily' | 'weekly' | 'monthly') =>
                  updateData({
                    recurrenceRule: {
                      ...data.recurrenceRule,
                      frequency: value,
                      weekdays: value === 'weekly' ? (data.recurrenceRule?.weekdays ?? []) : undefined,
                      monthDay: value === 'monthly' ? data.recurrenceRule?.monthDay : undefined,
                    },
                  })
                }
              >
                <SelectTrigger className="w-full max-w-xs border-[var(--cms-border)] bg-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Every day</SelectItem>
                  <SelectItem value="weekly">Every week (choose days)</SelectItem>
                  <SelectItem value="monthly">Every month (choose day of month)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {data.recurrenceRule?.frequency === 'weekly' && (
              <div className="space-y-2">
                <Label className="text-xs font-medium">Days of the week</Label>
                <div className="flex flex-wrap gap-2">
                  {[
                    { value: 0, label: 'Sun' },
                    { value: 1, label: 'Mon' },
                    { value: 2, label: 'Tue' },
                    { value: 3, label: 'Wed' },
                    { value: 4, label: 'Thu' },
                    { value: 5, label: 'Fri' },
                    { value: 6, label: 'Sat' },
                  ].map(({ value, label }) => {
                    const weekdays = data.recurrenceRule?.weekdays ?? [];
                    const checked = weekdays.includes(value);
                    return (
                      <label
                        key={value}
                        className={cn(
                          'inline-flex items-center gap-1.5 rounded-md border px-3 py-2 text-sm cursor-pointer transition-colors',
                          checked
                            ? 'border-[var(--cms-primary)] bg-[var(--cms-primary)]/10 text-[var(--cms-foreground)]'
                            : 'border-[var(--cms-border)] bg-white hover:bg-[var(--cms-muted)]'
                        )}
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => {
                            const next = checked
                              ? weekdays.filter((d) => d !== value)
                              : [...weekdays, value].sort((a, b) => a - b);
                            updateData({ recurrenceRule: { ...data.recurrenceRule, weekdays: next } });
                          }}
                          className="sr-only"
                        />
                        {label}
                      </label>
                    );
                  })}
                </div>
                <p className="text-xs text-[var(--cms-muted-foreground)]">Select which weekdays this trip runs.</p>
              </div>
            )}

            {data.recurrenceRule?.frequency === 'monthly' && (
              <div className="space-y-2">
                <Label className="text-xs font-medium">Day of month (1–31)</Label>
                <Input
                  type="number"
                  min={1}
                  max={31}
                  value={data.recurrenceRule?.monthDay ?? ''}
                  onChange={(e) => {
                    const v = e.target.value ? parseInt(e.target.value, 10) : undefined;
                    updateData({
                      recurrenceRule: {
                        ...data.recurrenceRule,
                        monthDay: v && v >= 1 && v <= 31 ? v : undefined,
                      },
                    });
                  }}
                  placeholder="e.g. 15"
                  className="w-24 border-[var(--cms-border)] bg-white"
                />
                <p className="text-xs text-[var(--cms-muted-foreground)]">Trip runs on this day every month (e.g. 15 = 15th of each month).</p>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs font-medium">Valid from (optional)</Label>
                <Input
                  type="date"
                  value={data.recurrenceRule?.validFrom ?? ''}
                  onChange={(e) =>
                    updateData({
                      recurrenceRule: { ...data.recurrenceRule, validFrom: e.target.value || undefined },
                    })
                  }
                  className="border-[var(--cms-border)] bg-white"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-medium">Valid to (optional)</Label>
                <Input
                  type="date"
                  value={data.recurrenceRule?.validTo ?? ''}
                  onChange={(e) =>
                    updateData({
                      recurrenceRule: { ...data.recurrenceRule, validTo: e.target.value || undefined },
                    })
                  }
                  className="border-[var(--cms-border)] bg-white"
                />
              </div>
            </div>
            <p className="text-xs text-[var(--cms-muted-foreground)]">
              Departure dates are generated automatically on the trip detail page's Dates & Prices section (e.g. every day, or every chosen weekday/month day) for the next 24 months, or within the valid range if set.
            </p>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between">
              <p className="text-xs text-[var(--cms-muted-foreground)]">
                Add one or more departure dates (end date optional).
              </p>
              <Button
                type="button"
                variant="outline"
                className="border-[var(--cms-border)] bg-white hover:bg-[var(--cms-muted)] gap-2"
                onClick={addDeparture}
              >
                <Plus size={14} />
                Add Departure
              </Button>
            </div>

            {departures.length === 0 ? (
              <div className="rounded-lg border border-dashed border-[var(--cms-border)] bg-[var(--cms-muted)] p-4 text-sm text-[var(--cms-muted-foreground)]">
                No departures added yet.
              </div>
            ) : (
              <div className="space-y-3">
                {departures.map((departure, index) => (
                  <div
                    key={`departure-${index}`}
                    className="rounded-lg border border-[var(--cms-border)] bg-white p-4"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 flex-1">
                        <div className="space-y-2">
                          <Label className="text-xs font-medium">Start Date *</Label>
                          <Input
                            type="date"
                            value={departure.startDate}
                            onChange={(e) => updateDeparture(index, { startDate: e.target.value })}
                            className="border-[var(--cms-border)] focus:border-[var(--cms-primary)]"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-xs font-medium">End Date (Optional)</Label>
                          <Input
                            type="date"
                            value={departure.endDate || ''}
                            onChange={(e) => updateDeparture(index, { endDate: e.target.value })}
                            className="border-[var(--cms-border)] focus:border-[var(--cms-primary)]"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-xs font-medium">Price Override</Label>
                          <Input
                            type="number"
                            min="0"
                            value={departure.pricePerPerson || ''}
                            onChange={(e) => updateDeparture(index, { pricePerPerson: e.target.value })}
                            placeholder="Use trip price"
                            className="border-[var(--cms-border)] focus:border-[var(--cms-primary)]"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-xs font-medium">Total Seats</Label>
                          <Input
                            type="number"
                            min="1"
                            value={departure.totalSeats || ''}
                            onChange={(e) => updateDeparture(index, { totalSeats: e.target.value })}
                            className="border-[var(--cms-border)] focus:border-[var(--cms-primary)]"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-xs font-medium">Seats Available</Label>
                          <Input
                            type="number"
                            min="0"
                            value={departure.seatsAvailable || ''}
                            onChange={(e) => updateDeparture(index, { seatsAvailable: e.target.value })}
                            className="border-[var(--cms-border)] focus:border-[var(--cms-primary)]"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-xs font-medium">Status</Label>
                          <Select
                            value={departure.status || 'scheduled'}
                            onValueChange={(value) =>
                              updateDeparture(index, {
                                status: value as 'scheduled' | 'sold_out' | 'cancelled',
                              })
                            }
                          >
                            <SelectTrigger className="h-9 border-[var(--cms-border)] bg-white text-sm">
                              <SelectValue placeholder="Status" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="scheduled">Scheduled</SelectItem>
                              <SelectItem value="sold_out">Sold Out</SelectItem>
                              <SelectItem value="cancelled">Cancelled</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeDeparture(index)}
                        className="rounded-full p-2 text-[var(--cms-muted-foreground)] hover:bg-[var(--cms-muted)]"
                        aria-label="Remove departure"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
