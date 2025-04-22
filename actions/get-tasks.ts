import { createClient } from '@/providers/supabase/server';
import { Tasks } from '@/types/types';

const getTasks = async (): Promise<Tasks[]> => {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('tasks')
    .select('*, owner_id(id, full_name)')
    .order('created_at', { ascending: false });

  if (error) {
    console.log(error);
  }
  return data || [];
};

export default getTasks;
