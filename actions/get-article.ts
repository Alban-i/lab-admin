import { createClient } from '@/providers/supabase/server';
import { Articles } from '@/types/types';

const getArticle = async (
  articleId: string
): Promise<Articles | null | 'error'> => {
  if (articleId === 'new') {
    return null;
  }

  const supabase = await createClient();

  const { data, error } = await supabase
    .from('articles')
    .select(`*`)
    .eq('id', articleId)
    .single();

  if (error) {
    console.log(error);
    return 'error';
  }
  return data || null;
};

export default getArticle;
