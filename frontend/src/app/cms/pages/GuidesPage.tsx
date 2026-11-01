import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DataTable, Column } from '../components/DataTable';
import { Button } from '../../components/ui/button';
import { TableSkeleton } from '../components/TableSkeleton';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { guidesApi, ApiError } from '../../services/api';
import { Plus, MoreHorizontal, PencilLine, Trash2 } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '../../components/ui/dropdown-menu';
import { StatusBadge } from '../components/StatusBadge';
import { toast } from 'sonner';

export function GuidesPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [guides, setGuides] = useState<Guide[]>([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [guideToDelete, setGuideToDelete] = useState<Guide | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const data = await guidesApi.getAll();
        setGuides(data);
      } catch (error) {
        toast.error('Failed to load guides');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const openDeleteDialog = (guide: Guide) => {
    setGuideToDelete(guide);
    setDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!guideToDelete) return;
    setIsDeleting(true);
    try {
      await guidesApi.delete(guideToDelete._id);
      setGuides((prev) => prev.filter((guide) => guide._id !== guideToDelete._id));
      toast.success('Guide deleted');
      setDeleteDialogOpen(false);
      setGuideToDelete(null);
    } catch (error) {
      const message = error instanceof ApiError ? error.message : 'Failed to delete guide';
      toast.error(message);
    } finally {
      setIsDeleting(false);
    }
  };

  const columns: Column<Guide>[] = [
    {
      id: 'name',
      header: 'Name',
      accessor: (g) => (
        <div>
          <div className="font-medium">{g.name}</div>
          <div className="text-sm text-muted-foreground">{g.role || '—'}</div>
        </div>
      ),
    },
    { id: 'experience', header: 'Experience', accessor: (g) => g.experience || '—' },
    { id: 'languages', header: 'Languages', accessor: (g) => g.languages || '—' },
    { id: 'order', header: 'Order', accessor: (g) => g.order },
    { id: 'status', header: 'Status', accessor: (g) => <StatusBadge status={g.isActive ? 'approved' : 'archived'} /> },
    {
      id: 'actions',
      header: '',
      accessor: (g) => (
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
            <DropdownMenuItem onClick={() => navigate(`/cms/guides/${g._id}`)} className="gap-2">
              <PencilLine className="h-4 w-4 text-blue-600" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => openDeleteDialog(g)} className="gap-2" variant="destructive">
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
      <div className="flex items-center justify-end mb-4">
        <Button onClick={() => navigate('/cms/guides/new')} style={{ backgroundColor: 'var(--cms-primary)', color: 'var(--cms-primary-foreground)' }}>
          <Plus className="mr-2 h-4 w-4" />
          Add Guide
        </Button>
      </div>
      {loading ? <TableSkeleton /> : <DataTable data={guides} columns={columns} getRowId={(g) => g._id} />}

      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Delete guide"
        description={`Delete ${guideToDelete?.name || 'this guide'}? This cannot be undone.`}
        confirmLabel="Delete"
        variant="destructive"
        onConfirm={handleDelete}
        loading={isDeleting}
        closeOnConfirm={false}
      />
    </div>
  );
}

interface Guide {
  _id: string;
  name: string;
  role: string;
  experience?: string;
  languages?: string;
  imageUrl?: string;
  quote?: string;
  order: number;
  isActive: boolean;
}
