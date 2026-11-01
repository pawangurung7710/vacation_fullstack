import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DataTable, Column } from '../components/DataTable';
import { TableToolbar } from '../components/TableToolbar';
import { StatusBadge } from '../components/StatusBadge';
import { TableSkeleton } from '../components/TableSkeleton';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { format } from 'date-fns';
import { rentalOrdersApi } from '../../services/api';
import { Button } from '../../components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '../../components/ui/dropdown-menu';
import { toast } from 'sonner';
import { CheckCircle2, CreditCard, Eye, MoreHorizontal, Trash2 } from 'lucide-react';

interface RentalOrderItem {
  title: string;
  quantity: number;
  subtotal: number;
}

interface RentalOrderRecord {
  _id: string;
  user?: { name?: string; email?: string };
  guestInfo?: { name?: string; email?: string };
  items: RentalOrderItem[];
  totalPrice: number;
  status: string;
  paymentStatus?: string;
  createdAt: string;
}

export function RentalOrdersPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<RentalOrderRecord[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<RentalOrderRecord | null>(null);
  const [selectedStatus, setSelectedStatus] = useState('pending');
  const [selectedPaymentStatus, setSelectedPaymentStatus] = useState('pending');
  const [savingStatus, setSavingStatus] = useState(false);
  const [savingPayment, setSavingPayment] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const statusOptions = useMemo(() => ['pending', 'confirmed', 'delivered', 'returned', 'cancelled'], []);
  const paymentOptions = useMemo(() => ['pending', 'partial', 'paid', 'refunded'], []);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const result = await rentalOrdersApi.getAll({
          status: statusFilter !== 'all' ? statusFilter : undefined,
          page,
          limit: 25,
        });
        const query = search.trim().toLowerCase();
        const filtered = query
          ? (result.data || []).filter((order: RentalOrderRecord) => {
              const name = order.guestInfo?.name || order.user?.name || '';
              const email = order.guestInfo?.email || order.user?.email || '';
              const itemTitles = order.items?.map((i) => i.title).join(' ') || '';
              return (
                name.toLowerCase().includes(query) ||
                email.toLowerCase().includes(query) ||
                itemTitles.toLowerCase().includes(query)
              );
            })
          : result.data || [];
        setOrders(filtered);
      } catch (error) {
        toast.error('Failed to load rental orders');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [page, statusFilter, search]);

  const openStatusDialog = (order: RentalOrderRecord) => {
    setSelectedOrder(order);
    setSelectedStatus(order.status || 'pending');
    setStatusDialogOpen(true);
  };

  const openPaymentDialog = (order: RentalOrderRecord) => {
    setSelectedOrder(order);
    setSelectedPaymentStatus(order.paymentStatus || 'pending');
    setPaymentDialogOpen(true);
  };

  const handleStatusSave = async () => {
    if (!selectedOrder) return;
    setSavingStatus(true);
    try {
      const updated = await rentalOrdersApi.update(selectedOrder._id, { status: selectedStatus });
      setOrders((prev) => prev.map((o) => (o._id === selectedOrder._id ? { ...o, status: updated.status } : o)));
      toast.success('Order status updated.');
      setStatusDialogOpen(false);
    } catch (error) {
      toast.error('Failed to update order status.');
    } finally {
      setSavingStatus(false);
    }
  };

  const handlePaymentSave = async () => {
    if (!selectedOrder) return;
    setSavingPayment(true);
    try {
      const updated = await rentalOrdersApi.update(selectedOrder._id, { paymentStatus: selectedPaymentStatus });
      setOrders((prev) => prev.map((o) => (o._id === selectedOrder._id ? { ...o, paymentStatus: updated.paymentStatus } : o)));
      toast.success('Payment status updated.');
      setPaymentDialogOpen(false);
    } catch (error) {
      toast.error('Failed to update payment status.');
    } finally {
      setSavingPayment(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedOrder) return;
    setIsDeleting(true);
    try {
      await rentalOrdersApi.delete(selectedOrder._id);
      toast.success('Order deleted');
      setOrders((prev) => prev.filter((o) => o._id !== selectedOrder._id));
      setDeleteDialogOpen(false);
      setSelectedOrder(null);
    } catch (error) {
      toast.error('Failed to delete order');
    } finally {
      setIsDeleting(false);
    }
  };

  const columns: Column<RentalOrderRecord>[] = [
    {
      id: 'customer',
      header: 'Customer',
      accessor: (o) => {
        const name = o.guestInfo?.name || o.user?.name || 'Guest';
        const email = o.guestInfo?.email || o.user?.email || '—';
        return (
          <div>
            <div className="font-medium">{name}</div>
            <div className="text-sm text-muted-foreground">{email}</div>
          </div>
        );
      },
    },
    {
      id: 'items',
      header: 'Items',
      accessor: (o) => {
        const first = o.items?.[0];
        const extra = (o.items?.length || 0) - 1;
        return <span>{first ? `${first.title}${extra > 0 ? ` +${extra} more` : ''}` : '—'}</span>;
      },
    },
    { id: 'amount', header: 'Total', accessor: (o) => `$${o.totalPrice.toLocaleString()}` },
    { id: 'status', header: 'Status', accessor: (o) => <StatusBadge status={o.status} /> },
    { id: 'payment', header: 'Payment', accessor: (o) => <StatusBadge status={o.paymentStatus || 'pending'} /> },
    { id: 'date', header: 'Ordered', accessor: (o) => format(new Date(o.createdAt), 'MMM d, yyyy') },
    {
      id: 'actions',
      header: '',
      accessor: (o) => (
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
            <DropdownMenuItem onClick={() => navigate(`/cms/rental-orders/${o._id}`)} className="gap-2">
              <Eye className="h-4 w-4 text-[var(--cms-primary)]" />
              View details
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => openStatusDialog(o)} className="gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
              Update status
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => openPaymentDialog(o)} className="gap-2">
              <CreditCard className="h-4 w-4 text-blue-600" />
              Update payment
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => {
                setSelectedOrder(o);
                setDeleteDialogOpen(true);
              }}
              className="gap-2 text-red-600"
            >
              <Trash2 className="h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  return (
    <div className="px-6 py-4 space-y-4">
      <TableToolbar
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search by customer or item..."
        filterValue={statusFilter}
        onFilterChange={setStatusFilter}
        filterLabel="Status"
        filterOptions={[
          { label: 'Pending', value: 'pending' },
          { label: 'Confirmed', value: 'confirmed' },
          { label: 'Delivered', value: 'delivered' },
          { label: 'Returned', value: 'returned' },
          { label: 'Cancelled', value: 'cancelled' },
        ]}
      />
      {loading ? <TableSkeleton /> : <DataTable data={orders} columns={columns} getRowId={(o) => o._id} />}

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

      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Delete Order"
        description="Are you sure you want to delete this rental order? This action cannot be undone."
        confirmLabel="Delete"
        variant="destructive"
        loading={isDeleting}
        closeOnConfirm={false}
        onConfirm={handleDelete}
      />
    </div>
  );
}
