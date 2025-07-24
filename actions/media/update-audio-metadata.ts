'use server';

import { createClient } from '@/providers/supabase/server';
import { createClient as createServiceClient } from '@/providers/supabase/server-role';
import { 
  AudioMetadata, 
  readAudioMetadata, 
  writeAudioMetadata, 
  validateAudioMetadata,
  isSupportedAudioFormat
} from '@/lib/audio-metadata';
import { TablesUpdate } from '@/types/types_db';

export type AudioMetadataUpdateResult = {
  success: boolean;
  error?: string;
};

export type AudioMetadataUpdateData = {
  mediaId: string;
  metadata: AudioMetadata;
  updateFile?: boolean; // Whether to update the actual file or just database
};

export const updateAudioMetadata = async (
  updateData: AudioMetadataUpdateData
): Promise<AudioMetadataUpdateResult> => {
  console.log('🎵 updateAudioMetadata called with:', {
    mediaId: updateData.mediaId,
    updateFile: updateData.updateFile,
    metadataKeys: Object.keys(updateData.metadata),
    metadataValues: updateData.metadata
  });
  
  try {
    const supabase = await createClient();
    const serviceSupabase = await createServiceClient();
    
    console.log('✅ Supabase clients created successfully');
    
    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      console.error('❌ User authentication failed:', userError);
      return { success: false, error: 'User not authenticated' };
    }
    console.log('✅ User authenticated:', user.id);

    // Get media record
    const { data: mediaData, error: fetchError } = await supabase
      .from('media')
      .select('*')
      .eq('id', updateData.mediaId)
      .single();

    if (fetchError || !mediaData) {
      console.error('❌ Media not found:', fetchError);
      return { success: false, error: 'Media not found' };
    }
    console.log('✅ Media record found:', { 
      id: mediaData.id, 
      type: mediaData.media_type, 
      mime: mediaData.mime_type,
      name: mediaData.original_name,
      filePath: mediaData.file_path,
      url: mediaData.url
    });

    // Check if it's an audio file
    if (mediaData.media_type !== 'audio') {
      return { success: false, error: 'Media is not an audio file' };
    }

    // Check if format is supported
    if (!isSupportedAudioFormat(mediaData.mime_type)) {
      return { success: false, error: 'Audio format not supported for metadata editing' };
    }

    // Permission checks are handled by database RLS policies

    // Validate metadata
    const validation = validateAudioMetadata(updateData.metadata);
    if (!validation.valid) {
      return { success: false, error: `Invalid metadata: ${validation.errors.join(', ')}` };
    }

    let newFileUrl = mediaData.url;

    // If updateFile is true, modify the actual audio file
    if (updateData.updateFile) {
      console.log('🔄 Starting file metadata update process...');
      try {
        // Download the file from storage
        console.log('⬇️ Downloading file from storage:', mediaData.file_path);
        const { data: fileData, error: downloadError } = await serviceSupabase.storage
          .from('media')
          .download(mediaData.file_path);

        if (downloadError) {
          console.error('❌ Failed to download audio file:', downloadError);
          return { success: false, error: 'Failed to download audio file' };
        }
        console.log('✅ File downloaded successfully, size:', fileData.size);

        // Convert blob to buffer
        console.log('🔄 Converting file to buffer...');
        const arrayBuffer = await fileData.arrayBuffer();
        const fileBuffer = Buffer.from(arrayBuffer);
        console.log('✅ Buffer created, size:', fileBuffer.length);

        // Write new metadata to the file
        console.log('✏️ Writing metadata to file...', updateData.metadata);
        console.log('📏 Original file buffer size:', fileBuffer.length);
        
        const writeResult = writeAudioMetadata(fileBuffer, updateData.metadata);
        
        if (!writeResult.success || !writeResult.buffer) {
          console.error('❌ Failed to write metadata to buffer:', writeResult.error);
          return { success: false, error: writeResult.error || 'Failed to write metadata to file' };
        }
        
        console.log('✅ Metadata written to buffer successfully');
        console.log('📏 Modified buffer size:', writeResult.buffer.length);
        console.log('📊 Buffer size difference:', writeResult.buffer.length - fileBuffer.length, 'bytes');
        
        // Verify we're using the correct buffer
        if (writeResult.buffer.length === fileBuffer.length) {
          console.warn('⚠️ WARNING: Modified buffer has same size as original - metadata may not have been written!');
        }

        // Create a new file with timestamp to avoid caching issues
        console.log('🔄 Creating new file path and name...');
        const timestamp = Date.now();
        const pathParts = mediaData.file_path.split('/');
        const fileName = pathParts[pathParts.length - 1];
        const fileNameParts = fileName.split('.');
        const extension = fileNameParts.pop();
        const baseName = fileNameParts.join('.');
        const newFileName = `${baseName}_${timestamp}.${extension}`;
        const newFilePath = pathParts.slice(0, -1).concat([newFileName]).join('/');
        
        console.log('📁 File path details:', {
          originalPath: mediaData.file_path,
          newFilePath,
          originalFileName: fileName,
          newFileName,
          timestamp
        });

        // Upload the modified file
        console.log('📄 Creating File object...');
        const file = new File([writeResult.buffer], newFileName, { type: mediaData.mime_type });
        console.log('✅ File object created:', {
          name: file.name,
          size: file.size,
          type: file.type
        });
        
        console.log('⬆️ Uploading modified file to storage...');
        const { error: uploadError } = await serviceSupabase.storage
          .from('media')
          .upload(newFilePath, file, {
            cacheControl: '3600',
            upsert: false
          });

        if (uploadError) {
          console.error('❌ Failed to upload modified audio file:', uploadError);
          return { success: false, error: 'Failed to upload modified audio file' };
        }
        console.log('✅ Modified file uploaded successfully to:', newFilePath);

        // Get new public URL
        console.log('🌐 Getting public URL for new file...');
        const { data: { publicUrl } } = serviceSupabase.storage
          .from('media')
          .getPublicUrl(newFilePath);

        newFileUrl = publicUrl;
        console.log('✅ New public URL generated:', newFileUrl);

        // Delete old file
        console.log('🗑️ Deleting old file:', mediaData.file_path);
        const { error: deleteError } = await serviceSupabase.storage
          .from('media')
          .remove([mediaData.file_path]);
          
        if (deleteError) {
          console.warn('⚠️ Warning: Failed to delete old file:', deleteError);
        } else {
          console.log('✅ Old file deleted successfully');
        }

      } catch (error) {
        console.error('Error updating audio file:', error);
        return { success: false, error: 'Failed to process audio file' };
      }
    }

    // Update database with new metadata
    console.log('💾 Preparing database update...');
    const dbUpdateData: TablesUpdate<'media'> = {
      audio_title: updateData.metadata.title || null,
      audio_artist: updateData.metadata.artist || null,
      audio_album: updateData.metadata.album || null,
      audio_genre: updateData.metadata.genre || null,
      audio_year: updateData.metadata.year || null,
      audio_track_number: updateData.metadata.trackNumber || null,
      audio_album_artist: updateData.metadata.albumArtist || null,
      audio_composer: updateData.metadata.composer || null,
      audio_comment: updateData.metadata.comment || null,
      has_cover_art: !!updateData.metadata.cover,
      updated_at: new Date().toISOString(),
    };
    
    console.log('📊 Database update data:', dbUpdateData);

    // If file was updated, also update file-related fields
    if (updateData.updateFile && newFileUrl !== mediaData.url) {
      console.log('🔄 File was updated, updating file-related database fields...');
      const pathParts = newFileUrl.split('/');
      const newFileName = pathParts[pathParts.length - 1];
      const newFilePath = pathParts.slice(-5).join('/'); // Get the last 5 parts for the file path

      dbUpdateData.url = newFileUrl;
      dbUpdateData.file_name = newFileName;
      dbUpdateData.file_path = newFilePath;
      
      console.log('📁 Updated file fields:', {
        newUrl: newFileUrl,
        newFileName,
        newFilePath
      });
    } else {
      console.log('📝 File was not updated, keeping existing file fields');
    }

    console.log('💾 Executing database update...');
    const { error: updateError } = await serviceSupabase
      .from('media')
      .update(dbUpdateData)
      .eq('id', updateData.mediaId);

    if (updateError) {
      console.error('❌ Database update error:', updateError);
      return { success: false, error: 'Failed to update metadata in database' };
    }
    
    console.log('✅ Database update successful!');
    console.log('🎉 Audio metadata update process completed successfully');

    return { success: true };

  } catch (error) {
    console.error('Update audio metadata error:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
};

/**
 * Extract and read metadata from an audio file without modifying it
 */
export const extractAudioMetadata = async (mediaId: string): Promise<{
  success: boolean;
  metadata?: AudioMetadata;
  error?: string;
}> => {
  try {
    const supabase = await createClient();
    const serviceSupabase = await createServiceClient();
    
    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return { success: false, error: 'User not authenticated' };
    }

    // Get media record
    const { data: mediaData, error: fetchError } = await supabase
      .from('media')
      .select('*')
      .eq('id', mediaId)
      .single();

    if (fetchError || !mediaData) {
      return { success: false, error: 'Media not found' };
    }

    // Check if it's an audio file
    if (mediaData.media_type !== 'audio') {
      return { success: false, error: 'Media is not an audio file' };
    }

    // Permission checks are handled by database RLS policies

    // Download and read the file
    const { data: fileData, error: downloadError } = await serviceSupabase.storage
      .from('media')
      .download(mediaData.file_path);

    if (downloadError) {
      return { success: false, error: 'Failed to download audio file' };
    }

    // Convert blob to buffer and read metadata
    const arrayBuffer = await fileData.arrayBuffer();
    const fileBuffer = Buffer.from(arrayBuffer);
    
    const readResult = readAudioMetadata(fileBuffer);
    
    if (!readResult.success) {
      return { success: false, error: readResult.error || 'Failed to read metadata' };
    }

    return { success: true, metadata: readResult.metadata };

  } catch (error) {
    console.error('Extract audio metadata error:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
};