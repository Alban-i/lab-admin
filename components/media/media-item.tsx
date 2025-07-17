'use client';

import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { 
  Image as ImageIcon, 
  Music, 
  Video, 
  FileText, 
  MoreHorizontal, 
  Trash2, 
  Edit, 
  Download,
  Eye,
  Calendar,
  User,
  HardDrive,
  Check
} from 'lucide-react';
import Image from 'next/image';
import { MediaWithProfile } from '@/actions/get-media';
import { deleteMedia } from '@/actions/delete-media';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface MediaItemProps {
  media: MediaWithProfile;
  viewMode: 'grid' | 'list';
  isSelected?: boolean;
  onSelect: () => void;
  onRefresh: () => void;
}

export const MediaItem: React.FC<MediaItemProps> = ({
  media,
  viewMode,
  isSelected = false,
  onSelect,
  onRefresh,
}) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const result = await deleteMedia(media.id);
      if (result.success) {
        toast.success('Media deleted successfully');
        onRefresh();
      } else {
        toast.error(result.error || 'Failed to delete media');
      }
    } catch (error) {
      toast.error('An error occurred while deleting media');
    } finally {
      setIsDeleting(false);
      setShowDeleteDialog(false);
    }
  };

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = media.url;
    link.download = media.original_name;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const renderMediaPreview = () => {
    switch (media.media_type) {
      case 'image':
        return (
          <div className="relative w-full h-32 bg-muted rounded-md overflow-hidden">
            <Image
              src={media.url}
              alt={media.alt_text || media.original_name}
              fill
              className="object-cover"
              onError={(e) => {
                const img = e.target as HTMLImageElement;
                img.style.display = 'none';
                img.parentElement?.classList.add('flex', 'items-center', 'justify-center');
              }}
            />
            <div className="absolute inset-0 flex items-center justify-center bg-muted">
              <ImageIcon className="h-8 w-8 text-muted-foreground" />
            </div>
          </div>
        );
      case 'audio':
        return (
          <div className="w-full h-32 bg-muted rounded-md flex items-center justify-center">
            <Music className="h-8 w-8 text-muted-foreground" />
          </div>
        );
      case 'video':
        return (
          <div className="relative w-full h-32 bg-muted rounded-md overflow-hidden">
            <video
              src={media.url}
              className="w-full h-full object-cover"
              onError={(e) => {
                const video = e.target as HTMLVideoElement;
                video.style.display = 'none';
                video.parentElement?.classList.add('flex', 'items-center', 'justify-center');
              }}
            />
            <div className="absolute inset-0 flex items-center justify-center bg-muted">
              <Video className="h-8 w-8 text-muted-foreground" />
            </div>
          </div>
        );
      case 'document':
        return (
          <div className="w-full h-32 bg-muted rounded-md flex items-center justify-center">
            <FileText className="h-8 w-8 text-muted-foreground" />
          </div>
        );
      default:
        return (
          <div className="w-full h-32 bg-muted rounded-md flex items-center justify-center">
            <FileText className="h-8 w-8 text-muted-foreground" />
          </div>
        );
    }
  };

  const MediaIcon = getMediaIcon(media.media_type);

  if (viewMode === 'list') {
    return (
      <Card className={cn(
        "cursor-pointer hover:shadow-md transition-shadow",
        isSelected && "ring-2 ring-primary"
      )}>
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-muted rounded-md flex items-center justify-center relative">
                <MediaIcon className="h-6 w-6 text-muted-foreground" />
                {isSelected && (
                  <div className="absolute -top-2 -right-2 bg-primary text-primary-foreground rounded-full p-1">
                    <Check className="h-3 w-3" />
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="font-medium truncate">{media.original_name}</h3>
                <Badge variant="secondary" className="text-xs">
                  {media.media_type}
                </Badge>
              </div>
              <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                <div className="flex items-center gap-1">
                  <HardDrive className="h-3 w-3" />
                  {formatFileSize(media.file_size)}
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {media.created_at ? formatDate(media.created_at) : 'Unknown'}
                </div>
                {media.profiles?.full_name && (
                  <div className="flex items-center gap-1">
                    <User className="h-3 w-3" />
                    {media.profiles.full_name}
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onSelect();
                }}
              >
                {isSelected ? 'Selected' : 'Select'}
              </Button>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setShowPreview(true)}>
                    <Eye className="h-4 w-4 mr-2" />
                    Preview
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleDownload}>
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => setShowDeleteDialog(true)}
                    className="text-destructive"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className={cn(
        "cursor-pointer hover:shadow-md transition-shadow relative",
        isSelected && "ring-2 ring-primary"
      )}>
        <CardContent className="p-3">
          <div className="space-y-3">
            <div className="relative" onClick={onSelect}>
              {renderMediaPreview()}
              {isSelected && (
                <div className="absolute top-2 right-2 bg-primary text-primary-foreground rounded-full p-1">
                  <Check className="h-3 w-3" />
                </div>
              )}
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <h3 className="font-medium text-sm truncate" title={media.original_name}>
                  {media.original_name}
                </h3>
                <Badge variant="secondary" className="text-xs">
                  {media.media_type}
                </Badge>
              </div>
              
              <div className="text-xs text-muted-foreground space-y-1">
                <div className="flex items-center justify-between">
                  <span>{formatFileSize(media.file_size)}</span>
                  <span>{media.created_at ? formatDate(media.created_at) : 'Unknown'}</span>
                </div>
                {media.profiles?.full_name && (
                  <div className="flex items-center gap-1">
                    <User className="h-3 w-3" />
                    <span className="truncate">{media.profiles.full_name}</span>
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onSelect();
                }}
                className="text-xs"
              >
                {isSelected ? 'Selected' : 'Select'}
              </Button>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setShowPreview(true)}>
                    <Eye className="h-4 w-4 mr-2" />
                    Preview
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleDownload}>
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => setShowDeleteDialog(true)}
                    className="text-destructive"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardContent>
      </Card>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Media</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{media.original_name}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground"
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};