import { createClient } from '@/providers/supabase/server';
import { Posts } from '@/types/types';

const getPost = async (identifier: string): Promise<Posts | 'error' | null> => {
  const supabase = await createClient();

  try {
    if (identifier === 'new') {
      return null;
    }

    // Try to fetch by slug first, fallback to ID for backward compatibility
    let query = supabase.from('posts').select('*');
    
    // Check if identifier is numeric (posts use numeric IDs)
    const isNumeric = /^\d+$/.test(identifier);
    
    if (isNumeric) {
      query = query.eq('id', parseInt(identifier));
    } else {
      query = query.eq('slug', identifier);
    }

    const { data, error } = await query.single();

    if (error) {
      console.error('Error fetching post:', error);
      return 'error';
    }

    return data;
  } catch (error) {
    console.error('Error:', error);
    return 'error';
  }
};

export default getPost;
