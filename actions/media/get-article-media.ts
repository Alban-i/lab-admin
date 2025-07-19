'use server';

import { createClient } from '@/providers/supabase/server';
import { MediaWithProfile } from './get-media';

export type ArticleMediaResult = {
  data: MediaWithProfile[];
  error?: string;
};

export const getArticleMedia = async (articleId: string): Promise<ArticleMediaResult> => {
  try {
    const supabase = await createClient();

    // Get media used in the article with profile information
    const { data, error } = await supabase
      .from('article_media')
      .select(`
        media:media_id (
          *,
          profiles:uploaded_by (
            full_name,
            username
          )
        )
      `)
      .eq('article_id', articleId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching article media:', error);
      return { data: [], error: 'Failed to fetch article media' };
    }

    // Extract media objects from the relationship data
    const mediaList = (data || [])
      .map((item: any) => item.media)
      .filter(Boolean);

    return { data: mediaList };
  } catch (error) {
    console.error('Article media fetch error:', error);
    return { data: [], error: 'An unexpected error occurred' };
  }
};