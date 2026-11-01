import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DataTable, Column } from '../components/DataTable';
import { TableToolbar } from '../components/TableToolbar';
import { EmptyState } from '../components/EmptyState';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { TableSkeleton } from '../components/TableSkeleton';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Tag, Plus, Trash2, Pencil } from 'lucide-react';
import { promotionsApi } from '../../services/api';
import { toast } from 'sonner';

interface PromotionRow {
  _id: string;
  title: string;
  code: string;
  description?: string;
  type: 'global' | 'trip';
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  isActive?: boolean;
  trip?: {
    _id: string;
    title: string;
  };
  validFrom?: string;
  validUntil?: string;
}

export function PromotionsPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [promotions, setPromotions] = useState<PromotionRow[]>([]);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [promotionToDelete, setPromotionToDelete] = useState<PromotionRow | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const loadPromotions = async (query?: string) => {
    setLoading(true);
    try {
      const data = await promotionsApi.getAll({
        search: query || undefined,
      });
      setPromotions(data || []);
    } catch (error: any) {
      toast.error(error?.message || 'Failed to load promotions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
    }, 300);
    return () => clearTimeout(handler);
  }, [search]);

  useEffect(() => {
    loadPromotions(debouncedSearch);
  }, [debouncedSearch]);

  const handleDelete = async () => {
    if (!promotionToDelete) return;
    setIsDeleting(true);
    try {
      await promotionsApi.delete(promotionToDelete._id);
      toast.success('Promotion deleted');
      setDeleteDialogOpen(false);
      setPromotionToDelete(null);
      loadPromotions(debouncedSearch);
    } catch (error: any) {
      toast.error(error?.message || 'Failed to delete promotion');
    } finally {
      setIsDeleting(false);
    }
  };

  const formatValidity = (from?: string, until?: string) => {
    if (!from && !until) return 'No expiry';
    const formatter = new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
    if (from && until) {
      return `${formatter.format(new Date(from))} - ${formatter.format(new Date(until))}`;
    }
    if (from) {
      return `Starts ${formatter.format(new Date(from))}`;
    }
    return `Expires ${formatter.format(new Date(until!))}`;
  };

  const columns: Column<PromotionRow>[] = [
    {
      id: 'code',
      header: 'Code',
      accessor: (promo) => (
        <div>
          <div className="font-semibold">{promo.code}</div>
          <p className="text-xs text-muted-foreground">{promo.title}</p>
        </div>
      ),
    },
    {
      id: 'scope',
      header: 'Scope',
      accessor: (promo) => (
        <div className="text-sm text-[var(--cms-muted-foreground)] flex flex-col">
          <span className="font-medium text-[var(--cms-foreground)] text-sm">
            {promo.type === 'global' ? 'Global' : 'Trip'}
          </span>
          {promo.type === 'trip' && (
            <span className="text-xs capitalize">{promo.trip?.title || 'Trip required'}</span>
          )}
        </div>
      ),
    },
    {
      id: 'discount',
      header: 'Discount',
      accessor: (promo) => (
        <div className="flex items-center gap-1 text-sm">
          <Tag className="h-4 w-4 text-[var(--cms-muted-foreground)]" />
          <span className="font-medium">{promo.discountType === 'percentage' ? `${promo.discountValue}%` : `US $${promo.discountValue.toFixed(2)}`}</span>
          <span className="text-[var(--cms-muted-foreground)] lowercase">off</span>
        </div>
      ),
    },
    {
      id: 'validity',
      header: 'Validity',
      accessor: (promo) => (
        <div className="text-sm text-[var(--cms-muted-foreground)]">
          {formatValidity(promo.validFrom, promo.validUntil)}
        </div>
      ),
    },
    {
      id: 'status',
      header: 'Status',
      accessor: (promo) => (
        <Badge className="text-[var(--cms-foreground)] border-[var(--cms-border)]">
          {promo.isActive ? 'Active' : 'Inactive'}
        </Badge>
      ),
    },
    {
      id: 'actions',
      header: '',
      accessor: (promo) => (
        <div className="flex items-center gap-2 justify-end">
          <Button
            variant="outline"
            size="sm"
            className="border-[var(--cms-border)] bg-white hover:bg-[var(--cms-muted)] text-[var(--cms-foreground)]"
            onClick={() => navigate(`/cms/promotions/${promo._id}`)}
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="border-[var(--cms-border)] bg-white hover:bg-[var(--cms-muted)] text-[var(--cms-foreground)]"
            onClick={() => {
              setPromotionToDelete(promo);
              setDeleteDialogOpen(true);
            }}
          >
            <Trash2 className="h-4 w-4 text-[var(--cms-destructive)]" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="px-6 py-4 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-[var(--cms-foreground)]">Promotions</h1>
        <Button
          onClick={() => navigate('/cms/promotions/new')}
          style={{ backgroundColor: 'var(--cms-primary)', color: 'var(--cms-primary-foreground)' }}
          className="border-0"
        >
          <Plus className="mr-2 h-4 w-4" />
          New Promotion
        </Button>
      </div>
      <TableToolbar
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search promo codes..."
      />

      {loading ? (
        <TableSkeleton />
      ) : promotions.length === 0 ? (
        <EmptyState
          icon={Tag}
          title="No promotions yet"
          description="Create a global or trip-specific promo code to run a campaign."
          action={{ label: 'Create promotion', onClick: () => navigate('/cms/promotions/new') }}
        />
      ) : (
        <DataTable data={promotions} columns={columns} getRowId={(promo) => promo._id} />
      )}

      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Delete Promotion"
        description={`Are you sure you want to delete "${promotionToDelete?.title || promotionToDelete?.code}"?`}
        variant="destructive"
        confirmLabel="Delete"
        loading={isDeleting}
        closeOnConfirm={false}
        onConfirm={handleDelete}
      />
    </div>
  );
}
