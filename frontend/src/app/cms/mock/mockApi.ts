// Mock API service that returns promises with delays

import {
  mockTrips,
  mockBlogPosts,
  mockBookings,
  mockContacts,
  mockTeamMembers,
  mockTestimonials,
  mockImpactMetrics,
  mockMediaItems,
  mockActivities,
  type MockTrip,
  type MockBlogPost,
  type MockBooking,
  type MockContact,
  type MockTeamMember,
  type MockTestimonial,
  type MockImpactMetric,
  type MockMediaItem,
  type MockActivity,
} from './mockData';

// Simulate network delay
const delay = (ms: number = 500) => new Promise((resolve) => setTimeout(resolve, ms));

export const mockApi = {
  // Trips
  trips: {
    getAll: async (params?: { status?: string; category?: string; search?: string; page?: number; limit?: number }) => {
      await delay(600);
      let data = [...mockTrips];

      if (params?.status) {
        data = data.filter((t) => t.status === params.status);
      }
      if (params?.category) {
        data = data.filter((t) => t.category === params.category);
      }
      if (params?.search) {
        const search = params.search.toLowerCase();
        data = data.filter((t) => t.title.toLowerCase().includes(search) || t.slug.toLowerCase().includes(search));
      }

      const page = params?.page || 1;
      const limit = params?.limit || 10;
      const start = (page - 1) * limit;
      const end = start + limit;

      return {
        data: data.slice(start, end),
        total: data.length,
        page,
        limit,
        totalPages: Math.ceil(data.length / limit),
      };
    },
    getById: async (id: string) => {
      await delay(400);
      return mockTrips.find((t) => t._id === id) || null;
    },
    create: async (trip: Partial<MockTrip>) => {
      await delay(800);
      return { ...trip, _id: String(Date.now()), createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
    },
    update: async (id: string, updates: Partial<MockTrip>) => {
      await delay(600);
      return { ...updates, _id: id, updatedAt: new Date().toISOString() };
    },
    delete: async (id: string) => {
      await delay(400);
      return { success: true };
    },
  },

  // Blog
  blog: {
    getAll: async (params?: { status?: string; search?: string; page?: number; limit?: number }) => {
      await delay(600);
      let data = [...mockBlogPosts];

      if (params?.status) {
        data = data.filter((p) => p.status === params.status);
      }
      if (params?.search) {
        const search = params.search.toLowerCase();
        data = data.filter((p) => p.title.toLowerCase().includes(search) || p.slug.toLowerCase().includes(search));
      }

      const page = params?.page || 1;
      const limit = params?.limit || 10;
      const start = (page - 1) * limit;
      const end = start + limit;

      return {
        data: data.slice(start, end),
        total: data.length,
        page,
        limit,
        totalPages: Math.ceil(data.length / limit),
      };
    },
    getById: async (id: string) => {
      await delay(400);
      return mockBlogPosts.find((p) => p._id === id) || null;
    },
    create: async (post: Partial<MockBlogPost>) => {
      await delay(800);
      return { ...post, _id: String(Date.now()), createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
    },
    update: async (id: string, updates: Partial<MockBlogPost>) => {
      await delay(600);
      return { ...updates, _id: id, updatedAt: new Date().toISOString() };
    },
    delete: async (id: string) => {
      await delay(400);
      return { success: true };
    },
  },

  // Bookings
  bookings: {
    getAll: async (params?: { status?: string; search?: string; page?: number; limit?: number }) => {
      await delay(600);
      let data = [...mockBookings];

      if (params?.status) {
        data = data.filter((b) => b.status === params.status);
      }
      if (params?.search) {
        const search = params.search.toLowerCase();
        data = data.filter((b) => b.customerName.toLowerCase().includes(search) || b.tripTitle.toLowerCase().includes(search));
      }

      const page = params?.page || 1;
      const limit = params?.limit || 10;
      const start = (page - 1) * limit;
      const end = start + limit;

      return {
        data: data.slice(start, end),
        total: data.length,
        page,
        limit,
        totalPages: Math.ceil(data.length / limit),
      };
    },
    getById: async (id: string) => {
      await delay(400);
      return mockBookings.find((b) => b._id === id) || null;
    },
    updateStatus: async (id: string, status: string) => {
      await delay(400);
      return { _id: id, status };
    },
  },

  // Contact
  contact: {
    getAll: async (params?: { status?: string; search?: string; page?: number; limit?: number }) => {
      await delay(600);
      let data = [...mockContacts];

      if (params?.status) {
        data = data.filter((c) => c.status === params.status);
      }
      if (params?.search) {
        const search = params.search.toLowerCase();
        data = data.filter((c) => c.name.toLowerCase().includes(search) || c.email.toLowerCase().includes(search));
      }

      const page = params?.page || 1;
      const limit = params?.limit || 10;
      const start = (page - 1) * limit;
      const end = start + limit;

      return {
        data: data.slice(start, end),
        total: data.length,
        page,
        limit,
        totalPages: Math.ceil(data.length / limit),
      };
    },
    getById: async (id: string) => {
      await delay(400);
      return mockContacts.find((c) => c._id === id) || null;
    },
    updateStatus: async (id: string, status: string) => {
      await delay(400);
      return { _id: id, status };
    },
  },

  // Team
  team: {
    getAll: async () => {
      await delay(400);
      return mockTeamMembers.sort((a, b) => a.order - b.order);
    },
    getById: async (id: string) => {
      await delay(400);
      return mockTeamMembers.find((m) => m._id === id) || null;
    },
    create: async (member: Partial<MockTeamMember>) => {
      await delay(600);
      return { ...member, _id: String(Date.now()), createdAt: new Date().toISOString() };
    },
    update: async (id: string, updates: Partial<MockTeamMember>) => {
      await delay(600);
      return { ...updates, _id: id };
    },
    delete: async (id: string) => {
      await delay(400);
      return { success: true };
    },
  },

  // Testimonials
  testimonials: {
    getAll: async (params?: { status?: string; page?: number; limit?: number }) => {
      await delay(600);
      let data = [...mockTestimonials];

      if (params?.status) {
        data = data.filter((t) => t.status === params.status);
      }

      const page = params?.page || 1;
      const limit = params?.limit || 10;
      const start = (page - 1) * limit;
      const end = start + limit;

      return {
        data: data.slice(start, end),
        total: data.length,
        page,
        limit,
        totalPages: Math.ceil(data.length / limit),
      };
    },
    approve: async (id: string) => {
      await delay(400);
      return { _id: id, status: 'approved' };
    },
    reject: async (id: string) => {
      await delay(400);
      return { _id: id, status: 'rejected' };
    },
    toggleFeatured: async (id: string, featured: boolean) => {
      await delay(400);
      return { _id: id, featured };
    },
  },

  // Impact
  impact: {
    getAll: async () => {
      await delay(400);
      return mockImpactMetrics.sort((a, b) => a.order - b.order);
    },
    update: async (id: string, updates: Partial<MockImpactMetric>) => {
      await delay(600);
      return { ...updates, _id: id };
    },
  },

  // Media
  media: {
    getAll: async (params?: { type?: string; search?: string; page?: number; limit?: number }) => {
      await delay(600);
      let data = [...mockMediaItems];

      if (params?.type) {
        data = data.filter((m) => m.type === params.type);
      }
      if (params?.search) {
        const search = params.search.toLowerCase();
        data = data.filter((m) => m.filename.toLowerCase().includes(search));
      }

      const page = params?.page || 1;
      const limit = params?.limit || 20;
      const start = (page - 1) * limit;
      const end = start + limit;

      return {
        data: data.slice(start, end),
        total: data.length,
        page,
        limit,
        totalPages: Math.ceil(data.length / limit),
      };
    },
    delete: async (id: string) => {
      await delay(400);
      return { success: true };
    },
  },

  // Dashboard
  dashboard: {
    getStats: async () => {
      await delay(500);
      return {
        totalTrips: mockTrips.length,
        publishedTrips: mockTrips.filter((t) => t.status === 'published').length,
        bookings30d: mockBookings.filter((b) => {
          const date = new Date(b.createdAt);
          const now = new Date();
          const diff = now.getTime() - date.getTime();
          return diff <= 30 * 24 * 60 * 60 * 1000;
        }).length,
        revenue: mockBookings.filter((b) => b.status === 'confirmed').reduce((sum, b) => sum + b.totalAmount, 0),
        newContacts: mockContacts.filter((c) => c.status === 'new').length,
        pendingTestimonials: mockTestimonials.filter((t) => t.status === 'pending').length,
      };
    },
    getActivities: async (limit: number = 10) => {
      await delay(400);
      return mockActivities.slice(0, limit);
    },
    getPendingApprovals: async () => {
      await delay(400);
      return {
        testimonials: mockTestimonials.filter((t) => t.status === 'pending'),
        draftTrips: mockTrips.filter((t) => t.status === 'draft'),
        draftPosts: mockBlogPosts.filter((p) => p.status === 'draft'),
      };
    },
    getBookingChart: async () => {
      await delay(500);
      // Mock chart data for last 7 days
      const days = [];
      for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        days.push({
          date: date.toISOString().split('T')[0],
          bookings: Math.floor(Math.random() * 5),
        });
      }
      return days;
    },
    getTripsByCategory: async () => {
      await delay(400);
      const categories = ['trek', 'experience', 'retreat', 'short-activity'];
      return categories.map((cat) => ({
        category: cat,
        count: mockTrips.filter((t) => t.category === cat).length,
      }));
    },
  },
};

