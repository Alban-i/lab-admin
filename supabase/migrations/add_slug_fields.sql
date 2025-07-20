-- Add slug fields to tables that don't have them yet
-- This migration adds slug fields to categories, roles, tags, and types tables

-- Add slug field to categories table
ALTER TABLE categories 
ADD COLUMN slug VARCHAR(255);

-- Add slug field to roles table  
ALTER TABLE roles
ADD COLUMN slug VARCHAR(255);

-- Add slug field to tags table
ALTER TABLE tags
ADD COLUMN slug VARCHAR(255);

-- Add slug field to types table
ALTER TABLE types 
ADD COLUMN slug VARCHAR(255);

-- Generate initial slugs from existing name/value fields
-- Categories: use name field
UPDATE categories 
SET slug = LOWER(REGEXP_REPLACE(TRIM(name), '[^a-zA-Z0-9\u0600-\u06FF]+', '-', 'g'))
WHERE slug IS NULL;

-- Roles: use value field if available, otherwise label field
UPDATE roles 
SET slug = LOWER(REGEXP_REPLACE(TRIM(COALESCE(value, label)), '[^a-zA-Z0-9\u0600-\u06FF]+', '-', 'g'))
WHERE slug IS NULL;

-- Tags: use name field
UPDATE tags 
SET slug = LOWER(REGEXP_REPLACE(TRIM(name), '[^a-zA-Z0-9\u0600-\u06FF]+', '-', 'g'))
WHERE slug IS NULL;

-- Types: use name field
UPDATE types 
SET slug = LOWER(REGEXP_REPLACE(TRIM(name), '[^a-zA-Z0-9\u0600-\u06FF]+', '-', 'g'))
WHERE slug IS NULL;

-- Handle duplicate slugs by appending numbers
-- Categories
WITH duplicates AS (
  SELECT slug, ROW_NUMBER() OVER (PARTITION BY slug ORDER BY id) as rn
  FROM categories 
  WHERE slug IS NOT NULL
)
UPDATE categories 
SET slug = categories.slug || '-' || (duplicates.rn - 1)
FROM duplicates 
WHERE categories.slug = duplicates.slug 
AND duplicates.rn > 1;

-- Roles
WITH duplicates AS (
  SELECT slug, ROW_NUMBER() OVER (PARTITION BY slug ORDER BY id) as rn
  FROM roles 
  WHERE slug IS NOT NULL
)
UPDATE roles 
SET slug = roles.slug || '-' || (duplicates.rn - 1)
FROM duplicates 
WHERE roles.slug = duplicates.slug 
AND duplicates.rn > 1;

-- Tags
WITH duplicates AS (
  SELECT slug, ROW_NUMBER() OVER (PARTITION BY slug ORDER BY id) as rn
  FROM tags 
  WHERE slug IS NOT NULL
)
UPDATE tags 
SET slug = tags.slug || '-' || (duplicates.rn - 1)
FROM duplicates 
WHERE tags.slug = duplicates.slug 
AND duplicates.rn > 1;

-- Types
WITH duplicates AS (
  SELECT slug, ROW_NUMBER() OVER (PARTITION BY slug ORDER BY id) as rn
  FROM types 
  WHERE slug IS NOT NULL
)
UPDATE types 
SET slug = types.slug || '-' || (duplicates.rn - 1)
FROM duplicates 
WHERE types.slug = duplicates.slug 
AND duplicates.rn > 1;

-- Add NOT NULL constraints after populating slugs
ALTER TABLE categories 
ALTER COLUMN slug SET NOT NULL;

ALTER TABLE roles
ALTER COLUMN slug SET NOT NULL;

ALTER TABLE tags
ALTER COLUMN slug SET NOT NULL;

ALTER TABLE types
ALTER COLUMN slug SET NOT NULL;

-- Add unique constraints on slug fields
ALTER TABLE categories 
ADD CONSTRAINT categories_slug_unique UNIQUE (slug);

ALTER TABLE roles
ADD CONSTRAINT roles_slug_unique UNIQUE (slug);

ALTER TABLE tags
ADD CONSTRAINT tags_slug_unique UNIQUE (slug);

ALTER TABLE types
ADD CONSTRAINT types_slug_unique UNIQUE (slug);

-- Create indexes for better query performance
CREATE INDEX idx_categories_slug ON categories (slug);
CREATE INDEX idx_roles_slug ON roles (slug);
CREATE INDEX idx_tags_slug ON tags (slug);
CREATE INDEX idx_types_slug ON types (slug);