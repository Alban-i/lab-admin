import { createClient } from '@/providers/supabase/server';

export default async function getCategories() {
  const supabase = await createClient();

  try {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('name');

    if (error) {
      console.error('Error fetching categories:', error);
      return [];
    }

    return data;
  } catch (error) {
    console.error('Error:', error);
    return [];
  }
}

export async function getCategoryBySlug(slug: string) {
  const supabase = await createClient();

  try {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('slug', slug)
      .single();

    if (error) {
      console.error('Error fetching category:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error:', error);
    return null;
  }
}

export async function getCategoryById(identifier: string) {
  const supabase = await createClient();

  try {
    // Check if identifier is numeric (categories use numeric IDs)
    const isNumeric = /^\d+$/.test(identifier);
    
    let query = supabase.from('categories').select('*');
    
    if (isNumeric) {
      query = query.eq('id', parseInt(identifier));
    } else {
      query = query.eq('slug', identifier);
    }

    const { data, error } = await query.single();

    if (error) {
      console.error('Error fetching category:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error:', error);
    return null;
  }
}
