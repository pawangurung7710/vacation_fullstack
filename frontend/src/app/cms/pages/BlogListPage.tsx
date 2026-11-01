import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { Plus, FileText, Trash2, Star } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Switch } from '../../components/ui/switch';
import { StatusBadge } from '../components/StatusBadge';
import { EmptyState } from '../components/EmptyState';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { TableSkeleton } from '../components/TableSkeleton';
import { blogAdminApi } from '../../services/api';

export function BlogListPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [posts, setPosts] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [featuredFilter, setFeaturedFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [postToDelete, setPostToDelete] = useState<any | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [pendingId, setPendingId] = useState<string | null>(null);

  const loadPosts = async () => {
    setLoading(true);
    try {
      const result = await blogAdminApi.getAll({
        status: statusFilter !== 'all' ? statusFilter : undefined,
        featured:
          featuredFilter === 'all'
            ? undefined
            : featuredFilter === 'featured',
        category: categoryFilter !== 'all' ? categoryFilter : undefined,
        search: search || undefined,
        page,
        limit: 10,
      });
      setPosts(result.data || []);
      const pagination = result.meta?.pagination;
      setTotal(pagination?.total || 0);
      setTotalPages(pagination?.pages || 1);
    } catch (error) {
      toast.error('Failed to load blog posts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPosts();
  }, [page, statusFilter, featuredFilter, categoryFilter, search]);

  useEffect(() => {
    setPage(1);
  }, [statusFilter, featuredFilter, categoryFilter, search]);

  const handleDelete = async () => {
    if (!postToDelete) return;
    try {
      setIsDeleting(true);
      await blogAdminApi.delete(postToDelete._id);
      toast.success('Post archived successfully');
      loadPosts();
      setDeleteDialogOpen(false);
      setPostToDelete(null);
    } catch (error) {
      toast.error('Failed to delete post');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleFeaturedToggle = async (postId: string, nextValue: boolean) => {
    setPendingId(postId);
    const prevPosts = posts;
    setPosts((current) =>
      current.map((post) =>
        post._id === postId ? { ...post, featured: nextValue } : post
      )
    );
    try {
      await blogAdminApi.updateFeatured(postId, nextValue);
      toast.success(nextValue ? 'Marked as featured' : 'Removed from featured');
    } catch (error: any) {
      setPosts(prevPosts);
      toast.error(error?.message || 'Failed to update featured status');
    } finally {
      setPendingId(null);
    }
  };

  const handleStatusChange = async (postId: string, nextStatus: string) => {
    setPendingId(postId);
    const prevPosts = posts;
    setPosts((current) =>
      current.map((post) =>
        post._id === postId ? { ...post, status: nextStatus } : post
      )
    );
    try {
      await blogAdminApi.updateStatus(postId, nextStatus as any);
      toast.success('Status updated');
    } catch (error: any) {
      setPosts(prevPosts);
      toast.error(error?.message || 'Failed to update status');
    } finally {
      setPendingId(null);
    }
  };

  const categories = useMemo(() => {
    const values = new Set(posts.map((post) => post.category).filter(Boolean));
    return Array.from(values);
  }, [posts]);

  return (
    <div style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Inter, sans-serif' }}>
      <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
        <div>
          <h2 className="text-2xl font-semibold text-slate-900">Blog Library</h2>
          <p className="text-sm text-slate-500">Manage editorial stories and featured highlights.</p>
        </div>
        <Button
          onClick={() => navigate('/cms/blog/new')}
          style={{ backgroundColor: 'var(--cms-primary)', color: 'var(--cms-primary-foreground)' }}
          className="border-0"
        >
          <Plus className="mr-2 h-4 w-4" />
          Create Post
        </Button>
      </div>

      <div className="mb-4 grid gap-3 rounded-2xl border border-slate-200/70 bg-white/90 p-4 shadow-sm lg:grid-cols-[2fr_1fr_1fr_1fr]">
        <Input
          placeholder="Search by title or content"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          className="border-slate-200/70 bg-white"
        />
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="border-slate-200/70 bg-white">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="published">Published</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="archived">Archived</SelectItem>
          </SelectContent>
        </Select>
        <Select value={featuredFilter} onValueChange={setFeaturedFilter}>
          <SelectTrigger className="border-slate-200/70 bg-white">
            <SelectValue placeholder="Featured" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All posts</SelectItem>
            <SelectItem value="featured">Featured</SelectItem>
            <SelectItem value="notFeatured">Not featured</SelectItem>
          </SelectContent>
        </Select>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="border-slate-200/70 bg-white">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All categories</SelectItem>
            {categories.map((category) => (
              <SelectItem key={category} value={category}>
                {category}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <TableSkeleton />
      ) : posts.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="No blog posts found"
          description="Get started by creating your first blog post"
          action={{
            label: 'Create Post',
            onClick: () => navigate('/cms/blog/new'),
          }}
        />
      ) : (
        <div className="rounded-2xl border border-slate-200/70 bg-white/95 shadow-sm overflow-hidden">
          <div className="grid grid-cols-[2.2fr_0.9fr_0.8fr_0.7fr_0.8fr_0.9fr_0.6fr_0.9fr] gap-3 border-b border-slate-200/70 bg-slate-50/80 px-4 py-3 text-xs uppercase tracking-wide text-slate-500">
            <div>Title</div>
            <div>Status</div>
            <div>Category</div>
            <div>Featured</div>
            <div>Author</div>
            <div>Published</div>
            <div>Views</div>
            <div>Actions</div>
          </div>
          <div className="divide-y divide-slate-200/70">
            {posts.map((post) => (
              <div
                key={post._id}
                className="grid grid-cols-[2.2fr_0.9fr_0.8fr_0.7fr_0.8fr_0.9fr_0.6fr_0.9fr] gap-3 px-4 py-4 text-sm text-slate-700 hover:bg-slate-50/70"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    {post.featured ? <Star className="h-4 w-4 text-amber-500" /> : null}
                    <span className="font-medium text-slate-900">{post.title}</span>
                  </div>
                  <div className="text-xs text-slate-400">/{post.slug}</div>
                </div>
                <div>
                  <Select
                    value={post.status}
                    onValueChange={(value) => handleStatusChange(post._id, value)}
                  >
                    <SelectTrigger className="h-8 border-slate-200/70 bg-white text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="published">Published</SelectItem>
                      <SelectItem value="archived">Archived</SelectItem>
                    </SelectContent>
                  </Select>
                  <div className="mt-2">
                    <StatusBadge status={post.status} />
                  </div>
                </div>
                <div className="text-xs text-slate-500">{post.category || '—'}</div>
                <div>
                  <Switch
                    checked={Boolean(post.featured)}
                    onCheckedChange={(checked) => handleFeaturedToggle(post._id, checked)}
                    disabled={pendingId === post._id}
                  />
                </div>
                <div className="text-xs text-slate-500">
                  {post.authorName || post.author?.name || post.author?.email || 'Trekkers Squad Team'}
                </div>
                <div className="text-xs text-slate-500">
                  {post.publishedAt ? format(new Date(post.publishedAt), 'MMM d, yyyy') : '—'}
                </div>
                <div className="text-xs text-slate-500">{post.views ?? 0}</div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 border-slate-200/70"
                    onClick={() => navigate(`/cms/blog/${post._id}`)}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 border-slate-200/70 text-red-600 hover:text-red-700"
                    onClick={() => {
                      setPostToDelete(post);
                      setDeleteDialogOpen(true);
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
          {totalPages > 1 ? (
            <div className="flex items-center justify-between border-t border-slate-200/70 bg-white px-4 py-3 text-xs text-slate-500">
              <span>
                Page {page} of {totalPages}
              </span>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 border-slate-200/70"
                  disabled={page === 1}
                  onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 border-slate-200/70"
                  disabled={page === totalPages}
                  onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
                >
                  Next
                </Button>
              </div>
            </div>
          ) : null}
        </div>
      )}

      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Archive Blog Post"
        description={`Are you sure you want to archive "${postToDelete?.title}"? This post will no longer appear publicly.`}
        confirmLabel="Archive"
        variant="destructive"
        loading={isDeleting}
        closeOnConfirm={false}
        onConfirm={handleDelete}
      />
    </div>
  );
}
