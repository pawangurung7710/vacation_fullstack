import mongoose from 'mongoose';
import Trip from '../models/Trip.js';
import Booking from '../models/Booking.js';
import Category from '../models/Category.js';
import Region from '../models/Region.js';
import Country from '../models/Country.js';
import { generateSlug } from '../utils/slugify.js';

const isObjectId = (value) => mongoose.Types.ObjectId.isValid(value);

/**
 * Detail-page-only fields, excluded from list responses. A category/listing page renders
 * cards (title, image, price, region, next departure, badges) and never touches these, but
 * they make up the bulk of a trip document — `itinerary`, the long-form "before you book"
 * / accommodation / trip-notes blocks, FAQs, galleries, and the section copy. Dropping them
 * from list queries takes a typical list response from ~500KB to ~15-20KB.
 */
const TRIP_LIST_EXCLUDED_FIELDS = [
  '__v',
  'createdBy',
  'itinerary',
  'faqs',
  'beforeYouBook',
  'accommodationAndMeals',
  'comfortAddOns',
  'tripNotes',
  'highlightGallery',
  'zeroWasteNotes',
  'brochureUrl',
  'guidesSectionTitle',
  'guidesSectionSubtitle',
  'guidesQuote',
  'guidesQuoteAuthor',
  'guidesSafetyStatement',
  'pricingTitle',
  'pricingDescription',
  'itineraryTitle',
  'itineraryDescription',
]
  .map((field) => `-${field}`)
  .join(' ');

/**
 * Max number of upcoming departures to embed per trip in a LIST response. Recurring trips
 * expand to hundreds of dates over 24 months; a card only needs the next handful, and the
 * calendar/listing pages only ever read the first upcoming one. The detail endpoint still
 * returns the full expansion.
 */
const TRIP_LIST_DEPARTURE_LIMIT = 12;

const buildCategoryInfo = (categoryDoc) => {
  if (!categoryDoc || !categoryDoc._id) return null;
  const { _id, label, slug } = categoryDoc;
  return {
    id: _id,
    label,
    slug,
  };
};

const buildRegionInfo = (regionDoc) => {
  if (!regionDoc || !regionDoc._id) return null;
  const { _id, name } = regionDoc;
  return {
    id: _id,
    name,
  };
};

const buildCountryInfo = (countryDoc) => {
  if (!countryDoc || !countryDoc._id) return null;
  const { _id, name } = countryDoc;
  return {
    id: _id,
    name,
  };
};

/**
 * Expand recurrenceRule into concrete departure dates for the next 24 months (or
 * validFrom–validTo). Pass `maxCount` to stop once that many dates have been generated —
 * dates are produced in chronological order, so this yields the next N departures.
 */
const expandRecurrenceToDepartures = (tripObj, { maxCount = Infinity } = {}) => {
  const rule = tripObj.recurrenceRule;
  if (!rule || !rule.frequency) return [];

  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const from = rule.validFrom ? new Date(rule.validFrom) : startOfToday;
  const to = rule.validTo
    ? new Date(rule.validTo)
    : new Date(now.getFullYear(), now.getMonth() + 24, now.getDate());

  const effectiveFrom = from < startOfToday ? startOfToday : from;
  if (effectiveFrom > to) return [];

  const price = tripObj.price != null ? Number(tripObj.price) : 0;
  const seats = tripObj.maxGroupSize != null ? Number(tripObj.maxGroupSize) : 12;
  const departures = [];

  const addDate = (date) => {
    if (departures.length >= maxCount) return;
    if (date < effectiveFrom || date > to) return;
    departures.push({
      startDate: new Date(date),
      endDate: null,
      pricePerPerson: price,
      totalSeats: seats,
      seatsAvailable: seats,
      status: 'scheduled',
      badges: tripObj.sustainabilityBadges || [],
    });
  };

  if (rule.frequency === 'daily') {
    for (let d = new Date(effectiveFrom); d <= to && departures.length < maxCount; d.setDate(d.getDate() + 1)) {
      addDate(new Date(d));
    }
  } else if (rule.frequency === 'weekly' && Array.isArray(rule.weekdays) && rule.weekdays.length > 0) {
    const weekdaysSet = new Set((rule.weekdays || []).map((d) => Number(d)).filter((d) => d >= 0 && d <= 6));
    for (let d = new Date(effectiveFrom); d <= to && departures.length < maxCount; d.setDate(d.getDate() + 1)) {
      if (weekdaysSet.has(d.getDay())) addDate(new Date(d));
    }
  } else if (rule.frequency === 'monthly') {
    const monthDay = Number(rule.monthDay);
    if (!Number.isInteger(monthDay) || monthDay < 1 || monthDay > 31) {
      return departures;
    }
    const y = effectiveFrom.getFullYear();
    const m = effectiveFrom.getMonth();
    for (let year = y; year <= to.getFullYear() && departures.length < maxCount; year++) {
      const monthStart = year === y ? m : 0;
      const monthEnd = year === to.getFullYear() ? to.getMonth() : 11;
      for (let month = monthStart; month <= monthEnd && departures.length < maxCount; month++) {
        const lastDay = new Date(year, month + 1, 0).getDate();
        const day = Math.min(monthDay, lastDay);
        const date = new Date(year, month, day);
        if (date >= effectiveFrom && date <= to) addDate(date);
      }
    }
  }

  return departures.sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());
};

const normalizeTripResponse = (trip, { list = false } = {}) => {
  // Use lean() equivalent or handle populated documents properly
  let tripObj;
  if (typeof trip.toObject === 'function') {
    // Use toObject with options to preserve populated fields
    tripObj = trip.toObject({ virtuals: true, getters: true });
  } else {
    tripObj = { ...trip };
  }

  const categoryInfo = buildCategoryInfo(tripObj.category);
  const subcategoryInfo = buildCategoryInfo(tripObj.subcategory);
  const regionInfo = buildRegionInfo(tripObj.regionRef);
  const countryInfo = buildCountryInfo(tripObj.countryRef);

  // In list mode, only ever materialize the next handful of departures per trip.
  const departureLimit = list ? TRIP_LIST_DEPARTURE_LIMIT : Infinity;

  let departures;
  if (tripObj.departureScheduleType === 'recurring' && tripObj.recurrenceRule?.frequency) {
    departures = expandRecurrenceToDepartures(tripObj, { maxCount: departureLimit });
  } else {
    departures = Array.isArray(tripObj.departures) ? tripObj.departures : [];
  }

  const now = new Date();

  if (list && departures.length > TRIP_LIST_DEPARTURE_LIMIT) {
    departures = departures
      .filter((departure) => departure?.startDate)
      .slice()
      .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());
    const firstUpcoming = departures.findIndex((d) => new Date(d.startDate) >= now);
    const from = firstUpcoming === -1 ? Math.max(0, departures.length - TRIP_LIST_DEPARTURE_LIMIT) : firstUpcoming;
    departures = departures.slice(from, from + TRIP_LIST_DEPARTURE_LIMIT);
  }
  const sortedDepartures = departures
    .filter((departure) => departure?.startDate)
    .slice()
    .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());
  const nextDeparture =
    sortedDepartures.find((departure) => new Date(departure.startDate) >= now) ||
    sortedDepartures[0] ||
    null;

  // Preserve guides array - check if guides are populated objects or just IDs
  let guides = [];
  if (Array.isArray(tripObj.guides)) {
    guides = tripObj.guides.map((guide) => {
      // If guide is a populated object with _id and other fields
      if (guide && typeof guide === 'object' && guide._id && guide.name) {
        return guide;
      }
      // If guide is just an ObjectId or string ID, skip it (shouldn't happen if populated)
      return null;
    }).filter(Boolean);
  }

  // Ensure recurrenceRule and serialized dates are always in the response (for CMS prefill and the public trip detail page)
  const recurrenceRule = tripObj.recurrenceRule
    ? {
        frequency: tripObj.recurrenceRule.frequency,
        weekdays: tripObj.recurrenceRule.weekdays || [],
        monthDay: tripObj.recurrenceRule.monthDay,
        validFrom: tripObj.recurrenceRule.validFrom ?? null,
        validTo: tripObj.recurrenceRule.validTo ?? null,
      }
    : undefined;
  const serializedDepartures = departures.map((d) => ({
    ...d,
    startDate: d.startDate instanceof Date ? d.startDate.toISOString() : d.startDate,
    endDate: d.endDate instanceof Date ? d.endDate.toISOString() : d.endDate ?? null,
  }));

  return {
    ...tripObj,
    recurrenceRule,
    departures: serializedDepartures,
    category: categoryInfo,
    subcategory: subcategoryInfo,
    regionInfo,
    countryInfo,
    guides, // Explicitly preserve guides
    nextDepartureDate: nextDeparture?.startDate || null,
    nextDeparture,
    categoryId: categoryInfo?.id || tripObj.category || null,
    subcategoryId: subcategoryInfo?.id || tripObj.subcategory || null,
    regionId: regionInfo?.id || tripObj.regionRef || null,
    countryId: countryInfo?.id || tripObj.countryRef || null,
    categoryLabel: categoryInfo?.label || null,
    categorySlug: categoryInfo?.slug || null,
    subcategoryLabel: subcategoryInfo?.label || null,
    subcategorySlug: subcategoryInfo?.slug || null,
    regionLabel: regionInfo?.name || tripObj.region || null,
    region: tripObj.region || regionInfo?.name || null,
    countryLabel: countryInfo?.name || tripObj.country || null,
    country: tripObj.country || countryInfo?.name || null,
    highlightGallery: Array.isArray(tripObj.highlightGallery)
      ? tripObj.highlightGallery
      : [],
  };
};

const resolveCategoryBySlug = async (slug, parentId) => {
  if (!slug) return null;
  const query = { slug };
  if (parentId) query.parent = parentId;
  return Category.findOne(query);
};

const resolveCategoryInputs = async (tripData) => {
  const update = {};

  const rawCategory = tripData.categoryId;
  const rawSubcategory = tripData.subcategoryId;
  const categorySlug = tripData.categorySlug;
  const subcategorySlug = tripData.subcategorySlug;

  if (rawCategory && isObjectId(rawCategory)) {
    update.category = rawCategory;
  } else if (categorySlug) {
    const categoryDoc = await resolveCategoryBySlug(categorySlug);
    if (categoryDoc) {
      update.category = categoryDoc._id;
    }
  }

  if (rawSubcategory && isObjectId(rawSubcategory)) {
    if (update.category) {
      const subcategoryDoc = await Category.findOne({
        _id: rawSubcategory,
        parent: update.category,
      });
      if (!subcategoryDoc) {
        throw new Error('Subcategory does not belong to the selected category');
      }
    }
    update.subcategory = rawSubcategory;
  } else if (subcategorySlug) {
    const subSlug = subcategorySlug;
    const subcategoryDoc = await resolveCategoryBySlug(subSlug, update.category);
    if (subcategoryDoc) {
      update.subcategory = subcategoryDoc._id;
    }
  }

  return { update };
};

const resolveRegionInputs = async (tripData) => {
  const update = {};
  const rawRegion = tripData.regionId;

  if (rawRegion && isObjectId(rawRegion)) {
    const regionDoc = await Region.findById(rawRegion);
    if (regionDoc) {
      update.regionRef = regionDoc._id;
      if (!tripData.region) {
        update.region = regionDoc.name;
      }
    }
  } else if (tripData.region) {
    const regionDoc = await Region.findOne({
      name: { $regex: `^${tripData.region}$`, $options: 'i' },
    });
    if (regionDoc) {
      update.regionRef = regionDoc._id;
    }
    update.region = tripData.region;
  }

  return { update };
};

const resolveCountryInputs = async (tripData) => {
  const update = {};
  const rawCountry = tripData.countryId;

  if (rawCountry && isObjectId(rawCountry)) {
    const countryDoc = await Country.findById(rawCountry);
    if (countryDoc) {
      update.countryRef = countryDoc._id;
      if (!tripData.country) {
        update.country = countryDoc.name;
      }
    }
  } else if (tripData.country) {
    const countryDoc = await Country.findOne({
      name: { $regex: `^${tripData.country}$`, $options: 'i' },
    });
    if (countryDoc) {
      update.countryRef = countryDoc._id;
    }
    update.country = tripData.country;
  }

  return { update };
};

const stripCategoryInputs = (tripData) => {
  const sanitized = { ...tripData };
  delete sanitized.category;
  delete sanitized.categoryId;
  delete sanitized.categorySlug;
  delete sanitized.subcategory;
  delete sanitized.subcategoryId;
  delete sanitized.subcategorySlug;
  return sanitized;
};

const stripRegionInputs = (tripData) => {
  const sanitized = { ...tripData };
  delete sanitized.regionId;
  delete sanitized.regionRef;
  return sanitized;
};

const stripCountryInputs = (tripData) => {
  const sanitized = { ...tripData };
  delete sanitized.countryId;
  delete sanitized.countryRef;
  return sanitized;
};

const getNextDuplicateSuffix = async (baseSlug) => {
  const regex = new RegExp(`^${baseSlug}(?:-(\\d+))?$`, 'i');
  const existing = await Trip.find({ slug: { $regex: `^${baseSlug}(-\\d+)?$`, $options: 'i' } })
    .select('slug')
    .lean();
  let maxSuffix = 1;
  existing.forEach((trip) => {
    const match = trip.slug?.match(regex);
    if (!match) return;
    if (match[1]) {
      const value = Number(match[1]);
      if (Number.isFinite(value)) {
        maxSuffix = Math.max(maxSuffix, value);
      }
    }
  });
  return Math.max(2, maxSuffix + 1);
};

/**
 * Get all trips with filtering, pagination, and search
 */
export const getTrips = async (filters = {}, pagination = {}) => {
  const {
    categoryId,
    categorySlug,
    subcategoryId,
    subcategorySlug,
    regionId,
    countryId,
    country,
    region,
    difficulty,
    status,
    featured,
    search,
    minPrice,
    maxPrice,
    minDuration,
    maxDuration,
    minDepartureDate,
    maxDepartureDate,
    sort = 'createdAt',
    order = 'desc',
  } = filters;

  // Query params arrive as strings; coerce and clamp so `.skip()` / `.limit()` never get
  // NaN and a caller can't ask for 100k documents.
  const page = Math.max(1, parseInt(pagination.page, 10) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(pagination.limit, 10) || 10));

  // Build query
  const query = {};
  const andConditions = [];

  // Default to published trips only if status not explicitly set
  if (status === 'all') {
    // no status filter for CMS views
  } else if (status) {
    query.status = status;
  } else {
    query.status = 'published';
  }

  if (country) query.country = country;
  if (region) query.region = region;
  if (difficulty) query.difficulty = difficulty;
  if (featured !== undefined) query.featured = featured;
  if (minPrice !== undefined || maxPrice !== undefined) {
    query.price = {};
    if (minPrice !== undefined) query.price.$gte = Number(minPrice);
    if (maxPrice !== undefined) query.price.$lte = Number(maxPrice);
  }

  let resolvedCategoryId = null;
  if (categoryId || categorySlug) {
    const categoryConditions = [];
    if (categoryId && isObjectId(categoryId)) {
      categoryConditions.push({ category: categoryId });
      resolvedCategoryId = categoryId;
    } else {
      const resolvedCategory = await resolveCategoryBySlug(categorySlug);
      if (resolvedCategory) {
        categoryConditions.push({ category: resolvedCategory._id });
        resolvedCategoryId = resolvedCategory._id;
      }
    }
    if (categoryConditions.length) andConditions.push({ $or: categoryConditions });
  }

  if (subcategorySlug || subcategoryId) {
    const subSlug = subcategorySlug || subcategoryId;
    const subcategoryConditions = [];
    if (subSlug && isObjectId(subSlug)) {
      subcategoryConditions.push({ subcategory: subSlug });
    } else if (subSlug) {
      const resolvedSubcategory = await resolveCategoryBySlug(subSlug, resolvedCategoryId);
      if (resolvedSubcategory) subcategoryConditions.push({ subcategory: resolvedSubcategory._id });
    }
    if (subcategoryConditions.length) andConditions.push({ $or: subcategoryConditions });
  }

  if (regionId) {
    const regionConditions = [];
    if (regionId && isObjectId(regionId)) {
      regionConditions.push({ regionRef: regionId });
    }
    if (regionConditions.length) andConditions.push({ $or: regionConditions });
  }

  if (countryId) {
    const countryConditions = [];
    if (countryId && isObjectId(countryId)) {
      countryConditions.push({ countryRef: countryId });
    }
    if (countryConditions.length) andConditions.push({ $or: countryConditions });
  }

  if (minDuration !== undefined || maxDuration !== undefined) {
    const durationExpr = [];
    if (minDuration !== undefined) {
      durationExpr.push({
        $gte: [
          {
            $convert: {
              input: '$duration',
              to: 'double',
              onError: null,
              onNull: null,
            },
          },
          Number(minDuration),
        ],
      });
    }
    if (maxDuration !== undefined) {
      durationExpr.push({
        $lte: [
          {
            $convert: {
              input: '$duration',
              to: 'double',
              onError: null,
              onNull: null,
            },
          },
          Number(maxDuration),
        ],
      });
    }

    if (durationExpr.length) {
      andConditions.push({ $expr: { $and: durationExpr } });
    }
  }

  if (minDepartureDate || maxDepartureDate) {
    const departureRange = {};
    if (minDepartureDate) {
      departureRange.$gte = new Date(minDepartureDate);
    }
    if (maxDepartureDate) {
      departureRange.$lte = new Date(maxDepartureDate);
    }
    // Include trips with specific dates in range OR recurring (they have dates every day/week/month)
    query.$and = query.$and || [];
    query.$and.push({
      $or: [
        { departures: { $elemMatch: { startDate: departureRange } } },
        { departureScheduleType: 'recurring' },
      ],
    });
  }

  // Search in title, description, region
  if (search) {
    query.$or = [
      { title: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
      { region: { $regex: search, $options: 'i' } },
    ];
  }

  if (andConditions.length) {
    query.$and = andConditions;
  }

  // Calculate pagination
  const skip = (page - 1) * limit;

  // Build sort object
  const sortObj = {};
  sortObj[sort] = order === 'asc' ? 1 : -1;

  // Execute query.
  // List responses omit detail-only fields and admin-only relations (createdBy, guides),
  // and read as plain objects (.lean()) — no Mongoose hydration for rows we only serialize.
  const [trips, total] = await Promise.all([
    Trip.find(query)
      .select(TRIP_LIST_EXCLUDED_FIELDS)
      .sort(sortObj)
      .skip(skip)
      .limit(limit)
      .populate('category', 'label slug')
      .populate('subcategory', 'label slug')
      .populate('regionRef', 'name')
      .populate('countryRef', 'name')
      .lean(),
    Trip.countDocuments(query),
  ]);

  return {
    trips: trips.map((trip) => normalizeTripResponse(trip, { list: true })),
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  };
};

/**
 * Get trip by ID
 */
export const getTripById = async (tripId) => {
  const trip = await Trip.findById(tripId)
    .populate('createdBy', 'name email')
    .populate('category', 'label slug')
    .populate('subcategory', 'label slug')
    .populate('regionRef', 'name')
    .populate('countryRef', 'name')
    .populate('guides', 'name role experience languages imageUrl quote')
    .populate('offeredAddOns');
  if (!trip) {
    throw new Error('Trip not found');
  }
  return normalizeTripResponse(trip);
};

/**
 * Get trip by slug
 */
export const getTripBySlug = async (slug) => {
  const trip = await Trip.findOne({ slug, status: 'published' })
    .populate('createdBy', 'name email')
    .populate('category', 'label slug')
    .populate('subcategory', 'label slug')
    .populate('regionRef', 'name')
    .populate('countryRef', 'name')
    .populate('guides', 'name role experience languages imageUrl quote')
    .populate('offeredAddOns');
  if (!trip) {
    throw new Error('Trip not found');
  }
  return normalizeTripResponse(trip);
};

/**
 * Increment the view count for a published trip.
 * Accepts either a Mongo ObjectId or a slug (the public detail route uses :id,
 * but useTrip may resolve via slug). Uses an atomic $inc and only counts
 * published trips so admin/draft previews don't inflate the number.
 * Returns the new view count, or null if no matching published trip exists.
 */
export const incrementTripViews = async (idOrSlug) => {
  if (!idOrSlug) return null;
  const conditions = [{ slug: idOrSlug }];
  if (isObjectId(idOrSlug)) {
    conditions.push({ _id: idOrSlug });
  }
  const trip = await Trip.findOneAndUpdate(
    { $or: conditions, status: 'published' },
    { $inc: { views: 1 } },
    { new: true, select: 'views' }
  );
  return trip ? trip.views : null;
};

/**
 * Create new trip
 */
export const createTrip = async (tripData, userId) => {
  const { update } = await resolveCategoryInputs(tripData);
  const { update: regionUpdate } = await resolveRegionInputs(tripData);
  const { update: countryUpdate } = await resolveCountryInputs(tripData);
  const sanitizedTripData = stripCountryInputs(stripRegionInputs(stripCategoryInputs(tripData)));
  const trip = new Trip({
    ...sanitizedTripData,
    ...update,
    ...regionUpdate,
    ...countryUpdate,
    createdBy: userId,
  });

  // Generate slug if not provided
  if (!trip.slug) {
    trip.slug = generateSlug(trip.title);
  }

  await trip.save();
  const populated = await trip.populate([
    { path: 'createdBy', select: 'name email' },
    { path: 'category', select: 'label slug' },
    { path: 'subcategory', select: 'label slug' },
    { path: 'regionRef', select: 'name' },
    { path: 'countryRef', select: 'name' },
    { path: 'guides', select: 'name role experience languages imageUrl quote' },
  ]);
  return normalizeTripResponse(populated);
};

/**
 * Update trip
 */
export const updateTrip = async (tripId, updateData, userId) => {
  const trip = await Trip.findById(tripId);
  if (!trip) {
    throw new Error('Trip not found');
  }

  // Regenerate slug if title changed and no custom slug was provided
  if (updateData.title && updateData.title !== trip.title && !updateData.slug) {
    updateData.slug = generateSlug(updateData.title);
  }

  const { update } = await resolveCategoryInputs(updateData);
  const { update: regionUpdate } = await resolveRegionInputs(updateData);
  const { update: countryUpdate } = await resolveCountryInputs(updateData);
  const sanitizedUpdateData = stripCountryInputs(stripRegionInputs(stripCategoryInputs(updateData)));
  Object.assign(trip, sanitizedUpdateData, update, regionUpdate, countryUpdate);
  if (sanitizedUpdateData.recurrenceRule != null) {
    trip.markModified('recurrenceRule');
  }
  if (sanitizedUpdateData.departureScheduleType === 'specific_dates') {
    trip.recurrenceRule = {};
    trip.markModified('recurrenceRule');
  }
  await trip.save();

  const populated = await trip.populate([
    { path: 'createdBy', select: 'name email' },
    { path: 'category', select: 'label slug' },
    { path: 'subcategory', select: 'label slug' },
    { path: 'regionRef', select: 'name' },
    { path: 'countryRef', select: 'name' },
    { path: 'guides', select: 'name role experience languages imageUrl quote' },
  ]);
  return normalizeTripResponse(populated);
};

/**
 * Delete trip
 */
export const deleteTrip = async (tripId) => {
  const trip = await Trip.findById(tripId);
  if (!trip) {
    throw new Error('Trip not found');
  }
  
  const tripObjectId = mongoose.Types.ObjectId.isValid(tripId)
    ? new mongoose.Types.ObjectId(tripId)
    : trip._id;

  const bookingCount = await Booking.countDocuments({ trip: tripObjectId });
  if (bookingCount > 0) {
    const error = new Error(
      'Cannot delete trip. There is a client booking associated with this trip. Please archive this to hide it from the website pages.'
    );
    error.statusCode = 400;
    throw error;
  }

  await trip.deleteOne();
  return trip;
};

/**
 * Duplicate trip
 */
export const duplicateTrip = async (tripId, userId) => {
  const originalTrip = await Trip.findById(tripId);
  if (!originalTrip) {
    throw new Error('Trip not found');
  }

  const tripData = originalTrip.toObject();
  delete tripData._id;
  delete tripData.createdAt;
  delete tripData.updatedAt;

  const baseTitle = tripData.title;
  const baseSlug = tripData.slug || generateSlug(tripData.title);
  const nextSuffix = await getNextDuplicateSuffix(baseSlug);

  tripData.title = `${baseTitle} - ${nextSuffix}`;
  tripData.slug = `${baseSlug}-${nextSuffix}`;
  tripData.status = 'draft';
  tripData.createdBy = userId;

  const newTrip = new Trip(tripData);
  await newTrip.save();

  const populated = await newTrip.populate([
    { path: 'createdBy', select: 'name email' },
    { path: 'category', select: 'label slug' },
    { path: 'subcategory', select: 'label slug' },
    { path: 'regionRef', select: 'name' },
    { path: 'countryRef', select: 'name' },
  ]);
  return normalizeTripResponse(populated);
};

/**
 * Bulk update trips
 */
export const bulkUpdateTrips = async (updates) => {
  const operations = await Promise.all(
    updates.map(async (update) => {
      const updateData = update.data || {};
      const { update: resolved } = await resolveCategoryInputs(updateData);
      const { update: resolvedRegion } = await resolveRegionInputs(updateData);
      const { update: resolvedCountry } = await resolveCountryInputs(updateData);
      const sanitizedUpdateData = stripCountryInputs(stripRegionInputs(stripCategoryInputs(updateData)));

      return {
        updateOne: {
          filter: { _id: update.id },
          update: { ...sanitizedUpdateData, ...resolved, ...resolvedRegion, ...resolvedCountry },
        },
      };
    })
  );

  const result = await Trip.bulkWrite(operations);
  return result;
};
