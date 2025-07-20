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

export async function getRoleBySlug(slug: string) {
  const supabase = await createClient();

  try {
    const { data, error } = await supabase
      .from('roles')
      .select('*')
      .eq('slug', slug)
      .single();

    if (error) {
      console.error('Error fetching role:', error);
      return null;
    }

    return data as Roles;
  } catch (error) {
    console.error('Error:', error);
    return null;
  }
}

export async function getRoleById(identifier: string) {
  const supabase = await createClient();

  try {
    // Check if identifier is numeric (roles use numeric IDs)
    const isNumeric = /^\d+$/.test(identifier);
    
    let query = supabase.from('roles').select('*');
    
    if (isNumeric) {
      query = query.eq('id', parseInt(identifier));
    } else {
      query = query.eq('slug', identifier);
    }

    const { data, error } = await query.single();

    if (error) {
      console.error('Error fetching role:', error);
      return null;
    }

    return data as Roles;
  } catch (error) {
    console.error('Error:', error);
    return null;
  }
}

export default getRoles;
