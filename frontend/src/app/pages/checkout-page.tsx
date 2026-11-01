import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation, Link } from 'react-router-dom';
import { Controller, useForm, useWatch } from 'react-hook-form';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { SustainabilityBadge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Checkbox } from '../components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { ScrollAnimate } from '../components/scroll-animate';
import { ParallaxImage } from '../components/parallax';
import { 
  Calendar, MapPin, Users, Clock, Shield, CreditCard, 
  ArrowRight, ChevronDown, AlertCircle, FileText,
  Mail, Phone, User, Globe, Leaf, Heart, TrendingUp
} from 'lucide-react';
import { bookingApi } from '../services/api';
import { NewsletterSubscribeForm } from '../components/newsletter-subscribe-form';

export function CheckoutPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const bookingData = location.state;

  // Form state
  const paymentMethod = 'later' as const;
  const {
    handleSubmit: handleFormSubmit,
    control,
    trigger,
    formState: { errors: formErrors },
  } = useForm({
    mode: 'onChange',
    reValidateMode: 'onChange',
    defaultValues: {
      fullName: '',
      email: '',
      phone: '',
      billingCountry: 'United States',
    },
  });
  
  // Consent state
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [acceptedPrivacy, setAcceptedPrivacy] = useState(false);
  const [travelInsuranceAcknowledged, setTravelInsuranceAcknowledged] = useState(false);

  // UI state
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [requestId, setRequestId] = useState('');
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const formEmail = useWatch({ control, name: 'email' });

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);
    
    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  useEffect(() => {
    // Generate request ID
    const generateRequestId = () => {
      const timestamp = Date.now().toString(36);
      const randomStr = Math.random().toString(36).substring(2, 7);
      return `BKR-${timestamp}-${randomStr}`.toUpperCase();
    };
    setRequestId(generateRequestId());
  }, []);

  if (!bookingData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold mb-4">Booking information not found</h2>
          <Link to="/all-trips">
            <Button>Browse All Trips</Button>
          </Link>
        </div>
      </div>
    );
  }

  const { trip, departure, adults, children, specialRequests, emergencyName, emergencyPhone, promoCode, selectedAddOns, pricing } = bookingData;

  const countries = [
    'United States', 'Canada', 'United Kingdom', 'Australia', 'New Zealand',
    'Germany', 'France', 'Spain', 'Italy', 'Japan', 'South Korea', 'Singapore',
    'India', 'Brazil', 'Mexico', 'Netherlands', 'Sweden', 'Norway', 'Denmark'
  ];

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!acceptedTerms) newErrors.terms = 'You must accept the Terms and Conditions';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = handleFormSubmit(async (data) => {
    if (!validateForm()) return;
    setIsSubmitting(true);
    try {
      const totalParticipants = adults + children;
      const departureStart = departure?.startDate
        ? new Date(departure.startDate)
        : new Date();
      const addOnNames = (selectedAddOns || []).map((addon: any) => addon.title).filter(Boolean);
      const notesParts = [];
      if (departure?.endDate) {
        notesParts.push(`End date: ${new Date(departure.endDate).toLocaleDateString()}`);
      }
      if (addOnNames.length > 0) {
        notesParts.push(`Add-ons: ${addOnNames.join(', ')}`);
      }
      const notes = notesParts.length > 0 ? notesParts.join(' | ') : undefined;
      const booking = await bookingApi.create({
        trip: trip.id || trip._id || id || '',
        numberOfParticipants: totalParticipants,
        departureDate: departureStart.toISOString(),
        totalPrice: pricing.total,
        specialRequests: specialRequests || undefined,
        promoCode: promoCode || undefined,
        promoDiscount: pricing.promoDiscount,
        emergencyContact: emergencyName || emergencyPhone ? { name: emergencyName, phone: emergencyPhone } : undefined,
        party: {
          adults,
          children,
        },
        addOns: (selectedAddOns || []).map((addon: any) => ({
          id: addon.id,
          title: addon.title,
          kind: addon.kind,
          type: addon.type,
          optionLabel: addon.optionLabel,
          duration: addon.duration,
          location: addon.location,
          discountEligible: addon.discountEligible,
          price: addon.price,
        })),
        consents: {
          termsAccepted: acceptedTerms,
          marketingOptIn: acceptedPrivacy,
          travelInsuranceAcknowledged: travelInsuranceAcknowledged,
        },
        notes,
        guestInfo: {
          name: data.fullName,
          email: data.email,
          phone: data.phone,
        },
      });
      setIsSubmitting(false);
      navigate(`/trip/${id}/confirmation/${booking?.id || booking?._id}${booking?.qrToken ? `?token=${booking.qrToken}` : ''}`, {
        state: {
          ...bookingData,
          requestId: booking?.id || booking?._id,
          qrToken: booking?.qrToken,
          qrUrl: booking?.qrUrl,
          contactDetails: {
            fullName: data.fullName,
            email: data.email,
            phone: data.phone,
            billingCountry: data.billingCountry,
          },
          paymentMethod,
        },
      });
    } catch (error) {
      setIsSubmitting(false);
      setErrors((prev) => ({
        ...prev,
        submit: 'Booking failed. Please try again.',
      }));
    }
  });

  const sustainabilityBadges = [
    { icon: Leaf, label: 'Small group', color: 'text-[var(--color-forest-600)]' },
    { icon: Heart, label: 'Guide led', color: 'text-[var(--color-navy-600)]' },
    { icon: TrendingUp, label: 'Free cancellation', color: 'text-[var(--color-sun-600)]' }
  ];
  const coreSustainabilityBadges = new Set([
    'zerowaste',
    'lowcarbon',
    'localhire',
    'inclusivegrowth',
  ]);
  const normalizeBadgeLabel = (label: string) => label.toLowerCase().replace(/[^a-z]/g, '');

  return (
    <div className="min-h-screen bg-gray-50 relative">
      {/* Subtle Parallax Background */}
      <div className="fixed inset-0 z-0 opacity-30">
        {prefersReducedMotion ? (
          <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-navy-100)] via-white to-[var(--color-forest-100)]" />
        ) : (
          <ParallaxImage
            src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=2000&q=80"
            alt="Background"
            speed={0.2}
            className="absolute inset-0 opacity-20"
          />
        )}
      </div>

      <div className="relative z-10 py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <ScrollAnimate animation="fade-in-up">
            <div className="mb-8">
              <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
                <Link to="/" className="hover:text-[var(--color-navy-600)]">Home</Link>
                <ChevronDown size={16} className="rotate-[-90deg]" />
                <Link to={`/trip/${id}`} className="hover:text-[var(--color-navy-600)]">{trip.title}</Link>
                <ChevronDown size={16} className="rotate-[-90deg]" />
                <Link to={`/trip/${id}/details`} className="hover:text-[var(--color-navy-600)]">Trip Details</Link>
                <ChevronDown size={16} className="rotate-[-90deg]" />
                <span className="text-gray-900 font-semibold">Checkout</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold mb-2" style={{ fontFamily: 'Outfit, sans-serif' }}>
                Complete Your Booking
              </h1>
              <p className="text-lg text-gray-600">
              
              </p>
            </div>
          </ScrollAnimate>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Forms */}
            <div className="lg:col-span-2 space-y-6">
              {/* Trip Summary Card */}
              <ScrollAnimate animation="fade-in-up" delay={50}>
                <Card className="glass-card overflow-hidden">
                  <div className="relative h-32">
                    <img 
                      src={trip.image} 
                      alt={trip.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-black/40" />
                    <div className="absolute inset-0 flex items-center px-6">
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-white mb-1">{trip.title}</h3>
                        <div className="flex flex-wrap gap-4 text-white/90 text-sm">
                          <div className="flex items-center gap-1">
                            <Calendar size={14} />
                            <span>{departure.dateRange}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock size={14} />
                            <span>{trip.duration}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Users size={14} />
                            <span>{adults + children} {adults + children === 1 ? 'guest' : 'guests'}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              </ScrollAnimate>

              {/* Contact Details */}
              <ScrollAnimate animation="fade-in-up" delay={100}>
                <Card className="glass-card overflow-hidden">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <User className="text-[var(--color-navy-600)]" />
                      Contact Details
                    </CardTitle>
                    <p className="text-sm text-gray-600 mt-1">
                      We'll use this information to send your booking confirmation and trip details
                    </p>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="fullName">
                          Full Name <span className="text-red-500">*</span>
                        </Label>
                        <div className="relative">
                          <User size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                          <Controller
                            name="fullName"
                            control={control}
                            rules={{ required: 'Full name is required' }}
                            render={({ field }) => (
                              <Input
                                id="fullName"
                                value={field.value}
                                onChange={(e) => {
                                  field.onChange(e);
                                  trigger('fullName');
                                }}
                                placeholder="John Doe"
                                className="pl-10"
                                aria-invalid={!!formErrors.fullName}
                                aria-describedby={formErrors.fullName ? "fullName-error" : undefined}
                              />
                            )}
                          />
                        </div>
                        {formErrors.fullName && (
                          <p id="fullName-error" className="text-sm text-red-600" role="alert">
                            {String(formErrors.fullName.message)}
                          </p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="phone">
                          Phone Number <span className="text-red-500">*</span>
                        </Label>
                        <div className="relative">
                          <Phone size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                          <Controller
                            name="phone"
                            control={control}
                            rules={{
                              required: 'Phone number is required',
                              pattern: {
                                value: /^\+?[\d\s-()]+$/,
                                message: 'Please enter a valid phone number',
                              },
                            }}
                            render={({ field }) => (
                              <Input
                                id="phone"
                                type="tel"
                                value={field.value}
                                onChange={(e) => {
                                  field.onChange(e);
                                  trigger('phone');
                                }}
                                placeholder="+1 (555) 000-0000"
                                className="pl-10"
                                aria-invalid={!!formErrors.phone}
                                aria-describedby={formErrors.phone ? "phone-error" : undefined}
                              />
                            )}
                          />
                        </div>
                        {formErrors.phone && (
                          <p id="phone-error" className="text-sm text-red-600" role="alert">
                            {String(formErrors.phone.message)}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email">
                        Email Address <span className="text-red-500">*</span>
                      </Label>
                      <div className="relative">
                        <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                        <Controller
                          name="email"
                          control={control}
                          rules={{
                            required: 'Email is required',
                            pattern: {
                              value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                              message: 'Please enter a valid email address',
                            },
                          }}
                          render={({ field }) => (
                            <Input
                              id="email"
                              type="email"
                              value={field.value}
                              onChange={(e) => {
                                field.onChange(e);
                                trigger('email');
                              }}
                              placeholder="john@example.com"
                              className="pl-10"
                              aria-invalid={!!formErrors.email}
                              aria-describedby={formErrors.email ? "email-error" : undefined}
                            />
                          )}
                        />
                      </div>
                      {formErrors.email && (
                        <p id="email-error" className="text-sm text-red-600" role="alert">
                          {String(formErrors.email.message)}
                        </p>
                      )}
                    </div>

                    <div className="rounded-xl border border-slate-200/80 bg-white/80 p-4 space-y-2">
                      <Label htmlFor="billingCountry" className="flex items-center gap-2">
                        <Globe size={16} className="text-slate-500" />
                        Billing Country
                      </Label>
                      <Controller
                        name="billingCountry"
                        control={control}
                        render={({ field }) => (
                          <Select value={field.value} onValueChange={field.onChange}>
                            <SelectTrigger
                              id="billingCountry"
                              className="h-10 rounded-xl border-slate-200/80 bg-white text-sm text-slate-700 shadow-sm focus-visible:ring-[var(--color-navy-600)] hover:border-slate-300/80"
                            >
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="rounded-xl border border-slate-200/80 bg-white shadow-lg">
                              {countries.map((country) => (
                                <SelectItem key={country} value={country}>
                                  {country}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                      />
                    </div>
                  </CardContent>
                </Card>
              </ScrollAnimate>

              {/* Payment Method */}
              <ScrollAnimate animation="fade-in-up" delay={150}>
                <Card className="glass-card">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <CreditCard className="text-[var(--color-navy-600)]" />
                      Checkout Now, Pay Later
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="rounded-xl border border-[var(--color-navy-200)] bg-[var(--color-navy-50)] p-6">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-full bg-white text-[var(--color-navy-700)] flex items-center justify-center shadow">
                          <Clock size={20} />
                        </div>
                        <div>
                          <div className="font-semibold text-lg">Checkout now and pay later</div>
                          <div className="text-sm text-gray-600">
                            We'll confirm availability and email your payment instructions.
                          </div>
                        </div>
                      </div>
                      <div className="text-sm text-gray-600">
                        No payment details required today.
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </ScrollAnimate>

              {/* Consent and Confirmations */}
              <ScrollAnimate animation="fade-in-up" delay={200}>
                <Card className="glass-card">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="text-[var(--color-navy-600)]" />
                      Consent & Confirmations
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Terms and Conditions */}
                    <div className={`p-4 rounded-lg border-2 ${
                      errors.terms ? 'border-red-300 bg-red-50' : 'border-gray-200'
                    }`}>
                      <div className="flex items-start gap-3">
                        <Checkbox
                          id="terms"
                          checked={acceptedTerms}
                          onCheckedChange={(checked) => setAcceptedTerms(checked as boolean)}
                          aria-invalid={!!errors.terms}
                          aria-describedby={errors.terms ? "terms-error" : undefined}
                          className="mt-1"
                        />
                        <div className="flex-1">
                          <Label htmlFor="terms" className="font-semibold cursor-pointer">
                            Terms and Conditions <span className="text-red-500">*</span>
                          </Label>
                          <p className="text-sm text-gray-600 mt-1">
                            I have read and agree to the{' '}
                            <a href="/terms" className="text-[var(--color-navy-600)] hover:underline" target="_blank" rel="noopener noreferrer">
                              Terms and Conditions
                            </a>,{' '}
                            <a href="/cancellation" className="text-[var(--color-navy-600)] hover:underline" target="_blank" rel="noopener noreferrer">
                              Cancellation Policy
                            </a>, and{' '}
                            <a href="/liability" className="text-[var(--color-navy-600)] hover:underline" target="_blank" rel="noopener noreferrer">
                              Liability Waiver
                            </a>.
                          </p>
                        </div>
                      </div>
                      {errors.terms && (
                        <p id="terms-error" className="text-sm text-red-600 mt-2 ml-8" role="alert">
                          {errors.terms}
                        </p>
                      )}
                    </div>

                    {/* Privacy and Communications */}
                    <div className="p-4 rounded-lg border-2 border-gray-200">
                      <div className="flex items-start gap-3">
                        <Checkbox
                          id="privacy"
                          checked={acceptedPrivacy}
                          onCheckedChange={(checked) => setAcceptedPrivacy(checked as boolean)}
                          className="mt-1"
                        />
                        <div className="flex-1">
                          <Label htmlFor="privacy" className="font-semibold cursor-pointer">
                            Privacy & Communications
                          </Label>
                          <p className="text-sm text-gray-600 mt-1">
                            I agree to receive booking confirmations, trip updates, and promotional communications. 
                            You can unsubscribe anytime. Read our{' '}
                            <a href="/privacy" className="text-[var(--color-navy-600)] hover:underline" target="_blank" rel="noopener noreferrer">
                              Privacy Policy
                            </a>.
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Travel Insurance Reminder */}
                    <div className="bg-orange-50 border-2 border-orange-200 rounded-lg p-4">
                      <div className="flex items-start gap-3">
                        <AlertCircle size={20} className="text-orange-600 flex-shrink-0 mt-0.5" />
                        <div className="flex-1">
                          <h4 className="font-semibold text-orange-900 mb-1">Travel Insurance Recommended</h4>
                          <p className="text-sm text-orange-800 mb-3">
                            We strongly recommend purchasing comprehensive travel insurance to protect your investment 
                            against unforeseen circumstances including medical emergencies, trip cancellations, and delays.
                          </p>
                          <div className="flex items-center gap-3">
                            <Checkbox
                              id="insurance"
                              checked={travelInsuranceAcknowledged}
                              onCheckedChange={(checked) => setTravelInsuranceAcknowledged(checked as boolean)}
                            />
                            <Label htmlFor="insurance" className="text-sm cursor-pointer">
                              I acknowledge this recommendation
                            </Label>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </ScrollAnimate>
            </div>

            {/* Right Column - Price Summary */}
            <div className="lg:col-span-1">
              <div className="sticky top-8 space-y-6">
                <ScrollAnimate animation="fade-in-up" delay={250}>
                  <Card className="glass-card">
                    <CardHeader>
                      <CardTitle>Booking Summary</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="rounded-xl overflow-hidden border border-gray-200">
                        <div className="h-28">
                          <img
                            src={trip.image}
                            alt={trip.title}
                            className="h-full w-full object-cover"
                          />
                        </div>
                        <div className="p-4 bg-white">
                          <div className="font-semibold text-gray-900 mb-1">{trip.title}</div>
                          <div className="text-sm text-gray-600 flex items-center gap-2">
                            <MapPin size={14} />
                            <span>{trip.region}{trip.country ? `, ${trip.country}` : ''}</span>
                          </div>
                          <div className="text-sm text-gray-600 flex items-center gap-2 mt-1">
                            <Calendar size={14} />
                            <span>{trip.duration} {Number(trip.duration) === 1 ? 'day' : 'days'}</span>
                          </div>
                        </div>
                      </div>

                      {/* Trip Details */}
                      <div className="pb-4 border-b border-gray-200">
                        <div className="text-sm text-gray-600 mb-1">Departure</div>
                        <div className="font-semibold">{departure.dateRange}</div>
                      </div>

                      <div className="pb-4 border-b border-gray-200">
                        <div className="text-sm text-gray-600 mb-1">Guests</div>
                        <div className="font-semibold">
                          {adults} {adults === 1 ? 'Adult' : 'Adults'}
                          {children > 0 && `, ${children} ${children === 1 ? 'Child' : 'Children'}`}
                        </div>
                      </div>

                      {selectedAddOns.length > 0 && (
                        <div className="pb-4 border-b border-gray-200">
                          <div className="text-sm text-gray-600 mb-2">Add-ons ({selectedAddOns.length})</div>
                          <div className="space-y-1">
                            {selectedAddOns.map((addon: any) => (
                              <div key={`${addon.id}-${addon.optionLabel || ''}`} className="text-sm text-gray-700 flex justify-between">
                                <span className="line-clamp-1">
                                  {addon.title}
                                  {addon.optionLabel ? ` — ${addon.optionLabel}` : ''}
                                </span>
                                <span className="font-semibold ml-2">US ${addon.price}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Price Breakdown */}
                      <div className="space-y-3">
                        <div className="flex justify-between text-gray-700">
                          <span>Base Trip</span>
                          <span className="font-semibold">US ${pricing.baseTotal.toFixed(2)}</span>
                        </div>
                        
                        {selectedAddOns.length > 0 && (
                          <>
                            <div className="flex justify-between text-gray-700">
                              <span>Add-ons Subtotal</span>
                              <span className="font-semibold">US ${pricing.addOnsSubtotal.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-[var(--color-sun-600)]">
                              <span className="text-sm">Add-on Discount (10%)</span>
                              <span className="font-semibold">-US ${pricing.addOnDiscount.toFixed(2)}</span>
                            </div>
                          </>
                        )}

                        {pricing.promoDiscount > 0 && (
                          <div className="flex justify-between text-[var(--color-forest-600)]">
                            <span className="text-sm">Promo discount</span>
                            <span className="font-semibold">-US ${pricing.promoDiscount.toFixed(2)}</span>
                          </div>
                        )}
                        
                        <div className="pt-3 border-t border-gray-200">
                          <div className="flex justify-between text-gray-700">
                            <span>Subtotal</span>
                            <span className="font-semibold">US ${pricing.subtotal.toFixed(2)}</span>
                          </div>
                        </div>
                        
                        <div className="flex justify-between text-gray-700">
                          <span>VAT (included, 13%)</span>
                          <span className="font-semibold">-US ${pricing.taxes.toFixed(2)}</span>
                        </div>
                        
                        <div className="pt-3 border-t-2 border-gray-300">
                          <div className="flex justify-between items-center mb-3">
                            <span className="text-lg font-bold">Total</span>
                            <span className="text-2xl font-bold text-gray-900">US ${pricing.total.toFixed(2)}</span>
                          </div>
                        </div>

                        <div className="bg-gray-50 rounded-lg p-4 border-2 border-gray-200">
                          <div className="flex items-center gap-2 mb-2">
                            <Clock size={16} className="text-gray-600" />
                            <span className="font-semibold text-sm">Payment Later</span>
                          </div>
                          <p className="text-sm text-gray-600">
                            We'll send payment instructions after your booking request is confirmed
                          </p>
                        </div>
                      </div>

                      {/* Sustainability Badges */}
                      <div className="pt-4 border-t border-gray-200">
                        <div className="text-sm text-gray-600 mb-2">Impact</div>
                        <div className="flex flex-wrap gap-2">
                          {sustainabilityBadges.map((badge) => (
                            coreSustainabilityBadges.has(normalizeBadgeLabel(badge.label)) ? (
                              <SustainabilityBadge key={badge.label} label={badge.label} size="sm" className="w-fit" />
                            ) : (
                              <div key={badge.label} className="flex items-center gap-1 px-2 py-1 rounded-full bg-gray-100 border border-gray-200">
                                <badge.icon size={12} className={badge.color} />
                                <span className="text-xs text-gray-700">{badge.label}</span>
                              </div>
                            )
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </ScrollAnimate>

                {/* Action Buttons */}
                <ScrollAnimate animation="fade-in-up" delay={300}>
                  <div className="space-y-3">
                    <Button
                      className={`w-full text-lg py-6 bg-gradient-to-r from-[var(--color-navy-600)] to-[var(--color-forest-600)] hover:from-[var(--color-navy-700)] hover:to-[var(--color-forest-700)] ${
                        prefersReducedMotion ? '' : 'hover:shadow-[0_0_30px_rgba(50,84,134,0.4)]'
                      } transition-all duration-300`}
                      onClick={handleSubmit}
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-2" />
                          Processing...
                        </>
                      ) : (
                        <>
                          Send Booking Request
                          <ArrowRight size={20} className="ml-2" />
                        </>
                      )}
                    </Button>

                    <p className="text-xs text-gray-500 text-center">
                      By submitting, you agree to our{' '}
                      <a href="/terms" className="text-[var(--color-navy-600)] hover:underline">
                        Terms of Service
                      </a>
                    </p>
                  </div>
                </ScrollAnimate>

                {/* Newsletter subscription */}
                <ScrollAnimate animation="fade-in-up" delay={350}>
                  <Card className="glass-card">
                    <CardHeader>
                      <CardTitle>Newsletter</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <p className="text-sm text-gray-600">
                        Get monthly trail stories, impact updates, and trip announcements.
                      </p>
                      <NewsletterSubscribeForm
                        source="checkout"
                        defaultEmail={typeof formEmail === 'string' ? formEmail : undefined}
                        containerClassName="flex flex-col gap-3"
                        buttonClassName="w-full bg-[var(--color-forest-600)] hover:bg-[var(--color-forest-700)]"
                      />
                    </CardContent>
                  </Card>
                </ScrollAnimate>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}
