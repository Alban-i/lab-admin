'use server';

import { createClient } from '@/providers/supabase/server';
import { createClient as createServiceClient } from '@/providers/supabase/server-role';
import { TablesInsert } from '@/types/types_db';

export type MediaUploadResult = {
  success: boolean;
  data?: TablesInsert<'media'> & { id: string };
  error?: string;
};

export type MediaUploadData = {
  originalName: string;
  file: File;
  mediaType: 'audio' | 'image' | 'video' | 'document';
  altText?: string;
  description?: string;
};

const sanitizeFilename = (filename: string): string => {
  // Remove or replace accented characters
  const normalized = filename.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  
  // Replace spaces with underscores and remove special characters
  const sanitized = normalized
    .replace(/\s+/g, '_')  // Replace spaces with underscores
    .replace(/[^a-zA-Z0-9._-]/g, '')  // Keep only alphanumeric, dots, underscores, and hyphens
    .replace(/_{2,}/g, '_')  // Replace multiple underscores with single
    .replace(/^_+|_+$/g, '');  // Remove leading/trailing underscores
  
  // Ensure filename is not empty and has reasonable length
  if (!sanitized) {
    return 'media_file';
  }
  
  // Limit filename length (keeping extension)
  const parts = sanitized.split('.');
  if (parts.length > 1) {
    const name = parts.slice(0, -1).join('.');
    const extension = parts[parts.length - 1];
    const maxNameLength = 100;
    
    if (name.length > maxNameLength) {
      return name.substring(0, maxNameLength) + '.' + extension;
    }
  }
  
  return sanitized;
};

const validateFile = (file: File, mediaType: string): string | null => {
  // Check file size (max 50MB for videos, 30MB for others)
  const maxSize = mediaType === 'video' ? 50 * 1024 * 1024 : 30 * 1024 * 1024;
  if (file.size > maxSize) {
    return `File size must be less than ${mediaType === 'video' ? '50MB' : '30MB'}`;
  }

  // Check file type based on media type
  const allowedTypes: Record<string, string[]> = {
    audio: ['audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/m4a', 'audio/mp3'],
    image: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'],
    video: ['video/mp4', 'video/avi', 'video/mov', 'video/wmv', 'video/webm'],
    document: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
  };

  if (!allowedTypes[mediaType]?.includes(file.type)) {
    return `Invalid file type for ${mediaType}. Allowed types: ${allowedTypes[mediaType]?.join(', ')}`;
  }

  return null;
};

export const uploadMedia = async (uploadData: MediaUploadData): Promise<MediaUploadResult> => {
  try {
    console.log('Starting media upload process...');
    
    // Validate environment variables
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
      console.error('Missing NEXT_PUBLIC_SUPABASE_URL environment variable');
      return { success: false, error: 'Server configuration error' };
    }
    
    if (!process.env.SUPABASE_SERVICE_KEY) {
      console.error('Missing SUPABASE_SERVICE_KEY environment variable');
      return { success: false, error: 'Server configuration error' };
    }
    
    const supabase = await createClient();
    const serviceSupabase = await createServiceClient();
    
    console.log('Supabase clients created successfully');
    
    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      console.error('User authentication failed:', userError);
      return { success: false, error: 'User not authenticated' };
    }
    
    console.log('User authenticated:', user.id);

    const { file, originalName, mediaType, altText, description } = uploadData;

    console.log('File details:', {
      name: originalName,
      size: file.size,
      type: file.type,
      mediaType
    });

    // Validate file
    const validationError = validateFile(file, mediaType);
    if (validationError) {
      console.error('File validation failed:', validationError);
      return { success: false, error: validationError };
    }
    
    console.log('File validation passed');

    // Generate file path and name
    const sanitizedFilename = sanitizeFilename(originalName);
    const timestamp = Date.now();
    const fileName = `${timestamp}_${sanitizedFilename}`;
    const currentDate = new Date();
    const year = currentDate.getFullYear();
    const month = String(currentDate.getMonth() + 1).padStart(2, '0');
    const filePath = `media/${mediaType}/${year}/${month}/${fileName}`;
    
    console.log('Generated file path:', filePath);

    // Upload to Supabase Storage with retry logic
    const uploadWithRetry = async (retries = 3): Promise<{ data: any; error: any }> => {
      for (let i = 0; i < retries; i++) {
        try {
          console.log(`Attempting upload (attempt ${i + 1}/${retries})...`);
          const { data, error } = await serviceSupabase.storage
            .from('media')
            .upload(filePath, file, {
              cacheControl: '3600',
              upsert: false
            });
          
          if (error) {
            console.error(`Upload attempt ${i + 1} failed:`, error);
            if (i === retries - 1) throw error;
            await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1))); // Exponential backoff
            continue;
          }
          
          console.log(`Upload attempt ${i + 1} succeeded`);
          return { data, error };
        } catch (err) {
          console.error(`Upload attempt ${i + 1} threw error:`, err);
          if (i === retries - 1) throw err;
          await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
        }
      }
      throw new Error('Upload failed after all retries');
    };

    const { data: storageData, error: storageError } = await uploadWithRetry();
    
    if (storageError) {
      console.error('Storage upload failed:', storageError);
      let errorMessage = 'Failed to upload file';
      
      if (storageError.message?.includes('row-level security')) {
        errorMessage = 'Permission denied. Please check your upload permissions.';
      } else if (storageError.message?.includes('size')) {
        errorMessage = 'File size exceeds limit. Please try a smaller file.';
      } else if (storageError.message?.includes('network')) {
        errorMessage = 'Network error. Please check your connection and try again.';
      } else if (storageError.message?.includes('InvalidKey') || storageError.statusCode === '400') {
        errorMessage = 'Invalid filename. Please rename your file to use only letters, numbers, and basic punctuation.';
      }
      
      return { success: false, error: errorMessage };
    }
    
    console.log('File uploaded to storage successfully:', storageData);

    // Get public URL
    const { data: { publicUrl } } = serviceSupabase.storage
      .from('media')
      .getPublicUrl(filePath);

    console.log('Generated public URL:', publicUrl);

    // Save media metadata to database
    const mediaData: TablesInsert<'media'> = {
      original_name: originalName,
      file_name: fileName,
      file_path: filePath,
      file_size: file.size,
      mime_type: file.type,
      media_type: mediaType,
      url: publicUrl,
      alt_text: altText || null,
      description: description || null,
      uploaded_by: user.id,
    };

    console.log('Inserting media data to database:', mediaData);

    const { data: dbData, error: dbError } = await serviceSupabase
      .from('media')
      .insert(mediaData)
      .select()
      .single();

    if (dbError) {
      console.error('Database insert failed:', dbError);
      // If database insert fails, try to clean up the uploaded file
      await serviceSupabase.storage
        .from('media')
        .remove([filePath]);
      
      return { success: false, error: `Failed to save media metadata: ${dbError.message}` };
    }
    
    console.log('Media saved to database successfully:', dbData);

    return { success: true, data: dbData };

  } catch (error) {
    console.error('Media upload error:', error);
    
    // Provide more specific error information
    if (error instanceof Error) {
      return { success: false, error: `Upload failed: ${error.message}` };
    }
    
    return { success: false, error: 'An unexpected error occurred. Please try again.' };
  }
};