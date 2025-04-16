import { createClient } from '@/providers/supabase/server';
import { Books } from '@/types/types';

const getBook = async (bookId: string): Promise<Books | null | 'error'> => {
  if (bookId === 'new') {
    return null;
  }

  const supabase = await createClient();

  const { data, error } = await supabase
    .from('books')
    .select(`* , books_programs(*, program_id(id, title_en))`)
    .eq('id', bookId)
    .single();

  if (error) {
    console.log(error);
    return 'error';
  }
  return data || null;
};

export default getBook;
