import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '../components/PageHeader';
import { DataTable, Column } from '../components/DataTable';
import { TableToolbar } from '../components/TableToolbar';
import { StatusBadge } from '../components/StatusBadge';
import { EmptyState } from '../components/EmptyState';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { TableSkeleton } from '../components/TableSkeleton';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { Label } from '../../components/ui/label';
import { DropdownMenuItem, DropdownMenuSeparator } from '../../components/ui/dropdown-menu';
import { Plus, RefreshCw, Star, Package } from 'lucide-react';
import { toast } from 'sonner';
import { rentalCategoriesApi, rentalProductsApi, resolveMediaUrl } from '../../services/api';

interface RentalProductListItem {
  _id: string;
  title: string;
  slug: string;
  category?: { label?: string };
  images?: string[];
  pricePerDay?: number;
  quantityTotal?: number;
  featured?: boolean;
  status?: string;
}

interface CategoryOption {
  _id: string;
  label: string;
}

export function RentalsListPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState<RentalProductListItem[]>([]);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [featuredOnly, setFeaturedOnly] = useState(false);
  const [minPriceFilter, setMinPriceFilter] = useState('');
  const [maxPriceFilter, setMaxPriceFilter] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<RentalProductListItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [statusProduct, setStatusProduct] = useState<RentalProductListItem | null>(null);
  const [statusValue, setStatusValue] = useState<'draft' | 'published' | 'archived'>('draft');
  const [isStatusUpdating, setIsStatusUpdating] = useState(false);

  useEffect(() => {
    rentalCategoriesApi.getAll().then(setCategories).catch(() => {});
  }, []);

  const loadProducts = async (query: string) => {
    setLoading(true);
    try {
      const result = await rentalProductsApi.getAllWithMeta({
        status: statusFilter,
        category: categoryFilter !== 'all' ? categoryFilter : undefined,
        featured: featuredOnly ? true : undefined,
        minPrice: minPriceFilter || undefined,
        maxPrice: maxPriceFilter || undefined,
        search: query || undefined,
        page,
        limit: 10,
      });
      setProducts(result.data || []);
      const pagination = result.meta?.pagination;
      setTotal(pagination?.total ?? result.data?.length ?? 0);
      setTotalPages(pagination?.pages ?? 1);
    } catch (error) {
      toast.error('Failed to load rental products');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const handle = setTimeout(() => setDebouncedSearch(search), 350);
    return () => clearTimeout(handle);
  }, [search]);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, statusFilter, categoryFilter, featuredOnly, minPriceFilter, maxPriceFilter]);

  useEffect(() => {
    loadProducts(debouncedSearch);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch, statusFilter, categoryFilter, featuredOnly, minPriceFilter, maxPriceFilter, page]);

  const handleDelete = async () => {
    if (!productToDelete) return;
    setIsDeleting(true);
    try {
      await rentalProductsApi.delete(productToDelete._id);
      toast.success('Rental product deleted');
      setDeleteDialogOpen(false);
      setProductToDelete(null);
      loadProducts(debouncedSearch);
    } catch (error: any) {
      toast.error(error?.message || 'Failed to delete rental product');
    } finally {
      setIsDeleting(false);
    }
  };

  const toggleFeatured = async (product: RentalProductListItem) => {
    try {
      await rentalProductsApi.update(product._id, { featured: !product.featured });
      toast.success(product.featured ? 'Removed from featured' : 'Marked as featured');
      loadProducts(debouncedSearch);
    } catch (error) {
      toast.error('Failed to update featured status');
    }
  };

  const openStatusDialog = (product: RentalProductListItem) => {
    setStatusProduct(product);
    setStatusValue((product.status as 'draft' | 'published' | 'archived') || 'draft');
    setStatusDialogOpen(true);
  };

  const handleStatusChange = async () => {
    if (!statusProduct) return;
    try {
      setIsStatusUpdating(true);
      await rentalProductsApi.update(statusProduct._id, { status: statusValue });
      toast.success('Status updated');
      loadProducts(debouncedSearch);
    } catch (error) {
      toast.error('Failed to update status');
    } finally {
      setIsStatusUpdating(false);
      setStatusDialogOpen(false);
      setStatusProduct(null);
    }
  };

  const handleArchive = async (product: RentalProductListItem) => {
    try {
      await rentalProductsApi.update(product._id, { status: 'archived' });
      toast.success('Rental product archived');
      loadProducts(debouncedSearch);
    } catch (error) {
      toast.error('Failed to archive rental product');
    }
  };

  // The shared DataTable always renders View/Edit/Duplicate/Archive/Delete for every
  // resource; rental products don't have a duplicate concept (no /duplicate endpoint,
  // unlike Trips), so that action is a no-op with a toast instead of silently doing
  // nothing.
  const handleRowAction = (action: string, product: RentalProductListItem) => {
    if (action === 'view' || action === 'edit') {
      navigate(`/cms/rentals/${product._id}`);
    } else if (action === 'archive') {
      handleArchive(product);
    } else if (action === 'delete') {
      setProductToDelete(product);
      setDeleteDialogOpen(true);
    } else if (action === 'duplicate') {
      toast.info('Duplicating rental products isn’t supported yet.');
    }
  };

  const columns: Column<RentalProductListItem>[] = [
    {
      id: 'title',
      header: 'Product',
      accessor: (product) => (
        <div className="flex items-center gap-3">
          {product.images?.[0] ? (
            <img
              src={resolveMediaUrl(product.images[0])}
              alt={product.title}
              className="h-10 w-10 rounded-lg object-cover"
            />
          ) : (
            <div className="h-10 w-10 rounded-lg bg-slate-100 flex items-center justify-center">
              <Package className="h-5 w-5 text-slate-500" />
            </div>
          )}
          <div>
            <div className="font-medium">{product.title}</div>
            <div className="text-[11px] text-muted-foreground">{product.slug}</div>
          </div>
        </div>
      ),
    },
    {
      id: 'category',
      header: 'Category',
      accessor: (product) => <span className="text-sm">{product.category?.label || '—'}</span>,
    },
    {
      id: 'price',
      header: 'Price/day',
      accessor: (product) => (typeof product.pricePerDay === 'number' ? `$${product.pricePerDay}` : '—'),
    },
    {
      id: 'quantity',
      header: 'Qty',
      accessor: (product) => product.quantityTotal ?? '—',
    },
    {
      id: 'featured',
      header: 'Featured',
      accessor: (product) => (
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => toggleFeatured(product)}>
          <Star className={product.featured ? 'h-4 w-4 fill-amber-400 text-amber-400' : 'h-4 w-4 text-slate-300'} />
        </Button>
      ),
    },
    {
      id: 'status',
      header: 'Status',
      accessor: (product) => <StatusBadge status={product.status || 'draft'} />,
    },
  ];

  return (
    <div className="px-6 py-4 space-y-4">
      <PageHeader
        title="Rental Products"
        description="Gear available for rent through Trekkers Squad Rentals"
        action={{ label: 'New Product', onClick: () => navigate('/cms/rentals/new'), icon: Plus }}
      />

      <TableToolbar
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search rental products..."
        filterValue={statusFilter}
        onFilterChange={setStatusFilter}
        filterLabel="Status"
        filterOptions={[
          { label: 'Draft', value: 'draft' },
          { label: 'Published', value: 'published' },
          { label: 'Archived', value: 'archived' },
        ]}
      />

      <div className="flex flex-wrap items-end gap-3 rounded-2xl border border-slate-200/70 bg-white/90 p-3 shadow-sm mb-4">
        <div className="space-y-1">
          <Label className="text-[11px] text-muted-foreground">Category</Label>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="h-8 w-[160px] text-[11px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All categories</SelectItem>
              {categories.map((c) => (
                <SelectItem key={c._id} value={c._id}>
                  {c.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1">
          <Label className="text-[11px] text-muted-foreground">Min price</Label>
          <Input
            className="h-8 w-[100px] text-[11px]"
            type="number"
            value={minPriceFilter}
            onChange={(e) => setMinPriceFilter(e.target.value)}
            placeholder="$0"
          />
        </div>
        <div className="space-y-1">
          <Label className="text-[11px] text-muted-foreground">Max price</Label>
          <Input
            className="h-8 w-[100px] text-[11px]"
            type="number"
            value={maxPriceFilter}
            onChange={(e) => setMaxPriceFilter(e.target.value)}
            placeholder="Any"
          />
        </div>
        <Button
          variant={featuredOnly ? 'default' : 'outline'}
          size="sm"
          className="h-8 text-[11px]"
          style={featuredOnly ? { backgroundColor: 'var(--cms-primary)', color: 'var(--cms-primary-foreground)' } : undefined}
          onClick={() => setFeaturedOnly((v) => !v)}
        >
          <Star className="mr-1 h-3.5 w-3.5" />
          Featured only
        </Button>
      </div>

      {loading ? (
        <TableSkeleton />
      ) : products.length === 0 ? (
        <EmptyState
          icon={Package}
          title="No rental products found"
          description="Add your first piece of rental gear"
          action={{ label: 'New Product', onClick: () => navigate('/cms/rentals/new') }}
        />
      ) : (
        <DataTable
          data={products}
          columns={columns}
          getRowId={(product) => product._id}
          onRowAction={handleRowAction}
          renderRowActions={(product) => (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => openStatusDialog(product)}>
                <RefreshCw className="mr-2 h-4 w-4" />
                Update Status
              </DropdownMenuItem>
            </>
          )}
          pagination={
            totalPages > 1
              ? { page, limit: 10, total, totalPages, onPageChange: setPage }
              : undefined
          }
        />
      )}

      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Delete Rental Product"
        description={`Are you sure you want to delete "${productToDelete?.title}"? This action cannot be undone.`}
        confirmLabel="Delete"
        variant="destructive"
        loading={isDeleting}
        closeOnConfirm={false}
        onConfirm={handleDelete}
      />

      <Dialog open={statusDialogOpen} onOpenChange={setStatusDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Update Status</DialogTitle>
            <DialogDescription>Choose a new status for "{statusProduct?.title}".</DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label>Status</Label>
            <Select value={statusValue} onValueChange={(value) => setStatusValue(value as typeof statusValue)}>
              <SelectTrigger className="h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="published">Published</SelectItem>
                <SelectItem value="archived">Archived</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setStatusDialogOpen(false)}
              className="border-[var(--cms-border)] bg-white hover:bg-[var(--cms-muted)]"
              disabled={isStatusUpdating}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleStatusChange}
              style={{ backgroundColor: 'var(--cms-primary)', color: 'var(--cms-primary-foreground)' }}
              className="border-0"
              disabled={isStatusUpdating}
            >
              Update Status
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
