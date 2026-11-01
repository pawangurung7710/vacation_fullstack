import { useState, useEffect } from 'react';
import { blogApi, resolveMediaUrl } from '../services/api';
import { defaultBlogFont } from '../constants/blogFonts';

export interface BlogPost {
  _id?: string;
  id?: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  category: string;
  image?: string;
  featuredImage?: string;
  date?: string;
  publishedAt?: string;
  readTime?: string;
  author: string | { _id?: string; name?: string; email?: string };
  authorName?: string;
  status?: string;
  featured?: boolean;
  fontFamily?: string;
}

const resolveContentMedia = (content?: string) => {
  if (!content) return '';
  return content.replace(/<img([^>]*?)src=["']([^"']+)["']/gi, (_match, attrs, src) => {
    const resolved = resolveMediaUrl(src);
    return `<img${attrs}src="${resolved}"`;
  });
};

export function useBlogPosts(params?: {
  category?: string;
  featured?: boolean;
  page?: number;
  limit?: number;
  search?: string;
}) {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [pagination, setPagination] = useState<{ page: number; limit: number; total: number; pages: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setLoading(true);
        const result = params?.featured
          ? { data: await blogApi.getFeatured(params.limit), meta: undefined }
          : await blogApi.getAllWithMeta(params);
        const data = result.data || [];
        // Transform API data to match frontend format
        const transformedPosts = data.map((post: any) => ({
          ...post,
          id: post._id || post.id,
          image: resolveMediaUrl(post.image || post.featuredImage),
          content: resolveContentMedia(post.content),
          date: post.date || post.publishedAt,
          authorName:
            post.authorName ||
            (typeof post.author === 'string'
              ? post.author
              : post.author?.name || post.author?.email || 'Trekkers Squad Team'),
          fontFamily: post.fontFamily || defaultBlogFont,
        }));
        setPosts(transformedPosts);
        setPagination(result.meta?.pagination || null);
        setError(null);
      } catch (err) {
        setPosts([]);
        setPagination(null);
        setError(err instanceof Error ? err : new Error('Failed to fetch blog posts'));
        console.error('Error fetching blog posts:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, [params?.category, params?.featured, params?.page, params?.limit, params?.search]);

  return { posts, pagination, loading, error };
}

export function useBlogPost(slugOrId: string) {
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        setLoading(true);
        const data = await blogApi.getBySlug(slugOrId);
        // Transform API data
        const transformedPost = {
          ...data,
          id: data._id || data.id,
          image: resolveMediaUrl(data.image || data.featuredImage),
          content: resolveContentMedia(data.content),
          date: data.date || data.publishedAt,
          authorName:
            data.authorName ||
            (typeof data.author === 'string'
              ? data.author
              : data.author?.name || data.author?.email || 'Trekkers Squad Team'),
          fontFamily: data.fontFamily || defaultBlogFont,
        };
        setPost(transformedPost);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to fetch blog post'));
        console.error('Error fetching blog post:', err);
      } finally {
        setLoading(false);
      }
    };

    if (slugOrId) {
      fetchPost();
    }
  }, [slugOrId]);

  return { post, loading, error };
}
