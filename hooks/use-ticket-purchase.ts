'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { isFeatureEnabled } from '@/lib/feature-flags';

export function useTicketPurchase() {
  const router = useRouter();
  const [isComingSoonModalOpen, setIsComingSoonModalOpen] = useState(false);

  const handleTicketPurchase = (eventSlug?: string) => {
    if (!isFeatureEnabled('TICKET_SALES_ENABLED')) {
      setIsComingSoonModalOpen(true);
      return;
    }

    // If ticket sales are enabled, navigate to the event page
    if (eventSlug) {
      router.push(`/events/${eventSlug}`);
    }
  };

  const closeComingSoonModal = () => {
    setIsComingSoonModalOpen(false);
  };

  return {
    handleTicketPurchase,
    isComingSoonModalOpen,
    closeComingSoonModal,
  };
}
