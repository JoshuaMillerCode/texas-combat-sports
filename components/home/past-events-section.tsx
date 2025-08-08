"use client"

import Image from "next/image"
import SmoothParallax from "@/components/smooth-parallax"
import RevealAnimation from "@/components/reveal-animation"
import ScrollTriggeredAnimation from "@/components/scroll-triggered-animation"
import { usePastEventsQuery } from "@/hooks/use-queries"
import { format } from "date-fns"
import type { IEvent } from "@/lib/models/Event"

export default function PastEventsSection() {
  const { data: pastEvents, isLoading: isLoadingPast } = usePastEventsQuery()

  return (
    <SmoothParallax className="py-20 bg-gradient-to-b from-gray-900 to-black" speed={0.2}>
      <div className="container mx-auto px-4">
        <RevealAnimation>
          <h2 className="text-5xl font-black text-center mb-16 text-white">
            PAST <span className="text-red-600">EVENTS</span>
          </h2>
        </RevealAnimation>

        {isLoadingPast ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div key={i} className="relative h-64 bg-gray-800 rounded-lg animate-pulse" />
            ))}
          </div>
        ) : pastEvents && pastEvents.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {pastEvents.slice(0, 8).map((event: IEvent, index: number) => (
              <RevealAnimation key={event._id.toString()} delay={index * 0.05}>
                <ScrollTriggeredAnimation
                  scaleRange={[0.95, 1]}
                  opacityRange={[0.7, 1]}
                  className="relative h-64 group overflow-hidden rounded-lg cursor-pointer"
                >
                  <Image
                    src={event.posterImage || `/placeholder.svg?height=300&width=300`}
                    alt={event.title}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-125"
                  />
                  <div className="absolute inset-0 bg-black/50 group-hover:bg-black/30 transition-colors duration-500" />
                  <div className="absolute bottom-2 left-2 right-2">
                    <h4 className="text-sm font-bold text-white truncate">{event.title}</h4>
                    <p className="text-xs text-gray-300">
                      {event.date ? format(new Date(event.date), 'MMM dd, yyyy') : 'TBD'}
                    </p>
                  </div>
                </ScrollTriggeredAnimation>
              </RevealAnimation>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-400 text-lg">No past events available.</p>
          </div>
        )}
      </div>
    </SmoothParallax>
  )
} 