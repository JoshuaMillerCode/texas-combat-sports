"use client"

import { useState, useEffect } from "react"
import TicketPurchaseModal from "@/components/ticket-purchase-modal"
import EventHero from "@/components/events/event-hero"
import MainEvent from "@/components/events/main-event"
import Undercard from "@/components/events/undercard"
import BottomBuy from "@/components/events/bottom-buy"
import LoadingBoxing from "@/components/ui/loading-boxing"
import FlashSaleBanner from "@/components/flash-sale-banner"
import { useEventQuery } from "@/hooks/use-queries"

export default function EventDetailClient({ params }: { params: { slug: string } }) {
  const [isTicketModalOpen, setIsTicketModalOpen] = useState(false)
  const [activeFlashSales, setActiveFlashSales] = useState<any[]>([])
  const { data: event, isLoading, error } = useEventQuery(params.slug)
  const mainEventFight = event?.fights.find((f: any) => f.isMainEvent)

  // Fetch active flash sales for this event's tickets
  useEffect(() => {
    const fetchFlashSales = async () => {
      if (!event || !event.ticketTiers || event.ticketTiers.length === 0) return

      try {
        const response = await fetch("/api/flash-sales?status=active")
        const data = await response.json()
        
        if (data.flashSales && data.flashSales.length > 0) {
          // Filter flash sales that apply to this event's ticket tiers
          const eventTicketIds = event.ticketTiers.map((tier: any) => tier._id)
          const relevantSales = data.flashSales.filter((sale: any) =>
            sale.targetTicketTypes.some((id: string) => eventTicketIds.includes(id))
          )
          setActiveFlashSales(relevantSales)
        }
      } catch (error) {
        console.error("Error fetching flash sales:", error)
      }
    }

    fetchFlashSales()
  }, [event])

  if (isLoading) return <LoadingBoxing text="Loading Event..." size="lg" />
  if (error) return <div className="py-20 text-center text-red-500">Error loading event: {error.message}</div>

  return (
    <div className="min-h-screen pt-10">
      {/* Flash Sale Banner */}
      {activeFlashSales.length > 0 && (
        <div className="fixed top-20 left-0 right-0 z-40 px-4">
          <div className="container mx-auto max-w-4xl">
            <FlashSaleBanner
              title={activeFlashSales[0].title}
              endAt={activeFlashSales[0].endAt}
            />
          </div>
        </div>
      )}
      
      <EventHero event={event} onOpenTicketModal={() => setIsTicketModalOpen(true)} activeFlashSales={activeFlashSales} />
      <MainEvent mainEventFight={mainEventFight} isPastEvent={event.isPastEvent} />
      <Undercard fights={event.fights} isPastEvent={event.isPastEvent} />
      <BottomBuy onOpenTicketModal={() => setIsTicketModalOpen(true)} isActive={event.isActive} />

      {/* Ticket Purchase Modal */}
      <TicketPurchaseModal
        isOpen={isTicketModalOpen}
        onClose={() => setIsTicketModalOpen(false)}
        eventId={event._id}
        eventTitle={event.title}
        eventDate={event.date}
        eventVenue={event.venue}
        ticketTiers={event.ticketTiers}
      />
    </div>
  )
}