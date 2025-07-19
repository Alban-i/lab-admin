import NodeID3 from 'node-id3';

export interface AudioMetadata {
  title?: string;
  artist?: string;
  album?: string;
  genre?: string;
  year?: string;
  trackNumber?: string;
  albumArtist?: string;
  composer?: string;
  comment?: string;
  cover?: Buffer;
}

export interface AudioMetadataResult {
  success: boolean;
  metadata?: AudioMetadata;
  error?: string;
}

export interface AudioFileResult {
  success: boolean;
  buffer?: Buffer;
  error?: string;
}

/**
 * Read ID3 metadata from an audio file buffer
 */
export const readAudioMetadata = (buffer: Buffer): AudioMetadataResult => {
  try {
    const tags = NodeID3.read(buffer);
    
    if (!tags) {
      return { success: false, error: 'No metadata found' };
    }

    const metadata: AudioMetadata = {
      title: tags.title,
      artist: tags.artist,
      album: tags.album,
      genre: tags.genre,
      year: tags.year,
      trackNumber: tags.trackNumber,
      albumArtist: tags.performerInfo,
      composer: tags.composer,
      comment: tags.comment?.text,
      cover: (tags.image && typeof tags.image === 'object' && 'imageBuffer' in tags.image) 
        ? tags.image.imageBuffer as Buffer 
        : undefined,
    };

    return { success: true, metadata };
  } catch (error) {
    console.error('Error reading audio metadata:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
};

/**
 * Write ID3 metadata to an audio file buffer
 */
export const writeAudioMetadata = (buffer: Buffer, metadata: AudioMetadata): AudioFileResult => {
  console.log('📝 writeAudioMetadata called with:', { 
    bufferSize: buffer.length, 
    metadata: Object.keys(metadata) 
  });
  
  try {
    console.log('🔧 Creating tags object...');
    const tags: Record<string, unknown> = {};

    if (metadata.title) tags.title = metadata.title;
    if (metadata.artist) tags.artist = metadata.artist;
    if (metadata.album) tags.album = metadata.album;
    if (metadata.genre) tags.genre = metadata.genre;
    if (metadata.year) tags.year = metadata.year;
    if (metadata.trackNumber) tags.trackNumber = metadata.trackNumber;
    if (metadata.albumArtist) tags.performerInfo = metadata.albumArtist;
    if (metadata.composer) tags.composer = metadata.composer;
    if (metadata.comment) tags.comment = { language: 'eng', text: metadata.comment };
    if (metadata.cover) {
      tags.image = {
        mime: 'image/jpeg',
        type: {
          id: 3,
          name: 'front cover'
        },
        description: 'Cover',
        imageBuffer: metadata.cover
      };
    }

    console.log('🎯 About to call NodeID3.write with tags:', tags);
    console.log('📏 Original buffer size:', buffer.length);
    
    const modifiedBuffer = NodeID3.write(tags, buffer);
    console.log('📊 NodeID3.write result type:', typeof modifiedBuffer);
    console.log('📊 NodeID3.write result:', modifiedBuffer instanceof Buffer ? 'Buffer' : modifiedBuffer);
    
    if (!modifiedBuffer || !(modifiedBuffer instanceof Buffer)) {
      console.error('❌ NodeID3.write did not return a valid buffer');
      return { success: false, error: 'Failed to write metadata' };
    }

    console.log('📏 Modified buffer size:', modifiedBuffer.length);
    console.log('✅ NodeID3.write successful - buffer size changed by:', modifiedBuffer.length - buffer.length, 'bytes');
    
    return { success: true, buffer: modifiedBuffer };
  } catch (error) {
    console.error('Error writing audio metadata:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
};

/**
 * Extract cover art from audio metadata
 */
export const extractCoverArt = (buffer: Buffer): { success: boolean; cover?: Buffer; error?: string } => {
  try {
    const result = readAudioMetadata(buffer);
    
    if (!result.success || !result.metadata) {
      return { success: false, error: result.error || 'Failed to read metadata' };
    }

    if (!result.metadata.cover) {
      return { success: false, error: 'No cover art found' };
    }

    return { success: true, cover: result.metadata.cover };
  } catch (error) {
    console.error('Error extracting cover art:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
};

/**
 * Check if a file is a supported audio format
 */
export const isSupportedAudioFormat = (mimeType: string): boolean => {
  const supportedTypes = [
    'audio/mpeg',     // MP3
    'audio/mp4',      // M4A
    'audio/x-m4a',    // M4A
    'audio/flac',     // FLAC
    'audio/wav',      // WAV (limited metadata support)
  ];

  return supportedTypes.includes(mimeType);
};

/**
 * Validate audio metadata before writing
 */
export const validateAudioMetadata = (metadata: AudioMetadata): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];

  // Validate string lengths
  if (metadata.title && metadata.title.length > 255) {
    errors.push('Title must be 255 characters or less');
  }

  if (metadata.artist && metadata.artist.length > 255) {
    errors.push('Artist must be 255 characters or less');
  }

  if (metadata.album && metadata.album.length > 255) {
    errors.push('Album must be 255 characters or less');
  }

  if (metadata.year && !/^\d{4}$/.test(metadata.year)) {
    errors.push('Year must be a 4-digit number');
  }

  if (metadata.trackNumber && !/^\d+$/.test(metadata.trackNumber)) {
    errors.push('Track number must be a valid number');
  }

  // Validate cover art size (max 10MB)
  if (metadata.cover && metadata.cover.length > 10 * 1024 * 1024) {
    errors.push('Cover art must be smaller than 10MB');
  }

  return { valid: errors.length === 0, errors };
};