import { useEffect, useMemo, useState } from 'react';
import { Plus, Save, Trash2, Sparkles, ChevronDown } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { PageHeader } from '../components/PageHeader';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '../../components/ui/collapsible';
import { faqsApi } from '../../services/api';
import { defaultFaqCategories } from '../../data/faq-defaults';
import type { FAQCategory } from '../../data/faq-defaults';

interface FaqCategoryEditor extends FAQCategory {
  _id?: string;
  clientId: string;
}

const createClientId = () =>
  `faq-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;

const normalizeCategory = (category: any, index: number): FaqCategoryEditor => ({
  _id: category._id,
  clientId: category._id || createClientId(),
  title: category.title || '',
  icon: category.icon || '❓',
  order: category.order ?? index,
  faqs: Array.isArray(category.faqs) ? category.faqs : [],
});

export function FaqsPage() {
  const [categories, setCategories] = useState<FaqCategoryEditor[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [importing, setImporting] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<FaqCategoryEditor | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({});

  const sortedCategories = useMemo(
    () => [...categories].sort((a, b) => (a.order ?? 0) - (b.order ?? 0)),
    [categories]
  );
  const totalFaqs = useMemo(
    () => categories.reduce((sum, category) => sum + category.faqs.length, 0),
    [categories]
  );

  useEffect(() => {
    setExpandedCategories((prev) => {
      const next: Record<string, boolean> = {};
      categories.forEach((category) => {
        next[category.clientId] = prev[category.clientId] ?? false;
      });
      return next;
    });
  }, [categories]);

  const loadCategories = async () => {
    setLoading(true);
    try {
      const data = await faqsApi.getAll();
      setCategories((data || []).map((item: any, index: number) => normalizeCategory(item, index)));
    } catch (error) {
      toast.error('Failed to load FAQ categories');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const updateCategory = (clientId: string, updates: Partial<FaqCategoryEditor>) => {
    setCategories((prev) =>
      prev.map((category) => (category.clientId === clientId ? { ...category, ...updates } : category))
    );
  };

  const updateFaq = (
    clientId: string,
    index: number,
    updates: Partial<{ question: string; answer: string }>
  ) => {
    setCategories((prev) =>
      prev.map((category) => {
        if (category.clientId !== clientId) return category;
        const nextFaqs = [...category.faqs];
        nextFaqs[index] = { ...nextFaqs[index], ...updates };
        return { ...category, faqs: nextFaqs };
      })
    );
  };

  const addFaq = (clientId: string) => {
    setCategories((prev) =>
      prev.map((category) =>
        category.clientId === clientId
          ? { ...category, faqs: [...category.faqs, { question: '', answer: '' }] }
          : category
      )
    );
  };

  const removeFaq = (clientId: string, index: number) => {
    setCategories((prev) =>
      prev.map((category) => {
        if (category.clientId !== clientId) return category;
        return { ...category, faqs: category.faqs.filter((_, idx) => idx !== index) };
      })
    );
  };

  const addCategory = () => {
    setCategories((prev) => [
      ...prev,
      {
        clientId: createClientId(),
        title: '',
        icon: '❓',
        order: prev.length,
        faqs: [],
      },
    ]);
  };

  const saveCategory = async (category: FaqCategoryEditor) => {
    const title = category.title.trim();
    if (!title) {
      toast.error('Category title is required');
      return;
    }

    const cleanedFaqs = category.faqs
      .map((faq) => ({
        question: faq.question?.trim() || '',
        answer: faq.answer?.trim() || '',
      }))
      .filter((faq) => faq.question || faq.answer);

    if (cleanedFaqs.some((faq) => !faq.question || !faq.answer)) {
      toast.error('Each FAQ needs both a question and an answer');
      return;
    }

    const payload = {
      title,
      icon: category.icon?.trim() || '❓',
      order: category.order ?? 0,
      faqs: cleanedFaqs,
    };

    setSavingId(category.clientId);
    try {
      const saved = category._id
        ? await faqsApi.update(category._id, payload)
        : await faqsApi.create(payload);

      toast.success(category._id ? 'FAQ category updated' : 'FAQ category created');

      setCategories((prev) =>
        prev.map((item) =>
          item.clientId === category.clientId
            ? { ...normalizeCategory(saved, payload.order ?? 0), clientId: item.clientId }
            : item
        )
      );
    } catch (error: any) {
      toast.error(error?.message || 'Failed to save FAQ category');
    } finally {
      setSavingId(null);
    }
  };

  const deleteCategory = async () => {
    if (!categoryToDelete) return;
    setIsDeleting(true);

    try {
      if (categoryToDelete._id) {
        await faqsApi.delete(categoryToDelete._id);
      }
      toast.success('FAQ category deleted');
      setCategories((prev) => prev.filter((item) => item.clientId !== categoryToDelete.clientId));
      setDeleteDialogOpen(false);
      setCategoryToDelete(null);
    } catch (error: any) {
      toast.error(error?.message || 'Failed to delete FAQ category');
    } finally {
      setIsDeleting(false);
    }
  };

  const importDefaults = async () => {
    setImporting(true);
    try {
      const created: FaqCategoryEditor[] = [];
      let order = 0;
      for (const category of defaultFaqCategories) {
        const payload = {
          ...category,
          order: category.order ?? order,
        };
        const saved = await faqsApi.create(payload);
        created.push(normalizeCategory(saved, order));
        order += 1;
      }
      setCategories(created);
      toast.success('Default FAQs imported');
    } catch (error: any) {
      toast.error(error?.message || 'Failed to import default FAQs');
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="FAQ"
        description="Curate the categories and questions shown on the public FAQ page."
        action={{ label: 'Add Category', onClick: addCategory, icon: Plus }}
      />

      <Card className="rounded-2xl border-slate-200/70 bg-white/90 shadow-sm">
        <CardContent className="grid gap-4 md:grid-cols-[1fr_1fr_auto]">
          <div className="rounded-2xl border border-slate-200/70 bg-slate-50/80 p-4">
            <p className="text-xs text-muted-foreground uppercase tracking-wide">Categories</p>
            <p className="text-2xl font-semibold text-slate-900">{categories.length}</p>
          </div>
          <div className="rounded-2xl border border-slate-200/70 bg-slate-50/80 p-4">
            <p className="text-xs text-muted-foreground uppercase tracking-wide">Total FAQs</p>
            <p className="text-2xl font-semibold text-slate-900">{totalFaqs}</p>
          </div>
          <div className="flex flex-wrap items-center gap-2 justify-start md:justify-end">
            {categories.length === 0 && !loading && (
              <Button variant="outline" onClick={importDefaults} disabled={importing} className="gap-2">
                <Sparkles className="h-4 w-4" />
                {importing ? 'Importing...' : 'Import Defaults'}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-2xl border-slate-200/70 bg-white/90 shadow-sm">
        <CardHeader>
          <CardTitle>FAQ Categories</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {loading ? (
            <div className="text-sm text-muted-foreground">Loading FAQ categories...</div>
          ) : sortedCategories.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-200/70 bg-slate-50/80 p-8 text-center">
              <p className="text-sm text-muted-foreground">No FAQ categories yet.</p>
              <p className="text-xs text-muted-foreground mt-2">Add a category or import the defaults.</p>
            </div>
          ) : (
            sortedCategories.map((category) => {
              const isOpen = expandedCategories[category.clientId] ?? true;

              return (
                <Collapsible
                  key={category.clientId}
                  open={isOpen}
                  onOpenChange={(open) =>
                    setExpandedCategories((prev) => ({ ...prev, [category.clientId]: open }))
                  }
                >
                  <Card className="rounded-2xl border border-slate-200/70 bg-white">
                    <CardHeader className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between bg-slate-50/70 border-b border-slate-200/70">
                      <div className="flex items-center gap-3">
                        <div className="text-2xl">{category.icon || '❓'}</div>
                        <div>
                          <CardTitle className="text-lg">{category.title || 'Untitled Category'}</CardTitle>
                          <p className="text-xs text-muted-foreground">
                            {category.faqs.length} question{category.faqs.length === 1 ? '' : 's'}
                          </p>
                        </div>
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        <Button
                          size="sm"
                          onClick={() => saveCategory(category)}
                          disabled={savingId === category.clientId}
                          className="gap-2 bg-[var(--color-forest-600)] text-white hover:bg-[var(--color-forest-700)]"
                        >
                          <Save className="h-4 w-4" />
                          {savingId === category.clientId ? 'Saving...' : 'Save'}
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => {
                            setCategoryToDelete(category);
                            setDeleteDialogOpen(true);
                          }}
                          className="gap-2 bg-red-600 text-white hover:bg-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                          Delete
                        </Button>
                        <CollapsibleTrigger asChild>
                          <Button variant="ghost" size="sm" className="gap-2 text-slate-600">
                            {isOpen ? 'Collapse' : 'Expand'}
                            <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                          </Button>
                        </CollapsibleTrigger>
                      </div>
                    </CardHeader>
                    <CollapsibleContent>
                      <CardContent className="space-y-6">
                  <div className="grid gap-4 md:grid-cols-[140px_1fr_140px]">
                    <div className="space-y-2">
                      <Label>Icon</Label>
                      <Input
                        value={category.icon}
                        onChange={(event) =>
                          updateCategory(category.clientId, { icon: event.target.value })
                        }
                        placeholder="❓"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Title</Label>
                      <Input
                        value={category.title}
                        onChange={(event) =>
                          updateCategory(category.clientId, { title: event.target.value })
                        }
                        placeholder="Category title"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Order</Label>
                      <Input
                        type="number"
                        value={category.order ?? 0}
                        onChange={(event) =>
                          updateCategory(category.clientId, { order: Number(event.target.value) })
                        }
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-semibold text-slate-700">Questions</h4>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => addFaq(category.clientId)}
                        className="gap-2"
                      >
                        <Plus className="h-3.5 w-3.5" />
                        Add FAQ
                      </Button>
                    </div>
                    {category.faqs.length === 0 ? (
                      <div className="text-xs text-muted-foreground">No FAQs yet. Add your first question.</div>
                    ) : (
                      <div className="space-y-4">
                        {category.faqs.map((faq, index) => (
                          <div key={`${category.clientId}-${index}`} className="rounded-2xl border border-slate-200/70 p-4">
                            <div className="flex items-center justify-between gap-3 mb-3">
                              <h5 className="text-sm font-semibold text-slate-700">FAQ {index + 1}</h5>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => removeFaq(category.clientId, index)}
                                className="text-slate-500 hover:text-slate-800"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                            <div className="space-y-3">
                              <div className="space-y-2">
                                <Label>Question</Label>
                                <Input
                                  value={faq.question}
                                  onChange={(event) =>
                                    updateFaq(category.clientId, index, { question: event.target.value })
                                  }
                                  placeholder="Enter the question"
                                />
                              </div>
                              <div className="space-y-2">
                                <Label>Answer</Label>
                                <Textarea
                                  value={faq.answer}
                                  onChange={(event) =>
                                    updateFaq(category.clientId, index, { answer: event.target.value })
                                  }
                                  placeholder="Enter the answer"
                                  rows={4}
                                />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                      </CardContent>
                    </CollapsibleContent>
                  </Card>
                </Collapsible>
              );
            })
          )}
        </CardContent>
      </Card>

      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={(open) => {
          setDeleteDialogOpen(open);
          if (!open) {
            setCategoryToDelete(null);
            setIsDeleting(false);
          }
        }}
        title={`Delete ${categoryToDelete?.title || 'this category'}?`}
        description="This will permanently remove the category and all of its FAQs. This action cannot be undone."
        confirmLabel="Delete category"
        cancelLabel="Cancel"
        onConfirm={deleteCategory}
        variant="destructive"
        loading={isDeleting}
        closeOnConfirm={false}
      />
    </div>
  );
}
