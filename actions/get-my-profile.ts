import { createClient } from '@/providers/supabase/server';
import { Profiles } from '@/types/types';

const getMyProfile = async (): Promise<Profiles | null> => {
  const supabase = await createClient();

  const { data: sessionData, error: sessionError } =
    await supabase.auth.getUser();

  if (sessionError) {
    console.log(sessionError);
  }

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', sessionData.user?.id)
    .single();

  if (error) {
    console.log(error);
  }
  return (data as Profiles) || null;
};

export default getMyProfile;
