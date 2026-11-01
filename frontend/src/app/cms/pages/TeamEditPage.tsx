import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Switch } from '../../components/ui/switch';
import { Textarea } from '../../components/ui/textarea';
import { Badge } from '../../components/ui/badge';
import { SequoiaLoader } from '../components/SequoiaLoader';
import { teamApi } from '../../services/api';
import { toast } from 'sonner';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '../../components/ui/form';
import { teamFormSchema, TeamFormValues } from '../utils/teamSchemas';
import { Plus, X } from 'lucide-react';
import { Skeleton } from '../../components/ui/skeleton';

export function TeamEditPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [expertiseInput, setExpertiseInput] = useState('');
  const form = useForm<TeamFormValues>({
    resolver: zodResolver(teamFormSchema),
    defaultValues: {
      name: '',
      role: '',
      bio: '',
      image: '',
      email: '',
      socialLinks: {
        linkedin: '',
        instagram: '',
        twitter: '',
        website: '',
      },
      order: 0,
      isActive: true,
      expertise: [],
    },
  });

  useEffect(() => {
    const load = async () => {
      if (!id) return;
      setLoading(true);
      try {
        const data = await teamApi.getById(id);
        form.reset({
          name: data.name || '',
          role: data.role || '',
          bio: data.bio || '',
          image: data.image || '',
          email: data.email || '',
          socialLinks: {
            linkedin: data.socialLinks?.linkedin || '',
            instagram: data.socialLinks?.instagram || '',
            twitter: data.socialLinks?.twitter || '',
            website: data.socialLinks?.website || '',
          },
          expertise: data.expertise || [],
          order: data.order ?? 0,
          isActive: data.isActive ?? true,
        });
      } catch (error) {
        toast.error('Failed to load team member');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [form, id]);

  const handleSave = async (values: TeamFormValues) => {
    if (!id) return;
    setIsSaving(true);
    try {
      await teamApi.update(id, values);
      toast.success('Team member updated');
      navigate('/cms/team');
    } catch (error) {
      toast.error('Failed to update team member');
    } finally {
      setIsSaving(false);
    }
  };

  const addExpertise = () => {
    const trimmed = expertiseInput.trim();
    if (!trimmed) return;
    const current = form.getValues('expertise') || [];
    if (current.includes(trimmed)) {
      setExpertiseInput('');
      return;
    }
    form.setValue('expertise', [...current, trimmed], { shouldDirty: true, shouldTouch: true });
    setExpertiseInput('');
  };

  const removeExpertise = (index: number) => {
    const current = form.getValues('expertise') || [];
    form.setValue(
      'expertise',
      current.filter((_, idx) => idx !== index),
      { shouldDirty: true, shouldTouch: true }
    );
  };

  if (loading) {
    return (
      <div className="px-6 py-4">
        <Card className="rounded-2xl border-slate-200/70 bg-white/90 shadow-sm">
          <CardContent className="p-6">
            <div className="space-y-4">
              <SequoiaLoader label="Loading team member" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Skeleton className="h-12" />
                <Skeleton className="h-12" />
                <Skeleton className="h-12" />
                <Skeleton className="h-12" />
                <Skeleton className="h-28 md:col-span-2" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="px-6 py-4 space-y-4">
      <Card className="rounded-2xl border-slate-200/70 bg-white/90 shadow-sm">
        <CardHeader className="border-b border-slate-200/70 pb-5">
          <CardTitle>Edit Team Member</CardTitle>
          <CardDescription>
            Update profile details, social links, and ordering for this team member.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 pt-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSave)} className="space-y-6">
              <div className="rounded-2xl border border-slate-200/70 bg-white/90 p-5 shadow-sm">
                <div className="mb-4">
                  <h3 className="text-sm font-semibold text-slate-700">Profile Details</h3>
                  <p className="text-xs text-slate-500">Core information shown on public and CMS pages.</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name *</FormLabel>
                      <FormControl>
                        <Input placeholder="Sita Rai" {...field} />
                      </FormControl>
                      <FormMessage className="min-h-[1.1rem]">{' '}</FormMessage>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="role"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Role *</FormLabel>
                      <FormControl>
                        <Input placeholder="Lead Guide" {...field} />
                      </FormControl>
                      <FormMessage className="min-h-[1.1rem]">{' '}</FormMessage>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input placeholder="name@trekkerssquad.example" {...field} value={field.value || ''} />
                      </FormControl>
                      <FormMessage className="min-h-[1.1rem]">{' '}</FormMessage>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="image"
                  render={({ field }) => (
                    <FormItem>
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
                  name="bio"
                  render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel>Bio</FormLabel>
                      <FormControl>
                        <Textarea
                          rows={5}
                          placeholder="Short profile..."
                          {...field}
                          value={field.value || ''}
                          className="border-slate-200/80 bg-white shadow-sm focus-visible:border-slate-300"
                        />
                      </FormControl>
                      <FormMessage className="min-h-[1.1rem]">{' '}</FormMessage>
                    </FormItem>
                  )}
                />
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200/70 bg-white/90 p-5 shadow-sm">
                <div className="mb-4">
                  <h3 className="text-sm font-semibold text-slate-700">Links & Expertise</h3>
                  <p className="text-xs text-slate-500">Social channels and specialist focus areas.</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="socialLinks.linkedin"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>LinkedIn</FormLabel>
                        <FormControl>
                          <Input placeholder="https://linkedin.com/in/..." {...field} value={field.value || ''} />
                        </FormControl>
                        <FormMessage className="min-h-[1.1rem]">{' '}</FormMessage>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="socialLinks.instagram"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Instagram</FormLabel>
                        <FormControl>
                          <Input placeholder="https://instagram.com/..." {...field} value={field.value || ''} />
                        </FormControl>
                        <FormMessage className="min-h-[1.1rem]">{' '}</FormMessage>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="socialLinks.twitter"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Twitter / X</FormLabel>
                        <FormControl>
                          <Input placeholder="https://x.com/..." {...field} value={field.value || ''} />
                        </FormControl>
                        <FormMessage className="min-h-[1.1rem]">{' '}</FormMessage>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="socialLinks.website"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Website</FormLabel>
                        <FormControl>
                          <Input placeholder="https://..." {...field} value={field.value || ''} />
                        </FormControl>
                        <FormMessage className="min-h-[1.1rem]">{' '}</FormMessage>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="expertise"
                    render={({ field }) => (
                      <FormItem className="md:col-span-2 space-y-3">
                        <FormLabel>Expertise</FormLabel>
                        <div className="flex gap-2">
                          <Input
                            placeholder="Add expertise..."
                            value={expertiseInput}
                            onChange={(event) => setExpertiseInput(event.target.value)}
                            onKeyDown={(event) => {
                              if (event.key === 'Enter') {
                                event.preventDefault();
                                addExpertise();
                              }
                            }}
                            className="border-[var(--cms-border)] focus:border-[var(--cms-primary)]"
                          />
                          <Button
                            type="button"
                            onClick={addExpertise}
                            variant="outline"
                            className="border-[var(--cms-border)]"
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                        {field.value && field.value.length > 0 && (
                          <div className="flex flex-wrap gap-2">
                            {field.value.map((item, index) => (
                              <Badge
                                key={`${item}-${index}`}
                                variant="outline"
                                className="border-[var(--cms-border)] flex items-center gap-2"
                              >
                                {item}
                                <button
                                  type="button"
                                  onClick={() => removeExpertise(index)}
                                  className="ml-1 hover:text-red-500"
                                >
                                  <X className="h-3 w-3" />
                                </button>
                              </Badge>
                            ))}
                          </div>
                        )}
                        <FormMessage className="min-h-[1.1rem]">{' '}</FormMessage>
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200/70 bg-white/90 p-5 shadow-sm">
                <div className="mb-4">
                  <h3 className="text-sm font-semibold text-slate-700">Visibility & Ordering</h3>
                  <p className="text-xs text-slate-500">Control where this member appears and list order.</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
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
              </div>
              <div className="flex items-center justify-end gap-3">
                <Button variant="outline" type="button" onClick={() => navigate('/cms/team')}>
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSaving}
                  style={{ backgroundColor: 'var(--cms-primary)', color: 'var(--cms-primary-foreground)' }}
                >
                  {isSaving ? <SequoiaLoader label="Saving" size="sm" mode="inline" /> : 'Save Changes'}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
