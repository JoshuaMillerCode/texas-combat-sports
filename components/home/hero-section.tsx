"use client"

import { Button } from "@/components/ui/button"
import Image from "next/image"
import Link from "next/link"
import HeroParallax from "@/components/hero-parallax"
import RevealAnimation from "@/components/reveal-animation"
import CountdownTimer from "@/components/countdown-timer"
import { useCurrentEvent } from "@/contexts/current-event-context"
import { useRouter } from "next/navigation"
import { useTicketPurchase } from "@/hooks/use-ticket-purchase"
import ComingSoonModal from "@/components/coming-soon-modal"
import { Calendar, MapPin, Ticket } from "lucide-react"
import { format } from "date-fns"

const DEFAULT_HERO_VIDEO =
  "https://res.cloudinary.com/dujmomznj/video/upload/v1754756997/0809_vaxbkh.mov"
const BRAND_LOGO =
  "https://res.cloudinary.com/dujmomznj/image/upload/f_auto,q_auto:good,w_150,h_150/v1759384197/helmet-removebg-preview_syokop.png"

export default function HeroSection() {
  const router = useRouter()
  const { currentEvent } = useCurrentEvent()
  const { handleTicketPurchase, isComingSoonModalOpen, closeComingSoonModal } =
    useTicketPurchase()

  const hasEvent = Boolean(currentEvent)
  const backgroundVideo = currentEvent?.heroVideo || DEFAULT_HERO_VIDEO
  const backgroundImage = !currentEvent?.heroVideo
    ? currentEvent?.posterImage
    : undefined

  return (
    <HeroParallax
      backgroundVideo={backgroundImage ? undefined : backgroundVideo}
      backgroundImage={backgroundImage}
      className="relative"
    >
      {hasEvent ? (
        <EventHero
          event={currentEvent}
          onBuyTickets={() => handleTicketPurchase(currentEvent.slug)}
          onFightCard={() => router.push(`/events/${currentEvent.slug}`)}
        />
      ) : (
        <BrandHero
          onBuyTickets={() => handleTicketPurchase(undefined)}
        />
      )}
      <ComingSoonModal
        isOpen={isComingSoonModalOpen}
        onClose={closeComingSoonModal}
      />
    </HeroParallax>
  )
}

function EventHero({
  event,
  onBuyTickets,
  onFightCard,
}: {
  event: any
  onBuyTickets: () => void
  onFightCard: () => void
}) {
  return (
    <div className="text-center px-4 max-w-6xl mx-auto relative z-10">
      <RevealAnimation delay={0.05}>
        <div className="flex items-center justify-center gap-3 mb-6 opacity-90">
          <Image
            src={BRAND_LOGO}
            alt="Texas Combat Sports"
            width={48}
            height={48}
            className="object-contain drop-shadow-lg"
            priority
            loading="eager"
          />
          <span className="text-sm md:text-base font-bold tracking-[0.3em] text-white/80 uppercase">
            Texas Combat Sports
          </span>
        </div>
      </RevealAnimation>

      <RevealAnimation delay={0.15}>
        <div className="inline-flex items-center gap-2 px-4 py-1.5 mb-6 rounded-full border border-red-600/60 bg-red-600/10 backdrop-blur-sm">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-500 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-red-500" />
          </span>
          <span className="text-xs md:text-sm font-bold tracking-widest text-red-400 uppercase">
            Next Event
          </span>
        </div>
      </RevealAnimation>

      <RevealAnimation delay={0.25}>
        <h1 className="text-5xl md:text-7xl lg:text-8xl font-black mb-3 text-white drop-shadow-2xl leading-[0.95]">
          {event.title}
        </h1>
      </RevealAnimation>

      {event.subtitle && (
        <RevealAnimation delay={0.35}>
          <p className="text-lg md:text-2xl mb-6 text-red-500 font-bold tracking-wide drop-shadow-lg uppercase">
            {event.subtitle}
          </p>
        </RevealAnimation>
      )}

      <RevealAnimation delay={0.45}>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-6 mb-8 text-white/90">
          {event.date && (
            <div className="flex items-center gap-2 text-base md:text-lg font-semibold drop-shadow-lg">
              <Calendar className="w-5 h-5 text-red-500" />
              {format(new Date(event.date), "EEE, MMM d, yyyy")}
            </div>
          )}
          {event.venue && (
            <div className="flex items-center gap-2 text-base md:text-lg font-semibold drop-shadow-lg">
              <MapPin className="w-5 h-5 text-red-500" />
              {event.venue}
              {event.city ? `, ${event.city}` : ""}
            </div>
          )}
        </div>
      </RevealAnimation>

      {event.date && (
        <RevealAnimation delay={0.55}>
          <div className="max-w-2xl mx-auto mb-8">
            <CountdownTimer targetDate={new Date(event.date).toISOString()} />
          </div>
        </RevealAnimation>
      )}

      <RevealAnimation delay={0.65}>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            size="lg"
            className="bg-red-600 hover:bg-red-700 text-white px-8 py-4 text-lg font-bold transition-all duration-300 hover:scale-105 shadow-lg"
            onClick={onBuyTickets}
          >
            <Ticket className="w-5 h-5 mr-2" />
            Buy Tickets
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="border-red-600 text-red-600 hover:bg-red-600 hover:text-white px-8 py-4 text-lg font-bold transition-all duration-300 hover:scale-105 bg-white shadow-lg"
            onClick={onFightCard}
          >
            See Fight Card
          </Button>
          <Link href="/my-tickets">
            <Button
              size="lg"
              variant="outline"
              className="border-white/40 text-white hover:bg-white/10 hover:border-white px-8 py-4 text-lg font-bold transition-all duration-300 hover:scale-105 bg-transparent shadow-lg w-full sm:w-auto"
            >
              My Tickets
            </Button>
          </Link>
        </div>
      </RevealAnimation>
    </div>
  )
}

function BrandHero({ onBuyTickets }: { onBuyTickets: () => void }) {
  return (
    <div className="text-center px-4 max-w-6xl mx-auto relative z-10">
      <RevealAnimation delay={0.1}>
        <div className="flex justify-center mb-6">
          <Image
            src={BRAND_LOGO}
            alt="Texas Combat Sports Logo"
            width={150}
            height={150}
            className="object-contain drop-shadow-2xl"
            priority
            loading="eager"
          />
        </div>
      </RevealAnimation>
      <RevealAnimation delay={0.2}>
        <h1 className="text-6xl md:text-8xl font-black mb-6 text-white drop-shadow-2xl">
          TEXAS
          <span className="block text-red-600 drop-shadow-2xl">COMBAT</span>
          <span className="block text-4xl md:text-6xl drop-shadow-2xl">
            SPORTS
          </span>
        </h1>
      </RevealAnimation>

      <RevealAnimation delay={0.4}>
        <p className="text-xl md:text-2xl mb-8 text-gray-300 font-bold drop-shadow-lg">
          Real Fights. Real Houston.
        </p>
      </RevealAnimation>

      <RevealAnimation delay={0.6}>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            size="lg"
            className="bg-red-600 hover:bg-red-700 text-white px-8 py-4 text-lg font-bold transition-all duration-300 hover:scale-105 shadow-lg"
            onClick={onBuyTickets}
          >
            Buy Tickets
          </Button>
          <Link href="/my-tickets">
            <Button
              size="lg"
              variant="outline"
              className="border-white/40 text-white hover:bg-white/10 hover:border-white px-8 py-4 text-lg font-bold transition-all duration-300 hover:scale-105 bg-transparent shadow-lg w-full sm:w-auto"
            >
              My Tickets
            </Button>
          </Link>
        </div>
      </RevealAnimation>
    </div>
  )
}
