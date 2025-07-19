'use client';

import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import { fetchMedia, fetchMediaById, fetchMediaByType, fetchUserMedia, mediaKeys } from './media-api';
import { MediaFilters, MediaWithProfile } from './get-media';
import { deleteMedia, deleteMultipleMedia } from './delete-media';
import { uploadMedia, MediaUploadData } from './upload-media';
import { updateMedia, MediaUpdateData } from './update-media';
import { toast } from 'sonner';

// Hook for fetching media with filters and pagination
export const useMediaQuery = (filters: MediaFilters = {}) => {
  return useQuery({
    queryKey: mediaKeys.list(filters),
    queryFn: () => fetchMedia(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};

// Hook for infinite loading of media (useful for pagination)
export const useInfiniteMediaQuery = (baseFilters: Omit<MediaFilters, 'offset' | 'limit'> = {}, limit = 20) => {
  return useInfiniteQuery({
    queryKey: [...mediaKeys.lists(), 'infinite', baseFilters],
    queryFn: ({ pageParam = 0 }) => 
      fetchMedia({ 
        ...baseFilters, 
        offset: pageParam, 
        limit 
      }),
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) => {
      const totalLoaded = allPages.length * limit;
      return totalLoaded < lastPage.count ? totalLoaded : undefined;
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};

// Hook for fetching a single media item by ID
export const useMediaByIdQuery = (id: string, enabled = true) => {
  return useQuery({
    queryKey: mediaKeys.detail(id),
    queryFn: () => fetchMediaById(id),
    enabled: !!id && enabled,
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
  });
};

// Hook for fetching media by type
export const useMediaByTypeQuery = (mediaType: 'audio' | 'image' | 'video' | 'document') => {
  return useQuery({
    queryKey: mediaKeys.byType(mediaType),
    queryFn: () => fetchMediaByType(mediaType),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};

// Hook for fetching user-specific media
export const useUserMediaQuery = (userId: string, enabled = true) => {
  return useQuery({
    queryKey: mediaKeys.byUser(userId),
    queryFn: () => fetchUserMedia(userId),
    enabled: !!userId && enabled,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};

// Mutation hooks for media operations
export const useDeleteMediaMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (mediaId: string) => {
      const result = await deleteMedia(mediaId);
      if (!result.success) {
        throw new Error(result.error || 'Failed to delete media');
      }
      return result;
    },
    onSuccess: (_, mediaId) => {
      toast.success('Media deleted successfully');
      
      // Invalidate all media queries after successful deletion
      queryClient.invalidateQueries({ queryKey: mediaKeys.all });
      
      // Remove the specific item from cache
      queryClient.removeQueries({ queryKey: mediaKeys.detail(mediaId) });
    },
    onError: (error) => {
      console.error('Error deleting media:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to delete media');
    },
  });
};

export const useDeleteMultipleMediaMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (mediaIds: string[]) => {
      const result = await deleteMultipleMedia(mediaIds);
      if (!result.success) {
        throw new Error(result.error || 'Failed to delete media');
      }
      return result;
    },
    onSuccess: (_, mediaIds) => {
      toast.success(`${mediaIds.length} media files deleted successfully`);
      
      // Invalidate all media queries after successful deletion
      queryClient.invalidateQueries({ queryKey: mediaKeys.all });
      
      // Remove the specific items from cache
      mediaIds.forEach(mediaId => {
        queryClient.removeQueries({ queryKey: mediaKeys.detail(mediaId) });
      });
    },
    onError: (error) => {
      console.error('Error deleting multiple media:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to delete media files');
    },
  });
};

export const useUploadMediaMutation = (options?: { showToast?: boolean }) => {
  const queryClient = useQueryClient();
  const showToast = options?.showToast !== false; // Default to true

  return useMutation({
    mutationFn: async (uploadData: MediaUploadData) => {
      const result = await uploadMedia(uploadData);
      if (!result.success || !result.data) {
        throw new Error(result.error || 'Failed to upload media');
      }
      return result.data;
    },
    onSuccess: (newMedia) => {
      if (showToast) {
        toast.success('Media uploaded successfully');
      }
      
      // Invalidate all media queries to refetch with new item
      queryClient.invalidateQueries({ queryKey: mediaKeys.all });
      
      // Optionally add the new media to specific caches
      queryClient.setQueryData(mediaKeys.detail(newMedia.id), newMedia);
    },
    onError: (error) => {
      console.error('Error uploading media:', error);
      if (showToast) {
        toast.error(error instanceof Error ? error.message : 'Failed to upload media');
      }
    },
  });
};

export const useUpdateMediaMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (updateData: MediaUpdateData) => {
      const result = await updateMedia(updateData);
      if (!result.success) {
        throw new Error(result.error || 'Failed to update media');
      }
      return result;
    },
    onSuccess: (_, updateData) => {
      toast.success('Media updated successfully');
      
      // Invalidate the specific item to refetch updated data
      queryClient.invalidateQueries({ queryKey: mediaKeys.detail(updateData.id) });
      
      // Invalidate all media queries to ensure they reflect the update
      queryClient.invalidateQueries({ queryKey: mediaKeys.all });
    },
    onError: (error) => {
      console.error('Error updating media:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to update media');
    },
  });
};

// Utility function to prefetch media
export const usePrefetchMedia = () => {
  const queryClient = useQueryClient();

  return {
    prefetchMedia: (filters: MediaFilters) => {
      return queryClient.prefetchQuery({
        queryKey: mediaKeys.list(filters),
        queryFn: () => fetchMedia(filters),
        staleTime: 5 * 60 * 1000,
      });
    },
    prefetchMediaById: (id: string) => {
      return queryClient.prefetchQuery({
        queryKey: mediaKeys.detail(id),
        queryFn: () => fetchMediaById(id),
        staleTime: 10 * 60 * 1000,
      });
    },
  };
};