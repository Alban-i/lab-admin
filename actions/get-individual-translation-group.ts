import { createClient } from '@/providers/supabase/server';

export interface IndividualTranslationGroupData {
  id: string;
  type_id: number | null;
  original_name: string | null;
  ranking: string | null;
}

export default async function getIndividualTranslationGroup(
  translationGroupId: string | null
): Promise<IndividualTranslationGroupData | null> {
  if (!translationGroupId) {
    return null;
  }

  const supabase = await createClient();

  // Get translation group data
  const { data: group, error: groupError } = await supabase
    .from('individual_translation_groups')
    .select('id, type_id, original_name, ranking')
    .eq('id', translationGroupId)
    .single();

  if (groupError || !group) {
    console.error('Error fetching individual translation group:', groupError);
    return null;
  }

  return group;
}
