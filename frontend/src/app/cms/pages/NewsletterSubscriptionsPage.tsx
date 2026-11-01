import { useEffect, useMemo, useState } from 'react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { MoreHorizontal, Copy, Trash2 } from 'lucide-react';
import { DataTable, Column } from '../components/DataTable';
import { TableToolbar } from '../components/TableToolbar';
import { TableSkeleton } from '../components/TableSkeleton';
import { StatusBadge } from '../components/StatusBadge';
import { Button } from '../../components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '../../components/ui/dropdown-menu';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { newsletterSubscriptionsApi } from '../../services/api';

type NewsletterSubscription = {
  _id: string;
  email: string;
  source?: string;
  status?: 'subscribed' | 'unsubscribed';
  subscribedAt?: string;
  createdAt: string;
};

export function NewsletterSubscriptionsPage() {
  const [loading, setLoading] = useState(true);
  const [subscriptions, setSubscriptions] = useState<NewsletterSubscription[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState<{ page: number; limit: number; total: number; pages: number } | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [subscriptionToDelete, setSubscriptionToDelete] = useState<NewsletterSubscription | null>(null);
  const [deleting, setDeleting] = useState(false);

  const totalCount = useMemo(() => pagination?.total ?? subscriptions.length, [pagination?.total, subscriptions.length]);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const result = await newsletterSubscriptionsApi.getAll({
          search,
          status: statusFilter !== 'all' ? (statusFilter as any) : undefined,
          page,
          limit: 25,
        });
        setSubscriptions(result.data);
        setPagination(result.meta?.pagination || null);
      } catch (error: any) {
        toast.error(error?.message || 'Failed to load newsletter subscriptions');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [page, search, statusFilter]);

  const openDeleteDialog = (subscription: NewsletterSubscription) => {
    setSubscriptionToDelete(subscription);
    setDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!subscriptionToDelete) return;
    setDeleting(true);
    try {
      await newsletterSubscriptionsApi.delete(subscriptionToDelete._id);
      setSubscriptions((prev) => prev.filter((s) => s._id !== subscriptionToDelete._id));
      toast.success('Subscription deleted');
    } catch (error: any) {
      toast.error(error?.message || 'Failed to delete subscription');
    } finally {
      setDeleting(false);
      setDeleteDialogOpen(false);
      setSubscriptionToDelete(null);
    }
  };

  const columns: Column<NewsletterSubscription>[] = [
    {
      id: 'email',
      header: 'Email',
      accessor: (s) => <div className="font-medium">{s.email}</div>,
    },
    {
      id: 'source',
      header: 'Source',
      accessor: (s) => s.source || '—',
    },
    {
      id: 'status',
      header: 'Status',
      accessor: (s) => <StatusBadge status={s.status || 'subscribed'} />,
    },
    {
      id: 'date',
      header: 'Date',
      accessor: (s) => format(new Date(s.subscribedAt || s.createdAt), 'MMM d, yyyy'),
    },
    {
      id: 'actions',
      header: '',
      accessor: (s) => (
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
            <DropdownMenuItem
              onClick={async () => {
                try {
                  await navigator.clipboard.writeText(s.email);
                  toast.success('Email copied');
                } catch {
                  toast.error('Failed to copy');
                }
              }}
              className="gap-2"
            >
              <Copy className="h-4 w-4 text-slate-700" />
              Copy email
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => openDeleteDialog(s)} className="gap-2 text-destructive">
              <Trash2 className="h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  return (
    <div>
      <TableToolbar
        searchValue={search}
        onSearchChange={(value) => {
          setSearch(value);
          setPage(1);
        }}
        searchPlaceholder="Search email or source..."
        filterValue={statusFilter}
        onFilterChange={(value) => {
          setStatusFilter(value);
          setPage(1);
        }}
        filterOptions={[
          { label: 'Subscribed', value: 'subscribed' },
          { label: 'Unsubscribed', value: 'unsubscribed' },
        ]}
        filterLabel="Status"
        bulkActions={<div className="text-sm text-muted-foreground">{totalCount} total</div>}
      />

      {loading ? (
        <TableSkeleton />
      ) : (
        <DataTable
          data={subscriptions}
          columns={columns}
          getRowId={(s) => s._id}
          pagination={
            pagination
              ? {
                  page: pagination.page,
                  limit: pagination.limit,
                  total: pagination.total,
                  totalPages: pagination.pages,
                  onPageChange: setPage,
                }
              : undefined
          }
          emptyMessage="No newsletter subscriptions yet"
        />
      )}

      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={(open) => {
          setDeleteDialogOpen(open);
          if (!open) setSubscriptionToDelete(null);
        }}
        title={`Delete ${subscriptionToDelete?.email || 'this subscription'}?`}
        description="This will permanently remove the subscription record."
        confirmLabel="Delete"
        cancelLabel="Cancel"
        onConfirm={handleDelete}
        variant="destructive"
        loading={deleting}
        closeOnConfirm={false}
      />
    </div>
  );
}

