import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';
import { Switch } from '../../components/ui/switch';
import { SequoiaLoader } from '../components/SequoiaLoader';
import { CmsBreadcrumbs } from '../layout/Breadcrumbs';
import { rentalCategoriesApi } from '../../services/api';
import { toast } from 'sonner';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '../../components/ui/form';
import { rentalCategoryFormSchema, RentalCategoryFormValues } from '../utils/rentalCategorySchemas';

export function RentalCategoryCreatePage() {
  const navigate = useNavigate();
  const [isCreating, setIsCreating] = useState(false);
  const form = useForm<RentalCategoryFormValues>({
    resolver: zodResolver(rentalCategoryFormSchema),
    defaultValues: {
      label: '',
      slug: '',
      description: '',
      imageUrl: '',
      order: 0,
      isActive: true,
    },
  });

  const handleCreate = async (values: RentalCategoryFormValues) => {
    setIsCreating(true);
    try {
      const existingCategories = await rentalCategoriesApi.getAll();
      const slugExists = existingCategories.some((cat: any) => cat.slug === values.slug);

      if (slugExists) {
        form.setError('slug', {
          type: 'manual',
          message: 'This slug is already in use. Please choose a different one.',
        });
        setIsCreating(false);
        return;
      }

      await rentalCategoriesApi.create(values);
      toast.success('Rental category created');
      navigate('/cms/rentals/categories');
    } catch (error: any) {
      if (error?.message?.includes('duplicate') || error?.message?.includes('slug')) {
        toast.error('This slug is already in use');
        form.setError('slug', {
          type: 'manual',
          message: 'This slug is already in use. Please choose a different one.',
        });
      } else {
        toast.error('Failed to create rental category');
      }
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="px-6 py-4 space-y-4">
      <CmsBreadcrumbs />
      <Card className="rounded-2xl border-slate-200/70 bg-white/90 shadow-sm">
        <CardHeader>
          <CardTitle>Create Rental Category</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleCreate)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="label"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Label *</FormLabel>
                      <FormControl>
                        <Input placeholder="Bikes" {...field} />
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
                        <Input placeholder="bikes" {...field} value={field.value || ''} />
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
                        <Textarea
                          placeholder="Mountain, road, and electric bikes."
                          {...field}
                          value={field.value || ''}
                          rows={3}
                        />
                      </FormControl>
                      <FormMessage className="min-h-[1.1rem]">{' '}</FormMessage>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="imageUrl"
                  render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel>Image URL</FormLabel>
                      <FormControl>
                        <Input placeholder="https://images..." {...field} value={field.value || ''} />
                      </FormControl>
                      <FormMessage className="min-h-[1.1rem]">{' '}</FormMessage>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="order"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Order</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          {...field}
                          value={field.value ?? 0}
                          onChange={(event) => field.onChange(event.target.value)}
                        />
                      </FormControl>
                      <FormMessage className="min-h-[1.1rem]">{' '}</FormMessage>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="isActive"
                  render={({ field }) => (
                    <FormItem className="flex items-center gap-3 pt-7">
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                      <FormLabel>Active</FormLabel>
                    </FormItem>
                  )}
                />
              </div>
              <div className="flex items-center justify-end gap-3">
                <Button variant="outline" type="button" onClick={() => navigate('/cms/rentals/categories')}>
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isCreating}
                  style={{ backgroundColor: 'var(--cms-primary)', color: 'var(--cms-primary-foreground)' }}
                >
                  {isCreating ? <SequoiaLoader label="Saving" size="sm" mode="inline" /> : 'Create Category'}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
