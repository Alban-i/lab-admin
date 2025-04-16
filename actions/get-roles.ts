import { createClient } from '@/providers/supabase/server';
import { Roles } from '@/types/types';

const getRoles = async (): Promise<Roles[]> => {
  const supabase = await createClient();

  const { data, error } = await supabase.from('roles').select('*');

  if (error) {
    console.log(error);
  }
  return data || [];
};

export default getRoles;
