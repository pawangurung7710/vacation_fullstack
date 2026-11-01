import { useEffect, useState } from 'react';
import { Save, RefreshCw, ExternalLink, Plus, Trash2, ChevronUp, ChevronDown } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '../../components/ui/collapsible';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { PageHeader } from '../components/PageHeader';
import { pagesApi } from '../../services/api';
import defaultContent from '../../data/homepage-content.json';
import type { HomepageContent } from '../../pages/home-page';
import { normalizeHero } from '../../pages/home-page';

const PAGE_KEY = 'homepage';

function mergeContent(candidate: unknown): HomepageContent {
  const base = defaultContent as HomepageContent;
  if (!candidate || typeof candidate !== 'object') return base;
  const c = candidate as Record<string, unknown>;
  const baseAny = base as Record<string, unknown>;
  return {
    styles: { ...(baseAny.styles as object), ...(c.styles as object) },
    hero: normalizeHero(base.hero, c.hero),
    featuredJourneys: { ...base.featuredJourneys, ...(c.featuredJourneys as object) },
    curateSection: { ...base.curateSection, ...(c.curateSection as object) },
    crowdedTrails: { ...base.crowdedTrails, ...(c.crowdedTrails as object) },
    gallery: { ...(baseAny.gallery as object), ...(c.gallery as object) },
    blogSection: { ...base.blogSection, ...(c.blogSection as object) },
    travelerStories: { ...base.travelerStories, ...(c.travelerStories as object) },
    cta: { ...base.cta, ...(c.cta as object) },
  } as HomepageContent;
}

export function HomepageCmsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [exists, setExists] = useState(false);
  const [content, setContent] = useState<HomepageContent>(() => defaultContent as HomepageContent);
  const [resetDialogOpen, setResetDialogOpen] = useState(false);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({
    styling: false,
    hero: true,
    featuredJourneys: false,
    curate: false,
    crowdedTrails: false,
    blog: false,
    travelerStories: false,
    cta: false,
  });

  const load = async () => {
    setLoading(true);
    try {
      const page = await pagesApi.getByKey(PAGE_KEY);
      const raw = typeof page?.content === 'string' ? page.content : '';
      try {
        setContent(mergeContent(raw ? JSON.parse(raw) : null));
      } catch {
        toast.error('Saved content invalid. Using defaults.');
        setContent(defaultContent as HomepageContent);
      }
      setExists(true);
    } catch (err: any) {
      if (err?.status === 404) {
        setContent(defaultContent as HomepageContent);
        setExists(false);
      } else {
        toast.error(err?.message || 'Failed to load');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const save = async () => {
    setSaving(true);
    try {
      const payload = { title: 'Homepage', content: JSON.stringify(content, null, 2) };
      if (exists) {
        await pagesApi.update(PAGE_KEY, payload);
      } else {
        await pagesApi.create({ pageKey: PAGE_KEY, ...payload });
        setExists(true);
      }
      toast.success('Homepage content saved.');
    } catch (err: any) {
      if (err?.status === 404) {
        try {
          await pagesApi.create({ pageKey: PAGE_KEY, title: 'Homepage', content: JSON.stringify(content, null, 2) });
          setExists(true);
          toast.success('Homepage content saved.');
        } catch (e: any) {
          toast.error(e?.message || 'Failed to save');
        }
      } else {
        toast.error(err?.message || 'Failed to save');
      }
    } finally {
      setSaving(false);
    }
  };

  const resetToDefaults = () => {
    setContent(defaultContent as HomepageContent);
    toast.success('Reset to defaults.');
    setResetDialogOpen(false);
  };

  const toggle = (key: string) => setExpanded((p) => ({ ...p, [key]: !p[key] }));

  return (
    <div className="space-y-6">
      <PageHeader
        title="Homepage"
        description="Edit copy, images, and links for the public homepage."
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
          description="This will replace all current content with the default homepage content. You can save afterwards to persist it, or reload to undo. Continue?"
          confirmLabel="Reset"
          cancelLabel="Cancel"
          onConfirm={resetToDefaults}
          variant="destructive"
        />
        <Button variant="outline" asChild>
          <a href="/" target="_blank" rel="noreferrer">
            <ExternalLink className="mr-2 h-4 w-4" />
            View homepage
          </a>
        </Button>
      </div>

      <Collapsible open={expanded.styling} onOpenChange={() => toggle('styling')}>
        <Card>
          <CollapsibleTrigger asChild>
            <CardHeader className="cursor-pointer">
              <CardTitle className="flex items-center gap-2">Colors &amp; styling</CardTitle>
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent className="space-y-4 pt-0">
              <p className="text-sm text-muted-foreground">Customize colors and appearance of the homepage. Leave empty to use theme defaults.</p>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Primary color (buttons, links)</Label>
                  <div className="flex gap-2 items-center">
                    <input
                      type="color"
                      value={(content as any).styles?.primaryColor ?? '#15803d'}
                      onChange={(e) => setContent((p) => ({
                        ...p,
                        styles: { ...(p as any).styles, primaryColor: e.target.value },
                      }))}
                      className="h-10 w-14 rounded border cursor-pointer"
                    />
                    <Input
                      value={(content as any).styles?.primaryColor ?? ''}
                      onChange={(e) => setContent((p) => ({
                        ...p,
                        styles: { ...(p as any).styles, primaryColor: e.target.value || undefined },
                      }))}
                      placeholder="#15803d"
                      className="font-mono"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Primary hover color</Label>
                  <div className="flex gap-2 items-center">
                    <input
                      type="color"
                      value={(content as any).styles?.primaryColorHover ?? '#166534'}
                      onChange={(e) => setContent((p) => ({
                        ...p,
                        styles: { ...(p as any).styles, primaryColorHover: e.target.value },
                      }))}
                      className="h-10 w-14 rounded border cursor-pointer"
                    />
                    <Input
                      value={(content as any).styles?.primaryColorHover ?? ''}
                      onChange={(e) => setContent((p) => ({
                        ...p,
                        styles: { ...(p as any).styles, primaryColorHover: e.target.value || undefined },
                      }))}
                      placeholder="#166534"
                      className="font-mono"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Section heading color</Label>
                  <div className="flex gap-2 items-center">
                    <input
                      type="color"
                      value={(content as any).styles?.sectionHeadingColor ?? '#15803d'}
                      onChange={(e) => setContent((p) => ({
                        ...p,
                        styles: { ...(p as any).styles, sectionHeadingColor: e.target.value },
                      }))}
                      className="h-10 w-14 rounded border cursor-pointer"
                    />
                    <Input
                      value={(content as any).styles?.sectionHeadingColor ?? ''}
                      onChange={(e) => setContent((p) => ({
                        ...p,
                        styles: { ...(p as any).styles, sectionHeadingColor: e.target.value || undefined },
                      }))}
                      placeholder="#15803d"
                      className="font-mono"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Subtitle / muted text color</Label>
                  <div className="flex gap-2 items-center">
                    <input
                      type="color"
                      value={(content as any).styles?.subtitleColor ?? '#6b7885'}
                      onChange={(e) => setContent((p) => ({
                        ...p,
                        styles: { ...(p as any).styles, subtitleColor: e.target.value },
                      }))}
                      className="h-10 w-14 rounded border cursor-pointer"
                    />
                    <Input
                      value={(content as any).styles?.subtitleColor ?? ''}
                      onChange={(e) => setContent((p) => ({
                        ...p,
                        styles: { ...(p as any).styles, subtitleColor: e.target.value || undefined },
                      }))}
                      placeholder="#6b7885"
                      className="font-mono"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Accent color (links, highlights)</Label>
                  <div className="flex gap-2 items-center">
                    <input
                      type="color"
                      value={(content as any).styles?.accentColor ?? '#296a8c'}
                      onChange={(e) => setContent((p) => ({
                        ...p,
                        styles: { ...(p as any).styles, accentColor: e.target.value },
                      }))}
                      className="h-10 w-14 rounded border cursor-pointer"
                    />
                    <Input
                      value={(content as any).styles?.accentColor ?? ''}
                      onChange={(e) => setContent((p) => ({
                        ...p,
                        styles: { ...(p as any).styles, accentColor: e.target.value || undefined },
                      }))}
                      placeholder="#296a8c"
                      className="font-mono"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Button border radius</Label>
                  <Input
                    value={(content as any).styles?.buttonBorderRadius ?? ''}
                    onChange={(e) => setContent((p) => ({
                      ...p,
                      styles: { ...(p as any).styles, buttonBorderRadius: e.target.value || undefined },
                    }))}
                    placeholder="0.5rem"
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label>Hero overlay (e.g. rgba(0,0,0,0.25))</Label>
                  <Input
                    value={(content as any).styles?.heroOverlay ?? ''}
                    onChange={(e) => setContent((p) => ({
                      ...p,
                      styles: { ...(p as any).styles, heroOverlay: e.target.value || undefined },
                    }))}
                    placeholder="rgba(0,0,0,0.25)"
                    className="font-mono"
                  />
                </div>
              </div>
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>

      <Collapsible open={expanded.hero} onOpenChange={() => toggle('hero')}>
        <Card>
          <CollapsibleTrigger asChild>
            <CardHeader className="cursor-pointer">
              <CardTitle>Hero</CardTitle>
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent className="space-y-4 pt-0">
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  Each slide has its own background image and headline. They rotate automatically on the public homepage.
                </p>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setContent((p) => ({
                      ...p,
                      hero: { ...p.hero, slides: [...p.hero.slides, { image: { src: '', alt: '' }, heading: '' }] },
                    }))
                  }
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add slide
                </Button>
              </div>

              {content.hero.slides.map((slide, i) => (
                <div key={i} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-medium">Slide {i + 1}</Label>
                    <div className="flex items-center gap-1">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        disabled={i === 0}
                        onClick={() =>
                          setContent((p) => {
                            const slides = [...p.hero.slides];
                            [slides[i - 1], slides[i]] = [slides[i], slides[i - 1]];
                            return { ...p, hero: { ...p.hero, slides } };
                          })
                        }
                      >
                        <ChevronUp className="h-4 w-4" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        disabled={i === content.hero.slides.length - 1}
                        onClick={() =>
                          setContent((p) => {
                            const slides = [...p.hero.slides];
                            [slides[i], slides[i + 1]] = [slides[i + 1], slides[i]];
                            return { ...p, hero: { ...p.hero, slides } };
                          })
                        }
                      >
                        <ChevronDown className="h-4 w-4" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        disabled={content.hero.slides.length <= 1}
                        onClick={() =>
                          setContent((p) => ({
                            ...p,
                            hero: { ...p.hero, slides: p.hero.slides.filter((_, j) => j !== i) },
                          }))
                        }
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Image URL</Label>
                      <Input
                        value={slide.image.src}
                        placeholder="https://..."
                        onChange={(e) =>
                          setContent((p) => ({
                            ...p,
                            hero: {
                              ...p.hero,
                              slides: p.hero.slides.map((s, j) => (j === i ? { ...s, image: { ...s.image, src: e.target.value } } : s)),
                            },
                          }))
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Image alt</Label>
                      <Input
                        value={slide.image.alt}
                        onChange={(e) =>
                          setContent((p) => ({
                            ...p,
                            hero: {
                              ...p.hero,
                              slides: p.hero.slides.map((s, j) => (j === i ? { ...s, image: { ...s.image, alt: e.target.value } } : s)),
                            },
                          }))
                        }
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Headline</Label>
                    <Input
                      value={slide.heading}
                      onChange={(e) =>
                        setContent((p) => ({
                          ...p,
                          hero: { ...p.hero, slides: p.hero.slides.map((s, j) => (j === i ? { ...s, heading: e.target.value } : s)) },
                        }))
                      }
                    />
                  </div>
                </div>
              ))}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Primary CTA label</Label>
                  <Input
                    value={content.hero.primaryCta.label}
                    onChange={(e) => setContent((p) => ({ ...p, hero: { ...p.hero, primaryCta: { ...p.hero.primaryCta, label: e.target.value } } }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Primary CTA href</Label>
                  <Input
                    value={content.hero.primaryCta.href}
                    onChange={(e) => setContent((p) => ({ ...p, hero: { ...p.hero, primaryCta: { ...p.hero.primaryCta, href: e.target.value } } }))}
                  />
                </div>
              </div>
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>

      <Collapsible open={expanded.featuredJourneys} onOpenChange={() => toggle('featuredJourneys')}>
        <Card>
          <CollapsibleTrigger asChild>
            <CardHeader className="cursor-pointer">
              <CardTitle>Featured Journeys</CardTitle>
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Title</Label>
                <Input
                  value={content.featuredJourneys.title}
                  onChange={(e) => setContent((p) => ({ ...p, featuredJourneys: { ...p.featuredJourneys, title: e.target.value } }))}
                />
              </div>
              <div className="space-y-2">
                <Label>Subtitle</Label>
                <Input
                  value={content.featuredJourneys.subtitle}
                  onChange={(e) => setContent((p) => ({ ...p, featuredJourneys: { ...p.featuredJourneys, subtitle: e.target.value } }))}
                />
              </div>
              <div className="space-y-2">
                <Label>View all button label</Label>
                <Input
                  value={content.featuredJourneys.viewAllLabel}
                  onChange={(e) => setContent((p) => ({ ...p, featuredJourneys: { ...p.featuredJourneys, viewAllLabel: e.target.value } }))}
                />
              </div>
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>

      <Collapsible open={expanded.curate} onOpenChange={() => toggle('curate')}>
        <Card>
          <CollapsibleTrigger asChild>
            <CardHeader className="cursor-pointer">
              <CardTitle>Curate section (image + text)</CardTitle>
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Heading</Label>
                <Input
                  value={content.curateSection.heading}
                  onChange={(e) => setContent((p) => ({ ...p, curateSection: { ...p.curateSection, heading: e.target.value } }))}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Image URL</Label>
                  <Input
                    value={content.curateSection.image1.src}
                    onChange={(e) => setContent((p) => ({ ...p, curateSection: { ...p.curateSection, image1: { ...p.curateSection.image1, src: e.target.value } } }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Image alt</Label>
                  <Input
                    value={content.curateSection.image1.alt}
                    onChange={(e) => setContent((p) => ({ ...p, curateSection: { ...p.curateSection, image1: { ...p.curateSection.image1, alt: e.target.value } } }))}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  value={content.curateSection.description || ''}
                  onChange={(e) => setContent((p) => ({ ...p, curateSection: { ...p.curateSection, description: e.target.value } }))}
                  rows={4}
                />
              </div>

              <div className="flex items-center justify-between pt-2">
                <Label>Features</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="gap-2"
                  onClick={() =>
                    setContent((p) => ({
                      ...p,
                      curateSection: {
                        ...p.curateSection,
                        features: [...(p.curateSection.features || []), { title: '', subtitle: '', body: '' }],
                      },
                    }))
                  }
                >
                  <Plus size={14} />
                  Add feature
                </Button>
              </div>
              {(content.curateSection.features || []).map((feature, i) => (
                <div key={i} className="border rounded-lg p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Feature {i + 1}</Label>
                    <button
                      type="button"
                      onClick={() =>
                        setContent((p) => ({
                          ...p,
                          curateSection: {
                            ...p.curateSection,
                            features: (p.curateSection.features || []).filter((_, j) => j !== i),
                          },
                        }))
                      }
                      className="rounded-full p-1.5 text-gray-500 hover:bg-gray-100 hover:text-red-500"
                      aria-label="Remove feature"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                  <Input
                    placeholder="Title"
                    value={feature.title}
                    onChange={(e) =>
                      setContent((p) => ({
                        ...p,
                        curateSection: {
                          ...p.curateSection,
                          features: (p.curateSection.features || []).map((f, j) => (j === i ? { ...f, title: e.target.value } : f)),
                        },
                      }))
                    }
                  />
                  <Input
                    placeholder="Subtitle"
                    value={feature.subtitle}
                    onChange={(e) =>
                      setContent((p) => ({
                        ...p,
                        curateSection: {
                          ...p.curateSection,
                          features: (p.curateSection.features || []).map((f, j) => (j === i ? { ...f, subtitle: e.target.value } : f)),
                        },
                      }))
                    }
                  />
                  <Textarea
                    placeholder="Body"
                    value={feature.body}
                    onChange={(e) =>
                      setContent((p) => ({
                        ...p,
                        curateSection: {
                          ...p.curateSection,
                          features: (p.curateSection.features || []).map((f, j) => (j === i ? { ...f, body: e.target.value } : f)),
                        },
                      }))
                    }
                    rows={3}
                  />
                </div>
              ))}
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>

      <Card>
        <CardHeader>
          <CardTitle>Gallery (bento photo grid)</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Gallery images now have their own page —{' '}
            <a href="/cms/pages/gallery" className="underline">
              edit them here
            </a>
            .
          </p>
        </CardContent>
      </Card>

      <Collapsible open={expanded.crowdedTrails} onOpenChange={() => toggle('crowdedTrails')}>
        <Card>
          <CollapsibleTrigger asChild>
            <CardHeader className="cursor-pointer">
              <CardTitle>Intro CTA button</CardTitle>
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>CTA label</Label>
                  <Input
                    value={content.crowdedTrails.ctaLabel}
                    onChange={(e) => setContent((p) => ({ ...p, crowdedTrails: { ...p.crowdedTrails, ctaLabel: e.target.value } }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>CTA href</Label>
                  <Input
                    value={content.crowdedTrails.ctaHref}
                    onChange={(e) => setContent((p) => ({ ...p, crowdedTrails: { ...p.crowdedTrails, ctaHref: e.target.value } }))}
                  />
                </div>
              </div>
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>

      <Collapsible open={expanded.blog} onOpenChange={() => toggle('blog')}>
        <Card>
          <CollapsibleTrigger asChild>
            <CardHeader className="cursor-pointer">
              <CardTitle>Blog section</CardTitle>
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Title</Label>
                <Input
                  value={content.blogSection.title}
                  onChange={(e) => setContent((p) => ({ ...p, blogSection: { ...p.blogSection, title: e.target.value } }))}
                />
              </div>
              <div className="space-y-2">
                <Label>Subtitle</Label>
                <Input
                  value={content.blogSection.subtitle}
                  onChange={(e) => setContent((p) => ({ ...p, blogSection: { ...p.blogSection, subtitle: e.target.value } }))}
                />
              </div>
              <div className="space-y-2">
                <Label>Button label</Label>
                <Input
                  value={content.blogSection.buttonLabel}
                  onChange={(e) => setContent((p) => ({ ...p, blogSection: { ...p.blogSection, buttonLabel: e.target.value } }))}
                />
              </div>
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>

      <Collapsible open={expanded.travelerStories} onOpenChange={() => toggle('travelerStories')}>
        <Card>
          <CollapsibleTrigger asChild>
            <CardHeader className="cursor-pointer">
              <CardTitle>Traveler Stories</CardTitle>
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Title</Label>
                <Input
                  value={content.travelerStories.title}
                  onChange={(e) => setContent((p) => ({ ...p, travelerStories: { ...p.travelerStories, title: e.target.value } }))}
                />
              </div>
              <div className="space-y-2">
                <Label>Subtitle</Label>
                <Input
                  value={content.travelerStories.subtitle}
                  onChange={(e) => setContent((p) => ({ ...p, travelerStories: { ...p.travelerStories, subtitle: e.target.value } }))}
                />
              </div>
              <div className="space-y-2">
                <Label>Button label</Label>
                <Input
                  value={content.travelerStories.buttonLabel}
                  onChange={(e) => setContent((p) => ({ ...p, travelerStories: { ...p.travelerStories, buttonLabel: e.target.value } }))}
                />
              </div>
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>

      <Collapsible open={expanded.cta} onOpenChange={() => toggle('cta')}>
        <Card>
          <CollapsibleTrigger asChild>
            <CardHeader className="cursor-pointer">
              <CardTitle>Final CTA</CardTitle>
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Background image URL</Label>
                  <Input
                    value={content.cta.backgroundImage.src}
                    onChange={(e) =>
                      setContent((p) => ({ ...p, cta: { ...p.cta, backgroundImage: { ...p.cta.backgroundImage, src: e.target.value } } }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Image alt</Label>
                  <Input
                    value={content.cta.backgroundImage.alt}
                    onChange={(e) =>
                      setContent((p) => ({ ...p, cta: { ...p.cta, backgroundImage: { ...p.cta.backgroundImage, alt: e.target.value } } }))
                    }
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Title</Label>
                <Input value={content.cta.title} onChange={(e) => setContent((p) => ({ ...p, cta: { ...p.cta, title: e.target.value } }))} />
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  value={content.cta.description}
                  onChange={(e) => setContent((p) => ({ ...p, cta: { ...p.cta, description: e.target.value } }))}
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Primary button label</Label>
                  <Input
                    value={content.cta.primaryButton.label}
                    onChange={(e) =>
                      setContent((p) => ({ ...p, cta: { ...p.cta, primaryButton: { ...p.cta.primaryButton, label: e.target.value } } }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Primary button href</Label>
                  <Input
                    value={content.cta.primaryButton.href}
                    onChange={(e) =>
                      setContent((p) => ({ ...p, cta: { ...p.cta, primaryButton: { ...p.cta.primaryButton, href: e.target.value } } }))
                    }
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Secondary button label</Label>
                  <Input
                    value={content.cta.secondaryButton.label}
                    onChange={(e) =>
                      setContent((p) => ({ ...p, cta: { ...p.cta, secondaryButton: { ...p.cta.secondaryButton, label: e.target.value } } }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Secondary button href</Label>
                  <Input
                    value={content.cta.secondaryButton.href}
                    onChange={(e) =>
                      setContent((p) => ({ ...p, cta: { ...p.cta, secondaryButton: { ...p.cta.secondaryButton, href: e.target.value } } }))
                    }
                  />
                </div>
              </div>
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>
    </div>
  );
}
