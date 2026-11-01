import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
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

export function TeamCreatePage() {
  const navigate = useNavigate();
  const [isCreating, setIsCreating] = useState(false);
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
      expertise: [],
      order: 0,
      isActive: true,
    },
  });

  const handleCreate = async (values: TeamFormValues) => {
    setIsCreating(true);
    try {
      await teamApi.create(values);
      toast.success('Team member created');
      navigate('/cms/team');
    } catch (error) {
      toast.error('Failed to create team member');
    } finally {
      setIsCreating(false);
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

  return (
    <div className="px-6 py-4 space-y-4">
      <Card className="rounded-2xl border-slate-200/70 bg-white/90 shadow-sm">
        <CardHeader>
          <CardTitle>Create Team Member</CardTitle>
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
                        <Textarea rows={5} placeholder="Short profile..." {...field} value={field.value || ''} />
                      </FormControl>
                      <FormMessage className="min-h-[1.1rem]">{' '}</FormMessage>
                    </FormItem>
                  )}
                />
                <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
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
                </div>
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
                <Button variant="outline" type="button" onClick={() => navigate('/cms/team')}>
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isCreating}
                  style={{ backgroundColor: 'var(--cms-primary)', color: 'var(--cms-primary-foreground)' }}
                >
                  {isCreating ? <SequoiaLoader label="Saving" size="sm" mode="inline" /> : 'Create Member'}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
