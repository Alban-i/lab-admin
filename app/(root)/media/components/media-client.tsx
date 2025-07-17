'use client';

import { useState, useEffect } from 'react';
import { PlusCircle, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { MediaWithProfile, getMediaByType } from '@/actions/get-media';
import { MediaDataTable } from './media-data-table';
import { createMediaColumns } from './media-columns';
import { MediaUploadDialog } from '@/components/media/media-upload-dialog';
import { RevalidateButton } from '@/components/revalidate-button';
import { toast } from 'sonner';

interface MediaClientProps {
  initialMedia: MediaWithProfile[];
  mediaType: 'audio' | 'image' | 'video' | 'document';
  title: string;
  revalidatePath: string;
}

const MediaClient: React.FC<MediaClientProps> = ({ 
  initialMedia, 
  mediaType, 
  title,
  revalidatePath 
}) => {
  const [media, setMedia] = useState<MediaWithProfile[]>(initialMedia);
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const refreshMedia = async () => {
    setLoading(true);
    try {
      const freshMedia = await getMediaByType(mediaType);
      setMedia(freshMedia);
    } catch (error) {
      toast.error('Failed to refresh media');
    } finally {
      setLoading(false);
    }
  };

  const handleUploadSuccess = () => {
    setIsUploadDialogOpen(false);
    refreshMedia();
    toast.success('Media uploaded successfully!');
  };

  const columns = createMediaColumns(refreshMedia);

  return (
    <div className="grid gap-3 px-4">
      {/* Header */}
      <div className="flex items-center gap-4">
        <h2 className="text-2xl font-bold">{title}</h2>
        <div className="ml-auto flex items-center gap-2">
          <RevalidateButton path={revalidatePath} label={`Revalidate ${title} Page`} />
          
          <Button 
            onClick={() => setIsUploadDialogOpen(true)}
            className="gap-1"
          >
            <Upload className="h-3.5 w-3.5" />
            <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
              Upload
            </span>
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-4">
        <div className="rounded-lg border p-4">
          <div className="text-2xl font-bold">{media.length}</div>
          <p className="text-sm text-muted-foreground">Total Files</p>
        </div>
        <div className="rounded-lg border p-4">
          <div className="text-2xl font-bold">
            {(media.reduce((acc, item) => acc + item.file_size, 0) / 1024 / 1024).toFixed(1)}MB
          </div>
          <p className="text-sm text-muted-foreground">Total Size</p>
        </div>
        <div className="rounded-lg border p-4">
          <div className="text-2xl font-bold">
            {media.filter(item => {
              if (!item.created_at) return false;
              const uploadDate = new Date(item.created_at);
              const oneWeekAgo = new Date();
              oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
              return uploadDate > oneWeekAgo;
            }).length}
          </div>
          <p className="text-sm text-muted-foreground">Recent (7 days)</p>
        </div>
      </div>

      {/* Data Table */}
      <MediaDataTable 
        columns={columns} 
        data={media} 
        searchPlaceholder={`Search ${title.toLowerCase()}...`}
        mediaType={mediaType}
      />

      {/* Upload Dialog */}
      <MediaUploadDialog
        isOpen={isUploadDialogOpen}
        onClose={() => setIsUploadDialogOpen(false)}
        onSuccess={handleUploadSuccess}
        mediaType={mediaType}
      />
    </div>
  );
};

export default MediaClient;