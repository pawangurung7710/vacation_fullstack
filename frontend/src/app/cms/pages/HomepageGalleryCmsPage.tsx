import { useEffect, useState } from 'react';
import { Save, RefreshCw, ExternalLink, Plus, Trash2, ChevronUp, ChevronDown } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
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

export function HomepageGalleryCmsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [exists, setExists] = useState(false);
  const [content, setContent] = useState<HomepageContent>(() => defaultContent as HomepageContent);

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
      toast.success('Gallery saved.');
    } catch (err: any) {
      if (err?.status === 404) {
        try {
          await pagesApi.create({ pageKey: PAGE_KEY, title: 'Homepage', content: JSON.stringify(content, null, 2) });
          setExists(true);
          toast.success('Gallery saved.');
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

  const images = (((content as any).gallery?.images || []) as Array<{ src: string; alt: string }>);

  const updateImages = (next: Array<{ src: string; alt: string }>) => {
    setContent((p) => ({ ...p, gallery: { ...(p as any).gallery, images: next } }));
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Homepage Gallery"
        description="Photos shown in the bento-style gallery on the homepage, below 'What makes us different'."
        action={{ label: saving ? 'Saving…' : 'Save', onClick: save, icon: Save }}
      />

      <div className="flex flex-wrap gap-2 justify-end">
        <Button variant="outline" onClick={load} disabled={loading || saving}>
          <RefreshCw className="mr-2 h-4 w-4" />
          Reload
        </Button>
        <Button variant="outline" asChild>
          <a href="/" target="_blank" rel="noreferrer">
            <ExternalLink className="mr-2 h-4 w-4" />
            View homepage
          </a>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Gallery images</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              The first 10 images are shown on the homepage, in two rows of five. Reorder or replace any image below.
            </p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => updateImages([...images, { src: '', alt: '' }])}
            >
              <Plus className="mr-2 h-4 w-4" />
              Add image
            </Button>
          </div>

          {images.map((image, i) => (
            <div key={i} className="border rounded-lg p-4 flex gap-4 items-start">
              <div className="w-24 h-24 shrink-0 rounded-md overflow-hidden bg-gray-100 border">
                {image.src ? (
                  <img src={image.src} alt={image.alt} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-xs text-muted-foreground">
                    No image
                  </div>
                )}
              </div>
              <div className="flex-1 space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium">
                    Image {i + 1}
                    {i < 10 && <span className="ml-2 text-xs text-muted-foreground">(shown on homepage)</span>}
                  </Label>
                  <div className="flex items-center gap-1">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      disabled={i === 0}
                      onClick={() => {
                        const next = [...images];
                        [next[i - 1], next[i]] = [next[i], next[i - 1]];
                        updateImages(next);
                      }}
                    >
                      <ChevronUp className="h-4 w-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      disabled={i === images.length - 1}
                      onClick={() => {
                        const next = [...images];
                        [next[i], next[i + 1]] = [next[i + 1], next[i]];
                        updateImages(next);
                      }}
                    >
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => updateImages(images.filter((_, j) => j !== i))}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Image URL</Label>
                    <Input
                      value={image.src}
                      placeholder="https://..."
                      onChange={(e) => updateImages(images.map((img, j) => (j === i ? { ...img, src: e.target.value } : img)))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Image alt</Label>
                    <Input
                      value={image.alt}
                      onChange={(e) => updateImages(images.map((img, j) => (j === i ? { ...img, alt: e.target.value } : img)))}
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
