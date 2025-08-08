"use client"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Calendar, Clock, MapPin, DollarSign } from "lucide-react"
import { Button } from "@/components/ui/button"
import CountdownTimer from "@/components/countdown-timer"

interface UpcomingEventsListProps {
  events: any[]
}

export default function UpcomingEventsList({ events }: UpcomingEventsListProps) {
  const router = useRouter()
  const upcomingEvents = events?.filter((event: any) => !event.isPastEvent && event.isActive) || []

  return (
    <section className="py-20 bg-gradient-to-b from-black to-gray-900">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-black text-center mb-16 text-white">
            UPCOMING <span className="text-red-600">EVENTS</span>
          </h2>
          <div className="space-y-12">
            {upcomingEvents.map((event: any) => (
              <div key={event._id} className="bg-black/50 border border-red-900/30 rounded-lg overflow-hidden">
                <div className="grid lg:grid-cols-2 gap-8">
                  <div className="relative h-80 lg:h-auto">
                    <Image src={event.image || "/placeholder.svg"} alt={event.title} fill className="object-cover" />
                  </div>
                  <div className="p-8">
                    <h3 className="text-3xl font-bold text-white mb-4">{event.title}</h3>
                    <p className="text-gray-300 mb-6 text-lg">{event.description}</p>

                    <div className="space-y-3 mb-6">
                      <div className="flex items-center text-gray-300">
                        <Calendar className="w-5 h-5 mr-3 text-red-500" />
                        {new Date(event.date).toLocaleDateString("en-US", {
                          weekday: "long",
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </div>
                      <div className="flex items-center text-gray-300">
                        <Clock className="w-5 h-5 mr-3 text-red-500" />
                        {new Date(event.date).toLocaleTimeString("en-US", {
                          hour: "2-digit",
                          minute: "2-digit",
                          hour12: true
                        })}
                      </div>
                      <div className="flex items-center text-gray-300">
                        <MapPin className="w-5 h-5 mr-3 text-red-500" />
                        {event.location}
                      </div>
                      <div className="flex items-center text-gray-300">
                        <DollarSign className="w-5 h-5 mr-3 text-red-500" />
                        {event.ticketPrice}
                      </div>
                    </div>

                    <div className="bg-red-600/20 p-4 rounded-lg mb-6">
                      <h4 className="text-red-400 font-bold mb-2">MAIN EVENT</h4>
                      <p className="text-white font-semibold">{event.mainEvent ? event.mainEvent.title : "No main event... yet"}</p>
                    </div>

                    <CountdownTimer targetDate={event.date} />

                    <div className="flex gap-4 mt-6">
                      <Button 
                        className="bg-red-600 hover:bg-red-700 text-white font-bold flex-1"
                        onClick={() => router.push(`/events/${event.slug}`)}
                      >
                        Buy Tickets
                      </Button>
                      <Button
                        variant="outline"
                        className="border-red-600 text-red-600 hover:bg-red-600 hover:text-white font-bold"
                        onClick={() => router.push(`/events/${event.slug}#main-event`)}
                      >
                        Fight Card
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
  )
}