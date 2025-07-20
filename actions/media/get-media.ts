'use server';

import { createClient } from '@/providers/supabase/server';
import { Tables } from '@/types/types_db';

export type MediaWithProfile = Tables<'media'> & {
  profiles?: {
    full_name: string | null;
    username: string | null;
  } | null;
};

export type MediaFilters = {
  mediaType?: 'audio' | 'image' | 'video' | 'document';
  uploadedBy?: string;
  search?: string;
  limit?: number;
  offset?: number;
};

export type MediaResult = {
  data: MediaWithProfile[];
  count: number;
  error?: string;
};

export const getMedia = async (filters: MediaFilters = {}): Promise<MediaResult> => {
  try {
    const supabase = await createClient();
    
    // Build query with filters
    let query = supabase
      .from('media')
      .select(`
        *,
        profiles:uploaded_by (
          full_name,
          username
        )
      `, { count: 'exact' })
      .order('created_at', { ascending: false });

    // Apply filters
    if (filters.mediaType) {
      query = query.eq('media_type', filters.mediaType);
    }

    if (filters.uploadedBy) {
      query = query.eq('uploaded_by', filters.uploadedBy);
    }

    if (filters.search) {
      query = query.or(`original_name.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
    }

    // Apply pagination
    if (filters.limit) {
      query = query.limit(filters.limit);
    }
    
    if (filters.offset) {
      query = query.range(filters.offset, filters.offset + (filters.limit || 10) - 1);
    }

    const { data, error, count } = await query;

    if (error) {
      console.error('Error fetching media:', error);
      return { data: [], count: 0, error: 'Failed to fetch media' };
    }

    return { data: data || [], count: count || 0 };
  } catch (error) {
    console.error('Media fetch error:', error);
    return { data: [], count: 0, error: 'An unexpected error occurred' };
  }
};

export const getMediaById = async (identifier: string): Promise<MediaWithProfile | null> => {
  try {
    const supabase = await createClient();
    
    // Try to fetch by slug first, fallback to ID for backward compatibility
    let query = supabase
      .from('media')
      .select(`
        *,
        profiles:uploaded_by (
          full_name,
          username
        )
      `);
    
    // Check if identifier looks like a UUID (backward compatibility)
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(identifier);
    
    if (isUuid) {
      query = query.eq('id', identifier);
    } else {
      query = query.eq('slug', identifier);
    }

    const { data, error } = await query.single();

    if (error) {
      console.error('Error fetching media by ID:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Media fetch by ID error:', error);
    return null;
  }
};

export const getMediaByType = async (mediaType: 'audio' | 'image' | 'video' | 'document'): Promise<MediaWithProfile[]> => {
  try {
    const supabase = await createClient();
    
    const { data, error } = await supabase
      .from('media')
      .select(`
        *,
        profiles:uploaded_by (
          full_name,
          username
        )
      `)
      .eq('media_type', mediaType)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching media by type:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Media fetch by type error:', error);
    return [];
  }
};

export const getUserMedia = async (userId: string): Promise<MediaWithProfile[]> => {
  try {
    const supabase = await createClient();
    
    const { data, error } = await supabase
      .from('media')
      .select(`
        *,
        profiles:uploaded_by (
          full_name,
          username
        )
      `)
      .eq('uploaded_by', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching user media:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('User media fetch error:', error);
    return [];
  }
};