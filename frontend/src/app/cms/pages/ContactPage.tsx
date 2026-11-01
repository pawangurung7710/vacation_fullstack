import { useEffect, useState } from 'react';
import { DataTable, Column } from '../components/DataTable';
import { TableToolbar } from '../components/TableToolbar';
import { StatusBadge } from '../components/StatusBadge';
import { TableSkeleton } from '../components/TableSkeleton';
import { format } from 'date-fns';
import { contactApi } from '../../services/api';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '../../components/ui/dropdown-menu';
import { Button } from '../../components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Textarea } from '../../components/ui/textarea';
import { toast } from 'sonner';
import { Eye, MessageSquare, MoreHorizontal, PencilLine } from 'lucide-react';

export function ContactPage() {
  const [loading, setLoading] = useState(true);
  const [contacts, setContacts] = useState<ContactSubmission[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [selectedContact, setSelectedContact] = useState<ContactSubmission | null>(null);
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [replyDialogOpen, setReplyDialogOpen] = useState(false);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState('new');
  const [replyMessage, setReplyMessage] = useState('');
  const [savingStatus, setSavingStatus] = useState(false);
  const [sendingReply, setSendingReply] = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const result = await contactApi.getAll({
        status: statusFilter !== 'all' ? statusFilter : undefined,
        search,
        page,
        limit: 25,
      });
      setContacts(result.data);
      setLoading(false);
    };
    load();
  }, [page, statusFilter, search]);

  const openStatusDialog = (contact: ContactSubmission) => {
    setSelectedContact(contact);
    setSelectedStatus(contact.status);
    setStatusDialogOpen(true);
  };

  const openReplyDialog = (contact: ContactSubmission) => {
    setSelectedContact(contact);
    setReplyMessage('');
    setReplyDialogOpen(true);
  };

  const setContactStatus = (id: string, status: ContactSubmission['status']) => {
    setContacts((prev) => prev.map((contact) => (contact._id === id ? { ...contact, status } : contact)));
  };

  const openDetailsDialog = (contact: ContactSubmission) => {
    setSelectedContact(contact);
    setDetailsDialogOpen(true);
    if (contact.status === 'new') {
      contactApi
        .update(contact._id, { status: 'read' })
        .then((updated) => {
          setContactStatus(contact._id, updated.status);
          setSelectedContact((prev) => (prev?._id === contact._id ? { ...prev, status: updated.status } : prev));
        })
        .catch(() => {});
    }
  };

  const handleStatusSave = async () => {
    if (!selectedContact) return;
    setSavingStatus(true);
    try {
      const updated = await contactApi.update(selectedContact._id, { status: selectedStatus });
      setContactStatus(selectedContact._id, updated.status);
      toast.success('Status updated.');
      setStatusDialogOpen(false);
    } catch (error) {
      toast.error('Failed to update status.');
    } finally {
      setSavingStatus(false);
    }
  };

  const handleSendReply = async () => {
    if (!selectedContact || !replyMessage.trim()) {
      toast.error('Reply message is required.');
      return;
    }
    setSendingReply(true);
    try {
      const updated = await contactApi.reply(selectedContact._id, replyMessage.trim());
      setContactStatus(selectedContact._id, updated.status);
      toast.success('Reply sent.');
      setReplyDialogOpen(false);
    } catch (error) {
      toast.error('Failed to send reply.');
    } finally {
      setSendingReply(false);
    }
  };

  const columns: Column<ContactSubmission>[] = [
    { id: 'name', header: 'Name', accessor: (c) => <div><div className="font-medium">{c.name}</div><div className="text-sm text-muted-foreground">{c.email}</div></div> },
    { id: 'subject', header: 'Subject', accessor: (c) => c.subject || '—' },
    { id: 'message', header: 'Message', accessor: (c) => <div className="max-w-md truncate">{c.message}</div> },
    { id: 'status', header: 'Status', accessor: (c) => <StatusBadge status={c.status} /> },
    { id: 'date', header: 'Date', accessor: (c) => format(new Date(c.createdAt), 'MMM d, yyyy') },
    {
      id: 'actions',
      header: '',
      accessor: (c) => (
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
            <DropdownMenuItem onClick={() => openReplyDialog(c)} className="gap-2">
              <MessageSquare className="h-4 w-4 text-[var(--cms-primary)]" />
              Reply note
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => openStatusDialog(c)} className="gap-2">
              <PencilLine className="h-4 w-4 text-blue-600" />
              Update status
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => openDetailsDialog(c)} className="gap-2">
              <Eye className="h-4 w-4 text-slate-700" />
              View details
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  return (
    <div>
      <TableToolbar searchValue={search} onSearchChange={setSearch} filterValue={statusFilter} onFilterChange={setStatusFilter} filterOptions={[{ label: 'New', value: 'new' }, { label: 'Read', value: 'read' }, { label: 'Replied', value: 'replied' }]} filterLabel="Status" />
      {loading ? <TableSkeleton /> : <DataTable data={contacts} columns={columns} getRowId={(c) => c._id} />}

      <Dialog open={statusDialogOpen} onOpenChange={setStatusDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update status</DialogTitle>
            <DialogDescription>Set the latest status for this contact submission.</DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <div className="text-xs uppercase tracking-wide text-muted-foreground">Status</div>
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="new">New</SelectItem>
                <SelectItem value="read">Read</SelectItem>
                <SelectItem value="replied">Replied</SelectItem>
                <SelectItem value="archived">Archived</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setStatusDialogOpen(false)} disabled={savingStatus}>
              Cancel
            </Button>
            <Button onClick={handleStatusSave} disabled={savingStatus}>
              {savingStatus ? 'Saving...' : 'Save status'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={replyDialogOpen} onOpenChange={setReplyDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reply note</DialogTitle>
            <DialogDescription>Send a reply to the customer. This will mark the status as replied.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="rounded-lg border border-slate-200/70 bg-slate-50 p-3 text-sm text-slate-700">
              <div className="font-semibold">{selectedContact?.name}</div>
              <div>{selectedContact?.email}</div>
              {selectedContact?.subject && <div className="mt-1">Subject: {selectedContact.subject}</div>}
            </div>
            <Textarea
              value={replyMessage}
              onChange={(event) => setReplyMessage(event.target.value)}
              rows={6}
              placeholder="Write your reply..."
            />
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setReplyDialogOpen(false)} disabled={sendingReply}>
              Cancel
            </Button>
            <Button onClick={handleSendReply} disabled={sendingReply}>
              {sendingReply ? 'Sending...' : 'Send reply'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={detailsDialogOpen} onOpenChange={setDetailsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Contact submission</DialogTitle>
            <DialogDescription>Full details of the message received.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="rounded-lg border border-slate-200/70 bg-slate-50 p-3 text-sm text-slate-700 space-y-1">
              <div className="font-semibold">{selectedContact?.name}</div>
              <div>{selectedContact?.email}</div>
              {selectedContact?.phone && <div>{selectedContact.phone}</div>}
              <div className="text-xs text-slate-500">
                Submitted {selectedContact?.createdAt ? format(new Date(selectedContact.createdAt), 'MMM d, yyyy') : '—'}
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 text-sm">
              <div>
                <div className="text-xs uppercase tracking-wide text-muted-foreground">Status</div>
                <div className="mt-1">
                  {selectedContact?.status ? <StatusBadge status={selectedContact.status} /> : '—'}
                </div>
              </div>
              <div>
                <div className="text-xs uppercase tracking-wide text-muted-foreground">Subject</div>
                <div className="mt-1 text-slate-700">{selectedContact?.subject || '—'}</div>
              </div>
            </div>
            <div>
              <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2">Message</div>
              <div className="rounded-lg border border-slate-200/70 bg-white p-4 text-sm text-slate-700 whitespace-pre-wrap">
                {selectedContact?.message || '—'}
              </div>
            </div>
            {selectedContact?.replyMessage && (
              <div>
                <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2">Reply note</div>
                <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900 whitespace-pre-wrap">
                  {selectedContact.replyMessage}
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setDetailsDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

interface ContactSubmission {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  subject?: string;
  message: string;
  replyMessage?: string;
  status: 'new' | 'read' | 'replied' | 'archived';
  createdAt: string;
}
