import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DataTable, Column } from '../components/DataTable';
import { Button } from '../../components/ui/button';
import { TableSkeleton } from '../components/TableSkeleton';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { StatusBadge } from '../components/StatusBadge';
import { addOnsApi, ApiError, type AddOnRecord } from '../../services/api';
import { Plus, MoreHorizontal, PencilLine, Trash2 } from 'lucide-react';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from '../../components/ui/dropdown-menu';
import { toast } from 'sonner';

const priceLabel = (a: AddOnRecord) => {
  if (a.pricingType === 'choice') {
    const prices = (a.options || []).map((o) => o.price ?? 0).filter((p) => p > 0);
    return prices.length ? `from $${Math.min(...prices)}` : '—';
  }
  return a.price != null ? `$${a.price}` : '—';
};

export function AddOnsPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [addOns, setAddOns] = useState<AddOnRecord[]>([]);
  const [kindFilter, setKindFilter] = useState<'all' | 'comfort' | 'activity'>('all');
  const [deleteTarget, setDeleteTarget] = useState<AddOnRecord | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const data = await addOnsApi.getAll();
      setAddOns(data);
    } catch (error) {
      toast.error('Failed to load add-ons');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await addOnsApi.delete(deleteTarget._id);
      setAddOns((prev) => prev.filter((a) => a._id !== deleteTarget._id));
      toast.success('Add-on deleted');
      setDeleteTarget(null);
    } catch (error) {
      toast.error(error instanceof ApiError ? error.message : 'Failed to delete add-on');
    } finally {
      setIsDeleting(false);
    }
  };

  const rows = useMemo(
    () => (kindFilter === 'all' ? addOns : addOns.filter((a) => a.kind === kindFilter)),
    [addOns, kindFilter],
  );

  const columns: Column<AddOnRecord>[] = [
    {
      id: 'title',
      header: 'Title',
      accessor: (a) => (
        <div>
          <div className="font-medium">{a.title}</div>
          <div className="text-sm text-muted-foreground">
            {a.kind === 'activity' ? [a.activityType, a.duration, a.location].filter(Boolean).join(' • ') : a.description || '—'}
          </div>
        </div>
      ),
    },
    { id: 'kind', header: 'Kind', accessor: (a) => (a.kind === 'comfort' ? 'Comfort' : 'Activity') },
    { id: 'price', header: 'Price', accessor: (a) => `${priceLabel(a)}${a.pricingType === 'choice' ? '' : ''}` },
    { id: 'scope', header: 'Offered on', accessor: (a) => (a.scope === 'global' ? 'Every trip' : `${a.trips?.length || 0} trip(s)`) },
    { id: 'status', header: 'Status', accessor: (a) => <StatusBadge status={a.status === 'active' ? 'approved' : 'archived'} /> },
    {
      id: 'actions',
      header: '',
      accessor: (a) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel className="text-xs uppercase tracking-widest text-muted-foreground">Manage</DropdownMenuLabel>
            <DropdownMenuItem onClick={() => navigate(`/cms/add-ons/${a._id}`)} className="gap-2">
              <PencilLine className="h-4 w-4 text-blue-600" /> Edit
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => setDeleteTarget(a)} className="gap-2" variant="destructive">
              <Trash2 className="h-4 w-4" /> Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  return (
    <div className="px-6 py-4">
      <div className="flex items-center justify-between mb-4 gap-3">
        <div className="flex gap-1.5">
          {(['all', 'comfort', 'activity'] as const).map((k) => (
            <Button
              key={k}
              variant={kindFilter === k ? 'default' : 'outline'}
              size="sm"
              onClick={() => setKindFilter(k)}
              className="capitalize"
            >
              {k === 'all' ? 'All' : k}
            </Button>
          ))}
        </div>
        <Button
          onClick={() => navigate('/cms/add-ons/new')}
          style={{ backgroundColor: 'var(--cms-primary)', color: 'var(--cms-primary-foreground)' }}
        >
          <Plus className="mr-2 h-4 w-4" /> Add-on
        </Button>
      </div>

      {loading ? <TableSkeleton /> : <DataTable data={rows} columns={columns} getRowId={(a) => a._id} />}

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(v) => !v && setDeleteTarget(null)}
        title="Delete add-on"
        description={`Delete "${deleteTarget?.title || 'this add-on'}"? Existing bookings keep their saved copy.`}
        confirmLabel="Delete"
        variant="destructive"
        onConfirm={handleDelete}
        loading={isDeleting}
        closeOnConfirm={false}
      />
    </div>
  );
}
