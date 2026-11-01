import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, useLocation, Link } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Badge, SustainabilityBadge } from '../components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { ScrollAnimate } from '../components/scroll-animate';
import { 
  Calendar, MapPin, Users, Clock, Leaf, Heart, TrendingUp, 
  ArrowRight, ChevronDown, Check, X, Plus, Info, Tag, Shield,
  Utensils, Accessibility, Phone, User, Bed, Minus, Filter
} from 'lucide-react';
import { useTrip } from '../hooks/useTrips';
import { resolveMediaUrl, tripsApi, promotionsApi, addOnsApi, type AddOnRecord } from '../services/api';

interface AddOnChoiceOption {
  label: string;
  price: number;
  priceUnit?: string;
}

interface AddOn {
  id: string;
  title: string;
  kind: 'comfort' | 'activity';
  duration: string;
  price: number;
  type: 'Retreat' | 'Experience' | 'Activity' | 'Workshop';
  location: string;
  image: string;
  description: string;
  badges: string[];
  pricingType: 'flat' | 'choice';
  options: AddOnChoiceOption[];
  discountEligible: boolean;
}

const PLACEHOLDER_ADDON_IMAGE =
  'https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=600&h=400&fit=crop&auto=format';

const mapRecordToAddOn = (r: AddOnRecord): AddOn => ({
  id: r._id,
  title: r.title,
  kind: r.kind,
  duration: r.duration || (r.kind === 'activity' ? '1 day' : ''),
  price: r.price ?? 0,
  type: (r.activityType as AddOn['type']) || 'Activity',
  location: r.location || '',
  image: resolveMediaUrl(r.image) || PLACEHOLDER_ADDON_IMAGE,
  description: r.description || '',
  badges: r.badges || [],
  pricingType: r.pricingType || 'flat',
  options: (r.options || []).map((o) => ({ label: o.label || '', price: o.price ?? 0, priceUnit: o.priceUnit })),
  discountEligible: r.discountEligible !== false,
});

const addOnUnitPrice = (addon: AddOn, choiceLabel?: string): number => {
  if (addon.pricingType === 'choice') {
    const opt = addon.options.find((o) => o.label === choiceLabel);
    return opt ? opt.price : 0;
  }
  return addon.price;
};

interface PreDeparture {
  id: string;
  dateRange: string;
  startDate: Date;
  endDate?: Date;
  seatsAvailable: number;
  totalSeats: number;
  pricePerPerson: number;
  badges: string[];
}

interface Promotion {
  _id: string;
  code: string;
  title: string;
  description?: string;
  type: 'global' | 'trip';
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  validFrom?: string;
  validUntil?: string;
}

export function TripDetailsFormPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { trip, loading, error } = useTrip(id || '');
  const departure = useMemo(() => {
    if (!id) return null;
    if (location.state?.departure) return location.state.departure as PreDeparture;
    const stored = sessionStorage.getItem(`trip-departure-${id}`);
    if (stored) {
      try {
        return JSON.parse(stored) as PreDeparture;
      } catch {
        return null;
      }
    }
    if (!trip) return null;
    const departures = trip.departures || [];
    if (departures.length > 0) {
      const sorted = departures
        .filter((departure) => departure.startDate)
        .slice()
        .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());
      const now = new Date();
      const next = sorted.find((departure) => new Date(departure.startDate) >= now) || sorted[0];
      if (next) {
        const startDate = new Date(next.startDate);
        const endDate = next.endDate ? new Date(next.endDate) : undefined;
        const dateRange = endDate
          ? `${startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${endDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`
          : startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
        const totalSeats = next.totalSeats ?? trip.maxGroupSize ?? 12;
        const seatsAvailable = next.seatsAvailable ?? totalSeats;
        return {
          id: next._id || next.id || `default-${id}`,
          dateRange,
          startDate,
          endDate,
          seatsAvailable,
          totalSeats,
          pricePerPerson: next.pricePerPerson ?? trip.price,
          badges: next.badges?.length ? next.badges : trip.sustainabilityBadges || [],
        } as PreDeparture;
      }
    }
    const fallbackDate = new Date();
    const dateRange = trip.season || 'Flexible dates';
    return {
      id: `default-${id}`,
      dateRange,
      startDate: fallbackDate,
      endDate: undefined,
      seatsAvailable: trip.maxGroupSize || 12,
      totalSeats: trip.maxGroupSize || 12,
      pricePerPerson: trip.price,
      badges: trip.sustainabilityBadges || [],
    } as PreDeparture;
  }, [id, location.state, trip]);

  // Form state
  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState(0);
  const [adultsInput, setAdultsInput] = useState('2');
  const [childrenInput, setChildrenInput] = useState('0');
  const [specialRequests, setSpecialRequests] = useState('');
  const [emergencyName, setEmergencyName] = useState('');
  const [emergencyPhone, setEmergencyPhone] = useState('');
  const [promoCode, setPromoCode] = useState('');
  const [activePromo, setActivePromo] = useState<Promotion | null>(null);
  const [promoMessage, setPromoMessage] = useState<string | null>(null);
  const [promoError, setPromoError] = useState<string | null>(null);
  const [isApplyingPromo, setIsApplyingPromo] = useState(false);

  // Add-ons state
  const [selectedAddOns, setSelectedAddOns] = useState<string[]>([]);
  const [addOnChoices, setAddOnChoices] = useState<Record<string, string>>({});
  const [addOns, setAddOns] = useState<AddOn[]>([]);
  const [durationFilter, setDurationFilter] = useState<string | null>(null);
  const [typeFilter, setTypeFilter] = useState<string | null>(null);
  const [locationFilter, setLocationFilter] = useState<string | null>(null);
  const [showAddOnDiscount, setShowAddOnDiscount] = useState(false);

  // Form validation
  const [errors, setErrors] = useState<Record<string, string>>({});

  const clearFieldError = (field: string) => {
    setErrors((prev) => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
  };
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);
    
    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  useEffect(() => {
    if (selectedAddOns.length > 0 && !showAddOnDiscount) {
      setShowAddOnDiscount(true);
    }
  }, [selectedAddOns]);

  useEffect(() => {
    let isActive = true;
    const tripId = trip?._id || trip?.id || id;
    const loadAddOns = async () => {
      try {
        const data = await addOnsApi.getAll({ status: 'active', ...(tripId ? { trip: tripId } : {}) });
        if (!isActive) return;
        setAddOns((data || []).map(mapRecordToAddOn));
      } catch (error) {
        if (isActive) setAddOns([]);
      }
    };

    loadAddOns();
    return () => {
      isActive = false;
    };
  }, [trip?._id, trip?.id, id]);

  useEffect(() => {
    setPromoCode('');
    setActivePromo(null);
    setPromoMessage(null);
    setPromoError(null);
    setIsApplyingPromo(false);
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-pulse space-y-3">
            <div className="h-6 w-40 bg-gray-200 rounded mx-auto" />
            <div className="h-4 w-64 bg-gray-200 rounded mx-auto" />
          </div>
        </div>
      </div>
    );
  }

  if (!trip || !departure || error) {
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

  const comfortAddOnsList = addOns.filter(addon => addon.kind === 'comfort');
  const activityAddOns = addOns.filter(addon => addon.kind === 'activity');

  const filteredAddOns = activityAddOns.filter(addon => {
    if (durationFilter && addon.duration !== durationFilter) return false;
    if (typeFilter && addon.type !== typeFilter) return false;
    if (locationFilter && addon.location !== locationFilter) return false;
    return true;
  });

  const setChoice = (addonId: string, label: string) => {
    setAddOnChoices(prev => ({ ...prev, [addonId]: label }));
    setSelectedAddOns(prev => {
      const opt = addOns.find(a => a.id === addonId)?.options.find(o => o.label === label);
      const shouldSelect = !!opt && opt.price > 0;
      if (shouldSelect) return prev.includes(addonId) ? prev : [...prev, addonId];
      return prev.filter(id => id !== addonId);
    });
  };

  const toggleAddOn = (addonId: string) => {
    setSelectedAddOns(prev =>
      prev.includes(addonId)
        ? prev.filter(id => id !== addonId)
        : [...prev, addonId]
    );
  };

  const addAllAddOns = () => {
    setSelectedAddOns(prev => Array.from(new Set([...prev, ...filteredAddOns.map(addon => addon.id)])));
  };

  const skipAddOns = () => {
    setSelectedAddOns(prev => prev.filter(id => !filteredAddOns.some(a => a.id === id)));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (adults < 1) newErrors.adults = 'At least one adult required';
    if (!emergencyName.trim()) newErrors.emergencyName = 'Emergency contact name is required';
    if (!emergencyPhone.trim()) newErrors.emergencyPhone = 'Emergency phone number is required';
    if (emergencyPhone && !/^\+?[\d\s-()]+$/.test(emergencyPhone)) {
      newErrors.emergencyPhone = 'Please enter a valid phone number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const formatPromoMessage = (promo: Promotion) => {
    const discountLabel =
      promo.discountType === 'percentage'
        ? `${promo.discountValue}% off`
        : `US $${promo.discountValue.toFixed(2)} off`;
    return `${promo?.title || 'Promo code'} applied — ${discountLabel}`;
  };

  const handleApplyPromo = async () => {
    const trimmedCode = promoCode.trim();
    if (!trimmedCode || !trip) {
      setPromoError('Enter a promo code to apply');
      return;
    }
    setIsApplyingPromo(true);
    setPromoError(null);
    try {
      const promotion = (await promotionsApi.validate(
        trimmedCode,
        trip._id || trip.id || id
      )) as Promotion;
      setActivePromo(promotion);
      setPromoMessage(formatPromoMessage(promotion));
    } catch (error: any) {
      setActivePromo(null);
      setPromoMessage(null);
      setPromoError(error?.message || 'Promo code could not be applied');
    } finally {
      setIsApplyingPromo(false);
    }
  };

  const handleRemovePromo = () => {
    setActivePromo(null);
    setPromoMessage(null);
    setPromoError(null);
    setPromoCode('');
  };

  const getPromoDiscount = (subtotalBeforePromo: number, promo: Promotion | null) => {
    if (!promo || subtotalBeforePromo <= 0) {
      return 0;
    }
    if (promo.discountType === 'percentage') {
      return subtotalBeforePromo * (promo.discountValue / 100);
    }
    return promo.discountValue;
  };

  const calculatePricing = (promo: Promotion | null) => {
    if (!departure) {
      return {
        baseTotal: 0,
        addOnsSubtotal: 0,
        addOnDiscount: 0,
        subtotal: 0,
        taxes: 0,
        total: 0,
        deposit: 0,
        promoDiscount: 0,
      };
    }

    const basePrice = departure.pricePerPerson || 0;
    const totalGuests = adults + children;
    const baseTotal = basePrice * totalGuests;
    let addOnsSubtotal = 0;
    let addOnDiscount = 0;
    selectedAddOns.forEach((addonId) => {
      const addon = addOns.find((a) => a.id === addonId);
      if (!addon) return;
      const line = addOnUnitPrice(addon, addOnChoices[addonId]) * totalGuests;
      addOnsSubtotal += line;
      if (addon.discountEligible) addOnDiscount += line * 0.1;
    });
    const subtotalBeforePromo = Math.max(baseTotal + addOnsSubtotal - addOnDiscount, 0);
    const promoDiscount = Math.min(subtotalBeforePromo, getPromoDiscount(subtotalBeforePromo, promo));
    const subtotal = subtotalBeforePromo - promoDiscount;
    const taxes = subtotal * 0.13;
    const total = subtotal;
    const deposit = total * 0.3;

    return {
      baseTotal,
      addOnsSubtotal,
      addOnDiscount,
      subtotal,
      taxes,
      total,
      deposit,
      promoDiscount,
    };
  };

  const handleSubmit = () => {
    if (validateForm()) {
      const bookingData = {
        trip,
        departure,
        adults,
        children,
        specialRequests,
        emergencyName,
        emergencyPhone,
        promoCode,
        selectedAddOns: selectedAddOns
          .map((addonId) => {
            const addon = addOns.find((a) => a.id === addonId);
            if (!addon) return null;
            const optionLabel = addon.pricingType === 'choice' ? addOnChoices[addonId] : undefined;
            return {
              id: addon.id,
              title: addon.title,
              kind: addon.kind,
              type: addon.type,
              optionLabel,
              duration: addon.duration,
              location: addon.location,
              discountEligible: addon.discountEligible,
              price: addOnUnitPrice(addon, optionLabel),
            };
          })
          .filter(Boolean),
        pricing,
        promoDiscount: pricing.promoDiscount,
      };

      navigate(`/trip/${id}/checkout`, { state: bookingData });
    }
  };

  const addOnDurations = Array.from(new Set(activityAddOns.map((addon) => addon.duration))).filter(Boolean);
  const addOnTypes = Array.from(new Set(activityAddOns.map((addon) => addon.type))).filter(Boolean);

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

  const pricing = calculatePricing(activePromo);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <ScrollAnimate animation="fade-in-up">
          <div className="mb-8">
            <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
              <Link to="/" className="hover:text-[var(--color-navy-600)]">Home</Link>
              <ChevronDown size={16} className="rotate-[-90deg]" />
              <Link to={`/trip/${id}`} className="hover:text-[var(--color-navy-600)]">{trip.title}</Link>
              <ChevronDown size={16} className="rotate-[-90deg]" />
              <span className="text-gray-900 font-semibold">Trip Details</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-2" style={{ fontFamily: 'Outfit, sans-serif' }}>
              Complete Your Booking
            </h1>
            <p className="text-lg text-gray-600">
              Just a few more details to confirm your adventure
            </p>
          </div>
        </ScrollAnimate>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Trip Summary */}
          <div className="lg:col-span-1">
            <ScrollAnimate animation="fade-in-up" delay={100}>
              <div className="sticky top-8">
                <Card className="glass-card overflow-hidden">
                  <div className="relative h-48">
                    <img 
                      src={resolveMediaUrl(trip.image || trip.featuredImage)}
                      alt={trip.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <div className="absolute bottom-4 left-4 right-4">
                      <h3 className="text-xl font-bold text-white mb-1">{trip.title}</h3>
                      <div className="flex items-center gap-2 text-white/90 text-sm">
                        <MapPin size={14} />
                        <span>{trip.region}{trip.country ? `, ${trip.country}` : ''}</span>
                      </div>
                    </div>
                  </div>
                  
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      <div className="flex items-center gap-3 pb-4 border-b border-gray-200">
                        <Calendar size={20} className="text-[var(--color-navy-600)]" />
                        <div>
                          <div className="text-sm text-gray-600">Departure</div>
                          <div className="font-semibold">{departure.dateRange}</div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 pb-4 border-b border-gray-200">
                        <Clock size={20} className="text-[var(--color-navy-600)]" />
                        <div>
                          <div className="text-sm text-gray-600">Duration</div>
                          <div className="font-semibold">{trip.duration} {Number(trip.duration) === 1 ? 'day' : 'days'}</div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 pb-4 border-b border-gray-200">
                        <Users size={20} className="text-[var(--color-navy-600)]" />
                        <div>
                          <div className="text-sm text-gray-600">Seats Available</div>
                          <div className="font-semibold">{departure.seatsAvailable} seats</div>
                        </div>
                      </div>

                      <div>
                        <div className="text-sm text-gray-600 mb-2">Sustainability</div>
                        <div className="flex flex-wrap gap-2">
                          {sustainabilityBadges.map((badge) => (
                            coreSustainabilityBadges.has(normalizeBadgeLabel(badge.label)) ? (
                              <SustainabilityBadge
                                key={badge.label}
                                label={badge.label}
                                size="sm"
                                className="w-fit"
                              />
                            ) : (
                              <div key={badge.label} className="flex items-center gap-1 px-2 py-1 rounded-full bg-gray-100 border border-gray-200">
                                <badge.icon size={12} className={badge.color} />
                                <span className="text-xs text-gray-700">{badge.label}</span>
                              </div>
                            )
                          ))}
                        </div>
                      </div>

                      <div className="pt-4 border-t border-gray-200">
                        <div className="text-sm text-gray-600 mb-1">Base Price</div>
                        <div className="text-3xl font-bold text-gray-900">
                          ${departure.pricePerPerson}
                        </div>
                        <div className="text-sm text-gray-600">per person</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </ScrollAnimate>
          </div>

          {/* Right Column - Booking Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Party Details */}
            <ScrollAnimate animation="fade-in-up" delay={150}>
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="text-[var(--color-navy-600)]" />
                    Party Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Adults */}
                    <div>
                      <Label htmlFor="adults" className="mb-2 block">
                        Adults (18+) <span className="text-red-500">*</span>
                      </Label>
                      <div className="flex items-center gap-3">
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          onClick={() => {
                            const next = Math.max(1, adults - 1);
                            setAdults(next);
                            setAdultsInput(String(next));
                          }}
                          aria-label="Decrease adults"
                        >
                          <Minus size={16} />
                        </Button>
                        <Input
                          id="adults"
                          type="number"
                          value={adultsInput}
                          onChange={(e) => {
                            const value = e.target.value;
                            setAdultsInput(value);
                            const parsed = Number(value);
                            if (Number.isInteger(parsed) && parsed >= 1) {
                              setAdults(parsed);
                            }
                          }}
                          onBlur={() => {
                            const parsed = Number(adultsInput);
                            const next = Number.isInteger(parsed) && parsed >= 1 ? parsed : 1;
                            setAdults(next);
                            setAdultsInput(String(next));
                          }}
                          className="text-center"
                          min={1}
                          aria-invalid={!!errors.adults}
                          aria-describedby={errors.adults ? "adults-error" : undefined}
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          onClick={() => {
                            const next = adults + 1;
                            setAdults(next);
                            setAdultsInput(String(next));
                          }}
                          aria-label="Increase adults"
                        >
                          <Plus size={16} />
                        </Button>
                      </div>
                      {errors.adults && (
                        <p id="adults-error" className="text-sm text-red-600 mt-1" role="alert">
                          {errors.adults}
                        </p>
                      )}
                    </div>

                    {/* Children */}
                    <div>
                      <Label htmlFor="children" className="mb-2 block">
                        Children (under 18)
                      </Label>
                      <div className="flex items-center gap-3">
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          onClick={() => {
                            const next = Math.max(0, children - 1);
                            setChildren(next);
                            setChildrenInput(String(next));
                          }}
                          aria-label="Decrease children"
                        >
                          <Minus size={16} />
                        </Button>
                        <Input
                          id="children"
                          type="number"
                          value={childrenInput}
                          onChange={(e) => {
                            const value = e.target.value;
                            setChildrenInput(value);
                            const parsed = Number(value);
                            if (Number.isInteger(parsed) && parsed >= 0) {
                              setChildren(parsed);
                            }
                          }}
                          onBlur={() => {
                            const parsed = Number(childrenInput);
                            const next = Number.isInteger(parsed) && parsed >= 0 ? parsed : 0;
                            setChildren(next);
                            setChildrenInput(String(next));
                          }}
                          className="text-center"
                          min={0}
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          onClick={() => {
                            const next = children + 1;
                            setChildren(next);
                            setChildrenInput(String(next));
                          }}
                          aria-label="Increase children"
                        >
                          <Plus size={16} />
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Special Requests */}
                  <div>
                    <Label htmlFor="special-requests" className="mb-2 block">
                      <div className="flex items-center gap-2 mb-1">
                        Special Requests
                        <span className="text-xs text-gray-500">(optional)</span>
                      </div>
                      <div className="flex flex-wrap gap-2 text-xs font-normal text-gray-600">
                        <span className="flex items-center gap-1">
                          <Utensils size={12} /> Dietary needs
                        </span>
                        <span className="flex items-center gap-1">
                          <Accessibility size={12} /> Accessibility
                        </span>
                        <span className="flex items-center gap-1">
                          <Info size={12} /> Other preferences
                        </span>
                      </div>
                    </Label>
                    <Textarea
                      id="special-requests"
                      value={specialRequests}
                      onChange={(e) => setSpecialRequests(e.target.value)}
                      placeholder="Let us know about any dietary restrictions, accessibility needs, or other preferences..."
                      rows={4}
                      className="resize-none border border-slate-200/80 focus-visible:border-[var(--color-navy-500)] focus-visible:ring-[var(--color-navy-500)]"
                    />
                  </div>

                  {/* Emergency Contact */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-gray-200">
                    <div>
                      <Label htmlFor="emergency-name" className="mb-2 block">
                        <User size={16} className="inline mr-2" />
                        Emergency Contact Name <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="emergency-name"
                        value={emergencyName}
                        onChange={(e) => {
                          setEmergencyName(e.target.value);
                          clearFieldError('emergencyName');
                        }}
                        placeholder="Full name"
                        aria-invalid={!!errors.emergencyName}
                        aria-describedby={errors.emergencyName ? "emergency-name-error" : undefined}
                      />
                      {errors.emergencyName && (
                        <p id="emergency-name-error" className="text-sm text-red-600 mt-1" role="alert">
                          {errors.emergencyName}
                        </p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="emergency-phone" className="mb-2 block">
                        <Phone size={16} className="inline mr-2" />
                        Emergency Contact Phone <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="emergency-phone"
                        type="tel"
                        value={emergencyPhone}
                        onChange={(e) => {
                          setEmergencyPhone(e.target.value);
                          clearFieldError('emergencyPhone');
                        }}
                        placeholder="+1 (555) 000-0000"
                        aria-invalid={!!errors.emergencyPhone}
                        aria-describedby={errors.emergencyPhone ? "emergency-phone-error" : undefined}
                      />
                      {errors.emergencyPhone && (
                        <p id="emergency-phone-error" className="text-sm text-red-600 mt-1" role="alert">
                          {errors.emergencyPhone}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Promo Code */}
                  <div className="pt-4 border-t border-gray-200">
                    <Label htmlFor="promo-code" className="mb-2 block">
                      <Tag size={16} className="inline mr-2" />
                      Promo Code <span className="text-xs text-gray-500">(optional)</span>
                    </Label>
                    <div className="flex gap-2">
                      <Input
                        id="promo-code"
                        value={promoCode}
                        onChange={(e) => {
                          setPromoCode(e.target.value.toUpperCase());
                          setPromoError(null);
                        }}
                        placeholder="Enter code"
                        disabled={!!activePromo}
                      />
                      <Button
                        type="button"
                        variant={activePromo ? 'outline' : 'default'}
                        onClick={activePromo ? handleRemovePromo : handleApplyPromo}
                        disabled={isApplyingPromo || (!activePromo && !promoCode.trim())}
                      >
                        {activePromo ? 'Remove' : isApplyingPromo ? 'Applying...' : 'Apply'}
                      </Button>
                    </div>
                    {promoError && (
                      <p className="text-sm text-red-600 mt-2">{promoError}</p>
                    )}
                    {activePromo && promoMessage && (
                      <p className="text-sm text-green-600 mt-2 flex items-center gap-1">
                        <Check size={14} /> {promoMessage}
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </ScrollAnimate>

            {/* Comfort Upgrades */}
            {comfortAddOnsList.length > 0 && (
              <ScrollAnimate animation="fade-in-up" delay={150}>
                <Card className="glass-card">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Bed className="text-[var(--color-navy-600)]" />
                      Comfort upgrades
                    </CardTitle>
                    <p className="text-sm text-gray-500">Optional add-ons for this trip. Prices are per person.</p>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {comfortAddOnsList.map((addon) => {
                      const isSelected = selectedAddOns.includes(addon.id);
                      return (
                        <div
                          key={addon.id}
                          className={`rounded-xl border-2 p-4 transition-colors ${
                            isSelected ? 'border-[var(--color-navy-600)] bg-[var(--color-navy-50)]' : 'border-gray-200'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <h4 className="font-semibold text-sm">{addon.title}</h4>
                              {addon.description && <p className="text-xs text-gray-600 mt-0.5">{addon.description}</p>}
                            </div>
                            {addon.pricingType === 'flat' && (
                              <div className="text-right flex-shrink-0">
                                <div className="font-bold">US ${addon.price}</div>
                                <div className="text-xs text-gray-500">per person</div>
                              </div>
                            )}
                          </div>

                          {addon.pricingType === 'choice' ? (
                            <div className="mt-3 space-y-1.5">
                              {addon.options.map((opt) => (
                                <label key={opt.label} className="flex items-center justify-between cursor-pointer text-sm">
                                  <span className="flex items-center gap-2">
                                    <input
                                      type="radio"
                                      name={`comfort-${addon.id}`}
                                      className="accent-[var(--color-navy-600)]"
                                      checked={(addOnChoices[addon.id] ?? '') === opt.label}
                                      onChange={() => setChoice(addon.id, opt.label)}
                                    />
                                    {opt.label}
                                  </span>
                                  <span className="font-medium">
                                    {opt.price > 0 ? `+ US $${opt.price}` : opt.priceUnit || 'Included'}
                                  </span>
                                </label>
                              ))}
                            </div>
                          ) : (
                            <label className="mt-3 flex items-center gap-2 cursor-pointer text-sm">
                              <input
                                type="checkbox"
                                className="accent-[var(--color-navy-600)]"
                                checked={isSelected}
                                onChange={() => toggleAddOn(addon.id)}
                              />
                              Add to my trip
                            </label>
                          )}
                        </div>
                      );
                    })}
                  </CardContent>
                </Card>
              </ScrollAnimate>
            )}

            {/* Add-Ons Panel */}
            <ScrollAnimate animation="fade-in-up" delay={200}>
              <Card className="glass-card">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2 mb-2">
                        <Plus className="text-[var(--color-sun-600)]" />
                        Add Local Adventures
                      </CardTitle>
                      <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r from-[var(--color-sun-100)] to-[var(--color-sun-50)] border border-[var(--color-sun-300)] w-fit">
                        <Tag size={14} className="text-[var(--color-sun-700)]" />
                        <span className="text-sm font-semibold text-[var(--color-sun-700)]">
                          Get 10% off each add-on
                        </span>
                      </div>
                    </div>
                    {showAddOnDiscount && (
                      <div className={`px-4 py-2 rounded-xl bg-gradient-to-r from-[var(--color-sun-500)] to-[var(--color-sun-600)] text-white font-semibold shadow-lg ${
                        prefersReducedMotion ? '' : 'animate-bounce-subtle'
                      }`}>
                        -US ${pricing.addOnDiscount.toFixed(2)} saved!
                      </div>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Filter Chips */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                      <Filter size={16} />
                      Filter Add-Ons
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {/* Duration Filters */}
                      <div className="flex gap-2">
                        {addOnDurations.map(duration => (
                          <button
                            key={duration}
                            onClick={() => setDurationFilter(durationFilter === duration ? null : duration)}
                            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-200 ${
                              durationFilter === duration
                                ? 'bg-[var(--color-navy-600)] text-white shadow-md'
                                : 'bg-white border border-gray-300 text-gray-700 hover:border-[var(--color-navy-400)]'
                            }`}
                            aria-pressed={durationFilter === duration}
                          >
                            {duration}
                          </button>
                        ))}
                      </div>
                      <div className="w-px h-6 bg-gray-300"></div>
                      {/* Type Filters */}
                      <div className="flex gap-2">
                        {addOnTypes.map(type => (
                          <button
                            key={type}
                            onClick={() => setTypeFilter(typeFilter === type ? null : type)}
                            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-200 ${
                              typeFilter === type
                                ? 'bg-[var(--color-forest-600)] text-white shadow-md'
                                : 'bg-white border border-gray-300 text-gray-700 hover:border-[var(--color-forest-400)]'
                            }`}
                            aria-pressed={typeFilter === type}
                          >
                            {type}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Add-On Cards Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4" role="list" aria-label="Available add-ons">
                    {filteredAddOns.slice(0, 6).map((addon, index) => {
                      const isSelected = selectedAddOns.includes(addon.id);
                      return (
                        <div
                          key={addon.id}
                          className={`group relative rounded-xl overflow-hidden border-2 transition-all duration-300 ${
                            isSelected
                              ? 'border-[var(--color-navy-600)] shadow-lg ring-2 ring-[var(--color-navy-200)]'
                              : 'border-gray-200 hover:border-[var(--color-navy-400)] hover:shadow-md'
                          } ${prefersReducedMotion ? '' : 'hover:-translate-y-1'}`}
                          role="listitem"
                        >
                          <div className="relative h-32">
                            <img 
                              src={addon.image}
                              alt={addon.title}
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                            <Badge className="absolute top-2 left-2 bg-white/90 text-gray-900">
                              {addon.duration}
                            </Badge>
                            <button
                              onClick={() => toggleAddOn(addon.id)}
                              className={`absolute top-2 right-2 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 ${
                                isSelected
                                  ? 'bg-[var(--color-navy-600)] text-white shadow-lg scale-110'
                                  : 'bg-white/90 text-gray-700 hover:bg-white'
                              }`}
                              aria-label={isSelected ? `Remove ${addon.title}` : `Add ${addon.title}`}
                              aria-pressed={isSelected}
                            >
                              {isSelected ? <Check size={16} /> : <Plus size={16} />}
                            </button>
                          </div>
                          <div className="p-4 bg-white">
                            <div className="flex items-start justify-between gap-2 mb-2">
                              <h4 className="font-semibold text-sm line-clamp-2">{addon.title}</h4>
                              <button 
                                className="text-gray-500 hover:text-[var(--color-navy-600)] transition-colors"
                                aria-label={`More info about ${addon.title}`}
                              >
                                <Info size={16} />
                              </button>
                            </div>
                            <p className="text-xs text-gray-600 mb-3 line-clamp-2">{addon.description}</p>
                            <div className="flex items-center justify-between">
                              <div>
                                <div className="font-bold text-lg">US ${addon.price}</div>
                                <div className="text-xs text-gray-500">per person</div>
                              </div>
                              <div className="flex gap-1">
                                {addon.badges.slice(0, 2).map(badge => {
                                  const badgeInfo = sustainabilityBadges.find(b => b.label === badge);
                                  return badgeInfo ? (
                                    <div key={badge} className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center" title={badge}>
                                      <badgeInfo.icon size={12} className={badgeInfo.color} />
                                    </div>
                                  ) : null;
                                })}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Add All / Skip Buttons */}
                  <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-200">
                    <Button
                      variant="outline"
                      onClick={addAllAddOns}
                      className="flex-1"
                      disabled={selectedAddOns.length === filteredAddOns.length}
                    >
                      <Plus size={16} className="mr-2" />
                      Add All ({filteredAddOns.length})
                    </Button>
                    <Button
                      variant="ghost"
                      onClick={skipAddOns}
                      className="flex-1 border-2 border-gray-300 hover:bg-gray-100"
                      disabled={selectedAddOns.length === 0}
                    >
                      <X size={16} className="mr-2" />
                      Skip Add-Ons
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </ScrollAnimate>

            {/* Price Summary */}
            <ScrollAnimate animation="fade-in-up" delay={250}>
              <Card className="glass-card sticky bottom-8">
                <CardHeader>
                  <CardTitle>Price Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex justify-between text-gray-700">
                      <span>Base Trip ({adults + children} {adults + children === 1 ? 'person' : 'people'})</span>
                      <span className="font-semibold">US ${pricing.baseTotal.toFixed(2)}</span>
                    </div>
                    
                    {selectedAddOns.length > 0 && (
                      <>
                        <div className="flex justify-between text-gray-700">
                          <span>Add-ons Subtotal ({selectedAddOns.length})</span>
                          <span className="font-semibold">US ${pricing.addOnsSubtotal.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-[var(--color-sun-600)]">
                          <span className="flex items-center gap-1">
                            <Tag size={14} />
                            Add-on Discount (10%)
                          </span>
                          <span className="font-semibold">-US ${pricing.addOnDiscount.toFixed(2)}</span>
                        </div>
                      </>
                    )}

                    {pricing.promoDiscount > 0 && (
                      <div className="flex justify-between text-[var(--color-forest-600)]">
                        <span className="flex items-center gap-1 text-sm">
                          <Tag size={12} />
                          Promo discount
                        </span>
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
                      <div className="flex justify-between items-center">
                        <span className="text-lg font-bold">Total</span>
                        <span className="text-2xl font-bold text-gray-900">US ${pricing.total.toFixed(2)}</span>
                      </div>
                    </div>
                    
                    <div className="bg-[var(--color-navy-50)] rounded-lg p-4 border border-[var(--color-navy-200)]">
                      <div className="flex items-center gap-2 mb-1">
                        <Shield size={16} className="text-[var(--color-navy-600)]" />
                        <span className="font-semibold text-gray-900">Estimated Deposit (30%)</span>
                      </div>
                      <div className="text-2xl font-bold text-[var(--color-navy-700)]">
                        US ${pricing.deposit.toFixed(2)}
                      </div>
                      <p className="text-xs text-gray-600 mt-1">
                        Pay remaining US ${(pricing.total - pricing.deposit).toFixed(2)} before departure
                      </p>
                    </div>
                  </div>

                  <Button
                    className="w-full bg-gradient-to-r from-[var(--color-navy-600)] to-[var(--color-forest-600)] hover:from-[var(--color-navy-700)] hover:to-[var(--color-forest-700)] text-lg py-6"
                    onClick={handleSubmit}
                  >
                    Proceed to Checkout
                    <ArrowRight size={20} className="ml-2" />
                  </Button>
                  
                  <p className="text-xs text-gray-500 text-center">
                    By proceeding, you agree to our terms and conditions
                  </p>
                </CardContent>
              </Card>
            </ScrollAnimate>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes bounce-subtle {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-5px); }
        }
        .animate-bounce-subtle {
          animation: bounce-subtle 2s ease-in-out infinite;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}
