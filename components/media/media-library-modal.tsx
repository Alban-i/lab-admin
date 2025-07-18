'use client';

import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Search, 
  Upload, 
  Filter, 
  Image, 
  Music, 
  Video, 
  FileText,
  X,
  ChevronLeft,
  ChevronRight,
  Loader2
} from 'lucide-react';
import { getMedia, MediaWithProfile, MediaFilters } from '@/actions/get-media';
import { MediaItem } from './media-item';
import { MediaUploadDialog } from './media-upload-dialog';
import { toast } from 'sonner';
import { Table, TableBody, TableHead, TableHeader, TableRow } from '@/components/ui/table';

export interface MediaLibraryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (media: MediaWithProfile) => void;
  mediaType?: 'audio' | 'image' | 'video' | 'document';
  title?: string;
  multiSelect?: boolean;
}

export const MediaLibraryModal: React.FC<MediaLibraryModalProps> = ({
  isOpen,
  onClose,
  onSelect,
  mediaType,
  title = 'Media Library',
  multiSelect = false,
}) => {
  const [media, setMedia] = useState<MediaWithProfile[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string>(mediaType || 'all');
  const [selectedMedia, setSelectedMedia] = useState<MediaWithProfile[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  
  const itemsPerPage = 20;

  const mediaTypeIcons = {
    audio: Music,
    image: Image,
    video: Video,
    document: FileText,
  };

  const fetchMedia = async (page: number = 1, search?: string, type?: string) => {
    setLoading(true);
    try {
      const filters: MediaFilters = {
        limit: itemsPerPage,
        offset: (page - 1) * itemsPerPage,
        search: search || undefined,
        mediaType: type && type !== 'all' ? type as 'audio' | 'image' | 'video' | 'document' : undefined,
      };

      const result = await getMedia(filters);
      if (result.error) {
        toast.error('Failed to load media');
        return;
      }

      setMedia(result.data);
      setTotalCount(result.count);
    } catch (error) {
      console.error('Error fetching media:', error);
      toast.error('Failed to load media');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchMedia(1, searchTerm, selectedType);
      setCurrentPage(1);
    }
  }, [isOpen, searchTerm, selectedType]);

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const handleTypeChange = (value: string) => {
    setSelectedType(value);
    setCurrentPage(1);
  };

  const handleMediaSelect = (mediaItem: MediaWithProfile) => {
    if (multiSelect) {
      setSelectedMedia(prev => {
        const isSelected = prev.some(item => item.id === mediaItem.id);
        if (isSelected) {
          return prev.filter(item => item.id !== mediaItem.id);
        }
        return [...prev, mediaItem];
      });
    } else {
      onSelect(mediaItem);
      onClose();
    }
  };

  const handleMultiSelectConfirm = () => {
    if (selectedMedia.length > 0) {
      selectedMedia.forEach(mediaItem => onSelect(mediaItem));
      onClose();
    }
  };

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    fetchMedia(newPage, searchTerm, selectedType);
  };


  const totalPages = Math.ceil(totalCount / itemsPerPage);

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-[95vw] sm:max-w-[95vw] w-[95vw] h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {title}
              {selectedMedia.length > 0 && (
                <Badge variant="secondary">
                  {selectedMedia.length} selected
                </Badge>
              )}
            </DialogTitle>
          </DialogHeader>

          <div className="flex flex-col gap-4 flex-1 overflow-hidden">
            {/* Filter and Upload Bar */}
            <div className="flex items-center gap-4 pb-4">
              <Select value={selectedType} onValueChange={handleTypeChange}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="audio">Audio</SelectItem>
                  <SelectItem value="image">Images</SelectItem>
                  <SelectItem value="video">Videos</SelectItem>
                  <SelectItem value="document">Documents</SelectItem>
                </SelectContent>
              </Select>

              <Button
                onClick={() => setIsUploadDialogOpen(true)}
                className="flex items-center gap-2"
              >
                <Upload className="h-4 w-4" />
                Upload
              </Button>
            </div>

            {/* Search Bar */}
            <div className="pb-4 border-b">
              <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search media..."
                  value={searchTerm}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pl-10 w-full"
                />
              </div>
            </div>

            {/* Media Table */}
            <ScrollArea className="flex-1">
              {loading ? (
                <div className="flex items-center justify-center h-32">
                  <Loader2 className="h-6 w-6 animate-spin" />
                </div>
              ) : media.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-32 text-muted-foreground">
                  <FileText className="h-12 w-12 mb-4" />
                  <p>No media found</p>
                  <p className="text-sm">Try adjusting your search or upload new media</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Size</TableHead>
                      <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {media.map((mediaItem) => (
                      <MediaItem
                        key={mediaItem.id}
                        media={mediaItem}
                        isSelected={selectedMedia.some(item => item.id === mediaItem.id)}
                        onSelect={() => handleMediaSelect(mediaItem)}
                        onRefresh={() => fetchMedia(currentPage, searchTerm, selectedType)}
                      />
                    ))}
                  </TableBody>
                </Table>
              )}
            </ScrollArea>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between border-t pt-4">
                <div className="text-sm text-muted-foreground">
                  Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, totalCount)} of {totalCount} results
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <span className="text-sm">
                    Page {currentPage} of {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </div>

          {multiSelect && (
            <DialogFooter>
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button 
                onClick={handleMultiSelectConfirm}
                disabled={selectedMedia.length === 0}
              >
                Select {selectedMedia.length > 0 ? `(${selectedMedia.length})` : ''}
              </Button>
            </DialogFooter>
          )}
        </DialogContent>
      </Dialog>

      <MediaUploadDialog
        isOpen={isUploadDialogOpen}
        onClose={() => setIsUploadDialogOpen(false)}
        mediaType={mediaType}
      />
    </>
  );
};