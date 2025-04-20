import { createClient } from '@/providers/supabase/server';
import { Posts } from '@/types/types';

const getPost = async (postId: string): Promise<Posts | 'error' | null> => {
  const supabase = await createClient();

  try {
    if (postId === 'new') {
      return null;
    }

    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .eq('id', postId)
      .single();

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
