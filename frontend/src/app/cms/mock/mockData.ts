// Mock data for CMS

export interface MockTrip {
  _id: string;
  title: string;
  slug: string;
  category: 'trek' | 'experience' | 'retreat' | 'short-activity';
  tripType?: string;
  status: 'draft' | 'published' | 'archived';
  featured: boolean;
  country: string;
  region: string;
  duration: number;
  difficulty: 'easy' | 'moderate' | 'challenging' | 'extreme';
  price: number;
  createdAt: string;
  updatedAt: string;
}

export interface MockBlogPost {
  _id: string;
  title: string;
  slug: string;
  excerpt: string;
  category: string;
  tags: string[];
  status: 'draft' | 'published' | 'archived';
  featured: boolean;
  author: string;
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface MockBooking {
  _id: string;
  tripId: string;
  tripTitle: string;
  customerName: string;
  customerEmail: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  participants: number;
  totalAmount: number;
  bookingDate: string;
  tripDate: string;
  createdAt: string;
}

export interface MockContact {
  _id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: 'new' | 'read' | 'replied' | 'archived';
  createdAt: string;
}

export interface MockTeamMember {
  _id: string;
  name: string;
  role: string;
  bio: string;
  image?: string;
  order: number;
  active: boolean;
  createdAt: string;
}

export interface MockTestimonial {
  _id: string;
  authorName: string;
  authorLocation: string;
  content: string;
  rating: number;
  status: 'pending' | 'approved' | 'rejected';
  featured: boolean;
  tripId?: string;
  createdAt: string;
}

export interface MockImpactMetric {
  _id: string;
  title: string;
  value: string;
  description: string;
  icon: string;
  order: number;
  active: boolean;
}

export interface MockMediaItem {
  _id: string;
  filename: string;
  url: string;
  type: 'image' | 'video' | 'document';
  size: number;
  alt?: string;
  uploadedAt: string;
}

export interface MockActivity {
  id: string;
  type: 'trip' | 'blog' | 'booking' | 'testimonial';
  action: string;
  user: string;
  timestamp: string;
}

// Mock data generators
export const mockTrips: MockTrip[] = [
  {
    _id: '1',
    title: 'Alpine High Route',
    slug: 'everest-base-camp-trek',
    category: 'trek',
    tripType: 'trekking',
    status: 'published',
    featured: true,
    country: 'Norway',
    region: 'Lofoten',
    duration: 14,
    difficulty: 'challenging',
    price: 1850,
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-02-20T14:30:00Z',
  },
  {
    _id: '2',
    title: 'Coastal Cliff Walk',
    slug: 'annapurna-circuit',
    category: 'trek',
    tripType: 'trekking',
    status: 'published',
    featured: true,
    country: 'Norway',
    region: 'Jotunheimen',
    duration: 18,
    difficulty: 'challenging',
    price: 2200,
    createdAt: '2024-01-10T09:00:00Z',
    updatedAt: '2024-02-18T11:20:00Z',
  },
  {
    _id: '3',
    title: 'City Food Tour',
    slug: 'kathmandu-food-tour',
    category: 'short-activity',
    tripType: 'food-tour',
    status: 'published',
    featured: false,
    country: 'Norway',
    region: 'Old Town',
    duration: 0.5,
    difficulty: 'easy',
    price: 45,
    createdAt: '2024-02-01T08:00:00Z',
    updatedAt: '2024-02-15T16:45:00Z',
  },
  {
    _id: '4',
    title: 'Yoga Retreat in Bali',
    slug: 'yoga-retreat-pokhara',
    category: 'retreat',
    tripType: 'yoga-retreat',
    status: 'draft',
    featured: false,
    country: 'Norway',
    region: 'Lake District',
    duration: 7,
    difficulty: 'easy',
    price: 850,
    createdAt: '2024-02-10T12:00:00Z',
    updatedAt: '2024-02-22T10:15:00Z',
  },
  {
    _id: '5',
    title: 'Cultural Immersion in Bhaktapur',
    slug: 'cultural-immersion-bhaktapur',
    category: 'experience',
    tripType: 'cultural',
    status: 'published',
    featured: true,
    country: 'Norway',
    region: 'Bhaktapur',
    duration: 3,
    difficulty: 'easy',
    price: 320,
    createdAt: '2024-01-20T11:00:00Z',
    updatedAt: '2024-02-19T09:30:00Z',
  },
];

export const mockBlogPosts: MockBlogPost[] = [
  {
    _id: '1',
    title: '10 Essential Items for Your First Trek abroad',
    slug: '10-essential-items-first-trek-nepal',
    excerpt: 'Everything you need to know before embarking on your first mountain adventure.',
    category: 'Travel Tips',
    tags: ['trekking', 'nepal', 'gear'],
    status: 'published',
    featured: true,
    author: 'Admin',
    publishedAt: '2024-02-15T10:00:00Z',
    createdAt: '2024-02-10T08:00:00Z',
    updatedAt: '2024-02-15T10:00:00Z',
  },
  {
    _id: '2',
    title: 'Responsible Trail Etiquette',
    slug: 'sustainable-tourism-himalayas',
    excerpt: 'How we\'re working to preserve the beauty of the mountains for future generations.',
    category: 'Sustainability',
    tags: ['sustainability', 'environment'],
    status: 'published',
    featured: false,
    author: 'Admin',
    publishedAt: '2024-02-12T14:00:00Z',
    createdAt: '2024-02-08T09:00:00Z',
    updatedAt: '2024-02-12T14:00:00Z',
  },
  {
    _id: '3',
    title: 'The Best Time to Visit Norway',
    slug: 'best-time-visit-nepal',
    excerpt: 'A comprehensive guide to planning your trip based on weather and seasons.',
    category: 'Travel Guide',
    tags: ['nepal', 'travel-guide', 'seasons'],
    status: 'draft',
    featured: false,
    author: 'Admin',
    createdAt: '2024-02-20T11:00:00Z',
    updatedAt: '2024-02-22T15:30:00Z',
  },
];

export const mockBookings: MockBooking[] = [
  {
    _id: '1',
    tripId: '1',
    tripTitle: 'Alpine High Route',
    customerName: 'John Smith',
    customerEmail: 'john@example.com',
    status: 'confirmed',
    participants: 2,
    totalAmount: 3700,
    bookingDate: '2024-02-20T10:00:00Z',
    tripDate: '2024-03-15T08:00:00Z',
    createdAt: '2024-02-20T10:00:00Z',
  },
  {
    _id: '2',
    tripId: '3',
    tripTitle: 'City Food Tour',
    customerName: 'Sarah Johnson',
    customerEmail: 'sarah@example.com',
    status: 'pending',
    participants: 1,
    totalAmount: 45,
    bookingDate: '2024-02-22T14:30:00Z',
    tripDate: '2024-02-25T12:00:00Z',
    createdAt: '2024-02-22T14:30:00Z',
  },
  {
    _id: '3',
    tripId: '5',
    tripTitle: 'Cultural Immersion in Bhaktapur',
    customerName: 'Michael Chen',
    customerEmail: 'michael@example.com',
    status: 'confirmed',
    participants: 4,
    totalAmount: 1280,
    bookingDate: '2024-02-18T09:15:00Z',
    tripDate: '2024-03-01T10:00:00Z',
    createdAt: '2024-02-18T09:15:00Z',
  },
];

export const mockContacts: MockContact[] = [
  {
    _id: '1',
    name: 'Emma Wilson',
    email: 'emma@example.com',
    subject: 'Group booking inquiry',
    message: 'We are a group of 8 people interested in booking the Coastal Cliff Walk trek for May 2024.',
    status: 'new',
    createdAt: '2024-02-22T16:00:00Z',
  },
  {
    _id: '2',
    name: 'David Brown',
    email: 'david@example.com',
    subject: 'Custom itinerary request',
    message: 'I would like to create a custom 10-day itinerary combining trekking and cultural experiences.',
    status: 'read',
    createdAt: '2024-02-21T11:30:00Z',
  },
  {
    _id: '3',
    name: 'Lisa Anderson',
    email: 'lisa@example.com',
    subject: 'Payment question',
    message: 'What payment methods do you accept for international bookings?',
    status: 'replied',
    createdAt: '2024-02-20T09:00:00Z',
  },
];

export const mockTeamMembers: MockTeamMember[] = [
  {
    _id: '1',
    name: 'Rajesh Thapa',
    role: 'Founder & Lead Guide',
    bio: 'With over 20 years of experience in the mountains...',
    order: 1,
    active: true,
    createdAt: '2024-01-01T00:00:00Z',
  },
  {
    _id: '2',
    name: 'Sita Rai',
    role: 'Operations Manager',
    bio: 'Ensuring smooth operations and customer satisfaction...',
    order: 2,
    active: true,
    createdAt: '2024-01-01T00:00:00Z',
  },
];

export const mockTestimonials: MockTestimonial[] = [
  {
    _id: '1',
    authorName: 'John Smith',
    authorLocation: 'USA',
    content: 'An incredible experience! The guides were knowledgeable and the scenery was breathtaking.',
    rating: 5,
    status: 'approved',
    featured: true,
    tripId: '1',
    createdAt: '2024-02-15T10:00:00Z',
  },
  {
    _id: '2',
    authorName: 'Sarah Johnson',
    authorLocation: 'UK',
    content: 'The food tour was amazing! We learned so much about local cuisine.',
    rating: 5,
    status: 'pending',
    featured: false,
    tripId: '3',
    createdAt: '2024-02-20T14:00:00Z',
  },
];

export const mockImpactMetrics: MockImpactMetric[] = [
  {
    _id: '1',
    title: 'Trees Planted',
    value: '15,000+',
    description: 'Through our reforestation initiatives',
    icon: 'tree',
    order: 1,
    active: true,
  },
  {
    _id: '2',
    title: 'Local Communities Supported',
    value: '50+',
    description: 'Villages and communities we work with',
    icon: 'community',
    order: 2,
    active: true,
  },
];

export const mockMediaItems: MockMediaItem[] = [
  {
    _id: '1',
    filename: 'everest-sunrise.jpg',
    url: 'https://images.unsplash.com/photo-1571401847270-78ab5f316800',
    type: 'image',
    size: 2456789,
    alt: 'Sunrise over the ridge',
    uploadedAt: '2024-02-15T10:00:00Z',
  },
  {
    _id: '2',
    filename: 'annapurna-circuit.mp4',
    url: 'https://example.com/video.mp4',
    type: 'video',
    size: 45678901,
    uploadedAt: '2024-02-10T14:00:00Z',
  },
];

export const mockActivities: MockActivity[] = [
  {
    id: '1',
    type: 'trip',
    action: 'Created new trip: Alpine High Route',
    user: 'Admin',
    timestamp: '2024-02-22T10:00:00Z',
  },
  {
    id: '2',
    type: 'booking',
    action: 'New booking from John Smith',
    user: 'System',
    timestamp: '2024-02-22T09:30:00Z',
  },
  {
    id: '3',
    type: 'testimonial',
    action: 'New testimonial pending approval',
    user: 'System',
    timestamp: '2024-02-22T08:15:00Z',
  },
];

