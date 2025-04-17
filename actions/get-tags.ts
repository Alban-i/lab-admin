import { createClient } from '@/providers/supabase/server';
import { Tags } from '@/types/types';

export default async function getTags() {
  const supabase = await createClient();

  const { data, error } = await supabase.from('tags').select('*').order('name');

  if (error) {
    console.error('Error fetching tags:', error);
    return [];
  }

  return data as Tags[];
}
