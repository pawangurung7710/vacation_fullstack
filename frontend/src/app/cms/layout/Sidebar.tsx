import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '../../components/ui/utils';
import {
  LayoutDashboard,
  MapPin,
  FileText,
  Calendar,
  Mail,
  Users,
  UserCircle,
  MessageSquare,
  FileEdit,
  Navigation,
  Image,
  Settings,
  Menu,
  Inbox,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Tag,
  HelpCircle,
  Target,
  Package,
  ShoppingBag,
  Wrench,
  Sparkles,
} from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '../../components/ui/sheet';
import logoImage from '../../../assets/trekkers-logo.png';
import { bookingApi, contactApi, CMS_COUNTS_UPDATED_EVENT } from '../../services/api';

const SIDEBAR_COUNTS_POLL_MS = 60_000;

/** Items needing attention, keyed by sidebar path: contacts still "new", bookings still "pending". */
const countSources: Record<string, () => Promise<number>> = {
  '/cms/contact': contactApi.getUnseenCount,
  '/cms/bookings': bookingApi.getPendingCount,
};

/** Refreshes on navigation, on an interval, and after CMS writes that change a count. */
function useSidebarCounts() {
  const location = useLocation();
  const [counts, setCounts] = React.useState<Record<string, number>>({});

  const refresh = React.useCallback(() => {
    Object.entries(countSources).forEach(([path, load]) => {
      load()
        .then((count) => setCounts((prev) => (prev[path] === count ? prev : { ...prev, [path]: count })))
        .catch(() => {});
    });
  }, []);

  React.useEffect(() => {
    refresh();
  }, [refresh, location.pathname]);

  React.useEffect(() => {
    const id = window.setInterval(refresh, SIDEBAR_COUNTS_POLL_MS);
    window.addEventListener(CMS_COUNTS_UPDATED_EVENT, refresh);
    return () => {
      window.clearInterval(id);
      window.removeEventListener(CMS_COUNTS_UPDATED_EVENT, refresh);
    };
  }, [refresh]);

  return counts;
}

function ItemCount({ count }: { count?: number }) {
  if (!count) return null;
  return <span className="ml-1 font-semibold">({count})</span>;
}

const menuItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/cms/dashboard' },
  {
    icon: MapPin,
    label: 'Trips',
    path: '/cms/trips',
    children: [
      { label: 'Trips', path: '/cms/trips' },
      { label: 'Categories', path: '/cms/trips/categories' },
      { label: 'Countries', path: '/cms/trips/countries' },
      { label: 'Regions', path: '/cms/trips/regions' },
      { label: 'Subcategories', path: '/cms/trips/subcategories' },
    ],
  },
  { icon: Sparkles, label: 'Add-ons & Activities', path: '/cms/add-ons' },
  { icon: FileText, label: 'Blog', path: '/cms/blog' },
  { icon: Calendar, label: 'Bookings', path: '/cms/bookings' },
  {
    icon: Package,
    label: 'Rentals',
    path: '/cms/rentals',
    children: [
      { label: 'Products', path: '/cms/rentals' },
      { label: 'Categories', path: '/cms/rentals/categories' },
    ],
  },
  { icon: ShoppingBag, label: 'Rental Orders', path: '/cms/rental-orders' },
  { icon: Tag, label: 'Promotions', path: '/cms/promotions' },
  { icon: Mail, label: 'Contact', path: '/cms/contact' },
  { icon: Inbox, label: 'Newsletter subscriptions', path: '/cms/newsletter-subscriptions' },
  { icon: Users, label: 'Team', path: '/cms/team' },
  { icon: UserCircle, label: 'Guides', path: '/cms/guides' },
  { icon: MessageSquare, label: 'Testimonials', path: '/cms/testimonials' },
  { icon: HelpCircle, label: 'FAQ', path: '/cms/faqs' },
  {
    icon: FileEdit,
    label: 'Pages',
    path: '/cms/pages',
    children: [
      { label: 'Homepage', path: '/cms/pages/homepage' },
      { label: 'Gallery', path: '/cms/pages/gallery' },
      { label: 'Careers & Partnerships', path: '/cms/pages/careers-partnerships' },
    ],
  },
  // { icon: Navigation, label: 'Navigation', path: '/cms/navigation' },
//   { icon: Image, label: 'Media', path: '/cms/media' },
  { icon: Settings, label: 'Settings', path: '/cms/settings' },
  { icon: Wrench, label: 'Maintenance Mode', path: '/cms/maintenance-mode' },
];

interface SidebarProps {
  collapsed?: boolean;
  onToggle?: () => void;
}

export function Sidebar({ collapsed = false, onToggle }: SidebarProps) {
  const location = useLocation();
  const sidebarCounts = useSidebarCounts();
  const [openSections, setOpenSections] = React.useState<Record<string, boolean>>({
    trips: location.pathname.startsWith('/cms/trips'),
    pages: location.pathname.startsWith('/cms/pages'),
    rentals: location.pathname.startsWith('/cms/rentals'),
  });

  const toggleSection = (key: string) => {
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      <div className={cn(
        "flex items-center border-b",
        collapsed ? "justify-center p-3" : "justify-between p-4"
      )} style={{ borderColor: 'rgba(255, 255, 255, 0.2)' }}>
        {collapsed ? (
          <>
            <img src={logoImage} alt="Trekkers Squad Logo" width={40} height={40} className="h-10 w-10" />
            {onToggle && (
              <Button
                variant="ghost"
                size="icon"
                onClick={onToggle}
                className="absolute top-2 right-2 h-7 w-7 hover:bg-white/20 text-white/90 hover:text-white transition-colors rounded-lg"
                aria-label="Expand sidebar"
              >
                <ChevronRight className="h-3.5 w-3.5" />
              </Button>
            )}
          </>
        ) : (
          <>
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <img src={logoImage} alt="Trekkers Squad Logo" width={40} height={40} className="h-10 w-10 flex-shrink-0" />
              <span className="font-semibold text-lg truncate text-white" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Inter, sans-serif' }}>
                Trekkers Squad CMS
              </span>
            </div>
            {onToggle && (
              <Button
                variant="ghost"
                size="icon"
                onClick={onToggle}
                className="h-8 w-8 flex-shrink-0 hover:bg-white/20 text-white/90 hover:text-white transition-colors rounded-lg"
                aria-label="Collapse sidebar"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
            )}
          </>
        )}
      </div>
      <nav className="flex-1 p-4 space-y-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path || location.pathname.startsWith(item.path + '/');
          const hasChildren = Boolean(item.children?.length);

          if (hasChildren && !collapsed) {
            const isOpen = openSections[item.label.toLowerCase()] ?? false;
            return (
              <div key={item.path} className="space-y-1">
                <button
                  type="button"
                  onClick={() => toggleSection(item.label.toLowerCase())}
                  className={cn(
                    'flex w-full items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-150',
                    isActive ? 'bg-white/95 shadow-sm' : 'hover:bg-white/20'
                  )}
                  style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Inter, sans-serif' }}
                  aria-expanded={isOpen}
                >
                  <Icon className={cn(
                    'h-5 w-5 flex-shrink-0 transition-colors',
                    isActive ? 'text-[#1d1d1f]' : 'text-white/90'
                  )} />
                  <span
                    className={cn(
                      'text-sm transition-colors',
                      isActive ? 'text-[#1d1d1f]' : 'text-white/90'
                    )}
                    style={{ fontWeight: isActive ? 500 : 400 }}
                  >
                    {item.label}
                  </span>
                  <ChevronDown
                    className={cn(
                      'ml-auto h-4 w-4 transition-transform',
                      isOpen ? 'rotate-180' : '',
                      isActive ? 'text-[#1d1d1f]' : 'text-white/70'
                    )}
                  />
                </button>
                {isOpen && (
                  <div className="ml-8 space-y-1">
                    {item.children?.map((child) => {
                      const isChildActive = location.pathname === child.path;
                      return (
                        <Link
                          key={child.path}
                          to={child.path}
                          className={cn(
                            'block rounded-md px-3 py-2 text-sm transition-colors',
                            isChildActive ? 'bg-white/95 text-[#1d1d1f]' : 'text-white/80 hover:bg-white/20'
                          )}
                        >
                          {child.label}
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          }

          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                'relative flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-150',
                isActive
                  ? 'bg-white/95 shadow-sm'
                  : 'hover:bg-white/20'
              )}
              style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Inter, sans-serif' }}
            >
              <Icon className={cn(
                "h-5 w-5 flex-shrink-0 transition-colors",
                isActive ? "text-[#1d1d1f]" : "text-white/90"
              )} />
              {!collapsed && (
                <span 
                  className={cn(
                    "text-sm transition-colors",
                    isActive ? "text-[#1d1d1f]" : "text-white/90"
                  )} 
                  style={{ fontWeight: isActive ? 500 : 400 }}
                >
                  {item.label}
                  <ItemCount count={sidebarCounts[item.path]} />
                </span>
              )}
              {collapsed && Boolean(sidebarCounts[item.path]) && (
                <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-red-500" aria-label={`${sidebarCounts[item.path]} need attention`} />
              )}
            </Link>
          );
        })}
      </nav>
    </div>
  );

  if (collapsed) {
    return (
      <div
        className="w-16 border-r border-[var(--cms-border)] hidden md:block relative"
        style={{
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Inter, sans-serif',
          background: 'var(--cms-sidebar-gradient)',
        }}
      >
        <SidebarContent />
      </div>
    );
  }

  return (
    <div
      className="w-64 border-r border-[var(--cms-border)] hidden md:block"
      style={{
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Inter, sans-serif',
        background: 'var(--cms-sidebar-gradient)',
      }}
    >
      <SidebarContent />
    </div>
  );
}

export function MobileSidebar() {
  const location = useLocation();
  const [open, setOpen] = React.useState(false);
  const sidebarCounts = useSidebarCounts();
  const [openSections, setOpenSections] = React.useState<Record<string, boolean>>({
    trips: location.pathname.startsWith('/cms/trips'),
    pages: location.pathname.startsWith('/cms/pages'),
    rentals: location.pathname.startsWith('/cms/rentals'),
  });

  const toggleSection = (key: string) => {
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-64 p-0">
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between p-4 border-b">
            <div className="flex items-center gap-2">
              <img src={logoImage} alt="Trekkers Squad Logo" width={40} height={40} className="h-10 w-10" />
              <span className="font-semibold text-lg">CMS</span>
            </div>
          </div>
          <nav className="flex-1 p-4 space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path || location.pathname.startsWith(item.path + '/');
              const hasChildren = Boolean(item.children?.length);

              const isOpen = openSections[item.label.toLowerCase()] ?? false;
              return (
                <div key={item.path} className="space-y-1">
                  {hasChildren ? (
                    <>
                      <button
                        type="button"
                        onClick={() => toggleSection(item.label.toLowerCase())}
                        className={cn(
                          'flex w-full items-center gap-3 px-3 py-2 rounded-lg transition-colors',
                          isActive
                            ? 'bg-muted text-foreground font-medium'
                            : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                        )}
                        aria-expanded={isOpen}
                      >
                        <Icon className="h-5 w-5 flex-shrink-0" />
                        <span>{item.label}</span>
                        <ChevronDown className={cn('ml-auto h-4 w-4 transition-transform', isOpen ? 'rotate-180' : '')} />
                      </button>
                      {isOpen && (
                        <div className="ml-8 space-y-1">
                          {item.children?.map((child) => {
                            const isChildActive = location.pathname === child.path;
                            return (
                              <Link
                                key={child.path}
                                to={child.path}
                                onClick={() => setOpen(false)}
                                className={cn(
                                  'block rounded-md px-3 py-1.5 text-sm transition-colors',
                                  isChildActive
                                    ? 'bg-muted text-foreground font-medium'
                                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                                )}
                              >
                                {child.label}
                              </Link>
                            );
                          })}
                        </div>
                      )}
                    </>
                  ) : (
                    <Link
                      to={item.path}
                      onClick={() => setOpen(false)}
                      className={cn(
                        'flex items-center gap-3 px-3 py-2 rounded-lg transition-colors',
                        isActive
                          ? 'bg-muted text-foreground font-medium'
                          : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                      )}
                    >
                      <Icon className="h-5 w-5 flex-shrink-0" />
                      <span>{item.label}<ItemCount count={sidebarCounts[item.path]} /></span>
                    </Link>
                  )}
                </div>
              );
            })}
          </nav>
        </div>
      </SheetContent>
    </Sheet>
  );
}
