"use client"

import { useState } from "react"
import TicketPurchaseModal from "@/components/ticket-purchase-modal"
import EventHero from "@/components/events/event-hero"
import MainEvent from "@/components/events/main-event"
import Undercard from "@/components/events/undercard"
import BottomBuy from "@/components/events/bottom-buy"
import LoadingBoxing from "@/components/ui/loading-boxing"
import { useEventQuery } from "@/hooks/use-queries"

export default function EventDetailClient({ params }: { params: { slug: string } }) {
  const [isTicketModalOpen, setIsTicketModalOpen] = useState(false)
  const { data: event, isLoading, error } = useEventQuery(params.slug)

  if (isLoading) return <LoadingBoxing text="Loading Event..." size="lg" />
  if (error) return <div className="py-20 text-center text-red-500">Error loading event: {error.message}</div>

  return (
    <div className="min-h-screen pt-16">
      <EventHero event={event} onOpenTicketModal={() => setIsTicketModalOpen(true)} />
      <MainEvent mainEventFight={event.mainEventFight} />
      <Undercard fights={event.fights} />
      <BottomBuy onOpenTicketModal={() => setIsTicketModalOpen(true)} />

      {/* Ticket Purchase Modal */}
      <TicketPurchaseModal
        isOpen={isTicketModalOpen}
        onClose={() => setIsTicketModalOpen(false)}
        eventId={event.id}
        eventTitle={event.title}
        eventDate={event.date}
        eventVenue={event.venue}
        ticketTiers={event.ticketTiers}
      />
    </div>
  )
}