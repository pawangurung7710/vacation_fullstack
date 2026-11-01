import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DataTable, Column } from '../components/DataTable';
import { TableToolbar } from '../components/TableToolbar';
import { EmptyState } from '../components/EmptyState';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { TableSkeleton } from '../components/TableSkeleton';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { CmsBreadcrumbs } from '../layout/Breadcrumbs';
import { categoriesApi } from '../../services/api';
import { FolderTree, Plus, Trash2, Pencil } from 'lucide-react';
import { toast } from 'sonner';

interface Category {
  _id: string;
  label: string;
  slug: string;
  tagline?: string;
  imageUrl?: string;
  order?: number;
  isActive?: boolean;
  parent?: { _id: string; label: string; slug: string } | string | null;
}

export function TripSubcategoriesPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [subcategories, setSubcategories] = useState<Category[]>([]);
  const [parents, setParents] = useState<Category[]>([]);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [parentFilter, setParentFilter] = useState('all');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [subcategoryToDelete, setSubcategoryToDelete] = useState<Category | null>(null);

  const loadParents = async () => {
    try {
      const data = await categoriesApi.getAll({ level: 0 });
      setParents(data);
    } catch (error) {
      toast.error('Failed to load parent categories');
    }
  };

  const loadSubcategories = async (query: string) => {
    setLoading(true);
    try {
      const data = await categoriesApi.getAll({
        level: 1,
        parent: parentFilter !== 'all' ? parentFilter : undefined,
        search: query || undefined,
      });
      setSubcategories(data);
    } catch (error) {
      toast.error('Failed to load subcategories');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadParents();
  }, []);

  useEffect(() => {
    const handle = setTimeout(() => {
      setDebouncedSearch(search);
    }, 350);
    return () => clearTimeout(handle);
  }, [search]);

  useEffect(() => {
    loadSubcategories(debouncedSearch);
  }, [debouncedSearch, parentFilter]);

  const handleDelete = async () => {
    if (!subcategoryToDelete) return;
    setIsDeleting(true);
    try {
      await categoriesApi.delete(subcategoryToDelete._id);
      toast.success('Subcategory deleted');
      setDeleteDialogOpen(false);
      setSubcategoryToDelete(null);
      loadSubcategories();
    } catch (error: any) {
      toast.error(error?.message || 'Failed to delete subcategory');
    } finally {
      setIsDeleting(false);
    }
  };

  const columns: Column<Category>[] = [
    {
      id: 'label',
      header: 'Subcategory',
      accessor: (category) => (
        <div className="flex items-center gap-3">
          {category.imageUrl ? (
            <img
              src={category.imageUrl}
              alt={category.label}
              className="h-10 w-10 rounded-xl object-cover"
            />
          ) : (
            <div className="h-10 w-10 rounded-xl bg-slate-100 flex items-center justify-center">
              <FolderTree className="h-5 w-5 text-slate-500" />
            </div>
          )}
          <div>
            <div className="font-medium">{category.label}</div>
            <div className="text-sm text-muted-foreground">{category.slug}</div>
          </div>
        </div>
      ),
    },
    {
      id: 'parent',
      header: 'Parent',
      accessor: (category) => {
        const parentLabel =
          typeof category.parent === 'object' && category.parent
            ? category.parent.label
            : '—';
        return <span className="text-sm">{parentLabel}</span>;
      },
    },
    {
      id: 'order',
      header: 'Order',
      accessor: (category) => category.order ?? 0,
    },
    {
      id: 'status',
      header: 'Status',
      accessor: (category) => (
        <Badge variant="outline" className="border-slate-200/70">
          {category.isActive ? 'Active' : 'Hidden'}
        </Badge>
      ),
    },
    {
      id: 'actions',
      header: '',
      accessor: (category) => (
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="border-slate-200/70 bg-white hover:bg-slate-50"
            onClick={() => navigate(`/cms/trips/subcategories/${category._id}`)}
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="border-slate-200/70 bg-white hover:bg-slate-50"
            onClick={() => {
              setSubcategoryToDelete(category);
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
      <CmsBreadcrumbs />
      <div className="flex items-center justify-between mb-4">
        <Button
          onClick={() => navigate('/cms/trips/subcategories/new')}
          style={{ backgroundColor: 'var(--cms-primary)', color: 'var(--cms-primary-foreground)' }}
          className="border-0"
        >
          <Plus className="mr-2 h-4 w-4" />
          New Subcategory
        </Button>
      </div>

      <TableToolbar
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search subcategories..."
        filterValue={parentFilter}
        onFilterChange={setParentFilter}
        filterOptions={parents.map((parent) => ({ label: parent.label, value: parent._id }))}
        filterLabel="Parent"
      />

      {loading ? (
        <TableSkeleton />
      ) : subcategories.length === 0 ? (
        <EmptyState
          icon={FolderTree}
          title="No subcategories found"
          description="Create a subcategory linked to a parent category"
          action={{ label: 'New Subcategory', onClick: () => navigate('/cms/trips/subcategories/new') }}
        />
      ) : (
        <DataTable data={subcategories} columns={columns} getRowId={(category) => category._id} />
      )}

      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Delete Subcategory"
        description={`Are you sure you want to delete "${subcategoryToDelete?.label}"? This action cannot be undone.`}
        confirmLabel="Delete"
        variant="destructive"
        loading={isDeleting}
        closeOnConfirm={false}
        onConfirm={handleDelete}
      />
    </div>
  );
}
