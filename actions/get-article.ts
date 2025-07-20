import { createClient } from '@/providers/supabase/server';
import { Articles } from '@/types/types';

const getArticle = async (
  identifier: string
): Promise<Articles | null | 'error'> => {
  if (identifier === 'new') {
    return null;
  }

  const supabase = await createClient();

  // Try to fetch by slug first, fallback to ID for backward compatibility
  let query = supabase.from('articles').select(`*`);
  
  // Check if identifier looks like a UUID (backward compatibility)
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(identifier);
  
  if (isUuid) {
    query = query.eq('id', identifier);
  } else {
    query = query.eq('slug', identifier);
  }

  const { data, error } = await query.single();

  if (error) {
    console.log(error);
    return 'error';
  }

  if (!data) return null;

  return {
    ...data,
    is_published: data.status.toLowerCase() === 'published',
    category_id: data.category_id?.toString() || null,
  };
};

export default getArticle;
