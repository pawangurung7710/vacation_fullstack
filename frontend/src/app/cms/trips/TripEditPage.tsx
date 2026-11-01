import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { TripStepper, TripDraft, StepId } from './TripStepper';
import { BasicsStep } from './steps/BasicsStep';
import { MediaStep } from './steps/MediaStep';
import { DetailsStep } from './steps/DetailsStep';
import { ItineraryStep } from './steps/ItineraryStep';
import { ReviewStep } from './steps/ReviewStep';
import { toast } from 'sonner';
import { Skeleton } from '../../components/ui/skeleton';
import { tripsApi } from '../../services/api';
import { normalizeItineraryDays } from '../../utils/itinerary';

export function TripEditPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [initialData, setInitialData] = useState<Partial<TripDraft>>();
  const [initialStep, setInitialStep] = useState<StepId>();
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

  useEffect(() => {
    const loadTrip = async () => {
      if (!id) {
        navigate('/cms/trips');
        return;
      }

      const localDraft = localStorage.getItem(`trip-draft-${id}`);
      const localStep = localStorage.getItem(`trip-step-${id}`);
      if (localDraft) {
        setInitialData(JSON.parse(localDraft));
        if (localStep) {
          setInitialStep(localStep as StepId);
        }
        setLoading(false);
        return;
      }

      try {
        const trip = await tripsApi.getById(id);
        if (trip) {
          const highlightGalleryFromTrip =
            trip.highlightGallery?.length > 0
              ? trip.highlightGallery
              : (trip.gallery || []).map((image: string) => ({ image, caption: '' }));
          const galleryFromTrip = highlightGalleryFromTrip.map((item) => item.image).filter(Boolean);
          setInitialData({
            id: trip.id || trip._id || id,
            title: trip.title,
            slug: trip.slug,
            categoryId: trip.categoryId || trip.category?.id || trip.category?._id || '',
            subcategoryId: trip.subcategoryId || trip.subcategory?.id || trip.subcategory?._id || '',
            categoryLabel: trip.categoryLabel || trip.category?.label || '',
            subcategoryLabel: trip.subcategoryLabel || trip.subcategory?.label || '',
            regionId: trip.regionId || trip.regionInfo?.id || trip.regionRef?._id || '',
            regionLabel: trip.regionLabel || trip.regionInfo?.name || '',
            region: trip.region || trip.regionLabel || trip.regionInfo?.name || '',
            countryId: trip.countryId || trip.countryInfo?.id || trip.countryRef?._id || '',
            countryLabel: trip.countryLabel || trip.countryInfo?.name || '',
            country: trip.country || trip.countryLabel || trip.countryInfo?.name || '',
            duration: String(trip.duration),
            difficulty: trip.difficulty,
            price: String(trip.price),
            status: trip.status,
            featured: trip.featured,
            mainImage: trip.image || trip.featuredImage,
            brochureUrl: trip.brochureUrl || '',
            // Add defaults for other fields
            gallery: galleryFromTrip,
            highlightGallery: highlightGalleryFromTrip,
            description: trip.description || '',
            highlights: trip.highlights || [],
            inclusions: trip.inclusions || [],
            exclusions: trip.exclusions || [],
            sustainabilityBadges: trip.sustainabilityBadges || [],
            maxGroupSize: String(trip.maxGroupSize || ''),
            season: trip.season || '',
            distance: trip.distance || '',
            transport: trip.transport || '',
            heroSubtitle: trip.heroSubtitle || '',
            faqs: trip.faqs || [],
            departureScheduleType: trip.departureScheduleType || 'specific_dates',
            recurrenceRule: {
              frequency: trip.recurrenceRule?.frequency,
              weekdays: trip.recurrenceRule?.weekdays ?? [],
              monthDay: trip.recurrenceRule?.monthDay,
              validFrom: trip.recurrenceRule?.validFrom ? String(trip.recurrenceRule.validFrom).slice(0, 10) : undefined,
              validTo: trip.recurrenceRule?.validTo ? String(trip.recurrenceRule.validTo).slice(0, 10) : undefined,
            },
            departures: trip.departureScheduleType === 'recurring'
              ? []
              : (trip.departures || []).map((departure: any) => ({
              startDate: departure.startDate ? String(departure.startDate).slice(0, 10) : '',
              endDate: departure.endDate ? String(departure.endDate).slice(0, 10) : '',
              pricePerPerson: departure.pricePerPerson ? String(departure.pricePerPerson) : '',
              totalSeats: departure.totalSeats ? String(departure.totalSeats) : '',
              seatsAvailable: departure.seatsAvailable ? String(departure.seatsAvailable) : '',
              status: departure.status || 'scheduled',
            })),
            itinerary: trip.itinerary || [],
            accommodationAndMeals: trip.accommodationAndMeals || undefined,
            beforeYouBook: trip.beforeYouBook || undefined,
            comfortAddOns: trip.comfortAddOns || undefined,
            offeredAddOns: (trip.offeredAddOns || []).map((a: any) => (typeof a === 'string' ? a : a?._id)).filter(Boolean),
            guides: trip.guides ? trip.guides.map((g: any) => g._id || g.id || g) : [],
            itineraryTitle: trip.itineraryTitle || 'Daily Itinerary',
            itineraryDescription:
              trip.itineraryDescription || 'Each day brings new landscapes, cultures, and connections',
          });
        }
      } catch (error) {
        toast.error('Trip not found');
        navigate('/cms/trips');
      } finally {
        setLoading(false);
      }
    };

    loadTrip();
  }, [id, navigate]);

  const handleSaveDraft = async (data: TripDraft) => {
    if (!id) return;
    
    localStorage.setItem(`trip-draft-${id}`, JSON.stringify(data));
    
    const normalizedItinerary = normalizeItineraryDays(data.itinerary);
    try {
      const normalizedHighlightGallery = buildHighlightGallery(data);
      await tripsApi.update(id, {
        title: data.title,
        slug: data.slug,
        categoryId: data.categoryId,
        subcategoryId: data.subcategoryId,
        regionId: data.regionId,
        countryId: data.countryId,
        country: data.country,
        region: data.region,
        duration: data.duration,
        difficulty: data.difficulty as any,
        price: Number(data.price),
        status: data.status,
        featured: data.featured,
        image: data.mainImage,
        brochureUrl: data.brochureUrl?.trim() || undefined,
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
      });
      localStorage.removeItem(`trip-draft-${id}`);
      localStorage.removeItem(`trip-step-${id}`);
    } catch (error) {
      console.error('Save draft error:', error);
    }
  };

  const handlePublish = async (data: TripDraft) => {
    if (!id) return;
    
    const normalizedItinerary = normalizeItineraryDays(data.itinerary);
    try {
      const normalizedHighlightGallery = buildHighlightGallery(data);
      await tripsApi.update(id, {
        title: data.title,
        slug: data.slug,
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
      });
      localStorage.removeItem(`trip-draft-${id}`);
      localStorage.removeItem(`trip-step-${id}`);
      toast.success('Trip updated successfully');
      navigate('/cms/trips');
    } catch (error) {
      toast.error('Failed to update trip');
    }
  };

  if (loading) {
    return (
      <div className="bg-[var(--cms-background)] p-8">
        <div className="max-w-6xl mx-auto space-y-4">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  if (!initialData) {
    return null;
  }

  return (
    <TripStepper
      initialData={initialData}
      initialStep={initialStep}
      onSaveDraft={handleSaveDraft}
      onPublish={handlePublish}
      mode="edit"
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
