import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '../../components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../../components/ui/dropdown-menu';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '../../components/ui/popover';
import { Search, Bell, Palette, User, LogOut, Settings, ArrowLeft } from 'lucide-react';
import { authApi } from '../../services/api';
import { toast } from 'sonner';
import { useThemeContext } from '../theme/ThemeProvider';
import { MobileSidebar } from './Sidebar';
import { cn } from '../../components/ui/utils';
import { getPageInfo } from './pageInfo';

export function Topbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { theme, setAccent, accentPresets } = useThemeContext();
  const pageInfo = getPageInfo(location.pathname);

  // Determine if this is a detail/create/edit page and get the back route
  const getBackRoute = () => {
    const path = location.pathname;
    
    // Trips detail pages
    if (path.includes('/trips/preview')) {
      return '/cms/trips/new';
    }
    if (path.includes('/trips/new')) {
      return '/cms/trips';
    }
    if (path.match(/\/trips\/[^/]+$/)) {
      return '/cms/trips';
    }
    
    // Blog detail pages
    if (path.includes('/blog/new')) {
      return '/cms/blog';
    }
    if (path.match(/\/blog\/[^/]+$/)) {
      return '/cms/blog';
    }
    
    return null;
  };

  const backRoute = getBackRoute();
  const isDetailPage = backRoute !== null;

  const handleBack = () => {
    if (backRoute) {
      navigate(backRoute);
    } else {
      navigate(-1);
    }
  };

  const handleLogout = async () => {
    try {
      await authApi.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      navigate('/cms');
      toast.success('Logged out successfully');
    }
  };

  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : null;

  const accentOptions = [
    { key: 'ocean', label: 'Ocean' },
    { key: 'forest', label: 'Forest' },
    { key: 'sunset', label: 'Sunset' },
    { key: 'glacier', label: 'Glacier' },
    { key: 'midnight', label: 'Midnight' },
    { key: 'rose', label: 'Rose' },
    { key: 'yellow', label: 'Yellow' },
    { key: 'red', label: 'Red' },
  ];

  const handleAccentChange = async (preset: typeof theme.accent) => {
    const nextTheme = { ...theme, accent: preset };
    setAccent(preset);
    try {
      const response = await authApi.updateSettings({
        theme: {
          mode: nextTheme.mode,
          accent: nextTheme.accent,
          fontScale: nextTheme.fontScale,
        },
      });
      const updatedUser = response.user || response;
      localStorage.setItem('user', JSON.stringify(updatedUser));
    } catch (error) {
      console.error('Failed to update theme settings', error);
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-[var(--cms-border)] bg-white" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Inter, sans-serif' }}>
      <div className="flex h-16 items-center gap-4 px-6">
        <MobileSidebar />
        
        {/* Back Button for Detail Pages */}
        {isDetailPage && (
          <Button
            variant="ghost"
            size="icon"
            onClick={handleBack}
            className="border-[var(--cms-border)] hover:bg-[var(--cms-muted)]"
            aria-label="Go back"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
        )}
        
        {/* Page Title and Description */}
        <div className="flex-1 min-w-0">
          <div className="flex flex-col">
            <h1 className="text-lg font-semibold truncate text-[var(--cms-foreground)]" style={{ fontSize: `calc(1.125rem * var(--cms-font-scale, 1))`, fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Inter, sans-serif' }}>
              {pageInfo.title}
            </h1>
            {pageInfo.description && (
              <p className="text-sm truncate text-[var(--cms-muted-foreground)]" style={{ fontSize: `calc(0.875rem * var(--cms-font-scale, 1))`, fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Inter, sans-serif' }}>
                {pageInfo.description}
              </p>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
          {/* Accent Color Picker */}
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="icon">
                <Palette className="h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-72">
              <div className="space-y-3">
                <h4 className="font-medium text-sm text-[#1d1d1f]">Accent Color</h4>
                <div className="grid grid-cols-4 gap-3">
                  {accentOptions.map((option) => (
                    <button
                      key={option.key}
                      onClick={() => handleAccentChange(option.key as typeof theme.accent)}
                      className={cn(
                        'h-10 w-10 rounded-full border-2 transition-all hover:scale-110',
                        theme.accent === option.key
                          ? 'border-[#1d1d1f] scale-110 shadow-md'
                          : 'border-[#d2d2d7] hover:border-[#1d1d1f]'
                      )}
                      style={{ backgroundColor: accentPresets[option.key].primary }}
                      aria-label={option.label}
                      title={option.label}
                    />
                  ))}
                </div>
              </div>
            </PopoverContent>
          </Popover>

          {/* Notifications */}
          {/* <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-4 w-4" />
            <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full" />
          </Button> */}

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-full overflow-hidden flex items-center justify-center text-white text-sm font-medium bg-[var(--cms-primary)]">
                  {user?.avatarUrl ? (
                    <img
                      src={user.avatarUrl}
                      alt={user?.name || user?.email || 'Admin'}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <span>{user?.name?.charAt(0) || user?.email?.charAt(0) || 'A'}</span>
                  )}
                </div>
                <span className="hidden md:inline-block">{user?.name || user?.email || 'Admin'}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium">{user?.name || 'Admin User'}</p>
                  <p className="text-xs text-muted-foreground">{user?.email || 'admin@trekkerssquad.example'}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => navigate('/cms/settings')}>
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  );
}
