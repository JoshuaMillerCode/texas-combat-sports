"use client"

import { useEventsQuery } from "@/hooks/use-queries"
import PastEventsList from "@/components/events/past-events-list"
import UpcomingEventsList from "@/components/events/upcoming-events-list"
import LoadingBoxing from "@/components/ui/loading-boxing"

export default function EventsPage() {
  const { data: events, isLoading, error } = useEventsQuery()

  if (isLoading) {
    return (
      <div className="min-h-screen pt-10 bg-gradient-to-b from-black to-gray-900">
        <LoadingBoxing text="Loading Events..." size="lg" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen pt-10 bg-gradient-to-b from-black to-gray-900">
        <div className="flex items-center justify-center h-screen">
          <div className="text-center text-red-500">
            <h1 className="text-2xl font-bold mb-2">Error loading events</h1>
            <p>{error.message}</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen pt-10">
      {/* Hero Section */}
      <section className="relative h-96 flex items-center justify-center overflow-hidden">
        <video autoPlay muted loop playsInline className="absolute inset-0 w-full h-full object-cover">
          <source src="https://res.cloudinary.com/dujmomznj/video/upload/v1754756997/0809_vaxbkh.mov" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-black/70" />
        <div className="relative z-10 text-center">
          <h1 className="text-6xl font-black text-white mb-4 drop-shadow-2xl">
            FIGHT <span className="text-red-600 drop-shadow-2xl">EVENTS</span>
          </h1>
          <p className="text-xl text-gray-300 drop-shadow-lg">Where Champions Are Made</p>
        </div>
      </section>

      <UpcomingEventsList events={events} />
      <PastEventsList events={events} />
    </div>
  )
}
