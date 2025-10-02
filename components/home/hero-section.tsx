"use client"

import { Button } from "@/components/ui/button"
import HeroParallax from "@/components/hero-parallax"
import RevealAnimation from "@/components/reveal-animation"
import { useCurrentEvent } from "@/contexts/current-event-context"
import { useRouter } from "next/navigation"
import { useTicketPurchase } from "@/hooks/use-ticket-purchase"
import ComingSoonModal from "@/components/coming-soon-modal"

export default function HeroSection() {
  const router = useRouter();
  const { currentEvent } = useCurrentEvent();
  const { handleTicketPurchase, isComingSoonModalOpen, closeComingSoonModal } = useTicketPurchase();

  return (
    <HeroParallax backgroundVideo="https://res.cloudinary.com/dujmomznj/video/upload/v1754756997/0809_vaxbkh.mov" className="relative">
      <div className="text-center px-4 max-w-6xl mx-auto relative z-10">
        <RevealAnimation delay={0.2}>
          <h1 className="text-6xl md:text-8xl font-black mb-6 text-white drop-shadow-2xl">
            TEXAS
            <span className="block text-red-600 drop-shadow-2xl">COMBAT</span>
            <span className="block text-4xl md:text-6xl drop-shadow-2xl">SPORTS</span>
          </h1>
        </RevealAnimation>

        <RevealAnimation delay={0.4}>
          <p className="text-xl md:text-2xl mb-8 text-gray-300 font-bold drop-shadow-lg">Real Fights. Real Houston.</p>
        </RevealAnimation>

        <RevealAnimation delay={0.6}>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              className="bg-red-600 hover:bg-red-700 text-white px-8 py-4 text-lg font-bold transition-all duration-300 hover:scale-105 shadow-lg"
              onClick={() => handleTicketPurchase(currentEvent?.slug)}
            > 
              Buy Tickets
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-red-600 text-red-600 hover:bg-red-600 hover:text-white px-8 py-4 text-lg font-bold transition-all duration-300 hover:scale-105 bg-white shadow-lg"
              onClick={() => {
                if (currentEvent) {
                  router.push(`/events/${currentEvent.slug}`);
                }
              }}
            >
              See Fight Card
            </Button>
          </div>
        </RevealAnimation>
      </div>
      <ComingSoonModal
        isOpen={isComingSoonModalOpen}
        onClose={closeComingSoonModal}
      />
    </HeroParallax>
  )
} 