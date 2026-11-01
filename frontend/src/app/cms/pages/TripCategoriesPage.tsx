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
import { Folder, Plus, Trash2, Pencil } from 'lucide-react';
import { toast } from 'sonner';

interface Category {
  _id: string;
  label: string;
  slug: string;
  tagline?: string;
  imageUrl?: string;
  order?: number;
  isActive?: boolean;
}

export function TripCategoriesPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<Category[]>([]);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);

  const loadCategories = async (query: string) => {
    setLoading(true);
    try {
      const data = await categoriesApi.getAll({
        level: 0,
        search: query || undefined,
      });
      setCategories(data);
    } catch (error) {
      toast.error('Failed to load categories');
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
    loadCategories(debouncedSearch);
  }, [debouncedSearch]);

  const handleDelete = async () => {
    if (!categoryToDelete) return;
    setIsDeleting(true);
    try {
      await categoriesApi.delete(categoryToDelete._id);
      toast.success('Category deleted');
      setDeleteDialogOpen(false);
      setCategoryToDelete(null);
      loadCategories();
    } catch (error: any) {
      toast.error(error?.message || 'Failed to delete category');
    } finally {
      setIsDeleting(false);
    }
  };

  const columns: Column<Category>[] = [
    {
      id: 'label',
      header: 'Category',
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
              <Folder className="h-5 w-5 text-slate-500" />
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
      id: 'tagline',
      header: 'Tagline',
      accessor: (category) => (
        <span className="text-sm text-muted-foreground">{category.tagline || '—'}</span>
      ),
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
            onClick={() => navigate(`/cms/trips/categories/${category._id}`)}
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="border-slate-200/70 bg-white hover:bg-slate-50"
            onClick={() => {
              setCategoryToDelete(category);
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
          onClick={() => navigate('/cms/trips/categories/new')}
          style={{ backgroundColor: 'var(--cms-primary)', color: 'var(--cms-primary-foreground)' }}
          className="border-0"
        >
          <Plus className="mr-2 h-4 w-4" />
          New Category
        </Button>
      </div>

      <TableToolbar searchValue={search} onSearchChange={setSearch} searchPlaceholder="Search categories..." />

      {loading ? (
        <TableSkeleton />
      ) : categories.length === 0 ? (
        <EmptyState
          icon={Folder}
          title="No categories found"
          description="Create your first top-level category"
          action={{ label: 'New Category', onClick: () => navigate('/cms/trips/categories/new') }}
        />
      ) : (
        <DataTable data={categories} columns={columns} getRowId={(category) => category._id} />
      )}

      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Delete Category"
        description={`Are you sure you want to delete "${categoryToDelete?.label}"? This action cannot be undone.`}
        confirmLabel="Delete"
        variant="destructive"
        loading={isDeleting}
        closeOnConfirm={false}
        onConfirm={handleDelete}
      />
    </div>
  );
}
