'use client';

import React, { useState, useCallback } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Upload, 
  X, 
  Image, 
  Music, 
  Video, 
  FileText, 
  AlertCircle,
  Check,
  Loader2
} from 'lucide-react';
import { uploadMedia, MediaUploadData } from '@/actions/upload-media';
import { TablesInsert } from '@/types/types_db';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface MediaUploadDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (uploadedMedia: (TablesInsert<'media'> & { id: string })[]) => void;
  mediaType?: 'audio' | 'image' | 'video' | 'document';
}

interface FileUploadItem {
  file: File;
  mediaType: 'audio' | 'image' | 'video' | 'document';
  altText: string;
  description: string;
  status: 'pending' | 'uploading' | 'success' | 'error';
  progress: number;
  error?: string;
  uploadedMediaData?: TablesInsert<'media'> & { id: string };
}

export const MediaUploadDialog: React.FC<MediaUploadDialogProps> = ({
  isOpen,
  onClose,
  onSuccess,
  mediaType,
}) => {
  const [files, setFiles] = useState<FileUploadItem[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const getMediaTypeFromFile = useCallback((file: File): 'audio' | 'image' | 'video' | 'document' => {
    if (mediaType) return mediaType;
    
    const type = file.type.split('/')[0];
    switch (type) {
      case 'image':
        return 'image';
      case 'audio':
        return 'audio';
      case 'video':
        return 'video';
      default:
        return 'document';
    }
  }, [mediaType]);

  const getFileTypeIcon = (type: string) => {
    switch (type) {
      case 'image':
        return Image;
      case 'audio':
        return Music;
      case 'video':
        return Video;
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

  const handleFiles = useCallback((fileList: FileList) => {
    const newFiles: FileUploadItem[] = Array.from(fileList).map(file => ({
      file,
      mediaType: getMediaTypeFromFile(file),
      altText: '',
      description: '',
      status: 'pending',
      progress: 0,
    }));

    setFiles(prev => [...prev, ...newFiles]);
  }, [getMediaTypeFromFile]);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  }, [handleFiles]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(e.target.files);
    }
  }, [handleFiles]);

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const updateFileData = (index: number, field: keyof FileUploadItem, value: string | number | FileUploadItem['status'] | FileUploadItem['uploadedMediaData'] | ((prev: number) => number)) => {
    setFiles(prev => prev.map((file, i) => {
      if (i === index) {
        if (typeof value === 'function' && field === 'progress') {
          return { ...file, [field]: value(file.progress) };
        }
        return { ...file, [field]: value };
      }
      return file;
    }));
  };

  const uploadFile = async (fileItem: FileUploadItem, index: number) => {
    updateFileData(index, 'status', 'uploading');
    updateFileData(index, 'progress', 0);

    // Check file size before upload (Next.js Server Action limit is 30MB as configured)
    const maxSizeForServerAction = 30 * 1024 * 1024; // 30MB in bytes
    if (fileItem.file.size > maxSizeForServerAction) {
      updateFileData(index, 'status', 'error');
      updateFileData(index, 'error', `File size (${formatFileSize(fileItem.file.size)}) exceeds the 30MB limit for uploads. Please use a smaller file.`);
      return;
    }

    let progressInterval: NodeJS.Timeout | null = null;
    
    try {
      const uploadData: MediaUploadData = {
        originalName: fileItem.file.name,
        file: fileItem.file,
        mediaType: fileItem.mediaType,
        altText: fileItem.altText,
        description: fileItem.description,
      };

      // Simulate progress for better UX
      progressInterval = setInterval(() => {
        updateFileData(index, 'progress', (prev: number) => Math.min(prev + 10, 90));
      }, 200);

      const result = await uploadMedia(uploadData);
      clearInterval(progressInterval);

      if (result.success && result.data) {
        updateFileData(index, 'status', 'success');
        updateFileData(index, 'progress', 100);
        updateFileData(index, 'uploadedMediaData', result.data);
      } else {
        updateFileData(index, 'status', 'error');
        updateFileData(index, 'error', result.error || 'Upload failed');
      }
    } catch (error) {
      // Clear progress interval if it exists
      if (progressInterval) {
        clearInterval(progressInterval);
      }
      
      updateFileData(index, 'status', 'error');
      
      // Handle different types of errors
      if (error instanceof Error) {
        // Check for specific error patterns
        if (error.message.includes('Body exceeded') || error.message.includes('413')) {
          updateFileData(index, 'error', `File size (${formatFileSize(fileItem.file.size)}) exceeds the upload limit. Please use a smaller file.`);
        } else if (error.message.includes('Network')) {
          updateFileData(index, 'error', 'Network error. Please check your connection and try again.');
        } else {
          updateFileData(index, 'error', `Upload failed: ${error.message}`);
        }
      } else {
        updateFileData(index, 'error', 'An unexpected error occurred. Please try again.');
      }
    }
  };

  const handleUploadAll = async () => {
    setIsUploading(true);
    
    const pendingFiles = files.filter(file => file.status === 'pending');
    
    try {
      await Promise.all(
        pendingFiles.map((file) => {
          const actualIndex = files.findIndex(f => f === file);
          return uploadFile(file, actualIndex);
        })
      );

      const successCount = files.filter(file => file.status === 'success').length;
      const errorCount = files.filter(file => file.status === 'error').length;

      if (successCount > 0) {
        toast.success(`${successCount} file(s) uploaded successfully`);
        
        // Collect uploaded media data for successful uploads and call onSuccess immediately
        const uploadedMediaData = files
          .filter(file => file.status === 'success' && file.uploadedMediaData)
          .map(file => file.uploadedMediaData!);
        
        onSuccess(uploadedMediaData);
      }
      
      if (errorCount > 0) {
        toast.error(`${errorCount} file(s) failed to upload`);
      }

      // Reset files state but keep modal open for user to interact with confirmation
      setFiles([]);
    } catch (error) {
      toast.error('Upload failed');
    } finally {
      setIsUploading(false);
    }
  };

  const handleClose = () => {
    if (!isUploading) {
      setFiles([]);
      onClose();
    }
  };

  const canUpload = files.length > 0 && files.some(file => file.status === 'pending');
  const hasSuccessfulUploads = files.some(file => file.status === 'success');

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Upload Media</DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-hidden">
          {files.length === 0 ? (
            <div
              className={cn(
                "border-2 border-dashed rounded-lg p-8 text-center transition-colors",
                dragActive 
                  ? "border-primary bg-primary/5" 
                  : "border-muted-foreground/25 hover:border-muted-foreground/50"
              )}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <div className="space-y-2">
                <p className="text-lg font-medium">
                  Drag and drop files here, or click to select
                </p>
                <p className="text-sm text-muted-foreground">
                  Supports images, audio, video, and documents
                </p>
              </div>
              <input
                type="file"
                multiple
                className="hidden"
                id="file-upload"
                onChange={handleFileInput}
                accept={mediaType ? {
                  image: 'image/*',
                  audio: 'audio/*',
                  video: 'video/*',
                  document: '.pdf,.doc,.docx'
                }[mediaType] : undefined}
              />
              <label htmlFor="file-upload">
                <Button className="mt-4" asChild>
                  <span>Select Files</span>
                </Button>
              </label>
            </div>
          ) : (
            <div className="space-y-4 max-h-[60vh] overflow-y-auto">
              {files.map((fileItem, index) => {
                const FileIcon = getFileTypeIcon(fileItem.mediaType);
                return (
                  <Card key={index}>
                    <CardContent className="p-4">
                      <div className="flex items-start gap-4">
                        <div className="flex-shrink-0">
                          <div className="w-16 h-16 bg-muted rounded-lg flex items-center justify-center">
                            <FileIcon className="h-8 w-8 text-muted-foreground" />
                          </div>
                        </div>
                        
                        <div className="flex-1 space-y-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <h3 className="font-medium">{fileItem.file.name}</h3>
                              <p className="text-sm text-muted-foreground">
                                {formatFileSize(fileItem.file.size)} • {fileItem.mediaType}
                              </p>
                            </div>
                            
                            <div className="flex items-center gap-2">
                              {fileItem.status === 'success' && (
                                <Check className="h-5 w-5 text-green-600" />
                              )}
                              {fileItem.status === 'error' && (
                                <AlertCircle className="h-5 w-5 text-destructive" />
                              )}
                              {fileItem.status === 'uploading' && (
                                <Loader2 className="h-5 w-5 animate-spin" />
                              )}
                              {fileItem.status === 'pending' && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => removeFile(index)}
                                  disabled={isUploading}
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              )}
                            </div>
                          </div>

                          {fileItem.status === 'uploading' && (
                            <Progress value={fileItem.progress} className="w-full" />
                          )}

                          {fileItem.status === 'error' && (
                            <p className="text-sm text-destructive">{fileItem.error}</p>
                          )}

                          {fileItem.status === 'pending' && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <Label htmlFor={`media-type-${index}`}>Media Type</Label>
                                <Select
                                  value={fileItem.mediaType}
                                  onValueChange={(value) => updateFileData(index, 'mediaType', value)}
                                  disabled={isUploading}
                                >
                                  <SelectTrigger id={`media-type-${index}`}>
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="image">Image</SelectItem>
                                    <SelectItem value="audio">Audio</SelectItem>
                                    <SelectItem value="video">Video</SelectItem>
                                    <SelectItem value="document">Document</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>

                              <div className="space-y-2">
                                <Label htmlFor={`alt-text-${index}`}>Alt Text</Label>
                                <Input
                                  id={`alt-text-${index}`}
                                  value={fileItem.altText}
                                  onChange={(e) => updateFileData(index, 'altText', e.target.value)}
                                  placeholder="Optional alt text"
                                  disabled={isUploading}
                                />
                              </div>

                              <div className="space-y-2 md:col-span-2">
                                <Label htmlFor={`description-${index}`}>Description</Label>
                                <Textarea
                                  id={`description-${index}`}
                                  value={fileItem.description}
                                  onChange={(e) => updateFileData(index, 'description', e.target.value)}
                                  placeholder="Optional description"
                                  disabled={isUploading}
                                  rows={2}
                                />
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isUploading}
          >
            {isUploading ? 'Uploading...' : hasSuccessfulUploads ? 'Close' : 'Cancel'}
          </Button>
          
          {files.length > 0 && (
            <Button
              onClick={handleUploadAll}
              disabled={!canUpload || isUploading}
            >
              {isUploading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Uploading...
                </>
              ) : (
                `Upload ${files.filter(f => f.status === 'pending').length} file(s)`
              )}
            </Button>
          )}
          
          {hasSuccessfulUploads && !isUploading && (
            <div className="text-sm text-green-600 font-medium">
              Upload complete! Check the editor for insertion options.
            </div>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};