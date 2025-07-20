import { createClient } from '@/providers/supabase/server';

export default async function getTypes() {
  const supabase = await createClient();

  try {
    const { data, error } = await supabase
      .from('types')
      .select('*')
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

export async function getTypeBySlug(slug: string) {
  const supabase = await createClient();

  try {
    const { data, error } = await supabase
      .from('types')
      .select('*')
      .eq('slug', slug)
      .single();

    if (error) {
      console.error('Error fetching type:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error:', error);
    return null;
  }
}

export async function getTypeById(identifier: string) {
  const supabase = await createClient();

  try {
    // Check if identifier is numeric (types use numeric IDs)
    const isNumeric = /^\d+$/.test(identifier);
    
    let query = supabase.from('types').select('*');
    
    if (isNumeric) {
      query = query.eq('id', parseInt(identifier));
    } else {
      query = query.eq('slug', identifier);
    }

    const { data, error } = await query.single();

    if (error) {
      console.error('Error fetching type:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error:', error);
    return null;
  }
}
