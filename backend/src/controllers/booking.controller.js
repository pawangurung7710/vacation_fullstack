import * as bookingService from '../services/booking.service.js';
import * as emailService from '../services/email.service.js';
import { buildBookingQrUrl, generateBookingQrToken, generateBookingQrDataUrl, verifyBookingQrToken } from '../utils/booking-qr.js';
import { sendSuccess, sendCreated } from '../utils/response.js';

/**
 * Get all bookings
 */
export const getBookings = async (req, res, next) => {
  try {
    const { bookings, pagination } = await bookingService.getBookings(req.query, {
      page: req.query.page,
      limit: req.query.limit,
    });

    return sendSuccess(res, 'Bookings retrieved successfully', bookings, { pagination });
  } catch (error) {
    next(error);
  }
};

/**
 * Get bookings for the authenticated user
 */
export const getMyBookings = async (req, res, next) => {
  try {
    const { bookings, pagination } = await bookingService.getBookingsForUser(
      req.user.id,
      { status: req.query.status, paymentStatus: req.query.paymentStatus },
      { page: req.query.page, limit: req.query.limit },
    );

    return sendSuccess(res, 'Bookings retrieved successfully', bookings, { pagination });
  } catch (error) {
    next(error);
  }
};

/**
 * Get a single booking belonging to the authenticated user, with full trip detail and
 * a fresh QR (mirrors getBookingById's response shape/enrichment but is reachable by any
 * signed-in user for their own booking, not just admins). Deliberately its own handler
 * rather than a modification to getBookingById/adminOnly's route, so that endpoint's
 * production behavior is untouched.
 */
export const getMyBookingById = async (req, res, next) => {
  try {
    const booking = await bookingService.getBookingById(req.params.id);
    const ownerId = booking.user?._id?.toString() || booking.user?.toString();
    if (!ownerId || ownerId !== req.user.id) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    const tripId = booking.trip?._id?.toString() || booking.trip?.toString();
    const qrToken = tripId ? generateBookingQrToken(booking._id.toString(), tripId) : null;
    const qrUrl = tripId && qrToken ? buildBookingQrUrl(booking._id.toString(), tripId, qrToken) : null;
    const qrImage = qrUrl ? await generateBookingQrDataUrl(qrUrl) : null;
    const bookingResponse = booking.toObject({ virtuals: true });
    bookingResponse.qrToken = qrToken;
    bookingResponse.qrUrl = qrUrl;
    bookingResponse.qrImage = qrImage;
    return sendSuccess(res, 'Booking retrieved successfully', bookingResponse);
  } catch (error) {
    next(error);
  }
};

/**
 * Get booking by ID
 */
export const getBookingById = async (req, res, next) => {
  try {
    const booking = await bookingService.getBookingById(req.params.id);
    const tripId = booking.trip?._id?.toString() || booking.trip?.toString();
    const qrToken = tripId ? generateBookingQrToken(booking._id.toString(), tripId) : null;
    const qrUrl = tripId && qrToken ? buildBookingQrUrl(booking._id.toString(), tripId, qrToken) : null;
    const qrImage = qrUrl ? await generateBookingQrDataUrl(qrUrl) : null;
    const bookingResponse = booking.toObject({ virtuals: true });
    bookingResponse.qrToken = qrToken;
    bookingResponse.qrUrl = qrUrl;
    bookingResponse.qrImage = qrImage;
    return sendSuccess(res, 'Booking retrieved successfully', bookingResponse);
  } catch (error) {
    next(error);
  }
};

/**
 * Get booking confirmation (public)
 */
export const getBookingConfirmation = async (req, res, next) => {
  try {
    const booking = await bookingService.getBookingConfirmationById(req.params.id);
    const tripId = req.query.tripId;
    const token = req.query.token;
    if (!tripId || !booking.trip || booking.trip._id.toString() !== tripId) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }
    if (!verifyBookingQrToken(token, booking._id.toString(), tripId)) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }
    const qrToken = generateBookingQrToken(booking._id.toString(), tripId);
    const qrUrl = buildBookingQrUrl(booking._id.toString(), tripId, qrToken);
    const qrImage = await generateBookingQrDataUrl(qrUrl);
    const bookingResponse = booking.toObject({ virtuals: true });
    bookingResponse.qrToken = qrToken;
    bookingResponse.qrUrl = qrUrl;
    bookingResponse.qrImage = qrImage;
    return sendSuccess(res, 'Booking retrieved successfully', bookingResponse);
  } catch (error) {
    next(error);
  }
};

/**
 * Create new booking
 */
export const createBooking = async (req, res, next) => {
  try {
    const userId = req.user ? req.user.id : null;
    const booking = await bookingService.createBooking(req.body, userId);
    const tripId = booking.trip?._id?.toString() || booking.trip?.toString();
    const qrToken = tripId ? generateBookingQrToken(booking._id.toString(), tripId) : null;
    const qrUrl = tripId && qrToken ? buildBookingQrUrl(booking._id.toString(), tripId, qrToken) : null;

    const guestName = booking.guestInfo?.name || booking.user?.name || 'Guest';
    const guestEmail = booking.guestInfo?.email || booking.user?.email;
    const guestPhone = booking.guestInfo?.phone;
    const bookingDetails = {
      tripTitle: booking.trip.title,
      departureDate: booking.departureDate,
      numberOfParticipants: booking.numberOfParticipants,
      totalPrice: booking.totalPrice,
      status: booking.status,
      paymentStatus: booking.paymentStatus,
      specialRequests: booking.specialRequests,
      notes: booking.notes,
      guestName,
      guestEmail,
      guestPhone,
      qrUrl,
    };

    // Send notification email to admin
    try {
      await emailService.sendBookingAdminNotificationEmail(bookingDetails);
    } catch (emailError) {
      console.error('Error sending booking admin notification email:', emailError);
    }

    // Send confirmation email to guest if email provided
    if (guestEmail) {
      try {
        await emailService.sendBookingConfirmationEmail(guestEmail, guestName, bookingDetails);
      } catch (emailError) {
        console.error('Error sending booking confirmation email:', emailError);
      }
    }

    const bookingResponse = booking.toObject({ virtuals: true });
    bookingResponse.qrToken = qrToken;
    bookingResponse.qrUrl = qrUrl;
    return sendCreated(res, 'Booking created successfully', bookingResponse);
  } catch (error) {
    next(error);
  }
};

/**
 * Update booking
 */
export const updateBooking = async (req, res, next) => {
  try {
    const existingBooking = await bookingService.getBookingById(req.params.id);
    const booking = await bookingService.updateBooking(req.params.id, req.body);

    const email = booking.guestInfo?.email || booking.user?.email;
    const name = booking.guestInfo?.name || booking.user?.name || 'Guest';
    const bookingDetails = {
      tripTitle: booking.trip?.title || existingBooking.trip?.title,
      departureDate: booking.departureDate,
      numberOfParticipants: booking.numberOfParticipants,
      totalPrice: booking.totalPrice,
      status: booking.status,
      paymentStatus: booking.paymentStatus,
    };

    if (email && existingBooking.status !== booking.status) {
      try {
        await emailService.sendBookingStatusUpdateEmail(email, name, bookingDetails);
      } catch (emailError) {
        console.error('Error sending booking status update email:', emailError);
      }
    }

    if (email && existingBooking.paymentStatus !== booking.paymentStatus) {
      try {
        await emailService.sendPaymentStatusUpdateEmail(email, name, bookingDetails);
      } catch (emailError) {
        console.error('Error sending payment status update email:', emailError);
      }
    }
    return sendSuccess(res, 'Booking updated successfully', booking);
  } catch (error) {
    next(error);
  }
};

/**
 * Delete booking
 */
export const deleteBooking = async (req, res, next) => {
  try {
    await bookingService.deleteBooking(req.params.id);
    return sendSuccess(res, 'Booking deleted successfully');
  } catch (error) {
    next(error);
  }
};
