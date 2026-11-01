import slugifyLib from 'slugify';

/**
 * Generate URL-friendly slug from string
 */
export const generateSlug = (text) => {
  return slugifyLib(text, {
    lower: true,
    strict: true,
    remove: /[*+~.()'"!:@]/g,
  });
};

