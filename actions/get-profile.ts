import { createClient } from '@/providers/supabase/server';
import { ProfilesWithRoles } from '@/types/types';

const getProfile = async (
  profileId: string
): Promise<ProfilesWithRoles | null | 'error'> => {
  if (profileId === 'new') {
    return null;
  }

  const supabase = await createClient();

  const { data, error } = await supabase
    .from('profiles')
    .select(`*, role_id(*)`)
    .eq('id', profileId)
    .single();

  if (error) {
    console.log(error);
    return 'error';
  }
  return data || null;
};

export default getProfile;
