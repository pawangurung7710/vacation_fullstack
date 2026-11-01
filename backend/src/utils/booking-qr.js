import crypto from 'crypto';
import qrcode from 'qrcode';

const getQrSecret = () => process.env.BOOKING_QR_SECRET || process.env.JWT_SECRET || 'trekkers-booking-qr';

export const generateBookingQrToken = (bookingId, tripId) => {
  const payload = `${bookingId}.${tripId}`;
  return crypto.createHmac('sha256', getQrSecret()).update(payload).digest('base64url');
};

export const verifyBookingQrToken = (token, bookingId, tripId) => {
  if (!token || !bookingId || !tripId) return false;
  const expected = generateBookingQrToken(bookingId, tripId);
  if (expected.length !== token.length) return false;
  return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(token));
};

export const buildBookingQrUrl = (bookingId, tripId, token) => {
  const baseUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
  const query = token ? `?token=${encodeURIComponent(token)}` : '';
  return `${baseUrl}/trip/${tripId}/booking/${bookingId}${query}`;
};

export const generateBookingQrDataUrl = async (qrUrl) => {
  if (!qrUrl) return null;
  return qrcode.toDataURL(qrUrl, {
    margin: 1,
    width: 280,
    color: {
      dark: '#1f4d4f',
      light: '#ffffff',
    },
  });
};
