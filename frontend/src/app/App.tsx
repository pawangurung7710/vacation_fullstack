import React, { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { HomePage } from './pages/home-page';
const DynamicCategoryPage = lazy(() => import('./pages/dynamic-category-page').then((m) => ({ default: m.DynamicCategoryPage })));
const DynamicSubcategoryPage = lazy(() => import('./pages/dynamic-subcategory-page').then((m) => ({ default: m.DynamicSubcategoryPage })));
const AboutPage = lazy(() => import('./pages/about-page').then((m) => ({ default: m.AboutPage })));
const AllTripsPage = lazy(() => import('./pages/all-trips-page').then((m) => ({ default: m.AllTripsPage })));
const TripDetailPage = lazy(() => import('./pages/trip-detail-page').then((m) => ({ default: m.TripDetailPage })));
const TripCalendarPage = lazy(() => import('./pages/trip-calendar-page').then((m) => ({ default: m.TripCalendarPage })));
const TripComparisonPage = lazy(() => import('./pages/trip-comparison-page').then((m) => ({ default: m.TripComparisonPage })));
const ContactPage = lazy(() => import('./pages/contact-page').then((m) => ({ default: m.ContactPage })));
const BlogPage = lazy(() => import('./pages/blog-page').then((m) => ({ default: m.BlogPage })));
const BlogDetailPage = lazy(() => import('./pages/blog-detail-page').then((m) => ({ default: m.BlogDetailPage })));
const TripDetailsFormPage = lazy(() => import('./pages/trip-details-form-page').then((m) => ({ default: m.TripDetailsFormPage })));
const TripNotesPage = lazy(() => import('./pages/trip-notes-page').then((m) => ({ default: m.TripNotesPage })));
const CheckoutPage = lazy(() => import('./pages/checkout-page').then((m) => ({ default: m.CheckoutPage })));
const BookingConfirmationPage = lazy(() => import('./pages/booking-confirmation-page').then((m) => ({ default: m.BookingConfirmationPage })));
const BookingPublicPage = lazy(() => import('./pages/booking-public-page').then((m) => ({ default: m.BookingPublicPage })));
import { Toaster } from './components/ui/sonner';
import { EnhancedNavigation } from './components/enhanced-navigation';
import { Footer } from './components/footer';
import { ScrollToTop } from './components/scroll-to-top';
import { SeoHead } from './components/SeoHead';
import { getSeoForPath, DEFAULT_SEO } from './config/seo';
import { preloadHomepageContent, settingsApi } from './services/api';
import { MaintenancePage } from './pages/maintenance-page';

// About Pages
const TeamPage = lazy(() => import('./pages/about/team-page').then((m) => ({ default: m.TeamPage })));
// CMS Pages
const LoginPage = lazy(() => import('./pages/cms/login-page').then((m) => ({ default: m.LoginPage })));
const CmsLayout = lazy(() => import('./cms/layout/CmsLayout').then((m) => ({ default: m.CmsLayout })));
const DashboardPage = lazy(() => import('./cms/pages/DashboardPage').then((m) => ({ default: m.DashboardPage })));
const TripsListPage = lazy(() => import('./cms/pages/TripsListPage').then((m) => ({ default: m.TripsListPage })));
const TripCategoriesPage = lazy(() => import('./cms/pages/TripCategoriesPage').then((m) => ({ default: m.TripCategoriesPage })));
const TripSubcategoriesPage = lazy(() => import('./cms/pages/TripSubcategoriesPage').then((m) => ({ default: m.TripSubcategoriesPage })));
const TripRegionsPage = lazy(() => import('./cms/pages/TripRegionsPage').then((m) => ({ default: m.TripRegionsPage })));
const TripCountriesPage = lazy(() => import('./cms/pages/TripCountriesPage').then((m) => ({ default: m.TripCountriesPage })));
const TripCategoryCreatePage = lazy(() => import('./cms/pages/TripCategoryCreatePage').then((m) => ({ default: m.TripCategoryCreatePage })));
const TripSubcategoryCreatePage = lazy(() => import('./cms/pages/TripSubcategoryCreatePage').then((m) => ({ default: m.TripSubcategoryCreatePage })));
const TripRegionCreatePage = lazy(() => import('./cms/pages/TripRegionCreatePage').then((m) => ({ default: m.TripRegionCreatePage })));
const TripCountryCreatePage = lazy(() => import('./cms/pages/TripCountryCreatePage').then((m) => ({ default: m.TripCountryCreatePage })));
const TripCategoryEditPage = lazy(() => import('./cms/pages/TripCategoryEditPage').then((m) => ({ default: m.TripCategoryEditPage })));
const TripSubcategoryEditPage = lazy(() => import('./cms/pages/TripSubcategoryEditPage').then((m) => ({ default: m.TripSubcategoryEditPage })));
const TripRegionEditPage = lazy(() => import('./cms/pages/TripRegionEditPage').then((m) => ({ default: m.TripRegionEditPage })));
const TripCountryEditPage = lazy(() => import('./cms/pages/TripCountryEditPage').then((m) => ({ default: m.TripCountryEditPage })));
const TripCreatePage = lazy(() => import('./cms/trips/TripCreatePage').then((m) => ({ default: m.TripCreatePage })));
const TripEditPage = lazy(() => import('./cms/trips/TripEditPage').then((m) => ({ default: m.TripEditPage })));
const TripPreviewPage = lazy(() => import('./cms/trips/TripPreviewPage').then((m) => ({ default: m.TripPreviewPage })));
const TripNotesEditorPage = lazy(() => import('./cms/pages/TripNotesEditorPage').then((m) => ({ default: m.TripNotesEditorPage })));
const AddOnsPage = lazy(() => import('./cms/pages/AddOnsPage').then((m) => ({ default: m.AddOnsPage })));
const AddOnCreatePage = lazy(() => import('./cms/pages/AddOnCreatePage').then((m) => ({ default: m.AddOnCreatePage })));
const AddOnEditPage = lazy(() => import('./cms/pages/AddOnEditPage').then((m) => ({ default: m.AddOnEditPage })));
const BlogListPage = lazy(() => import('./cms/pages/BlogListPage').then((m) => ({ default: m.BlogListPage })));
const BlogCreatePage = lazy(() => import('./cms/pages/BlogCreatePage').then((m) => ({ default: m.BlogCreatePage })));
const BlogEditPage = lazy(() => import('./cms/pages/BlogEditPage').then((m) => ({ default: m.BlogEditPage })));
const BookingsPage = lazy(() => import('./cms/pages/BookingsPage').then((m) => ({ default: m.BookingsPage })));
const BookingDetailPage = lazy(() => import('./cms/pages/BookingDetailPage').then((m) => ({ default: m.BookingDetailPage })));
const RentalsListPage = lazy(() => import('./cms/pages/RentalsListPage').then((m) => ({ default: m.RentalsListPage })));
const RentalCategoriesPage = lazy(() => import('./cms/pages/RentalCategoriesPage').then((m) => ({ default: m.RentalCategoriesPage })));
const RentalCategoryCreatePage = lazy(() => import('./cms/pages/RentalCategoryCreatePage').then((m) => ({ default: m.RentalCategoryCreatePage })));
const RentalCategoryEditPage = lazy(() => import('./cms/pages/RentalCategoryEditPage').then((m) => ({ default: m.RentalCategoryEditPage })));
const RentalProductCreatePage = lazy(() => import('./cms/pages/RentalProductCreatePage').then((m) => ({ default: m.RentalProductCreatePage })));
const RentalProductEditPage = lazy(() => import('./cms/pages/RentalProductEditPage').then((m) => ({ default: m.RentalProductEditPage })));
const RentalOrdersPage = lazy(() => import('./cms/pages/RentalOrdersPage').then((m) => ({ default: m.RentalOrdersPage })));
const RentalOrderDetailPage = lazy(() => import('./cms/pages/RentalOrderDetailPage').then((m) => ({ default: m.RentalOrderDetailPage })));
const PromotionsPage = lazy(() => import('./cms/pages/PromotionsPage').then((m) => ({ default: m.PromotionsPage })));
const CmsContactPage = lazy(() => import('./cms/pages/ContactPage').then((m) => ({ default: m.ContactPage })));
const NewsletterSubscriptionsPage = lazy(() => import('./cms/pages/NewsletterSubscriptionsPage').then((m) => ({ default: m.NewsletterSubscriptionsPage })));
const CmsTeamPage = lazy(() => import('./cms/pages/TeamPage').then((m) => ({ default: m.TeamPage })));
const TeamCreatePage = lazy(() => import('./cms/pages/TeamCreatePage').then((m) => ({ default: m.TeamCreatePage })));
const TeamEditPage = lazy(() => import('./cms/pages/TeamEditPage').then((m) => ({ default: m.TeamEditPage })));
const GuidesPage = lazy(() => import('./cms/pages/GuidesPage').then((m) => ({ default: m.GuidesPage })));
const GuideCreatePage = lazy(() => import('./cms/pages/GuideCreatePage').then((m) => ({ default: m.GuideCreatePage })));
const GuideEditPage = lazy(() => import('./cms/pages/GuideEditPage').then((m) => ({ default: m.GuideEditPage })));
const TestimonialsPage = lazy(() => import('./cms/pages/TestimonialsPage').then((m) => ({ default: m.TestimonialsPage })));
const FaqsPage = lazy(() => import('./cms/pages/FaqsPage').then((m) => ({ default: m.FaqsPage })));
const PagesEditorPage = lazy(() => import('./cms/pages/PagesEditorPage').then((m) => ({ default: m.PagesEditorPage })));
const CareersPartnershipsCmsPage = lazy(() => import('./cms/pages/CareersPartnershipsCmsPage').then((m) => ({ default: m.CareersPartnershipsCmsPage })));
const HomepageCmsPage = lazy(() => import('./cms/pages/HomepageCmsPage').then((m) => ({ default: m.HomepageCmsPage })));
const HomepageGalleryCmsPage = lazy(() => import('./cms/pages/HomepageGalleryCmsPage').then((m) => ({ default: m.HomepageGalleryCmsPage })));
const NavigationPage = lazy(() => import('./cms/pages/NavigationPage').then((m) => ({ default: m.NavigationPage })));
const MediaPage = lazy(() => import('./cms/pages/MediaPage').then((m) => ({ default: m.MediaPage })));
const SettingsPage = lazy(() => import('./cms/pages/SettingsPage').then((m) => ({ default: m.SettingsPage })));
const MaintenanceModePage = lazy(() => import('./cms/pages/MaintenanceModePage').then((m) => ({ default: m.MaintenanceModePage })));
const PromotionFormPage = lazy(() => import('./cms/promotions/PromotionFormPage').then((m) => ({ default: m.PromotionFormPage })));
const FAQPage = lazy(() => import('./pages/faq-page').then((m) => ({ default: m.FAQPage })));
const ReviewsPage = lazy(() => import('./pages/reviews-page').then((m) => ({ default: m.ReviewsPage })));
const CareersPartnershipsPage = lazy(() => import('./pages/about/careers-partnerships-page').then((m) => ({ default: m.CareersPartnershipsPage })));
const ForgotPasswordPage = lazy(() => import('./pages/cms/forgot-password-page').then((m) => ({ default: m.ForgotPasswordPage })));
const ResetPasswordPage = lazy(() => import('./pages/cms/reset-password-page').then((m) => ({ default: m.ResetPasswordPage })));
function AppContent() {
  const location = useLocation();
  const isCmsRoute = location.pathname.startsWith('/cms');
  const isResetPasswordPage = location.pathname === '/reset-password';
  const showMainNav = !isCmsRoute && !isResetPasswordPage;
  const routeSeo = getSeoForPath(location.pathname) ?? DEFAULT_SEO;
  const noindex = isCmsRoute || isResetPasswordPage;

  // Preload homepage content when on / for faster LCP and better SEO
  if (location.pathname === '/') {
    preloadHomepageContent();
  }

  const [maintenanceMode, setMaintenanceMode] = React.useState(false);
  const [instagramEmbeds, setInstagramEmbeds] = React.useState<string[]>([]);

  React.useEffect(() => {
    settingsApi
      .get()
      .then((data) => {
        setMaintenanceMode(!!data.maintenanceMode);
        setInstagramEmbeds(data.instagramEmbeds || []);
      })
      .catch(() => {});
  }, []);

  // Keep the CMS reachable during maintenance so an admin can turn the flag back off
  if (maintenanceMode && !isCmsRoute) {
    return (
      <>
        <SeoHead title="Under Maintenance" description="The site is under maintenance." noindex />
        <MaintenancePage instagramEmbeds={instagramEmbeds} />
      </>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <SeoHead
        title={routeSeo.title}
        description={routeSeo.description}
        image={routeSeo.image}
        type={routeSeo.type}
        noindex={noindex}
      />
      <ScrollToTop />
      {showMainNav && <EnhancedNavigation />}
      <main id="main-content" className="flex-1" role="main">
        <Suspense fallback={<div style={{minHeight:'60vh'}} />}> 
        <Routes>
            <Route path="/" element={<HomePage />} />
            
          {/* Dynamic Category and Subcategory Routes */}
          <Route path="/trips/:categorySlug/:subcategorySlug" element={<DynamicSubcategoryPage />} />
          <Route path="/trips/:categorySlug" element={<DynamicCategoryPage />} />

            {/* Browse & Plan Routes */}
            <Route path="/all-trips" element={<AllTripsPage />} />
            <Route path="/calendar" element={<TripCalendarPage />} />
            <Route path="/trip/:id" element={<TripDetailPage />} />
            <Route path="/trip/:id/notes" element={<TripNotesPage />} />
            <Route path="/trip/:id/select-date" element={<Navigate to="../details" replace />} />
            <Route path="/trip/:id/details" element={<TripDetailsFormPage />} />
            <Route path="/trip/:id/checkout" element={<CheckoutPage />} />
            <Route path="/trip/:id/confirmation" element={<BookingConfirmationPage />} />
            <Route path="/trip/:id/confirmation/:bookingId" element={<BookingConfirmationPage />} />
            <Route path="/trip/:id/booking/:bookingId" element={<BookingPublicPage />} />
            
            {/* About Routes */}
            <Route path="/about" element={<AboutPage />} />
            <Route path="/about/story" element={<Navigate to="/about" replace />} />
            <Route path="/about/team" element={<TeamPage />} />
            <Route path="/team" element={<TeamPage />} />
				  <Route path="/about/careers-partnerships" element={<CareersPartnershipsPage />} />
            
            {/* Other Pages */}
            <Route path="/trip-comparison" element={<TripComparisonPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/blog" element={<BlogPage />} />
            <Route path="/blog/:slug" element={<BlogDetailPage />} />
			<Route path="/faq" element={<FAQPage />} />
			<Route path="/reviews" element={<ReviewsPage />} />
            {/* CMS Routes */}
            <Route path="/cms" element={<LoginPage />} />
            <Route path="/cms/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />
            <Route
              path="/cms/dashboard"
              element={
                <CmsLayout>
                  <DashboardPage />
                </CmsLayout>
              }
            />
            <Route
              path="/cms/trips"
              element={
                <CmsLayout>
                  <TripsListPage />
                </CmsLayout>
              }
            />
            <Route
              path="/cms/trips/categories"
              element={
                <CmsLayout>
                  <TripCategoriesPage />
                </CmsLayout>
              }
            />
            <Route
              path="/cms/trips/regions"
              element={
                <CmsLayout>
                  <TripRegionsPage />
                </CmsLayout>
              }
            />
            <Route
              path="/cms/trips/countries"
              element={
                <CmsLayout>
                  <TripCountriesPage />
                </CmsLayout>
              }
            />
            <Route
              path="/cms/trips/categories/new"
              element={
                <CmsLayout>
                  <TripCategoryCreatePage />
                </CmsLayout>
              }
            />
            <Route
              path="/cms/trips/regions/new"
              element={
                <CmsLayout>
                  <TripRegionCreatePage />
                </CmsLayout>
              }
            />
            <Route
              path="/cms/trips/countries/new"
              element={
                <CmsLayout>
                  <TripCountryCreatePage />
                </CmsLayout>
              }
            />
            <Route
              path="/cms/trips/categories/:id"
              element={
                <CmsLayout>
                  <TripCategoryEditPage />
                </CmsLayout>
              }
            />
            <Route
              path="/cms/trips/regions/:id"
              element={
                <CmsLayout>
                  <TripRegionEditPage />
                </CmsLayout>
              }
            />
            <Route
              path="/cms/trips/countries/:id"
              element={
                <CmsLayout>
                  <TripCountryEditPage />
                </CmsLayout>
              }
            />
            <Route
              path="/cms/trips/subcategories"
              element={
                <CmsLayout>
                  <TripSubcategoriesPage />
                </CmsLayout>
              }
            />
            <Route
              path="/cms/trips/subcategories/new"
              element={
                <CmsLayout>
                  <TripSubcategoryCreatePage />
                </CmsLayout>
              }
            />
            <Route
              path="/cms/trips/subcategories/:id"
              element={
                <CmsLayout>
                  <TripSubcategoryEditPage />
                </CmsLayout>
              }
            />
            <Route
              path="/cms/trips/new"
              element={
                <CmsLayout>
                  <TripCreatePage />
                </CmsLayout>
              }
            />
            <Route
              path="/cms/trips/:id"
              element={
                <CmsLayout>
                  <TripEditPage />
                </CmsLayout>
              }
            />
            <Route
              path="/cms/trips/:id/notes"
              element={
                <CmsLayout>
                  <TripNotesEditorPage />
                </CmsLayout>
              }
            />
            <Route
              path="/cms/add-ons"
              element={
                <CmsLayout>
                  <AddOnsPage />
                </CmsLayout>
              }
            />
            <Route
              path="/cms/add-ons/new"
              element={
                <CmsLayout>
                  <AddOnCreatePage />
                </CmsLayout>
              }
            />
            <Route
              path="/cms/add-ons/:id"
              element={
                <CmsLayout>
                  <AddOnEditPage />
                </CmsLayout>
              }
            />
            <Route
              path="/cms/trips/preview"
              element={
                <CmsLayout>
                  <TripPreviewPage />
                </CmsLayout>
              }
            />
            <Route
              path="/cms/blog"
              element={
                <CmsLayout>
                  <BlogListPage />
                </CmsLayout>
              }
            />
            <Route
              path="/cms/blog/new"
              element={
                <CmsLayout>
                  <BlogCreatePage />
                </CmsLayout>
              }
            />
            <Route
              path="/cms/blog/:id"
              element={
                <CmsLayout>
                  <BlogEditPage />
                </CmsLayout>
              }
            />
            <Route
              path="/cms/bookings"
              element={
                <CmsLayout>
                  <BookingsPage />
                </CmsLayout>
              }
            />
            <Route
              path="/cms/bookings/:id"
              element={
                <CmsLayout>
                  <BookingDetailPage />
                </CmsLayout>
              }
            />
            <Route
              path="/cms/rentals"
              element={
                <CmsLayout>
                  <RentalsListPage />
                </CmsLayout>
              }
            />
            <Route
              path="/cms/rentals/categories"
              element={
                <CmsLayout>
                  <RentalCategoriesPage />
                </CmsLayout>
              }
            />
            <Route
              path="/cms/rentals/categories/new"
              element={
                <CmsLayout>
                  <RentalCategoryCreatePage />
                </CmsLayout>
              }
            />
            <Route
              path="/cms/rentals/categories/:id"
              element={
                <CmsLayout>
                  <RentalCategoryEditPage />
                </CmsLayout>
              }
            />
            <Route
              path="/cms/rentals/new"
              element={
                <CmsLayout>
                  <RentalProductCreatePage />
                </CmsLayout>
              }
            />
            <Route
              path="/cms/rentals/:id"
              element={
                <CmsLayout>
                  <RentalProductEditPage />
                </CmsLayout>
              }
            />
            <Route
              path="/cms/rental-orders"
              element={
                <CmsLayout>
                  <RentalOrdersPage />
                </CmsLayout>
              }
            />
            <Route
              path="/cms/rental-orders/:id"
              element={
                <CmsLayout>
                  <RentalOrderDetailPage />
                </CmsLayout>
              }
            />
            <Route
              path="/cms/promotions"
              element={
                <CmsLayout>
                  <PromotionsPage />
                </CmsLayout>
              }
            />
            <Route
              path="/cms/promotions/new"
              element={
                <CmsLayout>
                  <PromotionFormPage />
                </CmsLayout>
              }
            />
            <Route
              path="/cms/promotions/:id"
              element={
                <CmsLayout>
                  <PromotionFormPage />
                </CmsLayout>
              }
            />
            <Route
              path="/cms/contact"
              element={
                <CmsLayout>
                  <CmsContactPage />
                </CmsLayout>
              }
            />
            <Route
              path="/cms/newsletter-subscriptions"
              element={
                <CmsLayout>
                  <NewsletterSubscriptionsPage />
                </CmsLayout>
              }
            />
            <Route
              path="/cms/team"
              element={
                <CmsLayout>
                  <CmsTeamPage />
                </CmsLayout>
              }
            />
            <Route
              path="/cms/team/new"
              element={
                <CmsLayout>
                  <TeamCreatePage />
                </CmsLayout>
              }
            />
            <Route
              path="/cms/team/:id"
              element={
                <CmsLayout>
                  <TeamEditPage />
                </CmsLayout>
              }
            />
            <Route
              path="/cms/guides"
              element={
                <CmsLayout>
                  <GuidesPage />
                </CmsLayout>
              }
            />
            <Route
              path="/cms/guides/new"
              element={
                <CmsLayout>
                  <GuideCreatePage />
                </CmsLayout>
              }
            />
            <Route
              path="/cms/guides/:id"
              element={
                <CmsLayout>
                  <GuideEditPage />
                </CmsLayout>
              }
            />
            <Route
              path="/cms/testimonials"
              element={
                <CmsLayout>
                  <TestimonialsPage />
                </CmsLayout>
              }
            />
            <Route
              path="/cms/faqs"
              element={
                <CmsLayout>
                  <FaqsPage />
                </CmsLayout>
              }
            />
            <Route
              path="/cms/pages"
              element={
                <CmsLayout>
                  <PagesEditorPage />
                </CmsLayout>
              }
            />
            <Route
              path="/cms/pages/homepage"
              element={
                <CmsLayout>
                  <HomepageCmsPage />
                </CmsLayout>
              }
            />
            <Route
              path="/cms/pages/gallery"
              element={
                <CmsLayout>
                  <HomepageGalleryCmsPage />
                </CmsLayout>
              }
            />
            <Route
              path="/cms/pages/careers-partnerships"
              element={
                <CmsLayout>
                  <CareersPartnershipsCmsPage />
                </CmsLayout>
              }
            />
            <Route
              path="/cms/navigation"
              element={
                <CmsLayout>
                  <NavigationPage />
                </CmsLayout>
              }
            />
            <Route
              path="/cms/media"
              element={
                <CmsLayout>
                  <MediaPage />
                </CmsLayout>
              }
            />
            <Route
              path="/cms/settings"
              element={
                <CmsLayout>
                  <SettingsPage />
                </CmsLayout>
              }
            />
            <Route
              path="/cms/maintenance-mode"
              element={
                <CmsLayout>
                  <MaintenanceModePage />
                </CmsLayout>
              }
            />
          </Routes>
        </Suspense>
        </main>
        {!isCmsRoute && <Footer />}
        <Toaster />
      </div>
    );
  }

export default function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}
