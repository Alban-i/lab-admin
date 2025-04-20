import { createClient } from '@/providers/supabase/server';
import { Posts } from '@/types/types';

const getPosts = async (): Promise<Posts[]> => {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('posts')
    .select(`*`)
    .order('title', { ascending: true });

  if (error) {
    console.log(error);
  }
  return data || [];
};

export default getPosts;
