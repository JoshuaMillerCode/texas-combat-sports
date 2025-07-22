import Image from "next/image"
import { Button } from "@/components/ui/button"
import CountdownTimer from "@/components/countdown-timer"
import { Calendar, MapPin, Clock, DollarSign } from "lucide-react"

export default function EventsPage() {
  const upcomingEvents = [
    {
      id: 1,
      title: "Houston Showdown",
      date: "2024-07-19",
      time: "7:00 PM",
      location: "Toyota Center, Houston",
      price: "From $45",
      image: "/placeholder.svg?height=400&width=600",
      description: "The biggest fight night of the summer featuring championship bouts and rising stars.",
      mainEvent: "Rodriguez vs. Martinez - Heavyweight Championship",
    },
    {
      id: 2,
      title: "Texas Thunder",
      date: "2024-08-15",
      time: "8:00 PM",
      location: "NRG Arena, Houston",
      price: "From $55",
      image: "/placeholder.svg?height=400&width=600",
      description: "Lightning-fast action with the most explosive fighters in Texas.",
      mainEvent: "Chen vs. Williams - Women's Title Fight",
    },
  ]

  const pastEvents = [
    {
      id: 1,
      title: "Spring Slam",
      date: "2024-04-20",
      location: "Minute Maid Park",
      image: "/placeholder.svg?height=300&width=400",
      highlights: "Record-breaking attendance with 3 knockout finishes",
    },
    {
      id: 2,
      title: "Winter Warriors",
      date: "2024-02-14",
      location: "Toyota Center",
      image: "/placeholder.svg?height=300&width=400",
      highlights: "Valentine's Day special featuring 5 championship fights",
    },
    {
      id: 3,
      title: "New Year Knockout",
      date: "2024-01-06",
      location: "NRG Arena",
      image: "/placeholder.svg?height=300&width=400",
      highlights: "Started the year with explosive action and new champions",
    },
  ]

  return (
    <div className="min-h-screen pt-16">
      {/* Hero Section */}
      <section className="relative h-96 flex items-center justify-center overflow-hidden">
        <video autoPlay muted loop playsInline className="absolute inset-0 w-full h-full object-cover">
          <source src="/videos/events-hero.mp4" type="video/mp4" />
          <source src="/videos/events-hero.webm" type="video/webm" />
        </video>
        <div className="absolute inset-0 bg-black/70" />
        <div className="relative z-10 text-center">
          <h1 className="text-6xl font-black text-white mb-4">
            FIGHT <span className="text-red-600">EVENTS</span>
          </h1>
          <p className="text-xl text-gray-300">Where Champions Are Made</p>
        </div>
      </section>

      {/* Upcoming Events */}
      <section className="py-20 bg-gradient-to-b from-black to-gray-900">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-black text-center mb-16 text-white">
            UPCOMING <span className="text-red-600">EVENTS</span>
          </h2>
          <div className="space-y-12">
            {upcomingEvents.map((event) => (
              <div key={event.id} className="bg-black/50 border border-red-900/30 rounded-lg overflow-hidden">
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
                        {event.time}
                      </div>
                      <div className="flex items-center text-gray-300">
                        <MapPin className="w-5 h-5 mr-3 text-red-500" />
                        {event.location}
                      </div>
                      <div className="flex items-center text-gray-300">
                        <DollarSign className="w-5 h-5 mr-3 text-red-500" />
                        {event.price}
                      </div>
                    </div>

                    <div className="bg-red-600/20 p-4 rounded-lg mb-6">
                      <h4 className="text-red-400 font-bold mb-2">MAIN EVENT</h4>
                      <p className="text-white font-semibold">{event.mainEvent}</p>
                    </div>

                    <CountdownTimer targetDate={event.date} />

                    <div className="flex gap-4 mt-6">
                      <Button className="bg-red-600 hover:bg-red-700 text-white font-bold flex-1">Buy Tickets</Button>
                      <Button
                        variant="outline"
                        className="border-red-600 text-red-600 hover:bg-red-600 hover:text-white font-bold"
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

      {/* Past Events */}
      <section className="py-20 bg-gradient-to-b from-gray-900 to-black">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-black text-center mb-16 text-white">
            PAST <span className="text-red-600">EVENTS</span>
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {pastEvents.map((event) => (
              <div
                key={event.id}
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
                  <div className="flex items-center text-gray-400 mb-4">
                    <MapPin className="w-4 h-4 mr-2" />
                    {event.location}
                  </div>
                  <p className="text-gray-300 text-sm">{event.highlights}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
