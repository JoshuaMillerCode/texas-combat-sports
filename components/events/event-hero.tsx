"use client"

import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import CountdownTimer from "@/components/countdown-timer"
import { Calendar, MapPin, Clock, Users, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { useTicketPurchase } from "@/hooks/use-ticket-purchase"
import { isFeatureEnabled } from "@/lib/feature-flags"
import ComingSoonModal from "@/components/coming-soon-modal"
import FlashSalePrice from "@/components/flash-sale-price"
import { formatAmountForDisplay } from "@/lib/stripe"

const DEFAULT_EVENT_IMAGES = [
  "https://res.cloudinary.com/dujmomznj/image/upload/f_auto,q_auto:low,w_600,h_450,c_fill/v1759378172/scene-from-olympic-games-tournament-with-athletes-competing_23-2151471034_rumfsk.avif",
  "https://res.cloudinary.com/dujmomznj/image/upload/f_auto,q_auto:low,w_600,h_450,c_fill/v1759378718/download_1_qbznu9.jpg",
  "https://res.cloudinary.com/dujmomznj/image/upload/f_auto,q_auto:low,w_600,h_450,c_fill/v1759378718/download_xayqnn.jpg",
  "https://res.cloudinary.com/dujmomznj/image/upload/f_auto,q_auto:low,w_600,h_450,c_fill/v1759378718/images_paqp96.jpg",
]

const getRandomEventImage = (seed?: string) => {
  if (seed) {
    // Use seed for consistent image selection per event
    let hash = 0
    for (let i = 0; i < seed.length; i++) {
      hash = ((hash << 5) - hash) + seed.charCodeAt(i)
      hash = hash & hash
    }
    return DEFAULT_EVENT_IMAGES[Math.abs(hash) % DEFAULT_EVENT_IMAGES.length]
  }
  return DEFAULT_EVENT_IMAGES[Math.floor(Math.random() * DEFAULT_EVENT_IMAGES.length)]
}

interface EventHeroProps {
  event: any
  onOpenTicketModal: () => void
  activeFlashSales?: any[]
}

export default function EventHero({ event, onOpenTicketModal, activeFlashSales = [] }: EventHeroProps) {
  const { handleTicketPurchase, isComingSoonModalOpen, closeComingSoonModal } = useTicketPurchase()

  // Helper function to get flash sale info for this event
  const getFlashSaleForEvent = () => {
    if (!activeFlashSales.length || !event.ticketTiers) return null
    
    // Check if any flash sale applies to this event's ticket tiers
    const eventTicketIds = event.ticketTiers.map((tier: any) => tier._id)
    const applicableSale = activeFlashSales.find((sale: any) =>
      sale.targetTicketTypes.some((id: string) => eventTicketIds.includes(id))
    )
    
    return applicableSale
  }

  const handleBuyTickets = () => {
    if (isFeatureEnabled('TICKET_SALES_ENABLED')) {
      onOpenTicketModal()
    } else {
      handleTicketPurchase()
    }
  }

  return (
    <div className="relative">
      {/* Desktop Layout (>= lg) */}
      <div className="hidden lg:block">
        <div className="relative h-screen bg-black">
          {/* Background Video */}
          <div className="absolute inset-0">
            <video 
              autoPlay 
              muted 
              loop 
              playsInline 
              className="w-full h-full object-cover opacity-40"
            >
              <source src={event.heroVideo} type="video/mp4" />
            </video>
            <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/80" />
          </div>

          <div className="container mx-auto px-4 h-full flex items-center justify-center relative z-10">
            <div className="w-full max-w-7xl">
              <div className="grid lg:grid-cols-2 gap-12 items-center">
                {/* Event Info */}
                <div className="text-left">
                  <div>
                    <Link
                      href="/events"
                      className="inline-flex items-center text-red-500 hover:text-red-400 transition-colors mb-6 group"
                    >
                      <ArrowLeft className="w-4 h-4 mr-2 transition-transform group-hover:-translate-x-1" />
                      Back to Events
                    </Link>
                  </div>

                  <div>
                    <Badge className="bg-red-600 text-white font-bold mb-4 text-sm px-3 py-1">{event.subtitle}</Badge>
                  </div>

                  <h1 className="text-4xl xl:text-6xl font-black text-white mb-6">
                    {event.title.split(" ").map((word: string, index: number) => (
                      <span key={index} className={index === 1 ? "text-red-600" : ""}>
                        {word}{index < event.title.split(" ").length - 1 ? " " : ""}
                      </span>
                    ))}
                  </h1>

                  <div className="space-y-4 mb-8">
                    <div className="flex items-center text-gray-300 text-lg">
                      <Calendar className="w-6 h-6 mr-4 text-red-500" />
                      {new Date(event.date).toLocaleDateString("en-US", {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </div>
                    <div className="flex items-center text-gray-300 text-lg">
                      <Clock className="w-6 h-6 mr-4 text-red-500" />
                      {new Date(event.date).toLocaleTimeString("en-US", {
                        hour: "numeric",
                        minute: "2-digit",
                        hour12: true,
                      })}
                    </div>
                    <div className="flex items-center text-gray-300 text-lg">
                      <MapPin className="w-6 h-6 mr-4 text-red-500" />
                      {event.venue}, {event.city}
                    </div>
                    <div className="flex items-center text-gray-300 text-lg">
                      <Users className="w-6 h-6 mr-4 text-red-500" />
                      Capacity: {event.capacity}
                    </div>
                  </div>

                  {
                    event.isActive ? (
                      <div className="mb-8">
                        <CountdownTimer targetDate={event.date} />
                      </div>
                    ) : ""
                  }
                  
                  <div className="flex flex-col sm:flex-row gap-4">
                    {
                      event.isActive ? (
                        <Button
                          size="lg"
                          onClick={handleBuyTickets}
                          className="bg-red-600 hover:bg-red-700 text-white px-8 py-4 text-lg font-bold transition-all duration-300 hover:scale-105"
                        >
                          Buy Tickets Now
                        </Button>
                      ) : ""
                    }
                    
                    {/* <Button
                      size="lg"
                      variant="outline"
                      className="border-red-600 text-red-600 hover:bg-red-600 hover:text-white px-8 py-4 text-lg font-bold transition-all duration-300 hover:scale-105 bg-transparent"
                    >
                      Share Event
                    </Button> */}
                  </div>
                </div>

                {/* Event Poster - Desktop */}
                <div className="relative h-96 xl:h-[600px] group">
                  <div className="relative h-full rounded-lg overflow-hidden">
                    <Image
                      src={event.posterImage || getRandomEventImage(event._id || event.slug)}
                      alt={`${event.title} Poster`}
                      fill
                      className="object-contain transition-transform duration-700 group-hover:scale-105"
                      priority
                      loading="eager"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                    <div className="absolute bottom-6 left-6 right-6">
                      <div className="text-white text-center">
                        {(() => {
                          const flashSale = getFlashSaleForEvent()
                          if (flashSale) {
                            return (
                              <div>
                                <div className="text-red-400 font-bold mb-1">⚡ FLASH SALE ACTIVE</div>
                                <div className="text-sm text-gray-300">Click "Buy Tickets" to check the pricing</div>
                              </div>
                            )
                          } else {
                            return (
                              <>
                                <div className="text-2xl font-bold mb-2">{String(event.ticketPrice).includes("$") ? event.ticketPrice : "$" + event.ticketPrice}</div>
                                <div className="text-sm text-gray-300">Starting Price</div>
                              </>
                            )
                          }
                        })()}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile/Tablet Layout (< lg) with Poster Background */}
      <div
        className="lg:hidden relative min-h-screen bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url(${event.posterImage || getRandomEventImage(event._id || event.slug)})`,
        }}
      >
        {/* Dark overlay for text readability */}
        <div className="absolute inset-0 bg-black/70 z-10"></div>

        {/* Video background overlay (optional - can be removed if not needed) */}
        <div className="absolute inset-0 z-0">
          <video 
            autoPlay 
            muted 
            loop 
            playsInline 
            className="w-full h-full object-cover opacity-30"
          >
            <source src={event.heroVideo} type="video/mp4" />
          </video>
        </div>

        {/* Content */}
        <div className="relative z-20 container mx-auto px-4 min-h-screen flex items-center justify-center pt-24 pb-8">
          <div className="w-full max-w-4xl">
            <div className="flex flex-col items-center text-center space-y-6">
              <div className="w-full">
                <div className="mb-6">
                  <Link
                    href="/events"
                    className="inline-flex items-center text-red-500 hover:text-red-400 transition-colors group"
                  >
                    <ArrowLeft className="w-4 h-4 mr-2 transition-transform group-hover:-translate-x-1" />
                    Back to Events
                  </Link>
                </div>

                <div className="mb-4">
                  <Badge className="bg-red-600 text-white font-bold text-sm px-3 py-1">{event.subtitle}</Badge>
                </div>

                <h1 className="text-3xl md:text-5xl font-black text-white mb-8 drop-shadow-2xl">
                  {event.title.split(" ").map((word: string, index: number) => (
                    <span key={index} className={index === 1 ? "text-red-600" : ""}>
                      {word}{index < event.title.split(" ").length - 1 ? " " : ""}
                    </span>
                  ))}
                </h1>

                <div className="space-y-4 mb-8">
                  <div className="flex items-center justify-center text-gray-100 text-base md:text-lg drop-shadow-lg">
                    <Calendar className="w-5 h-5 md:w-6 md:h-6 mr-3 text-red-500 drop-shadow-lg" />
                    {new Date(event.date).toLocaleDateString("en-US", {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </div>
                  <div className="flex items-center justify-center text-gray-100 text-base md:text-lg drop-shadow-lg">
                    <Clock className="w-5 h-5 md:w-6 md:h-6 mr-3 text-red-500 drop-shadow-lg" />
                    {new Date(event.date).toLocaleTimeString("en-US", {
                      hour: "numeric",
                      minute: "2-digit",
                      hour12: true,
                    })}
                  </div>
                  <div className="flex items-center justify-center text-gray-100 text-base md:text-lg drop-shadow-lg">
                    <MapPin className="w-5 h-5 md:w-6 md:h-6 mr-3 text-red-500 drop-shadow-lg" />
                    {event.venue}, {event.city}
                  </div>
                  <div className="flex items-center justify-center text-gray-100 text-base md:text-lg drop-shadow-lg">
                    <Users className="w-5 h-5 md:w-6 md:h-6 mr-3 text-red-500 drop-shadow-lg" />
                    Capacity: {event.capacity}
                  </div>
                </div>

                {
                  event.isActive ? (
                    <div className="mb-8">
                      <div className="drop-shadow-2xl">
                        <CountdownTimer targetDate={event.date} />
                      </div>
                    </div>
                  ) : ""
                }

                {
                  event.isActive ? (
                    <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
                      <Button
                        size="lg"
                        onClick={handleBuyTickets}
                        className="bg-red-600 hover:bg-red-700 text-white px-8 py-4 text-lg font-bold transition-all duration-300 hover:scale-105 shadow-2xl"
                      >
                        Buy Tickets Now
                      </Button>
                      {/* <Button
                        size="lg"
                        variant="outline"
                        className="border-red-600 text-red-600 hover:bg-red-600 hover:text-white px-8 py-4 text-lg font-bold transition-all duration-300 hover:scale-105 bg-black/30 backdrop-blur-sm shadow-2xl"
                      >
                        Share Event
                      </Button> */}
                    </div>
                  ) : ""
                }

                {/* Ticket Price Display */}
                <div className="text-center">
                  <div className="inline-block bg-black/50 backdrop-blur-sm rounded-lg px-6 py-4 border border-red-600/30">
                    <div className="text-2xl md:text-3xl font-bold text-white mb-1 drop-shadow-lg">
                      {"$" + event.ticketPrice}
                    </div>
                    <div className="text-sm text-gray-300 drop-shadow-lg">Starting Price</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <ComingSoonModal
        isOpen={isComingSoonModalOpen}
        onClose={closeComingSoonModal}
      />
    </div>
  )
} 