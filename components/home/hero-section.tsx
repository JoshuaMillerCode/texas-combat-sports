"use client"

import { Button } from "@/components/ui/button"
import Image from "next/image"
import Link from "next/link"
import HeroParallax from "@/components/hero-parallax"
import RevealAnimation from "@/components/reveal-animation"
import CountdownTimer from "@/components/countdown-timer"
import { useCurrentEvent } from "@/contexts/current-event-context"
import { useRouter } from "next/navigation"
import { ArrowRight } from "lucide-react"

const DEFAULT_HERO_VIDEO =
  "https://res.cloudinary.com/dujmomznj/video/upload/v1754756997/0809_vaxbkh.mov"
const BRAND_LOGO =
  "https://res.cloudinary.com/dujmomznj/image/upload/f_auto,q_auto:good,w_150,h_150/v1759384197/helmet-removebg-preview_syokop.png"

export default function HeroSection() {
  const router = useRouter()
  const { currentEvent } = useCurrentEvent()

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
          onViewEvent={() => router.push(`/events/${currentEvent.slug}`)}
        />
      ) : (
        <BrandHero />
      )}
    </HeroParallax>
  )
}

function EventHero({
  event,
  onViewEvent,
}: {
  event: any
  onViewEvent: () => void
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
        <h1 className="text-5xl md:text-7xl lg:text-8xl font-black mb-6 text-white drop-shadow-2xl leading-[0.95]">
          {event.title}
        </h1>
      </RevealAnimation>

      {event.date && (
        <RevealAnimation delay={0.4}>
          <div className="max-w-2xl mx-auto mb-8">
            <CountdownTimer targetDate={new Date(event.date).toISOString()} />
          </div>
        </RevealAnimation>
      )}

      <RevealAnimation delay={0.55}>
        <div className="flex flex-col items-center gap-4">
          <Button
            size="lg"
            className="bg-red-600 hover:bg-red-700 text-white px-10 py-4 text-lg font-bold transition-all duration-300 hover:scale-105 shadow-lg group"
            onClick={onViewEvent}
          >
            View Event
            <ArrowRight className="w-5 h-5 ml-2 transition-transform duration-300 group-hover:translate-x-1" />
          </Button>
          <Link
            href="/my-tickets"
            className="text-sm font-semibold text-white/70 hover:text-white underline underline-offset-4 transition-colors duration-200"
          >
            My Tickets
          </Link>
        </div>
      </RevealAnimation>
    </div>
  )
}

function BrandHero() {
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
        <div className="flex justify-center">
          <Link
            href="/my-tickets"
            className="text-sm font-semibold text-white/70 hover:text-white underline underline-offset-4 transition-colors duration-200"
          >
            My Tickets
          </Link>
        </div>
      </RevealAnimation>
    </div>
  )
}
