import { createClient } from '@/providers/supabase/server';
import { ProfilesWithRoles } from '@/types/types';

const getProfiles = async (): Promise<ProfilesWithRoles[]> => {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('profiles')
    .select(`*, role_id(*)`)
    .order('email', { ascending: true });

  if (error) {
    console.log(error);
  }
  return data || [];
};

export default getProfiles;
