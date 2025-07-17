/**
 * Migration script to move existing audio files from 'audios' bucket to 'media' bucket
 * and create corresponding database entries.
 * 
 * This script should be run after the media table is created and the 'media' bucket is set up.
 */

import { createClient } from '@/providers/supabase/server-role';
import { readFile } from 'fs/promises';
import path from 'path';

interface AudioFile {
  name: string;
  publicUrl: string;
  size: number;
  mimeType: string;
  lastModified: Date;
}

// Extract title from audio nodes in HTML content
const extractAudioTitlesFromContent = (content: string): { [url: string]: string } => {
  const audioTitles: { [url: string]: string } = {};
  
  // Regular expression to find audio nodes with src and title attributes
  const audioRegex = /<audio[^>]*data-audio="true"[^>]*>/g;
  const srcRegex = /src="([^"]*)"/;
  const titleRegex = /title="([^"]*)"/;
  
  const matches = content.match(audioRegex);
  if (matches) {
    matches.forEach(match => {
      const srcMatch = match.match(srcRegex);
      const titleMatch = match.match(titleRegex);
      
      if (srcMatch && titleMatch) {
        audioTitles[srcMatch[1]] = titleMatch[1];
      }
    });
  }
  
  return audioTitles;
};

const getFileMetadata = async (filePath: string): Promise<{ size: number; mimeType: string }> => {
  const supabase = await createClient();
  
  try {
    // Get file metadata from Supabase Storage
    const { data, error } = await supabase.storage
      .from('audios')
      .download(filePath);
    
    if (error) {
      throw error;
    }
    
    const size = data.size;
    const mimeType = data.type || 'audio/mpeg';
    
    return { size, mimeType };
  } catch (error) {
    console.warn(`Could not get metadata for ${filePath}, using defaults`);
    return { size: 0, mimeType: 'audio/mpeg' };
  }
};

const migrateAudioFiles = async () => {
  const supabase = await createClient();
  
  try {
    console.log('Starting audio files migration...');
    
    // 1. Get all audio files from the 'audios' bucket
    const { data: audioFiles, error: listError } = await supabase.storage
      .from('audios')
      .list();
    
    if (listError) {
      throw listError;
    }
    
    if (!audioFiles || audioFiles.length === 0) {
      console.log('No audio files found in the audios bucket.');
      return;
    }
    
    console.log(`Found ${audioFiles.length} audio files to migrate.`);
    
    // 2. Get all articles to extract audio titles
    const { data: articles, error: articlesError } = await supabase
      .from('articles')
      .select('id, content, author_id');
    
    if (articlesError) {
      throw articlesError;
    }
    
    // Extract audio titles from all articles
    const audioTitles: { [url: string]: string } = {};
    articles?.forEach(article => {
      const titles = extractAudioTitlesFromContent(article.content);
      Object.assign(audioTitles, titles);
    });
    
    // 3. Migrate each audio file
    for (const file of audioFiles) {
      try {
        console.log(`Processing: ${file.name}`);
        
        // Get file metadata
        const { size, mimeType } = await getFileMetadata(file.name);
        
        // Get public URL from audios bucket
        const { data: { publicUrl } } = supabase.storage
          .from('audios')
          .getPublicUrl(file.name);
        
        // Extract original name from filename (remove timestamp prefix)
        const originalName = file.name.replace(/^\d+_/, '');
        
        // Get title from extracted audio titles or use original name
        const title = audioTitles[publicUrl] || originalName;
        
        // Generate new file path for media bucket
        const currentDate = new Date(file.created_at || Date.now());
        const year = currentDate.getFullYear();
        const month = String(currentDate.getMonth() + 1).padStart(2, '0');
        const newFilePath = `media/audio/${year}/${month}/${file.name}`;
        
        // Copy file from audios bucket to media bucket
        const { data: fileData, error: downloadError } = await supabase.storage
          .from('audios')
          .download(file.name);
        
        if (downloadError) {
          console.error(`Error downloading ${file.name}:`, downloadError);
          continue;
        }
        
        // Upload to media bucket
        const { error: uploadError } = await supabase.storage
          .from('media')
          .upload(newFilePath, fileData, {
            cacheControl: '3600',
            upsert: false
          });
        
        if (uploadError) {
          console.error(`Error uploading ${file.name} to media bucket:`, uploadError);
          continue;
        }
        
        // Get new public URL
        const { data: { publicUrl: newPublicUrl } } = supabase.storage
          .from('media')
          .getPublicUrl(newFilePath);
        
        // Create database entry
        const { error: dbError } = await supabase
          .from('media')
          .insert({
            original_name: originalName,
            file_name: file.name,
            file_path: newFilePath,
            file_size: size,
            mime_type: mimeType,
            media_type: 'audio',
            url: newPublicUrl,
            alt_text: null,
            description: null,
            uploaded_by: null, // We don't have this information for old files
          });
        
        if (dbError) {
          console.error(`Error creating database entry for ${file.name}:`, dbError);
          // Clean up uploaded file
          await supabase.storage
            .from('media')
            .remove([newFilePath]);
          continue;
        }
        
        console.log(`✓ Successfully migrated: ${file.name}`);
        
      } catch (error) {
        console.error(`Error processing ${file.name}:`, error);
        continue;
      }
    }
    
    console.log('Migration completed successfully!');
    console.log('');
    console.log('Next steps:');
    console.log('1. Update article content to use new media URLs');
    console.log('2. Verify all files are accessible in the media bucket');
    console.log('3. Consider removing files from the audios bucket after verification');
    
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
};

// Run the migration
if (require.main === module) {
  migrateAudioFiles()
    .then(() => {
      console.log('Migration script completed.');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Migration script failed:', error);
      process.exit(1);
    });
}

export default migrateAudioFiles;