"use client"

import { Button } from "@/components/ui/button"
import RevealAnimation from "@/components/reveal-animation"
import { useTicketPurchase } from "@/hooks/use-ticket-purchase"
import { isFeatureEnabled } from "@/lib/feature-flags"
import ComingSoonModal from "@/components/coming-soon-modal"

interface BottomBuyProps {
  onOpenTicketModal: () => void
  isActive: boolean
}

export default function BottomBuy({ onOpenTicketModal, isActive }: BottomBuyProps) {
  const { handleTicketPurchase, isComingSoonModalOpen, closeComingSoonModal } = useTicketPurchase()

  const handleGetTickets = () => {
    if (isFeatureEnabled('TICKET_SALES_ENABLED')) {
      onOpenTicketModal()
    } else {
      handleTicketPurchase()
    }
  }

  return (
    <section className="py-20 bg-gradient-to-b from-black to-gray-900">
      <div className="container mx-auto px-4 text-center">
        <RevealAnimation>
          <h2 className="text-4xl font-black mb-8 text-white">
            DON'T MISS <span className="text-red-600">THE ACTION</span>
          </h2>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Secure your seats now for the most anticipated fight night of the year. Tickets are selling fast!
          </p>
          {
            isActive ? (
              <Button
                size="lg"
                onClick={handleGetTickets}
                className="bg-red-600 hover:bg-red-700 text-white px-12 py-4 text-xl font-bold transition-all duration-300 hover:scale-105"
              >
                Get Your Tickets Now
              </Button>
            ) : ""
          }
        </RevealAnimation>
      </div>
      <ComingSoonModal
        isOpen={isComingSoonModalOpen}
        onClose={closeComingSoonModal}
      />
    </section>
  )
} 