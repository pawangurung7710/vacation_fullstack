import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';
import { Switch } from '../../components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { SequoiaLoader } from '../components/SequoiaLoader';
import { CmsBreadcrumbs } from '../layout/Breadcrumbs';
import { categoriesApi } from '../../services/api';
import { toast } from 'sonner';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '../../components/ui/form';
import { subcategoryFormSchema, SubcategoryFormValues } from '../utils/categorySchemas';

interface Category {
  _id: string;
  label: string;
}

export function TripSubcategoryCreatePage() {
  const navigate = useNavigate();
  const [parents, setParents] = useState<Category[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const form = useForm<SubcategoryFormValues>({
    resolver: zodResolver(subcategoryFormSchema),
    defaultValues: {
      label: '',
      slug: '',
      tagline: '',
      subtitle: '',
      description: '',
      imageUrl: '',
      heroImage: '',
      order: 0,
      isActive: true,
      parent: '',
    },
  });

  useEffect(() => {
    const loadParents = async () => {
      try {
        const data = await categoriesApi.getAll({ level: 0 });
        setParents(data);
        if (!form.getValues('parent') && data.length > 0) {
          form.setValue('parent', data[0]._id);
        }
      } catch (error) {
        toast.error('Failed to load parent categories');
      }
    };
    loadParents();
  }, [form]);

  const handleCreate = async (values: SubcategoryFormValues) => {
    setIsCreating(true);
    try {
      // Check if slug already exists (using level: 1 for subcategories)
      const existingSubcategories = await categoriesApi.getAll({ level: 1, isActive: true });
      const slugExists = existingSubcategories.some(
        (sub: any) => sub.slug === values.slug
      );
      
      if (slugExists) {
        form.setError('slug', {
          type: 'manual',
          message: 'This slug is already in use. Please choose a different one.',
        });
        setIsCreating(false);
        return;
      }

      await categoriesApi.create({
        ...values,
        level: 1,
      });
      toast.success('Subcategory created');
      navigate('/cms/trips/subcategories');
    } catch (error: any) {
      if (error?.message?.includes('duplicate') || error?.message?.includes('slug')) {
        toast.error('This slug is already in use');
        form.setError('slug', {
          type: 'manual',
          message: 'This slug is already in use. Please choose a different one.',
        });
      } else {
        toast.error('Failed to create subcategory');
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
          <CardTitle>Create Subcategory</CardTitle>
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
                        <Input placeholder="Trekking" {...field} />
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
                        <Input placeholder="trekking" {...field} value={field.value || ''} />
                      </FormControl>
                      <FormMessage className="min-h-[1.1rem]">{' '}</FormMessage>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="parent"
                  render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel>Parent Category *</FormLabel>
                      <FormControl>
                        <Select value={field.value} onValueChange={field.onChange}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a parent category" />
                          </SelectTrigger>
                          <SelectContent>
                            {parents.map((parent) => (
                              <SelectItem key={parent._id} value={parent._id}>
                                {parent.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage className="min-h-[1.1rem]">{' '}</FormMessage>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="tagline"
                  render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel>Tagline</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Multi-day mountain expeditions"
                          {...field}
                          value={field.value || ''}
                        />
                      </FormControl>
                      <FormMessage className="min-h-[1.1rem]">{' '}</FormMessage>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="subtitle"
                  render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel>Subtitle</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="A subtitle for the subcategory"
                          {...field}
                          value={field.value || ''}
                        />
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
                          placeholder="A detailed description of the subcategory"
                          {...field}
                          value={field.value || ''}
                          rows={4}
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
                  name="heroImage"
                  render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel>Hero Image URL</FormLabel>
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
                <Button variant="outline" type="button" onClick={() => navigate('/cms/trips/subcategories')}>
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isCreating}
                  style={{ backgroundColor: 'var(--cms-primary)', color: 'var(--cms-primary-foreground)' }}
                >
                  {isCreating ? <SequoiaLoader label="Saving" size="sm" mode="inline" /> : 'Create Subcategory'}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
