-- Update media table policies to implement simplified 3-tier role system
-- Authenticated users: read-only access
-- Authors & Admins: full access (no ownership checks)

-- Drop existing policies
DROP POLICY IF EXISTS "Users can update their own media" ON media;
DROP POLICY IF EXISTS "Users can delete their own media" ON media;
DROP POLICY IF EXISTS "Authenticated users can upload media" ON media;

-- Policy: Only admins and authors can upload media
CREATE POLICY "Admins and authors can upload media" ON media
    FOR INSERT
    TO authenticated
    WITH CHECK (is_admin() OR is_author());

-- Policy: Only admins and authors can update any media (no ownership check)
CREATE POLICY "Admins and authors can update any media" ON media
    FOR UPDATE
    TO authenticated
    USING (is_admin() OR is_author())
    WITH CHECK (is_admin() OR is_author());

-- Policy: Only admins and authors can delete any media (no ownership check)
CREATE POLICY "Admins and authors can delete any media" ON media
    FOR DELETE
    TO authenticated
    USING (is_admin() OR is_author());