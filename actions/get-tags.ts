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

export async function getTagBySlug(slug: string) {
  const supabase = await createClient();

  try {
    const { data, error } = await supabase
      .from('tags')
      .select('*')
      .eq('slug', slug)
      .single();

    if (error) {
      console.error('Error fetching tag:', error);
      return null;
    }

    return data as Tags;
  } catch (error) {
    console.error('Error:', error);
    return null;
  }
}

export async function getTagById(identifier: string) {
  const supabase = await createClient();

  try {
    // Check if identifier is numeric (tags use numeric IDs)
    const isNumeric = /^\d+$/.test(identifier);
    
    let query = supabase.from('tags').select('*');
    
    if (isNumeric) {
      query = query.eq('id', parseInt(identifier));
    } else {
      query = query.eq('slug', identifier);
    }

    const { data, error } = await query.single();

    if (error) {
      console.error('Error fetching tag:', error);
      return null;
    }

    return data as Tags;
  } catch (error) {
    console.error('Error:', error);
    return null;
  }
}
