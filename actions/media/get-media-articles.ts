'use server';

import { createClient } from '@/providers/supabase/server';
import { Tables } from '@/types/types_db';

export type ArticleWithAuthor = Tables<'articles'> & {
  profiles?: {
    full_name: string | null;
    username: string | null;
  } | null;
};

export type MediaArticlesResult = {
  data: ArticleWithAuthor[];
  error?: string;
};

export const getMediaArticles = async (mediaId: string): Promise<MediaArticlesResult> => {
  try {
    const supabase = await createClient();

    // Get articles that use the media with author information
    const { data, error } = await supabase
      .from('article_media')
      .select(`
        articles:article_id (
          *,
          profiles:author_id (
            full_name,
            username
          )
        )
      `)
      .eq('media_id', mediaId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching media articles:', error);
      return { data: [], error: 'Failed to fetch media articles' };
    }

    // Extract article objects from the relationship data
    const articlesList = (data || [])
      .map((item: any) => item.articles)
      .filter(Boolean);

    return { data: articlesList };
  } catch (error) {
    console.error('Media articles fetch error:', error);
    return { data: [], error: 'An unexpected error occurred' };
  }
};