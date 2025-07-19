-- Create article_media junction table for many-to-many relationship
CREATE TABLE IF NOT EXISTS article_media (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  article_id UUID NOT NULL REFERENCES articles(id) ON DELETE CASCADE,
  media_id UUID NOT NULL REFERENCES media(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(article_id, media_id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_article_media_article_id ON article_media(article_id);
CREATE INDEX IF NOT EXISTS idx_article_media_media_id ON article_media(media_id);
CREATE INDEX IF NOT EXISTS idx_article_media_created_at ON article_media(created_at);

-- RLS policies for article_media table
ALTER TABLE article_media ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view article-media relationships
CREATE POLICY "Users can view article-media relationships" ON article_media
    FOR SELECT
    USING (true);

-- Policy: Authenticated users can create article-media relationships
CREATE POLICY "Authenticated users can create article-media relationships" ON article_media
    FOR INSERT
    WITH CHECK (auth.role() = 'authenticated');

-- Policy: Users can delete article-media relationships if they can edit the article
CREATE POLICY "Users can delete article-media relationships for editable articles" ON article_media
    FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM articles 
            WHERE articles.id = article_media.article_id 
            AND (
                articles.author_id = auth.uid() 
                OR EXISTS (
                    SELECT 1 FROM profiles 
                    JOIN roles ON profiles.role_id = roles.id 
                    WHERE profiles.id = auth.uid() 
                    AND roles.value IN ('admin', 'author')
                )
            )
        )
    );