import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { Switch } from '../../components/ui/switch';
import { Input } from '../../components/ui/input';
import { Button } from '../../components/ui/button';
import { settingsApi } from '../../services/api';
import { toast } from 'sonner';
import { Plus, Trash2 } from 'lucide-react';

interface EmbedRow {
  clientId: string;
  url: string;
}

const createRow = (url = ''): EmbedRow => ({
  clientId: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
  url,
});

export function MaintenanceModePage() {
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [embeds, setEmbeds] = useState<EmbedRow[]>([]);
  const [savingEmbeds, setSavingEmbeds] = useState(false);

  useEffect(() => {
    let isMounted = true;

    settingsApi
      .get()
      .then((data) => {
        if (!isMounted) return;
        setMaintenanceMode(!!data.maintenanceMode);
        const urls = data.instagramEmbeds || [];
        setEmbeds(urls.length ? urls.map((url) => createRow(url)) : [createRow()]);
      })
      .catch(() => {
        toast.error('Failed to load maintenance mode status');
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const handleToggle = async (checked: boolean) => {
    const previous = maintenanceMode;
    setMaintenanceMode(checked);
    setSaving(true);
    try {
      await settingsApi.updateMaintenanceMode(checked);
      toast.success(checked ? 'Maintenance mode enabled' : 'Maintenance mode disabled');
    } catch (error) {
      setMaintenanceMode(previous);
      toast.error('Failed to update maintenance mode');
    } finally {
      setSaving(false);
    }
  };

  const handleEmbedChange = (clientId: string, url: string) => {
    setEmbeds((prev) => prev.map((row) => (row.clientId === clientId ? { ...row, url } : row)));
  };

  const handleAddEmbed = () => {
    setEmbeds((prev) => [...prev, createRow()]);
  };

  const handleRemoveEmbed = (clientId: string) => {
    setEmbeds((prev) => prev.filter((row) => row.clientId !== clientId));
  };

  const handleSaveEmbeds = async () => {
    const urls = embeds.map((row) => row.url.trim()).filter(Boolean);
    setSavingEmbeds(true);
    try {
      await settingsApi.updateInstagramEmbeds(urls);
      setEmbeds(urls.length ? urls.map((url) => createRow(url)) : [createRow()]);
      toast.success('Instagram posts updated');
    } catch (error) {
      toast.error('Failed to update Instagram posts');
    } finally {
      setSavingEmbeds(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="relative overflow-hidden rounded-3xl border border-slate-200/70 bg-[linear-gradient(135deg,_rgba(255,255,255,0.9)_0%,_rgba(246,248,252,0.95)_55%,_rgba(240,247,255,0.9)_100%)] p-6 shadow-[0_20px_50px_rgba(15,23,42,0.08)]">
        <div className="absolute inset-x-0 top-0 h-1 bg-[linear-gradient(90deg,_var(--cms-primary),_rgba(255,255,255,0.2))]" />
        <p className="text-xs uppercase tracking-[0.2em] text-[var(--cms-muted-foreground)]">Site settings</p>
        <h2 className="text-2xl font-semibold text-slate-900">Maintenance Mode</h2>
        <p className="text-sm text-[var(--cms-muted-foreground)] mt-1">
          Temporarily take the public site offline while you make changes.
        </p>
      </div>

      <Card className="rounded-3xl border-slate-200/70 bg-white/95 shadow-[0_20px_50px_rgba(15,23,42,0.08)]">
        <CardHeader>
          <CardTitle>Public site status</CardTitle>
          <CardDescription>
            When enabled, visitors see a "Site is under maintenance" message with contact details instead of the
            normal site. The CMS stays accessible so you can switch it back off.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between rounded-2xl border border-slate-200/70 bg-slate-50/80 p-4">
            <div>
              <p className="text-sm font-medium text-slate-900">
                {loading ? 'Loading…' : maintenanceMode ? 'Maintenance mode is ON' : 'Maintenance mode is OFF'}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {maintenanceMode
                  ? 'The public site is currently showing the maintenance page.'
                  : 'The public site is live and accessible to visitors.'}
              </p>
            </div>
            <Switch checked={maintenanceMode} disabled={loading || saving} onCheckedChange={handleToggle} />
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-3xl border-slate-200/70 bg-white/95 shadow-[0_20px_50px_rgba(15,23,42,0.08)]">
        <CardHeader>
          <CardTitle>Featured Instagram posts</CardTitle>
          <CardDescription>
            Paste the link to any Instagram post (e.g. https://www.instagram.com/p/XXXXXXX/) to feature it on the
            maintenance page — pasting the full embed code Instagram gives you also works, the link is extracted
            automatically. Add as many as you like.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {embeds.map((row) => (
              <div key={row.clientId} className="flex items-center gap-2">
                <Input
                  value={row.url}
                  placeholder="https://www.instagram.com/p/XXXXXXX/"
                  className="border-slate-200/70 bg-white/95 focus-visible:ring-[var(--cms-primary)] focus-visible:border-[var(--cms-primary)]"
                  onChange={(event) => handleEmbedChange(row.clientId, event.target.value)}
                  disabled={loading || savingEmbeds}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => handleRemoveEmbed(row.clientId)}
                  disabled={loading || savingEmbeds}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between mt-4">
            <Button type="button" variant="outline" onClick={handleAddEmbed} disabled={loading || savingEmbeds}>
              <Plus className="mr-2 h-4 w-4" />
              Add post
            </Button>
            <Button
              type="button"
              onClick={handleSaveEmbeds}
              disabled={loading || savingEmbeds}
              className="bg-[var(--cms-primary)] text-[var(--cms-primary-foreground)] hover:bg-[var(--cms-primary-hover)]"
            >
              {savingEmbeds ? 'Saving...' : 'Save Posts'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
