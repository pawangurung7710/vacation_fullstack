import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { TripStepper, TripDraft, StepId } from './TripStepper';
import { BasicsStep } from './steps/BasicsStep';
import { MediaStep } from './steps/MediaStep';
import { DetailsStep } from './steps/DetailsStep';
import { ItineraryStep } from './steps/ItineraryStep';
import { ReviewStep } from './steps/ReviewStep';
import { toast } from 'sonner';
import { tripsApi } from '../../services/api';
import { normalizeItineraryDays } from '../../utils/itinerary';

export function TripCreatePage() {
  const navigate = useNavigate();
  const draftIdKey = 'trip-draft-id';
  const resolveDraftId = (data?: TripDraft) =>
    data?.id || data?._id || localStorage.getItem(draftIdKey) || '';
  useEffect(() => {
    localStorage.removeItem('trip-draft');
    localStorage.removeItem('trip-draft-preview');
    localStorage.removeItem('trip-step-new');
    localStorage.removeItem(draftIdKey);
  }, []);
  const serializeDepartures = (departures: TripDraft['departures']) =>
    (departures || [])
      .filter((departure) => departure.startDate)
      .map((departure) => ({
        startDate: new Date(departure.startDate).toISOString(),
        endDate: departure.endDate ? new Date(departure.endDate).toISOString() : undefined,
        pricePerPerson:
          departure.pricePerPerson !== undefined && departure.pricePerPerson !== ''
            ? Number(departure.pricePerPerson)
            : undefined,
        totalSeats:
          departure.totalSeats !== undefined && departure.totalSeats !== ''
            ? Number(departure.totalSeats)
            : undefined,
        seatsAvailable:
          departure.seatsAvailable !== undefined && departure.seatsAvailable !== ''
            ? Number(departure.seatsAvailable)
            : undefined,
        status: departure.status || undefined,
      }));

  const buildHighlightGallery = (data: TripDraft) =>
    data.highlightGallery && data.highlightGallery.length > 0
      ? data.highlightGallery.map((item) => ({
          image: item.image,
          caption: item.caption || '',
        }))
      : data.gallery.map((image) => ({ image, caption: '' }));

  const handleSaveDraft = async (data: TripDraft) => {
    // Save to localStorage as backup
    localStorage.setItem('trip-draft', JSON.stringify(data));

    const draftId = resolveDraftId(data);
    const normalizedPrice = data.price !== '' ? Number(data.price) : undefined;
    const normalizedDuration = data.duration || undefined;
    const normalizedDifficulty = data.difficulty || undefined;
    const normalizedDescription = data.description?.trim() ? data.description : undefined;
    const normalizedMaxGroupSize = data.maxGroupSize !== '' ? Number(data.maxGroupSize) : undefined;
    const normalizedTitle = data.title?.trim() ? data.title : undefined;
    const normalizedSlug = data.slug?.trim() ? data.slug : undefined;
    const normalizedItinerary = normalizeItineraryDays(data.itinerary);
    const normalizedHighlightGallery = buildHighlightGallery(data);

    const payload = {
      title: normalizedTitle,
      slug: normalizedSlug,
      categoryId: data.categoryId,
      subcategoryId: data.subcategoryId,
      regionId: data.regionId,
      countryId: data.countryId,
      country: data.country,
      region: data.region,
      duration: normalizedDuration,
      difficulty: normalizedDifficulty as any,
      price: normalizedPrice,
      status: 'draft',
      featured: data.featured,
      image: data.mainImage,
      brochureUrl: data.brochureUrl?.trim() || undefined,
      gallery: data.gallery,
      highlightGallery: normalizedHighlightGallery,
      description: normalizedDescription,
      highlights: data.highlights,
      sustainabilityBadges: data.sustainabilityBadges,
      maxGroupSize: normalizedMaxGroupSize,
      season: data.season || undefined,
      distance: data.distance || undefined,
      transport: data.transport || undefined,
      heroSubtitle: data.heroSubtitle || undefined,
      faqs: data.faqs || undefined,
      departureScheduleType: data.departureScheduleType || 'specific_dates',
      recurrenceRule: data.departureScheduleType === 'recurring' && data.recurrenceRule?.frequency
        ? {
            frequency: data.recurrenceRule.frequency,
            weekdays: data.recurrenceRule.weekdays ?? [],
            monthDay: data.recurrenceRule.monthDay,
            validFrom: data.recurrenceRule.validFrom ? new Date(data.recurrenceRule.validFrom).toISOString() : undefined,
            validTo: data.recurrenceRule.validTo ? new Date(data.recurrenceRule.validTo).toISOString() : undefined,
          }
        : undefined,
      departures: data.departureScheduleType === 'recurring' ? [] : serializeDepartures(data.departures),
      inclusions: data.inclusions,
      exclusions: data.exclusions,
      itinerary: normalizedItinerary,
      pricingTitle: data.pricingTitle || undefined,
      pricingDescription: data.pricingDescription || undefined,
      guidesSectionTitle: data.guidesSectionTitle || undefined,
      guidesSectionSubtitle: data.guidesSectionSubtitle || undefined,
      guidesQuote: data.guidesQuote || undefined,
      guidesQuoteAuthor: data.guidesQuoteAuthor || undefined,
      guidesSafetyStatement: data.guidesSafetyStatement || undefined,
      itineraryTitle: data.itineraryTitle || undefined,
      itineraryDescription: data.itineraryDescription || undefined,
      accommodationAndMeals: data.accommodationAndMeals,
      beforeYouBook: data.beforeYouBook || undefined,
      comfortAddOns: data.comfortAddOns || undefined,
      offeredAddOns: data.offeredAddOns || [],
      guides: data.guides || undefined,
    };

    try {
      if (draftId) {
        await tripsApi.update(draftId, payload);
      } else {
        const created = await tripsApi.create(payload);
        const createdId = created?.id || created?._id;
        if (createdId) {
          localStorage.setItem(draftIdKey, createdId);
          localStorage.setItem('trip-draft', JSON.stringify({ ...data, id: createdId }));
        }
      }
    } catch (error) {
      console.error('Save draft error:', error);
    }
  };

  const handlePublish = async (data: TripDraft) => {
    const draftId = resolveDraftId(data);
    const normalizedTitle = data.title?.trim() ? data.title : undefined;
    const normalizedSlug = data.slug?.trim() ? data.slug : undefined;
    const normalizedItinerary = normalizeItineraryDays(data.itinerary);
    const normalizedHighlightGallery = buildHighlightGallery(data);

    const payload = {
      title: normalizedTitle,
      slug: normalizedSlug,
      categoryId: data.categoryId,
      subcategoryId: data.subcategoryId,
      regionId: data.regionId,
      countryId: data.countryId,
      country: data.country,
      region: data.region,
      duration: data.duration,
      difficulty: data.difficulty as any,
      price: Number(data.price),
      status: 'published',
      featured: data.featured,
      image: data.mainImage,
      brochureUrl: data.brochureUrl?.trim() || undefined,
      gallery: data.gallery,
      description: data.description,
      highlights: data.highlights,
      sustainabilityBadges: data.sustainabilityBadges,
      maxGroupSize: Number(data.maxGroupSize || 0),
      season: data.season || undefined,
      distance: data.distance || undefined,
      transport: data.transport || undefined,
      heroSubtitle: data.heroSubtitle || undefined,
      faqs: data.faqs || undefined,
      departureScheduleType: data.departureScheduleType || 'specific_dates',
      recurrenceRule: data.departureScheduleType === 'recurring' && data.recurrenceRule?.frequency
        ? {
            frequency: data.recurrenceRule.frequency,
            weekdays: data.recurrenceRule.weekdays ?? [],
            monthDay: data.recurrenceRule.monthDay,
            validFrom: data.recurrenceRule.validFrom ? new Date(data.recurrenceRule.validFrom).toISOString() : undefined,
            validTo: data.recurrenceRule.validTo ? new Date(data.recurrenceRule.validTo).toISOString() : undefined,
          }
        : undefined,
      departures: data.departureScheduleType === 'recurring' ? [] : serializeDepartures(data.departures),
      inclusions: data.inclusions,
      exclusions: data.exclusions,
      itinerary: normalizedItinerary,
      pricingTitle: data.pricingTitle || undefined,
      pricingDescription: data.pricingDescription || undefined,
      guidesSectionTitle: data.guidesSectionTitle || undefined,
      guidesSectionSubtitle: data.guidesSectionSubtitle || undefined,
      guidesQuote: data.guidesQuote || undefined,
      guidesQuoteAuthor: data.guidesQuoteAuthor || undefined,
      guidesSafetyStatement: data.guidesSafetyStatement || undefined,
      itineraryTitle: data.itineraryTitle || undefined,
      itineraryDescription: data.itineraryDescription || undefined,
      accommodationAndMeals: data.accommodationAndMeals,
      beforeYouBook: data.beforeYouBook || undefined,
      comfortAddOns: data.comfortAddOns || undefined,
      offeredAddOns: data.offeredAddOns || [],
      guides: data.guides || undefined,
      highlightGallery: normalizedHighlightGallery,
    };
    try {
      if (draftId) {
        await tripsApi.update(draftId, payload);
      } else {
        await tripsApi.create(payload);
      }
      toast.success('Trip published successfully');
      localStorage.removeItem('trip-draft');
      localStorage.removeItem('trip-draft-preview');
      localStorage.removeItem('trip-step-new');
      localStorage.removeItem(draftIdKey);
      navigate('/cms/trips');
    } catch (error) {
      toast.error('Failed to publish trip');
    }
  };

  return (
    <TripStepper
      onSaveDraft={handleSaveDraft}
      onPublish={handlePublish}
      mode="create"
    >
      {(step, data, updateData, setStep, errors) => {
        switch (step) {
          case 'basics':
            return <BasicsStep data={data} updateData={updateData} errors={errors} />;
          case 'media':
            return <MediaStep data={data} updateData={updateData} errors={errors} />;
          case 'details':
            return <DetailsStep data={data} updateData={updateData} errors={errors} />;
          case 'itinerary':
            return <ItineraryStep data={data} updateData={updateData} errors={errors} />;
          case 'review':
            return (
              <ReviewStep
                data={data}
                updateData={updateData}
                onEditStep={(stepId) => setStep(stepId as StepId)}
              />
            );
          default:
            return null;
        }
      }}
    </TripStepper>
  );
}
