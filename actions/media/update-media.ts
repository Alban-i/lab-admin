'use server';

import { createClient } from '@/providers/supabase/server';
import { createClient as createServiceClient } from '@/providers/supabase/server-role';
import { TablesUpdate } from '@/types/types_db';

export type MediaUpdateResult = {
  success: boolean;
  error?: string;
};

export type MediaUpdateData = {
  id: string;
  alt_text?: string;
  description?: string;
  transcription?: string;
  slug: string; // Now required since slug is mandatory
  cover_image_url?: string;
};

export const updateMedia = async (updateData: MediaUpdateData): Promise<MediaUpdateResult> => {
  try {
    const supabase = await createClient();
    const serviceSupabase = await createServiceClient();
    
    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return { success: false, error: 'User not authenticated' };
    }

    // Permission checks are handled by database RLS policies

    // Update media metadata
    const updateFields: TablesUpdate<'media'> = {
      alt_text: updateData.alt_text,
      description: updateData.description,
      transcription: updateData.transcription,
      slug: updateData.slug,
      cover_image_url: updateData.cover_image_url,
      updated_at: new Date().toISOString(),
    };

    const { error: updateError } = await serviceSupabase
      .from('media')
      .update(updateFields)
      .eq('id', updateData.id);

    if (updateError) {
      console.error('Database update error:', updateError);
      return { success: false, error: 'Failed to update media' };
    }

    return { success: true };

  } catch (error) {
    console.error('Update media error:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
};