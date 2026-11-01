import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { StatCard } from '../components/StatCard';
import { Button } from '../../components/ui/button';
import { Skeleton } from '../../components/ui/skeleton';
import { StatCardSkeleton } from '../components/Skeletons';
import { Plus, MapPin, FileText, Image } from 'lucide-react';
import { Link } from 'react-router-dom';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../components/ui/table';
import { StatusBadge } from '../components/StatusBadge';
import { format } from 'date-fns';
import { bookingApi, contactApi, testimonialsApi, tripsApi, blogAdminApi } from '../../services/api';

export function DashboardPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>(null);
  const [activities, setActivities] = useState<any[]>([]);
  const [pendingApprovals, setPendingApprovals] = useState<any>(null);
  const [bookingChart, setBookingChart] = useState<any[]>([]);
  const [tripsByCategory, setTripsByCategory] = useState<any[]>([]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [
          allTripsMeta,
          publishedTripsMeta,
          draftTripsMeta,
          draftTripsList,
          draftPostsMeta,
          draftPostsList,
          pendingTestimonials,
          newContactsMeta,
          bookingsRecent,
          tripsForCategory,
        ] = await Promise.all([
          tripsApi.getAllWithMeta({ status: 'all', page: 1, limit: 1 }),
          tripsApi.getAllWithMeta({ status: 'published', page: 1, limit: 1 }),
          tripsApi.getAllWithMeta({ status: 'draft', page: 1, limit: 1 }),
          tripsApi.getAllWithMeta({ status: 'draft', page: 1, limit: 5 }),
          blogAdminApi.getAll({ status: 'draft', page: 1, limit: 1 }),
          blogAdminApi.getAll({ status: 'draft', page: 1, limit: 5 }),
          testimonialsApi.getAll({ status: 'pending', limit: 5 }),
          contactApi.getAll({ status: 'new', page: 1, limit: 1 }),
          bookingApi.getAll({ page: 1, limit: 200 }),
          tripsApi.getAll({ status: 'all', page: 1, limit: 200 }),
        ]);

        const totalTrips = allTripsMeta.meta?.pagination?.total ?? allTripsMeta.data?.length ?? 0;
        const publishedTrips = publishedTripsMeta.meta?.pagination?.total ?? 0;
        const draftTrips = draftTripsMeta.meta?.pagination?.total ?? 0;
        const draftPosts = draftPostsMeta.meta?.pagination?.total ?? 0;
        const pendingTestimonialsCount = Array.isArray(pendingTestimonials)
          ? pendingTestimonials.length
          : 0;
        const newContacts = newContactsMeta.meta?.pagination?.total ?? 0;

        const bookings = bookingsRecent.data || [];
        const now = new Date();
        const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        const bookings30d = bookings.filter((booking: any) => {
          const createdAt = booking.createdAt ? new Date(booking.createdAt) : null;
          return createdAt && createdAt >= thirtyDaysAgo;
        });
        const confirmedRevenue = bookings30d
          .filter((booking: any) => booking.status === 'confirmed' || booking.paymentStatus === 'paid')
          .reduce((sum: number, booking: any) => sum + (booking.totalPrice || 0), 0);

        setStats({
          totalTrips,
          publishedTrips,
          bookings30d: bookings30d.length,
          revenue: confirmedRevenue,
          newContacts,
          pendingTestimonials: pendingTestimonialsCount,
        });

        const activityItems: any[] = [];
        const tripActivities = (draftTripsList.data || []).map((trip: any) => ({
          id: `trip-${trip._id}`,
          action: `Created new trip: ${trip.title}`,
          timestamp: trip.createdAt,
        }));
        const bookingActivities = bookings
          .slice(0, 5)
          .map((booking: any) => ({
            id: `booking-${booking._id}`,
            action: `New booking from ${booking.guestInfo?.name || booking.user?.name || 'Guest'}`,
            timestamp: booking.createdAt,
          }));
        const testimonialActivities = (pendingTestimonials || []).slice(0, 5).map((testimonial: any) => ({
          id: `testimonial-${testimonial._id}`,
          action: `New testimonial pending approval`,
          timestamp: testimonial.createdAt,
        }));
        activityItems.push(...tripActivities, ...bookingActivities, ...testimonialActivities);
        const filteredActivities = activityItems.filter((item) => item.timestamp);
        filteredActivities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
        setActivities(filteredActivities.slice(0, 6));

        setPendingApprovals({
          testimonials: pendingTestimonials || [],
          draftTrips: draftTripsList.data || [],
          draftPosts: draftPostsList.data || [],
        });

        const chartDays = Array.from({ length: 7 }).map((_, index) => {
          const date = new Date();
          date.setDate(date.getDate() - (6 - index));
          const labelDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
          return {
            date: labelDate.toISOString(),
            bookings: 0,
          };
        });
        bookings30d.forEach((booking: any) => {
          const createdAt = booking.createdAt ? new Date(booking.createdAt) : null;
          if (!createdAt) return;
          const dayKey = new Date(createdAt.getFullYear(), createdAt.getMonth(), createdAt.getDate()).toISOString();
          const dayEntry = chartDays.find((day) => day.date === dayKey);
          if (dayEntry) {
            dayEntry.bookings += 1;
          }
        });
        setBookingChart(chartDays);

        const tripsList = Array.isArray(tripsForCategory) ? tripsForCategory : [];
        const categoryCounts = tripsList.reduce((acc: Record<string, number>, trip: any) => {
          const label =
            trip.categoryLabel ||
            trip.category?.label ||
            trip.category?.slug ||
            'uncategorized';
          const key = String(label).toLowerCase();
          acc[key] = (acc[key] || 0) + 1;
          return acc;
        }, {});
        const categoryData = Object.entries(categoryCounts).map(([category, count]) => ({
          category,
          count,
        }));
        categoryData.sort((a, b) => b.count - a.count);
        setTripsByCategory(categoryData);
      } catch (error) {
        console.error('Error loading dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  return (
    <div
      className="space-y-6"
      style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Inter, sans-serif' }}
    >
      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Button
          asChild
          className="h-auto p-4 flex flex-col items-start gap-2 rounded-2xl border border-white/60 shadow-[0_8px_18px_rgba(15,23,42,0.12)] text-white hover:opacity-95"
          style={{ backgroundColor: 'var(--cms-primary)', color: 'var(--cms-primary-foreground)' }}
        >
          <Link to="/cms/trips/new">
            <div className="flex items-center gap-2">
              <MapPin size={20} />
              <span className="font-semibold">Create Trip</span>
            </div>
            <p className="text-sm opacity-90 text-left">Add a new trip to your catalog</p>
          </Link>
        </Button>
        <Button
          asChild
          variant="outline"
          className="h-auto p-4 flex flex-col items-start gap-2 rounded-2xl border border-slate-200/70 bg-white/90 shadow-sm hover:bg-white"
        >
          <Link to="/cms/blog/new">
            <div className="flex items-center gap-2">
              <FileText size={20} />
              <span className="font-semibold">Create Blog Post</span>
            </div>
            <p className="text-sm text-muted-foreground text-left">Write a new blog post</p>
          </Link>
        </Button>
        <Button
          asChild
          variant="outline"
          className="h-auto p-4 flex flex-col items-start gap-2 rounded-2xl border border-slate-200/70 bg-white/90 shadow-sm hover:bg-white"
        >
          <Link to="/cms/media">
            <div className="flex items-center gap-2">
              <Image size={20} />
              <span className="font-semibold">Upload Media</span>
            </div>
            <p className="text-sm text-muted-foreground text-left">Add images and videos</p>
          </Link>
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {loading ? (
          <>
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
          </>
        ) : stats ? (
          <>
            <StatCard
              title="Total Trips"
              value={stats.totalTrips}
              description="All trips in catalog"
              className="rounded-2xl border-slate-200/70 bg-white/90 shadow-sm hover:bg-white"
            />
            <StatCard
              title="Published"
              value={stats.publishedTrips}
              description="Live trips"
              className="rounded-2xl border-slate-200/70 bg-white/90 shadow-sm hover:bg-white"
            />
            <StatCard
              title="Bookings (30d)"
              value={stats.bookings30d}
              description="Last 30 days"
              className="rounded-2xl border-slate-200/70 bg-white/90 shadow-sm hover:bg-white"
            />
            <StatCard
              title="Revenue"
              value={`US $${stats.revenue.toLocaleString()}`}
              description="Confirmed bookings"
              className="rounded-2xl border-slate-200/70 bg-white/90 shadow-sm hover:bg-white"
            />
            <StatCard
              title="New Contacts"
              value={stats.newContacts}
              description="Unread messages"
              className="rounded-2xl border-slate-200/70 bg-white/90 shadow-sm hover:bg-white"
            />
            <StatCard
              title="Pending Reviews"
              value={stats.pendingTestimonials}
              description="Awaiting approval"
              className="rounded-2xl border-slate-200/70 bg-white/90 shadow-sm hover:bg-white"
            />
          </>
        ) : null}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <Card className="rounded-2xl border-slate-200/70 bg-white/90 shadow-sm">
          <CardHeader>
            <CardTitle className="text-[var(--cms-foreground)]" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Inter, sans-serif' }}>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {activities.length === 0 ? (
                <p className="text-sm text-muted-foreground">No recent activity</p>
              ) : (
                activities.map((activity) => (
                  <div key={activity.id} className="flex items-start gap-3 pb-4 border-b border-slate-200/70 last:border-0">
                    <div className="w-2 h-2 rounded-full bg-[var(--cms-primary)] mt-2" />
                    <div className="flex-1">
                      <p className="text-sm">{activity.action}</p>
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(activity.timestamp), 'MMM d, yyyy h:mm a')}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Pending Approvals */}
        <Card className="rounded-2xl border-slate-200/70 bg-white/90 shadow-sm">
          <CardHeader>
            <CardTitle className="text-[var(--cms-foreground)]" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Inter, sans-serif' }}>Pending Approvals</CardTitle>
          </CardHeader>
          <CardContent>
            {pendingApprovals ? (
              <div className="space-y-4">
                {pendingApprovals.testimonials.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium mb-2">Testimonials ({pendingApprovals.testimonials.length})</h4>
                    <div className="space-y-2">
                      {pendingApprovals.testimonials.slice(0, 3).map((t: any) => (
                        <div key={t._id} className="flex items-center justify-between p-2 rounded-xl border border-slate-200/70 bg-slate-50/80">
                          <span className="text-sm text-[var(--cms-foreground)]">{t.authorName}</span>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => navigate(`/cms/testimonials`)}
                            className="border-slate-200/70 bg-white"
                          >
                            Review
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {pendingApprovals.draftTrips.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium mb-2">Draft Trips ({pendingApprovals.draftTrips.length})</h4>
                    <div className="space-y-2">
                      {pendingApprovals.draftTrips.slice(0, 2).map((t: any) => (
                        <div key={t._id} className="flex items-center justify-between p-2 rounded-xl border border-slate-200/70 bg-slate-50/80">
                          <span className="text-sm">{t.title}</span>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => navigate(`/cms/trips/${t._id}`)}
                            className="border-slate-200/70 bg-white"
                          >
                            Edit
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {pendingApprovals.draftPosts.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium mb-2">Draft Posts ({pendingApprovals.draftPosts.length})</h4>
                    <div className="space-y-2">
                      {pendingApprovals.draftPosts.slice(0, 2).map((p: any) => (
                        <div key={p._id} className="flex items-center justify-between p-2 rounded-xl border border-slate-200/70 bg-slate-50/80">
                          <span className="text-sm">{p.title}</span>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => navigate(`/cms/blog/${p._id}`)}
                            className="border-slate-200/70 bg-white"
                          >
                            Edit
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {pendingApprovals.testimonials.length === 0 &&
                  pendingApprovals.draftTrips.length === 0 &&
                  pendingApprovals.draftPosts.length === 0 && (
                    <p className="text-sm text-muted-foreground">No pending approvals</p>
                  )}
              </div>
            ) : (
              <div className="space-y-3">
                <Skeleton className="h-4 w-40" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bookings Chart */}
        <Card className="rounded-2xl border-slate-200/70 bg-white/90 shadow-sm">
          <CardHeader>
            <CardTitle className="text-[var(--cms-foreground)]" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Inter, sans-serif' }}>Bookings Over Time</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-end justify-between gap-2">
              {bookingChart.map((day, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-2">
                  <div
                    className="w-full rounded-t transition-all hover:opacity-80"
                    style={{
                      height: `${
                        (day.bookings /
                          Math.max(1, ...bookingChart.map((d) => d.bookings))) * 200
                      }px`,
                      backgroundColor: 'var(--cms-primary)',
                      minHeight: '4px',
                    }}
                  />
                  <span className="text-xs text-muted-foreground">
                    {format(new Date(day.date), 'MMM d')}
                  </span>
                  <span className="text-xs font-medium">{day.bookings}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Trips by Category */}
        <Card className="rounded-2xl border-slate-200/70 bg-white/90 shadow-sm">
          <CardHeader>
            <CardTitle className="text-[var(--cms-foreground)]" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Inter, sans-serif' }}>Trips by Category</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {tripsByCategory.map((item) => (
                <div key={item.category} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium capitalize">{item.category}</span>
                    <span className="text-sm text-muted-foreground">{item.count} trips</span>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${
                          (item.count /
                            Math.max(1, ...tripsByCategory.map((i) => i.count))) * 100
                        }%`,
                        backgroundColor: 'var(--cms-primary)',
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
