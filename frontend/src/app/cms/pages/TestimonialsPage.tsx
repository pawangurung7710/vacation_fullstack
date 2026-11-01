import { useEffect, useState } from 'react';
import { DataTable, Column } from '../components/DataTable';
import { TableToolbar } from '../components/TableToolbar';
import { StatusBadge } from '../components/StatusBadge';
import { Button } from '../../components/ui/button';
import { TableSkeleton } from '../components/TableSkeleton';
import { SequoiaLoader } from '../components/SequoiaLoader';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '../../components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Switch } from '../../components/ui/switch';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { testimonialsApi, tripsApi } from '../../services/api';
import { Check, Eye, MoreHorizontal, PencilLine, Plus, Trash2, X } from 'lucide-react';
import { toast } from 'sonner';

export function TestimonialsPage() {
  const [loading, setLoading] = useState(true);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [trips, setTrips] = useState<TripOption[]>([]);
  const [statusFilter, setStatusFilter] = useState('all');
  const [actionState, setActionState] = useState<{ id: string; type: 'approve' | 'reject' } | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
  const [formData, setFormData] = useState<TestimonialForm>(getEmptyForm());
  const [saving, setSaving] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [selectedTestimonial, setSelectedTestimonial] = useState<Testimonial | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [testimonialResult, tripResult] = await Promise.all([
          testimonialsApi.getAll({
            status: statusFilter !== 'all' ? statusFilter : undefined,
            limit: 200,
            page: 1,
          }),
          tripsApi.getAll({ limit: 200 }),
        ]);
        setTestimonials(testimonialResult);
        setTrips(tripResult.map((trip: any) => ({ id: trip._id, title: trip.title })));
      } catch (error) {
        toast.error('Failed to load testimonials.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [statusFilter]);

  const reloadTestimonials = async () => {
    const result = await testimonialsApi.getAll({
      status: statusFilter !== 'all' ? statusFilter : undefined,
      limit: 200,
      page: 1,
    });
    setTestimonials(result);
  };

  const handleApprove = async (id: string) => {
    setActionState({ id, type: 'approve' });
    try {
      await testimonialsApi.update(id, { status: 'approved' });
      toast.success('Testimonial approved');
      await reloadTestimonials();
    } finally {
      setActionState(null);
    }
  };

  const handleReject = async (id: string) => {
    setActionState({ id, type: 'reject' });
    try {
      await testimonialsApi.update(id, { status: 'rejected' });
      toast.success('Testimonial rejected');
      await reloadTestimonials();
    } finally {
      setActionState(null);
    }
  };

  const openCreate = () => {
    setFormMode('create');
    setFormData(getEmptyForm());
    setSelectedTestimonial(null);
    setFormOpen(true);
  };

  const openEdit = (testimonial: Testimonial) => {
    const tripId = typeof testimonial.trip === 'object' ? testimonial.trip?._id : testimonial.trip || '';
    setFormMode('edit');
    setSelectedTestimonial(testimonial);
    setFormData({
      name: testimonial.name || '',
      email: testimonial.email || '',
      location: testimonial.location || '',
      image: testimonial.image || '',
      testimonial: testimonial.testimonial || '',
      rating: testimonial.rating ?? 5,
      trip: tripId || '',
      status: testimonial.status || 'pending',
      featured: testimonial.featured ?? false,
    });
    setFormOpen(true);
  };

  const openDetails = (testimonial: Testimonial) => {
    setSelectedTestimonial(testimonial);
    setDetailsOpen(true);
  };

  const openDelete = (testimonial: Testimonial) => {
    setSelectedTestimonial(testimonial);
    setDeleteDialogOpen(true);
  };

  const handleSave = async () => {
    if (!formData.name.trim() || !formData.testimonial.trim()) {
      toast.error('Name and testimonial are required.');
      return;
    }
    setSaving(true);
    try {
      if (formMode === 'create') {
        const created = await testimonialsApi.create({
          name: formData.name.trim(),
          email: formData.email.trim() || undefined,
          trip: formData.trip || undefined,
          rating: formData.rating,
          testimonial: formData.testimonial.trim(),
          image: formData.image.trim() || undefined,
          location: formData.location.trim() || undefined,
        });
        if (formData.status !== 'pending' || formData.featured) {
          await testimonialsApi.update(created._id, {
            status: formData.status,
            featured: formData.featured,
          });
        }
        toast.success('Testimonial created');
      } else if (selectedTestimonial) {
        await testimonialsApi.update(selectedTestimonial._id, {
          name: formData.name.trim(),
          email: formData.email.trim() || undefined,
          trip: formData.trip || undefined,
          rating: formData.rating,
          testimonial: formData.testimonial.trim(),
          image: formData.image.trim() || undefined,
          location: formData.location.trim() || undefined,
          status: formData.status,
          featured: formData.featured,
        });
        toast.success('Testimonial updated');
      }
      setFormOpen(false);
      await reloadTestimonials();
    } catch (error) {
      toast.error('Failed to save testimonial.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedTestimonial) return;
    setIsDeleting(true);
    try {
      await testimonialsApi.delete(selectedTestimonial._id);
      toast.success('Testimonial deleted');
      setDeleteDialogOpen(false);
      setSelectedTestimonial(null);
      await reloadTestimonials();
    } catch (error) {
      toast.error('Failed to delete testimonial.');
    } finally {
      setIsDeleting(false);
    }
  };

  const columns: Column<Testimonial>[] = [
    {
      id: 'author',
      header: 'Author',
      accessor: (t) => (
        <div>
          <div className="font-medium">{t.name}</div>
          <div className="text-sm text-muted-foreground">{t.email || t.location || '—'}</div>
        </div>
      ),
    },
    { id: 'trip', header: 'Trip', accessor: (t) => (typeof t.trip === 'object' ? t.trip?.title : '—') || '—' },
    { id: 'content', header: 'Content', accessor: (t) => <div className="max-w-md truncate">{t.testimonial}</div> },
    { id: 'rating', header: 'Rating', accessor: (t) => (t.rating ? '⭐'.repeat(t.rating) : '—') },
    { id: 'featured', header: 'Featured', accessor: (t) => (t.featured ? 'Yes' : 'No') },
    { id: 'status', header: 'Status', accessor: (t) => <StatusBadge status={t.status} /> },
    {
      id: 'actions',
      header: '',
      accessor: (t) => (
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
            <DropdownMenuItem onClick={() => openDetails(t)} className="gap-2">
              <Eye className="h-4 w-4 text-slate-700" />
              View details
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => openEdit(t)} className="gap-2">
              <PencilLine className="h-4 w-4 text-blue-600" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => handleApprove(t._id)} className="gap-2">
              <Check className="h-4 w-4 text-emerald-600" />
              Approve
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleReject(t._id)} className="gap-2">
              <X className="h-4 w-4 text-rose-600" />
              Reject
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => openDelete(t)} className="gap-2" variant="destructive">
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
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
        <TableToolbar
          filterValue={statusFilter}
          onFilterChange={setStatusFilter}
          filterOptions={[
            { label: 'Pending', value: 'pending' },
            { label: 'Approved', value: 'approved' },
            { label: 'Rejected', value: 'rejected' },
          ]}
          filterLabel="Status"
        />
        <Button
          onClick={openCreate}
          style={{ backgroundColor: 'var(--cms-primary)', color: 'var(--cms-primary-foreground)' }}
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Testimonial
        </Button>
      </div>
      {loading ? <TableSkeleton /> : <DataTable data={testimonials} columns={columns} getRowId={(t) => t._id} />}

      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{formMode === 'create' ? 'Create testimonial' : 'Edit testimonial'}</DialogTitle>
            <DialogDescription>Manage testimonial details and visibility.</DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Name *</label>
              <Input
                value={formData.name}
                onChange={(event) => setFormData((prev) => ({ ...prev, name: event.target.value }))}
                placeholder="Traveler name"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Email</label>
              <Input
                value={formData.email}
                onChange={(event) => setFormData((prev) => ({ ...prev, email: event.target.value }))}
                placeholder="name@example.com"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Location</label>
              <Input
                value={formData.location}
                onChange={(event) => setFormData((prev) => ({ ...prev, location: event.target.value }))}
                placeholder="New York, USA"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Image URL</label>
              <Input
                value={formData.image}
                onChange={(event) => setFormData((prev) => ({ ...prev, image: event.target.value }))}
                placeholder="https://..."
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Trip</label>
              <Select
                value={formData.trip || 'none'}
                onValueChange={(value) =>
                  setFormData((prev) => ({ ...prev, trip: value === 'none' ? '' : value }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a trip" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No trip</SelectItem>
                  {trips.map((trip) => (
                    <SelectItem key={trip.id} value={trip.id}>
                      {trip.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Rating</label>
              <Input
                type="number"
                min={1}
                max={5}
                value={formData.rating}
                onChange={(event) =>
                  setFormData((prev) => ({ ...prev, rating: Number(event.target.value) || 1 }))
                }
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-medium">Testimonial *</label>
              <Textarea
                rows={5}
                value={formData.testimonial}
                onChange={(event) => setFormData((prev) => ({ ...prev, testimonial: event.target.value }))}
                placeholder="Write the testimonial..."
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Status</label>
              <Select
                value={formData.status}
                onValueChange={(value) =>
                  setFormData((prev) => ({ ...prev, status: value as TestimonialStatus }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-3 pt-6">
              <Switch
                checked={formData.featured}
                onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, featured: checked }))}
              />
              <span className="text-sm">Featured on homepage</span>
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setFormOpen(false)} disabled={saving}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? <SequoiaLoader label="Saving" size="sm" mode="inline" /> : 'Save'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Testimonial details</DialogTitle>
            <DialogDescription>Full testimonial content.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 text-sm">
            <div className="rounded-lg border border-slate-200/70 bg-slate-50 p-3">
              <div className="font-semibold">{selectedTestimonial?.name}</div>
              <div>{selectedTestimonial?.email || '—'}</div>
              <div>{selectedTestimonial?.location || '—'}</div>
              <div className="mt-1 text-xs text-slate-500">
                Status: {selectedTestimonial?.status || '—'} · Featured:{' '}
                {selectedTestimonial?.featured ? 'Yes' : 'No'}
              </div>
            </div>
            <div className="text-slate-700">{selectedTestimonial?.testimonial || '—'}</div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setDetailsOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Delete testimonial"
        description={`Delete ${selectedTestimonial?.name || 'this testimonial'}? This cannot be undone.`}
        confirmLabel="Delete"
        variant="destructive"
        onConfirm={handleDelete}
        loading={isDeleting}
        closeOnConfirm={false}
      />
    </div>
  );
}

type TestimonialStatus = 'pending' | 'approved' | 'rejected';

interface Testimonial {
  _id: string;
  name: string;
  email?: string;
  trip?: { _id: string; title: string; slug?: string } | string;
  rating?: number;
  testimonial: string;
  image?: string;
  location?: string;
  status: TestimonialStatus;
  featured?: boolean;
}

interface TripOption {
  id: string;
  title: string;
}

interface TestimonialForm {
  name: string;
  email: string;
  trip: string;
  rating: number;
  testimonial: string;
  image: string;
  location: string;
  status: TestimonialStatus;
  featured: boolean;
}

function getEmptyForm(): TestimonialForm {
  return {
    name: '',
    email: '',
    trip: '',
    rating: 5,
    testimonial: '',
    image: '',
    location: '',
    status: 'pending',
    featured: false,
  };
}
