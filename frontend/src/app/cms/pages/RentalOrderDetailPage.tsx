import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { PageHeader } from '../components/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { StatusBadge } from '../components/StatusBadge';
import { TableSkeleton } from '../components/TableSkeleton';
import { rentalOrdersApi, resolveMediaUrl } from '../../services/api';
import { format } from 'date-fns';
import { ArrowLeft } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { toast } from 'sonner';

interface RentalOrderItem {
  product?: string;
  title: string;
  image?: string;
  pricePerDay: number;
  quantity: number;
  deliveryDate: string;
  returnDate: string;
  days: number;
  subtotal: number;
}

interface RentalOrderDetail {
  _id: string;
  status: string;
  paymentStatus?: string;
  items: RentalOrderItem[];
  deliveryMethod?: string;
  deliveryAddress?: {
    line1?: string;
    line2?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    country?: string;
  };
  totalPrice: number;
  depositTotal?: number;
  consents?: { termsAccepted?: boolean };
  notes?: string;
  adminNotes?: string;
  createdAt?: string;
  updatedAt?: string;
  guestInfo?: { name?: string; email?: string; phone?: string };
  user?: { name?: string; email?: string };
}

const formatDate = (value?: string) => {
  if (!value) return '—';
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return '—';
  return format(parsed, 'MMM d, yyyy');
};

const formatCurrency = (value?: number) => {
  if (value === null || value === undefined) return '—';
  return `$${value.toLocaleString()}`;
};

const InfoRow = ({ label, value }: { label: string; value?: string | number | null }) => (
  <div className="space-y-1">
    <div className="text-xs uppercase tracking-wide text-muted-foreground">{label}</div>
    <div className="text-sm text-[var(--cms-foreground)]">{value ?? '—'}</div>
  </div>
);

export function RentalOrderDetailPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [order, setOrder] = useState<RentalOrderDetail | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState('pending');
  const [selectedPaymentStatus, setSelectedPaymentStatus] = useState('pending');
  const [savingStatus, setSavingStatus] = useState(false);
  const [savingPayment, setSavingPayment] = useState(false);

  const statusOptions = ['pending', 'confirmed', 'delivered', 'returned', 'cancelled'];
  const paymentOptions = ['pending', 'partial', 'paid', 'refunded'];

  useEffect(() => {
    const load = async () => {
      if (!id) return;
      setLoading(true);
      try {
        const data = await rentalOrdersApi.getById(id);
        setOrder(data);
        setError(null);
      } catch (loadError) {
        setError('Unable to load order details.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  useEffect(() => {
    if (order?.status) setSelectedStatus(order.status);
    if (order?.paymentStatus) setSelectedPaymentStatus(order.paymentStatus);
  }, [order?.status, order?.paymentStatus]);

  const handleStatusSave = async () => {
    if (!id || !order) return;
    setSavingStatus(true);
    try {
      const updated = await rentalOrdersApi.update(id, { status: selectedStatus });
      setOrder((prev) => (prev ? { ...prev, status: updated.status } : prev));
      toast.success('Order status updated.');
      setStatusDialogOpen(false);
    } catch (updateError) {
      toast.error('Failed to update order status.');
    } finally {
      setSavingStatus(false);
    }
  };

  const handlePaymentSave = async () => {
    if (!id || !order) return;
    setSavingPayment(true);
    try {
      const updated = await rentalOrdersApi.update(id, { paymentStatus: selectedPaymentStatus });
      setOrder((prev) => (prev ? { ...prev, paymentStatus: updated.paymentStatus } : prev));
      toast.success('Payment status updated.');
      setPaymentDialogOpen(false);
    } catch (updateError) {
      toast.error('Failed to update payment status.');
    } finally {
      setSavingPayment(false);
    }
  };

  if (loading) {
    return (
      <div className="px-6 py-4">
        <TableSkeleton />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="px-6 py-4 space-y-4">
        <PageHeader
          title="Rental order"
          action={{ label: 'Back to orders', onClick: () => navigate('/cms/rental-orders'), icon: ArrowLeft }}
        />
        <Card>
          <CardContent className="py-8 text-center text-sm text-muted-foreground">
            {error || 'Order not found.'}
          </CardContent>
        </Card>
      </div>
    );
  }

  const guestName = order.guestInfo?.name || order.user?.name || 'Guest';
  const guestEmail = order.guestInfo?.email || order.user?.email || '—';
  const address = order.deliveryAddress;
  const addressLine = [address?.line1, address?.line2, address?.city, address?.state, address?.postalCode, address?.country]
    .filter(Boolean)
    .join(', ');

  return (
    <div className="px-6 py-4 space-y-6">
      <PageHeader
        title="Rental order details"
        description="Review the full order and update its status."
        action={{ label: 'Back to orders', onClick: () => navigate('/cms/rental-orders'), icon: ArrowLeft }}
      />

      <div className="grid gap-6 xl:grid-cols-[2fr,1fr]">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <CardTitle>Order overview</CardTitle>
                <div className="flex flex-wrap gap-2">
                  <Button variant="outline" size="sm" onClick={() => setStatusDialogOpen(true)}>
                    Update status
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => setPaymentDialogOpen(true)}>
                    Update payment
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex flex-wrap items-center gap-3">
                <StatusBadge status={order.status} />
                {order.paymentStatus && <StatusBadge status={order.paymentStatus} />}
                <span className="text-xs uppercase tracking-wide text-muted-foreground">Order ID: {order._id}</span>
              </div>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <InfoRow label="Delivery method" value={order.deliveryMethod === 'delivery' ? 'Delivery' : 'Pickup'} />
                <InfoRow label="Total price" value={formatCurrency(order.totalPrice)} />
                <InfoRow label="Deposit" value={formatCurrency(order.depositTotal)} />
                <InfoRow label="Created" value={formatDate(order.createdAt)} />
                <InfoRow label="Updated" value={formatDate(order.updatedAt)} />
                <InfoRow label="Terms accepted" value={order.consents?.termsAccepted ? 'Yes' : 'No'} />
              </div>
              {order.deliveryMethod === 'delivery' && addressLine ? <InfoRow label="Delivery address" value={addressLine} /> : null}
              {(order.notes || order.adminNotes) && (
                <div className="space-y-4">
                  {order.notes && (
                    <div>
                      <div className="text-xs uppercase tracking-wide text-muted-foreground">Customer notes</div>
                      <p className="text-sm text-[var(--cms-foreground)] whitespace-pre-wrap">{order.notes}</p>
                    </div>
                  )}
                  {order.adminNotes && (
                    <div>
                      <div className="text-xs uppercase tracking-wide text-muted-foreground">Admin notes</div>
                      <p className="text-sm text-[var(--cms-foreground)] whitespace-pre-wrap">{order.adminNotes}</p>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Items</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {order.items.map((item, index) => (
                <div key={index} className="flex gap-3 rounded-xl border border-slate-200/70 bg-white p-4">
                  {item.image ? (
                    <img src={resolveMediaUrl(item.image)} alt="" className="h-14 w-14 rounded-lg object-cover" />
                  ) : null}
                  <div className="flex-1 space-y-1">
                    <div className="text-sm font-semibold text-[var(--cms-foreground)]">{item.title}</div>
                    <div className="text-xs text-muted-foreground">
                      {formatDate(item.deliveryDate)} – {formatDate(item.returnDate)} · {item.days} {item.days === 1 ? 'day' : 'days'} · Qty {item.quantity}
                    </div>
                    <div className="text-sm text-[var(--cms-foreground)]">
                      ${item.pricePerDay}/day → {formatCurrency(item.subtotal)}
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Customer</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <InfoRow label="Name" value={guestName} />
              <InfoRow label="Email" value={guestEmail} />
              <InfoRow label="Phone" value={order.guestInfo?.phone || '—'} />
              {order.user?.name && <InfoRow label="Account" value="Signed-in customer" />}
              {!order.user?.name && <InfoRow label="Account" value="Guest checkout" />}
            </CardContent>
          </Card>
        </div>
      </div>

      <Dialog open={statusDialogOpen} onOpenChange={setStatusDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update order status</DialogTitle>
            <DialogDescription>Choose the new status for this rental order.</DialogDescription>
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
            <DialogDescription>Choose the new payment status for this rental order.</DialogDescription>
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
    </div>
  );
}
