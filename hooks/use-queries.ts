'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth, getAuthHeaders } from '@/contexts/auth-context';
import type { IEvent } from '@/lib/models/Event';
import type { IFighter } from '@/lib/models/Fighter';
import type { IFight } from '@/lib/models/Fight';
import type { IMerch } from '@/lib/models/Merch';
import type { ITicketTier } from '@/lib/models/TicketTier';
import type { IVideo } from '@/lib/models/Video';
import type { IFlashSale } from '@/lib/models/FlashSale';

// ==================== UTILITY FUNCTIONS ====================

async function apiRequest(
  url: string,
  options: RequestInit,
  token: string | null
) {
  const headers: HeadersInit = {
    ...getAuthHeaders(token),
    ...(options.headers || {}),
  };

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response
      .json()
      .catch(() => ({ error: 'Unknown error' }));
    throw new Error(error.error || `HTTP ${response.status}`);
  }

  return response.json();
}

// ==================== GALLERY ====================

export type GalleryImage = {
  id: string;
  publicId: string;
  secureUrl: string;
  width: number;
  height: number;
  format: string;
};

export type GalleryEvent = {
  name: string;
  thumbnail?: { url: string };
};

export type RandomImage = {
  id: string;
  url: string;
  width: number;
  height: number;
};

export function useGalleryEventsQuery() {
  return useQuery({
    queryKey: ['gallery', 'events'],
    queryFn: async () => {
      const response = await fetch('/api/gallery/events');
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || `HTTP ${response.status}`);
      }

      return response.json() as Promise<GalleryEvent[]>;
    },
    // Enhanced caching - cache for 1 hour, keep in memory for 2 hours
    staleTime: 60 * 60 * 1000, // 1 hour
    gcTime: 2 * 60 * 60 * 1000, // 2 hours
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
  });
}

export function useGalleryImagesQuery(folder: string, nextCursor?: string) {
  return useQuery({
    queryKey: ['gallery', 'images', folder], // Remove nextCursor from query key
    queryFn: async () => {
      const params = new URLSearchParams({ folder });
      if (nextCursor) params.set('nextCursor', nextCursor);

      const response = await fetch(`/api/images?${params.toString()}`);
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || `HTTP ${response.status}`);
      }

      return response.json() as Promise<{
        resources: GalleryImage[];
        nextCursor?: string;
      }>;
    },
    enabled: !!folder,
    // Enhanced caching - cache for 1 hour, keep in memory for 2 hours
    staleTime: 60 * 60 * 1000, // 1 hour
    gcTime: 2 * 60 * 60 * 1000, // 2 hours
    // Disable automatic refetching to prevent infinite loops
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
  });
}

export function useRandomImagesQuery() {
  return useQuery({
    queryKey: ['gallery', 'random-images'],
    queryFn: async () => {
      const response = await fetch('/api/gallery/random-images');
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || `HTTP ${response.status}`);
      }

      return response.json() as Promise<RandomImage[]>;
    },
    // Enhanced caching - cache for 1 hour, keep in memory for 2 hours
    staleTime: 60 * 60 * 1000, // 1 hour (increased from 5 minutes)
    gcTime: 2 * 60 * 60 * 1000, // 2 hours
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
  });
}

// ==================== TRANSACTIONS ====================

export function useTransactionQuery(sessionId: string) {
  return useQuery({
    queryKey: ['transaction', sessionId],
    queryFn: () =>
      apiRequest(`/api/checkout/transaction/${sessionId}`, {}, null),
    enabled: !!sessionId,
  });
}

export function useDownloadTicketMutation() {
  return useMutation({
    mutationFn: async (orderId: string) => {
      const response = await fetch(`/api/tickets/${orderId}/download`);

      if (!response.ok) {
        const error = await response
          .json()
          .catch(() => ({ error: 'Download failed' }));
        throw new Error(error.error || `HTTP ${response.status}`);
      }

      // Return the blob for download handling
      return response.blob();
    },
  });
}

// ==================== EVENTS ====================

export function useEventsQuery() {
  const { accessToken } = useAuth();

  return useQuery({
    queryKey: ['events'],
    queryFn: () => apiRequest('/api/events', {}, accessToken),
    // Public query - no auth required
  });
}

export function useUpcomingEventsQuery() {
  const { accessToken } = useAuth();

  return useQuery({
    queryKey: ['events', 'upcoming'],
    queryFn: () =>
      apiRequest(
        '/api/events?isActive=true&isPastEvent=false',
        {},
        accessToken
      ),
    // Public query - no auth required
  });
}

export function usePastEventsQuery() {
  const { accessToken } = useAuth();

  return useQuery({
    queryKey: ['events', 'past'],
    queryFn: () => apiRequest('/api/events?isPastEvent=true', {}, accessToken),
    // Public query - no auth required
  });
}

export function useEventQuery(id: string) {
  const { accessToken } = useAuth();

  return useQuery({
    queryKey: ['events', id],
    queryFn: () => apiRequest(`/api/events/${id}`, {}, accessToken),
    enabled: !!id, // Only requires valid ID, not auth
  });
}

// ADMIN-ONLY MUTATIONS
export function useCreateEventMutation() {
  const { accessToken, isAuthenticated } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (eventData: Partial<IEvent>) => {
      if (!isAuthenticated || !accessToken) {
        throw new Error('Admin authentication required');
      }
      return apiRequest(
        '/api/events',
        {
          method: 'POST',
          body: JSON.stringify(eventData),
        },
        accessToken
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
    },
  });
}

export function useUpdateEventMutation() {
  const { accessToken, isAuthenticated } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, ...eventData }: Partial<IEvent> & { id: string }) => {
      if (!isAuthenticated || !accessToken) {
        throw new Error('Admin authentication required');
      }
      return apiRequest(
        `/api/events/${id}`,
        {
          method: 'PUT',
          body: JSON.stringify(eventData),
        },
        accessToken
      );
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
      queryClient.invalidateQueries({ queryKey: ['events', variables.id] });
    },
  });
}

export function useDeleteEventMutation() {
  const { accessToken, isAuthenticated } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => {
      if (!isAuthenticated || !accessToken) {
        throw new Error('Admin authentication required');
      }
      return apiRequest(
        `/api/events/${id}`,
        {
          method: 'DELETE',
        },
        accessToken
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
    },
  });
}

// ==================== FIGHTERS ====================

export function useFightersQuery() {
  const { accessToken } = useAuth();

  return useQuery({
    queryKey: ['fighters'],
    queryFn: () => apiRequest('/api/fighters', {}, accessToken),
    // Public query - no auth required
  });
}

export function useFighterQuery(id: string) {
  const { accessToken } = useAuth();

  return useQuery({
    queryKey: ['fighters', id],
    queryFn: () => apiRequest(`/api/fighters/${id}`, {}, accessToken),
    enabled: !!id, // Only requires valid ID, not auth
  });
}

export function useCreateFighterMutation() {
  const { accessToken, isAuthenticated } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (fighterData: Partial<IFighter>) => {
      if (!isAuthenticated || !accessToken) {
        throw new Error('Admin authentication required');
      }
      return apiRequest(
        '/api/fighters',
        {
          method: 'POST',
          body: JSON.stringify(fighterData),
        },
        accessToken
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fighters'] });
    },
  });
}

export function useUpdateFighterMutation() {
  const { accessToken, isAuthenticated } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      ...fighterData
    }: Partial<IFighter> & { id: string }) => {
      if (!isAuthenticated || !accessToken) {
        throw new Error('Admin authentication required');
      }
      return apiRequest(
        `/api/fighters/${id}`,
        {
          method: 'PUT',
          body: JSON.stringify(fighterData),
        },
        accessToken
      );
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['fighters'] });
      queryClient.invalidateQueries({ queryKey: ['fighters', variables.id] });
    },
  });
}

export function useDeleteFighterMutation() {
  const { accessToken, isAuthenticated } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => {
      if (!isAuthenticated || !accessToken) {
        throw new Error('Admin authentication required');
      }
      return apiRequest(
        `/api/fighters/${id}`,
        {
          method: 'DELETE',
        },
        accessToken
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fighters'] });
    },
  });
}

// ==================== FIGHTS ====================

export function useFightsQuery() {
  const { accessToken } = useAuth();

  return useQuery({
    queryKey: ['fights'],
    queryFn: () => apiRequest('/api/fights', {}, accessToken),
    // Public query - no auth required
  });
}

export function useFightQuery(id: string) {
  const { accessToken } = useAuth();

  return useQuery({
    queryKey: ['fights', id],
    queryFn: () => apiRequest(`/api/fights/${id}`, {}, accessToken),
    enabled: !!id, // Only requires valid ID, not auth
  });
}

export function useCreateFightMutation() {
  const { accessToken, isAuthenticated } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (fightData: Partial<IFight>) => {
      if (!isAuthenticated || !accessToken) {
        throw new Error('Admin authentication required');
      }
      return apiRequest(
        '/api/fights',
        {
          method: 'POST',
          body: JSON.stringify(fightData),
        },
        accessToken
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fights'] });
    },
  });
}

export function useUpdateFightMutation() {
  const { accessToken, isAuthenticated } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, ...fightData }: Partial<IFight> & { id: string }) => {
      if (!isAuthenticated || !accessToken) {
        throw new Error('Admin authentication required');
      }
      return apiRequest(
        `/api/fights/${id}`,
        {
          method: 'PUT',
          body: JSON.stringify(fightData),
        },
        accessToken
      );
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['fights'] });
      queryClient.invalidateQueries({ queryKey: ['fights', variables.id] });
    },
  });
}

export function useDeleteFightMutation() {
  const { accessToken, isAuthenticated } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => {
      if (!isAuthenticated || !accessToken) {
        throw new Error('Admin authentication required');
      }
      return apiRequest(
        `/api/fights/${id}`,
        {
          method: 'DELETE',
        },
        accessToken
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fights'] });
    },
  });
}

// ==================== MERCH ====================

export function useMerchQuery() {
  const { accessToken } = useAuth();

  return useQuery({
    queryKey: ['merch'],
    queryFn: () => apiRequest('/api/merch', {}, accessToken),
    // Public query - no auth required
  });
}

export function useMerchItemQuery(id: string) {
  const { accessToken } = useAuth();

  return useQuery({
    queryKey: ['merch', id],
    queryFn: () => apiRequest(`/api/merch/${id}`, {}, accessToken),
    enabled: !!id, // Only requires valid ID, not auth
  });
}

export function useCreateMerchMutation() {
  const { accessToken, isAuthenticated } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (merchData: Partial<IMerch>) => {
      if (!isAuthenticated || !accessToken) {
        throw new Error('Admin authentication required');
      }
      return apiRequest(
        '/api/merch',
        {
          method: 'POST',
          body: JSON.stringify(merchData),
        },
        accessToken
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['merch'] });
    },
  });
}

export function useUpdateMerchMutation() {
  const { accessToken, isAuthenticated } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, ...merchData }: Partial<IMerch> & { id: string }) => {
      if (!isAuthenticated || !accessToken) {
        throw new Error('Admin authentication required');
      }
      return apiRequest(
        `/api/merch/${id}`,
        {
          method: 'PUT',
          body: JSON.stringify(merchData),
        },
        accessToken
      );
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['merch'] });
      queryClient.invalidateQueries({ queryKey: ['merch', variables.id] });
    },
  });
}

export function useDeleteMerchMutation() {
  const { accessToken, isAuthenticated } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => {
      if (!isAuthenticated || !accessToken) {
        throw new Error('Admin authentication required');
      }
      return apiRequest(
        `/api/merch/${id}`,
        {
          method: 'DELETE',
        },
        accessToken
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['merch'] });
    },
  });
}

// ==================== TICKET TIERS ====================

export function useTicketTiersQuery() {
  const { accessToken } = useAuth();

  return useQuery({
    queryKey: ['ticketTiers'],
    queryFn: () => apiRequest('/api/ticket-tiers', {}, accessToken),
    // Public query - no auth required
  });
}

export function useTicketTierQuery(id: string) {
  const { accessToken } = useAuth();

  return useQuery({
    queryKey: ['ticketTiers', id],
    queryFn: () => apiRequest(`/api/ticket-tiers/${id}`, {}, accessToken),
    enabled: !!id, // Only requires valid ID, not auth
  });
}

export function useCreateTicketTierMutation() {
  const { accessToken, isAuthenticated } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (tierData: Partial<ITicketTier>) => {
      if (!isAuthenticated || !accessToken) {
        throw new Error('Admin authentication required');
      }
      return apiRequest(
        '/api/ticket-tiers',
        {
          method: 'POST',
          body: JSON.stringify(tierData),
        },
        accessToken
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ticketTiers'] });
    },
  });
}

export function useUpdateTicketTierMutation() {
  const { accessToken, isAuthenticated } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      ...tierData
    }: Partial<ITicketTier> & { id: string }) => {
      if (!isAuthenticated || !accessToken) {
        throw new Error('Admin authentication required');
      }
      return apiRequest(
        `/api/ticket-tiers/${id}`,
        {
          method: 'PUT',
          body: JSON.stringify(tierData),
        },
        accessToken
      );
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['ticketTiers'] });
      queryClient.invalidateQueries({
        queryKey: ['ticketTiers', variables.id],
      });
    },
  });
}

export function useDeleteTicketTierMutation() {
  const { accessToken, isAuthenticated } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => {
      if (!isAuthenticated || !accessToken) {
        throw new Error('Admin authentication required');
      }
      return apiRequest(
        `/api/ticket-tiers/${id}`,
        {
          method: 'DELETE',
        },
        accessToken
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ticketTiers'] });
    },
  });
}

// ==================== VIDEOS ====================

export function useVideosQuery(filters?: {
  isPublic?: boolean;
  isLiveEvent?: boolean;
  associatedEvent?: string;
}) {
  const { accessToken } = useAuth();

  return useQuery({
    queryKey: ['videos', filters],
    queryFn: () => {
      const params = new URLSearchParams();
      if (filters?.isPublic !== undefined) {
        params.append('isPublic', filters.isPublic.toString());
      }
      if (filters?.isLiveEvent !== undefined) {
        params.append('isLiveEvent', filters.isLiveEvent.toString());
      }
      if (filters?.associatedEvent) {
        params.append('associatedEvent', filters.associatedEvent);
      }

      const url = params.toString()
        ? `/api/videos?${params.toString()}`
        : '/api/videos';
      return apiRequest(url, {}, accessToken);
    },
    // Public query - no auth required
  });
}

export function useVideoQuery(id: string) {
  const { accessToken } = useAuth();

  return useQuery({
    queryKey: ['videos', id],
    queryFn: () => apiRequest(`/api/videos/${id}`, {}, accessToken),
    enabled: !!id, // Only requires valid ID, not auth
  });
}

export function useLiveEventsQuery(upcoming: boolean = false) {
  const { accessToken } = useAuth();

  return useQuery({
    queryKey: ['videos', 'live', { upcoming }],
    queryFn: () => {
      const url = upcoming
        ? '/api/videos/live?upcoming=true'
        : '/api/videos/live';
      return apiRequest(url, {}, accessToken);
    },
    // Public query - no auth required
  });
}

export function useIncrementViewCountMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => {
      return apiRequest(
        `/api/videos/${id}/view`,
        {
          method: 'POST',
        },
        null // No auth required
      );
    },
    onSuccess: (_, variables) => {
      // Invalidate the specific video query to refresh view count
      queryClient.invalidateQueries({ queryKey: ['videos', variables] });
    },
  });
}

// ADMIN-ONLY MUTATIONS
export function useCreateVideoMutation() {
  const { accessToken, isAuthenticated } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (videoData: Partial<IVideo>) => {
      if (!isAuthenticated || !accessToken) {
        throw new Error('Admin authentication required');
      }
      return apiRequest(
        '/api/videos',
        {
          method: 'POST',
          body: JSON.stringify(videoData),
        },
        accessToken
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['videos'] });
    },
  });
}

export function useUpdateVideoMutation() {
  const { accessToken, isAuthenticated } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, ...videoData }: Partial<IVideo> & { id: string }) => {
      if (!isAuthenticated || !accessToken) {
        throw new Error('Admin authentication required');
      }
      return apiRequest(
        `/api/videos/${id}`,
        {
          method: 'PUT',
          body: JSON.stringify(videoData),
        },
        accessToken
      );
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['videos'] });
      queryClient.invalidateQueries({ queryKey: ['videos', variables.id] });
    },
  });
}

export function useDeleteVideoMutation() {
  const { accessToken, isAuthenticated } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => {
      if (!isAuthenticated || !accessToken) {
        throw new Error('Admin authentication required');
      }
      return apiRequest(
        `/api/videos/${id}`,
        {
          method: 'DELETE',
        },
        accessToken
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['videos'] });
    },
  });
}

// ==================== FLASH SALES ====================

export function useFlashSalesQuery(
  status?: 'active' | 'upcoming' | 'past' | 'all'
) {
  const { accessToken } = useAuth();

  return useQuery({
    queryKey: ['flashSales', status || 'all'],
    queryFn: () => {
      const url = status
        ? `/api/flash-sales?status=${status}`
        : '/api/flash-sales';
      return apiRequest(url, {}, accessToken);
    },
    // Public query - no auth required
  });
}

export function useFlashSaleQuery(id: string) {
  const { accessToken } = useAuth();

  return useQuery({
    queryKey: ['flashSales', id],
    queryFn: () => apiRequest(`/api/flash-sales/${id}`, {}, accessToken),
    enabled: !!id,
  });
}

export function useFlashSaleForTicketQuery(tierId: string) {
  return useQuery({
    queryKey: ['flashSales', 'ticket', tierId],
    queryFn: () =>
      apiRequest(`/api/flash-sales/ticket-tier/${tierId}`, {}, null),
    enabled: !!tierId,
    // Cache flash sale status for 30 seconds to avoid excessive API calls
    staleTime: 30 * 1000,
  });
}

export function useCreateFlashSaleMutation() {
  const { accessToken, isAuthenticated } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (flashSaleData: Partial<IFlashSale>) => {
      if (!isAuthenticated || !accessToken) {
        throw new Error('Admin authentication required');
      }
      return apiRequest(
        '/api/flash-sales',
        {
          method: 'POST',
          body: JSON.stringify(flashSaleData),
        },
        accessToken
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['flashSales'] });
    },
  });
}

export function useUpdateFlashSaleMutation() {
  const { accessToken, isAuthenticated } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      ...flashSaleData
    }: Partial<IFlashSale> & { id: string }) => {
      if (!isAuthenticated || !accessToken) {
        throw new Error('Admin authentication required');
      }
      return apiRequest(
        `/api/flash-sales/${id}`,
        {
          method: 'PATCH',
          body: JSON.stringify(flashSaleData),
        },
        accessToken
      );
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['flashSales'] });
      queryClient.invalidateQueries({ queryKey: ['flashSales', variables.id] });
    },
  });
}

export function useDeleteFlashSaleMutation() {
  const { accessToken, isAuthenticated } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => {
      if (!isAuthenticated || !accessToken) {
        throw new Error('Admin authentication required');
      }
      return apiRequest(
        `/api/flash-sales/${id}`,
        {
          method: 'DELETE',
        },
        accessToken
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['flashSales'] });
    },
  });
}
