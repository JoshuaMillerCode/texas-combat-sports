"use client"
import Image from "next/image"
import { Calendar, Clock, MapPin } from "lucide-react"
import { useRouter } from "next/navigation"

const DEFAULT_EVENT_IMAGES = [
  "https://res.cloudinary.com/dujmomznj/image/upload/f_auto,q_auto:eco,w_300,h_225,c_fill/v1759378172/scene-from-olympic-games-tournament-with-athletes-competing_23-2151471034_rumfsk.avif",
  "https://res.cloudinary.com/dujmomznj/image/upload/f_auto,q_auto:eco,w_300,h_225,c_fill/v1759378718/download_1_qbznu9.jpg",
  "https://res.cloudinary.com/dujmomznj/image/upload/f_auto,q_auto:eco,w_300,h_225,c_fill/v1759378718/download_xayqnn.jpg",
  "https://res.cloudinary.com/dujmomznj/image/upload/f_auto,q_auto:eco,w_300,h_225,c_fill/v1759378718/images_paqp96.jpg",
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

interface PastEventsListProps {
  events: any[]
}

export default function PastEventsList({ events }: PastEventsListProps) {
  const pastEvents = events?.filter((event: any) => event.isPastEvent).reverse() || []
  const router = useRouter()
  
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
                className="bg-black/50 border border-red-900/30 rounded-lg overflow-hidden group hover:border-red-600/50 transition-all duration-300 cursor-pointer"
                onClick={() => router.push(`/events/${event.slug}`)}
              >
                <div className="relative h-64">
                  <Image
                    src={event.posterImage || getRandomEventImage(event._id || event.slug)}
                    alt={event.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
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