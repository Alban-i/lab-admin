# Media Migration Guide

This document outlines the process for migrating from the old audio-specific upload system to the new centralized media management system.

## Overview

The migration involves:
1. Creating a new `media` table in the database
2. Creating a new `media` bucket in Supabase Storage
3. Migrating existing audio files from the `audios` bucket to the `media` bucket
4. Updating article content to use the new media URLs
5. Updating the application to use the new media system

## Prerequisites

- Database access to run migrations
- Supabase Storage access to create buckets and move files
- Node.js environment to run migration scripts

## Migration Steps

### Step 1: Database Migration

Run the SQL migration to create the media table:

```sql
-- Run the contents of supabase/migrations/create_media_table.sql
```

### Step 2: Create Media Bucket

Create a new `media` bucket in Supabase Storage with the following configuration:

1. **Bucket Name**: `media`
2. **Public Access**: Yes (for file downloads)
3. **File Size Limit**: 50MB
4. **Allowed MIME Types**: All types (or specific types as needed)

### Step 3: Run Migration Scripts

Execute the migration scripts to move files and update references:

```bash
# Migrate audio files from audios bucket to media bucket
npm run migrate:audio

# Update article content to use new media URLs
npm run update:audio-urls

# Or run both in sequence
npm run migrate:media
```

### Step 4: Verify Migration

1. **Check Database**: Verify that media entries were created in the `media` table
2. **Check Storage**: Verify that files exist in the `media` bucket
3. **Check Articles**: Verify that article content uses the new media URLs
4. **Test Upload**: Test the new media upload functionality

### Step 5: Update Application

The application has been updated to use the new media system:

- **TipTap Editor**: Now uses the Media Library for all media types
- **Media Library**: New modal interface for browsing and selecting media
- **Media Upload**: New upload dialog with metadata support
- **Media Management**: Support for audio, image, video, and document files

## New Features

### Media Library Modal
- Grid and list view modes
- Search and filter functionality
- Pagination for large media collections
- Preview capabilities
- Bulk selection (optional)

### Media Upload Dialog
- Drag and drop file upload
- Multiple file upload support
- File type validation
- Progress tracking
- Metadata editing (alt text, description)

### Media Management
- Centralized media storage
- Database-tracked metadata
- User permissions and ownership
- File organization by type and date

## Bucket Structure

The new media bucket is organized as follows:

```
media/
├── audio/
│   ├── 2025/
│   │   ├── 01/
│   │   └── 02/
│   └── ...
├── images/
│   ├── 2025/
│   │   ├── 01/
│   │   └── 02/
│   └── ...
├── videos/
│   └── ...
├── documents/
│   └── ...
└── temp/
    └── uploads/
```

## Database Schema

The new `media` table includes:

- `id`: UUID primary key
- `original_name`: Original filename
- `file_name`: Sanitized filename with timestamp
- `file_path`: Full path in storage bucket
- `file_size`: File size in bytes
- `mime_type`: MIME type
- `media_type`: Type category (audio, image, video, document)
- `url`: Public URL
- `alt_text`: Alternative text for accessibility
- `description`: Optional description
- `uploaded_by`: User who uploaded the file
- `created_at`: Upload timestamp
- `updated_at`: Last modification timestamp

## API Changes

### New Server Actions

- `uploadMedia`: Upload new media files
- `getMedia`: Retrieve media with filtering and pagination
- `deleteMedia`: Delete media files and database entries
- `getUserMedia`: Get media uploaded by specific user
- `getMediaByType`: Get media filtered by type

### Updated Components

- **TipTap Editor**: Uses MediaLibraryModal instead of direct file upload
- **Media Library**: New comprehensive media management interface
- **Media Upload**: Enhanced upload experience with metadata support

## Rollback Plan

If issues arise during migration:

1. **Preserve Original Files**: The migration scripts do not delete original files
2. **Database Rollback**: Remove the media table if needed
3. **Application Rollback**: Revert to previous TipTap editor implementation
4. **URL Restoration**: Article content can be restored from backups

## Post-Migration Cleanup

After successful migration and verification:

1. **Remove Old Bucket**: Consider removing the `audios` bucket after confirmation
2. **Clean Up Scripts**: Remove migration scripts from production environment
3. **Update Documentation**: Update application documentation
4. **Monitor Performance**: Monitor the new system performance

## Troubleshooting

### Common Issues

1. **File Upload Errors**: Check bucket permissions and file size limits
2. **Database Errors**: Verify media table exists and has correct schema
3. **URL Issues**: Check that media bucket is publicly accessible
4. **Migration Failures**: Check server logs for detailed error messages

### Support

For issues during migration:
1. Check the migration script logs
2. Verify database and storage permissions
3. Test with a small subset of files first
4. Contact the development team if issues persist

## Testing

After migration, test:
- [ ] Media upload functionality
- [ ] Media library browsing
- [ ] Media insertion in articles
- [ ] Media deletion
- [ ] File type validation
- [ ] Permission checks
- [ ] Performance with large media collections