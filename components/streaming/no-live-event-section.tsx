"use client"

import { Button } from "@/components/ui/button"
import { Calendar } from "lucide-react"
import { format } from "date-fns"
import type { IVideo } from "@/lib/models/Video"

interface NoLiveEventSectionProps {
  upcomingLiveEvents?: IVideo[]
}

export default function NoLiveEventSection({ upcomingLiveEvents }: NoLiveEventSectionProps) {
  return (
    <section className="py-20 bg-gradient-to-b from-black to-gray-900">
      <div className="container mx-auto px-4 text-center">
        <h2 className="text-4xl font-black text-white mb-8">
          NO LIVE <span className="text-red-600">EVENT</span>
        </h2>
        <p className="text-xl text-gray-300 mb-8">
          Stay tuned for our next live event. Check out our past fights below!
        </p>
        {upcomingLiveEvents && upcomingLiveEvents.length > 0 && (
          <div className="mb-8">
            <h3 className="text-2xl font-bold text-white mb-4">Upcoming Live Events</h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-4xl mx-auto">
              {upcomingLiveEvents.slice(0, 3).map((event: IVideo) => (
                <div key={event._id.toString()} className="bg-black/50 border border-red-900/30 rounded-lg p-4">
                  <h4 className="text-white font-bold mb-2">{event.title}</h4>
                  <p className="text-gray-300 text-sm mb-2">{event.description}</p>
                  <div className="flex items-center text-gray-400 text-sm">
                    <Calendar className="w-4 h-4 mr-2" />
                    <span>
                      {event.scheduledStartTime ? 
                        format(new Date(event.scheduledStartTime), 'MMM dd, yyyy h:mm a') : 
                        'TBD'
                      }
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        <Button className="bg-red-600 hover:bg-red-700 text-white font-bold px-8 py-4">
          Get Notified of Next Event
        </Button>
      </div>
    </section>
  )
} 