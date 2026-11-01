import crypto from 'crypto';

const getTokenSecret = () => process.env.RENTAL_ORDER_TOKEN_SECRET || process.env.JWT_SECRET || 'trekkers-rental-order';

export const generateRentalOrderToken = (orderId) => {
  return crypto.createHmac('sha256', getTokenSecret()).update(orderId).digest('base64url');
};

export const verifyRentalOrderToken = (token, orderId) => {
  if (!token || !orderId) return false;
  const expected = generateRentalOrderToken(orderId);
  if (expected.length !== token.length) return false;
  return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(token));
};
