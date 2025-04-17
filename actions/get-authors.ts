import { createClient } from '@/providers/supabase/server';
import { ProfilesWithRoles } from '@/types/types';

const getAuthors = async (): Promise<ProfilesWithRoles[]> => {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('profiles')
    .select(`*, role_id(*)`)
    .in('role_id.value', ['admin', 'author'])
    .order('username', { ascending: true });

  if (error) {
    console.log(error);
  }
  return data || [];
};

export default getAuthors;
