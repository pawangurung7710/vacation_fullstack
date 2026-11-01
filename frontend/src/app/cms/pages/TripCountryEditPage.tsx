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
import { ApiError, countriesApi } from '../../services/api';
import { toast } from 'sonner';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '../../components/ui/form';
import { countryFormSchema, CountryFormValues } from '../utils/countrySchemas';

export function TripCountryEditPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isSaving, setIsSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  const form = useForm<CountryFormValues>({
    resolver: zodResolver(countryFormSchema),
    defaultValues: {
      name: '',
      isActive: true,
    },
  });

  useEffect(() => {
    const loadCountry = async () => {
      if (!id) {
        navigate('/cms/trips/countries');
        return;
      }
      try {
        const country = await countriesApi.getById(id);
        form.reset({
          name: country.name || '',
          isActive: country.isActive ?? true,
        });
      } catch (error) {
        toast.error('Country not found');
        navigate('/cms/trips/countries');
      } finally {
        setLoading(false);
      }
    };

    loadCountry();
  }, [id, navigate, form]);

  const handleUpdate = async (values: CountryFormValues) => {
    if (!id) return;
    setIsSaving(true);
    try {
      await countriesApi.update(id, values);
      toast.success('Country updated');
      navigate('/cms/trips/countries');
    } catch (error) {
      const message =
        error instanceof ApiError ? error.message : 'Failed to update country';
      if (message.toLowerCase().includes('already exists')) {
        form.setError('name', { message: 'That country name already exists.' });
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
          <CardTitle>Edit Country</CardTitle>
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
                        <Input placeholder="Country" {...field} />
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
                <Button variant="outline" type="button" onClick={() => navigate('/cms/trips/countries')}>
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
