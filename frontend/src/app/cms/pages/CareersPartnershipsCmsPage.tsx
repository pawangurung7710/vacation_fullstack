import { useEffect, useMemo, useState } from 'react';
import { ChevronDown, ExternalLink, Plus, RefreshCw, Save, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '../../components/ui/collapsible';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { PageHeader } from '../components/PageHeader';
import { pagesApi } from '../../services/api';
import defaultContent from '../../data/careers-partnerships-page.json';

const PAGE_KEY = 'careers-partnerships';

type IconKey =
  | 'Briefcase'
  | 'Handshake'
  | 'Users'
  | 'Globe'
  | 'Heart'
  | 'Mountain'
  | 'TrendingUp'
  | 'Sparkles'
  | 'Building2';

type JobType = 'Full-time' | 'Part-time' | 'Seasonal' | 'Contract';

type JsonHero = {
  image: { src: string; alt: string };
  overlayClassName: string;
  breadcrumbs: Array<{ label: string; path?: string }>;
  title: string;
  subtitle: string;
};

type JsonBenefit = { icon: IconKey; title: string; description: string };
type JsonJob = {
  id: string;
  title: string;
  department: string;
  location: string;
  type: JobType;
  description: string;
  requirements: string[];
  responsibilities: string[];
  benefits: string[];
};

type JsonOpportunity = {
  id: string;
  icon: IconKey;
  title: string;
  category: string;
  description: string;
  lookingFor: string[];
  benefits: string[];
};

type JsonCtaAction = { icon: IconKey; label: string; href: string };

type CareersPartnershipsPageJson = {
  hero: JsonHero;
  sections: {
    whyJoin: { title: string; subtitle: string; benefits: JsonBenefit[] };
    openPositions: {
      badge: { icon: IconKey; text: string };
      title: string;
      subtitle: string;
      labels: {
        aboutRole: string;
        requirements: string;
        responsibilities: string;
        benefits: string;
        applyCta: string;
        shareCta: string;
      };
      jobs: JsonJob[];
      generalApplication: { title: string; description: string; cta: string };
    };
    partnerships: {
      badge: { icon: IconKey; text: string };
      title: string;
      subtitle: string;
      labels: { description: string; lookingFor: string; benefits: string; cta: string };
      opportunities: JsonOpportunity[];
    };
  };
  cta: {
    backgroundImage: { src: string; alt: string };
    overlayClassName: string;
    title: string;
    description: string;
    actions: JsonCtaAction[];
  };
  mail: {
    careersEmail: string;
    partnershipsEmail: string;
    jobApplicationSubjectPrefix: string;
    generalApplicationHref: string;
    partnershipSubjectPrefix: string;
  };
};

type BenefitEditor = JsonBenefit & { clientId: string };
type JobEditor = JsonJob & { clientId: string };
type OpportunityEditor = JsonOpportunity & { clientId: string };
type CtaActionEditor = JsonCtaAction & { clientId: string };

type CareersPartnershipsEditor = Omit<CareersPartnershipsPageJson, 'sections' | 'cta'> & {
  sections: Omit<CareersPartnershipsPageJson['sections'], 'whyJoin' | 'openPositions' | 'partnerships'> & {
    whyJoin: Omit<CareersPartnershipsPageJson['sections']['whyJoin'], 'benefits'> & { benefits: BenefitEditor[] };
    openPositions: Omit<CareersPartnershipsPageJson['sections']['openPositions'], 'jobs'> & { jobs: JobEditor[] };
    partnerships: Omit<CareersPartnershipsPageJson['sections']['partnerships'], 'opportunities'> & {
      opportunities: OpportunityEditor[];
    };
  };
  cta: Omit<CareersPartnershipsPageJson['cta'], 'actions'> & { actions: CtaActionEditor[] };
};

const ICON_OPTIONS: Array<{ key: IconKey; label: string }> = [
  { key: 'Briefcase', label: 'Briefcase' },
  { key: 'Handshake', label: 'Handshake' },
  { key: 'Users', label: 'Users' },
  { key: 'Globe', label: 'Globe' },
  { key: 'Heart', label: 'Heart' },
  { key: 'Mountain', label: 'Mountain' },
  { key: 'TrendingUp', label: 'Trending Up' },
  { key: 'Sparkles', label: 'Sparkles' },
  { key: 'Building2', label: 'Building' },
];

const JOB_TYPE_OPTIONS: JobType[] = ['Full-time', 'Part-time', 'Seasonal', 'Contract'];

const createClientId = (prefix: string) =>
  `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;

function normalizeJson(candidate: any): CareersPartnershipsPageJson {
  const base = defaultContent as CareersPartnershipsPageJson;
  if (!candidate || typeof candidate !== 'object') return base;

  const merged: CareersPartnershipsPageJson = {
    ...base,
    ...candidate,
    hero: {
      ...base.hero,
      ...(candidate.hero ?? {}),
      image: { ...base.hero.image, ...(candidate.hero?.image ?? {}) },
      breadcrumbs: Array.isArray(candidate.hero?.breadcrumbs) ? candidate.hero.breadcrumbs : base.hero.breadcrumbs,
    },
    sections: {
      ...base.sections,
      ...(candidate.sections ?? {}),
      whyJoin: {
        ...base.sections.whyJoin,
        ...(candidate.sections?.whyJoin ?? {}),
        benefits: Array.isArray(candidate.sections?.whyJoin?.benefits)
          ? candidate.sections.whyJoin.benefits
          : base.sections.whyJoin.benefits,
      },
      openPositions: {
        ...base.sections.openPositions,
        ...(candidate.sections?.openPositions ?? {}),
        badge: { ...base.sections.openPositions.badge, ...(candidate.sections?.openPositions?.badge ?? {}) },
        labels: { ...base.sections.openPositions.labels, ...(candidate.sections?.openPositions?.labels ?? {}) },
        generalApplication: {
          ...base.sections.openPositions.generalApplication,
          ...(candidate.sections?.openPositions?.generalApplication ?? {}),
        },
        jobs: Array.isArray(candidate.sections?.openPositions?.jobs)
          ? candidate.sections.openPositions.jobs
          : base.sections.openPositions.jobs,
      },
      partnerships: {
        ...base.sections.partnerships,
        ...(candidate.sections?.partnerships ?? {}),
        badge: { ...base.sections.partnerships.badge, ...(candidate.sections?.partnerships?.badge ?? {}) },
        labels: { ...base.sections.partnerships.labels, ...(candidate.sections?.partnerships?.labels ?? {}) },
        opportunities: Array.isArray(candidate.sections?.partnerships?.opportunities)
          ? candidate.sections.partnerships.opportunities
          : base.sections.partnerships.opportunities,
      },
    },
    cta: {
      ...base.cta,
      ...(candidate.cta ?? {}),
      backgroundImage: { ...base.cta.backgroundImage, ...(candidate.cta?.backgroundImage ?? {}) },
      actions: Array.isArray(candidate.cta?.actions) ? candidate.cta.actions : base.cta.actions,
    },
    mail: { ...base.mail, ...(candidate.mail ?? {}) },
  };

  return merged;
}

function toEditor(json: CareersPartnershipsPageJson): CareersPartnershipsEditor {
  return {
    ...json,
    sections: {
      ...json.sections,
      whyJoin: {
        ...json.sections.whyJoin,
        benefits: (json.sections.whyJoin.benefits || []).map((b) => ({ ...b, clientId: createClientId('benefit') })),
      },
      openPositions: {
        ...json.sections.openPositions,
        jobs: (json.sections.openPositions.jobs || []).map((j) => ({ ...j, clientId: createClientId('job') })),
      },
      partnerships: {
        ...json.sections.partnerships,
        opportunities: (json.sections.partnerships.opportunities || []).map((o) => ({
          ...o,
          clientId: createClientId('opp'),
        })),
      },
    },
    cta: {
      ...json.cta,
      actions: (json.cta.actions || []).map((a) => ({ ...a, clientId: createClientId('cta') })),
    },
  };
}

function toJson(editor: CareersPartnershipsEditor): CareersPartnershipsPageJson {
  return {
    ...editor,
    sections: {
      ...editor.sections,
      whyJoin: {
        ...editor.sections.whyJoin,
        benefits: editor.sections.whyJoin.benefits.map(({ clientId, ...b }) => b),
      },
      openPositions: {
        ...editor.sections.openPositions,
        jobs: editor.sections.openPositions.jobs.map(({ clientId, ...j }) => j),
      },
      partnerships: {
        ...editor.sections.partnerships,
        opportunities: editor.sections.partnerships.opportunities.map(({ clientId, ...o }) => o),
      },
    },
    cta: {
      ...editor.cta,
      actions: editor.cta.actions.map(({ clientId, ...a }) => a),
    },
  };
}

function safeStringArray(value: unknown) {
  return Array.isArray(value) ? value.map((v) => String(v)) : [];
}

export function CareersPartnershipsCmsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [exists, setExists] = useState(false);
  const [editor, setEditor] = useState<CareersPartnershipsEditor>(() => toEditor(normalizeJson(defaultContent)));
  const [expanded, setExpanded] = useState<Record<string, boolean>>({
    sectionHero: false,
    sectionWhyJoin: false,
    sectionOpenPositions: false,
    sectionPartnerships: false,
    sectionCta: false,
    sectionEmail: false,
  });
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [resetDialogOpen, setResetDialogOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{ type: 'job' | 'opportunity'; clientId: string; title: string } | null>(
    null
  );

  const hasValidationErrors = useMemo(() => {
    if (!editor.hero.title.trim()) return true;
    if (!editor.hero.subtitle.trim()) return true;
    if (!editor.hero.image.src.trim()) return true;
    if (!editor.mail.careersEmail.trim()) return true;
    if (!editor.mail.partnershipsEmail.trim()) return true;
    return false;
  }, [editor]);

  const load = async () => {
    setLoading(true);
    try {
      const page = await pagesApi.getByKey(PAGE_KEY);
      const raw = typeof page?.content === 'string' ? page.content : '';
      let parsed: CareersPartnershipsPageJson;
      try {
        parsed = raw ? normalizeJson(JSON.parse(raw)) : normalizeJson(defaultContent);
      } catch {
        toast.error('Saved content is invalid. Loaded defaults instead.');
        parsed = normalizeJson(defaultContent);
      }
      setEditor(toEditor(parsed));
      setExists(true);
    } catch (error: any) {
      if (error?.status === 404) {
        setEditor(toEditor(normalizeJson(defaultContent)));
        setExists(false);
      } else {
        toast.error(error?.message || 'Failed to load page content');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    setExpanded((prev) => {
      const next: Record<string, boolean> = { ...prev };
      editor.sections.whyJoin.benefits.forEach((b) => {
        next[b.clientId] = next[b.clientId] ?? false;
      });
      editor.sections.openPositions.jobs.forEach((j) => {
        next[j.clientId] = next[j.clientId] ?? false;
      });
      editor.sections.partnerships.opportunities.forEach((o) => {
        next[o.clientId] = next[o.clientId] ?? false;
      });
      editor.cta.actions.forEach((a) => {
        next[a.clientId] = next[a.clientId] ?? false;
      });
      return next;
    });
  }, [editor.sections.whyJoin.benefits, editor.sections.openPositions.jobs, editor.sections.partnerships.opportunities, editor.cta.actions]);

  const resetToDefaults = () => {
    setEditor(toEditor(normalizeJson(defaultContent)));
    toast.message('Reset to defaults');
    setResetDialogOpen(false);
  };

  const save = async () => {
    if (hasValidationErrors) {
      toast.error('Please fill the required fields before saving.');
      return;
    }

    const json = toJson(editor);
    const title = String(json?.hero?.title || 'Careers & Partnerships');
    const heroImage = typeof json?.hero?.image?.src === 'string' ? json.hero.image.src : undefined;
    const content = JSON.stringify(json, null, 2);

    setSaving(true);
    try {
      const payload = { title, heroImage, content };
      if (exists) {
        await pagesApi.update(PAGE_KEY, payload);
      } else {
        await pagesApi.create({ pageKey: PAGE_KEY, ...payload });
        setExists(true);
      }
      toast.success('Saved');
    } catch (error: any) {
      if (error?.status === 404) {
        try {
          await pagesApi.create({ pageKey: PAGE_KEY, title, heroImage, content });
          setExists(true);
          toast.success('Saved');
        } catch (createError: any) {
          toast.error(createError?.message || 'Failed to save');
        }
      } else {
        toast.error(error?.message || 'Failed to save');
      }
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = (target: { type: 'job' | 'opportunity'; clientId: string; title: string }) => {
    setDeleteTarget(target);
    setDeleteDialogOpen(true);
  };

  const deleteConfirmed = () => {
    if (!deleteTarget) return;
    if (deleteTarget.type === 'job') {
      setEditor((prev) => ({
        ...prev,
        sections: {
          ...prev.sections,
          openPositions: {
            ...prev.sections.openPositions,
            jobs: prev.sections.openPositions.jobs.filter((j) => j.clientId !== deleteTarget.clientId),
          },
        },
      }));
    } else {
      setEditor((prev) => ({
        ...prev,
        sections: {
          ...prev.sections,
          partnerships: {
            ...prev.sections.partnerships,
            opportunities: prev.sections.partnerships.opportunities.filter((o) => o.clientId !== deleteTarget.clientId),
          },
        },
      }));
    }
    setDeleteDialogOpen(false);
    setDeleteTarget(null);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Careers & Partnerships Page"
        description="Update the content shown on /about/careers-partnerships."
        action={{ label: saving ? 'Saving…' : 'Save', onClick: save, icon: Save }}
      />

      <div className="flex flex-wrap gap-2 justify-end">
        <Button variant="outline" onClick={load} disabled={loading || saving}>
          Reload
        </Button>
        <Button variant="outline" onClick={() => setResetDialogOpen(true)} disabled={loading || saving}>
          <RefreshCw className="mr-2 h-4 w-4" />
          Reset defaults
        </Button>
        <ConfirmDialog
          open={resetDialogOpen}
          onOpenChange={setResetDialogOpen}
          title="Reset to defaults?"
          description="This will replace all current content with the default Careers & Partnerships page content. You can save afterwards to persist it, or reload to undo. Continue?"
          confirmLabel="Reset"
          cancelLabel="Cancel"
          onConfirm={resetToDefaults}
          variant="destructive"
        />
        <Button variant="outline" asChild>
          <a href="/about/careers-partnerships" target="_blank" rel="noreferrer">
            <ExternalLink className="mr-2 h-4 w-4" />
            View page
          </a>
        </Button>
      </div>

      <Collapsible open={expanded.sectionHero} onOpenChange={(open) => setExpanded((p) => ({ ...p, sectionHero: open }))}>
        <Card className="rounded-2xl border-slate-200/70 bg-white/90 shadow-sm">
          <CollapsibleTrigger asChild>
            <CardHeader className="cursor-pointer">
              <CardTitle className="flex items-center justify-between">
                Hero
                <ChevronDown className={`h-4 w-4 transition-transform ${expanded.sectionHero ? 'rotate-180' : ''}`} />
              </CardTitle>
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
        <CardContent className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label>Title *</Label>
            <Input
              value={editor.hero.title}
              onChange={(e) => setEditor((prev) => ({ ...prev, hero: { ...prev.hero, title: e.target.value } }))}
              disabled={loading || saving}
            />
          </div>
          <div className="space-y-2">
            <Label>Subtitle *</Label>
            <Input
              value={editor.hero.subtitle}
              onChange={(e) => setEditor((prev) => ({ ...prev, hero: { ...prev.hero, subtitle: e.target.value } }))}
              disabled={loading || saving}
            />
          </div>

          <div className="space-y-2">
            <Label>Hero image URL *</Label>
            <Input
              value={editor.hero.image.src}
              onChange={(e) =>
                setEditor((prev) => ({ ...prev, hero: { ...prev.hero, image: { ...prev.hero.image, src: e.target.value } } }))
              }
              disabled={loading || saving}
            />
            <p className="text-xs text-muted-foreground">Paste a full image URL (e.g. Unsplash, CDN, or your uploads).</p>
          </div>

          <div className="space-y-2">
            <Label>Hero image alt text</Label>
            <Input
              value={editor.hero.image.alt}
              onChange={(e) =>
                setEditor((prev) => ({ ...prev, hero: { ...prev.hero, image: { ...prev.hero.image, alt: e.target.value } } }))
              }
              disabled={loading || saving}
            />
          </div>

          <Collapsible className="lg:col-span-2" open={expanded.heroAdvanced} onOpenChange={(open) => setExpanded((p) => ({ ...p, heroAdvanced: open }))}>
            <CollapsibleTrigger asChild>
              <Button variant="outline" className="w-full justify-between">
                Advanced hero settings
                <ChevronDown className={`h-4 w-4 transition-transform ${expanded.heroAdvanced ? 'rotate-180' : ''}`} />
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="mt-4 grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label>Overlay class</Label>
                <Input
                  value={editor.hero.overlayClassName}
                  onChange={(e) => setEditor((prev) => ({ ...prev, hero: { ...prev.hero, overlayClassName: e.target.value } }))}
                  disabled={loading || saving}
                />
              </div>
              <div className="space-y-2">
                <Label>Breadcrumbs (one per line: Label|/path)</Label>
                <Textarea
                  value={editor.hero.breadcrumbs.map((b) => `${b.label}${b.path ? `|${b.path}` : ''}`).join('\n')}
                  onChange={(e) => {
                    const lines = e.target.value.split('\n').map((l) => l.trim()).filter(Boolean);
                    const breadcrumbs = lines.map((line) => {
                      const [label, path] = line.split('|').map((x) => x.trim());
                      return { label: label || '', path: path || undefined };
                    });
                    setEditor((prev) => ({ ...prev, hero: { ...prev.hero, breadcrumbs } }));
                  }}
                  className="min-h-[92px]"
                  disabled={loading || saving}
                />
              </div>
            </CollapsibleContent>
          </Collapsible>
        </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>

      <Collapsible open={expanded.sectionWhyJoin} onOpenChange={(open) => setExpanded((p) => ({ ...p, sectionWhyJoin: open }))}>
        <Card className="rounded-2xl border-slate-200/70 bg-white/90 shadow-sm">
          <CardHeader className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <CollapsibleTrigger asChild>
              <div className="flex items-center gap-2 cursor-pointer">
                <CardTitle>Why Join</CardTitle>
                <ChevronDown className={`h-4 w-4 transition-transform ${expanded.sectionWhyJoin ? 'rotate-180' : ''}`} />
              </div>
            </CollapsibleTrigger>
          <Button
            onClick={(e) => { e.stopPropagation();
              setEditor((prev) => ({
                ...prev,
                sections: {
                  ...prev.sections,
                  whyJoin: {
                    ...prev.sections.whyJoin,
                    benefits: [
                      ...prev.sections.whyJoin.benefits,
                      { clientId: createClientId('benefit'), icon: 'Heart', title: '', description: '' },
                    ],
                  },
                },
              }));
            }}
            style={{ backgroundColor: 'var(--cms-primary)', color: 'var(--cms-primary-foreground)' }}
            disabled={loading || saving}
          >
            <Plus className="mr-2 h-4 w-4" />
            Add benefit
          </Button>
        </CardHeader>
          <CollapsibleContent>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label>Section title</Label>
              <Input
                value={editor.sections.whyJoin.title}
                onChange={(e) =>
                  setEditor((prev) => ({
                    ...prev,
                    sections: { ...prev.sections, whyJoin: { ...prev.sections.whyJoin, title: e.target.value } },
                  }))
                }
                disabled={loading || saving}
              />
            </div>
            <div className="space-y-2">
              <Label>Section subtitle</Label>
              <Input
                value={editor.sections.whyJoin.subtitle}
                onChange={(e) =>
                  setEditor((prev) => ({
                    ...prev,
                    sections: { ...prev.sections, whyJoin: { ...prev.sections.whyJoin, subtitle: e.target.value } },
                  }))
                }
                disabled={loading || saving}
              />
            </div>
          </div>

          <div className="space-y-3">
            {editor.sections.whyJoin.benefits.map((benefit, index) => (
              <Collapsible
                key={benefit.clientId}
                open={expanded[benefit.clientId]}
                onOpenChange={(open) => setExpanded((p) => ({ ...p, [benefit.clientId]: open }))}
                className="rounded-2xl border border-slate-200/70 bg-white"
              >
                <div className="flex items-center justify-between gap-3 p-4">
                  <div className="min-w-0">
                    <div className="font-medium truncate">
                      {benefit.title?.trim() ? benefit.title : `Benefit ${index + 1}`}
                    </div>
                    <div className="text-xs text-muted-foreground truncate">{benefit.description || '—'}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() =>
                        setEditor((prev) => ({
                          ...prev,
                          sections: {
                            ...prev.sections,
                            whyJoin: {
                              ...prev.sections.whyJoin,
                              benefits: prev.sections.whyJoin.benefits.filter((b) => b.clientId !== benefit.clientId),
                            },
                          },
                        }))
                      }
                      disabled={loading || saving}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                    <CollapsibleTrigger asChild>
                      <Button variant="outline" size="sm">
                        Edit
                        <ChevronDown className={`ml-2 h-4 w-4 transition-transform ${expanded[benefit.clientId] ? 'rotate-180' : ''}`} />
                      </Button>
                    </CollapsibleTrigger>
                  </div>
                </div>
                <CollapsibleContent className="border-t border-slate-200/70 p-4 grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label>Icon</Label>
                    <Select
                      value={benefit.icon}
                      onValueChange={(value) =>
                        setEditor((prev) => ({
                          ...prev,
                          sections: {
                            ...prev.sections,
                            whyJoin: {
                              ...prev.sections.whyJoin,
                              benefits: prev.sections.whyJoin.benefits.map((b) =>
                                b.clientId === benefit.clientId ? { ...b, icon: value as IconKey } : b
                              ),
                            },
                          },
                        }))
                      }
                      disabled={loading || saving}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {ICON_OPTIONS.map((opt) => (
                          <SelectItem key={opt.key} value={opt.key}>
                            {opt.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Title</Label>
                    <Input
                      value={benefit.title}
                      onChange={(e) =>
                        setEditor((prev) => ({
                          ...prev,
                          sections: {
                            ...prev.sections,
                            whyJoin: {
                              ...prev.sections.whyJoin,
                              benefits: prev.sections.whyJoin.benefits.map((b) =>
                                b.clientId === benefit.clientId ? { ...b, title: e.target.value } : b
                              ),
                            },
                          },
                        }))
                      }
                      disabled={loading || saving}
                    />
                  </div>
                  <div className="space-y-2 lg:col-span-2">
                    <Label>Description</Label>
                    <Textarea
                      value={benefit.description}
                      onChange={(e) =>
                        setEditor((prev) => ({
                          ...prev,
                          sections: {
                            ...prev.sections,
                            whyJoin: {
                              ...prev.sections.whyJoin,
                              benefits: prev.sections.whyJoin.benefits.map((b) =>
                                b.clientId === benefit.clientId ? { ...b, description: e.target.value } : b
                              ),
                            },
                          },
                        }))
                      }
                      className="min-h-[96px]"
                      disabled={loading || saving}
                    />
                  </div>
                </CollapsibleContent>
              </Collapsible>
            ))}
          </div>
        </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>

      <Collapsible open={expanded.sectionOpenPositions} onOpenChange={(open) => setExpanded((p) => ({ ...p, sectionOpenPositions: open }))}>
        <Card className="rounded-2xl border-slate-200/70 bg-white/90 shadow-sm">
          <CardHeader className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <CollapsibleTrigger asChild>
              <div className="flex items-center gap-2 cursor-pointer">
                <CardTitle>Open Positions</CardTitle>
                <ChevronDown className={`h-4 w-4 transition-transform ${expanded.sectionOpenPositions ? 'rotate-180' : ''}`} />
              </div>
            </CollapsibleTrigger>
          <Button
            onClick={(e) => { e.stopPropagation();
              setEditor((prev) => ({
                ...prev,
                sections: {
                  ...prev.sections,
                  openPositions: {
                    ...prev.sections.openPositions,
                    jobs: [
                      ...prev.sections.openPositions.jobs,
                      {
                        clientId: createClientId('job'),
                        id: String(prev.sections.openPositions.jobs.length + 1),
                        title: '',
                        department: '',
                        location: '',
                        type: 'Full-time',
                        description: '',
                        requirements: [],
                        responsibilities: [],
                        benefits: [],
                      },
                    ],
                  },
                },
              }));
            }}
            style={{ backgroundColor: 'var(--cms-primary)', color: 'var(--cms-primary-foreground)' }}
            disabled={loading || saving}
          >
            <Plus className="mr-2 h-4 w-4" />
            Add job
          </Button>
        </CardHeader>
          <CollapsibleContent>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label>Badge text</Label>
              <Input
                value={editor.sections.openPositions.badge.text}
                onChange={(e) =>
                  setEditor((prev) => ({
                    ...prev,
                    sections: {
                      ...prev.sections,
                      openPositions: {
                        ...prev.sections.openPositions,
                        badge: { ...prev.sections.openPositions.badge, text: e.target.value },
                      },
                    },
                  }))
                }
                disabled={loading || saving}
              />
            </div>
            <div className="space-y-2">
              <Label>Badge icon</Label>
              <Select
                value={editor.sections.openPositions.badge.icon}
                onValueChange={(value) =>
                  setEditor((prev) => ({
                    ...prev,
                    sections: {
                      ...prev.sections,
                      openPositions: {
                        ...prev.sections.openPositions,
                        badge: { ...prev.sections.openPositions.badge, icon: value as IconKey },
                      },
                    },
                  }))
                }
                disabled={loading || saving}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ICON_OPTIONS.map((opt) => (
                    <SelectItem key={opt.key} value={opt.key}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Section title</Label>
              <Input
                value={editor.sections.openPositions.title}
                onChange={(e) =>
                  setEditor((prev) => ({
                    ...prev,
                    sections: { ...prev.sections, openPositions: { ...prev.sections.openPositions, title: e.target.value } },
                  }))
                }
                disabled={loading || saving}
              />
            </div>
            <div className="space-y-2">
              <Label>Section subtitle</Label>
              <Input
                value={editor.sections.openPositions.subtitle}
                onChange={(e) =>
                  setEditor((prev) => ({
                    ...prev,
                    sections: { ...prev.sections, openPositions: { ...prev.sections.openPositions, subtitle: e.target.value } },
                  }))
                }
                disabled={loading || saving}
              />
            </div>
          </div>

          <div className="space-y-3">
            {editor.sections.openPositions.jobs.map((job, index) => (
              <Collapsible
                key={job.clientId}
                open={expanded[job.clientId]}
                onOpenChange={(open) => setExpanded((p) => ({ ...p, [job.clientId]: open }))}
                className="rounded-2xl border border-slate-200/70 bg-white"
              >
                <div className="flex items-center justify-between gap-3 p-4">
                  <div className="min-w-0">
                    <div className="font-medium truncate">{job.title?.trim() ? job.title : `Job ${index + 1}`}</div>
                    <div className="text-xs text-muted-foreground truncate">
                      {job.department || '—'} • {job.location || '—'} • {job.type}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => confirmDelete({ type: 'job', clientId: job.clientId, title: job.title || `Job ${index + 1}` })}
                      disabled={loading || saving}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                    <CollapsibleTrigger asChild>
                      <Button variant="outline" size="sm">
                        Edit
                        <ChevronDown className={`ml-2 h-4 w-4 transition-transform ${expanded[job.clientId] ? 'rotate-180' : ''}`} />
                      </Button>
                    </CollapsibleTrigger>
                  </div>
                </div>
                <CollapsibleContent className="border-t border-slate-200/70 p-4 space-y-6">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label>Title</Label>
                      <Input
                        value={job.title}
                        onChange={(e) =>
                          setEditor((prev) => ({
                            ...prev,
                            sections: {
                              ...prev.sections,
                              openPositions: {
                                ...prev.sections.openPositions,
                                jobs: prev.sections.openPositions.jobs.map((j) =>
                                  j.clientId === job.clientId ? { ...j, title: e.target.value } : j
                                ),
                              },
                            },
                          }))
                        }
                        disabled={loading || saving}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Type</Label>
                      <Select
                        value={job.type}
                        onValueChange={(value) =>
                          setEditor((prev) => ({
                            ...prev,
                            sections: {
                              ...prev.sections,
                              openPositions: {
                                ...prev.sections.openPositions,
                                jobs: prev.sections.openPositions.jobs.map((j) =>
                                  j.clientId === job.clientId ? { ...j, type: value as JobType } : j
                                ),
                              },
                            },
                          }))
                        }
                        disabled={loading || saving}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {JOB_TYPE_OPTIONS.map((opt) => (
                            <SelectItem key={opt} value={opt}>
                              {opt}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Department</Label>
                      <Input
                        value={job.department}
                        onChange={(e) =>
                          setEditor((prev) => ({
                            ...prev,
                            sections: {
                              ...prev.sections,
                              openPositions: {
                                ...prev.sections.openPositions,
                                jobs: prev.sections.openPositions.jobs.map((j) =>
                                  j.clientId === job.clientId ? { ...j, department: e.target.value } : j
                                ),
                              },
                            },
                          }))
                        }
                        disabled={loading || saving}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Location</Label>
                      <Input
                        value={job.location}
                        onChange={(e) =>
                          setEditor((prev) => ({
                            ...prev,
                            sections: {
                              ...prev.sections,
                              openPositions: {
                                ...prev.sections.openPositions,
                                jobs: prev.sections.openPositions.jobs.map((j) =>
                                  j.clientId === job.clientId ? { ...j, location: e.target.value } : j
                                ),
                              },
                            },
                          }))
                        }
                        disabled={loading || saving}
                      />
                    </div>
                    <div className="space-y-2 lg:col-span-2">
                      <Label>Description</Label>
                      <Textarea
                        value={job.description}
                        onChange={(e) =>
                          setEditor((prev) => ({
                            ...prev,
                            sections: {
                              ...prev.sections,
                              openPositions: {
                                ...prev.sections.openPositions,
                                jobs: prev.sections.openPositions.jobs.map((j) =>
                                  j.clientId === job.clientId ? { ...j, description: e.target.value } : j
                                ),
                              },
                            },
                          }))
                        }
                        className="min-h-[120px]"
                        disabled={loading || saving}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {([
                      { key: 'requirements', label: 'Requirements' },
                      { key: 'responsibilities', label: 'Responsibilities' },
                      { key: 'benefits', label: 'Benefits' },
                    ] as const).map((list) => (
                      <div key={list.key} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label>{list.label}</Label>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              setEditor((prev) => ({
                                ...prev,
                                sections: {
                                  ...prev.sections,
                                  openPositions: {
                                    ...prev.sections.openPositions,
                                    jobs: prev.sections.openPositions.jobs.map((j) => {
                                      if (j.clientId !== job.clientId) return j;
                                      return { ...j, [list.key]: [...safeStringArray(j[list.key]), ''] } as JobEditor;
                                    }),
                                  },
                                },
                              }))
                            }
                            disabled={loading || saving}
                          >
                            <Plus className="mr-1 h-3.5 w-3.5" />
                            Add
                          </Button>
                        </div>
                        <div className="space-y-2">
                          {safeStringArray(job[list.key]).map((value, idx) => (
                            <div key={idx} className="flex items-start gap-2">
                              <Input
                                value={value}
                                onChange={(e) =>
                                  setEditor((prev) => ({
                                    ...prev,
                                    sections: {
                                      ...prev.sections,
                                      openPositions: {
                                        ...prev.sections.openPositions,
                                        jobs: prev.sections.openPositions.jobs.map((j) => {
                                          if (j.clientId !== job.clientId) return j;
                                          const next = safeStringArray(j[list.key]);
                                          next[idx] = e.target.value;
                                          return { ...j, [list.key]: next } as JobEditor;
                                        }),
                                      },
                                    },
                                  }))
                                }
                                disabled={loading || saving}
                              />
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() =>
                                  setEditor((prev) => ({
                                    ...prev,
                                    sections: {
                                      ...prev.sections,
                                      openPositions: {
                                        ...prev.sections.openPositions,
                                        jobs: prev.sections.openPositions.jobs.map((j) => {
                                          if (j.clientId !== job.clientId) return j;
                                          const next = safeStringArray(j[list.key]).filter((_, i) => i !== idx);
                                          return { ...j, [list.key]: next } as JobEditor;
                                        }),
                                      },
                                    },
                                  }))
                                }
                                disabled={loading || saving}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </CollapsibleContent>
              </Collapsible>
            ))}
          </div>

          <div className="rounded-2xl border border-slate-200/70 bg-slate-50/60 p-4 sm:p-6">
            <div className="font-semibold mb-1">General application box</div>
            <div className="text-sm text-muted-foreground mb-4">Shown below the jobs list.</div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label>Title</Label>
                <Input
                  value={editor.sections.openPositions.generalApplication.title}
                  onChange={(e) =>
                    setEditor((prev) => ({
                      ...prev,
                      sections: {
                        ...prev.sections,
                        openPositions: {
                          ...prev.sections.openPositions,
                          generalApplication: { ...prev.sections.openPositions.generalApplication, title: e.target.value },
                        },
                      },
                    }))
                  }
                  disabled={loading || saving}
                />
              </div>
              <div className="space-y-2">
                <Label>Button label</Label>
                <Input
                  value={editor.sections.openPositions.generalApplication.cta}
                  onChange={(e) =>
                    setEditor((prev) => ({
                      ...prev,
                      sections: {
                        ...prev.sections,
                        openPositions: {
                          ...prev.sections.openPositions,
                          generalApplication: { ...prev.sections.openPositions.generalApplication, cta: e.target.value },
                        },
                      },
                    }))
                  }
                  disabled={loading || saving}
                />
              </div>
              <div className="space-y-2 lg:col-span-2">
                <Label>Description</Label>
                <Textarea
                  value={editor.sections.openPositions.generalApplication.description}
                  onChange={(e) =>
                    setEditor((prev) => ({
                      ...prev,
                      sections: {
                        ...prev.sections,
                        openPositions: {
                          ...prev.sections.openPositions,
                          generalApplication: {
                            ...prev.sections.openPositions.generalApplication,
                            description: e.target.value,
                          },
                        },
                      },
                    }))
                  }
                  className="min-h-[120px]"
                  disabled={loading || saving}
                />
              </div>
            </div>
          </div>

          <Collapsible open={expanded.openPositionsAdvanced} onOpenChange={(open) => setExpanded((p) => ({ ...p, openPositionsAdvanced: open }))}>
            <CollapsibleTrigger asChild>
              <Button variant="outline" className="w-full justify-between">
                Advanced labels
                <ChevronDown className={`h-4 w-4 transition-transform ${expanded.openPositionsAdvanced ? 'rotate-180' : ''}`} />
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="mt-4 grid grid-cols-1 lg:grid-cols-2 gap-6">
              {(
                [
                  ['aboutRole', 'About label'],
                  ['requirements', 'Requirements label'],
                  ['responsibilities', 'Responsibilities label'],
                  ['benefits', 'Benefits label'],
                  ['applyCta', 'Apply button text'],
                  ['shareCta', 'Share button text'],
                ] as const
              ).map(([key, label]) => (
                <div key={key} className="space-y-2">
                  <Label>{label}</Label>
                  <Input
                    value={editor.sections.openPositions.labels[key]}
                    onChange={(e) =>
                      setEditor((prev) => ({
                        ...prev,
                        sections: {
                          ...prev.sections,
                          openPositions: {
                            ...prev.sections.openPositions,
                            labels: { ...prev.sections.openPositions.labels, [key]: e.target.value },
                          },
                        },
                      }))
                    }
                    disabled={loading || saving}
                  />
                </div>
              ))}
            </CollapsibleContent>
          </Collapsible>
        </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>

      <Card className="rounded-2xl border-slate-200/70 bg-white/90 shadow-sm">
        <CardHeader className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <CardTitle>Partnership Opportunities</CardTitle>
          <Button
            onClick={() =>
              setEditor((prev) => ({
                ...prev,
                sections: {
                  ...prev.sections,
                  partnerships: {
                    ...prev.sections.partnerships,
                    opportunities: [
                      ...prev.sections.partnerships.opportunities,
                      {
                        clientId: createClientId('opp'),
                        id: String(prev.sections.partnerships.opportunities.length + 1),
                        icon: 'Handshake',
                        title: '',
                        category: '',
                        description: '',
                        lookingFor: [],
                        benefits: [],
                      },
                    ],
                  },
                },
              }))
            }
            style={{ backgroundColor: 'var(--cms-primary)', color: 'var(--cms-primary-foreground)' }}
            disabled={loading || saving}
          >
            <Plus className="mr-2 h-4 w-4" />
            Add opportunity
          </Button>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label>Badge text</Label>
              <Input
                value={editor.sections.partnerships.badge.text}
                onChange={(e) =>
                  setEditor((prev) => ({
                    ...prev,
                    sections: {
                      ...prev.sections,
                      partnerships: {
                        ...prev.sections.partnerships,
                        badge: { ...prev.sections.partnerships.badge, text: e.target.value },
                      },
                    },
                  }))
                }
                disabled={loading || saving}
              />
            </div>
            <div className="space-y-2">
              <Label>Badge icon</Label>
              <Select
                value={editor.sections.partnerships.badge.icon}
                onValueChange={(value) =>
                  setEditor((prev) => ({
                    ...prev,
                    sections: {
                      ...prev.sections,
                      partnerships: {
                        ...prev.sections.partnerships,
                        badge: { ...prev.sections.partnerships.badge, icon: value as IconKey },
                      },
                    },
                  }))
                }
                disabled={loading || saving}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ICON_OPTIONS.map((opt) => (
                    <SelectItem key={opt.key} value={opt.key}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Section title</Label>
              <Input
                value={editor.sections.partnerships.title}
                onChange={(e) =>
                  setEditor((prev) => ({
                    ...prev,
                    sections: { ...prev.sections, partnerships: { ...prev.sections.partnerships, title: e.target.value } },
                  }))
                }
                disabled={loading || saving}
              />
            </div>
            <div className="space-y-2">
              <Label>Section subtitle</Label>
              <Input
                value={editor.sections.partnerships.subtitle}
                onChange={(e) =>
                  setEditor((prev) => ({
                    ...prev,
                    sections: { ...prev.sections, partnerships: { ...prev.sections.partnerships, subtitle: e.target.value } },
                  }))
                }
                disabled={loading || saving}
              />
            </div>
          </div>

          <div className="space-y-3">
            {editor.sections.partnerships.opportunities.map((opp, index) => (
              <Collapsible
                key={opp.clientId}
                open={expanded[opp.clientId]}
                onOpenChange={(open) => setExpanded((p) => ({ ...p, [opp.clientId]: open }))}
                className="rounded-2xl border border-slate-200/70 bg-white"
              >
                <div className="flex items-center justify-between gap-3 p-4">
                  <div className="min-w-0">
                    <div className="font-medium truncate">{opp.title?.trim() ? opp.title : `Opportunity ${index + 1}`}</div>
                    <div className="text-xs text-muted-foreground truncate">{opp.category || '—'}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() =>
                        confirmDelete({
                          type: 'opportunity',
                          clientId: opp.clientId,
                          title: opp.title || `Opportunity ${index + 1}`,
                        })
                      }
                      disabled={loading || saving}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                    <CollapsibleTrigger asChild>
                      <Button variant="outline" size="sm">
                        Edit
                        <ChevronDown className={`ml-2 h-4 w-4 transition-transform ${expanded[opp.clientId] ? 'rotate-180' : ''}`} />
                      </Button>
                    </CollapsibleTrigger>
                  </div>
                </div>
                <CollapsibleContent className="border-t border-slate-200/70 p-4 space-y-6">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label>Icon</Label>
                      <Select
                        value={opp.icon}
                        onValueChange={(value) =>
                          setEditor((prev) => ({
                            ...prev,
                            sections: {
                              ...prev.sections,
                              partnerships: {
                                ...prev.sections.partnerships,
                                opportunities: prev.sections.partnerships.opportunities.map((o) =>
                                  o.clientId === opp.clientId ? { ...o, icon: value as IconKey } : o
                                ),
                              },
                            },
                          }))
                        }
                        disabled={loading || saving}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {ICON_OPTIONS.map((opt) => (
                            <SelectItem key={opt.key} value={opt.key}>
                              {opt.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Title</Label>
                      <Input
                        value={opp.title}
                        onChange={(e) =>
                          setEditor((prev) => ({
                            ...prev,
                            sections: {
                              ...prev.sections,
                              partnerships: {
                                ...prev.sections.partnerships,
                                opportunities: prev.sections.partnerships.opportunities.map((o) =>
                                  o.clientId === opp.clientId ? { ...o, title: e.target.value } : o
                                ),
                              },
                            },
                          }))
                        }
                        disabled={loading || saving}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Category</Label>
                      <Input
                        value={opp.category}
                        onChange={(e) =>
                          setEditor((prev) => ({
                            ...prev,
                            sections: {
                              ...prev.sections,
                              partnerships: {
                                ...prev.sections.partnerships,
                                opportunities: prev.sections.partnerships.opportunities.map((o) =>
                                  o.clientId === opp.clientId ? { ...o, category: e.target.value } : o
                                ),
                              },
                            },
                          }))
                        }
                        disabled={loading || saving}
                      />
                    </div>
                    <div className="space-y-2 lg:col-span-2">
                      <Label>Description</Label>
                      <Textarea
                        value={opp.description}
                        onChange={(e) =>
                          setEditor((prev) => ({
                            ...prev,
                            sections: {
                              ...prev.sections,
                              partnerships: {
                                ...prev.sections.partnerships,
                                opportunities: prev.sections.partnerships.opportunities.map((o) =>
                                  o.clientId === opp.clientId ? { ...o, description: e.target.value } : o
                                ),
                              },
                            },
                          }))
                        }
                        className="min-h-[120px]"
                        disabled={loading || saving}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {([
                      { key: 'lookingFor', label: "We're Looking For" },
                      { key: 'benefits', label: 'Benefits' },
                    ] as const).map((list) => (
                      <div key={list.key} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label>{list.label}</Label>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              setEditor((prev) => ({
                                ...prev,
                                sections: {
                                  ...prev.sections,
                                  partnerships: {
                                    ...prev.sections.partnerships,
                                    opportunities: prev.sections.partnerships.opportunities.map((o) => {
                                      if (o.clientId !== opp.clientId) return o;
                                      return { ...o, [list.key]: [...safeStringArray(o[list.key]), ''] } as OpportunityEditor;
                                    }),
                                  },
                                },
                              }))
                            }
                            disabled={loading || saving}
                          >
                            <Plus className="mr-1 h-3.5 w-3.5" />
                            Add
                          </Button>
                        </div>
                        <div className="space-y-2">
                          {safeStringArray(opp[list.key]).map((value, idx) => (
                            <div key={idx} className="flex items-start gap-2">
                              <Input
                                value={value}
                                onChange={(e) =>
                                  setEditor((prev) => ({
                                    ...prev,
                                    sections: {
                                      ...prev.sections,
                                      partnerships: {
                                        ...prev.sections.partnerships,
                                        opportunities: prev.sections.partnerships.opportunities.map((o) => {
                                          if (o.clientId !== opp.clientId) return o;
                                          const next = safeStringArray(o[list.key]);
                                          next[idx] = e.target.value;
                                          return { ...o, [list.key]: next } as OpportunityEditor;
                                        }),
                                      },
                                    },
                                  }))
                                }
                                disabled={loading || saving}
                              />
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() =>
                                  setEditor((prev) => ({
                                    ...prev,
                                    sections: {
                                      ...prev.sections,
                                      partnerships: {
                                        ...prev.sections.partnerships,
                                        opportunities: prev.sections.partnerships.opportunities.map((o) => {
                                          if (o.clientId !== opp.clientId) return o;
                                          const next = safeStringArray(o[list.key]).filter((_, i) => i !== idx);
                                          return { ...o, [list.key]: next } as OpportunityEditor;
                                        }),
                                      },
                                    },
                                  }))
                                }
                                disabled={loading || saving}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </CollapsibleContent>
              </Collapsible>
            ))}
          </div>

          <Collapsible open={expanded.partnershipsAdvanced} onOpenChange={(open) => setExpanded((p) => ({ ...p, partnershipsAdvanced: open }))}>
            <CollapsibleTrigger asChild>
              <Button variant="outline" className="w-full justify-between">
                Advanced labels
                <ChevronDown className={`h-4 w-4 transition-transform ${expanded.partnershipsAdvanced ? 'rotate-180' : ''}`} />
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="mt-4 grid grid-cols-1 lg:grid-cols-2 gap-6">
              {(
                [
                  ['description', 'Description label'],
                  ['lookingFor', 'Looking for label'],
                  ['benefits', 'Benefits label'],
                  ['cta', 'CTA button text'],
                ] as const
              ).map(([key, label]) => (
                <div key={key} className="space-y-2">
                  <Label>{label}</Label>
                  <Input
                    value={editor.sections.partnerships.labels[key]}
                    onChange={(e) =>
                      setEditor((prev) => ({
                        ...prev,
                        sections: {
                          ...prev.sections,
                          partnerships: {
                            ...prev.sections.partnerships,
                            labels: { ...prev.sections.partnerships.labels, [key]: e.target.value },
                          },
                        },
                      }))
                    }
                    disabled={loading || saving}
                  />
                </div>
              ))}
            </CollapsibleContent>
          </Collapsible>
        </CardContent>
      </Card>

      <Card className="rounded-2xl border-slate-200/70 bg-white/90 shadow-sm">
        <CardHeader className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <CardTitle>CTA (Bottom section)</CardTitle>
          <Button
            onClick={() =>
              setEditor((prev) => ({
                ...prev,
                cta: {
                  ...prev.cta,
                  actions: [...prev.cta.actions, { clientId: createClientId('cta'), icon: 'Briefcase', label: '', href: '' }],
                },
              }))
            }
            style={{ backgroundColor: 'var(--cms-primary)', color: 'var(--cms-primary-foreground)' }}
            disabled={loading || saving}
          >
            <Plus className="mr-2 h-4 w-4" />
            Add button
          </Button>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label>Background image URL</Label>
              <Input
                value={editor.cta.backgroundImage.src}
                onChange={(e) =>
                  setEditor((prev) => ({ ...prev, cta: { ...prev.cta, backgroundImage: { ...prev.cta.backgroundImage, src: e.target.value } } }))
                }
                disabled={loading || saving}
              />
            </div>
            <div className="space-y-2">
              <Label>Background image alt</Label>
              <Input
                value={editor.cta.backgroundImage.alt}
                onChange={(e) =>
                  setEditor((prev) => ({ ...prev, cta: { ...prev.cta, backgroundImage: { ...prev.cta.backgroundImage, alt: e.target.value } } }))
                }
                disabled={loading || saving}
              />
            </div>
            <div className="space-y-2">
              <Label>Title</Label>
              <Input value={editor.cta.title} onChange={(e) => setEditor((prev) => ({ ...prev, cta: { ...prev.cta, title: e.target.value } }))} disabled={loading || saving} />
            </div>
            <div className="space-y-2">
              <Label>Overlay class</Label>
              <Input value={editor.cta.overlayClassName} onChange={(e) => setEditor((prev) => ({ ...prev, cta: { ...prev.cta, overlayClassName: e.target.value } }))} disabled={loading || saving} />
            </div>
            <div className="space-y-2 lg:col-span-2">
              <Label>Description</Label>
              <Textarea value={editor.cta.description} onChange={(e) => setEditor((prev) => ({ ...prev, cta: { ...prev.cta, description: e.target.value } }))} className="min-h-[120px]" disabled={loading || saving} />
            </div>
          </div>

          <div className="space-y-3">
            {editor.cta.actions.map((action, index) => (
              <Collapsible
                key={action.clientId}
                open={expanded[action.clientId]}
                onOpenChange={(open) => setExpanded((p) => ({ ...p, [action.clientId]: open }))}
                className="rounded-2xl border border-slate-200/70 bg-white"
              >
                <div className="flex items-center justify-between gap-3 p-4">
                  <div className="min-w-0">
                    <div className="font-medium truncate">{action.label?.trim() ? action.label : `Button ${index + 1}`}</div>
                    <div className="text-xs text-muted-foreground truncate">{action.href || '—'}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setEditor((prev) => ({ ...prev, cta: { ...prev.cta, actions: prev.cta.actions.filter((a) => a.clientId !== action.clientId) } }))}
                      disabled={loading || saving}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                    <CollapsibleTrigger asChild>
                      <Button variant="outline" size="sm">
                        Edit
                        <ChevronDown className={`ml-2 h-4 w-4 transition-transform ${expanded[action.clientId] ? 'rotate-180' : ''}`} />
                      </Button>
                    </CollapsibleTrigger>
                  </div>
                </div>
                <CollapsibleContent className="border-t border-slate-200/70 p-4 grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <Label>Icon</Label>
                    <Select
                      value={action.icon}
                      onValueChange={(value) =>
                        setEditor((prev) => ({
                          ...prev,
                          cta: {
                            ...prev.cta,
                            actions: prev.cta.actions.map((a) => (a.clientId === action.clientId ? { ...a, icon: value as IconKey } : a)),
                          },
                        }))
                      }
                      disabled={loading || saving}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {ICON_OPTIONS.map((opt) => (
                          <SelectItem key={opt.key} value={opt.key}>
                            {opt.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Label</Label>
                    <Input
                      value={action.label}
                      onChange={(e) =>
                        setEditor((prev) => ({
                          ...prev,
                          cta: {
                            ...prev.cta,
                            actions: prev.cta.actions.map((a) => (a.clientId === action.clientId ? { ...a, label: e.target.value } : a)),
                          },
                        }))
                      }
                      disabled={loading || saving}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Link (href)</Label>
                    <Input
                      value={action.href}
                      onChange={(e) =>
                        setEditor((prev) => ({
                          ...prev,
                          cta: {
                            ...prev.cta,
                            actions: prev.cta.actions.map((a) => (a.clientId === action.clientId ? { ...a, href: e.target.value } : a)),
                          },
                        }))
                      }
                      disabled={loading || saving}
                    />
                  </div>
                </CollapsibleContent>
              </Collapsible>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-2xl border-slate-200/70 bg-white/90 shadow-sm">
        <CardHeader>
          <CardTitle>Email settings</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label>Careers email *</Label>
            <Input value={editor.mail.careersEmail} onChange={(e) => setEditor((prev) => ({ ...prev, mail: { ...prev.mail, careersEmail: e.target.value } }))} disabled={loading || saving} />
          </div>
          <div className="space-y-2">
            <Label>Partnerships email *</Label>
            <Input value={editor.mail.partnershipsEmail} onChange={(e) => setEditor((prev) => ({ ...prev, mail: { ...prev.mail, partnershipsEmail: e.target.value } }))} disabled={loading || saving} />
          </div>
          <div className="space-y-2">
            <Label>Job email subject prefix</Label>
            <Input value={editor.mail.jobApplicationSubjectPrefix} onChange={(e) => setEditor((prev) => ({ ...prev, mail: { ...prev.mail, jobApplicationSubjectPrefix: e.target.value } }))} disabled={loading || saving} />
          </div>
          <div className="space-y-2">
            <Label>Partnership email subject prefix</Label>
            <Input value={editor.mail.partnershipSubjectPrefix} onChange={(e) => setEditor((prev) => ({ ...prev, mail: { ...prev.mail, partnershipSubjectPrefix: e.target.value } }))} disabled={loading || saving} />
          </div>
          <div className="space-y-2 lg:col-span-2">
            <Label>General application mailto link</Label>
            <Input value={editor.mail.generalApplicationHref} onChange={(e) => setEditor((prev) => ({ ...prev, mail: { ...prev.mail, generalApplicationHref: e.target.value } }))} disabled={loading || saving} />
          </div>
          <div className="flex items-center justify-end gap-2 lg:col-span-2">
            <Button variant="outline" onClick={load} disabled={loading || saving}>
              Reload
            </Button>
            <Button onClick={save} disabled={loading || saving || hasValidationErrors}>
              {saving ? 'Saving…' : 'Save'}
            </Button>
          </div>
        </CardContent>
      </Card>

      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title={deleteTarget?.type === 'job' ? 'Delete job' : 'Delete opportunity'}
        description={`Delete ${deleteTarget?.title || 'this item'}? This cannot be undone.`}
        confirmLabel="Delete"
        variant="destructive"
        onConfirm={deleteConfirmed}
        closeOnConfirm={false}
      />
    </div>
  );
}
