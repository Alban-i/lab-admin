import { createClient } from '@/providers/supabase/server';

export default async function getGlossaries() {
  const supabase = await createClient();

  try {
    const { data, error } = await supabase
      .from('glossary')
      .select('*')
      .order('term');

    if (error) {
      console.error('Error fetching glossaries:', error);
      return [];
    }

    return data;
  } catch (error) {
    console.error('Error:', error);
    return [];
  }
}

export async function getGlossaryBySlug(slug: string) {
  const supabase = await createClient();

  try {
    const { data, error } = await supabase
      .from('glossary')
      .select('*')
      .eq('slug', slug)
      .single();

    if (error) {
      console.error('Error fetching glossary:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error:', error);
    return null;
  }
}

export async function getGlossaryById(identifier: string) {
  const supabase = await createClient();

  try {
    // Check if identifier is numeric (glossaries use numeric IDs)
    const isNumeric = /^\d+$/.test(identifier);
    
    let query = supabase.from('glossary').select('*');
    
    if (isNumeric) {
      query = query.eq('id', parseInt(identifier));
    } else {
      query = query.eq('slug', identifier);
    }

    const { data, error } = await query.single();

    if (error) {
      console.error('Error fetching glossary:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error:', error);
    return null;
  }
}