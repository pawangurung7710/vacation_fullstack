import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DataTable, Column } from '../components/DataTable';
import { TableToolbar } from '../components/TableToolbar';
import { StatusBadge } from '../components/StatusBadge';
import { TableSkeleton } from '../components/TableSkeleton';
import { format } from 'date-fns';
import { bookingApi } from '../../services/api';
import { Button } from '../../components/ui/button';
import { Skeleton } from '../../components/ui/skeleton';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '../../components/ui/dropdown-menu';
import { toast } from 'sonner';
import { CheckCircle2, CreditCard, Download, Eye, MoreHorizontal, QrCode } from 'lucide-react';
import logoUrl from '../../../assets/trekkers-logo.png';
import { getItineraryLabel } from '../../utils/itinerary';

interface BookingRecord {
  _id: string;
  trip?: {
    title?: string;
  };
  user?: {
    name?: string;
    email?: string;
  };
  guestInfo?: {
    name?: string;
    email?: string;
  };
  numberOfParticipants: number;
  totalPrice: number;
  status: string;
  paymentStatus?: string;
  departureDate: string;
}

interface BookingDetail extends BookingRecord {
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
    type?: string;
    duration?: string;
    location?: string;
    price?: number;
  }>;
  notes?: string;
  consents?: {
    termsAccepted?: boolean;
    marketingOptIn?: boolean;
    travelInsuranceAcknowledged?: boolean;
  };
  qrUrl?: string;
  qrImage?: string;
  createdAt?: string;
  trip?: {
    title?: string;
    category?: {
      label?: string;
    };
    subcategory?: {
      label?: string;
    };
    regionRef?: {
      name?: string;
    };
    region?: string;
    country?: string;
    duration?: string;
    difficulty?: string;
    price?: number;
    highlights?: string[];
    inclusions?: string[];
    itinerary?: Array<{ day?: string; title?: string; description?: string }>;
    departures?: Array<{
      startDate?: string;
      endDate?: string;
      pricePerPerson?: number;
      seatsAvailable?: number;
    }>;
  };
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

export function BookingsPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [bookings, setBookings] = useState<BookingRecord[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [qrDialogOpen, setQrDialogOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<BookingRecord | null>(null);
  const [qrData, setQrData] = useState<{ url?: string; image?: string } | null>(null);
  const [loadingQr, setLoadingQr] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState('pending');
  const [selectedPaymentStatus, setSelectedPaymentStatus] = useState('pending');
  const [savingStatus, setSavingStatus] = useState(false);
  const [savingPayment, setSavingPayment] = useState(false);
  const [exportingId, setExportingId] = useState<string | null>(null);

  const statusOptions = useMemo(() => ['pending', 'confirmed', 'cancelled', 'completed'], []);
  const paymentOptions = useMemo(() => ['pending', 'partial', 'paid', 'refunded'], []);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const result = await bookingApi.getAll({
        status: statusFilter !== 'all' ? statusFilter : undefined,
        page,
        limit: 25,
      });
      const query = search.trim().toLowerCase();
      const filtered = query
        ? result.data.filter((booking) => {
            const name = booking.guestInfo?.name || booking.user?.name || '';
            const email = booking.guestInfo?.email || booking.user?.email || '';
            const tripTitle = booking.trip?.title || '';
            return (
              name.toLowerCase().includes(query) ||
              email.toLowerCase().includes(query) ||
              tripTitle.toLowerCase().includes(query)
            );
          })
        : result.data;
      setBookings(filtered);
      setLoading(false);
    };
    load();
  }, [page, statusFilter, search]);

  const openStatusDialog = (booking: BookingRecord) => {
    setSelectedBooking(booking);
    setSelectedStatus(booking.status || 'pending');
    setStatusDialogOpen(true);
  };

  const openPaymentDialog = (booking: BookingRecord) => {
    setSelectedBooking(booking);
    setSelectedPaymentStatus(booking.paymentStatus || 'pending');
    setPaymentDialogOpen(true);
  };

  const handleStatusSave = async () => {
    if (!selectedBooking) return;
    setSavingStatus(true);
    try {
      const updated = await bookingApi.update(selectedBooking._id, { status: selectedStatus });
      setBookings((prev) =>
        prev.map((booking) =>
          booking._id === selectedBooking._id ? { ...booking, status: updated.status } : booking
        )
      );
      toast.success('Booking status updated.');
      setStatusDialogOpen(false);
    } catch (error) {
      toast.error('Failed to update booking status.');
    } finally {
      setSavingStatus(false);
    }
  };

  const handlePaymentSave = async () => {
    if (!selectedBooking) return;
    setSavingPayment(true);
    try {
      const updated = await bookingApi.update(selectedBooking._id, { paymentStatus: selectedPaymentStatus });
      setBookings((prev) =>
        prev.map((booking) =>
          booking._id === selectedBooking._id ? { ...booking, paymentStatus: updated.paymentStatus } : booking
        )
      );
      toast.success('Payment status updated.');
      setPaymentDialogOpen(false);
    } catch (error) {
      toast.error('Failed to update payment status.');
    } finally {
      setSavingPayment(false);
    }
  };

  const exportBookingPdf = async (bookingId: string) => {
    try {
      setExportingId(bookingId);
      const booking = (await bookingApi.getById(bookingId)) as BookingDetail;
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

      if (booking?.trip?.highlights?.length) {
        addCard('Highlights', [], booking.trip.highlights);
      }

      if (booking?.trip?.inclusions?.length) {
        addCard('Inclusions', [], booking.trip.inclusions);
      }

      if (booking?.addOns?.length) {
        addCard(
          'Add-ons',
          booking.addOns.map((addon, index) => [`Add-on ${index + 1}`, addon.title || '—']),
          booking.addOns.map((addon) => [addon.type, addon.duration, addon.location].filter(Boolean).join(' • '))
        );
      }

      if (booking?.trip?.itinerary?.length) {
        const itineraryParagraphs = booking.trip.itinerary.map(
          (item, index) => {
            const label = getItineraryLabel(item.day, index);
            return `${label} - ${item.title || 'Untitled'}: ${item.description || '—'}`;
          }
        );
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
      toast.success('PDF generated.');
    } catch (error) {
      console.error('PDF export failed:', error);
      const message = error instanceof Error ? error.message : 'Failed to export PDF.';
      toast.error(message);
    } finally {
      setExportingId(null);
    }
  };

  const openQrDialog = async (bookingId: string) => {
    try {
      setLoadingQr(true);
      setQrDialogOpen(true);
      const booking = (await bookingApi.getById(bookingId)) as BookingDetail;
      setQrData({ url: booking.qrUrl, image: booking.qrImage });
    } catch (error) {
      setQrData(null);
      toast.error('Failed to load QR code.');
    } finally {
      setLoadingQr(false);
    }
  };

  const columns: Column<BookingRecord>[] = [
    {
      id: 'customer',
      header: 'Customer',
      accessor: (b) => {
        const name = b.guestInfo?.name || b.user?.name || 'Guest';
        const email = b.guestInfo?.email || b.user?.email || '—';
        return (
          <div>
            <div className="font-medium">{name}</div>
            <div className="text-sm text-muted-foreground">{email}</div>
          </div>
        );
      },
    },
    { id: 'trip', header: 'Trip', accessor: (b) => b.trip?.title || '—' },
    { id: 'participants', header: 'Participants', accessor: (b) => b.numberOfParticipants },
    { id: 'amount', header: 'Amount', accessor: (b) => `US $${b.totalPrice.toLocaleString()}` },
    { id: 'status', header: 'Status', accessor: (b) => <StatusBadge status={b.status} /> },
    { id: 'payment', header: 'Payment', accessor: (b) => <StatusBadge status={b.paymentStatus || 'pending'} /> },
    { id: 'date', header: 'Trip Date', accessor: (b) => format(new Date(b.departureDate), 'MMM d, yyyy') },
    {
      id: 'actions',
      header: '',
      accessor: (b) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel className="text-xs uppercase tracking-widest text-muted-foreground">
              Manage
            </DropdownMenuLabel>
            <DropdownMenuItem onClick={() => navigate(`/cms/bookings/${b._id}`)} className="gap-2">
              <Eye className="h-4 w-4 text-[var(--cms-primary)]" />
              View details
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => openStatusDialog(b)} className="gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
              Update status
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => openPaymentDialog(b)} className="gap-2">
              <CreditCard className="h-4 w-4 text-blue-600" />
              Update payment
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuLabel className="text-xs uppercase tracking-widest text-muted-foreground">
              Export
            </DropdownMenuLabel>
            <DropdownMenuItem onClick={() => exportBookingPdf(b._id)} disabled={exportingId === b._id} className="gap-2">
              <Download className="h-4 w-4 text-slate-700" />
              {exportingId === b._id ? 'Exporting...' : 'Export PDF'}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => openQrDialog(b._id)} className="gap-2">
              <QrCode className="h-4 w-4 text-slate-700" />
              View QR
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  return (
    <div>
      <TableToolbar searchValue={search} onSearchChange={setSearch} filterValue={statusFilter} onFilterChange={setStatusFilter} filterOptions={[{ label: 'Pending', value: 'pending' }, { label: 'Confirmed', value: 'confirmed' }, { label: 'Cancelled', value: 'cancelled' }]} filterLabel="Status" />
      {loading ? <TableSkeleton /> : <DataTable data={bookings} columns={columns} getRowId={(b) => b._id} />}

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
            {loadingQr ? (
              <Skeleton className="h-48 w-48 rounded-xl" />
            ) : qrData?.image ? (
              <img
                src={qrData.image}
                alt="Booking QR"
                className="h-48 w-48 rounded-xl border border-slate-200/70 bg-white p-2"
              />
            ) : (
              <div className="h-48 w-48 rounded-xl border border-dashed border-slate-200/70 flex items-center justify-center text-sm text-muted-foreground">
                QR not available
              </div>
            )}
            {qrData?.url && (
              <a href={qrData.url} className="text-xs text-[var(--cms-primary)] break-all hover:underline">
                {qrData.url}
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
