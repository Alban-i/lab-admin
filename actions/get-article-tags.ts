import { createClient } from '@/providers/supabase/server';

export default async function getArticleTags(identifier: string) {
  if (identifier === 'new') return [];

  const supabase = await createClient();

  // First get the article to find its ID
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(identifier);
  
  let articleId: string;
  
  if (isUuid) {
    // Direct ID usage
    articleId = identifier;
  } else {
    // Get article by slug to find ID
    const { data: article, error: articleError } = await supabase
      .from('articles')
      .select('id')
      .eq('slug', identifier)
      .single();
      
    if (articleError || !article) {
      console.error('Error fetching article for tags:', articleError);
      return [];
    }
    
    articleId = article.id;
  }

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
