import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Skeleton } from '../../components/ui/skeleton';
import { Switch } from '../../components/ui/switch';
import { SequoiaLoader } from '../components/SequoiaLoader';
import { ApiError, regionsApi } from '../../services/api';
import { toast } from 'sonner';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '../../components/ui/form';
import { regionFormSchema, RegionFormValues } from '../utils/regionSchemas';

export function TripRegionEditPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isSaving, setIsSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  const form = useForm<RegionFormValues>({
    resolver: zodResolver(regionFormSchema),
    defaultValues: {
      name: '',
      isActive: true,
    },
  });

  useEffect(() => {
    const loadRegion = async () => {
      if (!id) {
        navigate('/cms/trips/regions');
        return;
      }
      try {
        const region = await regionsApi.getById(id);
        form.reset({
          name: region.name || '',
          isActive: region.isActive ?? true,
        });
      } catch (error) {
        toast.error('Region not found');
        navigate('/cms/trips/regions');
      } finally {
        setLoading(false);
      }
    };

    loadRegion();
  }, [id, navigate, form]);

  const handleUpdate = async (values: RegionFormValues) => {
    if (!id) return;
    setIsSaving(true);
    try {
      await regionsApi.update(id, values);
      toast.success('Region updated');
      navigate('/cms/trips/regions');
    } catch (error) {
      const message =
        error instanceof ApiError ? error.message : 'Failed to update region';
      if (message.toLowerCase().includes('already exists')) {
        form.setError('name', { message: 'That region name already exists.' });
      }
      toast.error(message);
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="px-6 py-4 space-y-4">
        <Skeleton className="h-64 w-full rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="px-6 py-4 space-y-4">
      <Card className="rounded-2xl border-slate-200/70 bg-white/90 shadow-sm">
        <CardHeader>
          <CardTitle>Edit Region</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleUpdate)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name *</FormLabel>
                      <FormControl>
                        <Input placeholder="Lofoten" {...field} />
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
                <Button variant="outline" type="button" onClick={() => navigate('/cms/trips/regions')}>
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSaving}
                  style={{ backgroundColor: 'var(--cms-primary)', color: 'var(--cms-primary-foreground)' }}
                >
                  {isSaving ? <SequoiaLoader label="Saving" size="sm" mode="inline" /> : 'Save changes'}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
