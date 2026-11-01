import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { PageHeader } from '../components/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { StatusBadge } from '../components/StatusBadge';
import { bookingApi } from '../../services/api';
import { format } from 'date-fns';
import { ArrowLeft, Download } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { toast } from 'sonner';
import { Skeleton } from '../../components/ui/skeleton';
import logoUrl from '../../../assets/trekkers-logo.png';
import { getItineraryLabel } from '../../utils/itinerary';

interface BookingDetail {
  _id: string;
  status: string;
  paymentStatus?: string;
  numberOfParticipants: number;
  totalPrice: number;
  departureDate: string;
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
  qrUrl?: string;
  qrImage?: string;
  notes?: string;
  adminNotes?: string;
  createdAt?: string;
  updatedAt?: string;
  guestInfo?: {
    name?: string;
    email?: string;
    phone?: string;
  };
  user?: {
    name?: string;
    email?: string;
  };
  trip?: TripDetail;
}

interface TripDetail {
  _id: string;
  title?: string;
  slug?: string;
  category?: {
    label?: string;
    slug?: string;
  };
  subcategory?: {
    label?: string;
    slug?: string;
  };
  regionRef?: {
    name?: string;
    slug?: string;
  };
  region?: string;
  country?: string;
  duration?: string;
  difficulty?: string;
  price?: number;
  image?: string;
  description?: string;
  highlights?: string[];
  sustainabilityBadges?: string[];
  maxGroupSize?: number;
  season?: string;
  departures?: TripDeparture[];
  inclusions?: string[];
  itinerary?: TripItineraryItem[];
  zeroWasteNotes?: string;
  status?: string;
  createdBy?: {
    name?: string;
    email?: string;
  };
}

interface TripDeparture {
  startDate?: string;
  endDate?: string;
  pricePerPerson?: number;
  totalSeats?: number;
  seatsAvailable?: number;
  status?: string;
  badges?: string[];
  notes?: string;
}

interface TripItineraryItem {
  day?: string;
  title?: string;
  description?: string;
}

const formatDate = (value?: string) => {
  if (!value) return '—';
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return '—';
  return format(parsed, 'MMM d, yyyy');
};

const formatCurrency = (value?: number) => {
  if (value === null || value === undefined) return '—';
  return `US $${value.toLocaleString()}`;
};

const InfoRow = ({ label, value }: { label: string; value?: string | number | null }) => (
  <div className="space-y-1">
    <div className="text-xs uppercase tracking-wide text-muted-foreground">{label}</div>
    <div className="text-sm font-medium text-[var(--cms-foreground)]">{value ?? '—'}</div>
  </div>
);

export function BookingDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState<BookingDetail | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [qrDialogOpen, setQrDialogOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState('pending');
  const [selectedPaymentStatus, setSelectedPaymentStatus] = useState('pending');
  const [savingStatus, setSavingStatus] = useState(false);
  const [savingPayment, setSavingPayment] = useState(false);
  const [exportingPdf, setExportingPdf] = useState(false);
  const exportRef = useRef<HTMLDivElement | null>(null);

  const statusOptions = ['pending', 'confirmed', 'cancelled', 'completed'];
  const paymentOptions = ['pending', 'partial', 'paid', 'refunded'];

  useEffect(() => {
    const load = async () => {
      if (!id) return;
      setLoading(true);
      try {
        const data = await bookingApi.getById(id);
        setBooking(data);
        setError(null);
      } catch (loadError) {
        setError('Unable to load booking details.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  useEffect(() => {
    if (booking?.status) {
      setSelectedStatus(booking.status);
    }
    if (booking?.paymentStatus) {
      setSelectedPaymentStatus(booking.paymentStatus);
    }
  }, [booking?.status, booking?.paymentStatus]);

  const handleStatusSave = async () => {
    if (!id || !booking) return;
    setSavingStatus(true);
    try {
      const updated = await bookingApi.update(id, { status: selectedStatus });
      setBooking((prev) => (prev ? { ...prev, status: updated.status } : prev));
      toast.success('Booking status updated.');
      setStatusDialogOpen(false);
    } catch (updateError) {
      toast.error('Failed to update booking status.');
    } finally {
      setSavingStatus(false);
    }
  };

  const handlePaymentSave = async () => {
    if (!id || !booking) return;
    setSavingPayment(true);
    try {
      const updated = await bookingApi.update(id, { paymentStatus: selectedPaymentStatus });
      setBooking((prev) => (prev ? { ...prev, paymentStatus: updated.paymentStatus } : prev));
      toast.success('Payment status updated.');
      setPaymentDialogOpen(false);
    } catch (updateError) {
      toast.error('Failed to update payment status.');
    } finally {
      setSavingPayment(false);
    }
  };

  const handleExportPdf = async () => {
    if (!exportRef.current) {
      toast.error('Unable to export booking details.');
      return;
    }

    setExportingPdf(true);

    try {
      const { jsPDF } = await import('jspdf');
      const pdf = new jsPDF('p', 'pt', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 40;
      const background = { r: 247, g: 248, b: 251 };
      const accent = { r: 31, g: 77, b: 79 };
      const border = { r: 226, g: 220, b: 209 };
      const card = { r: 255, g: 255, b: 255 };
      let y = margin;

      const paintBackground = () => {
        pdf.setFillColor(background.r, background.g, background.b);
        pdf.rect(0, 0, pageWidth, pageHeight, 'F');
      };

      const addPage = () => {
        pdf.addPage();
        paintBackground();
        y = margin;
      };

      const ensureSpace = (height: number) => {
        if (y + height > pageHeight - margin) {
          addPage();
        }
      };

      const loadLogo = async () => {
        return new Promise<HTMLImageElement | null>((resolve) => {
          const img = new Image();
          img.onload = () => resolve(img);
          img.onerror = () => resolve(null);
          img.src = logoUrl;
        });
      };

      const addCard = (title: string, rows: Array<[string, string]>, paragraphs: string[] = []) => {
        const cardWidth = pageWidth - margin * 2;
        const padding = 16;
        const titleLines = pdf.splitTextToSize(title, cardWidth - padding * 2);
        const rowsHeight = rows.length * 16;
        const paragraphLines = paragraphs.flatMap((text) => pdf.splitTextToSize(text, cardWidth - padding * 2));
        const paragraphsHeight = paragraphLines.length * 14 + (paragraphLines.length > 0 ? 6 : 0);
        const cardHeight = padding + titleLines.length * 16 + 8 + rowsHeight + paragraphsHeight + padding;

        ensureSpace(cardHeight);
        pdf.setFillColor(card.r, card.g, card.b);
        pdf.setDrawColor(border.r, border.g, border.b);
        pdf.roundedRect(margin, y, cardWidth, cardHeight, 10, 10, 'FD');

        let innerY = y + padding;
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(12);
        pdf.setTextColor(accent.r, accent.g, accent.b);
        pdf.text(titleLines, margin + padding, innerY);
        innerY += titleLines.length * 16;

        pdf.setDrawColor(border.r, border.g, border.b);
        pdf.line(margin + padding, innerY, margin + cardWidth - padding, innerY);
        innerY += 12;

        rows.forEach(([label, value]) => {
          pdf.setFont('helvetica', 'normal');
          pdf.setFontSize(9);
          pdf.setTextColor(110, 110, 115);
          pdf.text(label, margin + padding, innerY);
          pdf.setFont('helvetica', 'bold');
          pdf.setTextColor(43, 43, 43);
          pdf.text(value || '—', margin + padding + 170, innerY);
          innerY += 16;
        });

        if (paragraphLines.length > 0) {
          pdf.setFont('helvetica', 'normal');
          pdf.setFontSize(10);
          pdf.setTextColor(43, 43, 43);
          pdf.text(paragraphLines, margin + padding, innerY);
        }

        y += cardHeight + 16;
      };

      paintBackground();

      const logo = await loadLogo();
      const logoWidth = 72;
      const logoHeight = logo ? (logo.height / logo.width) * logoWidth : 0;
      const headerTextX = margin + logoWidth + 16;

      if (logo) {
        pdf.addImage(logo, 'PNG', margin, y - 6, logoWidth, logoHeight);
      } else {
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(18);
        pdf.setTextColor(accent.r, accent.g, accent.b);
        pdf.text('The Trekkers Squad', margin, y + 12);
      }

      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(18);
      pdf.setTextColor(accent.r, accent.g, accent.b);
      pdf.text('Booking Confirmation', headerTextX, y + 14);
      y += 40;

      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(11);
      pdf.setTextColor(43, 43, 43);
      pdf.text(booking?.trip?.title || 'Trip details', headerTextX, y);
      y += 14;
      pdf.setFontSize(9);
      pdf.setTextColor(110, 110, 115);
      pdf.text(`Booking ID: ${booking?._id || '—'}`, headerTextX, y);
      y += 20;

      addCard('Booking overview', [
        ['Status', booking?.status || '—'],
        ['Payment status', booking?.paymentStatus || '—'],
        ['Trip date', formatDate(booking?.departureDate)],
        ['Participants', String(booking?.numberOfParticipants ?? '—')],
        ['Adults', booking?.party?.adults !== undefined ? String(booking.party.adults) : '—'],
        ['Children', booking?.party?.children !== undefined ? String(booking.party.children) : '—'],
        ['Total price', formatCurrency(booking?.totalPrice)],
        ['Created', formatDate(booking?.createdAt)],
      ]);

      addCard('Traveler details', [
        ['Name', booking?.guestInfo?.name || booking?.user?.name || 'Guest'],
        ['Email', booking?.guestInfo?.email || booking?.user?.email || '—'],
        ['Phone', booking?.guestInfo?.phone || '—'],
        ['Emergency contact', booking?.emergencyContact?.name || '—'],
        ['Emergency phone', booking?.emergencyContact?.phone || '—'],
      ]);

      const preferenceParagraphs = [];
      if (booking?.specialRequests) preferenceParagraphs.push(`Special requests: ${booking.specialRequests}`);
      if (booking?.notes) preferenceParagraphs.push(`Guest notes: ${booking.notes}`);

      addCard(
        'Preferences',
        [['Promo code', booking?.promoCode || '—']],
        preferenceParagraphs.length > 0 ? preferenceParagraphs : ['No additional preferences recorded.']
      );

      addCard('Consents', [
        ['Terms accepted', booking?.consents?.termsAccepted ? 'Yes' : 'No'],
        ['Marketing opt-in', booking?.consents?.marketingOptIn ? 'Yes' : 'No'],
        ['Travel insurance acknowledged', booking?.consents?.travelInsuranceAcknowledged ? 'Yes' : 'No'],
      ]);

      addCard('Trip overview', [
        ['Trip', booking?.trip?.title || '—'],
        ['Category', booking?.trip?.category?.label || '—'],
        ['Subcategory', booking?.trip?.subcategory?.label || '—'],
        ['Region', booking?.trip?.region || booking?.trip?.regionRef?.name || '—'],
        ['Country', booking?.trip?.country || '—'],
        ['Duration', booking?.trip?.duration || '—'],
        ['Difficulty', booking?.trip?.difficulty || '—'],
        ['Base price', formatCurrency(booking?.trip?.price)],
      ]);

      const priceRows: Array<[string, string]> = [];
      priceRows.push([
        `Base Trip (${booking?.numberOfParticipants ?? 0} guest${(booking?.numberOfParticipants ?? 0) === 1 ? '' : 's'})`,
        formatCurrency(baseTotal),
      ]);
      if (addOns.length > 0) {
        priceRows.push(['Add-ons Subtotal', formatCurrency(addOnsSubtotal)]);
        priceRows.push(['Add-on Discount (10%)', `-${formatCurrency(addOnDiscount)}`]);
      }
      if (promoDiscount > 0) {
        priceRows.push(['Promo discount', `-${formatCurrency(promoDiscount)}`]);
      }
      priceRows.push(['Subtotal', formatCurrency(subtotal)]);
      priceRows.push(['VAT (included, 13%)', `-${formatCurrency(taxes)}`]);
      priceRows.push(['Total amount', formatCurrency(total)]);
      addCard('Price summary', priceRows);

      if (booking?.trip?.highlights?.length) {
        addCard('Highlights', [], booking.trip.highlights);
      }

      if (booking?.trip?.inclusions?.length) {
        addCard('Inclusions', [], [booking.trip.inclusions.join(' • ')]);
      }

      if (booking?.addOns?.length) {
        addCard(
          'Add-ons',
          booking.addOns.map((addon, index) => [`Add-on ${index + 1}`, addon.title || '—']),
          booking.addOns.map((addon) => [addon.type, addon.duration, addon.location].filter(Boolean).join(' • '))
        );
      }

      if (booking?.trip?.itinerary?.length) {
        const itineraryParagraphs = booking.trip.itinerary.map((item, index) => {
          const label = getItineraryLabel(item.day, index);
          return `${label} - ${item.title || 'Untitled'}: ${item.description || '—'}`;
        });
        addCard('Itinerary', [], itineraryParagraphs);
      }

      if (booking?.trip?.departures?.length) {
        const departureParagraphs = booking.trip.departures.map((departure, index) =>
          [
            `Departure ${index + 1}: ${formatDate(departure.startDate)}`,
            departure.endDate ? `End: ${formatDate(departure.endDate)}` : '',
            departure.pricePerPerson !== undefined ? `Price/person: ${formatCurrency(departure.pricePerPerson)}` : '',
            departure.seatsAvailable !== undefined ? `Seats available: ${departure.seatsAvailable}` : '',
          ]
            .filter(Boolean)
            .join(' • ')
        );
        addCard('Departures', [], departureParagraphs);
      }

      const fileName = `booking-${booking?._id || 'confirmation'}.pdf`;
      pdf.save(fileName);
    } catch (error) {
      console.error('PDF export failed:', error);
      const message = error instanceof Error ? error.message : 'Failed to export PDF.';
      toast.error(message);
    } finally {
      setExportingPdf(false);
    }
  };

  const tripInfo = useMemo(() => booking?.trip, [booking?.trip]);
  const guestName = booking?.guestInfo?.name || booking?.user?.name || 'Guest';
  const guestEmail = booking?.guestInfo?.email || booking?.user?.email || '—';

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-80" />
        </div>
        <div className="grid gap-6 xl:grid-cols-[2fr,1fr]">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-48" />
              </CardHeader>
              <CardContent className="space-y-4">
                <Skeleton className="h-4 w-40" />
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {Array.from({ length: 6 }).map((_, index) => (
                    <Skeleton key={`booking-skel-${index}`} className="h-12 w-full" />
                  ))}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-40" />
              </CardHeader>
              <CardContent className="grid gap-4 sm:grid-cols-2">
                {Array.from({ length: 4 }).map((_, index) => (
                  <Skeleton key={`traveler-skel-${index}`} className="h-12 w-full" />
                ))}
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-36" />
              </CardHeader>
              <CardContent className="space-y-3">
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-24 w-full" />
              </CardContent>
            </Card>
          </div>
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-36" />
              </CardHeader>
              <CardContent className="space-y-4">
                <Skeleton className="h-40 w-full" />
                <Skeleton className="h-4 w-32" />
                <div className="grid gap-4 sm:grid-cols-2">
                  {Array.from({ length: 6 }).map((_, index) => (
                    <Skeleton key={`trip-skel-${index}`} className="h-12 w-full" />
                  ))}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-28" />
              </CardHeader>
              <CardContent className="space-y-3">
                {Array.from({ length: 3 }).map((_, index) => (
                  <Skeleton key={`itinerary-skel-${index}`} className="h-20 w-full" />
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  if (!booking || error) {
    return (
      <div className="space-y-4">
        <PageHeader
          title="Booking details"
          description="Review the full booking and trip information."
          action={{ label: 'Back to bookings', onClick: () => navigate('/cms/bookings'), icon: ArrowLeft }}
        />
        <Card>
          <CardContent>
            <p className="text-sm text-muted-foreground">{error || 'Booking not found.'}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const totalGuests = booking.numberOfParticipants;
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
  const matchedDeparture = ((booking.trip as any)?.departures || []).find((d: any) => {
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
    <div className="space-y-6" ref={exportRef}>
      <PageHeader
        title="Booking details"
        description="Review the full booking and trip information."
        action={{ label: 'Back to bookings', onClick: () => navigate('/cms/bookings'), icon: ArrowLeft }}
      />

      <div className="grid gap-6 xl:grid-cols-[2fr,1fr]">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <CardTitle>Booking overview</CardTitle>
                <div className="flex flex-wrap gap-2 pdf-exclude">
                  <Button variant="outline" size="sm" onClick={handleExportPdf} disabled={exportingPdf}>
                    <Download className="h-4 w-4" />
                    {exportingPdf ? 'Exporting...' : 'Export PDF'}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setQrDialogOpen(true)}
                    disabled={!booking.qrUrl}
                  >
                    View QR
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSelectedStatus(booking.status);
                      setStatusDialogOpen(true);
                    }}
                  >
                    Update status
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSelectedPaymentStatus(booking.paymentStatus || 'pending');
                      setPaymentDialogOpen(true);
                    }}
                  >
                    Update payment
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex flex-wrap items-center gap-3">
                <StatusBadge status={booking.status} />
                {booking.paymentStatus && <StatusBadge status={booking.paymentStatus} />}
                <span className="text-xs uppercase tracking-wide text-muted-foreground">
                  Booking ID: {booking._id}
                </span>
              </div>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <InfoRow label="Trip date" value={formatDate(booking.departureDate)} />
                <InfoRow label="Participants" value={booking.numberOfParticipants} />
                <InfoRow label="Adults" value={booking.party?.adults ?? '—'} />
                <InfoRow label="Children" value={booking.party?.children ?? '—'} />
                <InfoRow label="Total price" value={formatCurrency(booking.totalPrice)} />
                <InfoRow label="Created" value={formatDate(booking.createdAt)} />
                <InfoRow label="Updated" value={formatDate(booking.updatedAt)} />
                <InfoRow label="Payment status" value={booking.paymentStatus || '—'} />
              </div>
              {(booking.specialRequests || booking.promoCode || booking.notes || booking.adminNotes) && (
                <div className="space-y-4">
                  {booking.specialRequests && (
                    <div>
                      <div className="text-xs uppercase tracking-wide text-muted-foreground">Special requests</div>
                      <p className="text-sm text-[var(--cms-foreground)] whitespace-pre-wrap">
                        {booking.specialRequests}
                      </p>
                    </div>
                  )}
                  {booking.promoCode && (
                    <div>
                      <div className="text-xs uppercase tracking-wide text-muted-foreground">Promo code</div>
                      <p className="text-sm text-[var(--cms-foreground)]">{booking.promoCode}</p>
                    </div>
                  )}
                  {booking.notes && (
                    <div>
                      <div className="text-xs uppercase tracking-wide text-muted-foreground">Guest notes</div>
                      <p className="text-sm text-[var(--cms-foreground)] whitespace-pre-wrap">{booking.notes}</p>
                    </div>
                  )}
                  {booking.adminNotes && (
                    <div>
                      <div className="text-xs uppercase tracking-wide text-muted-foreground">Admin notes</div>
                      <p className="text-sm text-[var(--cms-foreground)] whitespace-pre-wrap">{booking.adminNotes}</p>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Traveler details</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <InfoRow label="Name" value={guestName} />
              <InfoRow label="Email" value={guestEmail} />
              <InfoRow label="Phone" value={booking.guestInfo?.phone || '—'} />
              {booking.user?.name && <InfoRow label="Registered user" value={booking.user.name} />}
              <InfoRow label="Emergency contact" value={booking.emergencyContact?.name || '—'} />
              <InfoRow label="Emergency phone" value={booking.emergencyContact?.phone || '—'} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Add-ons</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {booking.addOns && booking.addOns.length > 0 ? (
                booking.addOns.map((addon, index) => (
                  <div
                    key={`${addon.id || addon.title || index}`}
                    className="rounded-xl border border-slate-200/70 bg-white p-4 space-y-2"
                  >
                    <div className="text-sm font-semibold text-[var(--cms-foreground)]">
                      {addon.title || 'Add-on'}
                    </div>
                    <div className="text-sm text-[var(--cms-foreground)]">
                      {[addon.type, addon.duration, addon.location].filter(Boolean).join(' • ') || '—'}
                    </div>
                    {addon.price !== undefined && (
                      <div className="text-sm text-[var(--cms-foreground)]">Price: ${addon.price}</div>
                    )}
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">No add-ons selected.</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Consents</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <InfoRow label="Terms accepted" value={booking.consents?.termsAccepted ? 'Yes' : 'No'} />
              <InfoRow label="Marketing opt-in" value={booking.consents?.marketingOptIn ? 'Yes' : 'No'} />
              <InfoRow
                label="Travel insurance acknowledged"
                value={booking.consents?.travelInsuranceAcknowledged ? 'Yes' : 'No'}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Trip narrative</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {tripInfo?.description ? (
                <p className="text-sm text-[var(--cms-foreground)] whitespace-pre-wrap">{tripInfo.description}</p>
              ) : (
                <p className="text-sm text-muted-foreground">No trip description available.</p>
              )}
              {tripInfo?.highlights && tripInfo.highlights.length > 0 && (
                <div>
                  <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2">Highlights</div>
                  <ul className="grid gap-2 sm:grid-cols-2 text-sm text-[var(--cms-foreground)]">
                    {tripInfo.highlights.map((item) => (
                      <li key={item} className="rounded-lg border border-slate-200/70 bg-slate-50/60 px-3 py-2">
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {tripInfo?.inclusions && tripInfo.inclusions.length > 0 && (
                <div>
                  <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2">Inclusions</div>
                  <ul className="grid gap-2 sm:grid-cols-2 text-sm text-[var(--cms-foreground)]">
                    {tripInfo.inclusions.map((item) => (
                      <li key={item} className="rounded-lg border border-slate-200/70 bg-white px-3 py-2">
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {tripInfo?.sustainabilityBadges && tripInfo.sustainabilityBadges.length > 0 && (
                <div>
                  <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2">Trip tags</div>
                  <ul className="flex flex-wrap gap-2 text-sm text-[var(--cms-foreground)]">
                    {tripInfo.sustainabilityBadges.map((item) => (
                      <li key={item} className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1">
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {tripInfo?.zeroWasteNotes && (
                <div>
                  <div className="text-xs uppercase tracking-wide text-muted-foreground">Trip notes</div>
                  <p className="text-sm text-[var(--cms-foreground)] whitespace-pre-wrap">{tripInfo.zeroWasteNotes}</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
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
                  <div className="flex justify-between">
                    <span className="text-gray-600">Add-ons Subtotal</span>
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
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Trip overview</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {tripInfo?.image && (
                <img
                  src={tripInfo.image}
                  alt={tripInfo.title || 'Trip'}
                  className="h-40 w-full rounded-xl object-cover"
                />
              )}
              <div className="space-y-2">
                <div className="text-lg font-semibold text-[var(--cms-foreground)]">{tripInfo?.title || '—'}</div>
                {tripInfo?.status && <StatusBadge status={tripInfo.status} />}
                {tripInfo?.slug && (
                  <div className="text-xs text-muted-foreground">Slug: {tripInfo.slug}</div>
                )}
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <InfoRow label="Category" value={tripInfo?.category?.label || '—'} />
                <InfoRow label="Subcategory" value={tripInfo?.subcategory?.label || '—'} />
                <InfoRow label="Region" value={tripInfo?.region || tripInfo?.regionRef?.name || '—'} />
                <InfoRow label="Country" value={tripInfo?.country || '—'} />
                <InfoRow label="Duration" value={tripInfo?.duration || '—'} />
                <InfoRow label="Difficulty" value={tripInfo?.difficulty || '—'} />
                <InfoRow label="Base price" value={formatCurrency(tripInfo?.price)} />
                <InfoRow label="Max group size" value={tripInfo?.maxGroupSize ?? '—'} />
                <InfoRow label="Season" value={tripInfo?.season || '—'} />
                <InfoRow label="Created by" value={tripInfo?.createdBy?.name || '—'} />
              </div>
              {tripInfo?._id && (
                <Button variant="outline" size="sm" onClick={() => navigate(`/cms/trips/${tripInfo._id}`)}>
                  Open trip editor
                </Button>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Itinerary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {tripInfo?.itinerary && tripInfo.itinerary.length > 0 ? (
                tripInfo.itinerary.map((item, index) => {
                  const dayLabel = getItineraryLabel(item.day, index);
                  return (
                    <div
                      key={`${dayLabel}-${index}-${item.title ?? 'day'}`}
                      className="rounded-xl border border-slate-200/70 bg-white p-4"
                    >
                      <div className="text-xs uppercase tracking-wide text-muted-foreground">
                        {dayLabel}
                      </div>
                      <div className="text-sm font-semibold text-[var(--cms-foreground)]">
                        {item.title || 'Untitled'}
                      </div>
                      <p className="text-sm text-[var(--cms-foreground)] whitespace-pre-wrap">
                        {item.description || '—'}
                      </p>
                    </div>
                  );
                })
              ) : (
                <p className="text-sm text-muted-foreground">No itinerary added.</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Departures</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {tripInfo?.departures && tripInfo.departures.length > 0 ? (
                tripInfo.departures.map((departure, index) => (
                  <div key={`${departure.startDate ?? index}`} className="rounded-xl border border-slate-200/70 bg-white p-4 space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <div className="text-sm font-semibold text-[var(--cms-foreground)]">
                        {formatDate(departure.startDate)}
                      </div>
                      {departure.status && <StatusBadge status={departure.status} />}
                    </div>
                    <div className="grid gap-3 sm:grid-cols-2 text-sm text-[var(--cms-foreground)]">
                      <InfoRow label="End date" value={formatDate(departure.endDate)} />
                      <InfoRow label="Price/person" value={formatCurrency(departure.pricePerPerson)} />
                      <InfoRow label="Total seats" value={departure.totalSeats ?? '—'} />
                      <InfoRow label="Seats available" value={departure.seatsAvailable ?? '—'} />
                    </div>
                    {departure.badges && departure.badges.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {departure.badges.map((badge) => (
                          <span key={badge} className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs">
                            {badge}
                          </span>
                        ))}
                      </div>
                    )}
                    {departure.notes && (
                      <p className="text-sm text-[var(--cms-foreground)] whitespace-pre-wrap">{departure.notes}</p>
                    )}
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">No departures scheduled.</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <Dialog open={statusDialogOpen} onOpenChange={setStatusDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update booking status</DialogTitle>
            <DialogDescription>Choose the new booking status. The guest will be notified by email.</DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <div className="text-xs uppercase tracking-wide text-muted-foreground">Status</div>
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                {statusOptions.map((status) => (
                  <SelectItem key={status} value={status}>
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setStatusDialogOpen(false)} disabled={savingStatus}>
              Cancel
            </Button>
            <Button onClick={handleStatusSave} disabled={savingStatus}>
              {savingStatus ? 'Updating...' : 'Update status'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={paymentDialogOpen} onOpenChange={setPaymentDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update payment status</DialogTitle>
            <DialogDescription>Choose the new payment status. The guest will be notified by email.</DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <div className="text-xs uppercase tracking-wide text-muted-foreground">Payment status</div>
            <Select value={selectedPaymentStatus} onValueChange={setSelectedPaymentStatus}>
              <SelectTrigger>
                <SelectValue placeholder="Select payment status" />
              </SelectTrigger>
              <SelectContent>
                {paymentOptions.map((status) => (
                  <SelectItem key={status} value={status}>
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setPaymentDialogOpen(false)} disabled={savingPayment}>
              Cancel
            </Button>
            <Button onClick={handlePaymentSave} disabled={savingPayment}>
              {savingPayment ? 'Updating...' : 'Update payment'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={qrDialogOpen} onOpenChange={setQrDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Booking QR</DialogTitle>
            <DialogDescription>Scan to verify this booking on the public page.</DialogDescription>
          </DialogHeader>
          <div className="flex flex-col items-center gap-3">
            {booking.qrImage ? (
              <img
                src={booking.qrImage}
                alt="Booking QR"
                className="h-48 w-48 rounded-xl border border-slate-200/70 bg-white p-2"
              />
            ) : (
              <div className="h-48 w-48 rounded-xl border border-dashed border-slate-200/70 flex items-center justify-center text-sm text-muted-foreground">
                QR not available
              </div>
            )}
            {booking.qrUrl && (
              <a href={booking.qrUrl} className="text-xs text-[var(--cms-primary)] break-all hover:underline">
                {booking.qrUrl}
              </a>
            )}
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setQrDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
