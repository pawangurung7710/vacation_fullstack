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
import { ChevronDown, ChevronUp, Plus, MapPin, Trash2, RefreshCw, FileText } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { categoriesApi, regionsApi, tripsApi, ApiError } from '../../services/api';

interface TripListItem {
  _id: string;
  title: string;
  slug: string;
  category?: {
    id?: string;
    label?: string;
    slug?: string;
  };
  subcategory?: {
    id?: string;
    label?: string;
    slug?: string;
  };
  categoryLabel?: string;
  subcategoryLabel?: string;
  country?: string;
  region?: string;
  duration?: string | number;
  price?: number;
  views?: number;
  status?: string;
  updatedAt?: string;
}

interface CategoryOption {
  _id: string;
  label: string;
}

interface RegionOption {
  _id: string;
  name: string;
}

export function TripsListPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [trips, setTrips] = useState<TripListItem[]>([]);
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [subcategories, setSubcategories] = useState<CategoryOption[]>([]);
  const [regions, setRegions] = useState<RegionOption[]>([]);
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [subcategoryFilter, setSubcategoryFilter] = useState('all');
  const [difficultyFilter, setDifficultyFilter] = useState('all');
  const [featuredFilter, setFeaturedFilter] = useState('all');
  const [countryFilter, setCountryFilter] = useState('');
  const [regionFilter, setRegionFilter] = useState('all');
  const [minPriceFilter, setMinPriceFilter] = useState('');
  const [maxPriceFilter, setMaxPriceFilter] = useState('');
  const [minDurationFilter, setMinDurationFilter] = useState('');
  const [maxDurationFilter, setMaxDurationFilter] = useState('');
  const [sortField, setSortField] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [showFilters, setShowFilters] = useState(false);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [tripToDelete, setTripToDelete] = useState<TripListItem | null>(null);
  const [archiveDialogOpen, setArchiveDialogOpen] = useState(false);
  const [tripToArchive, setTripToArchive] = useState<TripListItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isArchiving, setIsArchiving] = useState(false);
  const [bulkArchiveDialogOpen, setBulkArchiveDialogOpen] = useState(false);
  const [bulkDeleteDialogOpen, setBulkDeleteDialogOpen] = useState(false);
  const [isBulkUpdating, setIsBulkUpdating] = useState(false);
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [statusTrip, setStatusTrip] = useState<TripListItem | null>(null);
  const [statusValue, setStatusValue] = useState<'draft' | 'published' | 'archived'>('draft');
  const [isStatusUpdating, setIsStatusUpdating] = useState(false);

  const loadTrips = async (query: string) => {
    setLoading(true);
    try {
      const result = await tripsApi.getAllWithMeta({
        status: statusFilter,
        categoryId: categoryFilter !== 'all' ? categoryFilter : undefined,
        subcategoryId: subcategoryFilter !== 'all' ? subcategoryFilter : undefined,
        difficulty: difficultyFilter !== 'all' ? difficultyFilter : undefined,
        featured: featuredFilter === 'all' ? undefined : featuredFilter === 'featured',
        country: countryFilter || undefined,
        regionId: regionFilter !== 'all' ? regionFilter : undefined,
        minPrice: minPriceFilter || undefined,
        maxPrice: maxPriceFilter || undefined,
        minDuration: minDurationFilter || undefined,
        maxDuration: maxDurationFilter || undefined,
        sort: sortField,
        order: sortOrder,
        search: query || undefined,
        page,
        limit: 10,
      });
      setTrips(result.data || []);
      const pagination = result.meta?.pagination;
      setTotal(pagination?.total ?? result.data?.length ?? 0);
      setTotalPages(pagination?.pages ?? 1);
    } catch (error) {
      toast.error('Failed to load trips');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const handle = setTimeout(() => {
      setDebouncedSearch(search);
    }, 350);
    return () => clearTimeout(handle);
  }, [search]);

  useEffect(() => {
    loadTrips(debouncedSearch);
  }, [
    page,
    statusFilter,
    categoryFilter,
    subcategoryFilter,
    difficultyFilter,
    featuredFilter,
    countryFilter,
    regionFilter,
    minPriceFilter,
    maxPriceFilter,
    minDurationFilter,
    maxDurationFilter,
    sortField,
    sortOrder,
    debouncedSearch,
  ]);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const data = await categoriesApi.getAll({ level: 0 });
        setCategories(data);
      } catch (error) {
        toast.error('Failed to load categories');
      }
    };
    loadCategories();
  }, []);

  useEffect(() => {
    const loadRegions = async () => {
      try {
        const data = await regionsApi.getAll();
        setRegions(data);
      } catch (error) {
        toast.error('Failed to load regions');
      }
    };
    loadRegions();
  }, []);

  useEffect(() => {
    const loadSubcategories = async () => {
      if (categoryFilter === 'all') {
        setSubcategories([]);
        setSubcategoryFilter('all');
        return;
      }
      try {
        const data = await categoriesApi.getAll({ parent: categoryFilter });
        setSubcategories(data);
        if (data.length === 0) {
          setSubcategoryFilter('all');
        }
      } catch (error) {
        toast.error('Failed to load subcategories');
      }
    };
    loadSubcategories();
  }, [categoryFilter]);

  useEffect(() => {
    setPage(1);
  }, [
    statusFilter,
    categoryFilter,
    subcategoryFilter,
    difficultyFilter,
    featuredFilter,
    countryFilter,
    regionFilter,
    minPriceFilter,
    maxPriceFilter,
    minDurationFilter,
    maxDurationFilter,
    sortField,
    sortOrder,
    debouncedSearch,
  ]);

  const handleDelete = async () => {
    if (!tripToDelete) return;
    try {
      setIsDeleting(true);
      await tripsApi.delete(tripToDelete._id);
      toast.success('Trip deleted successfully');
      loadTrips(debouncedSearch);
      setDeleteDialogOpen(false);
      setTripToDelete(null);
    } catch (error) {
      const message = error instanceof ApiError ? error.message : 'Failed to delete trip';
      toast.error(message);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleArchiveTrip = async (trip: TripListItem) => {
    try {
      setIsArchiving(true);
      await tripsApi.update(trip._id, { status: 'archived' });
      toast.success('Trip archived successfully');
      loadTrips(debouncedSearch);
    } catch (error) {
      toast.error('Failed to archive trip');
    } finally {
      setIsArchiving(false);
      setArchiveDialogOpen(false);
      setTripToArchive(null);
    }
  };

  const handleDuplicateTrip = async (trip: TripListItem) => {
    try {
      await tripsApi.duplicate(trip._id);
      toast.success('Trip duplicated successfully');
      loadTrips(debouncedSearch);
    } catch (error) {
      toast.error('Failed to duplicate trip');
    }
  };

  const handleStatusChange = async () => {
    if (!statusTrip) return;
    try {
      setIsStatusUpdating(true);
      await tripsApi.update(statusTrip._id, { status: statusValue });
      toast.success('Trip status updated');
      loadTrips(debouncedSearch);
    } catch (error) {
      toast.error('Failed to update trip status');
    } finally {
      setIsStatusUpdating(false);
      setStatusDialogOpen(false);
      setStatusTrip(null);
    }
  };

  const openStatusDialog = (trip: TripListItem) => {
    setStatusTrip(trip);
    setStatusValue((trip.status as 'draft' | 'published' | 'archived') || 'draft');
    setStatusDialogOpen(true);
  };

  const handleBulkArchive = async () => {
    if (selectedRows.length === 0) return;
    try {
      setIsBulkUpdating(true);
      await tripsApi.bulkUpdate(
        selectedRows.map((id) => ({ id, data: { status: 'archived' } }))
      );
      toast.success('Trips archived successfully');
      setSelectedRows([]);
      loadTrips(debouncedSearch);
    } catch (error) {
      toast.error('Failed to archive trips');
    } finally {
      setIsBulkUpdating(false);
      setBulkArchiveDialogOpen(false);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedRows.length === 0) return;
    try {
      setIsBulkUpdating(true);
      const results = await Promise.allSettled(
        selectedRows.map((id) => tripsApi.delete(id))
      );
      const failures = results.filter((result) => result.status === 'rejected').length;
      if (failures > 0) {
        toast.error(`Failed to delete ${failures} trip${failures > 1 ? 's' : ''}`);
      } else {
        toast.success('Trips deleted successfully');
      }
      setSelectedRows([]);
      loadTrips(debouncedSearch);
    } catch (error) {
      toast.error('Failed to delete trips');
    } finally {
      setIsBulkUpdating(false);
      setBulkDeleteDialogOpen(false);
    }
  };

  const handleRowAction = (action: string, trip: TripListItem) => {
    if (action === 'view' || action === 'edit') {
      navigate(`/cms/trips/${trip._id}`);
    } else if (action === 'duplicate') {
      handleDuplicateTrip(trip);
    } else if (action === 'archive') {
      setTripToArchive(trip);
      setArchiveDialogOpen(true);
    } else if (action === 'delete') {
      setTripToDelete(trip);
      setDeleteDialogOpen(true);
    }
  };

  const columns: Column<TripListItem>[] = [
    {
      id: 'title',
      header: 'Title',
      accessor: (trip) => (
        <div>
          <div className="font-medium">{trip.title}</div>
          <div className="text-[11px] text-muted-foreground">{trip.slug}</div>
        </div>
      ),
    },
    {
      id: 'category',
      header: 'Category',
      accessor: (trip) => (
        <div className="text-[11px]">
          <div className="font-medium capitalize">
            {trip.categoryLabel || trip.category?.label || 'Unassigned'}
          </div>
          <div className="text-[11px] text-muted-foreground capitalize">
            {trip.subcategoryLabel || trip.subcategory?.label || 'No subcategory'}
          </div>
        </div>
      ),
    },
    {
      id: 'country',
      header: 'Location',
      accessor: (trip) => `${trip.country}, ${trip.region}`,
    },
    {
      id: 'duration',
      header: 'Duration',
      accessor: (trip) => {
        const durationValue = trip.duration ?? '';
        const numericDuration = Number(durationValue);
        const unit = numericDuration === 1 ? 'day' : 'days';
        return durationValue ? `${durationValue} ${unit}` : '—';
      },
    },
    {
      id: 'price',
      header: 'Price',
      accessor: (trip) =>
        typeof trip.price === 'number' ? `US $${trip.price.toLocaleString()}` : '—',
    },
    {
      id: 'views',
      header: 'Views',
      accessor: (trip) => <span className="text-[11px] text-muted-foreground">{trip.views ?? 0}</span>,
    },
    {
      id: 'status',
      header: 'Status',
      accessor: (trip) => <StatusBadge status={trip.status || 'draft'} />,
    },
    {
      id: 'updated',
      header: 'Updated',
      accessor: (trip) =>
        trip.updatedAt ? format(new Date(trip.updatedAt), 'MMM d, yyyy') : '—',
    },
  ];

  const bulkActions = selectedRows.length > 0 && (
    <div className="flex items-center gap-2">
      <span className="text-xs text-muted-foreground">{selectedRows.length} selected</span>
      <Button
        variant="outline"
        size="sm"
        className="h-7 px-2 text-[11px]"
        onClick={() => {
          setBulkArchiveDialogOpen(true);
        }}
      >
        Archive
      </Button>
      <Button
        variant="outline"
        size="sm"
        className="h-7 px-2 text-[11px]"
        onClick={() => {
          setBulkDeleteDialogOpen(true);
        }}
      >
        <Trash2 className="mr-2 h-4 w-4" />
        Delete
      </Button>
    </div>
  );

  return (
    <div className="text-xs leading-tight" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Inter, sans-serif' }}>
      <div className="flex items-center justify-between mb-2">
        <Button
          onClick={() => navigate('/cms/trips/new')}
          style={{ backgroundColor: 'var(--cms-primary)', color: 'var(--cms-primary-foreground)' }}
          className="border-0 h-8 text-xs px-3"
        >
          <Plus className="mr-2 h-3.5 w-3.5" />
          Create Trip
        </Button>
      </div>

      <TableToolbar
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search trips..."
        filterValue={statusFilter}
        onFilterChange={setStatusFilter}
        filterOptions={[
          { label: 'Published', value: 'published' },
          { label: 'Draft', value: 'draft' },
          { label: 'Archived', value: 'archived' },
        ]}
        filterLabel="Status"
        bulkActions={bulkActions}
        className="py-2 text-xs [&_input]:h-8 [&_input]:text-xs [&_button]:h-8 [&_button]:text-xs [&_button]:px-2"
      />

      <div className="flex items-center justify-between rounded-xl border border-slate-200/70 bg-white/90 px-2.5 py-1.5 shadow-sm mb-2">
        <div className="text-[11px] font-medium text-[var(--cms-muted-foreground)]">
          Advanced filters
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="h-7 border-slate-200/70 bg-white hover:bg-slate-50 text-[11px] px-2"
            onClick={() => {
              setStatusFilter('all');
              setCategoryFilter('all');
              setSubcategoryFilter('all');
              setDifficultyFilter('all');
              setFeaturedFilter('all');
              setCountryFilter('');
              setRegionFilter('all');
              setMinPriceFilter('');
              setMaxPriceFilter('');
              setMinDurationFilter('');
              setMaxDurationFilter('');
              setSortField('createdAt');
              setSortOrder('desc');
              setSearch('');
            }}
          >
            Clear filters
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="h-7 border-slate-200/70 bg-white hover:bg-slate-50 text-[11px] px-2"
            onClick={() => setShowFilters((prev) => !prev)}
          >
            {showFilters ? 'Hide filters' : 'Show filters'}
            {showFilters ? <ChevronUp className="ml-2 h-3 w-3" /> : <ChevronDown className="ml-2 h-3 w-3" />}
          </Button>
        </div>
      </div>

      {showFilters && (
        <div className="grid grid-cols-1 gap-3 rounded-xl border border-slate-200/70 bg-white/90 p-3 shadow-sm md:grid-cols-2 xl:grid-cols-4 2xl:grid-cols-6 text-[11px] mb-3">
        <div className="space-y-2">
          <span className="text-[11px] font-medium text-[var(--cms-muted-foreground)]">Category</span>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="h-8 text-[11px]">
              <SelectValue placeholder="All categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All categories</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category._id} value={category._id}>
                  {category.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <span className="text-[11px] font-medium text-[var(--cms-muted-foreground)]">Subcategory</span>
          <Select
            value={subcategoryFilter}
            onValueChange={setSubcategoryFilter}
            disabled={categoryFilter === 'all'}
          >
            <SelectTrigger className="h-8 text-[11px]">
              <SelectValue
                placeholder={categoryFilter === 'all' ? 'Select category first' : 'All subcategories'}
              />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All subcategories</SelectItem>
              {subcategories.map((subcategory) => (
                <SelectItem key={subcategory._id} value={subcategory._id}>
                  {subcategory.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <span className="text-[11px] font-medium text-[var(--cms-muted-foreground)]">Difficulty</span>
          <Select value={difficultyFilter} onValueChange={setDifficultyFilter}>
            <SelectTrigger className="h-8 text-[11px]">
              <SelectValue placeholder="All difficulties" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All difficulties</SelectItem>
              <SelectItem value="easy">Easy</SelectItem>
              <SelectItem value="moderate">Moderate</SelectItem>
              <SelectItem value="challenging">Challenging</SelectItem>
              <SelectItem value="expert">Expert</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <span className="text-[11px] font-medium text-[var(--cms-muted-foreground)]">Featured</span>
          <Select value={featuredFilter} onValueChange={setFeaturedFilter}>
            <SelectTrigger className="h-8 text-[11px]">
              <SelectValue placeholder="All trips" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All trips</SelectItem>
              <SelectItem value="featured">Featured only</SelectItem>
              <SelectItem value="not-featured">Not featured</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <span className="text-[11px] font-medium text-[var(--cms-muted-foreground)]">Country</span>
          <Input
            placeholder="Country"
            value={countryFilter}
            onChange={(event) => setCountryFilter(event.target.value)}
            className="h-8 text-[11px] border-slate-200/70 bg-white/80 focus:border-[var(--cms-primary)]"
          />
        </div>

        <div className="space-y-2">
          <span className="text-[11px] font-medium text-[var(--cms-muted-foreground)]">Region</span>
          <Select value={regionFilter} onValueChange={setRegionFilter}>
            <SelectTrigger className="h-8 text-[11px]">
              <SelectValue placeholder="All regions" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All regions</SelectItem>
              {regions.map((region) => (
                <SelectItem key={region._id} value={region._id}>
                  {region.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <span className="text-[11px] font-medium text-[var(--cms-muted-foreground)]">Price min</span>
          <Input
            type="number"
            min="0"
            placeholder="1000"
            value={minPriceFilter}
            onChange={(event) => setMinPriceFilter(event.target.value)}
            className="h-8 text-[11px] border-slate-200/70 bg-white/80 focus:border-[var(--cms-primary)]"
          />
        </div>

        <div className="space-y-2">
          <span className="text-[11px] font-medium text-[var(--cms-muted-foreground)]">Price max</span>
          <Input
            type="number"
            min="0"
            placeholder="3500"
            value={maxPriceFilter}
            onChange={(event) => setMaxPriceFilter(event.target.value)}
            className="h-8 text-[11px] border-slate-200/70 bg-white/80 focus:border-[var(--cms-primary)]"
          />
        </div>

        <div className="space-y-2">
          <span className="text-[11px] font-medium text-[var(--cms-muted-foreground)]">Duration min</span>
          <Input
            type="number"
            min="1"
            placeholder="3"
            value={minDurationFilter}
            onChange={(event) => setMinDurationFilter(event.target.value)}
            className="h-8 text-[11px] border-slate-200/70 bg-white/80 focus:border-[var(--cms-primary)]"
          />
        </div>

        <div className="space-y-2">
          <span className="text-[11px] font-medium text-[var(--cms-muted-foreground)]">Duration max</span>
          <Input
            type="number"
            min="1"
            placeholder="21"
            value={maxDurationFilter}
            onChange={(event) => setMaxDurationFilter(event.target.value)}
            className="h-8 text-[11px] border-slate-200/70 bg-white/80 focus:border-[var(--cms-primary)]"
          />
        </div>

        <div className="space-y-2">
          <span className="text-[11px] font-medium text-[var(--cms-muted-foreground)]">Sort by</span>
          <Select value={sortField} onValueChange={setSortField}>
            <SelectTrigger className="h-8 text-[11px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="createdAt">Created date</SelectItem>
              <SelectItem value="updatedAt">Updated date</SelectItem>
              <SelectItem value="price">Price</SelectItem>
              <SelectItem value="duration">Duration</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <span className="text-[11px] font-medium text-[var(--cms-muted-foreground)]">Order</span>
          <Select value={sortOrder} onValueChange={(value) => setSortOrder(value as 'asc' | 'desc')}>
            <SelectTrigger className="h-8 text-[11px]">
              <SelectValue placeholder="Order" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="desc">Descending</SelectItem>
              <SelectItem value="asc">Ascending</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      )}

      {loading ? (
        <TableSkeleton />
      ) : trips.length === 0 ? (
        <EmptyState
          icon={MapPin}
          title="No trips found"
          description="Get started by creating your first trip"
          action={{
            label: 'Create Trip',
            onClick: () => navigate('/cms/trips/new'),
          }}
        />
      ) : (
        <DataTable
          data={trips}
          columns={columns}
          selectedRows={selectedRows}
          onSelectRow={(id) => {
            setSelectedRows((prev) =>
              prev.includes(id) ? prev.filter((r) => r !== id) : [...prev, id]
            );
          }}
          onSelectAll={(selected) => {
            if (selected) {
              setSelectedRows(trips.map((t) => t._id));
            } else {
              setSelectedRows([]);
            }
          }}
          getRowId={(trip) => trip._id}
          onRowAction={handleRowAction}
          renderRowActions={(trip) => (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => navigate(`/cms/trips/${trip._id}/notes`)}>
                <FileText className="mr-2 h-4 w-4" />
                Trip notes
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => openStatusDialog(trip)}>
                <RefreshCw className="mr-2 h-4 w-4" />
                Update Status
              </DropdownMenuItem>
            </>
          )}
          className="text-xs [&_th]:h-8 [&_th]:px-2 [&_th]:text-[11px] [&_td]:px-2 [&_td]:py-1.5 [&_tr]:leading-tight"
          pagination={
            totalPages > 1
              ? {
                  page,
                  limit: 10,
                  total,
                  totalPages,
                  onPageChange: setPage,
                }
              : undefined
          }
        />
      )}

      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Delete Trip"
        description={`Are you sure you want to delete "${tripToDelete?.title}"? This action cannot be undone.`}
        confirmLabel="Delete"
        variant="destructive"
        loading={isDeleting}
        closeOnConfirm={false}
        onConfirm={handleDelete}
      />
      <ConfirmDialog
        open={archiveDialogOpen}
        onOpenChange={setArchiveDialogOpen}
        title="Archive Trip"
        description={`Are you sure you want to archive "${tripToArchive?.title}"?`}
        confirmLabel="Archive"
        loading={isArchiving}
        closeOnConfirm={false}
        onConfirm={() => tripToArchive && handleArchiveTrip(tripToArchive)}
      />
      <ConfirmDialog
        open={bulkArchiveDialogOpen}
        onOpenChange={setBulkArchiveDialogOpen}
        title="Archive Trips"
        description="Selected trips will be moved to archived status."
        confirmLabel="Archive"
        loading={isBulkUpdating}
        closeOnConfirm={false}
        onConfirm={handleBulkArchive}
      />
      <ConfirmDialog
        open={bulkDeleteDialogOpen}
        onOpenChange={setBulkDeleteDialogOpen}
        title="Delete Trips"
        description="This will permanently delete the selected trips. This action cannot be undone."
        confirmLabel="Delete"
        variant="destructive"
        loading={isBulkUpdating}
        closeOnConfirm={false}
        onConfirm={handleBulkDelete}
      />
      <Dialog open={statusDialogOpen} onOpenChange={setStatusDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Update Trip Status</DialogTitle>
            <DialogDescription>
              Choose a new status for "{statusTrip?.title}".
            </DialogDescription>
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
