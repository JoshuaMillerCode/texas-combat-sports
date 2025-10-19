"use client"

import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Calendar, MapPin } from "lucide-react"
import SmoothParallax from "@/components/smooth-parallax"
import RevealAnimation from "@/components/reveal-animation"
import ScrollTriggeredAnimation from "@/components/scroll-triggered-animation"
import CountdownTimer from "@/components/countdown-timer"
import { useUpcomingEventsQuery } from "@/hooks/use-queries"
import { format } from "date-fns"
import type { IEvent } from "@/lib/models/Event"
import { useRouter } from "next/navigation"

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

export default function UpcomingEventsSection() {
  const router = useRouter()
  const { data: upcomingEvents, isLoading: isLoadingUpcoming } = useUpcomingEventsQuery()

  return (
    <SmoothParallax className="py-20 bg-gradient-to-b from-gray-900 to-black" speed={0.3} direction="up">
      <div className="container mx-auto px-4">
        <RevealAnimation>
          <h2 className="text-5xl font-black text-center mb-16 text-white">
            UPCOMING <span className="text-red-600">EVENTS</span>
          </h2>
        </RevealAnimation>

        {isLoadingUpcoming ? (
          <div className="flex justify-center">
            <div className="grid md:grid-cols-2 gap-8 max-w-6xl w-full">
              {[1, 2].map((i) => (
                <div key={i} className="bg-black/50 border border-red-900/30 rounded-lg overflow-hidden animate-pulse">
                  <div className="h-64 bg-gray-800" />
                  <div className="p-6">
                    <div className="h-6 bg-gray-700 rounded mb-2" />
                    <div className="h-4 bg-gray-700 rounded mb-4" />
                    <div className="h-4 bg-gray-700 rounded mb-4" />
                    <div className="h-10 bg-gray-700 rounded" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : upcomingEvents && upcomingEvents.length > 0 ? (
          <div className="flex justify-center">
            <div className={`grid gap-8 ${upcomingEvents.length === 1 ? 'md:grid-cols-1 max-w-5xl' : 'md:grid-cols-2 max-w-6xl'} w-full`}>
              {upcomingEvents.map((event: IEvent, index: number) => (
                <RevealAnimation key={event._id.toString()} delay={index * 0.2}>
                  <ScrollTriggeredAnimation
                    scaleRange={[0.95, 1]}
                    className="bg-black/50 border border-red-900/30 rounded-lg overflow-hidden group hover:border-red-600/50 transition-all duration-500 hover:scale-105"
                  >
                    <div 
                      className="relative h-[600px] hover:cursor-pointer"
                      onClick={() => router.push(`/events/${event.slug}`)}
                    >
                      <Image
                        src={event.posterImage || getRandomEventImage(event._id?.toString() || event.slug)}
                        alt={event.title}
                        fill
                        className="object-cover"
                        loading="lazy"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                      <div className="absolute bottom-4 left-4">
                        <h3 className="text-2xl font-bold text-white mb-2">{event.title}</h3>
                        <div className="flex items-center text-gray-300 mb-1">
                          <Calendar className="w-4 h-4 mr-2" />
                          {event.date ? format(new Date(event.date), 'MMM dd, yyyy') : 'TBD'}
                        </div>
                        <div className="flex items-center text-gray-300">
                          <MapPin className="w-4 h-4 mr-2" />
                          {event.venue}, {event.city}
                        </div>
                      </div>
                    </div>
                    <div className="p-6">
                      {event.date && <CountdownTimer targetDate={event.date.toString()} />}
                      <Button 
                      className="w-full mt-4 bg-red-600 hover:bg-red-700 text-white font-bold transition-all duration-300 hover:scale-105"
                      onClick={() => router.push(`/events/${event.slug}`)}
                      >
                        Get Tickets
                      </Button>
                    </div>
                  </ScrollTriggeredAnimation>
                </RevealAnimation>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex justify-center">
            <div className="text-center py-12 max-w-2xl">
              <p className="text-gray-400 text-lg">No upcoming events at the moment.</p>
            </div>
          </div>
        )}
      </div>
    </SmoothParallax>
  )
} 