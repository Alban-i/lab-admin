import { createClient } from '@/providers/supabase/server';

export interface IndividualTranslation {
  id: number;
  name: string;
  slug: string;
  language: string;
  is_original: boolean;
  status: string;
}

export default async function getIndividualTranslations(
  translationGroupId: string | null
): Promise<IndividualTranslation[]> {
  if (!translationGroupId) {
    return [];
  }

  const supabase = await createClient();

  try {
    const { data, error } = await supabase
      .from('individuals')
      .select('id, name, slug, language, is_original, status')
      .eq('translation_group_id', translationGroupId)
      .order('is_original', { ascending: false });

    if (error) {
      console.error('Error fetching individual translations:', error);
      return [];
    }

    return data;
  } catch (error) {
    console.error('Error:', error);
    return [];
  }
}
