'use server';

import { createClient } from '@/providers/supabase/server';
import { createClient as createServiceClient } from '@/providers/supabase/server-role';

export type DeleteMediaResult = {
  success: boolean;
  error?: string;
};

export const deleteMedia = async (mediaId: string): Promise<DeleteMediaResult> => {
  try {
    const supabase = await createClient();
    const serviceSupabase = await createServiceClient();
    
    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return { success: false, error: 'User not authenticated' };
    }

    // Get media record to check ownership and file path
    const { data: mediaData, error: fetchError } = await supabase
      .from('media')
      .select('*')
      .eq('id', mediaId)
      .single();

    if (fetchError || !mediaData) {
      return { success: false, error: 'Media not found' };
    }

    // Permission checks are handled by database RLS policies

    // Delete from storage first
    const { error: storageError } = await serviceSupabase.storage
      .from('media')
      .remove([mediaData.file_path]);

    if (storageError) {
      console.error('Storage deletion error:', storageError);
      // Continue with database deletion even if storage fails
    }

    // Delete from database
    const { error: dbError } = await serviceSupabase
      .from('media')
      .delete()
      .eq('id', mediaId);

    if (dbError) {
      console.error('Database deletion error:', dbError);
      return { success: false, error: 'Failed to delete media record' };
    }

    return { success: true };

  } catch (error) {
    console.error('Delete media error:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
};

export const deleteMultipleMedia = async (mediaIds: string[]): Promise<DeleteMediaResult> => {
  try {
    const supabase = await createClient();
    const serviceSupabase = await createServiceClient();
    
    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return { success: false, error: 'User not authenticated' };
    }

    // Get media records to check ownership and file paths
    const { data: mediaData, error: fetchError } = await supabase
      .from('media')
      .select('*')
      .in('id', mediaIds);

    if (fetchError || !mediaData || mediaData.length === 0) {
      return { success: false, error: 'No media found' };
    }

    // Permission checks are handled by database RLS policies

    // Delete from storage
    const filePaths = mediaData.map(media => media.file_path);
    const { error: storageError } = await serviceSupabase.storage
      .from('media')
      .remove(filePaths);

    if (storageError) {
      console.error('Storage deletion error:', storageError);
      // Continue with database deletion even if storage fails
    }

    // Delete from database
    const { error: dbError } = await serviceSupabase
      .from('media')
      .delete()
      .in('id', mediaIds);

    if (dbError) {
      console.error('Database deletion error:', dbError);
      return { success: false, error: 'Failed to delete media records' };
    }

    return { success: true };

  } catch (error) {
    console.error('Delete multiple media error:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
};