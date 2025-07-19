-- Add audio metadata columns to the media table
-- These columns will store ID3 tag information for audio files

ALTER TABLE media ADD COLUMN IF NOT EXISTS audio_title TEXT;
ALTER TABLE media ADD COLUMN IF NOT EXISTS audio_artist TEXT;
ALTER TABLE media ADD COLUMN IF NOT EXISTS audio_album TEXT;
ALTER TABLE media ADD COLUMN IF NOT EXISTS audio_genre TEXT;
ALTER TABLE media ADD COLUMN IF NOT EXISTS audio_year TEXT;
ALTER TABLE media ADD COLUMN IF NOT EXISTS audio_track_number TEXT;
ALTER TABLE media ADD COLUMN IF NOT EXISTS audio_album_artist TEXT;
ALTER TABLE media ADD COLUMN IF NOT EXISTS audio_composer TEXT;
ALTER TABLE media ADD COLUMN IF NOT EXISTS audio_comment TEXT;
ALTER TABLE media ADD COLUMN IF NOT EXISTS audio_duration INTEGER; -- Duration in seconds
ALTER TABLE media ADD COLUMN IF NOT EXISTS has_cover_art BOOLEAN DEFAULT FALSE;

-- Add indexes for common search queries
CREATE INDEX IF NOT EXISTS idx_media_audio_artist ON media(audio_artist) WHERE media_type = 'audio';
CREATE INDEX IF NOT EXISTS idx_media_audio_album ON media(audio_album) WHERE media_type = 'audio';
CREATE INDEX IF NOT EXISTS idx_media_audio_genre ON media(audio_genre) WHERE media_type = 'audio';

-- Add constraint to ensure year is valid if provided
ALTER TABLE media ADD CONSTRAINT check_audio_year 
  CHECK (audio_year IS NULL OR audio_year ~ '^\d{4}$');

-- Add constraint to ensure track number is valid if provided  
ALTER TABLE media ADD CONSTRAINT check_audio_track_number
  CHECK (audio_track_number IS NULL OR audio_track_number ~ '^\d+$');

-- Add constraint to ensure duration is positive if provided
ALTER TABLE media ADD CONSTRAINT check_audio_duration
  CHECK (audio_duration IS NULL OR audio_duration > 0);

-- Comment the table to document the new fields
COMMENT ON COLUMN media.audio_title IS 'Title from ID3 tags';
COMMENT ON COLUMN media.audio_artist IS 'Artist from ID3 tags';
COMMENT ON COLUMN media.audio_album IS 'Album from ID3 tags';
COMMENT ON COLUMN media.audio_genre IS 'Genre from ID3 tags';
COMMENT ON COLUMN media.audio_year IS 'Year from ID3 tags (4-digit format)';
COMMENT ON COLUMN media.audio_track_number IS 'Track number from ID3 tags';
COMMENT ON COLUMN media.audio_album_artist IS 'Album artist from ID3 tags';
COMMENT ON COLUMN media.audio_composer IS 'Composer from ID3 tags';
COMMENT ON COLUMN media.audio_comment IS 'Comment from ID3 tags';
COMMENT ON COLUMN media.audio_duration IS 'Duration in seconds';
COMMENT ON COLUMN media.has_cover_art IS 'Whether the audio file has embedded cover art';