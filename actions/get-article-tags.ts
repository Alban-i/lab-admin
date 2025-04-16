import { createClient } from '@/providers/supabase/server';

export default async function getArticleTags(articleId: string) {
  if (articleId === 'new') return [];

  const supabase = await createClient();

  const { data, error } = await supabase
    .from('article_tags')
    .select('tag_id')
    .eq('article_id', articleId);

  if (error) {
    console.error('Error fetching article tags:', error);
    return [];
  }

  return data.map((row) => row.tag_id);
}
