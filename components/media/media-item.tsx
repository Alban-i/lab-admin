'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { 
  Image as ImageIcon, 
  Music, 
  Video, 
  FileText, 
  Check
} from 'lucide-react';
import { MediaWithProfile } from '@/actions/get-media';
import { cn } from '@/lib/utils';
import { TableCell, TableRow } from '@/components/ui/table';

interface MediaItemProps {
  media: MediaWithProfile;
  isSelected?: boolean;
  onSelect: () => void;
  onRefresh: () => void;
}

export const MediaItem: React.FC<MediaItemProps> = ({
  media,
  isSelected = false,
  onSelect,
  onRefresh,
}) => {

  const getMediaIcon = (mediaType: string) => {
    switch (mediaType) {
      case 'audio':
        return Music;
      case 'image':
        return ImageIcon;
      case 'video':
        return Video;
      case 'document':
        return FileText;
      default:
        return FileText;
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };



  const MediaIcon = getMediaIcon(media.media_type);

  return (
    <TableRow className={cn(
      "hover:bg-muted/50 transition-colors",
      isSelected && "bg-muted"
    )}>
      <TableCell className="font-medium">
        <div className="flex items-center gap-3">
          <div className="flex-shrink-0">
            <div className="w-8 h-8 bg-muted rounded-md flex items-center justify-center relative">
              <MediaIcon className="h-4 w-4 text-muted-foreground" />
              {isSelected && (
                <div className="absolute -top-1 -right-1 bg-primary text-primary-foreground rounded-full p-0.5">
                  <Check className="h-2 w-2" />
                </div>
              )}
            </div>
          </div>
          <span className="truncate" title={media.original_name}>
            {media.original_name}
          </span>
        </div>
      </TableCell>
      <TableCell className="text-muted-foreground">
        {formatFileSize(media.file_size)}
      </TableCell>
      <TableCell className="text-right">
        <Button
          variant="outline"
          size="sm"
          className="cursor-pointer"
          onClick={(e) => {
            e.stopPropagation();
            onSelect();
          }}
        >
          {isSelected ? 'Selected' : 'Select'}
        </Button>
      </TableCell>
    </TableRow>
  );
};