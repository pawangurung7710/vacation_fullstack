import NewsletterSubscription from '../models/NewsletterSubscription.js';

export const subscribe = async ({ email, source }) => {
  const normalizedEmail = String(email || '').trim().toLowerCase();
  const normalizedSource = String(source || 'unknown').trim() || 'unknown';

  const existing = await NewsletterSubscription.findOne({ email: normalizedEmail });
  if (existing) {
    if (existing.status !== 'subscribed') {
      existing.status = 'subscribed';
      existing.unsubscribedAt = undefined;
      existing.subscribedAt = new Date();
    }
    if (normalizedSource && normalizedSource !== 'unknown' && existing.source === 'unknown') {
      existing.source = normalizedSource;
    }
    await existing.save();
    return { subscription: existing, created: false };
  }

  const created = new NewsletterSubscription({
    email: normalizedEmail,
    source: normalizedSource,
    status: 'subscribed',
    subscribedAt: new Date(),
  });
  await created.save();
  return { subscription: created, created: true };
};

export const getAll = async (filters = {}, pagination = {}) => {
  const { search, source, status } = filters;
  const { page = 1, limit = 25 } = pagination;

  const query = {};
  if (source) query.source = source;
  if (status) query.status = status;
  if (search) {
    query.$or = [{ email: { $regex: search, $options: 'i' } }, { source: { $regex: search, $options: 'i' } }];
  }

  const skip = (page - 1) * limit;
  const [subscriptions, total] = await Promise.all([
    NewsletterSubscription.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit),
    NewsletterSubscription.countDocuments(query),
  ]);

  return {
    subscriptions,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  };
};

export const getById = async (id) => {
  const subscription = await NewsletterSubscription.findById(id);
  if (!subscription) {
    throw new Error('Newsletter subscription not found');
  }
  return subscription;
};

export const deleteById = async (id) => {
  const subscription = await NewsletterSubscription.findByIdAndDelete(id);
  if (!subscription) {
    throw new Error('Newsletter subscription not found');
  }
  return subscription;
};

