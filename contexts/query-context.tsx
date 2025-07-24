"use client"

import React, { ReactNode } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'

interface QueryProviderProps {
  children: ReactNode
}

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Data will be considered fresh for 5 minutes
      staleTime: 5 * 60 * 1000,
      // Data will be cached for 10 minutes
      gcTime: 10 * 60 * 1000,
      // Retry failed requests twice
      retry: 2,
      // Don't refetch on window focus by default
      refetchOnWindowFocus: false,
    },
    mutations: {
      // Retry failed mutations once
      retry: 1,
    },
  },
})

export function QueryProvider({ children }: QueryProviderProps) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  )
} 