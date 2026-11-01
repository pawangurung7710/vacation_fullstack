import type { CSSProperties } from 'react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Save, Send, Archive, Eye, RefreshCw, Shield } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { Button } from '../../components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Switch } from '../../components/ui/switch';
import { Badge } from '../../components/ui/badge';
import { Skeleton } from '../../components/ui/skeleton';
import { blogAdminApi, resolveMediaUrl } from '../../services/api';
import { RichTextEditor } from '../components/RichTextEditor';
import { SequoiaLoader } from '../components/SequoiaLoader';
import { blogFontOptions, defaultBlogFont, getFontStack } from '../../constants/blogFonts';

type BlogStatus = 'draft' | 'published' | 'archived';

interface BlogEditorProps {
  mode: 'create' | 'edit';
  postId?: string;
}

const toSlug = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');

const getStoredUserName = () => {
  const userStr = localStorage.getItem('user');
  if (!userStr) return '';
  try {
    const user = JSON.parse(userStr);
    return user?.name || user?.email || '';
  } catch {
    return '';
  }
};

const resolveContentMedia = (content: string) =>
  content.replace(/<img([^>]*?)src=["']([^"']+)["']/gi, (_match, attrs, src) => {
    const resolved = resolveMediaUrl(src);
    return `<img${attrs}src="${resolved}"`;
  });

const stripFontFamilyStyles = (content: string) =>
  content.replace(/font-family\s*:\s*[^;]+;?/gi, '').trim();

const normalizeContent = (content?: string) => {
  if (!content) return '';
  const trimmed = stripFontFamilyStyles(content);
  const hasHtml = /<\/?[a-z][\s\S]*>/i.test(trimmed);
  if (hasHtml) return trimmed;
  return trimmed
    .split(/\n{2,}/)
    .map((paragraph) => `<p>${paragraph.replace(/\n/g, '<br />')}</p>`)
    .join('');
};

export function BlogEditor({ mode, postId }: BlogEditorProps) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(mode === 'edit');
  const [saving, setSaving] = useState(false);
  const [autoSaving, setAutoSaving] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);
  const [currentId, setCurrentId] = useState(postId);
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    excerpt: '',
    content: '',
    featuredImage: '',
    category: '',
    tags: [] as string[],
    readTime: '',
    authorName: getStoredUserName(),
    status: 'draft' as BlogStatus,
    fontFamily: defaultBlogFont,
    featured: false,
  });

  const lastSavedRef = useRef(JSON.stringify(formData));

  const slugPreview = useMemo(
    () => formData.slug || toSlug(formData.title || 'untitled'),
    [formData.slug, formData.title]
  );

  const publicUrl = useMemo(
    () => `${window.location.origin}/blog/${slugPreview}`,
    [slugPreview]
  );

  type StoryFontStyle = CSSProperties & { '--story-font-stack': string };
  const fontStack = getFontStack(formData.fontFamily);
  const previewFontStyle: StoryFontStyle = {
    fontFamily: fontStack,
    '--story-font-stack': fontStack,
  };

  useEffect(() => {
    if (mode !== 'edit' || !postId) return;
    const load = async () => {
      try {
        setLoading(true);
        const post = await blogAdminApi.getById(postId);
        const normalizedContent = resolveContentMedia(normalizeContent(post.content || ''));
        setFormData({
          title: post.title || '',
          slug: post.slug || '',
          excerpt: post.excerpt || '',
          content: normalizedContent,
          featuredImage: post.featuredImage || '',
          category: post.category || '',
          tags: post.tags || [],
          readTime: post.readTime || '',
          authorName: post.authorName || post.author?.name || post.author?.email || getStoredUserName(),
          status: post.status || 'draft',
          fontFamily: post.fontFamily || defaultBlogFont,
          featured: Boolean(post.featured),
        });
        lastSavedRef.current = JSON.stringify({
          title: post.title || '',
          slug: post.slug || '',
          excerpt: post.excerpt || '',
          content: normalizedContent,
          featuredImage: post.featuredImage || '',
          category: post.category || '',
          tags: post.tags || [],
          readTime: post.readTime || '',
          authorName: post.authorName || post.author?.name || post.author?.email || getStoredUserName(),
          status: post.status || 'draft',
          fontFamily: post.fontFamily || defaultBlogFont,
          featured: Boolean(post.featured),
        });
        setDirty(false);
      } catch (error) {
        toast.error('Failed to load blog post');
        navigate('/cms/blog');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [mode, postId, navigate]);

  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (!dirty) return;
      event.preventDefault();
      event.returnValue = '';
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [dirty]);

  useEffect(() => {
    const serialized = JSON.stringify(formData);
    if (serialized !== lastSavedRef.current) {
      setDirty(true);
    }
  }, [formData]);

  useEffect(() => {
    if (!dirty) return;
    if (formData.status !== 'draft') return;
    if (!formData.title.trim() || !formData.content.trim()) return;
    const timeout = window.setTimeout(async () => {
      if (saving || autoSaving) return;
      try {
        setAutoSaving(true);
        await persistDraft('auto');
      } finally {
        setAutoSaving(false);
      }
    }, 1600);
    return () => window.clearTimeout(timeout);
  }, [dirty, formData, saving, autoSaving]);

  const buildPayload = (statusOverride?: BlogStatus) => ({
    title: formData.title.trim(),
    excerpt: formData.excerpt.trim(),
    content: formData.content,
    featuredImage: formData.featuredImage.trim(),
    category: formData.category.trim(),
    tags: formData.tags,
    readTime: formData.readTime.trim(),
    authorName: formData.authorName.trim(),
    status: statusOverride || formData.status,
    featured: formData.featured,
    fontFamily: formData.fontFamily,
  });

  const persistDraft = async (mode: 'manual' | 'auto') => {
    const payload = buildPayload('draft');

    if (currentId) {
      const updated = await blogAdminApi.update(currentId, payload);
      if (updated?.slug) {
        setFormData((prev) => ({ ...prev, slug: updated.slug }));
      }
    } else {
      const created = await blogAdminApi.create(payload);
      setCurrentId(created._id);
      if (created?.slug) {
        setFormData((prev) => ({ ...prev, slug: created.slug }));
      }
      if (mode === 'manual') {
        navigate(`/cms/blog/${created._id}`);
      }
    }

    setFormData((prev) => ({ ...prev, status: 'draft' }));
    lastSavedRef.current = JSON.stringify({ ...formData, status: 'draft' });
    setDirty(false);
    setLastSavedAt(new Date());
    if (mode === 'manual') {
      toast.success('Draft saved');
    }
  };

  const persistPublish = async () => {
    const payload = buildPayload('published');

    if (currentId) {
      const updated = await blogAdminApi.update(currentId, payload);
      if (updated?.slug) {
        setFormData((prev) => ({ ...prev, slug: updated.slug }));
      }
    } else {
      const created = await blogAdminApi.create(payload);
      setCurrentId(created._id);
      if (created?.slug) {
        setFormData((prev) => ({ ...prev, slug: created.slug }));
      }
      navigate(`/cms/blog/${created._id}`);
    }
    setFormData((prev) => ({ ...prev, status: 'published' }));
    lastSavedRef.current = JSON.stringify({ ...formData, status: 'published' });
    setDirty(false);
    setLastSavedAt(new Date());
    toast.success('Post published');
  };

  const persistUpdate = async () => {
    if (!currentId) return;
    const payload = buildPayload();
    const updated = await blogAdminApi.update(currentId, payload);
    if (updated?.slug) {
      setFormData((prev) => ({ ...prev, slug: updated.slug }));
    }
    lastSavedRef.current = JSON.stringify(formData);
    setDirty(false);
    setLastSavedAt(new Date());
    toast.success('Post updated');
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await persistDraft('manual');
    } catch (error) {
      toast.error('Failed to save draft');
    } finally {
      setSaving(false);
    }
  };

  const handlePublish = async () => {
    try {
      setSaving(true);
      await persistPublish();
    } catch (error) {
      toast.error('Failed to publish post');
    } finally {
      setSaving(false);
    }
  };

  const handleUpdate = async () => {
    try {
      setSaving(true);
      await persistUpdate();
    } catch (error) {
      toast.error('Failed to update post');
    } finally {
      setSaving(false);
    }
  };

  const handleArchive = async () => {
    if (!currentId) {
      toast.error('Save the post before archiving');
      return;
    }
    try {
      setSaving(true);
      await blogAdminApi.updateStatus(currentId, 'archived');
      toast.success('Post archived');
      navigate('/cms/blog');
    } catch (error) {
      toast.error('Failed to archive post');
    } finally {
      setSaving(false);
    }
  };

  const handlePreview = () => {
    const target = document.getElementById('blog-preview-panel');
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      toast.success('Preview updated');
    } else {
      toast.message('Preview is available on the right panel.');
    }
  };

  const addTag = (tag: string) => {
    const clean = tag.trim();
    if (!clean) return;
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.includes(clean) ? prev.tags : [...prev.tags, clean],
    }));
  };

  const removeTag = (tag: string) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((t) => t !== tag),
    }));
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-72 w-full" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-slate-900">Story Editor</h2>
          <div className="mt-1 flex items-center gap-3 text-sm text-slate-500">
            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs uppercase tracking-wide text-slate-600">
              {formData.status}
            </span>
                  <span>Slug: {slugPreview}</span>
            {autoSaving && (
              <span className="inline-flex items-center gap-1 text-xs text-slate-500">
                <RefreshCw className="h-3 w-3 animate-spin" />
                Autosaving
              </span>
            )}
            {lastSavedAt && !autoSaving ? (
              <span className="text-xs text-slate-400">
                Saved {lastSavedAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            ) : null}
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handlePreview}
            disabled={saving}
            className="h-9 px-3 text-xs"
          >
            <Eye className="mr-1.5 h-3.5 w-3.5" />
            Preview
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleArchive}
            disabled={saving}
            className="h-9 px-3 text-xs"
          >
            <Archive className="mr-1.5 h-3.5 w-3.5" />
            Archive
          </Button>
          {currentId && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleUpdate}
              disabled={saving}
              className="h-9 px-3 text-xs"
            >
              {saving ? <SequoiaLoader label="Updating" size="sm" mode="inline" /> : (
                <>
                  <Save className="mr-1.5 h-3.5 w-3.5" />
                  Update
                </>
              )}
            </Button>
          )}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleSave}
            disabled={saving}
            className="h-9 px-3 text-xs"
          >
            {saving ? <SequoiaLoader label="Saving" size="sm" mode="inline" /> : (
              <>
                <Save className="mr-1.5 h-3.5 w-3.5" />
                Save Draft
              </>
            )}
          </Button>
          <Button
            type="button"
            size="sm"
            onClick={handlePublish}
            disabled={saving}
            style={{ backgroundColor: 'var(--cms-primary)', color: 'var(--cms-primary-foreground)' }}
            className="h-9 px-3 text-xs"
          >
            {saving ? <SequoiaLoader label="Publishing" size="sm" mode="inline" /> : (
              <>
                <Send className="mr-1.5 h-3.5 w-3.5" />
                Publish
              </>
            )}
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]">
        <div className="space-y-6">
          <Card className="rounded-2xl border-slate-200/70 bg-white/90 shadow-sm">
            <CardHeader className="border-b border-slate-200/70">
              <CardTitle>Writing Desk</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pt-6">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="A story worth reading"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="excerpt">Excerpt</Label>
                <Textarea
                  id="excerpt"
                  value={formData.excerpt}
                  onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                  rows={3}
                  placeholder="A short introduction to set the tone."
                />
              </div>
              <div className="space-y-2">
                <Label>Story Content</Label>
                <div className="flex flex-wrap items-center gap-3">
                  <span className="text-xs text-slate-500">Choose typeface for the story</span>
                  <Select
                    id="story-font-picker"
                    value={formData.fontFamily}
                    onValueChange={(value) => setFormData((prev) => ({ ...prev, fontFamily: value }))}
                  >
                    <SelectTrigger className="border-slate-200/70 bg-white">
                      <SelectValue placeholder="Font" />
                    </SelectTrigger>
                    <SelectContent>
                    {blogFontOptions.map((option) => (
                      <SelectItem key={`story-font-${option.value}`} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                    </SelectContent>
                  </Select>
                </div>
                <RichTextEditor
                  value={formData.content}
                  onChange={(content) => setFormData({ ...formData, content })}
                  placeholder="Craft the journey. Use headings, quotes, and imagery."
                  className="story-font-stack min-h-[240px]"
                  style={previewFontStyle}
                />
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-2xl border-slate-200/70 bg-white/90 shadow-sm">
            <CardHeader className="border-b border-slate-200/70">
              <CardTitle>Metadata</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 pt-6 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="featuredImage">Featured Image URL</Label>
                <Input
                  id="featuredImage"
                  value={formData.featuredImage}
                  onChange={(e) => setFormData({ ...formData, featuredImage: e.target.value })}
                  placeholder="https://"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Input
                  id="category"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  placeholder="mountain Stories"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="readTime">Read Time</Label>
                <Input
                  id="readTime"
                  value={formData.readTime}
                  onChange={(e) => setFormData({ ...formData, readTime: e.target.value })}
                  placeholder="6 min read"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="authorName">Author</Label>
                <Input
                  id="authorName"
                  value={formData.authorName}
                  onChange={(e) => setFormData({ ...formData, authorName: e.target.value })}
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label>Tags</Label>
                <div className="flex flex-wrap gap-2">
                  {formData.tags.map((tag) => (
                    <Badge
                      key={tag}
                      variant="outline"
                      className="border-slate-200 bg-slate-50 text-slate-600"
                      onClick={() => removeTag(tag)}
                    >
                      {tag}
                    </Badge>
                  ))}
                </div>
                <p className="text-xs text-slate-400">Press Enter to add a tag. Click a tag to remove it.</p>
                <Input
                  placeholder="Press Enter to add tag"
                  onKeyDown={(event) => {
                    if (event.key === 'Enter') {
                      event.preventDefault();
                      const target = event.target as HTMLInputElement;
                      addTag(target.value);
                      target.value = '';
                    }
                  }}
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="font-picker">Font family</Label>
                <Select
                  id="font-picker"
                  value={formData.fontFamily}
                  onValueChange={(value) => setFormData((prev) => ({ ...prev, fontFamily: value }))}
                >
                  <SelectTrigger className="border-slate-200/70 bg-white">
                    <SelectValue placeholder="Choose a font" />
                  </SelectTrigger>
                  <SelectContent>
                    {blogFontOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="rounded-2xl border-slate-200/70 bg-white/95 shadow-sm">
            <CardHeader className="border-b border-slate-200/70">
              <CardTitle>Publishing</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pt-6">
              <div className="space-y-2">
                <Label>Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => setFormData({ ...formData, status: value as BlogStatus })}
                >
                  <SelectTrigger className="border-slate-200/70 bg-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="published">Published</SelectItem>
                    <SelectItem value="archived">Archived</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center justify-between rounded-xl border border-slate-200/70 bg-slate-50/70 px-3 py-2">
                <div>
                  <p className="text-sm font-medium text-slate-700">Featured Story</p>
                  <p className="text-xs text-slate-500">Highlights on public pages.</p>
                </div>
                <Switch
                  checked={formData.featured}
                  onCheckedChange={(checked) => setFormData({ ...formData, featured: checked })}
                />
              </div>
            </CardContent>
          </Card>

          <Card id="blog-preview-panel" className="overflow-hidden rounded-2xl border-slate-200/70 bg-white/95 shadow-sm">
            <CardHeader className="border-b border-slate-200/70">
              <CardTitle>Live Preview</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <section className="relative min-h-[240px] overflow-hidden">
                {formData.featuredImage ? (
                  <div className="absolute inset-0">
                    <img
                      src={resolveMediaUrl(formData.featuredImage)}
                      alt={formData.title || 'Featured'}
                      className="h-full w-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-forest-900)]/85 to-[var(--color-navy-900)]/75" />
                  </div>
                ) : (
                  <div className="absolute inset-0 bg-gradient-to-br from-slate-900 to-slate-700" />
                )}
                <div className="relative z-10 px-5 py-6 text-white story-font-stack" style={previewFontStyle}>
                  <div className="mb-3 flex flex-wrap gap-2">
                    {formData.category ? (
                      <span className="inline-flex items-center rounded-full border border-white/30 bg-white/15 px-3 py-1 text-xs">
                        {formData.category}
                      </span>
                    ) : null}
                    {(formData.tags || []).map((tag) => (
                      <span
                        key={`preview-tag-${tag}`}
                        className={
                          tag.toLowerCase() === 'default'
                            ? 'inline-flex items-center rounded-full border border-emerald-500 bg-emerald-500 px-3 py-1 text-xs text-white'
                            : 'inline-flex items-center rounded-full border border-white/30 bg-white/15 px-3 py-1 text-xs text-white'
                        }
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                  <h3 className="text-xl font-semibold text-white">
                    {formData.title || 'Untitled Story'}
                  </h3>
                  {formData.excerpt ? (
                    <p className="mt-2 text-sm text-white/90">{formData.excerpt}</p>
                  ) : (
                    <p className="mt-2 text-sm text-white/70">Add an excerpt to preview the introduction.</p>
                  )}
                  <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-white/80">
                    <span>{formData.authorName || 'Trekkers Squad Editorial'}</span>
                    <span>•</span>
                    <span>{formData.readTime || '—'}</span>
                  </div>
                </div>
              </section>
              <article className="px-5 py-6 story-font-stack" style={previewFontStyle}>
                <div
                  className="prose prose-sm max-w-none text-slate-700"
                  dangerouslySetInnerHTML={{
                    __html:
                      resolveContentMedia(formData.content) ||
                      '<p>Start writing to see the live preview.</p>',
                  }}
                />
              </article>
              <div className="border-t border-slate-200/70 px-5 py-5">
                <div className="rounded-2xl border-2 border-[var(--color-forest-200)] bg-white/95 p-4 shadow-sm">
                  <div className="flex items-center gap-2 text-[var(--color-forest-700)] text-sm font-semibold">
                    <Shield size={16} className="text-[var(--color-forest-600)]" />
                    Secure Blog QR
                  </div>
                  <div className="mt-4 space-y-4 text-center">
                    <img
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(publicUrl)}`}
                      alt="Public blog QR code"
                      className="h-40 w-40 mx-auto rounded-xl border border-[var(--color-forest-200)] bg-white p-2"
                    />
                    <a
                      href={publicUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block text-sm text-[var(--color-forest-600)] hover:underline break-all"
                    >
                      Open secure blog page
                    </a>
                   
                    <p className="text-xs text-gray-500">
                      Scan this QR code to view the post on your phone.
                    </p>

									  <div className="text-xs text-gray-500 break-all">
										  Public link:{' '}
										  <a
											  href={publicUrl}
											  target="_blank"
											  rel="noopener noreferrer"
											  className="text-[var(--color-forest-600)] hover:underline"
										  >
											  {publicUrl}
										  </a>
									  </div>
                  </div>
                </div>
				
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
