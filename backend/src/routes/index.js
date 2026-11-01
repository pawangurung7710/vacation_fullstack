import express from 'express';
import authRoutes from './auth.routes.js';
import tripRoutes from './trip.routes.js';
import bookingRoutes from './booking.routes.js';
import blogRoutes from './blog.routes.js';
import adminBlogRoutes from './admin.blog.routes.js';
import contactRoutes from './contact.routes.js';
import testimonialRoutes from './testimonial.routes.js';
import teamRoutes from './team.routes.js';
import guideRoutes from './guide.routes.js';
import impactRoutes from './impact.routes.js';
import pageRoutes from './page.routes.js';
import navigationRoutes from './navigation.routes.js';
import mediaRoutes from './media.routes.js';
import categoryRoutes from './category.routes.js';
import regionRoutes from './region.routes.js';
import countryRoutes from './country.routes.js';
import promotionRoutes from './promotion.routes.js';
import faqRoutes from './faq.routes.js';
import donutEconomicsRoutes from './donutEconomics.routes.js';
import actionPlanRoutes from './actionPlan.routes.js';
import sustainabilityVisionRoutes from './sustainabilityVision.routes.js';
import newsletterSubscriptionRoutes from './newsletterSubscription.routes.js';
import rentalCategoryRoutes from './rentalCategory.routes.js';
import rentalProductRoutes from './rentalProduct.routes.js';
import rentalOrderRoutes from './rentalOrder.routes.js';
import settingRoutes from './setting.routes.js';
import addOnRoutes from './addOn.routes.js';

const router = express.Router();

// Health check
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'API is running',
    timestamp: new Date().toISOString(),
  });
});

// API routes
router.use('/auth', authRoutes);
router.use('/trips', tripRoutes);
router.use('/bookings', bookingRoutes);
router.use('/blog', blogRoutes);
router.use('/blogs', blogRoutes);
router.use('/admin/blogs', adminBlogRoutes);
router.use('/contact', contactRoutes);
router.use('/testimonials', testimonialRoutes);
router.use('/team', teamRoutes);
router.use('/guides', guideRoutes);
router.use('/impact', impactRoutes);
router.use('/pages', pageRoutes);
router.use('/navigation', navigationRoutes);
router.use('/media', mediaRoutes);
router.use('/categories', categoryRoutes);
router.use('/regions', regionRoutes);
router.use('/countries', countryRoutes);
router.use('/promotions', promotionRoutes);
router.use('/faqs', faqRoutes);
router.use('/donut-economics', donutEconomicsRoutes);
router.use('/action-plans', actionPlanRoutes);
router.use('/sustainability-visions', sustainabilityVisionRoutes);
router.use('/newsletter-subscriptions', newsletterSubscriptionRoutes);
router.use('/rental-categories', rentalCategoryRoutes);
router.use('/rental-products', rentalProductRoutes);
router.use('/rental-orders', rentalOrderRoutes);
router.use('/settings', settingRoutes);
router.use('/add-ons', addOnRoutes);

export default router;
