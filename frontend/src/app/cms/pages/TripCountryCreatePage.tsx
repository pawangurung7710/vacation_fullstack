import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
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

export function TripCountryCreatePage() {
  const navigate = useNavigate();
  const [isCreating, setIsCreating] = useState(false);
  const form = useForm<CountryFormValues>({
    resolver: zodResolver(countryFormSchema),
    defaultValues: {
      name: '',
      isActive: true,
    },
  });

  const handleCreate = async (values: CountryFormValues) => {
    setIsCreating(true);
    try {
      await countriesApi.create(values);
      toast.success('Country created');
      navigate('/cms/trips/countries');
    } catch (error) {
      const message =
        error instanceof ApiError ? error.message : 'Failed to create country';
      if (message.toLowerCase().includes('already exists')) {
        form.setError('name', { message: 'That country name already exists.' });
      }
      toast.error(message);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="px-6 py-4 space-y-4">
      <Card className="rounded-2xl border-slate-200/70 bg-white/90 shadow-sm">
        <CardHeader>
          <CardTitle>Create Country</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleCreate)} className="space-y-4">
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
                  disabled={isCreating}
                  style={{ backgroundColor: 'var(--cms-primary)', color: 'var(--cms-primary-foreground)' }}
                >
                  {isCreating ? <SequoiaLoader label="Saving" size="sm" mode="inline" /> : 'Create Country'}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
