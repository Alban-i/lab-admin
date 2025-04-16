import { createClient } from '@/providers/supabase/server';
import { ProfilesWithRoles } from '@/types/types';

const getMyProfile = async (): Promise<ProfilesWithRoles | null> => {
  const supabase = await createClient();

  const { data: sessionData, error: sessionError } =
    await supabase.auth.getUser();

  if (sessionError) {
    console.log(sessionError);
  }

  const { data, error } = await supabase
    .from('profiles')
    .select(`*, role_id(*)`)
    .eq('id', sessionData.user?.id)
    .single();

  if (error) {
    console.log(error);
  }
  return data || null;
};

export default getMyProfile;
