import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DataTable, Column } from '../components/DataTable';
import { Button } from '../../components/ui/button';
import { TableSkeleton } from '../components/TableSkeleton';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { teamApi } from '../../services/api';
import { Plus, MoreHorizontal, PencilLine, Trash2 } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '../../components/ui/dropdown-menu';
import { StatusBadge } from '../components/StatusBadge';
import { toast } from 'sonner';

export function TeamPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [memberToDelete, setMemberToDelete] = useState<TeamMember | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const data = await teamApi.getAll();
        setMembers(data);
      } catch (error) {
        toast.error('Failed to load team members');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const openDeleteDialog = (member: TeamMember) => {
    setMemberToDelete(member);
    setDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!memberToDelete) return;
    setIsDeleting(true);
    try {
      await teamApi.delete(memberToDelete._id);
      setMembers((prev) => prev.filter((member) => member._id !== memberToDelete._id));
      toast.success('Team member deleted');
      setDeleteDialogOpen(false);
      setMemberToDelete(null);
    } catch (error) {
      toast.error('Failed to delete team member');
    } finally {
      setIsDeleting(false);
    }
  };

  const columns: Column<TeamMember>[] = [
    {
      id: 'name',
      header: 'Name',
      accessor: (m) => (
        <div>
          <div className="font-medium">{m.name}</div>
          <div className="text-sm text-muted-foreground">{m.email || '—'}</div>
        </div>
      ),
    },
    { id: 'role', header: 'Role', accessor: (m) => m.role },
    { id: 'bio', header: 'Bio', accessor: (m) => <div className="max-w-md truncate">{m.bio || '—'}</div> },
    { id: 'order', header: 'Order', accessor: (m) => m.order },
    { id: 'status', header: 'Status', accessor: (m) => <StatusBadge status={m.isActive ? 'approved' : 'archived'} /> },
    {
      id: 'actions',
      header: '',
      accessor: (m) => (
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
            <DropdownMenuItem onClick={() => navigate(`/cms/team/${m._id}`)} className="gap-2">
              <PencilLine className="h-4 w-4 text-blue-600" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => openDeleteDialog(m)} className="gap-2" variant="destructive">
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
        <Button onClick={() => navigate('/cms/team/new')} style={{ backgroundColor: 'var(--cms-primary)', color: 'var(--cms-primary-foreground)' }}>
          <Plus className="mr-2 h-4 w-4" />
          Add Member
        </Button>
      </div>
      {loading ? <TableSkeleton /> : <DataTable data={members} columns={columns} getRowId={(m) => m._id} />}

      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Delete team member"
        description={`Delete ${memberToDelete?.name || 'this member'}? This cannot be undone.`}
        confirmLabel="Delete"
        variant="destructive"
        onConfirm={handleDelete}
        loading={isDeleting}
        closeOnConfirm={false}
      />
    </div>
  );
}

interface TeamMember {
  _id: string;
  name: string;
  role: string;
  bio?: string;
  image?: string;
  email?: string;
  socialLinks?: {
    linkedin?: string;
    instagram?: string;
    twitter?: string;
    website?: string;
  };
  order: number;
  isActive: boolean;
}
