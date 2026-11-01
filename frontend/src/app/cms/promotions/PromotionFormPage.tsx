import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { Checkbox } from '../../components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';
import { promotionsApi, tripsApi } from '../../services/api';
import { toast } from 'sonner';

interface FormValues {
  title: string;
  code: string;
  description: string;
  type: 'global' | 'trip';
  trip?: string;
  discountType: 'percentage' | 'fixed';
  discountValue: string;
  isActive: boolean;
  validFrom: string;
  validUntil: string;
}

interface TripOption {
  _id: string;
  title: string;
}

export function PromotionFormPage() {
  const { id } = useParams<{ id?: string }>();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const [formValues, setFormValues] = useState<FormValues>({
    title: '',
    code: '',
    description: '',
    type: 'global',
    trip: undefined,
    discountType: 'percentage',
    discountValue: '10',
    isActive: true,
    validFrom: '',
    validUntil: '',
  });
  const [trips, setTrips] = useState<TripOption[]>([]);
  const [loading, setLoading] = useState(isEdit);
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const actionLabel = isEdit ? 'Update Promotion' : 'Create Promotion';

  useEffect(() => {
    const loadTrips = async () => {
      try {
        const data = await tripsApi.getAll({ status: 'published', limit: 200 });
        setTrips(data || []);
      } catch (error: any) {
        toast.error(error?.message || 'Failed to load trips');
      }
    };
    loadTrips();
  }, []);

  useEffect(() => {
    if (!id) {
      setLoading(false);
      return;
    }
    const loadPromotion = async () => {
      setLoading(true);
      try {
        const data = await promotionsApi.getById(id);
        setFormValues({
          title: data.title || '',
          code: data.code || '',
          description: data.description || '',
          type: data.type || 'global',
          trip: data.trip?._id,
          discountType: data.discountType || 'percentage',
          discountValue: data.discountValue !== undefined ? String(data.discountValue) : '0',
          isActive: data.isActive ?? true,
          validFrom: data.validFrom ? new Date(data.validFrom).toISOString().split('T')[0] : '',
          validUntil: data.validUntil ? new Date(data.validUntil).toISOString().split('T')[0] : '',
        });
      } catch (error: any) {
        toast.error(error?.message || 'Failed to load promotion');
      } finally {
        setLoading(false);
      }
    };
    loadPromotion();
  }, [id]);

  const isTripPromo = formValues.type === 'trip';

  const handleChange = (field: keyof FormValues, value: any) => {
    setFormValues((prev) => ({
      ...prev,
      [field]: value,
    }));
    setErrors((prev) => {
      if (prev[field]) {
        const next = { ...prev };
        delete next[field];
        return next;
      }
      return prev;
    });
  };

  const handleGenerateCode = () => {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    const length = 8;
    let code = '';
    for (let i = 0; i < length; i += 1) {
      code += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    setFormValues((prev) => ({
      ...prev,
      code,
    }));
  };

  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }
    setIsSaving(true);
    try {
      const payload: any = {
        title: formValues.title.trim(),
        code: formValues.code.trim().toUpperCase(),
        description: formValues.description.trim() || undefined,
        type: formValues.type,
        discountType: formValues.discountType,
        discountValue: Number(formValues.discountValue),
        isActive: formValues.isActive,
        validFrom: formValues.validFrom || undefined,
        validUntil: formValues.validUntil || undefined,
      };
      if (isTripPromo) {
        payload.trip = formValues.trip;
      }
      if (isEdit && id) {
        await promotionsApi.update(id, payload);
        toast.success('Promotion updated');
      } else {
        await promotionsApi.create(payload);
        toast.success('Promotion created');
      }
      setErrors({});
      navigate('/cms/promotions');
    } catch (error: any) {
      if (Array.isArray(error?.errors)) {
        const nextErrors = { ...errors };
        error.errors.forEach((err: any) => {
          const key = err.field?.split('.')[2] || err.field?.split('.').pop();
          if (key) {
            nextErrors[key] = err.message;
          }
        });
        setErrors(nextErrors);
      }
      toast.error(error?.message || 'Failed to save promotion');
    } finally {
      setIsSaving(false);
    }
  };

  const baseInputClass =
    'border-slate-200/80 focus-visible:border-[var(--cms-primary)] focus-visible:ring-[var(--cms-primary)]';

  const errorClass =
    'border-red-500 focus-visible:border-red-500 focus-visible:ring-red-500/40';

  const triggerClass = (field: string) =>
    `${baseInputClass} ${errors[field] ? errorClass : ''}`;

  const validateForm = () => {
    const nextErrors: Record<string, string> = {};
    if (!formValues.title.trim()) {
      nextErrors.title = 'Title is required.';
    }
    if (!formValues.code.trim()) {
      nextErrors.code = 'Promo code is required.';
    }
    const discountNumber = Number(formValues.discountValue);
    if (
      !formValues.discountValue.trim() ||
      Number.isNaN(discountNumber) ||
      discountNumber <= 0
    ) {
      nextErrors.discountValue = 'Enter a positive discount value.';
    }
    if (isTripPromo && !formValues.trip) {
      nextErrors.trip = 'Select a trip for trip-level promotions.';
    }
    if (formValues.validFrom) {
      const from = new Date(formValues.validFrom);
      if (Number.isNaN(from.getTime())) {
        nextErrors.validFrom = 'Valid from must be a real date.';
      }
    }
    if (formValues.validUntil) {
      const until = new Date(formValues.validUntil);
      if (Number.isNaN(until.getTime())) {
        nextErrors.validUntil = 'Valid until must be a real date.';
      }
    }
    if (formValues.validFrom && formValues.validUntil) {
      const from = new Date(formValues.validFrom);
      const until = new Date(formValues.validUntil);
      if (!Number.isNaN(from.getTime()) && !Number.isNaN(until.getTime()) && from > until) {
        nextErrors.validUntil = 'Valid until must come after valid from.';
      }
    }
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  return (
    <div className="px-6 py-4 space-y-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-[var(--cms-foreground)]">
            {isEdit ? 'Edit Promotion' : 'New Promotion'}
          </h1>
          <p className="text-sm text-[var(--cms-muted-foreground)]">
            Configure global or trip-specific promo codes for the booking flow.
          </p>
        </div>
        <Button
          variant="ghost"
          className="text-sm text-[var(--cms-foreground)] border border-[var(--cms-border)]"
          onClick={() => navigate('/cms/promotions')}
        >
          Back to promotions
        </Button>
      </div>

      <Card className="glass-card">
        <CardHeader>
          <CardTitle>{actionLabel}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {loading ? (
            <div className="flex h-32 items-center justify-center border border-dashed border-[var(--cms-border)] rounded-lg">
              <p className="text-sm text-[var(--cms-muted-foreground)]">Loading promotion details…</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Title</Label>
                  <Input
                    className={`${baseInputClass} ${errors.title ? errorClass : ''}`}
                    placeholder="Enter promotion title"
                    value={formValues.title}
                    onChange={(event) => handleChange('title', event.target.value)}
                  />
                  {errors.title && (
                    <p className="text-xs text-red-500">{errors.title}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label className="flex items-center justify-between gap-2">
                    Promo Code
                    <button
                      type="button"
                      onClick={() => handleGenerateCode()}
                      className="text-xs font-semibold text-[var(--cms-primary)]"
                    >
                      Generate
                    </button>
                  </Label>
                  <Input
                    className={`${baseInputClass} ${errors.code ? errorClass : ''}`}
                    placeholder="E.g. TREKKERSGLOBE"
                    value={formValues.code}
                    onChange={(event) => handleChange('code', event.target.value.toUpperCase())}
                  />
                  {errors.code && (
                    <p className="text-xs text-red-500">{errors.code}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label>Type</Label>
                  <Select
                    value={formValues.type}
                    onValueChange={(value) => {
                      handleChange('type', value as FormValues['type']);
                      if (value !== 'trip') {
                        handleChange('trip', undefined);
                      }
                    }}
                  >
                    <SelectTrigger className={triggerClass('type')}>
                      <SelectValue placeholder="Select scope" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="global">Global</SelectItem>
                      <SelectItem value="trip">Trip level</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {isTripPromo && (
                  <div className="space-y-2">
                    <Label>Trip</Label>
                    <Select
                      value={formValues.trip || 'none'}
                      onValueChange={(value) => handleChange('trip', value === 'none' ? undefined : value)}
                    >
                      <SelectTrigger className={triggerClass('trip')}>
                        <SelectValue placeholder="Select trip" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">Unassigned</SelectItem>
                        {trips.map((trip) => (
                          <SelectItem key={trip._id} value={trip._id}>
                            {trip.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.trip && (
                      <p className="text-xs text-red-500">{errors.trip}</p>
                    )}
                  </div>
                )}

                <div className="space-y-2">
                  <Label>Discount Type</Label>
                  <Select
                    value={formValues.discountType}
                    onValueChange={(value) => handleChange('discountType', value as FormValues['discountType'])}
                  >
                    <SelectTrigger className={triggerClass('discountType')}>
                      <SelectValue placeholder="Choose discount type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="percentage">Percentage</SelectItem>
                      <SelectItem value="fixed">Fixed Amount</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label>Discount Value</Label>
                  <Input
                    className={`${baseInputClass} ${errors.discountValue ? errorClass : ''}`}
                    type="number"
                    min={0}
                    step="0.1"
                    placeholder={formValues.discountType === 'percentage' ? 'e.g. 15' : 'e.g. 150'}
                    value={formValues.discountValue}
                    onChange={(event) => handleChange('discountValue', event.target.value)}
                  />
                  {errors.discountValue && (
                    <p className="text-xs text-red-500">{errors.discountValue}</p>
                  )}
                  {formValues.discountType === 'percentage' ? (
                    <p className="text-xs text-[var(--cms-muted-foreground)]">
                      Percentage values are capped at 100.
                    </p>
                  ) : (
                    <p className="text-xs text-[var(--cms-muted-foreground)]">
                      Fixed amounts are applied in USD.
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-2 border border-slate-200/60 rounded-2xl bg-slate-50/60 p-4 shadow-sm">
                  <Label>Description</Label>
                  <Textarea
                    className="border-slate-200/60 focus-visible:border-[var(--cms-primary)] focus-visible:ring-[var(--cms-primary)]"
                    placeholder="Optional description"
                    value={formValues.description}
                    onChange={(event) => handleChange('description', event.target.value)}
                    rows={6}
                  />
                </div>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Valid From</Label>
                  <Input
                    className={`${baseInputClass} ${errors.validFrom ? errorClass : ''}`}
                    type="date"
                    value={formValues.validFrom}
                    onChange={(event) => handleChange('validFrom', event.target.value)}
                  />
                  {errors.validFrom && (
                    <p className="text-xs text-red-500">{errors.validFrom}</p>
                  )}
                  </div>
                  <div className="space-y-2">
                    <Label>Valid Until</Label>
                  <Input
                    className={`${baseInputClass} ${errors.validUntil ? errorClass : ''}`}
                    type="date"
                    value={formValues.validUntil}
                    onChange={(event) => handleChange('validUntil', event.target.value)}
                  />
                  {errors.validUntil && (
                    <p className="text-xs text-red-500">{errors.validUntil}</p>
                  )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox
                    checked={formValues.isActive}
                    onCheckedChange={(checked) => handleChange('isActive', Boolean(checked))}
                  />
                  <span className="text-sm text-[var(--cms-muted-foreground)]">
                    Activate promotion
                  </span>
                </div>
              </div>
            </div>
          )}

          <div className="flex flex-wrap gap-3">
            <Button
              style={{ backgroundColor: 'var(--cms-primary)', color: 'var(--cms-primary-foreground)' }}
              onClick={handleSave}
              disabled={isSaving}
            >
              {isSaving ? (isEdit ? 'Updating…' : 'Creating…') : isEdit ? 'Update promo' : 'Create promo'}
            </Button>
            <Button variant="outline" onClick={() => navigate('/cms/promotions')}>
              Cancel
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
