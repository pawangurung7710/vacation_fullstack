import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DataTable, Column } from '../components/DataTable';
import { TableToolbar } from '../components/TableToolbar';
import { EmptyState } from '../components/EmptyState';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { TableSkeleton } from '../components/TableSkeleton';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { regionsApi } from '../../services/api';
import { MapPin, Plus, Trash2, Pencil } from 'lucide-react';
import { toast } from 'sonner';

interface Region {
  _id: string;
  name: string;
  isActive?: boolean;
}

export function TripRegionsPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [regions, setRegions] = useState<Region[]>([]);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [regionToDelete, setRegionToDelete] = useState<Region | null>(null);

  const loadRegions = async (query: string) => {
    setLoading(true);
    try {
      const data = await regionsApi.getAll({ search: query || undefined });
      setRegions(data);
    } catch (error) {
      toast.error('Failed to load regions');
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
    loadRegions(debouncedSearch);
  }, [debouncedSearch]);

  const handleDelete = async () => {
    if (!regionToDelete) return;
    setIsDeleting(true);
    try {
      await regionsApi.delete(regionToDelete._id);
      toast.success('Region deleted');
      setDeleteDialogOpen(false);
      setRegionToDelete(null);
      loadRegions('');
    } catch (error: any) {
      toast.error(error?.message || 'Failed to delete region');
    } finally {
      setIsDeleting(false);
    }
  };

  const columns: Column<Region>[] = [
    {
      id: 'name',
      header: 'Region',
      accessor: (region) => (
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-slate-100 flex items-center justify-center">
            <MapPin className="h-5 w-5 text-slate-500" />
          </div>
          <div className="font-medium">{region.name}</div>
        </div>
      ),
    },
    {
      id: 'status',
      header: 'Status',
      accessor: (region) => (
        <Badge variant="outline" className="border-slate-200/70">
          {region.isActive ? 'Active' : 'Hidden'}
        </Badge>
      ),
    },
    {
      id: 'actions',
      header: '',
      accessor: (region) => (
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="border-slate-200/70 bg-white hover:bg-slate-50"
            onClick={() => navigate(`/cms/trips/regions/${region._id}`)}
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="border-slate-200/70 bg-white hover:bg-slate-50"
            onClick={() => {
              setRegionToDelete(region);
              setDeleteDialogOpen(true);
            }}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="px-6 py-4 space-y-4">
      <div className="flex items-center justify-between mb-4">
        <Button
          onClick={() => navigate('/cms/trips/regions/new')}
          style={{ backgroundColor: 'var(--cms-primary)', color: 'var(--cms-primary-foreground)' }}
          className="border-0"
        >
          <Plus className="mr-2 h-4 w-4" />
          New Region
        </Button>
      </div>

      <TableToolbar searchValue={search} onSearchChange={setSearch} searchPlaceholder="Search regions..." />

      {loading ? (
        <TableSkeleton />
      ) : regions.length === 0 ? (
        <EmptyState
          icon={MapPin}
          title="No regions found"
          description="Create your first region"
          action={{ label: 'New Region', onClick: () => navigate('/cms/trips/regions/new') }}
        />
      ) : (
        <DataTable data={regions} columns={columns} getRowId={(region) => region._id} />
      )}

      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Delete Region"
        description={`Are you sure you want to delete "${regionToDelete?.name}"? This action cannot be undone.`}
        confirmLabel="Delete"
        variant="destructive"
        loading={isDeleting}
        closeOnConfirm={false}
        onConfirm={handleDelete}
      />
    </div>
  );
}
