import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, useParams, Link } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { ParallaxImage } from '../components/parallax';
import { ScrollAnimate } from '../components/scroll-animate';
import { 
  Check, Calendar, Users, MapPin, Clock, Mail, Phone, 
  Download, MessageSquare, ArrowRight, FileText, User,
  CheckCircle2, Tag, Globe, Sparkles, Shield, ShieldCheck
} from 'lucide-react';
import { bookingApi } from '../services/api';
import logoUrl from '../../assets/trekkers-logo.png';

export function BookingConfirmationPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { id, bookingId } = useParams<{ id: string; bookingId?: string }>();
  const [bookingData, setBookingData] = useState<any>(location.state || null);
  const [loading, setLoading] = useState(false);

  const [showConfetti, setShowConfetti] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [exportingPdf, setExportingPdf] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);
    
    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  useEffect(() => {
    if (!prefersReducedMotion) {
      setShowConfetti(true);
      const timer = setTimeout(() => setShowConfetti(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [prefersReducedMotion]);

  const token = useMemo(() => {
    const params = new URLSearchParams(location.search);
    return params.get('token') || bookingData?.qrToken || null;
  }, [location.search, bookingData?.qrToken]);

  const hydrateFromBooking = (booking: any) => {
    const trip = booking.trip || {};
    const adults = booking.party?.adults ?? booking.numberOfParticipants ?? 1;
    const children = booking.party?.children ?? 0;
    const totalGuests = adults + children;
    const addOns = booking.addOns || [];
    const addOnsSubtotal = addOns.reduce(
      (sum: number, addon: any) => sum + (addon.price || 0) * totalGuests,
      0
    );
    const addOnDiscount = addOnsSubtotal * 0.1;
    const basePrice = trip.price || 0;
    const baseTotal = basePrice * totalGuests;
    const promoDiscount = booking.promoDiscount ?? 0;
    const subtotalBeforePromo = Math.max(baseTotal + addOnsSubtotal - addOnDiscount, 0);
    const subtotal = Math.max(subtotalBeforePromo - promoDiscount, 0);
    const taxes = subtotal * 0.13;
    const total = subtotal;
    const promoCode =
      booking.promoCode ||
      booking.promotion?.code ||
      (booking.promotion?.title ? booking.promotion.title : undefined);
    setBookingData((prev: any) => ({
      ...(prev || {}),
      trip: {
        ...trip,
        location: trip.region ? `${trip.region}${trip.country ? `, ${trip.country}` : ''}` : trip.country,
      },
      departure: {
        dateRange: booking.departureDate
          ? new Date(booking.departureDate).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            })
          : 'Flexible dates',
      },
      adults,
      children,
      specialRequests: booking.specialRequests,
      emergencyName: booking.emergencyContact?.name,
      emergencyPhone: booking.emergencyContact?.phone,
      selectedAddOns: addOns,
      pricing: {
        baseTotal,
        addOnsSubtotal,
        addOnDiscount,
        subtotal,
        taxes,
        total,
        deposit: total * 0.3,
        promoDiscount,
      },
      promoCode,
      requestId: booking._id,
      qrToken: booking.qrToken,
      qrUrl: booking.qrUrl,
      qrImage: booking.qrImage,
      contactDetails: {
        fullName: booking.guestInfo?.name || booking.user?.name || 'Guest',
        email: booking.guestInfo?.email || booking.user?.email || '',
        phone: booking.guestInfo?.phone || '',
        billingCountry: '—',
      },
      paymentMethod: 'later',
    }));
  };

  useEffect(() => {
    if (!bookingId || !token || bookingData?.qrImage) return;
    const loadQr = async () => {
      setLoading(true);
      try {
        const booking = await bookingApi.getConfirmation(bookingId, id, token || undefined);
        hydrateFromBooking(booking);
      } catch (error) {
        setBookingData(null);
      } finally {
        setLoading(false);
      }
    };
    loadQr();
  }, [bookingData?.qrImage, bookingId, id, token]);

  useEffect(() => {
    if (bookingData || !bookingId) return;
    const load = async () => {
      setLoading(true);
      try {
        const booking = await bookingApi.getConfirmation(bookingId, id, token || undefined);
        hydrateFromBooking(booking);
      } catch (error) {
        setBookingData(null);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [bookingData, bookingId, id, token]);

  if (!bookingData && loading) {
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

  if (!bookingData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold mb-4">No booking information found</h2>
          <Link to="/all-trips">
            <Button>Browse All Trips</Button>
          </Link>
        </div>
      </div>
    );
  }

  const { 
    trip, 
    departure, 
    adults, 
    children, 
    specialRequests,
    emergencyName,
    emergencyPhone,
    selectedAddOns, 
    pricing, 
    requestId, 
    contactDetails,
    paymentMethod 
  } = bookingData;

  const totalGuests = adults + children;
  const submissionTime = new Date().toLocaleString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  const handleDownloadSummary = async () => {
    try {
      setExportingPdf(true);
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
      pdf.text(trip?.title || 'Trip details', headerTextX, y);
      y += 14;
      pdf.setFontSize(9);
      pdf.setTextColor(110, 110, 115);
      pdf.text(`Booking ID: ${requestId || '—'}`, headerTextX, y);
      y += 20;

      addCard('Booking overview', [
        ['Trip date', departure?.dateRange || '—'],
        ['Participants', String(totalGuests)],
        ['Adults', String(adults)],
        ['Children', String(children)],
        ['Promo code', bookingData?.promoCode || '—'],
        ['Total price', `US $${pricing.total.toFixed(2)}`],
        ['Submitted', submissionTime],
      ]);

      addCard('Traveler details', [
        ['Name', contactDetails?.fullName || 'Guest'],
        ['Email', contactDetails?.email || '—'],
        ['Phone', contactDetails?.phone || '—'],
        ['Emergency contact', emergencyName || '—'],
        ['Emergency phone', emergencyPhone || '—'],
      ]);

      const preferenceParagraphs = [];
      if (specialRequests) preferenceParagraphs.push(`Special requests: ${specialRequests}`);
      addCard(
        'Preferences',
        [['Payment method', paymentMethod === 'deposit' ? 'Deposit paid' : 'Pay later']],
        preferenceParagraphs.length > 0 ? preferenceParagraphs : ['No additional preferences recorded.']
      );

      addCard('Trip overview', [
        ['Trip', trip?.title || '—'],
        ['Location', trip?.location || '—'],
        ['Duration', trip?.duration || '—'],
      ]);

      if (selectedAddOns && selectedAddOns.length > 0) {
        addCard(
          'Add-ons',
          selectedAddOns.map((addon: any, index: number) => [`Add-on ${index + 1}`, addon.title || '—']),
          selectedAddOns.map((addon: any) => addon.duration || '—')
        );
      }

      const fileName = `booking-${requestId || 'confirmation'}.pdf`;
      pdf.save(fileName);
    } catch (error) {
      console.error('PDF export failed:', error);
      const message = error instanceof Error ? error.message : 'Failed to export PDF.';
      alert(message);
    } finally {
      setExportingPdf(false);
    }
  };

  const nextSteps = [
    {
      step: 1,
      title: 'Request Received',
      description: 'We have your booking request',
      status: 'complete',
      icon: CheckCircle2
    },
    {
      step: 2,
      title: 'Review & Confirmation',
      description: 'Our team will review within 48 hours',
      status: 'current',
      icon: Mail
    },
    {
      step: 3,
      title: 'Payment & Finalization',
      description: 'Complete payment to secure your spot',
      status: 'upcoming',
      icon: CheckCircle2
    },
    {
      step: 4,
      title: 'Trip Preparation',
      description: 'Receive detailed itinerary and packing list',
      status: 'upcoming',
      icon: FileText
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 relative overflow-hidden">
      {/* Confetti Animation */}
      {showConfetti && !prefersReducedMotion && (
        <div className="fixed inset-0 pointer-events-none z-50">
          {[...Array(50)].map((_, i) => (
            <div
              key={i}
              className="confetti"
              style={{
                left: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 3}s`,
                animationDuration: `${2 + Math.random() * 2}s`,
                background: ['var(--color-navy-500)', 'var(--color-forest-500)', 'var(--color-sun-500)'][Math.floor(Math.random() * 3)]
              }}
            />
          ))}
        </div>
      )}

      {/* Cinematic Background */}
      <div className="fixed inset-0 z-0">
        {prefersReducedMotion ? (
          <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-navy-100)] via-white to-[var(--color-forest-100)]" />
        ) : (
          <ParallaxImage
            src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=2000&q=80"
            alt="Mountain landscape"
            speed={0.3}
            className="absolute inset-0 opacity-20"
          />
        )}
      </div>

      <div className="relative z-10 py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Confirmation Hero Card */}
          <ScrollAnimate animation="fade-in-up">
            <div 
              className="glass-card p-8 md:p-12 text-center mb-8"
              role="status"
              aria-live="polite"
              aria-atomic="true"
            >
              <div className={`w-20 h-20 md:w-24 md:h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-[var(--color-forest-500)] to-[var(--color-navy-500)] flex items-center justify-center ${
                prefersReducedMotion ? '' : 'animate-scale-in'
              }`}>
                <Check size={48} className="text-white" strokeWidth={3} />
              </div>
              <h1 className="text-3xl md:text-5xl font-bold mb-3" style={{ fontFamily: 'Outfit, sans-serif' }}>
                Thanks, Trekkers Squad will reach out shortly
              </h1>
              <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto">
                Your adventure request has been received. Our team will review your booking and contact you within 48 hours to confirm availability and next steps.
              </p>
              <div className="mt-6 inline-flex items-center gap-2 px-4 py-2 bg-[var(--color-sun-50)] border-2 border-[var(--color-sun-300)] rounded-full">
                <Sparkles size={16} className="text-[var(--color-sun-600)]" />
                <span className="text-sm font-semibold text-[var(--color-sun-700)]">
                  Request ID: {requestId}
                </span>
              </div>
            </div>
          </ScrollAnimate>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Booking Summary & Next Steps */}
            <div className="lg:col-span-2 space-y-6">
              {/* Booking Summary */}
              <ScrollAnimate animation="fade-in-up" delay={100}>
                <Card className="glass-card">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="text-[var(--color-navy-600)]" />
                      Booking Summary
                    </CardTitle>
                    <p className="text-sm text-gray-600 mt-1">
                      Submitted on {submissionTime}
                    </p>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Trip Details */}
                    <div className="relative">
                      <div className="flex gap-4">
                        <img 
                          src={trip.image} 
                          alt={trip.title}
                          className="w-24 h-24 rounded-lg object-cover border-2 border-gray-200"
                        />
                        <div className="flex-1">
                          <h3 className="text-xl font-bold mb-2">{trip.title}</h3>
                          <div className="space-y-1 text-sm text-gray-600">
                            <div className="flex items-center gap-2">
                              <MapPin size={14} />
                              <span>{trip.location}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Calendar size={14} />
                              <span>{departure.dateRange}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Clock size={14} />
                              <span>{trip.duration}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Party Details */}
                    <div className="pt-4 border-t border-gray-200">
                      <div className="flex items-center gap-2 mb-3">
                        <Users size={18} className="text-[var(--color-navy-600)]" />
                        <h4 className="font-semibold">Party Details</h4>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600">Adults:</span>
                          <span className="ml-2 font-semibold">{adults}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Children:</span>
                          <span className="ml-2 font-semibold">{children}</span>
                        </div>
                        <div className="col-span-2">
                          <span className="text-gray-600">Total Guests:</span>
                          <span className="ml-2 font-semibold">{totalGuests}</span>
                        </div>
                      </div>
                    </div>

                    {/* Add-ons */}
                    {selectedAddOns && selectedAddOns.length > 0 && (
                      <div className="pt-4 border-t border-gray-200">
                        <div className="flex items-center gap-2 mb-3">
                          <Tag size={18} className="text-[var(--color-sun-600)]" />
                          <h4 className="font-semibold">Add-on Adventures</h4>
                          <span className="ml-auto text-xs bg-[var(--color-sun-100)] text-[var(--color-sun-700)] px-2 py-1 rounded-full">
                            10% discount applied
                          </span>
                        </div>
                        <div className="space-y-2">
                          {selectedAddOns.map((addon: any) => (
                            <div key={addon.id} className="flex items-start justify-between p-3 bg-gray-50 rounded-lg">
                              <div className="flex-1">
                                <div className="font-medium text-sm">{addon.title}</div>
                                <div className="text-xs text-gray-600">{addon.duration}</div>
                              </div>
                              <div className="text-right">
                                <div className="text-sm font-semibold">US ${addon.price * totalGuests}</div>
                                <div className="text-xs text-gray-500">for {totalGuests} guests</div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Contact Information */}
                    <div className="pt-4 border-t border-gray-200">
                      <div className="flex items-center gap-2 mb-3">
                        <User size={18} className="text-[var(--color-navy-600)]" />
                        <h4 className="font-semibold">Contact Information</h4>
                      </div>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2">
                          <User size={14} className="text-gray-500" />
                          <span className="text-gray-600">Name:</span>
                          <span className="font-semibold">{contactDetails.fullName}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Mail size={14} className="text-gray-500" />
                          <span className="text-gray-600">Email:</span>
                          <span className="font-semibold">{contactDetails.email}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Phone size={14} className="text-gray-500" />
                          <span className="text-gray-600">Phone:</span>
                          <span className="font-semibold">{contactDetails.phone}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Globe size={14} className="text-gray-500" />
                          <span className="text-gray-600">Country:</span>
                          <span className="font-semibold">{contactDetails.billingCountry}</span>
                        </div>
                      </div>
                    </div>

                    {/* Emergency Contact */}
                    <div className="pt-4 border-t border-gray-200">
                      <div className="flex items-center gap-2 mb-3">
                        <Phone size={18} className="text-red-600" />
                        <h4 className="font-semibold">Emergency Contact</h4>
                      </div>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2">
                          <span className="text-gray-600">Name:</span>
                          <span className="font-semibold">{emergencyName}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-gray-600">Phone:</span>
                          <span className="font-semibold">{emergencyPhone}</span>
                        </div>
                      </div>
                    </div>

                    {/* Special Requests */}
                    {specialRequests && (
                      <div className="pt-4 border-t border-gray-200">
                        <h4 className="font-semibold mb-2">Special Requests</h4>
                        <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                          {specialRequests}
                        </p>
                      </div>
                    )}

                    {/* Price Summary */}
                    <div className="pt-4 border-t-2 border-gray-300 bg-gradient-to-br from-[var(--color-navy-50)] to-white p-4 rounded-lg">
                      <div className="space-y-2 text-sm mb-3">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Base Trip</span>
                          <span className="font-semibold">US ${pricing.baseTotal.toFixed(2)}</span>
                        </div>
                        {selectedAddOns && selectedAddOns.length > 0 && (
                          <>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Add-ons Subtotal</span>
                              <span className="font-semibold">US ${pricing.addOnsSubtotal.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-[var(--color-sun-600)]">
                              <span>Add-on Discount (10%)</span>
                              <span className="font-semibold">-US ${pricing.addOnDiscount.toFixed(2)}</span>
                            </div>
                          </>
                        )}
                        {pricing.promoDiscount > 0 && (
                          <div className="flex justify-between text-[var(--color-forest-600)]">
                            <span className="text-[var(--color-forest-700)]">Promo discount</span>
                            <span className="font-semibold">-US ${pricing.promoDiscount.toFixed(2)}</span>
                          </div>
                        )}
                        <div className="flex justify-between">
                          <span className="text-gray-600">VAT (included, 13%)</span>
                          <span className="font-semibold">-US ${pricing.taxes.toFixed(2)}</span>
                        </div>
                      </div>
                      <div className="pt-3 border-t border-gray-300 flex justify-between items-center">
                        <span className="font-bold text-lg">Total Amount</span>
                        <span className="font-bold text-2xl text-gray-900">US ${pricing.total.toFixed(2)}</span>
                      </div>
                      {paymentMethod === 'deposit' ? (
                        <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                          <div className="flex items-center gap-2 text-sm text-green-800">
                            <CheckCircle2 size={16} className="text-green-600" />
                            <span className="font-semibold">Deposit Paid: US ${pricing.deposit.toFixed(2)}</span>
                          </div>
                        </div>
                      ) : (
                        <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                          <div className="text-sm text-blue-800">
                            <strong>Payment pending:</strong> We'll send payment instructions after confirmation
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </ScrollAnimate>

              <ScrollAnimate animation="fade-in-up" delay={220}>
                <Card className="glass-card border border-[var(--color-forest-200)]">
                  <CardContent className="p-6 space-y-3 text-sm text-gray-600">
                    <div className="flex items-center gap-2 text-[var(--color-forest-700)] font-semibold">
                      <ShieldCheck size={16} className="text-[var(--color-forest-600)]" />
                      Secure booking verification link
                    </div>
                    <p>
                      Keep this for your records. You can revisit your booking details anytime using the secure link below.
                    </p>
                    {bookingData?.qrUrl ? (
                      <a
                        href={bookingData.qrUrl}
                        className="text-[var(--color-forest-600)] hover:underline break-all"
                      >
                        {bookingData.qrUrl}
                      </a>
                    ) : (
                      <span className="text-gray-500">Generating secure link…</span>
                    )}
                  </CardContent>
                </Card>
              </ScrollAnimate>

              {/* Next Steps Timeline */}
              <ScrollAnimate animation="fade-in-up" delay={150}>
                <Card className="glass-card">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Clock className="text-[var(--color-sun-600)]" />
                      What Happens Next
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      {nextSteps.map((step, index) => (
                        <div key={step.step} className="flex gap-4">
                          <div className="flex flex-col items-center">
                            <div className={`w-12 h-12 rounded-full flex items-center justify-center border-2 ${
                              step.status === 'complete' 
                                ? 'bg-[var(--color-forest-500)] border-[var(--color-forest-500)] text-white'
                                : step.status === 'current'
                                ? 'bg-[var(--color-sun-500)] border-[var(--color-sun-500)] text-white animate-pulse'
                                : 'bg-gray-100 border-gray-300 text-gray-500'
                            }`}>
                              <step.icon size={20} />
                            </div>
                            {index < nextSteps.length - 1 && (
                              <div className={`w-0.5 h-16 ${
                                step.status === 'complete' 
                                  ? 'bg-[var(--color-forest-500)]'
                                  : 'bg-gray-300'
                              }`} />
                            )}
                          </div>
                          <div className="flex-1 pb-8">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-semibold">{step.title}</h4>
                              {step.status === 'complete' && (
                                <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                                  Complete
                                </span>
                              )}
                              {step.status === 'current' && (
                                <span className="text-xs bg-[var(--color-sun-100)] text-[var(--color-sun-700)] px-2 py-0.5 rounded-full">
                                  In Progress
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-gray-600">{step.description}</p>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="mt-6 p-4 bg-gradient-to-r from-[var(--color-sun-50)] to-[var(--color-sun-100)] border-2 border-[var(--color-sun-300)] rounded-lg">
                      <div className="flex items-start gap-3">
                        <Mail size={20} className="text-[var(--color-sun-700)] flex-shrink-0 mt-0.5" />
                        <div className="text-sm text-[var(--color-sun-900)]">
                          <p className="font-semibold mb-1">Check your email</p>
                          <p>A confirmation has been sent to <strong>{contactDetails.email}</strong>. Please check your spam folder if you don't see it within a few minutes.</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </ScrollAnimate>

              {/* Admin Notification Preview */}
              {/* <ScrollAnimate animation="fade-in-up" delay={200}>
                <Card className="glass-card border-2 border-dashed border-gray-300">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-gray-600">
                      <Mail className="text-gray-500" />
                      Admin Notification Preview
                      <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full ml-auto">
                        For Design Verification
                      </span>
                    </CardTitle>
                    <p className="text-xs text-gray-500 mt-1">
                      This shows the email content sent to Trekkers Squad reservations team
                    </p>
                  </CardHeader>
                  <CardContent>
                    <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-inner">
                      <div className="mb-4 pb-4 border-b border-gray-200">
                        <div className="text-xs text-gray-500 mb-1">To: reservations@trekkerssquad.example</div>
                        <div className="text-xs text-gray-500">Subject: New Booking Request - {requestId}</div>
                      </div>
                      <h3 className="text-lg font-bold mb-4" style={{ fontFamily: 'Outfit, sans-serif' }}>
                        New Booking Request Received
                      </h3>
                      <div className="space-y-3 text-sm">
                        <div className="bg-[var(--color-navy-50)] p-3 rounded">
                          <strong>Request ID:</strong> {requestId}
                        </div>
                        <div>
                          <strong>Trip:</strong> {trip.title}
                        </div>
                        <div>
                          <strong>Departure Date:</strong> {departure.dateRange}
                        </div>
                        <div>
                          <strong>Guest Name:</strong> {contactDetails.fullName}
                        </div>
                        <div>
                          <strong>Email:</strong> {contactDetails.email}
                        </div>
                        <div>
                          <strong>Phone:</strong> {contactDetails.phone}
                        </div>
                        <div>
                          <strong>Party Size:</strong> {adults} Adults, {children} Children (Total: {totalGuests})
                        </div>
                        {selectedAddOns && selectedAddOns.length > 0 && (
                          <div>
                            <strong>Add-ons:</strong>
                            <ul className="mt-1 ml-4 list-disc">
                              {selectedAddOns.map((addon: any) => (
                                <li key={addon.id}>{addon.title}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                        <div>
                          <strong>Payment Method:</strong> {paymentMethod === 'deposit' ? 'Deposit Paid' : 'Pay Later'}
                        </div>
                        <div>
                          <strong>Total Amount:</strong> US ${pricing.total.toFixed(2)}
                        </div>
                      </div>
                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <Button className="w-full bg-[var(--color-navy-600)]">
                          View Full Details in Admin Panel
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </ScrollAnimate> */}
            </div>

            {/* Right Column - Quick Actions */}
            <div className="lg:col-span-1">
              <div className="sticky top-8 space-y-6">
                <ScrollAnimate animation="fade-in-up" delay={250}>
                  <Card className="glass-card">
                    <CardHeader>
                      <CardTitle>Quick Actions</CardTitle>
                    </CardHeader>
                    <CardContent className="flex flex-col gap-4">
                      <Button 
                        className="w-full justify-between" 
                        variant="outline"
                        onClick={handleDownloadSummary}
                        disabled={exportingPdf}
                      >
                        <div className="flex items-center gap-2">
                          <Download size={18} />
                          <span>{exportingPdf ? 'Generating PDF...' : 'Download Summary'}</span>
                        </div>
                        <ArrowRight size={16} />
                      </Button>

                      <Link to="/contact">
                        <Button className="w-full justify-between" variant="outline">
                          <div className="flex items-center gap-2">
                            <MessageSquare size={18} />
                            <span>Contact Support</span>
                          </div>
                          <ArrowRight size={16} />
                        </Button>
                      </Link>

                      <Link to="/all-trips">
                        <Button className="w-full justify-between bg-gradient-to-r from-[var(--color-navy-600)] to-[var(--color-forest-600)] hover:from-[var(--color-navy-700)] hover:to-[var(--color-forest-700)]">
                          <div className="flex items-center gap-2">
                            <MapPin size={18} />
                            <span>View Other Trips</span>
                          </div>
                          <ArrowRight size={16} />
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>
                </ScrollAnimate>

                <ScrollAnimate animation="fade-in-up" delay={260}>
                  <Card className="glass-card border-2 border-[var(--color-forest-200)]">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-[var(--color-forest-700)]">
                        <Shield size={18} className="text-[var(--color-forest-600)]" />
                        Secure Booking QR
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4 text-center">
                      {bookingData?.qrImage ? (
                        <img
                          src={bookingData.qrImage}
                          alt="Booking verification QR code"
                          className="w-48 h-48 mx-auto rounded-xl border border-[var(--color-forest-200)] bg-white p-2"
                        />
                      ) : (
                        <div className="w-48 h-48 mx-auto rounded-xl border border-dashed border-[var(--color-forest-200)] flex items-center justify-center text-sm text-gray-500">
                          QR code loading...
                        </div>
                      )}
                      {bookingData?.qrUrl && (
                        <a
                          href={bookingData.qrUrl}
                          className="text-sm text-[var(--color-forest-600)] hover:underline break-all"
                        >
                          Open secure confirmation link
                        </a>
                      )}
                      <p className="text-xs text-gray-500">
                        Scan this QR code to verify your booking status securely.
                      </p>
                    </CardContent>
                  </Card>
                </ScrollAnimate>

                <ScrollAnimate animation="fade-in-up" delay={300}>
                  <Card className="glass-card bg-gradient-to-br from-[var(--color-navy-50)] to-white border-2 border-[var(--color-navy-200)]">
                    <CardHeader>
                      <CardTitle className="text-[var(--color-navy-700)]">Need Help?</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-5">
                      <p className="text-sm text-gray-600">
                        Our team is here to answer any questions about your booking or the trip.
                      </p>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2">
                          <Mail size={14} className="text-[var(--color-navy-600)]" />
												  <a href="mailto:hello@trekkerssquad.example" className="text-[var(--color-navy-600)] hover:underline">
													  hello@trekkerssquad.example
                          </a>
                        </div>
                        <div className="flex items-center gap-2">
                          <Phone size={14} className="text-[var(--color-navy-600)]" />
                          <a href="tel:+9779801234567" className="text-[var(--color-navy-600)] hover:underline">
                            +977 980-123-4567
                          </a>
                        </div>
                      </div>
                      <div className="pt-3 border-t border-gray-200 text-xs text-gray-500">
                        Response time: Within 24 hours
                      </div>
                    </CardContent>
                  </Card>
                </ScrollAnimate>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes scale-in {
          from {
            transform: scale(0);
            opacity: 0;
          }
          to {
            transform: scale(1);
            opacity: 1;
          }
        }
        .animate-scale-in {
          animation: scale-in 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        
        .confetti {
          position: absolute;
          width: 10px;
          height: 10px;
          border-radius: 2px;
          animation: confetti-fall linear forwards;
        }
        
        @keyframes confetti-fall {
          to {
            transform: translateY(100vh) rotate(360deg);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
}
