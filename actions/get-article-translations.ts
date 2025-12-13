import { createClient } from '@/providers/supabase/server';

export interface ArticleTranslation {
  id: string;
  title: string;
  slug: string;
  language: string;
  is_original: boolean;
  status: string;
}

export default async function getArticleTranslations(
  translationGroupId: string | null
): Promise<ArticleTranslation[]> {
  if (!translationGroupId) {
    return [];
  }

  const supabase = await createClient();

  try {
    const { data, error } = await supabase
      .from('articles')
      .select('id, title, slug, language, is_original, status')
      .eq('translation_group_id', translationGroupId)
      .order('is_original', { ascending: false });

    if (error) {
      console.error('Error fetching article translations:', error);
      return [];
    }

    return data;
  } catch (error) {
    console.error('Error:', error);
    return [];
  }
}
