import PageContent from '../models/PageContent.js';

const throwNotFound = (message) => {
  const error = new Error(message);
  error.statusCode = 404;
  throw error;
};

const throwBadRequest = (message) => {
  const error = new Error(message);
  error.statusCode = 400;
  throw error;
};

/**
 * Get all page contents
 */
export const getPageContents = async () => {
  const pages = await PageContent.find().sort({ pageKey: 1 });
  return pages;
};

/**
 * Get page content by key
 */
export const getPageContentByKey = async (pageKey) => {
  if (!pageKey || typeof pageKey !== 'string') {
    throwBadRequest('Page key is required');
  }
  const page = await PageContent.findOne({ pageKey: pageKey.toLowerCase() });
  if (!page) {
    throwNotFound('Page content not found');
  }
  return page;
};

/**
 * Create new page content
 */
export const createPageContent = async (pageData) => {
  if (!pageData?.pageKey || typeof pageData.pageKey !== 'string') {
    throwBadRequest('Page key is required');
  }
  const page = new PageContent({
    ...pageData,
    pageKey: pageData.pageKey.toLowerCase(),
  });
  await page.save();
  return page;
};

/**
 * Update page content
 */
export const updatePageContent = async (pageKey, updateData, userId) => {
  if (!pageKey || typeof pageKey !== 'string') {
    throwBadRequest('Page key is required');
  }
  const page = await PageContent.findOne({ pageKey: pageKey.toLowerCase() });
  if (!page) {
    throwNotFound('Page content not found');
  }

  Object.assign(page, updateData);
  page.lastUpdatedBy = userId;
  await page.save();
  return page;
};

/**
 * Delete page content
 */
export const deletePageContent = async (pageKey) => {
  if (!pageKey || typeof pageKey !== 'string') {
    throwBadRequest('Page key is required');
  }
  const page = await PageContent.findOneAndDelete({ pageKey: pageKey.toLowerCase() });
  if (!page) {
    throwNotFound('Page content not found');
  }
  return page;
};
