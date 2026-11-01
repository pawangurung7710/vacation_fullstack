// Page information mapping for CMS routes

export interface PageInfo {
  title: string;
  description: string;
}

export const pageInfoMap: Record<string, PageInfo> = {
  '/cms/dashboard': {
    title: 'Dashboard',
    description: 'Overview of your CMS',
  },
  '/cms/trips': {
    title: 'Trips',
    description: 'Manage your trip catalog',
  },
  '/cms/trips/categories': {
    title: 'Trip Categories',
    description: 'Manage top-level categories',
  },
  '/cms/trips/countries': {
    title: 'Trip Countries',
    description: 'Manage country options for trips',
  },
  '/cms/trips/countries/new': {
    title: 'New Country',
    description: 'Create a country for trips',
  },
  '/cms/trips/categories/new': {
    title: 'New Category',
    description: 'Create a top-level trip category',
  },
  '/cms/trips/subcategories': {
    title: 'Trip Subcategories',
    description: 'Manage subcategories under trips',
  },
  '/cms/trips/subcategories/new': {
    title: 'New Subcategory',
    description: 'Create a subcategory under a parent',
  },
  '/cms/trips/new': {
    title: 'Create New Trip',
    description: 'Add a new trip to your catalog',
  },
  '/cms/trips/preview': {
    title: 'Preview Trip',
    description: 'Preview how your trip will appear',
  },
  '/cms/add-ons': {
    title: 'Add-ons & Activities',
    description: 'Comfort upgrades and activities that trips offer at checkout',
  },
  '/cms/add-ons/new': {
    title: 'New Add-on',
    description: 'Create a comfort upgrade or activity',
  },
  '/cms/blog': {
    title: 'Blog Posts',
    description: 'Manage your blog content',
  },
  '/cms/blog/new': {
    title: 'Create New Blog Post',
    description: 'Write a new blog post',
  },
  '/cms/bookings': {
    title: 'Bookings',
    description: 'Manage customer bookings',
  },
  '/cms/promotions': {
    title: 'Promotions',
    description: 'Manage promotional codes and campaigns',
  },
  '/cms/promotions/new': {
    title: 'New Promotion',
    description: 'Create a new promo code',
  },
  '/cms/contact': {
    title: 'Contact Submissions',
    description: 'Manage contact form submissions',
  },
  '/cms/newsletter-subscriptions': {
    title: 'Newsletter subscriptions',
    description: 'Manage newsletter subscriber emails',
  },
  '/cms/team': {
    title: 'Team Members',
    description: 'Manage team members',
  },
  '/cms/team/new': {
    title: 'Add Team Member',
    description: 'Create a new team profile',
  },
  '/cms/testimonials': {
    title: 'Testimonials',
    description: 'Manage customer testimonials',
  },
  '/cms/faqs': {
    title: 'FAQ',
    description: 'Manage FAQ categories and questions',
  },
  '/cms/pages': {
    title: 'Pages Editor',
    description: 'Edit static page content',
  },
  '/cms/navigation': {
    title: 'Navigation Editor',
    description: 'Manage site navigation structure',
  },
  '/cms/media': {
    title: 'Media Library',
    description: 'Manage your media files',
  },
  '/cms/settings': {
    title: 'Settings',
    description: 'Manage CMS settings and preferences',
  },
  '/cms/maintenance-mode': {
    title: 'Maintenance Mode',
    description: 'Take the public site offline temporarily',
  },
};

export function getPageInfo(pathname: string): PageInfo {
  if (pathname.startsWith('/cms/trips/') && pathname.endsWith('/notes')) {
    return {
      title: 'Trip Notes',
      description: 'Edit the essential-information page for this trip',
    };
  }
  if (pathname.startsWith('/cms/bookings/')) {
    return {
      title: 'Booking Details',
      description: 'Review the booking and trip information',
    };
  }
  if (pathname.startsWith('/cms/promotions/') && !pathname.endsWith('/new')) {
    return {
      title: 'Edit Promotion',
      description: 'Update an existing promotion',
    };
  }
  if (pathname.startsWith('/cms/trips/categories/') && !pathname.endsWith('/new')) {
    return {
      title: 'Edit Category',
      description: 'Update a trip category',
    };
  }
  if (pathname.startsWith('/cms/trips/subcategories/') && !pathname.endsWith('/new')) {
    return {
      title: 'Edit Subcategory',
      description: 'Update a trip subcategory',
    };
  }
  if (pathname.startsWith('/cms/trips/countries/') && !pathname.endsWith('/new')) {
    return {
      title: 'Edit Country',
      description: 'Update a trip country',
    };
  }
  // Check exact match first
  if (pageInfoMap[pathname]) {
    return pageInfoMap[pathname];
  }

  // Check for dynamic routes (e.g., /cms/trips/:id)
  for (const [route, info] of Object.entries(pageInfoMap)) {
    if (pathname.startsWith(route + '/')) {
      // For edit pages, modify the title
      if (pathname.match(/\/\w+\/\w+$/)) {
        const baseRoute = pathname.split('/').slice(0, -1).join('/');
        if (pageInfoMap[baseRoute]) {
          return {
            title: `Edit ${pageInfoMap[baseRoute].title.replace('Posts', 'Post').replace('Trips', 'Trip')}`,
            description: pageInfoMap[baseRoute].description,
          };
        }
      }
      return info;
    }
  }

  // Default fallback
  return {
    title: 'CMS',
    description: '',
  };
}
