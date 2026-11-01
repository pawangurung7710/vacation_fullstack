import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { MapPin, Calendar, Users, ArrowRight, ShieldCheck } from 'lucide-react';
import { bookingApi } from '../services/api';

interface BookingPublic {
  _id: string;
  status: string;
  paymentStatus?: string;
  numberOfParticipants: number;
  departureDate: string;
  totalPrice: number;
  specialRequests?: string;
  promoCode?: string;
  emergencyContact?: {
    name?: string;
    phone?: string;
  };
  party?: {
    adults?: number;
    children?: number;
  };
  addOns?: Array<{
    id?: string;
    title?: string;
    kind?: string;
    type?: string;
    optionLabel?: string;
    duration?: string;
    location?: string;
    discountEligible?: boolean;
    price?: number;
  }>;
  consents?: {
    termsAccepted?: boolean;
    marketingOptIn?: boolean;
    travelInsuranceAcknowledged?: boolean;
  };
  guestInfo?: {
    name?: string;
    email?: string;
    phone?: string;
  };
  user?: {
    name?: string;
    email?: string;
  };
  trip?: {
    title?: string;
    image?: string;
    region?: string;
    country?: string;
    duration?: string;
    price?: number;
    category?: {
      label?: string;
    };
    subcategory?: {
      label?: string;
    };
    highlights?: string[];
    inclusions?: string[];
    itinerary?: Array<{ day?: string; title?: string; description?: string }>;
    departures?: Array<{ startDate?: string; endDate?: string; pricePerPerson?: number; seatsAvailable?: number }>;
  };
}

const formatDate = (value?: string) => {
  if (!value) return '—';
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return '—';
  return parsed.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

const formatCurrency = (value?: number) => {
  if (value === null || value === undefined) return '—';
  return `US $${value.toLocaleString()}`;
};

const InfoRow = ({ label, value }: { label: string; value?: string | number | null }) => (
  <div className="space-y-1">
    <div className="text-xs uppercase tracking-wide text-gray-500">{label}</div>
    <div className="text-sm font-semibold text-gray-900">{value ?? '—'}</div>
  </div>
);

export function BookingPublicPage() {
  const { id: tripId, bookingId } = useParams<{ id: string; bookingId?: string }>();
  const location = useLocation();
  const [booking, setBooking] = useState<BookingPublic | null>(null);
  const [loading, setLoading] = useState(true);

  const token = useMemo(() => {
    const params = new URLSearchParams(location.search);
    return params.get('token');
  }, [location.search]);

  useEffect(() => {
    const load = async () => {
      if (!bookingId || !tripId) return;
      setLoading(true);
      try {
        const data = await bookingApi.getConfirmation(bookingId, tripId, token || undefined);
        setBooking(data);
      } catch (error) {
        setBooking(null);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [bookingId, tripId, token]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-pulse space-y-3">
            <div className="h-6 w-40 bg-gray-200 rounded mx-auto" />
            <div className="h-4 w-64 bg-gray-200 rounded mx-auto" />
          </div>
        </div>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center space-y-4">
          <h2 className="text-2xl font-semibold">Booking not found</h2>
          <Link to="/all-trips">
            <Button>Browse trips</Button>
          </Link>
        </div>
      </div>
    );
  }

  const guestName = booking.guestInfo?.name || booking.user?.name || 'Guest';
  const guestEmail = booking.guestInfo?.email || booking.user?.email || '—';
  const tripLocation = booking.trip?.region
    ? `${booking.trip.region}${booking.trip.country ? `, ${booking.trip.country}` : ''}`
    : booking.trip?.country || '—';
  const totalGuests = booking.numberOfParticipants || 0;
  const adults = booking.party?.adults ?? totalGuests;
  const children = booking.party?.children ?? 0;
  const addOns = booking.addOns || [];
  const addOnsSubtotal = addOns.reduce(
    (sum, addon) => sum + (addon.price || 0) * totalGuests,
    0
  );
  const addOnDiscount = addOns.reduce(
    (sum, addon) => sum + ((addon as any).discountEligible === false ? 0 : (addon.price || 0) * totalGuests * 0.1),
    0
  );
  const matchedDeparture = (booking.trip?.departures || []).find((d: any) => {
    if (!d?.startDate || !booking.departureDate) return false;
    return new Date(d.startDate).toDateString() === new Date(booking.departureDate).toDateString();
  });
  const basePrice = matchedDeparture?.pricePerPerson ?? booking.trip?.price ?? 0;
  const baseTotal = basePrice * totalGuests;
  const promoDiscount = booking.promoDiscount ?? 0;
  const subtotalBeforePromo = Math.max(baseTotal + addOnsSubtotal - addOnDiscount, 0);
  const derivedSubtotal = Math.max(subtotalBeforePromo - promoDiscount, 0);
  const total = booking.totalPrice ?? derivedSubtotal;
  const subtotal = total;
  const taxes = subtotal * 0.13;
  const promoCode =
    booking.promoCode ||
    booking.promotion?.code ||
    (booking.promotion?.title ? booking.promotion.title : undefined);

  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <Card className="glass-card">
          <CardContent className="p-6 md:p-8 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-[var(--color-forest-600)]">
                <ShieldCheck size={16} />
                Secure booking verification
              </div>
              <h1 className="text-3xl font-semibold text-gray-900">{booking.trip?.title || 'Booking details'}</h1>
              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <MapPin size={14} />
                  <span>{tripLocation}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar size={14} />
                  <span>{formatDate(booking.departureDate)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users size={14} />
                  <span>{booking.numberOfParticipants} guests</span>
                </div>
              </div>
            </div>
            {booking.trip?.image && (
              <img
                src={booking.trip.image}
                alt={booking.trip.title || 'Trip'}
                className="w-full md:w-56 h-36 object-cover rounded-2xl border border-gray-200"
              />
            )}
          </CardContent>
        </Card>

        <div className="grid gap-6 lg:grid-cols-[2fr,1fr]">
          <div className="space-y-6">
            <Card className="glass-card">
              <CardHeader>
                <CardTitle>Booking overview</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <InfoRow label="Booking ID" value={booking._id} />
                <InfoRow label="Status" value={booking.status} />
                <InfoRow label="Payment status" value={booking.paymentStatus || '—'} />
                <InfoRow label="Trip date" value={formatDate(booking.departureDate)} />
                <InfoRow label="Total price" value={formatCurrency(booking.totalPrice)} />
                <InfoRow label="Promo code" value={promoCode || '—'} />
                <InfoRow label="Participants" value={booking.numberOfParticipants} />
                <InfoRow label="Adults" value={booking.party?.adults ?? '—'} />
                <InfoRow label="Children" value={booking.party?.children ?? '—'} />
              </CardContent>
            </Card>

            <Card className="glass-card">
              <CardHeader>
                <CardTitle>Traveler details</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-4 sm:grid-cols-2">
                <InfoRow label="Name" value={guestName} />
                <InfoRow label="Email" value={guestEmail} />
                <InfoRow label="Phone" value={booking.guestInfo?.phone || '—'} />
                <InfoRow label="Emergency contact" value={booking.emergencyContact?.name || '—'} />
                <InfoRow label="Emergency phone" value={booking.emergencyContact?.phone || '—'} />
              </CardContent>
            </Card>

            <Card className="glass-card">
              <CardHeader>
                <CardTitle>Preferences</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <InfoRow label="Promo code" value={booking.promoCode || '—'} />
                {booking.specialRequests && (
                  <div className="text-sm text-gray-600 bg-gray-50 rounded-xl p-4">
                    {booking.specialRequests}
                  </div>
                )}
              </CardContent>
            </Card>

            {booking.addOns && booking.addOns.length > 0 && (
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle>Add-ons</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {booking.addOns.map((addon, index) => (
                    <div key={`${addon.id || addon.title || index}`} className="rounded-xl border border-gray-200 bg-white p-4">
                      <div className="font-semibold text-gray-900">{addon.title}</div>
                      <div className="text-sm text-gray-600">
                        {[addon.type, addon.duration, addon.location].filter(Boolean).join(' • ') || '—'}
                      </div>
                      {addon.price !== undefined && (
                        <div className="text-sm text-gray-900 mt-2">Price: ${addon.price}</div>
                      )}
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
          </div>

          <div className="space-y-6">
            <Card className="glass-card">
              <CardHeader>
                <CardTitle>Trip overview</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <InfoRow label="Category" value={booking.trip?.category?.label || '—'} />
                <InfoRow label="Subcategory" value={booking.trip?.subcategory?.label || '—'} />
                <InfoRow label="Location" value={tripLocation} />
                <InfoRow label="Duration" value={booking.trip?.duration || '—'} />
                <InfoRow label="Base price" value={formatCurrency(booking.trip?.price)} />
                {booking.trip?.highlights && booking.trip.highlights.length > 0 && (
                  <div>
                    <div className="text-xs uppercase tracking-wide text-gray-500 mb-2">Highlights</div>
                    <ul className="space-y-2 text-sm text-gray-700">
                      {booking.trip.highlights.map((item) => (
                        <li key={item} className="rounded-lg bg-gray-50 px-3 py-2">
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {booking.trip?.inclusions && booking.trip.inclusions.length > 0 && (
                  <div>
                    <div className="text-xs uppercase tracking-wide text-gray-500 mb-2">Inclusions</div>
                    <ul className="space-y-2 text-sm text-gray-700">
                      {booking.trip.inclusions.map((item) => (
                        <li key={item} className="rounded-lg bg-white border border-gray-200 px-3 py-2">
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="glass-card">
              <CardHeader>
                <CardTitle>Price summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Base Trip ({totalGuests} guest{totalGuests === 1 ? '' : 's'})</span>
                  <span className="font-semibold">US ${baseTotal.toFixed(2)}</span>
                </div>
                {addOns.length > 0 && (
                  <>
                    <div className="flex justify-between text-gray-600">
                      <span>Add-ons Subtotal</span>
                      <span className="font-semibold">US ${addOnsSubtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-[var(--color-sun-600)]">
                      <span>Add-on Discount (10%)</span>
                      <span className="font-semibold">-US ${addOnDiscount.toFixed(2)}</span>
                    </div>
                  </>
                )}
                {promoDiscount > 0 && (
                  <div className="flex justify-between text-[var(--color-forest-600)]">
                    <span>Promo discount</span>
                    <span className="font-semibold">-US ${promoDiscount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-semibold">US ${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">VAT (included, 13%)</span>
                  <span className="font-semibold">-US ${taxes.toFixed(2)}</span>
                </div>
                <div className="pt-3 border-t border-gray-200 flex justify-between">
                  <span className="font-semibold">Total amount</span>
                  <span className="text-2xl font-bold text-gray-900">US ${total.toFixed(2)}</span>
                </div>
              </CardContent>
            </Card>

            <Card className="glass-card">
              <CardHeader>
                <CardTitle>Need help?</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm text-gray-600">
                <p>Reach out if you have questions about your booking.</p>
                <Link to="/contact" className="inline-flex items-center gap-2 text-[var(--color-navy-600)]">
                  Contact Support
                  <ArrowRight size={14} />
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
