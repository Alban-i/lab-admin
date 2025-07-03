import { createClient } from '@/providers/supabase/server';

export default async function getTypes() {
  const supabase = await createClient();

  try {
    const { data, error } = await supabase
      .from('types')
      .select('id, name')
      .order('name');

    if (error) {
      console.error('Error fetching types:', error);
      return [];
    }

    return data;
  } catch (error) {
    console.error('Error:', error);
    return [];
  }
}
