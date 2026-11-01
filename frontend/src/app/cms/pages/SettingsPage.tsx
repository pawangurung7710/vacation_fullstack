import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { Label } from '../../components/ui/label';
import { Input } from '../../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Button } from '../../components/ui/button';
import { Switch } from '../../components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Popover, PopoverContent, PopoverTrigger } from '../../components/ui/popover';
import { useThemeContext } from '../theme/ThemeProvider';
import { authApi } from '../../services/api';
import { toast } from 'sonner';

export function SettingsPage() {
  const { theme, updateTheme, accentPresets } = useThemeContext();
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    phone: '',
    title: '',
    avatarUrl: '',
  });
  const [preferences, setPreferences] = useState({
    compactTables: false,
    reduceMotion: false,
  });
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [lastLoginAt, setLastLoginAt] = useState<string | null>(null);
  const [lastLoginAgent, setLastLoginAgent] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [savingSettings, setSavingSettings] = useState(false);
  const [settingsReady, setSettingsReady] = useState(false);
  const inputClassName =
    'border-slate-200/70 bg-white/95 focus-visible:ring-[var(--cms-primary)] focus-visible:border-[var(--cms-primary)]';
  const accentOptions = [
    { key: 'ocean', label: 'Ocean' },
    { key: 'forest', label: 'Forest' },
    { key: 'sunset', label: 'Sunset' },
    { key: 'glacier', label: 'Glacier' },
    { key: 'midnight', label: 'Midnight' },
    { key: 'rose', label: 'Rose' },
    { key: 'yellow', label: 'Yellow' },
    { key: 'red', label: 'Red' },
  ] as const;
  const sidebarOptions = [
    ...accentOptions,
    { key: 'sky', label: 'Sky' },
    { key: 'peach', label: 'Peach' },
    { key: 'plum', label: 'Plum' },
    { key: 'mint', label: 'Mint' },
    { key: 'cobalt', label: 'Cobalt' },
    { key: 'sand', label: 'Sand' },
  ] as const;

  useEffect(() => {
    let isMounted = true;

    const loadSettings = async () => {
      try {
        const response = await authApi.getMe();
        const currentUser = response.user || response;

        if (!isMounted) return;

        setProfile({
          name: currentUser?.name || '',
          email: currentUser?.email || '',
          phone: currentUser?.phone || '',
          title: currentUser?.title || '',
          avatarUrl: currentUser?.avatarUrl || '',
        });
        setLastLoginAt(currentUser?.lastLoginAt || null);
        setLastLoginAgent(currentUser?.lastLoginAgent || null);

        if (currentUser?.settings?.theme) {
          updateTheme(currentUser.settings.theme);
        }

        setPreferences({
          compactTables: currentUser?.settings?.preferences?.compactTables ?? false,
          reduceMotion: currentUser?.settings?.preferences?.reduceMotion ?? false,
        });

        localStorage.setItem('user', JSON.stringify(currentUser));
        setSettingsReady(true);
      } catch (error) {
        toast.error('Failed to load settings');
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadSettings();

    return () => {
      isMounted = false;
    };
  }, [updateTheme]);

  const persistSettings = async (nextSettings: {
    theme?: {
      mode?: 'light' | 'dark';
      accent?: string;
      fontScale?: 'small' | 'normal' | 'large';
    };
    preferences?: {
      compactTables?: boolean;
      reduceMotion?: boolean;
    };
  }) => {
    if (!settingsReady) return;
    setSavingSettings(true);
    try {
      const response = await authApi.updateSettings(nextSettings);
      const updatedUser = response.user || response;
      localStorage.setItem('user', JSON.stringify(updatedUser));
    } catch (error) {
      toast.error('Failed to update settings');
    } finally {
      setSavingSettings(false);
    }
  };

  const handleThemeChange = (updates: Partial<typeof theme>) => {
    const nextTheme = { ...theme, ...updates };
    updateTheme(updates);
    void persistSettings({
      theme: {
        mode: nextTheme.mode,
        accent: nextTheme.accent,
        sidebarColor: nextTheme.sidebarColor,
        fontScale: nextTheme.fontScale,
      },
      preferences,
    });
  };

  const handlePreferenceChange = (updates: Partial<typeof preferences>) => {
    const nextPreferences = { ...preferences, ...updates };
    setPreferences(nextPreferences);
    void persistSettings({
      theme: {
        mode: theme.mode,
        accent: theme.accent,
        sidebarColor: theme.sidebarColor,
        fontScale: theme.fontScale,
      },
      preferences: nextPreferences,
    });
  };

  const handleProfileSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      const payload = {
        name: profile.name.trim(),
        email: profile.email.trim(),
        phone: profile.phone.trim() || undefined,
        title: profile.title.trim() || undefined,
        avatarUrl: profile.avatarUrl.trim() || undefined,
      };
      if (!payload.name || !payload.email) {
        toast.error('Name and email are required');
        return;
      }
      setSavingProfile(true);
      const response = await authApi.updateMe(payload);
      const updatedUser = response.user || response;
      localStorage.setItem('user', JSON.stringify(updatedUser));
      toast.success('Profile updated');
    } catch (error) {
      toast.error('Failed to update profile');
    } finally {
      setSavingProfile(false);
    }
  };

  const handlePasswordSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!passwordForm.currentPassword || !passwordForm.newPassword) {
      toast.error('Enter your current and new password');
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    setSavingPassword(true);
    try {
      await authApi.changePassword(passwordForm.currentPassword, passwordForm.newPassword);
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      toast.success('Password updated');
    } catch (error) {
      toast.error('Failed to update password');
    } finally {
      setSavingPassword(false);
    }
  };

  const lastLoginLabel = lastLoginAt ? new Date(lastLoginAt).toLocaleString() : '—';
  const lastLoginAgentLabel = lastLoginAgent || '—';

  return (
    <div className="space-y-6">
      <div className="relative overflow-hidden rounded-3xl border border-slate-200/70 bg-[linear-gradient(135deg,_rgba(255,255,255,0.9)_0%,_rgba(246,248,252,0.95)_55%,_rgba(240,247,255,0.9)_100%)] p-6 shadow-[0_20px_50px_rgba(15,23,42,0.08)]">
        <div className="absolute inset-x-0 top-0 h-1 bg-[linear-gradient(90deg,_var(--cms-primary),_rgba(255,255,255,0.2))]" />
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-[var(--cms-muted-foreground)]">Account settings</p>
            <h2 className="text-2xl font-semibold text-slate-900">Personalize your CMS workspace</h2>
            <p className="text-sm text-[var(--cms-muted-foreground)] mt-1">
              Update profile details, secure your account, and tune your workspace.
            </p>
          </div>
          <div className="flex items-center gap-3 rounded-2xl border border-slate-200/70 bg-white/80 px-4 py-3">
            <div className="h-10 w-10 rounded-full bg-[var(--cms-primary)] text-[var(--cms-primary-foreground)] flex items-center justify-center text-sm font-semibold">
              {profile.name?.charAt(0) || profile.email?.charAt(0) || 'A'}
            </div>
            <div>
              <p className="text-sm font-medium text-slate-900">{profile.name || 'Admin'}</p>
              <p className="text-xs text-[var(--cms-muted-foreground)]">{profile.email || 'admin@trekkerssquad.example'}</p>
            </div>
          </div>
        </div>
      </div>

      <Tabs defaultValue="profile" className="space-y-5">
        <TabsList className="bg-white/80 text-[var(--cms-muted-foreground)] border border-slate-200/70 rounded-2xl px-2 py-2 shadow-sm">
          <TabsTrigger
            value="profile"
            className="px-4 py-2 rounded-xl data-[state=active]:bg-[var(--cms-primary)] data-[state=active]:text-[var(--cms-primary-foreground)]"
          >
            Profile
          </TabsTrigger>
          <TabsTrigger
            value="security"
            className="px-4 py-2 rounded-xl data-[state=active]:bg-[var(--cms-primary)] data-[state=active]:text-[var(--cms-primary-foreground)]"
          >
            Security
          </TabsTrigger>
          <TabsTrigger
            value="appearance"
            className="px-4 py-2 rounded-xl data-[state=active]:bg-[var(--cms-primary)] data-[state=active]:text-[var(--cms-primary-foreground)]"
          >
            Appearance
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <Card className="rounded-3xl border-slate-200/70 bg-white/95 shadow-[0_20px_50px_rgba(15,23,42,0.08)]">
            <CardHeader>
              <CardTitle>Profile</CardTitle>
              <CardDescription>Keep your admin details and contact info current.</CardDescription>
            </CardHeader>
            <CardContent>
              <form className="space-y-6" onSubmit={handleProfileSubmit}>
              <div className="rounded-2xl border border-slate-200/70 bg-white/90 p-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div className="flex items-center gap-4">
                  <div className="h-16 w-16 rounded-2xl overflow-hidden bg-[var(--cms-muted)] flex items-center justify-center text-lg font-semibold text-[var(--cms-foreground)]">
                    {profile.avatarUrl ? (
                      <img src={profile.avatarUrl} alt="Profile avatar" className="h-full w-full object-cover" />
                    ) : (
                      <span>{profile.name?.charAt(0) || profile.email?.charAt(0) || 'A'}</span>
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-900">Profile snapshot</p>
                    <p className="text-xs text-[var(--cms-muted-foreground)]">Preview how your avatar appears in the CMS.</p>
                  </div>
                </div>
                <div className="rounded-xl border border-slate-200/70 bg-slate-50/80 px-3 py-2 text-xs text-[var(--cms-muted-foreground)]">
                  {profile.avatarUrl ? 'Using custom avatar' : 'No avatar set'}
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <Label>Name</Label>
                  <Input
                    value={profile.name}
                    className={inputClassName}
                    onChange={(event) => setProfile((prev) => ({ ...prev, name: event.target.value }))}
                    placeholder="Admin name"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input
                    type="email"
                    value={profile.email}
                    className={inputClassName}
                    onChange={(event) => setProfile((prev) => ({ ...prev, email: event.target.value }))}
                    placeholder="admin@trekkerssquad.example"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Title</Label>
                  <Input
                    value={profile.title}
                    className={inputClassName}
                    onChange={(event) => setProfile((prev) => ({ ...prev, title: event.target.value }))}
                    placeholder="Operations Lead"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Phone</Label>
                  <Input
                    value={profile.phone}
                    className={inputClassName}
                    onChange={(event) => setProfile((prev) => ({ ...prev, phone: event.target.value }))}
                    placeholder="+977 98XXXXXXX"
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label>Avatar URL</Label>
                  <Input
                    value={profile.avatarUrl}
                    className={inputClassName}
                    onChange={(event) => setProfile((prev) => ({ ...prev, avatarUrl: event.target.value }))}
                    placeholder="https://images..."
                  />
                </div>
              </div>
              <div className="grid gap-4 md:grid-cols-[1.2fr_1fr]">
                <div className="rounded-2xl border border-slate-200/70 bg-slate-50/80 p-4">
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">Last Login</p>
                  <p className="text-sm font-medium text-slate-900 mt-1">{lastLoginLabel}</p>
                  <p className="text-xs text-muted-foreground break-words mt-1">{lastLoginAgentLabel}</p>
                </div>
                <div className="rounded-2xl border border-slate-200/70 bg-white p-4">
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">Profile Status</p>
                  <p className="text-sm font-medium text-slate-900 mt-1">
                    {profile.name && profile.email ? 'Profile complete' : 'Profile incomplete'}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Fill all fields to keep your contact details up to date.
                  </p>
                </div>
              </div>
              <div className="flex items-center justify-end gap-3">
                <Button
                  type="submit"
                  disabled={savingProfile || loading}
                  className="bg-[var(--cms-primary)] text-[var(--cms-primary-foreground)] hover:bg-[var(--cms-primary-hover)]"
                >
                  {savingProfile ? 'Saving...' : 'Save Profile'}
                </Button>
              </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security">
          <Card className="rounded-3xl border-slate-200/70 bg-white/95 shadow-[0_20px_50px_rgba(15,23,42,0.08)]">
            <CardHeader>
              <CardTitle>Security</CardTitle>
              <CardDescription>Update your password regularly.</CardDescription>
            </CardHeader>
            <CardContent>
              <form className="space-y-6" onSubmit={handlePasswordSubmit}>
                <div className="grid gap-5 md:grid-cols-[1.2fr_1fr]">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Current Password</Label>
                  <Input
                    type="password"
                    value={passwordForm.currentPassword}
                    className={inputClassName}
                    onChange={(event) =>
                      setPasswordForm((prev) => ({ ...prev, currentPassword: event.target.value }))
                    }
                  />
                    </div>
                    <div className="space-y-2">
                      <Label>New Password</Label>
                  <Input
                    type="password"
                    value={passwordForm.newPassword}
                    className={inputClassName}
                    onChange={(event) =>
                      setPasswordForm((prev) => ({ ...prev, newPassword: event.target.value }))
                    }
                  />
                    </div>
                    <div className="space-y-2">
                      <Label>Confirm New Password</Label>
                  <Input
                    type="password"
                    value={passwordForm.confirmPassword}
                    className={inputClassName}
                    onChange={(event) =>
                      setPasswordForm((prev) => ({ ...prev, confirmPassword: event.target.value }))
                    }
                  />
                    </div>
                  </div>
                  <div className="rounded-2xl border border-slate-200/70 bg-slate-50/80 p-4">
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">Security tips</p>
                    <ul className="mt-2 space-y-2 text-sm text-slate-700">
                      <li>Use at least 8 characters.</li>
                      <li>Mix letters, numbers, and symbols.</li>
                      <li>Rotate passwords every few months.</li>
                    </ul>
                  </div>
                </div>
                <div className="flex items-center justify-end">
                  <Button
                    type="submit"
                    disabled={savingPassword}
                    className="bg-[var(--cms-primary)] text-[var(--cms-primary-foreground)] hover:bg-[var(--cms-primary-hover)]"
                  >
                    {savingPassword ? 'Updating...' : 'Update Password'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="appearance">
          <Card className="rounded-3xl border-slate-200/70 bg-white/95 shadow-[0_20px_50px_rgba(15,23,42,0.08)]">
            <CardHeader>
              <CardTitle>Appearance & Preferences</CardTitle>
              <CardDescription>Personalize your admin workspace.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-5 xl:grid-cols-[1.3fr_1fr]">
                <div className="grid gap-4 md:grid-cols-3">
                  {/* Theme mode picker is intentionally hidden for now. */}
                  
                  {/* <div className="space-y-2">
                    <Label>Theme Mode</Label>
                    <Select value={theme.mode} onValueChange={(value: any) => handleThemeChange({ mode: value })}>
                      <SelectTrigger className={inputClassName}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="light">Light</SelectItem>
                        <SelectItem value="dark">Dark</SelectItem>
                      </SelectContent>
                    </Select>
                  </div> */}
                 
                  <div className="space-y-2 md:col-span-2">
                    <Label>Accent Color</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          type="button"
                          variant="outline"
                          className="h-10 w-full justify-between border-slate-200/70 bg-white/95"
                        >
                          <span className="flex items-center gap-2">
                            <span
                              className="h-4 w-4 rounded-full"
                              style={{ backgroundColor: accentPresets[theme.accent].primary }}
                            />
                            <span className="capitalize">{theme.accent}</span>
                          </span>
                          <span className="text-xs text-[var(--cms-muted-foreground)]">Choose</span>
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-72">
                        <div className="space-y-3">
                          <p className="text-xs uppercase tracking-wide text-[var(--cms-muted-foreground)]">
                            Accent palette
                          </p>
                          <div className="grid grid-cols-5 gap-3">
                            {accentOptions.map((option) => (
                              <button
                                key={option.key}
                                type="button"
                                onClick={() => handleThemeChange({ accent: option.key })}
                                className={`h-10 w-10 rounded-full border-2 transition-all ${
                                  theme.accent === option.key
                                    ? 'border-slate-900 shadow-[0_0_0_4px_rgba(15,23,42,0.08)] scale-105'
                                    : 'border-slate-200 hover:border-slate-400'
                                }`}
                                style={{ backgroundColor: accentPresets[option.key].primary }}
                                aria-label={option.label}
                                title={option.label}
                              />
                            ))}
                          </div>
                        </div>
                      </PopoverContent>
                    </Popover>
                    <p className="text-xs text-[var(--cms-muted-foreground)]">
                      Selected: <span className="font-medium capitalize text-slate-900">{theme.accent}</span>
                    </p>
                  </div>
                  <div className="space-y-2 md:col-span-3">
                    <Label>Font Scale</Label>
                    <Select
                      value={theme.fontScale}
                      onValueChange={(value: any) => handleThemeChange({ fontScale: value })}
                    >
                      <SelectTrigger className={inputClassName}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="small">Small</SelectItem>
                        <SelectItem value="normal">Normal</SelectItem>
                        <SelectItem value="large">Large</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2 md:col-span-3">
                    <Label>Sidebar Color</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          type="button"
                          variant="outline"
                          className="h-10 w-full justify-between border-slate-200/70 bg-white/95"
                        >
                          <span className="flex items-center gap-2">
                            <span
                              className="h-4 w-4 rounded-full"
                              style={{ backgroundColor: accentPresets[theme.sidebarColor].primary }}
                            />
                            <span className="capitalize">{theme.sidebarColor}</span>
                          </span>
                          <span className="text-xs text-[var(--cms-muted-foreground)]">Choose</span>
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-72">
                        <div className="space-y-3">
                          <p className="text-xs uppercase tracking-wide text-[var(--cms-muted-foreground)]">
                            Sidebar palette
                          </p>
                          <div className="grid grid-cols-5 gap-3">
                            {sidebarOptions.map((option) => (
                              <button
                                key={`sidebar-${option.key}`}
                                type="button"
                                onClick={() => handleThemeChange({ sidebarColor: option.key })}
                                className={`h-10 w-10 rounded-full border-2 transition-all ${
                                  theme.sidebarColor === option.key
                                    ? 'border-slate-900 shadow-[0_0_0_4px_rgba(15,23,42,0.08)] scale-105'
                                    : 'border-slate-200 hover:border-slate-400'
                                }`}
                                style={{ backgroundColor: accentPresets[option.key].primary }}
                                aria-label={option.label}
                                title={option.label}
                              />
                            ))}
                          </div>
                        </div>
                      </PopoverContent>
                    </Popover>
                    <p className="text-xs text-[var(--cms-muted-foreground)]">
                      Selected: <span className="font-medium capitalize text-slate-900">{theme.sidebarColor}</span>
                    </p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="rounded-2xl border border-slate-200/70 bg-[linear-gradient(135deg,_rgba(255,255,255,0.9)_0%,_rgba(245,247,252,0.9)_100%)] p-4">
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">Accent preview</p>
                  <div className="mt-3 flex items-center gap-3">
                    <div className="h-12 w-12 rounded-2xl bg-[var(--cms-primary)] shadow-[0_10px_20px_rgba(15,23,42,0.12)]" />
                    <div>
                      <p className="text-sm font-medium text-slate-900 capitalize">{theme.accent}</p>
                      <p className="text-xs text-muted-foreground">Buttons, highlights, and focus rings</p>
                    </div>
                  </div>
                  <div className="mt-4 flex items-center gap-2">
                    <div className="h-2 w-24 rounded-full bg-[var(--cms-primary)]/20" />
                    <div className="h-2 w-16 rounded-full bg-[var(--cms-primary)]/45" />
                    <div className="h-2 w-10 rounded-full bg-[var(--cms-primary)]/80" />
                  </div>
                  <div className="mt-4 flex items-center gap-2">
                    <Button
                      type="button"
                      className="h-8 bg-[var(--cms-primary)] text-[var(--cms-primary-foreground)] hover:bg-[var(--cms-primary-hover)]"
                    >
                      Sample
                    </Button>
                    <Button type="button" variant="outline" className="h-8 border-slate-200/70">
                      Outline
                    </Button>
                  </div>
                  </div>
                  <div className="rounded-2xl border border-slate-200/70 bg-white p-4">
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">Sidebar preview</p>
                    <div
                      className="mt-3 h-20 rounded-xl border border-white/30 shadow-inner"
                      style={{ background: 'var(--cms-sidebar-gradient)' }}
                    />
                    <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
                      <span className="h-2 w-2 rounded-full bg-white/70" />
                      <span className="capitalize">{theme.sidebarColor}</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="rounded-2xl border border-slate-200/70 bg-slate-50/80 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-900">Compact tables</p>
                    <p className="text-xs text-muted-foreground">Reduce row height in data tables</p>
                  </div>
                  <Switch
                    checked={preferences.compactTables}
                    onCheckedChange={(checked) => handlePreferenceChange({ compactTables: checked })}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-900">Reduce motion</p>
                    <p className="text-xs text-muted-foreground">Limit animations and transitions</p>
                  </div>
                  <Switch
                    checked={preferences.reduceMotion}
                    onCheckedChange={(checked) => handlePreferenceChange({ reduceMotion: checked })}
                  />
                </div>
              </div>
              {savingSettings && (
                <p className="text-xs text-muted-foreground">Saving settings...</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
