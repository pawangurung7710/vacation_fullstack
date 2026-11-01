import { useEffect, useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { Switch } from '../../components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { SequoiaLoader } from '../components/SequoiaLoader';
import { tripsApi, type AddOnRecord } from '../../services/api';

export interface AddOnFormValue {
  title: string;
  kind: 'comfort' | 'activity';
  description: string;
  image: string;
  pricingType: 'flat' | 'choice';
  price: string;
  priceUnit: string;
  options: Array<{ label: string; price: string; priceUnit: string }>;
  duration: string;
  activityType: 'Activity' | 'Experience' | 'Retreat' | 'Workshop';
  location: string;
  badges: string;
  discountEligible: boolean;
  scope: 'global' | 'trips';
  trips: string[];
  status: 'active' | 'inactive';
  order: string;
}

export const emptyAddOn: AddOnFormValue = {
  title: '',
  kind: 'comfort',
  description: '',
  image: '',
  pricingType: 'flat',
  price: '',
  priceUnit: 'per person',
  options: [],
  duration: '',
  activityType: 'Activity',
  location: '',
  badges: '',
  discountEligible: true,
  scope: 'global',
  trips: [],
  status: 'active',
  order: '0',
};

export const recordToForm = (r: AddOnRecord): AddOnFormValue => ({
  title: r.title || '',
  kind: r.kind || 'comfort',
  description: r.description || '',
  image: r.image || '',
  pricingType: r.pricingType || 'flat',
  price: r.price != null ? String(r.price) : '',
  priceUnit: r.priceUnit || 'per person',
  options: (r.options || []).map((o) => ({
    label: o.label || '',
    price: o.price != null ? String(o.price) : '',
    priceUnit: o.priceUnit || '/pp',
  })),
  duration: r.duration || '',
  activityType: r.activityType || 'Activity',
  location: r.location || '',
  badges: (r.badges || []).join(', '),
  discountEligible: r.discountEligible !== false,
  scope: r.scope || 'global',
  trips: (r.trips || []).map((t) => String(t)),
  status: r.status || 'active',
  order: r.order != null ? String(r.order) : '0',
});

export const formToPayload = (v: AddOnFormValue): Partial<AddOnRecord> => ({
  title: v.title.trim(),
  kind: v.kind,
  description: v.description.trim() || undefined,
  image: v.image.trim() || undefined,
  pricingType: v.pricingType,
  price: v.pricingType === 'flat' && v.price !== '' ? Number(v.price) : undefined,
  priceUnit: v.priceUnit.trim() || undefined,
  options:
    v.pricingType === 'choice'
      ? v.options
          .filter((o) => o.label.trim())
          .map((o) => ({ label: o.label.trim(), price: o.price !== '' ? Number(o.price) : 0, priceUnit: o.priceUnit.trim() || '/pp' }))
      : [],
  duration: v.duration.trim() || undefined,
  activityType: v.activityType,
  location: v.location.trim() || undefined,
  badges: v.badges.split(',').map((b) => b.trim()).filter(Boolean),
  discountEligible: v.discountEligible,
  scope: v.scope,
  trips: v.scope === 'trips' ? v.trips : [],
  status: v.status,
  order: Number(v.order) || 0,
});

export function AddOnForm({
  value,
  onChange,
  onSubmit,
  submitting,
  submitLabel,
  onCancel,
}: {
  value: AddOnFormValue;
  onChange: (next: AddOnFormValue) => void;
  onSubmit: () => void;
  submitting: boolean;
  submitLabel: string;
  onCancel: () => void;
}) {
  const [tripList, setTripList] = useState<Array<{ _id: string; title: string }>>([]);

  useEffect(() => {
    let active = true;
    tripsApi
      .getAll({ status: 'all', limit: 200, sort: 'title', order: 'asc' })
      .then((data) => {
        if (active) setTripList((data || []).map((t: any) => ({ _id: t._id || t.id, title: t.title })));
      })
      .catch(() => {});
    return () => { active = false; };
  }, []);

  const set = (patch: Partial<AddOnFormValue>) => onChange({ ...value, ...patch });

  const setOption = (idx: number, patch: Partial<AddOnFormValue['options'][number]>) =>
    set({ options: value.options.map((o, i) => (i === idx ? { ...o, ...patch } : o)) });

  return (
    <div className="space-y-4">
      <Card className="rounded-2xl border-slate-200/70 bg-white/90 shadow-sm">
        <CardHeader><CardTitle className="text-base">Details</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label>Title *</Label>
            <Input value={value.title} onChange={(e) => set({ title: e.target.value })} placeholder="Additional porterage allowance" />
          </div>
          <div>
            <Label>Kind *</Label>
            <Select value={value.kind} onValueChange={(v) => set({ kind: v as AddOnFormValue['kind'] })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="comfort">Comfort add-on / upgrade</SelectItem>
                <SelectItem value="activity">Activity</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="md:col-span-2">
            <Label>Description</Label>
            <Textarea rows={2} value={value.description} onChange={(e) => set({ description: e.target.value })} />
          </div>
          <div className="md:col-span-2">
            <Label>Image URL</Label>
            <Input value={value.image} onChange={(e) => set({ image: e.target.value })} placeholder="https://…" />
          </div>
          {value.kind === 'activity' && (
            <>
              <div>
                <Label>Activity type</Label>
                <Select value={value.activityType} onValueChange={(v) => set({ activityType: v as AddOnFormValue['activityType'] })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Activity">Activity</SelectItem>
                    <SelectItem value="Experience">Experience</SelectItem>
                    <SelectItem value="Retreat">Retreat</SelectItem>
                    <SelectItem value="Workshop">Workshop</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Duration</Label>
                <Input value={value.duration} onChange={(e) => set({ duration: e.target.value })} placeholder="1 day" />
              </div>
              <div>
                <Label>Location</Label>
                <Input value={value.location} onChange={(e) => set({ location: e.target.value })} placeholder="Region" />
              </div>
            </>
          )}
          <div className="md:col-span-2">
            <Label>Badges (comma separated)</Label>
            <Input value={value.badges} onChange={(e) => set({ badges: e.target.value })} placeholder="Small group, Guide led" />
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-2xl border-slate-200/70 bg-white/90 shadow-sm">
        <CardHeader><CardTitle className="text-base">Pricing</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Pricing type</Label>
              <Select value={value.pricingType} onValueChange={(v) => set({ pricingType: v as AddOnFormValue['pricingType'] })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="flat">Flat — single price</SelectItem>
                  <SelectItem value="choice">Choice — pick one option</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2 pt-6">
              <Switch checked={value.discountEligible} onCheckedChange={(v) => set({ discountEligible: v })} />
              <Label>Eligible for 10% multi add-on discount</Label>
            </div>
          </div>

          {value.pricingType === 'flat' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Price (per person, USD)</Label>
                <Input type="number" min="0" value={value.price} onChange={(e) => set({ price: e.target.value })} placeholder="45" />
              </div>
              <div>
                <Label>Price unit label</Label>
                <Input value={value.priceUnit} onChange={(e) => set({ priceUnit: e.target.value })} placeholder="per person" />
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <Label>Options</Label>
              {value.options.map((opt, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <Input className="flex-1" placeholder="3-star hotel" value={opt.label} onChange={(e) => setOption(idx, { label: e.target.value })} />
                  <Input className="w-28" type="number" min="0" placeholder="85" value={opt.price} onChange={(e) => setOption(idx, { price: e.target.value })} />
                  <Input className="w-24" placeholder="/pp" value={opt.priceUnit} onChange={(e) => setOption(idx, { priceUnit: e.target.value })} />
                  <Button variant="ghost" size="icon" onClick={() => set({ options: value.options.filter((_, i) => i !== idx) })}>
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              ))}
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5"
                onClick={() => set({ options: [...value.options, { label: '', price: '', priceUnit: '/pp' }] })}
              >
                <Plus className="h-3.5 w-3.5" /> Add option
              </Button>
              <p className="text-xs text-muted-foreground">
                Add a zero-price option (e.g. "No upgrade") so guests can opt out.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="rounded-2xl border-slate-200/70 bg-white/90 shadow-sm">
        <CardHeader><CardTitle className="text-base">Availability</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label>Offered on</Label>
              <Select value={value.scope} onValueChange={(v) => set({ scope: v as AddOnFormValue['scope'] })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="global">Every trip</SelectItem>
                  <SelectItem value="trips">Selected trips only</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Status</Label>
              <Select value={value.status} onValueChange={(v) => set({ status: v as AddOnFormValue['status'] })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Order</Label>
              <Input type="number" value={value.order} onChange={(e) => set({ order: e.target.value })} />
            </div>
          </div>

          {value.scope === 'trips' && (
            <div className="max-h-60 overflow-y-auto rounded-lg border border-slate-200 p-3 space-y-1.5">
              {tripList.length === 0 && <p className="text-sm text-muted-foreground">Loading trips…</p>}
              {tripList.map((t) => {
                const checked = value.trips.includes(t._id);
                return (
                  <label key={t._id} className="flex items-center gap-2 text-sm cursor-pointer">
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={(e) =>
                        set({
                          trips: e.target.checked
                            ? [...value.trips, t._id]
                            : value.trips.filter((x) => x !== t._id),
                        })
                      }
                    />
                    {t.title}
                  </label>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex items-center justify-end gap-3">
        <Button variant="outline" type="button" onClick={onCancel}>Cancel</Button>
        <Button
          onClick={onSubmit}
          disabled={submitting || !value.title.trim()}
          style={{ backgroundColor: 'var(--cms-primary)', color: 'var(--cms-primary-foreground)' }}
        >
          {submitting ? <SequoiaLoader label="Saving" size="sm" mode="inline" /> : submitLabel}
        </Button>
      </div>
    </div>
  );
}
