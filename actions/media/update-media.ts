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

    // Get media record to check ownership
    const { data: mediaData, error: fetchError } = await supabase
      .from('media')
      .select('*')
      .eq('id', updateData.id)
      .single();

    if (fetchError || !mediaData) {
      return { success: false, error: 'Media not found' };
    }

    // Check if user owns the media or is admin
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select(`
        *,
        roles (
          value
        )
      `)
      .eq('id', user.id)
      .single();

    if (profileError || !profile) {
      return { success: false, error: 'Unable to verify permissions' };
    }

    const isAdmin = profile.roles?.value === 'admin';
    const isOwner = mediaData.uploaded_by === user.id;

    if (!isAdmin && !isOwner) {
      return { success: false, error: 'Permission denied' };
    }

    // Update media metadata
    const updateFields: TablesUpdate<'media'> = {
      alt_text: updateData.alt_text,
      description: updateData.description,
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