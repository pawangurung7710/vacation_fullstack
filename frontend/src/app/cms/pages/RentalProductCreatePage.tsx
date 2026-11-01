import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';
import { Switch } from '../../components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { SequoiaLoader } from '../components/SequoiaLoader';
import { CmsBreadcrumbs } from '../layout/Breadcrumbs';
import { RentalImagesManager } from '../components/RentalImagesManager';
import { rentalCategoriesApi, rentalProductsApi } from '../../services/api';
import { toast } from 'sonner';
import { Plus, Trash2 } from 'lucide-react';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '../../components/ui/form';
import { rentalProductFormSchema, RentalProductFormValues } from '../utils/rentalProductSchemas';

interface CategoryOption {
  _id: string;
  label: string;
}

export function RentalProductCreatePage() {
  const navigate = useNavigate();
  const [isSaving, setIsSaving] = useState(false);
  const [categories, setCategories] = useState<CategoryOption[]>([]);

  useEffect(() => {
    rentalCategoriesApi.getAll().then(setCategories).catch(() => toast.error('Failed to load categories'));
  }, []);

  const form = useForm<RentalProductFormValues>({
    resolver: zodResolver(rentalProductFormSchema),
    defaultValues: {
      title: '',
      slug: '',
      category: '',
      description: '',
      shortDescription: '',
      pricePerDay: undefined,
      depositAmount: 0,
      quantityTotal: undefined,
      sku: '',
      minRentalDays: 1,
      featured: false,
      status: 'draft',
      specifications: [],
      images: [],
    },
  });

  const { fields, append, remove } = useFieldArray({ control: form.control, name: 'specifications' });
  const images = form.watch('images');

  const handleSave = async (values: RentalProductFormValues, status: 'draft' | 'published') => {
    setIsSaving(true);
    try {
      await rentalProductsApi.create({ ...values, status });
      toast.success(status === 'published' ? 'Rental product published' : 'Draft saved');
      navigate('/cms/rentals');
    } catch (error: any) {
      toast.error(error?.message || 'Failed to create rental product');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="px-6 py-4 space-y-4">
      <CmsBreadcrumbs />
      <Card className="rounded-2xl border-slate-200/70 bg-white/90 shadow-sm">
        <CardHeader>
          <CardTitle>Create Rental Product</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <Form {...form}>
            <form className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title *</FormLabel>
                      <FormControl>
                        <Input placeholder="Mountain Bike" {...field} />
                      </FormControl>
                      <FormMessage className="min-h-[1.1rem]">{' '}</FormMessage>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="slug"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Slug *</FormLabel>
                      <FormControl>
                        <Input placeholder="mountain-bike" {...field} value={field.value || ''} />
                      </FormControl>
                      <FormMessage className="min-h-[1.1rem]">{' '}</FormMessage>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category *</FormLabel>
                      <Select value={field.value} onValueChange={field.onChange}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {categories.map((c) => (
                            <SelectItem key={c._id} value={c._id}>
                              {c.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage className="min-h-[1.1rem]">{' '}</FormMessage>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="sku"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>SKU</FormLabel>
                      <FormControl>
                        <Input placeholder="BIKE-MTN-001" {...field} value={field.value || ''} />
                      </FormControl>
                      <FormMessage className="min-h-[1.1rem]">{' '}</FormMessage>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="shortDescription"
                  render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel>Short Description</FormLabel>
                      <FormControl>
                        <Input placeholder="Full-suspension bike for trails." {...field} value={field.value || ''} />
                      </FormControl>
                      <FormMessage className="min-h-[1.1rem]">{' '}</FormMessage>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea rows={4} {...field} value={field.value || ''} />
                      </FormControl>
                      <FormMessage className="min-h-[1.1rem]">{' '}</FormMessage>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="pricePerDay"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Price per day ($) *</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value)} />
                      </FormControl>
                      <FormMessage className="min-h-[1.1rem]">{' '}</FormMessage>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="depositAmount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Deposit ($)</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} value={field.value ?? 0} onChange={(e) => field.onChange(e.target.value)} />
                      </FormControl>
                      <FormMessage className="min-h-[1.1rem]">{' '}</FormMessage>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="quantityTotal"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Quantity in fleet *</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value)} />
                      </FormControl>
                      <FormMessage className="min-h-[1.1rem]">{' '}</FormMessage>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="minRentalDays"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Minimum rental days</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} value={field.value ?? 1} onChange={(e) => field.onChange(e.target.value)} />
                      </FormControl>
                      <FormMessage className="min-h-[1.1rem]">{' '}</FormMessage>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="featured"
                  render={({ field }) => (
                    <FormItem className="flex items-center gap-3 pt-7">
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                      <FormLabel>Featured</FormLabel>
                    </FormItem>
                  )}
                />
              </div>

              <div className="border-t border-slate-200/70 pt-4">
                <RentalImagesManager images={images} onChange={(next) => form.setValue('images', next, { shouldDirty: true })} />
              </div>

              <div className="border-t border-slate-200/70 pt-4 space-y-3">
                <div className="flex items-center justify-between">
                  <FormLabel className="text-sm font-medium">Specifications</FormLabel>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="border-[var(--cms-border)]"
                    onClick={() => append({ label: '', value: '' })}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Add spec
                  </Button>
                </div>
                {fields.length === 0 ? (
                  <p className="text-xs text-muted-foreground">e.g. "Weight: 1.2kg", "Frame: Aluminum"</p>
                ) : (
                  fields.map((item, index) => (
                    <div key={item.id} className="flex items-center gap-2">
                      <FormField
                        control={form.control}
                        name={`specifications.${index}.label`}
                        render={({ field }) => <Input placeholder="Label" {...field} className="border-[var(--cms-border)]" />}
                      />
                      <FormField
                        control={form.control}
                        name={`specifications.${index}.value`}
                        render={({ field }) => <Input placeholder="Value" {...field} className="border-[var(--cms-border)]" />}
                      />
                      <Button type="button" variant="ghost" size="sm" onClick={() => remove(index)}>
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  ))
                )}
              </div>

              <div className="flex items-center justify-end gap-3 border-t border-slate-200/70 pt-4">
                <Button variant="outline" type="button" onClick={() => navigate('/cms/rentals')}>
                  Cancel
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  disabled={isSaving}
                  className="border-[var(--cms-border)]"
                  onClick={form.handleSubmit((values) => handleSave(values, 'draft'))}
                >
                  {isSaving ? <SequoiaLoader label="Saving" size="sm" mode="inline" /> : 'Save as Draft'}
                </Button>
                <Button
                  type="button"
                  disabled={isSaving}
                  style={{ backgroundColor: 'var(--cms-primary)', color: 'var(--cms-primary-foreground)' }}
                  onClick={form.handleSubmit((values) => handleSave(values, 'published'))}
                >
                  {isSaving ? <SequoiaLoader label="Saving" size="sm" mode="inline" /> : 'Publish'}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
