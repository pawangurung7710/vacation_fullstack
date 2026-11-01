// API service for The Trekkers Squad backend

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const API_ORIGIN = API_BASE_URL.replace(/\/api\/v\d+$/, '').replace(/\/api$/, '');

interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  errors?: any[];
  meta?: any;
}

class ApiError extends Error {
  constructor(
    message: string,
    public status?: number,
    public errors?: any[]
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

let isRefreshing = false;
let refreshPromise: Promise<string | null> | null = null;

/**
 * Short-lived client cache for GET responses.
 *
 * The API lives on a single EU VPS and every call is a full browser->origin round-trip.
 * This app has no react-query/SWR, so without this each component mount re-fetches the
 * same lists and lookups. We keep successful GET payloads for a minute and de-dupe
 * in-flight identical requests (also kills the React 18 StrictMode double-fetch).
 *
 * Anything mutating (POST/PUT/PATCH/DELETE) clears the cache so the next read is fresh.
 */
const GET_CACHE_TTL = 60_000;
const MAX_CACHE_ENTRIES = 200;

type CacheEntry = { at: number; value: unknown };
const getCache = new Map<string, CacheEntry>();
const inFlight = new Map<string, Promise<unknown>>();

/** Drop everything — called after any write, and on logout/login. */
export function clearApiCache(): void {
  getCache.clear();
  inFlight.clear();
}

function cacheKey(kind: 'plain' | 'meta', url: string): string {
  const token = (() => {
    try {
      return localStorage.getItem('accessToken') || '';
    } catch {
      return '';
    }
  })();
  // token length is enough to bust the cache across login/logout without keeping the token around
  return `${kind}:${token.length}:${url}`;
}

async function withGetCache<T>(key: string, producer: () => Promise<T>): Promise<T> {
  const hit = getCache.get(key);
  if (hit && Date.now() - hit.at < GET_CACHE_TTL) {
    return hit.value as T;
  }

  const pending = inFlight.get(key);
  if (pending) {
    return pending as Promise<T>;
  }

  const promise = (async () => {
    const value = await producer();
    if (getCache.size >= MAX_CACHE_ENTRIES) {
      const oldest = getCache.keys().next().value;
      if (oldest !== undefined) getCache.delete(oldest);
    }
    getCache.set(key, { at: Date.now(), value });
    return value;
  })();

  inFlight.set(key, promise);
  try {
    return await promise;
  } finally {
    inFlight.delete(key);
  }
}

function isReadRequest(options: RequestInit): boolean {
  const method = (options.method || 'GET').toUpperCase();
  return method === 'GET' || method === 'HEAD';
}

/**
 * Adopt any responses kicked off by the inline preload script in index.html (which runs
 * before this bundle is even parsed). Register them as in-flight so the first `request()`
 * for that path awaits the preload instead of firing its own fetch.
 */
(function adoptPreloads() {
  try {
    const pre = (window as any).__TREKKERS_PRELOAD__ as Record<string, Promise<any>> | undefined;
    if (!pre) return;
    for (const path of Object.keys(pre)) {
      const url = `${API_BASE_URL}${path}`;
      const key = cacheKey('plain', url);
      const p = Promise.resolve(pre[path]).then((json) => {
        // On a preload miss (null / non-2xx), fall through to a normal request so callers
        // awaiting this in-flight entry still get a real result.
        if (json && json.success === true) return json.data;
        return rawRequest(url, path, {}, true);
      });
      inFlight.set(key, p);
      p.then((value) => getCache.set(key, { at: Date.now(), value })).catch(() => {});
      p.finally(() => {
        if (inFlight.get(key) === p) inFlight.delete(key);
      });
    }
  } catch {
    /* preload is best-effort */
  }
})();

async function refreshAccessToken(): Promise<string | null> {
  if (isRefreshing && refreshPromise) {
    return refreshPromise;
  }

  const refreshToken = localStorage.getItem('refreshToken');
  if (!refreshToken) {
    return null;
  }

  isRefreshing = true;
  refreshPromise = (async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refreshToken }),
      });

      const data: ApiResponse<{ accessToken: string; refreshToken?: string; user?: any }> = await response.json();
      if (!response.ok || !data.success || !data.data?.accessToken) {
        return null;
      }

      const nextToken = data.data.accessToken;
      localStorage.setItem('accessToken', nextToken);
      if (data.data.refreshToken) {
        localStorage.setItem('refreshToken', data.data.refreshToken);
      }
      return nextToken;
    } catch (error) {
      return null;
    } finally {
      isRefreshing = false;
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}

function buildConfig(options: RequestInit): RequestInit {
  const config: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  let token: string | null = null;
  try {
    token = localStorage.getItem('accessToken');
  } catch {
    token = null;
  }
  if (token) {
    config.headers = {
      ...config.headers,
      Authorization: `Bearer ${token}`,
    };
  }
  return config;
}

// Raw fetch + envelope handling, with one transparent 401 -> refresh -> retry.
async function rawRequest<T>(
  url: string,
  endpoint: string,
  options: RequestInit,
  retry: boolean
): Promise<T> {
  try {
    const response = await fetch(url, buildConfig(options));
    const data: ApiResponse<T> = await response.json();

    if (!response.ok || !data.success) {
      if (response.status === 401 && retry) {
        const refreshed = await refreshAccessToken();
        if (refreshed) {
          return rawRequest<T>(url, endpoint, options, false);
        }
      }
      throw new ApiError(data.message || 'An error occurred', response.status, data.errors);
    }

    return data.data as T;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError('Network error or server unavailable');
  }
}

async function rawRequestWithMeta<T>(
  url: string,
  endpoint: string,
  options: RequestInit,
  retry: boolean
): Promise<{ data: T; meta?: any }> {
  try {
    const response = await fetch(url, buildConfig(options));
    const data: ApiResponse<T> = await response.json();

    if (!response.ok || !data.success) {
      if (response.status === 401 && retry) {
        const refreshed = await refreshAccessToken();
        if (refreshed) {
          return rawRequestWithMeta<T>(url, endpoint, options, false);
        }
      }
      throw new ApiError(data.message || 'An error occurred', response.status, data.errors);
    }

    return { data: data.data as T, meta: data.meta };
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError('Network error or server unavailable');
  }
}

// Generic API request function. GETs are served from the short-lived cache / in-flight
// de-dupe; any write clears that cache once it succeeds.
async function request<T>(
  endpoint: string,
  options: RequestInit = {},
  retry = true
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;

  if (isReadRequest(options)) {
    return withGetCache(cacheKey('plain', url), () => rawRequest<T>(url, endpoint, options, retry));
  }

  const result = await rawRequest<T>(url, endpoint, options, retry);
  clearApiCache();
  return result;
}

async function requestWithMeta<T>(
  endpoint: string,
  options: RequestInit = {},
  retry = true
): Promise<{ data: T; meta?: any }> {
  const url = `${API_BASE_URL}${endpoint}`;

  if (isReadRequest(options)) {
    return withGetCache(cacheKey('meta', url), () =>
      rawRequestWithMeta<T>(url, endpoint, options, retry)
    );
  }

  const result = await rawRequestWithMeta<T>(url, endpoint, options, retry);
  clearApiCache();
  return result;
}

// Trips API
export const tripsApi = {
  getAll: async (params?: {
    categoryId?: string;
    categorySlug?: string;
    subcategoryId?: string;
    subcategorySlug?: string;
    featured?: boolean;
    countryId?: string;
    country?: string;
    regionId?: string;
    region?: string;
    difficulty?: string;
    minPrice?: number | string;
    maxPrice?: number | string;
    minDuration?: number | string;
    maxDuration?: number | string;
    minDepartureDate?: string;
    maxDepartureDate?: string;
    page?: number;
    limit?: number;
    status?: string;
    search?: string;
    sort?: string;
    order?: string;
  }) => {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, String(value));
        }
      });
    }
    const query = queryParams.toString();
    return request<any[]>(`/trips${query ? `?${query}` : ''}`);
  },
  getAllWithMeta: async (params?: {
    categoryId?: string;
    categorySlug?: string;
    subcategoryId?: string;
    subcategorySlug?: string;
    featured?: boolean;
    countryId?: string;
    country?: string;
    regionId?: string;
    region?: string;
    difficulty?: string;
    minPrice?: number | string;
    maxPrice?: number | string;
    minDuration?: number | string;
    maxDuration?: number | string;
    minDepartureDate?: string;
    maxDepartureDate?: string;
    page?: number;
    limit?: number;
    status?: string;
    search?: string;
    sort?: string;
    order?: string;
  }) => {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, String(value));
        }
      });
    }
    const query = queryParams.toString();
    return requestWithMeta<any[]>(`/trips${query ? `?${query}` : ''}`);
  },

  getById: async (id: string) => {
    return request<any>(`/trips/${id}`);
  },

  getBySlug: async (slug: string) => {
    return request<any>(`/trips/slug/${slug}`);
  },
  incrementView: async (idOrSlug: string) => {
    return request<any>(`/trips/${idOrSlug}/view`, {
      method: 'POST',
    });
  },
  create: async (data: any) => {
    return request<any>('/trips', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
  update: async (id: string, data: any) => {
    return request<any>(`/trips/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },
  bulkUpdate: async (updates: Array<{ id: string; data: any }>) => {
    return request<any>('/trips/bulk', {
      method: 'POST',
      body: JSON.stringify({ updates }),
    });
  },
  duplicate: async (id: string) => {
    return request<any>(`/trips/${id}/duplicate`, {
      method: 'POST',
    });
  },
  delete: async (id: string) => {
    return request<any>(`/trips/${id}`, {
      method: 'DELETE',
    });
  },
};

// Blog API
export const blogApi = {
  getAll: async (params?: {
    category?: string;
    featured?: boolean;
    page?: number;
    limit?: number;
    search?: string;
  }) => {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, String(value));
        }
      });
    }
    const query = queryParams.toString();
    return request<any[]>(`/blogs${query ? `?${query}` : ''}`);
  },

  getAllWithMeta: async (params?: {
    category?: string;
    featured?: boolean;
    page?: number;
    limit?: number;
    search?: string;
  }) => {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, String(value));
        }
      });
    }
    const query = queryParams.toString();
    return requestWithMeta<any[]>(`/blogs${query ? `?${query}` : ''}`);
  },

  getBySlug: async (slug: string) => {
    return request<any>(`/blogs/${slug}`);
  },

  getFeatured: async (limit?: number) => {
    const query = limit ? `?limit=${limit}` : '';
    return request<any[]>(`/blogs/featured${query}`);
  },
};

// Blog Admin API
export const blogAdminApi = {
  getAll: async (params?: {
    status?: string;
    category?: string;
    featured?: boolean;
    search?: string;
    page?: number;
    limit?: number;
  }) => {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          queryParams.append(key, String(value));
        }
      });
    }
    const query = queryParams.toString();
    return requestWithMeta<any[]>(`/admin/blogs${query ? `?${query}` : ''}`);
  },

  getById: async (id: string) => {
    return request<any>(`/admin/blogs/${id}`);
  },

  create: async (data: any) => {
    return request<any>('/admin/blogs', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  update: async (id: string, data: any) => {
    return request<any>(`/admin/blogs/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  updateStatus: async (id: string, status: 'draft' | 'published' | 'archived') => {
    return request<any>(`/admin/blogs/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  },

  updateFeatured: async (id: string, featured: boolean) => {
    return request<any>(`/admin/blogs/${id}/featured`, {
      method: 'PATCH',
      body: JSON.stringify({ featured }),
    });
  },

  delete: async (id: string) => {
    return request<any>(`/admin/blogs/${id}`, {
      method: 'DELETE',
    });
  },
};

// Testimonials API
export const testimonialsApi = {
  getAll: async (params?: {
    featured?: boolean;
    status?: string;
    trip?: string;
    page?: number;
    limit?: number;
  }) => {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, String(value));
        }
      });
    }
    const query = queryParams.toString();
    return request<any[]>(`/testimonials${query ? `?${query}` : ''}`);
  },

  getById: async (id: string) => {
    return request<any>(`/testimonials/${id}`);
  },

  create: async (data: {
    name: string;
    email: string;
    trip?: string;
    rating: number;
    testimonial: string;
    image?: string;
    location?: string;
  }) => {
    return request<any>('/testimonials', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  update: async (
    id: string,
    data: {
      name?: string;
      email?: string;
      trip?: string;
      rating?: number;
      testimonial?: string;
      image?: string;
      location?: string;
      status?: 'pending' | 'approved' | 'rejected';
      featured?: boolean;
    }
  ) => {
    return request<any>(`/testimonials/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  delete: async (id: string) => {
    return request<any>(`/testimonials/${id}`, {
      method: 'DELETE',
    });
  },
};

// FAQs API
export const faqsApi = {
  getAll: async () => {
    return request<any[]>('/faqs');
  },

  getById: async (id: string) => {
    return request<any>(`/faqs/${id}`);
  },

  create: async (data: any) => {
    return request<any>('/faqs', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  update: async (id: string, data: any) => {
    return request<any>(`/faqs/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  delete: async (id: string) => {
    return request<any>(`/faqs/${id}`, {
      method: 'DELETE',
    });
  },
};

// Donut Economics API
export const donutEconomicsApi = {
  getAll: async () => {
    return request<any[]>('/donut-economics');
  },

  getById: async (id: string) => {
    return request<any>(`/donut-economics/${id}`);
  },

  create: async (data: any) => {
    return request<any>('/donut-economics', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  update: async (id: string, data: any) => {
    return request<any>(`/donut-economics/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  delete: async (id: string) => {
    return request<any>(`/donut-economics/${id}`, {
      method: 'DELETE',
    });
  },
};

// Action Plans API
export const actionPlansApi = {
  getAll: async () => {
    return request<any[]>('/action-plans');
  },

  getById: async (id: string) => {
    return request<any>(`/action-plans/${id}`);
  },

  getBySlug: async (slug: string) => {
    return request<any>(`/action-plans/slug/${slug}`);
  },

  create: async (data: any) => {
    return request<any>('/action-plans', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  update: async (id: string, data: any) => {
    return request<any>(`/action-plans/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  delete: async (id: string) => {
    return request<any>(`/action-plans/${id}`, {
      method: 'DELETE',
    });
  },
};

// Sustainability Visions API (Long-Term Vision)
export const sustainabilityVisionsApi = {
  getAll: async () => {
    return request<any[]>('/sustainability-visions');
  },

  getById: async (id: string) => {
    return request<any>(`/sustainability-visions/${id}`);
  },

  getBySlug: async (slug: string) => {
    return request<any>(`/sustainability-visions/slug/${slug}`);
  },

  create: async (data: any) => {
    return request<any>('/sustainability-visions', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  update: async (id: string, data: any) => {
    return request<any>(`/sustainability-visions/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  delete: async (id: string) => {
    return request<any>(`/sustainability-visions/${id}`, {
      method: 'DELETE',
    });
  },
};

// Team API
export const teamApi = {
  getAll: async (params?: {
    isActive?: boolean;
  }) => {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, String(value));
        }
      });
    }
    const query = queryParams.toString();
    return request<any[]>(`/team${query ? `?${query}` : ''}`);
  },

  getById: async (id: string) => {
    return request<any>(`/team/${id}`);
  },

  create: async (data: {
    name: string;
    role: string;
    bio?: string;
    image?: string;
    email?: string;
    socialLinks?: {
      linkedin?: string;
      instagram?: string;
      twitter?: string;
      website?: string;
    };
    expertise?: string[];
    order?: number;
    isActive?: boolean;
  }) => {
    return request<any>('/team', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  update: async (id: string, data: {
    name?: string;
    role?: string;
    bio?: string;
    image?: string;
    email?: string;
    socialLinks?: {
      linkedin?: string;
      instagram?: string;
      twitter?: string;
      website?: string;
    };
    expertise?: string[];
    order?: number;
    isActive?: boolean;
  }) => {
    return request<any>(`/team/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  delete: async (id: string) => {
    return request<any>(`/team/${id}`, {
      method: 'DELETE',
    });
  },
};

// Guide API
export const guidesApi = {
  getAll: async (params?: {
    isActive?: boolean;
  }) => {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, String(value));
        }
      });
    }
    const query = queryParams.toString();
    return request<any[]>(`/guides${query ? `?${query}` : ''}`);
  },

  getById: async (id: string) => {
    return request<any>(`/guides/${id}`);
  },

  create: async (data: {
    name: string;
    role: string;
    experience?: string;
    languages?: string;
    imageUrl?: string;
    quote?: string;
    order?: number;
    isActive?: boolean;
  }) => {
    return request<any>('/guides', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  update: async (id: string, data: {
    name?: string;
    role?: string;
    experience?: string;
    languages?: string;
    imageUrl?: string;
    quote?: string;
    order?: number;
    isActive?: boolean;
  }) => {
    return request<any>(`/guides/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  delete: async (id: string) => {
    return request<any>(`/guides/${id}`, {
      method: 'DELETE',
    });
  },
};

// Add-ons & Activities API
export interface AddOnOption {
  label?: string;
  price?: number;
  priceUnit?: string;
}

export interface AddOnRecord {
  _id: string;
  title: string;
  slug?: string;
  kind: 'comfort' | 'activity';
  description?: string;
  image?: string;
  pricingType: 'flat' | 'choice';
  price?: number;
  priceUnit?: string;
  options?: AddOnOption[];
  duration?: string;
  activityType?: 'Activity' | 'Experience' | 'Retreat' | 'Workshop';
  location?: string;
  badges?: string[];
  discountEligible?: boolean;
  scope: 'global' | 'trips';
  trips?: string[];
  status: 'active' | 'inactive';
  order?: number;
}

export const addOnsApi = {
  getAll: async (params?: {
    kind?: 'comfort' | 'activity';
    status?: 'active' | 'inactive';
    scope?: 'global' | 'trips';
    trip?: string;
  }) => {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          queryParams.append(key, String(value));
        }
      });
    }
    const query = queryParams.toString();
    return request<AddOnRecord[]>(`/add-ons${query ? `?${query}` : ''}`);
  },

  getById: async (id: string) => {
    return request<AddOnRecord>(`/add-ons/${id}`);
  },

  create: async (data: Partial<AddOnRecord>) => {
    return request<AddOnRecord>('/add-ons', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  update: async (id: string, data: Partial<AddOnRecord>) => {
    return request<AddOnRecord>(`/add-ons/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  delete: async (id: string) => {
    return request<any>(`/add-ons/${id}`, {
      method: 'DELETE',
    });
  },
};

// Impact API
export const impactApi = {
  getAll: async (params?: {
    category?: string;
    isActive?: boolean;
  }) => {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, String(value));
        }
      });
    }
    const query = queryParams.toString();
    return request<any[]>(`/impact${query ? `?${query}` : ''}`);
  },

  getById: async (id: string) => {
    return request<any>(`/impact/${id}`);
  },
};

// Pages API - cache for homepage to support preload and avoid duplicate requests
let homepagePageCache: Promise<any> | null = null;

/** Preload homepage content early (e.g. when app mounts on /). Improves LCP and SEO. */
export function preloadHomepageContent(): void {
  if (homepagePageCache === null) {
    homepagePageCache = request<any>(`/pages/homepage`).catch(() => null);
  }
}

export const pagesApi = {
  getAll: async () => {
    return request<any[]>(`/pages`);
  },
  getByKey: async (key: string) => {
    if (key === 'homepage') {
      if (homepagePageCache === null) {
        homepagePageCache = request<any>(`/pages/homepage`).catch(() => null);
      }
      return homepagePageCache;
    }
    return request<any>(`/pages/${key}`);
  },
  create: async (data: {
    pageKey: string;
    title: string;
    content: string;
    metaTitle?: string;
    metaDescription?: string;
    heroImage?: string;
  }) => {
    return request<any>('/pages', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
  update: async (
    key: string,
    data: Partial<{
      title: string;
      content: string;
      metaTitle?: string;
      metaDescription?: string;
      heroImage?: string;
    }>
  ) => {
    return request<any>(`/pages/${key}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },
  delete: async (key: string) => {
    return request<any>(`/pages/${key}`, {
      method: 'DELETE',
    });
  },
};

// Categories API
export const categoriesApi = {
  getAll: async (params?: {
    parent?: string;
    level?: number;
    isActive?: boolean;
    search?: string;
  }) => {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, String(value));
        }
      });
    }
    const query = queryParams.toString();
    return request<any[]>(`/categories${query ? `?${query}` : ''}`);
  },
  getById: async (id: string) => {
    return request<any>(`/categories/${id}`);
  },
  create: async (data: any) => {
    return request<any>('/categories', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
  update: async (id: string, data: any) => {
    return request<any>(`/categories/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },
  delete: async (id: string) => {
    return request<any>(`/categories/${id}`, {
      method: 'DELETE',
    });
  },
};

// Subcategories API
export const subcategoriesApi = {
  getAll: async (params?: {
    category?: string;
    isActive?: boolean;
    search?: string;
  }) => {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, String(value));
        }
      });
    }
    const query = queryParams.toString();
    return request<any[]>(`/subcategories${query ? `?${query}` : ''}`);
  },
  getById: async (id: string) => {
    return request<any>(`/subcategories/${id}`);
  },
  create: async (data: any) => {
    return request<any>('/subcategories', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
  update: async (id: string, data: any) => {
    return request<any>(`/subcategories/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },
  delete: async (id: string) => {
    return request<any>(`/subcategories/${id}`, {
      method: 'DELETE',
    });
  },
};

// Regions API
export const regionsApi = {
  getAll: async (params?: { isActive?: boolean; search?: string }) => {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, String(value));
        }
      });
    }
    const query = queryParams.toString();
    return request<any[]>(`/regions${query ? `?${query}` : ''}`);
  },
  getById: async (id: string) => {
    return request<any>(`/regions/${id}`);
  },
  create: async (data: any) => {
    return request<any>('/regions', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
  update: async (id: string, data: any) => {
    return request<any>(`/regions/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },
  delete: async (id: string) => {
    return request<any>(`/regions/${id}`, {
      method: 'DELETE',
    });
  },
};

// Countries API
export const countriesApi = {
  getAll: async (params?: { isActive?: boolean; search?: string }) => {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, String(value));
        }
      });
    }
    const query = queryParams.toString();
    return request<any[]>(`/countries${query ? `?${query}` : ''}`);
  },
  getById: async (id: string) => {
    return request<any>(`/countries/${id}`);
  },
  create: async (data: any) => {
    return request<any>('/countries', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
  update: async (id: string, data: any) => {
    return request<any>(`/countries/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },
  delete: async (id: string) => {
    return request<any>(`/countries/${id}`, {
      method: 'DELETE',
    });
  },
};

// Media API
export const mediaApi = {
  upload: async (file: File, options?: { alt?: string; caption?: string; category?: string }) => {
    const formData = new FormData();
    formData.append('file', file);
    if (options?.alt) formData.append('alt', options.alt);
    if (options?.caption) formData.append('caption', options.caption);
    if (options?.category) formData.append('category', options.category);

    const uploadOnce = async (accessToken?: string | null) => {
      return fetch(`${API_BASE_URL}/media/upload`, {
        method: 'POST',
        headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : undefined,
        body: formData,
      });
    };

    let token = localStorage.getItem('accessToken');
    let response = await uploadOnce(token);

    if (response.status === 401) {
      const refreshed = await refreshAccessToken();
      if (refreshed) {
        token = refreshed;
        response = await uploadOnce(token);
      }
    }

    const data: ApiResponse<any> = await response.json();
    if (!response.ok || !data.success) {
      throw new ApiError(data.message || 'Upload failed', response.status, data.errors);
    }

    return data.data;
  },
};

export interface ImageTransform {
  /** target display width in CSS px (Cloudinary will serve ~this, never upscaling) */
  width?: number;
  /** target display height in CSS px */
  height?: number;
  /** aspect ratio, e.g. '4:3' — lets `c_fill` keep a consistent shape at any width */
  ar?: string;
  /** Cloudinary crop mode, default 'c_limit' (or 'c_fill' when height/ar is given) */
  crop?: 'c_limit' | 'c_fill' | 'c_fit' | 'c_scale';
  /** quality, default 'auto' */
  quality?: number | 'auto';
}

const CLOUDINARY_UPLOAD = /\/image\/upload\//;

/**
 * Resolve a stored media URL to something the browser can load.
 *
 * - `/uploads/...` paths are made absolute against the API origin.
 * - Cloudinary URLs get `f_auto,q_auto` + a display-sized `w_`/`h_` injected when a
 *   transform is requested, so cards stop downloading multi-MB originals. Pass a
 *   `width` (and optionally `height`) sized to how the image is actually displayed.
 *   Already-transformed URLs are left alone.
 */
export const resolveMediaUrl = (url?: string, transform?: ImageTransform): string => {
  if (!url) return '';

  let out = url;
  if (out.startsWith('/uploads')) out = `${API_ORIGIN}${out}`;
  if (!/^https?:\/\//.test(out)) return out;

  if (
    transform &&
    (transform.width || transform.height) &&
    out.includes('res.cloudinary.com') &&
    CLOUDINARY_UPLOAD.test(out) &&
    !/\/image\/upload\/[^/]*(?:f_auto|q_auto|w_\d|h_\d)/.test(out)
  ) {
    const crop =
      transform.crop || (transform.height || transform.ar ? 'c_fill' : 'c_limit');
    const t = [
      'f_auto',
      `q_${transform.quality ?? 'auto'}`,
      crop,
      transform.ar ? `ar_${transform.ar}` : '',
      transform.width ? `w_${Math.round(transform.width)}` : '',
      transform.height ? `h_${Math.round(transform.height)}` : '',
    ]
      .filter(Boolean)
      .join(',');
    out = out.replace(CLOUDINARY_UPLOAD, `/image/upload/${t}/`);
  }

  if (transform?.width && out.includes('images.unsplash.com')) {
    const u = new URL(out);
    u.searchParams.set('auto', 'format');
    u.searchParams.set('fit', 'crop');
    u.searchParams.set('q', String(typeof transform.quality === 'number' ? transform.quality : 85));
    u.searchParams.set('w', String(Math.round(transform.width)));
    if (transform.ar) {
      const [aw, ah] = transform.ar.split(':').map(Number);
      if (aw && ah) u.searchParams.set('h', String(Math.round((transform.width * ah) / aw)));
    }
    out = u.toString();
  }

  return out;
};

/**
 * Build a `srcSet` string for a Cloudinary image at several widths, so phones fetch a
 * ~360px image for a card slot instead of the desktop-sized one. Returns undefined for
 * non-Cloudinary URLs (nothing to gain — leave `srcSet` off).
 */
export const mediaSrcSet = (
  url: string | undefined,
  widths: number[],
  transform?: Omit<ImageTransform, 'width'>
): string | undefined => {
  const isUnsplash = !!url && url.includes('images.unsplash.com');
  if (!url || (!isUnsplash && (!url.includes('res.cloudinary.com') || !CLOUDINARY_UPLOAD.test(url)))) return undefined;
  return widths
    .map((w) => `${resolveMediaUrl(url, { ...transform, width: w })} ${w}w`)
    .join(', ');
};

// Newsletter Subscriptions API
export const newsletterSubscriptionsApi = {
  subscribe: async (data: { email: string; source?: string }) => {
    return request<any>('/newsletter-subscriptions', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
  getAll: async (params?: {
    page?: number;
    limit?: number;
    search?: string;
    source?: string;
    status?: 'subscribed' | 'unsubscribed';
  }) => {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          queryParams.append(key, String(value));
        }
      });
    }
    const query = queryParams.toString();
    return requestWithMeta<any[]>(`/newsletter-subscriptions${query ? `?${query}` : ''}`);
  },
  delete: async (id: string) => {
    return request<any>(`/newsletter-subscriptions/${id}`, {
      method: 'DELETE',
    });
  },
};

// Contact API
/** Fired after CMS writes that change a sidebar count (new contacts, pending bookings). */
export const CMS_COUNTS_UPDATED_EVENT = 'cms:counts-updated';
const notifyCmsCountsUpdated = () => window.dispatchEvent(new Event(CMS_COUNTS_UPDATED_EVENT));

export const contactApi = {
  submit: async (data: {
    name: string;
    email: string;
    subject?: string;
    message: string;
    phone?: string;
  }) => {
    return request<any>('/contact', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
  getAll: async (params?: {
    page?: number;
    limit?: number;
    status?: string;
    search?: string;
  }) => {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          queryParams.append(key, String(value));
        }
      });
    }
    const query = queryParams.toString();
    return requestWithMeta<any[]>(`/contact${query ? `?${query}` : ''}`);
  },
  getUnseenCount: async (): Promise<number> => {
    const result = await requestWithMeta<any[]>('/contact?status=new&limit=1');
    return result.meta?.pagination?.total ?? 0;
  },
  update: async (id: string, data: { status?: string }) => {
    const result = await request<any>(`/contact/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    notifyCmsCountsUpdated();
    return result;
  },
  reply: async (id: string, replyMessage: string) => {
    const result = await request<any>(`/contact/${id}/reply`, {
      method: 'POST',
      body: JSON.stringify({ replyMessage }),
    });
    notifyCmsCountsUpdated();
    return result;
  },
};

// Booking API
export const bookingApi = {
  getPendingCount: async (): Promise<number> => {
    const result = await requestWithMeta<any[]>('/bookings?status=pending&limit=1');
    return result.meta?.pagination?.total ?? 0;
  },
  getAll: async (params?: {
    page?: number;
    limit?: number;
    status?: string;
    paymentStatus?: string;
    trip?: string;
    user?: string;
  }) => {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, String(value));
        }
      });
    }
    const query = queryParams.toString();
    return requestWithMeta<any[]>(`/bookings${query ? `?${query}` : ''}`);
  },
  getById: async (id: string) => {
    return request<any>(`/bookings/${id}`);
  },
  getConfirmation: async (bookingId: string, tripId?: string, token?: string) => {
    const params = new URLSearchParams();
    if (tripId) params.set('tripId', tripId);
    if (token) params.set('token', token);
    const query = params.toString();
    return request<any>(`/bookings/confirmation/${bookingId}${query ? `?${query}` : ''}`);
  },
  update: async (id: string, data: { status?: string; paymentStatus?: string; notes?: string; adminNotes?: string }) => {
    const result = await request<any>(`/bookings/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    notifyCmsCountsUpdated();
    return result;
  },
  create: async (data: {
    trip: string;
    numberOfParticipants: number;
    departureDate: string;
    totalPrice: number;
    specialRequests?: string;
    promoCode?: string;
    emergencyContact?: {
      name?: string;
      phone?: string;
    };
    party?: {
      adults?: number;
      children?: number;
    };
    addOns?: Array<{
      id?: string;
      title?: string;
      type?: string;
      duration?: string;
      location?: string;
      price?: number;
    }>;
    consents?: {
      termsAccepted?: boolean;
      marketingOptIn?: boolean;
      travelInsuranceAcknowledged?: boolean;
    };
    notes?: string;
    guestInfo?: {
      name: string;
      email: string;
      phone?: string;
    };
  }) => {
    return request<any>('/bookings', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
};

// Promotions API
export const promotionsApi = {
  getAll: async (params?: { search?: string; type?: 'global' | 'trip'; active?: boolean }) => {
    const queryParams = new URLSearchParams();
    if (params) {
      if (params.search) queryParams.append('search', params.search);
      if (params.type) queryParams.append('type', params.type);
      if (typeof params.active === 'boolean') {
        queryParams.append('active', params.active ? 'true' : 'false');
      }
    }
    const query = queryParams.toString();
    const { data } = await requestWithMeta<any[]>(`/promotions${query ? `?${query}` : ''}`);
    return data;
  },
  getById: async (id: string) => {
    return request<any>(`/promotions/${id}`);
  },
  create: async (data: {
    title: string;
    code: string;
    description?: string;
    type: 'global' | 'trip';
    trip?: string;
    discountType: 'percentage' | 'fixed';
    discountValue: number;
    isActive?: boolean;
    validFrom?: string;
    validUntil?: string;
  }) => {
    return request<any>('/promotions', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
  update: async (id: string, data: Partial<{
    title: string;
    code: string;
    description?: string;
    type: 'global' | 'trip';
    trip?: string;
    discountType: 'percentage' | 'fixed';
    discountValue: number;
    isActive?: boolean;
    validFrom?: string;
    validUntil?: string;
  }>) => {
    return request<any>(`/promotions/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },
  delete: async (id: string) => {
    return request<any>(`/promotions/${id}`, {
      method: 'DELETE',
    });
  },
  validate: async (code: string, tripId?: string) => {
    const params = new URLSearchParams();
    params.set('code', code);
    if (tripId) params.set('tripId', tripId);
    return request<any>(`/promotions/validate?${params.toString()}`);
  },
};

// Auth API
export const authApi = {
  login: async (email: string, password: string) => {
    return request<{
      user: any;
      accessToken: string;
      refreshToken: string;
    }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  },

  logout: async () => {
    return request<any>('/auth/logout', {
      method: 'POST',
    });
  },

  getMe: async () => {
    return request<any>('/auth/me');
  },

  updateMe: async (data: {
    name?: string;
    email?: string;
    phone?: string;
    title?: string;
    avatarUrl?: string;
  }) => {
    return request<any>('/auth/me', {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  changePassword: async (currentPassword: string, newPassword: string) => {
    return request<any>('/auth/me/password', {
      method: 'PATCH',
      body: JSON.stringify({ currentPassword, newPassword }),
    });
  },

  updateSettings: async (data: {
    theme?: {
      mode?: 'light' | 'dark';
      accent?: string;
      sidebarColor?: string;
      fontScale?: 'small' | 'normal' | 'large';
    };
    preferences?: {
      compactTables?: boolean;
      reduceMotion?: boolean;
    };
  }) => {
    return request<any>('/auth/me/settings', {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  refresh: async (refreshToken: string) => {
    return request<{
      accessToken: string;
      refreshToken?: string;
      user: any;
    }>('/auth/refresh', {
      method: 'POST',
      body: JSON.stringify({ refreshToken }),
    });
  },

  forgotPassword: async (email: string) => {
    return request<{ message?: string }>('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  },

  resetPassword: async (token: string, password: string) => {
    return request<{ user?: any; message?: string }>('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ token, password }),
    });
  },
};

// Rental Categories API
export const rentalCategoriesApi = {
  getAll: async (params?: { isActive?: boolean; search?: string }) => {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, String(value));
        }
      });
    }
    const query = queryParams.toString();
    return request<any[]>(`/rental-categories${query ? `?${query}` : ''}`);
  },
  getById: async (id: string) => {
    return request<any>(`/rental-categories/${id}`);
  },
  create: async (data: any) => {
    return request<any>('/rental-categories', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
  update: async (id: string, data: any) => {
    return request<any>(`/rental-categories/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },
  delete: async (id: string) => {
    return request<any>(`/rental-categories/${id}`, {
      method: 'DELETE',
    });
  },
};

// Rental Products API
export const rentalProductsApi = {
  getAllWithMeta: async (params?: {
    category?: string;
    categorySlug?: string;
    status?: string;
    featured?: boolean;
    search?: string;
    minPrice?: number | string;
    maxPrice?: number | string;
    sort?: string;
    order?: string;
    page?: number;
    limit?: number;
  }) => {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          queryParams.append(key, String(value));
        }
      });
    }
    const query = queryParams.toString();
    return requestWithMeta<any[]>(`/rental-products${query ? `?${query}` : ''}`);
  },
  getById: async (id: string) => {
    return request<any>(`/rental-products/${id}`);
  },
  getBySlug: async (slug: string) => {
    return request<any>(`/rental-products/slug/${slug}`);
  },
  create: async (data: any) => {
    return request<any>('/rental-products', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
  update: async (id: string, data: any) => {
    return request<any>(`/rental-products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },
  delete: async (id: string) => {
    return request<any>(`/rental-products/${id}`, {
      method: 'DELETE',
    });
  },
};

// Rental Orders API
export const rentalOrdersApi = {
  getAll: async (params?: { page?: number; limit?: number; status?: string; paymentStatus?: string }) => {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, String(value));
        }
      });
    }
    const query = queryParams.toString();
    return requestWithMeta<any[]>(`/rental-orders${query ? `?${query}` : ''}`);
  },
  getById: async (id: string) => {
    return request<any>(`/rental-orders/${id}`);
  },
  update: async (id: string, data: { status?: string; paymentStatus?: string; notes?: string; adminNotes?: string }) => {
    return request<any>(`/rental-orders/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },
  delete: async (id: string) => {
    return request<any>(`/rental-orders/${id}`, {
      method: 'DELETE',
    });
  },
};

// Settings API
export const settingsApi = {
  get: async () => {
    return request<{ maintenanceMode: boolean; instagramEmbeds?: string[]; updatedAt?: string }>(`/settings`);
  },
  updateMaintenanceMode: async (maintenanceMode: boolean) => {
    return request<{ maintenanceMode: boolean }>(`/settings/maintenance-mode`, {
      method: 'PUT',
      body: JSON.stringify({ maintenanceMode }),
    });
  },
  updateInstagramEmbeds: async (instagramEmbeds: string[]) => {
    return request<{ instagramEmbeds: string[] }>(`/settings/instagram-embeds`, {
      method: 'PUT',
      body: JSON.stringify({ instagramEmbeds }),
    });
  },
};

export { ApiError };
