import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DataTable, Column } from '../components/DataTable';
import { TableToolbar } from '../components/TableToolbar';
import { EmptyState } from '../components/EmptyState';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { TableSkeleton } from '../components/TableSkeleton';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { countriesApi } from '../../services/api';
import { Globe, Plus, Trash2, Pencil } from 'lucide-react';
import { toast } from 'sonner';

interface Country {
  _id: string;
  name: string;
  isActive?: boolean;
}

export function TripCountriesPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [countries, setCountries] = useState<Country[]>([]);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [countryToDelete, setCountryToDelete] = useState<Country | null>(null);

  const loadCountries = async (query: string) => {
    setLoading(true);
    try {
      const data = await countriesApi.getAll({ search: query || undefined });
      setCountries(data);
    } catch (error) {
      toast.error('Failed to load countries');
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
    loadCountries(debouncedSearch);
  }, [debouncedSearch]);

  const handleDelete = async () => {
    if (!countryToDelete) return;
    setIsDeleting(true);
    try {
      await countriesApi.delete(countryToDelete._id);
      toast.success('Country deleted');
      setDeleteDialogOpen(false);
      setCountryToDelete(null);
      loadCountries('');
    } catch (error: any) {
      toast.error(error?.message || 'Failed to delete country');
    } finally {
      setIsDeleting(false);
    }
  };

  const columns: Column<Country>[] = [
    {
      id: 'name',
      header: 'Country',
      accessor: (country) => (
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-slate-100 flex items-center justify-center">
            <Globe className="h-5 w-5 text-slate-500" />
          </div>
          <div className="font-medium">{country.name}</div>
        </div>
      ),
    },
    {
      id: 'status',
      header: 'Status',
      accessor: (country) => (
        <Badge variant="outline" className="border-slate-200/70">
          {country.isActive ? 'Active' : 'Hidden'}
        </Badge>
      ),
    },
    {
      id: 'actions',
      header: '',
      accessor: (country) => (
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="border-slate-200/70 bg-white hover:bg-slate-50"
            onClick={() => navigate(`/cms/trips/countries/${country._id}`)}
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="border-slate-200/70 bg-white hover:bg-slate-50"
            onClick={() => {
              setCountryToDelete(country);
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
          onClick={() => navigate('/cms/trips/countries/new')}
          style={{ backgroundColor: 'var(--cms-primary)', color: 'var(--cms-primary-foreground)' }}
          className="border-0"
        >
          <Plus className="mr-2 h-4 w-4" />
          New Country
        </Button>
      </div>

      <TableToolbar searchValue={search} onSearchChange={setSearch} searchPlaceholder="Search countries..." />

      {loading ? (
        <TableSkeleton />
      ) : countries.length === 0 ? (
        <EmptyState
          icon={Globe}
          title="No countries found"
          description="Create your first country"
          action={{ label: 'New Country', onClick: () => navigate('/cms/trips/countries/new') }}
        />
      ) : (
        <DataTable data={countries} columns={columns} getRowId={(country) => country._id} />
      )}

      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Delete Country"
        description={`Are you sure you want to delete "${countryToDelete?.name}"? This action cannot be undone.`}
        confirmLabel="Delete"
        variant="destructive"
        loading={isDeleting}
        closeOnConfirm={false}
        onConfirm={handleDelete}
      />
    </div>
  );
}
