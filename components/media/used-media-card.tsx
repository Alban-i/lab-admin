'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Image as ImageIcon, 
  Music, 
  Video, 
  FileText, 
  Trash2,
  Loader2
} from 'lucide-react';
import { MediaWithProfile } from '@/actions/media/get-media';
import { getArticleMedia } from '@/actions/media/get-article-media';
import { removeArticleMedia } from '@/actions/media/remove-article-media';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface UsedMediaCardProps {
  articleId: string | undefined;
  onMediaRemoved?: () => void;
}

export const UsedMediaCard: React.FC<UsedMediaCardProps> = ({
  articleId,
  onMediaRemoved
}) => {
  const [media, setMedia] = useState<MediaWithProfile[]>([]);
  const [loading, setLoading] = useState(false);
  const [removingId, setRemovingId] = useState<string | null>(null);

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

  const fetchArticleMedia = useCallback(async () => {
    if (!articleId) return;
    
    setLoading(true);
    try {
      const result = await getArticleMedia(articleId);
      if (result.error) {
        toast.error(result.error);
      } else {
        setMedia(result.data);
      }
    } catch (error) {
      toast.error('Failed to fetch article media');
    } finally {
      setLoading(false);
    }
  }, [articleId]);

  const handleRemoveMedia = async (mediaId: string) => {
    if (!articleId) return;

    setRemovingId(mediaId);
    try {
      const result = await removeArticleMedia(articleId, mediaId);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success('Media relationship removed');
        setMedia(prev => prev.filter(m => m.id !== mediaId));
        onMediaRemoved?.();
      }
    } catch (error) {
      toast.error('Failed to remove media relationship');
    } finally {
      setRemovingId(null);
    }
  };

  useEffect(() => {
    fetchArticleMedia();
  }, [articleId, fetchArticleMedia]);

  // Don't render the card if no articleId (new article)
  if (!articleId) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Used Media</span>
          {loading && <Loader2 className="h-4 w-4 animate-spin" />}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {media.length === 0 ? (
          <div className="text-center py-4 text-muted-foreground">
            <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No media used in this article</p>
          </div>
        ) : (
          <div className="space-y-2">
            {media.map((item) => {
              const MediaIcon = getMediaIcon(item.media_type);
              return (
                <div
                  key={item.id}
                  className="flex items-center gap-3 p-2 rounded-lg border hover:bg-muted/50 transition-colors"
                >
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-muted rounded-md flex items-center justify-center">
                      <MediaIcon className="h-4 w-4 text-muted-foreground" />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate" title={item.original_name}>
                      {item.original_name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {item.media_type} • {formatFileSize(item.file_size)}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveMedia(item.id)}
                    disabled={removingId === item.id}
                    className="flex-shrink-0 h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                  >
                    {removingId === item.id ? (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    ) : (
                      <Trash2 className="h-3 w-3" />
                    )}
                  </Button>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
};