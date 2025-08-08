"use client"
import Image from "next/image"
import { Calendar, Clock, MapPin } from "lucide-react"

interface PastEventsListProps {
  events: any[]
}

export default function PastEventsList({ events }: PastEventsListProps) {
  const pastEvents = events?.filter((event: any) => event.isPastEvent).reverse() || []

  return (
    <section className="py-20 bg-gradient-to-b from-gray-900 to-black">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-black text-center mb-16 text-white">
            PAST <span className="text-red-600">EVENTS</span>
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {pastEvents.map((event: any) => (
              <div
                key={event._id}
                className="bg-black/50 border border-red-900/30 rounded-lg overflow-hidden group hover:border-red-600/50 transition-all duration-300"
              >
                <div className="relative h-64">
                  <Image
                    src={event.image || "/placeholder.svg"}
                    alt={event.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold text-white mb-2">{event.title}</h3>
                  <div className="flex items-center text-gray-400 mb-2">
                    <Calendar className="w-4 h-4 mr-2" />
                    {new Date(event.date).toLocaleDateString()}
                  </div>
                  <div className="flex items-center text-gray-400 mb-2">
                    <Clock className="w-4 h-4 mr-2" />
                    {new Date(event.date).toLocaleTimeString("en-US", {
                      hour: "2-digit",
                      minute: "2-digit",
                      hour12: true
                    })}
                  </div>
                  <div className="flex items-center text-gray-400 mb-4">
                    <MapPin className="w-4 h-4 mr-2" />
                    {event.location}
                  </div>
                  <p className="text-gray-300 text-sm">{event.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
  )
}