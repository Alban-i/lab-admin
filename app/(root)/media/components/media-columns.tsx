'use client';

import { ColumnDef } from '@tanstack/react-table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
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
import { MediaWithProfile } from '@/actions/media/get-media';
import { DataTableColumnHeader } from './data-table-column-header';
import { 
  MoreHorizontal, 
  Edit, 
  Download, 
  Trash2, 
  Image, 
  Music, 
  Video, 
  FileText 
} from 'lucide-react';
import Link from 'next/link';
import { deleteMedia } from '@/actions/media/delete-media';
import { toast } from 'sonner';
import { useState } from 'react';

const getMediaIcon = (mediaType: string) => {
  switch (mediaType) {
    case 'audio':
      return Music;
    case 'image':
      return Image;
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

const MediaActions = ({ media, onRefresh }: { media: MediaWithProfile; onRefresh: () => void }) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = media.url;
    link.download = media.original_name;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem asChild>
            <Link href={`/media/${media.media_type}/${media.id}`}>
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Link>
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

export const createMediaColumns = (onRefresh: () => void): ColumnDef<MediaWithProfile>[] => [
  {
    accessorKey: 'original_name',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Name" />
    ),
    cell: ({ row }) => {
      const media = row.original;
      const MediaIcon = getMediaIcon(media.media_type);
      
      return (
        <div className="flex items-center gap-2 max-w-[400px]">
          <MediaIcon className="h-4 w-4 text-muted-foreground flex-shrink-0" />
          <span className="font-medium truncate" title={media.original_name}>
            {media.original_name}
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: 'media_type',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Type" />
    ),
    cell: ({ row }) => {
      const mediaType = row.getValue('media_type') as string;
      return (
        <Badge variant="secondary" className="capitalize">
          {mediaType}
        </Badge>
      );
    },
  },
  {
    accessorKey: 'file_size',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Size" />
    ),
    cell: ({ row }) => {
      const size = row.getValue('file_size') as number;
      return formatFileSize(size);
    },
  },
  {
    id: 'actions',
    cell: ({ row }) => {
      const media = row.original;
      return <MediaActions media={media} onRefresh={onRefresh} />;
    },
  },
];