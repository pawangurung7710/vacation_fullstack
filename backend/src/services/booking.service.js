import Booking from '../models/Booking.js';
import Trip from '../models/Trip.js';
import AddOn from '../models/AddOn.js';
import * as promotionService from './promotion.service.js';

const ADD_ON_DISCOUNT_RATE = 0.1;

const isSameDay = (a, b) => {
  const da = new Date(a);
  const db = new Date(b);
  return (
    da.getUTCFullYear() === db.getUTCFullYear() &&
    da.getUTCMonth() === db.getUTCMonth() &&
    da.getUTCDate() === db.getUTCDate()
  );
};

const round2 = (n) => Math.round((Number(n) + Number.EPSILON) * 100) / 100;

/**
 * Recompute the booking bill server-side from trusted data:
 * - base price comes from the matched departure (falls back to trip.price)
 * - each add-on's unit price is resolved from its AddOn record (never the client)
 * - the 10% multi add-on discount applies only to discount-eligible add-ons
 * - promo discount is derived from the promotion record, not the client
 *
 * Returns { totalPrice, promoDiscount, addOns } to persist.
 */
export const computeBookingBill = async ({ trip, departureDate, guests, addOns = [], promotion = null }) => {
  const participantCount = Math.max(1, Number(guests) || 1);

  const departures = Array.isArray(trip.departures) ? trip.departures : [];
  const matchedDeparture = departureDate
    ? departures.find((d) => d?.startDate && isSameDay(d.startDate, departureDate))
    : null;
  const basePrice = Number(
    matchedDeparture?.pricePerPerson != null ? matchedDeparture.pricePerPerson : trip.price
  ) || 0;
  const baseTotal = basePrice * participantCount;

  const ids = [...new Set((addOns || []).map((a) => a?.id).filter(Boolean))];
  const records = ids.length ? await AddOn.find({ _id: { $in: ids }, status: 'active' }) : [];
  const recordById = new Map(records.map((r) => [String(r._id), r]));

  const resolvedAddOns = [];
  for (const incoming of addOns || []) {
    const record = incoming?.id ? recordById.get(String(incoming.id)) : null;
    if (!record) continue; // drop unknown / inactive add-ons

    let unitPrice = 0;
    let optionLabel;
    if (record.pricingType === 'choice') {
      const options = record.options || [];
      const match =
        (incoming.optionLabel && options.find((o) => o.label === incoming.optionLabel)) || null;
      if (match) {
        unitPrice = Number(match.price) || 0;
        optionLabel = match.label;
      } else {
        // no valid selection -> treat as the cheapest / zero option
        unitPrice = 0;
        optionLabel = incoming.optionLabel || undefined;
      }
    } else {
      unitPrice = Number(record.price) || 0;
    }

    resolvedAddOns.push({
      id: String(record._id),
      title: record.title,
      kind: record.kind,
      type: record.activityType,
      optionLabel,
      duration: record.duration,
      location: record.location,
      discountEligible: record.discountEligible !== false,
      price: round2(unitPrice),
    });
  }

  const addOnsSubtotal = resolvedAddOns.reduce((sum, a) => sum + a.price * participantCount, 0);
  const addOnDiscount = resolvedAddOns.reduce(
    (sum, a) => sum + (a.discountEligible ? a.price * participantCount * ADD_ON_DISCOUNT_RATE : 0),
    0
  );

  const subtotalBeforePromo = Math.max(baseTotal + addOnsSubtotal - addOnDiscount, 0);

  let promoDiscount = 0;
  if (promotion && subtotalBeforePromo > 0) {
    if (promotion.discountType === 'percentage') {
      promoDiscount = subtotalBeforePromo * (Number(promotion.discountValue) / 100);
    } else {
      promoDiscount = Number(promotion.discountValue) || 0;
    }
    promoDiscount = Math.min(subtotalBeforePromo, Math.max(promoDiscount, 0));
  }

  const totalPrice = Math.max(subtotalBeforePromo - promoDiscount, 0);

  return {
    totalPrice: round2(totalPrice),
    promoDiscount: round2(promoDiscount),
    addOns: resolvedAddOns,
  };
};

/**
 * Get all bookings with filtering and pagination
 */
export const getBookings = async (filters = {}, pagination = {}) => {
  const { status, paymentStatus, trip, user } = filters;
  const { page = 1, limit = 10 } = pagination;

  const query = {};

  if (status) query.status = status;
  if (paymentStatus) query.paymentStatus = paymentStatus;
  if (trip) query.trip = trip;
  if (user) query.user = user;

  const skip = (page - 1) * limit;

  const [bookings, total] = await Promise.all([
    Booking.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('trip', 'title slug image price')
      .populate('user', 'name email'),
    Booking.countDocuments(query),
  ]);

  return {
    bookings,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  };
};

/**
 * Get bookings belonging to a single user, for their own "my trips" view.
 * Deliberately separate from getBookings (used by the admin listing) so that endpoint's
 * query shape and populate fields never change for existing (production) callers.
 */
export const getBookingsForUser = async (userId, filters = {}, pagination = {}) => {
  const { status, paymentStatus } = filters;
  const { page = 1, limit = 10 } = pagination;

  const query = { user: userId };
  if (status) query.status = status;
  if (paymentStatus) query.paymentStatus = paymentStatus;

  const skip = (page - 1) * limit;

  const [bookings, total] = await Promise.all([
    Booking.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('trip', 'title slug image price region country duration'),
    Booking.countDocuments(query),
  ]);

  return {
    bookings,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  };
};

/**
 * Get booking by ID
 */
export const getBookingById = async (bookingId) => {
  const booking = await Booking.findById(bookingId)
    .populate({
      path: 'trip',
      populate: [
        { path: 'category', select: 'label slug' },
        { path: 'subcategory', select: 'label slug' },
        { path: 'regionRef', select: 'name slug' },
        { path: 'createdBy', select: 'name email' },
      ],
    })
    .populate('promotion', 'code title discountType discountValue type')
    .populate('user', 'name email');
  if (!booking) {
    throw new Error('Booking not found');
  }
  return booking;
};

export const getBookingConfirmationById = async (bookingId) => {
  const booking = await Booking.findById(bookingId)
    .populate('trip', 'title image region country duration price departures')
    .populate('promotion', 'code title discountType discountValue type')
    .populate('user', 'name email');
  if (!booking) {
    throw new Error('Booking not found');
  }
  return booking;
};

/**
 * Create new booking
 */
export const createBooking = async (bookingData, userId = null) => {
  // Verify trip exists
  const trip = await Trip.findById(bookingData.trip);
  if (!trip) {
    throw new Error('Trip not found');
  }

  let promotion = null;
  if (bookingData.promoCode) {
    promotion = await promotionService.validatePromoCode(bookingData.promoCode, bookingData.trip);
  }

  // Server-authoritative bill: never trust the client for money.
  const bill = await computeBookingBill({
    trip,
    departureDate: bookingData.departureDate,
    guests: bookingData.numberOfParticipants,
    addOns: bookingData.addOns || [],
    promotion,
  });

  if (
    bookingData.totalPrice != null &&
    Math.abs(Number(bookingData.totalPrice) - bill.totalPrice) > 1
  ) {
    console.warn(
      `[booking] client total ${bookingData.totalPrice} != server total ${bill.totalPrice} for trip ${bookingData.trip}`
    );
  }

  const booking = new Booking({
    ...bookingData,
    user: userId,
    departureDate: new Date(bookingData.departureDate),
    promotion: promotion?._id,
    addOns: bill.addOns,
    promoDiscount: bill.promoDiscount,
    totalPrice: bill.totalPrice,
  });

  await booking.save();
  await booking.populate('trip', 'title slug image price');
  await booking.populate('promotion', 'code title discountType discountValue type');
  return booking;
};

/**
 * Update booking
 */
export const updateBooking = async (bookingId, updateData) => {
  const booking = await Booking.findById(bookingId);
  if (!booking) {
    throw new Error('Booking not found');
  }

  if (updateData.departureDate) {
    updateData.departureDate = new Date(updateData.departureDate);
  }

  Object.assign(booking, updateData);
  await booking.save();

  await booking.populate('trip', 'title slug image price');
  await booking.populate('user', 'name email');
  return booking;
};

/**
 * Delete booking
 */
export const deleteBooking = async (bookingId) => {
  const booking = await Booking.findByIdAndDelete(bookingId);
  if (!booking) {
    throw new Error('Booking not found');
  }
  return booking;
};
