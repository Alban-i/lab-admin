-- Create media table for centralized media management
CREATE TABLE IF NOT EXISTS media (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  original_name TEXT NOT NULL,
  file_name TEXT NOT NULL UNIQUE,
  file_path TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  mime_type TEXT NOT NULL,
  media_type TEXT NOT NULL CHECK (media_type IN ('audio', 'image', 'video', 'document')),
  url TEXT NOT NULL,
  alt_text TEXT,
  description TEXT,
  uploaded_by UUID REFERENCES profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_media_media_type ON media(media_type);
CREATE INDEX IF NOT EXISTS idx_media_uploaded_by ON media(uploaded_by);
CREATE INDEX IF NOT EXISTS idx_media_created_at ON media(created_at);
CREATE INDEX IF NOT EXISTS idx_media_file_name ON media(file_name);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_media_updated_at 
    BEFORE UPDATE ON media 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- RLS policies for media table
ALTER TABLE media ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view published media
CREATE POLICY "Users can view all media" ON media
    FOR SELECT
    USING (true);

-- Policy: Authenticated users can upload media
CREATE POLICY "Authenticated users can upload media" ON media
    FOR INSERT
    WITH CHECK (auth.role() = 'authenticated');

-- Policy: Users can update their own media
CREATE POLICY "Users can update their own media" ON media
    FOR UPDATE
    USING (auth.uid() = uploaded_by)
    WITH CHECK (auth.uid() = uploaded_by);

-- Policy: Users can delete their own media (and admins can delete any)
CREATE POLICY "Users can delete their own media" ON media
    FOR DELETE
    USING (
        auth.uid() = uploaded_by 
        OR EXISTS (
            SELECT 1 FROM profiles 
            JOIN roles ON profiles.role_id = roles.id 
            WHERE profiles.id = auth.uid() 
            AND roles.value = 'admin'
        )
    );