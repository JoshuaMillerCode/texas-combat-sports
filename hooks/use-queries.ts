'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth, getAuthHeaders } from '@/contexts/auth-context';
import type { IEvent } from '@/lib/models/Event';
import type { IFighter } from '@/lib/models/Fighter';
import type { IFight } from '@/lib/models/Fight';
import type { IMerch } from '@/lib/models/Merch';
import type { ITicketTier } from '@/lib/models/TicketTier';

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
