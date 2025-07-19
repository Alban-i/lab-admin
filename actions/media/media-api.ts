'use client';

import { getMedia, getMediaById, getMediaByType, getUserMedia, MediaFilters, MediaWithProfile, MediaResult } from './get-media';

// Client-side wrapper functions for TanStack Query
// These wrap the server actions to work properly with React Query

export const fetchMedia = async (filters: MediaFilters = {}): Promise<MediaResult> => {
  return await getMedia(filters);
};

export const fetchMediaById = async (id: string): Promise<MediaWithProfile | null> => {
  return await getMediaById(id);
};

export const fetchMediaByType = async (mediaType: 'audio' | 'image' | 'video' | 'document'): Promise<MediaWithProfile[]> => {
  return await getMediaByType(mediaType);
};

export const fetchUserMedia = async (userId: string): Promise<MediaWithProfile[]> => {
  return await getUserMedia(userId);
};

// Query key factories for consistent cache keys
export const mediaKeys = {
  all: ['media'] as const,
  lists: () => [...mediaKeys.all, 'list'] as const,
  list: (filters: MediaFilters) => [...mediaKeys.lists(), filters] as const,
  details: () => [...mediaKeys.all, 'detail'] as const,
  detail: (id: string) => [...mediaKeys.details(), id] as const,
  byType: (type: string) => [...mediaKeys.all, 'type', type] as const,
  byUser: (userId: string) => [...mediaKeys.all, 'user', userId] as const,
};