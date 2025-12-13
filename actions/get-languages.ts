import { createClient } from '@/providers/supabase/server';
import { Language } from '@/types/types';

export default async function getLanguages(): Promise<Language[]> {
  const supabase = await createClient();

  try {
    const { data, error } = await supabase
      .from('languages')
      .select('*')
      .order('sort_order');

    if (error) {
      console.error('Error fetching languages:', error);
      return [];
    }

    return data;
  } catch (error) {
    console.error('Error:', error);
    return [];
  }
}

export async function getActiveLanguages(): Promise<Language[]> {
  const supabase = await createClient();

  try {
    const { data, error } = await supabase
      .from('languages')
      .select('*')
      .eq('is_active', true)
      .order('sort_order');

    if (error) {
      console.error('Error fetching active languages:', error);
      return [];
    }

    return data;
  } catch (error) {
    console.error('Error:', error);
    return [];
  }
}

export async function getLanguageByCode(code: string): Promise<Language | null> {
  const supabase = await createClient();

  try {
    const { data, error } = await supabase
      .from('languages')
      .select('*')
      .eq('code', code)
      .single();

    if (error) {
      console.error('Error fetching language:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error:', error);
    return null;
  }
}
