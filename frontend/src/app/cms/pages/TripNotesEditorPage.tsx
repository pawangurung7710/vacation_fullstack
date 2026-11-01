import { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ChevronDown, Plus, Save, Trash2, ArrowUp, ArrowDown, ArrowLeft, ExternalLink, RotateCcw,
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { Switch } from '../../components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '../../components/ui/collapsible';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { PageHeader } from '../components/PageHeader';
import { SequoiaLoader } from '../components/SequoiaLoader';
import { tripsApi } from '../../services/api';
import {
  DEFAULT_TRIP_NOTES,
  DEFAULT_TRIP_NOTE_SECTIONS,
  TRIP_NOTE_ICON_KEYS,
  type TripNoteBlockType,
} from '../../data/trip-notes-defaults';

const BLOCK_TYPES: { value: TripNoteBlockType; label: string }[] = [
  { value: 'paragraph', label: 'Paragraph' },
  { value: 'subheading', label: 'Subheading' },
  { value: 'bullets', label: 'Bullet list' },
  { value: 'numbered', label: 'Numbered list' },
  { value: 'tip', label: 'Tip box (green)' },
  { value: 'warning', label: 'Warning box (amber)' },
  { value: 'note', label: 'Note box (blue)' },
  { value: 'contact', label: 'Contact card' },
  { value: 'pricegrid', label: 'Price grid' },
];

const LIST_TYPES: TripNoteBlockType[] = ['bullets', 'numbered', 'contact'];
const TEXT_TYPES: TripNoteBlockType[] = ['paragraph', 'subheading', 'tip', 'warning', 'note', 'contact'];

const createClientId = (prefix: string) =>
  `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;

type BlockEditor = {
  clientId: string;
  type: TripNoteBlockType;
  text: string;
  itemsText: string; // one entry per line
  rowsText: string; // "label | value" per line
  tone: 'default' | 'danger';
};

type SectionEditor = {
  clientId: string;
  key: string;
  title: string;
  icon: string;
  enabled: boolean;
  blocks: BlockEditor[];
};

type OverviewEditor = {
  tripStyle: string;
  accommodationSummary: string;
  mealsSummary: string;
  bestSeason: string;
  tripCode: string;
};

const toBlockEditor = (block: any): BlockEditor => ({
  clientId: createClientId('block'),
  type: (block?.type as TripNoteBlockType) || 'paragraph',
  text: block?.text || '',
  itemsText: Array.isArray(block?.items) ? block.items.join('\n') : '',
  rowsText: Array.isArray(block?.rows)
    ? block.rows.map((r: any) => `${r?.label || ''} | ${r?.value || ''}`).join('\n')
    : '',
  tone: block?.tone === 'danger' ? 'danger' : 'default',
});

const toSectionEditor = (section: any): SectionEditor => ({
  clientId: createClientId('section'),
  key: section?.key || createClientId('sec').replace(/[^a-z0-9-]/gi, ''),
  title: section?.title || '',
  icon: section?.icon || 'info',
  enabled: section?.enabled !== false,
  blocks: Array.isArray(section?.blocks) ? section.blocks.map(toBlockEditor) : [],
});

const parseRows = (rowsText: string) =>
  rowsText
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [label, ...rest] = line.split('|');
      return { label: (label || '').trim(), value: rest.join('|').trim() };
    });

const toApiBlock = (block: BlockEditor) => {
  const out: any = { type: block.type };
  if (TEXT_TYPES.includes(block.type)) out.text = block.text.trim();
  if (LIST_TYPES.includes(block.type)) {
    out.items = block.itemsText.split('\n').map((l) => l.trim()).filter(Boolean);
  }
  if (block.type === 'pricegrid') out.rows = parseRows(block.rowsText);
  if (block.type === 'contact') out.tone = block.tone;
  return out;
};

const isBlockEmpty = (block: BlockEditor) => {
  if (TEXT_TYPES.includes(block.type) && block.text.trim()) return false;
  if (LIST_TYPES.includes(block.type) && block.itemsText.trim()) return false;
  if (block.type === 'pricegrid' && block.rowsText.trim()) return false;
  return !(block.type === 'contact' && block.text.trim());
};

export function TripNotesEditorPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [tripTitle, setTripTitle] = useState('');
  const [tripSlug, setTripSlug] = useState('');
  const [pageEnabled, setPageEnabled] = useState(true);
  const [overview, setOverview] = useState<OverviewEditor>({
    tripStyle: '', accommodationSummary: '', mealsSummary: '', bestSeason: '', tripCode: '',
  });
  const [sections, setSections] = useState<SectionEditor[]>([]);
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({});
  const [resetOpen, setResetOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  const hydrate = (notes: any) => {
    const source = notes && Array.isArray(notes.sections) && notes.sections.length > 0 ? notes : DEFAULT_TRIP_NOTES;
    setPageEnabled(source.enabled !== false);
    setOverview({
      tripStyle: source.overview?.tripStyle || '',
      accommodationSummary: source.overview?.accommodationSummary || '',
      mealsSummary: source.overview?.mealsSummary || '',
      bestSeason: source.overview?.bestSeason || '',
      tripCode: source.overview?.tripCode || '',
    });
    setSections(source.sections.map(toSectionEditor));
  };

  useEffect(() => {
    let active = true;
    const load = async () => {
      if (!id) return;
      setLoading(true);
      try {
        const trip = await tripsApi.getById(id);
        if (!active) return;
        setTripTitle(trip?.title || 'Trip');
        setTripSlug(trip?.slug || id);
        hydrate(trip?.tripNotes);
      } catch (error) {
        toast.error('Failed to load trip');
      } finally {
        if (active) setLoading(false);
      }
    };
    load();
    return () => { active = false; };
  }, [id]);

  const iconOptions = useMemo(() => TRIP_NOTE_ICON_KEYS, []);

  const updateSection = (clientId: string, patch: Partial<SectionEditor>) =>
    setSections((prev) => prev.map((s) => (s.clientId === clientId ? { ...s, ...patch } : s)));

  const updateBlock = (sectionId: string, blockId: string, patch: Partial<BlockEditor>) =>
    setSections((prev) =>
      prev.map((s) =>
        s.clientId === sectionId
          ? { ...s, blocks: s.blocks.map((b) => (b.clientId === blockId ? { ...b, ...patch } : b)) }
          : s,
      ),
    );

  const addBlock = (sectionId: string) =>
    setSections((prev) =>
      prev.map((s) =>
        s.clientId === sectionId
          ? {
              ...s,
              blocks: [
                ...s.blocks,
                { clientId: createClientId('block'), type: 'paragraph', text: '', itemsText: '', rowsText: '', tone: 'default' },
              ],
            }
          : s,
      ),
    );

  const removeBlock = (sectionId: string, blockId: string) =>
    setSections((prev) =>
      prev.map((s) =>
        s.clientId === sectionId ? { ...s, blocks: s.blocks.filter((b) => b.clientId !== blockId) } : s,
      ),
    );

  const moveBlock = (sectionId: string, blockId: string, dir: -1 | 1) =>
    setSections((prev) =>
      prev.map((s) => {
        if (s.clientId !== sectionId) return s;
        const idx = s.blocks.findIndex((b) => b.clientId === blockId);
        const next = idx + dir;
        if (idx < 0 || next < 0 || next >= s.blocks.length) return s;
        const blocks = [...s.blocks];
        [blocks[idx], blocks[next]] = [blocks[next], blocks[idx]];
        return { ...s, blocks };
      }),
    );

  const moveSection = (clientId: string, dir: -1 | 1) =>
    setSections((prev) => {
      const idx = prev.findIndex((s) => s.clientId === clientId);
      const next = idx + dir;
      if (idx < 0 || next < 0 || next >= prev.length) return prev;
      const arr = [...prev];
      [arr[idx], arr[next]] = [arr[next], arr[idx]];
      return arr;
    });

  const addSection = () => {
    const clientId = createClientId('section');
    setSections((prev) => [
      ...prev,
      { clientId, key: `section-${prev.length + 1}`, title: 'New section', icon: 'info', enabled: true, blocks: [] },
    ]);
    setOpenSections((prev) => ({ ...prev, [clientId]: true }));
  };

  const removeSection = (clientId: string) =>
    setSections((prev) => prev.filter((s) => s.clientId !== clientId));

  const resetSectionToDefault = (clientId: string, key: string) => {
    const def = DEFAULT_TRIP_NOTE_SECTIONS.find((d) => d.key === key);
    if (!def) {
      toast.error('No default content for this section');
      return;
    }
    updateSection(clientId, { ...toSectionEditor(def), clientId, key });
  };

  const handleSave = async () => {
    if (!id) return;
    setSaving(true);
    try {
      const payload = {
        tripNotes: {
          enabled: pageEnabled,
          overview: {
            tripStyle: overview.tripStyle.trim(),
            accommodationSummary: overview.accommodationSummary.trim(),
            mealsSummary: overview.mealsSummary.trim(),
            bestSeason: overview.bestSeason.trim(),
            tripCode: overview.tripCode.trim(),
          },
          sections: sections.map((s) => ({
            key: (s.key || '').trim() || createClientId('sec'),
            title: s.title.trim(),
            icon: s.icon,
            enabled: s.enabled,
            blocks: s.blocks.filter((b) => !isBlockEmpty(b)).map(toApiBlock),
          })),
        },
      };
      const updated = await tripsApi.update(id, payload as any);
      hydrate(updated?.tripNotes);
      toast.success('Trip notes saved');
    } catch (error: any) {
      toast.error(error?.message || 'Failed to save trip notes');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="px-6 py-10 flex justify-center">
        <SequoiaLoader label="Loading trip notes" />
      </div>
    );
  }

  return (
    <div className="px-6 py-4 space-y-4">
      <button
        onClick={() => navigate('/cms/trips')}
        className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> Back to trips
      </button>

      <PageHeader
        title={`Trip Notes — ${tripTitle}`}
        description="The essential-information page shown at /trip/:slug/notes for this trip."
      />

      <div className="flex flex-wrap items-center gap-3">
        <a
          href={`/trip/${tripSlug}/notes`}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1.5 text-sm text-[var(--cms-primary)] hover:underline"
        >
          <ExternalLink className="h-4 w-4" /> View notes page
        </a>
        <Button variant="outline" size="sm" onClick={() => setResetOpen(true)} className="gap-1.5">
          <RotateCcw className="h-3.5 w-3.5" /> Reset all to defaults
        </Button>
        <div className="flex items-center gap-2 ml-auto">
          <Switch checked={pageEnabled} onCheckedChange={setPageEnabled} id="page-enabled" />
          <Label htmlFor="page-enabled" className="text-sm">Notes page visible</Label>
        </div>
      </div>

      <Card className="rounded-2xl border-slate-200/70 bg-white/90 shadow-sm">
        <CardHeader>
          <CardTitle className="text-base">Overview facts</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {([
            ['tripStyle', 'Trip style', 'Regenerative trekking'],
            ['bestSeason', 'Best season', 'Mar – May, Sep – Nov'],
            ['accommodationSummary', 'Accommodation', 'Eco-lodges & homestays'],
            ['mealsSummary', 'Meals', 'Most meals included'],
            ['tripCode', 'Trip code', 'Auto (NDX-…)'],
          ] as const).map(([field, label, placeholder]) => (
            <div key={field}>
              <Label className="text-sm">{label}</Label>
              <Input
                value={overview[field]}
                placeholder={placeholder}
                onChange={(e) => setOverview((prev) => ({ ...prev, [field]: e.target.value }))}
              />
            </div>
          ))}
        </CardContent>
      </Card>

      <div className="space-y-3">
        {sections.map((section, sIdx) => {
          const open = openSections[section.clientId] ?? false;
          return (
            <Card key={section.clientId} className="rounded-2xl border-slate-200/70 bg-white/90 shadow-sm">
              <Collapsible
                open={open}
                onOpenChange={(v) => setOpenSections((prev) => ({ ...prev, [section.clientId]: v }))}
              >
                <div className="flex items-center gap-2 p-4">
                  <CollapsibleTrigger asChild>
                    <button className="flex flex-1 items-center gap-2 text-left">
                      <ChevronDown className={`h-4 w-4 transition-transform ${open ? 'rotate-180' : ''}`} />
                      <span className="font-medium">{section.title || 'Untitled section'}</span>
                      {!section.enabled && (
                        <span className="text-xs uppercase tracking-wide text-muted-foreground border rounded px-1.5 py-0.5">
                          Hidden
                        </span>
                      )}
                      <span className="text-xs text-muted-foreground">
                        {section.blocks.length} block{section.blocks.length === 1 ? '' : 's'}
                      </span>
                    </button>
                  </CollapsibleTrigger>
                  <Button variant="ghost" size="icon" disabled={sIdx === 0} onClick={() => moveSection(section.clientId, -1)}>
                    <ArrowUp className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" disabled={sIdx === sections.length - 1} onClick={() => moveSection(section.clientId, 1)}>
                    <ArrowDown className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => setDeleteTarget(section.clientId)}>
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </div>

                <CollapsibleContent>
                  <CardContent className="space-y-4 pt-0">
                    <div className="grid grid-cols-1 md:grid-cols-[1fr_180px_auto] gap-3 items-end">
                      <div>
                        <Label className="text-sm">Section title</Label>
                        <Input value={section.title} onChange={(e) => updateSection(section.clientId, { title: e.target.value })} />
                      </div>
                      <div>
                        <Label className="text-sm">Icon</Label>
                        <Select value={section.icon} onValueChange={(v) => updateSection(section.clientId, { icon: v })}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            {iconOptions.map((k) => (
                              <SelectItem key={k} value={k}>{k}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex items-center gap-2 pb-2">
                        <Switch
                          checked={section.enabled}
                          onCheckedChange={(v) => updateSection(section.clientId, { enabled: v })}
                        />
                        <Label className="text-sm">Visible</Label>
                      </div>
                    </div>

                    <div>
                      <Label className="text-sm">Key (URL anchor)</Label>
                      <Input
                        value={section.key}
                        onChange={(e) => updateSection(section.clientId, { key: e.target.value.replace(/[^a-z0-9-]/gi, '-').toLowerCase() })}
                      />
                    </div>

                    <div className="space-y-3">
                      {section.blocks.map((block, bIdx) => (
                        <div key={block.clientId} className="rounded-xl border border-slate-200 p-3 space-y-2">
                          <div className="flex items-center gap-2">
                            <Select
                              value={block.type}
                              onValueChange={(v) => updateBlock(section.clientId, block.clientId, { type: v as TripNoteBlockType })}
                            >
                              <SelectTrigger className="h-8 w-[190px]"><SelectValue /></SelectTrigger>
                              <SelectContent>
                                {BLOCK_TYPES.map((t) => (
                                  <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <div className="ml-auto flex items-center gap-1">
                              <Button variant="ghost" size="icon" disabled={bIdx === 0} onClick={() => moveBlock(section.clientId, block.clientId, -1)}>
                                <ArrowUp className="h-3.5 w-3.5" />
                              </Button>
                              <Button variant="ghost" size="icon" disabled={bIdx === section.blocks.length - 1} onClick={() => moveBlock(section.clientId, block.clientId, 1)}>
                                <ArrowDown className="h-3.5 w-3.5" />
                              </Button>
                              <Button variant="ghost" size="icon" onClick={() => removeBlock(section.clientId, block.clientId)}>
                                <Trash2 className="h-3.5 w-3.5 text-red-500" />
                              </Button>
                            </div>
                          </div>

                          {TEXT_TYPES.includes(block.type) && (
                            <div>
                              <Label className="text-xs text-muted-foreground">
                                {block.type === 'contact' ? 'Card title' : 'Text'}
                              </Label>
                              <Textarea
                                rows={block.type === 'subheading' || block.type === 'contact' ? 1 : 3}
                                value={block.text}
                                onChange={(e) => updateBlock(section.clientId, block.clientId, { text: e.target.value })}
                              />
                            </div>
                          )}

                          {LIST_TYPES.includes(block.type) && (
                            <div>
                              <Label className="text-xs text-muted-foreground">
                                {block.type === 'contact' ? 'Contact lines (one per line)' : 'List items (one per line)'}
                              </Label>
                              <Textarea
                                rows={4}
                                value={block.itemsText}
                                onChange={(e) => updateBlock(section.clientId, block.clientId, { itemsText: e.target.value })}
                              />
                            </div>
                          )}

                          {block.type === 'pricegrid' && (
                            <div>
                              <Label className="text-xs text-muted-foreground">Rows — one per line, "label | value"</Label>
                              <Textarea
                                rows={3}
                                placeholder={'15 days | $30 USD\n30 days | $50 USD'}
                                value={block.rowsText}
                                onChange={(e) => updateBlock(section.clientId, block.clientId, { rowsText: e.target.value })}
                              />
                            </div>
                          )}

                          {block.type === 'contact' && (
                            <div className="flex items-center gap-2">
                              <Switch
                                checked={block.tone === 'danger'}
                                onCheckedChange={(v) => updateBlock(section.clientId, block.clientId, { tone: v ? 'danger' : 'default' })}
                              />
                              <Label className="text-xs">Emergency styling (red)</Label>
                            </div>
                          )}
                        </div>
                      ))}
                      <Button variant="outline" size="sm" onClick={() => addBlock(section.clientId)} className="gap-1.5">
                        <Plus className="h-3.5 w-3.5" /> Add block
                      </Button>
                    </div>

                    <div className="pt-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="gap-1.5 text-muted-foreground"
                        onClick={() => resetSectionToDefault(section.clientId, section.key)}
                      >
                        <RotateCcw className="h-3.5 w-3.5" /> Reset this section to default
                      </Button>
                    </div>
                  </CardContent>
                </CollapsibleContent>
              </Collapsible>
            </Card>
          );
        })}

        <Button variant="outline" onClick={addSection} className="gap-1.5">
          <Plus className="h-4 w-4" /> Add section
        </Button>
      </div>

      <div className="sticky bottom-4 flex justify-end">
        <Button
          onClick={handleSave}
          disabled={saving}
          className="gap-2 shadow-lg"
          style={{ backgroundColor: 'var(--cms-primary)', color: 'var(--cms-primary-foreground)' }}
        >
          {saving ? <SequoiaLoader label="Saving" size="sm" mode="inline" /> : <><Save className="h-4 w-4" /> Save trip notes</>}
        </Button>
      </div>

      <ConfirmDialog
        open={resetOpen}
        onOpenChange={setResetOpen}
        title="Reset all trip notes?"
        description="This replaces every section with the standard default content. Unsaved edits will be lost. You still need to Save afterwards."
        confirmLabel="Reset"
        variant="destructive"
        onConfirm={() => { hydrate(DEFAULT_TRIP_NOTES); toast.success('Reset to defaults — remember to save'); }}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(v) => !v && setDeleteTarget(null)}
        title="Delete this section?"
        description="The section and all its blocks will be removed. You still need to Save afterwards."
        confirmLabel="Delete"
        variant="destructive"
        onConfirm={() => { if (deleteTarget) removeSection(deleteTarget); setDeleteTarget(null); }}
      />
    </div>
  );
}
