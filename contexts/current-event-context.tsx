"use client"
import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react'
import { useUpcomingEventsQuery } from '@/hooks/use-queries'

interface CurrentEventContextType {
  currentEvent: any | null
  setCurrentEvent: (event: any) => void
}

const CurrentEventContext = createContext<CurrentEventContextType | undefined>(undefined)

export function useCurrentEvent() {
  const context = useContext(CurrentEventContext);
  if (!context) {
    throw new Error('useCurrentEvent must be used within a CurrentEventProvider');
  }
  return context;
}

export function CurrentEventProvider({ children }: { children: ReactNode }) {
  const [currentEvent, setCurrentEvent] = useState<any | null>(null);

  const { data: events = [], isLoading: isLoadingEvents } = useUpcomingEventsQuery();

  useEffect(() => {
    if (events.length > 0) {
      setCurrentEvent(events[0]);
    }
  }, [events]);

  return (
    <CurrentEventContext.Provider value={{ currentEvent, setCurrentEvent }}>
      {children}
    </CurrentEventContext.Provider>
  );
}