import { useEventsQuery } from "@/hooks/use-queries"
import { useRouter } from "next/navigation"
import PastEventsList from "@/components/events/past-events-list"
import UpcomingEventsList from "@/components/events/upcoming-events-list"

export default function EventsPage() {
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

      <UpcomingEventsList />
      <PastEventsList />
    </div>
  )
}
