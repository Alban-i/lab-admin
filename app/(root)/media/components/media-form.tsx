'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { 
  Image, 
  Music, 
  Video, 
  FileText, 
  Download, 
  Trash2, 
  Save,
  Calendar,
  User,
  HardDrive,
  File
} from 'lucide-react';
import { MediaWithProfile } from '@/actions/get-media';
import { updateMedia } from '@/actions/update-media';
import { deleteMedia } from '@/actions/delete-media';
import { toast } from 'sonner';
import NextImage from 'next/image';

const mediaFormSchema = z.object({
  alt_text: z.string().optional(),
  description: z.string().optional(),
});

type MediaFormData = z.infer<typeof mediaFormSchema>;

interface MediaFormProps {
  media: MediaWithProfile;
  onUpdate?: () => void;
  onDelete?: () => void;
}

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
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const MediaForm: React.FC<MediaFormProps> = ({ 
  media, 
  onUpdate, 
  onDelete 
}) => {
  const router = useRouter();
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const form = useForm<MediaFormData>({
    resolver: zodResolver(mediaFormSchema),
    defaultValues: {
      alt_text: media.alt_text || '',
      description: media.description || '',
    },
  });

  const handleSubmit = async (data: MediaFormData) => {
    setIsUpdating(true);
    try {
      const result = await updateMedia({
        id: media.id,
        alt_text: data.alt_text,
        description: data.description,
      });

      if (result.success) {
        toast.success('Media updated successfully');
        onUpdate?.();
      } else {
        toast.error(result.error || 'Failed to update media');
      }
    } catch (error) {
      toast.error('An error occurred while updating media');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const result = await deleteMedia(media.id);
      if (result.success) {
        toast.success('Media deleted successfully');
        onDelete?.();
        router.push(`/media/${media.media_type}`);
      } else {
        toast.error(result.error || 'Failed to delete media');
      }
    } catch (error) {
      toast.error('An error occurred while deleting media');
    } finally {
      setIsDeleting(false);
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
          <div className="relative w-full h-64 bg-muted rounded-lg overflow-hidden">
            <NextImage
              src={media.url}
              alt={media.alt_text || media.original_name}
              fill
              className="object-contain"
              onError={(e) => {
                const img = e.target as HTMLImageElement;
                img.style.display = 'none';
              }}
            />
          </div>
        );
      case 'audio':
        return (
          <div className="w-full bg-muted rounded-lg p-6">
            <div className="flex items-center justify-center mb-4">
              <Music className="h-12 w-12 text-muted-foreground" />
            </div>
            <audio controls className="w-full">
              <source src={media.url} type={media.mime_type} />
              Your browser does not support the audio element.
            </audio>
          </div>
        );
      case 'video':
        return (
          <div className="w-full bg-muted rounded-lg overflow-hidden">
            <video controls className="w-full max-h-64">
              <source src={media.url} type={media.mime_type} />
              Your browser does not support the video element.
            </video>
          </div>
        );
      case 'document':
        return (
          <div className="w-full bg-muted rounded-lg p-6 flex flex-col items-center justify-center">
            <FileText className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-sm text-muted-foreground text-center">
              Document preview not available. Click download to view the file.
            </p>
          </div>
        );
      default:
        return null;
    }
  };

  const MediaIcon = getMediaIcon(media.media_type);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <MediaIcon className="h-8 w-8 text-muted-foreground" />
          <div>
            <h1 className="text-2xl font-bold">{media.original_name}</h1>
            <p className="text-sm text-muted-foreground">
              {media.media_type} • {formatFileSize(media.file_size)}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            onClick={handleDownload}
            className="gap-2"
          >
            <Download className="h-4 w-4" />
            Download
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" className="gap-2">
                <Trash2 className="h-4 w-4" />
                Delete
              </Button>
            </AlertDialogTrigger>
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
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Preview */}
        <Card>
          <CardHeader>
            <CardTitle>Preview</CardTitle>
          </CardHeader>
          <CardContent>
            {renderMediaPreview()}
          </CardContent>
        </Card>

        {/* Edit Form */}
        <Card>
          <CardHeader>
            <CardTitle>Edit Media</CardTitle>
            <CardDescription>
              Update the metadata for this media file
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="alt_text">Alt Text</Label>
                <Input
                  id="alt_text"
                  {...form.register('alt_text')}
                  placeholder="Descriptive text for accessibility"
                />
                <p className="text-xs text-muted-foreground">
                  Helps screen readers and improves accessibility
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  {...form.register('description')}
                  placeholder="Optional description of the media"
                  rows={3}
                />
              </div>

              <Button 
                type="submit" 
                disabled={isUpdating}
                className="w-full gap-2"
              >
                <Save className="h-4 w-4" />
                {isUpdating ? 'Updating...' : 'Update Media'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>

      {/* File Information */}
      <Card>
        <CardHeader>
          <CardTitle>File Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <div className="flex items-center gap-2">
              <File className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Original Name</p>
                <p className="text-sm text-muted-foreground">{media.original_name}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="capitalize">
                {media.media_type}
              </Badge>
              <div>
                <p className="text-sm font-medium">Type</p>
                <p className="text-sm text-muted-foreground">{media.mime_type}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <HardDrive className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Size</p>
                <p className="text-sm text-muted-foreground">{formatFileSize(media.file_size)}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Uploaded</p>
                <p className="text-sm text-muted-foreground">{media.created_at ? formatDate(media.created_at) : 'Unknown'}</p>
              </div>
            </div>
            
            {media.profiles && (
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Uploaded by</p>
                  <p className="text-sm text-muted-foreground">
                    {media.profiles.full_name || 'Unknown'}
                  </p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};