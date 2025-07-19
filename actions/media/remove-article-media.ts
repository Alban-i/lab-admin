'use server';

import { createClient } from '@/providers/supabase/server';

export type RemoveArticleMediaResult = {
  success: boolean;
  error?: string;
};

export const removeArticleMedia = async (
  articleId: string,
  mediaId: string
): Promise<RemoveArticleMediaResult> => {
  try {
    const supabase = await createClient();

    // Delete article-media relationship
    const { error } = await supabase
      .from('article_media')
      .delete()
      .eq('article_id', articleId)
      .eq('media_id', mediaId);

    if (error) {
      console.error('Error removing article-media relationship:', error);
      return { success: false, error: 'Failed to remove media relationship' };
    }

    return { success: true };
  } catch (error) {
    console.error('Article-media remove error:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
};