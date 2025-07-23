"use client"

import { useState } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Play, Calendar, Clock, Users, ExternalLink } from "lucide-react"

export default function StreamingPage() {
  // Toggle this to simulate live event status
  const [isLiveEvent, setIsLiveEvent] = useState(true)
  
  const liveStreamData = {
    title: "LIVE: Houston Championship Night",
    description: "Watch the biggest fight night of the year featuring championship bouts and rising stars.",
    viewers: "12,847",
    startTime: "8:00 PM CT",
    youtubeUrl: "https://www.youtube.com/embed/live_stream?channel=CHANNEL_ID&autoplay=1"
  }

  const pastEvents = [
    {
      id: 1,
      title: "Houston Showdown 2024",
      date: "July 19, 2024",
      duration: "2:15:30",
      thumbnail: "/placeholder.svg?height=300&width=400",
      youtubeId: "dQw4w9WgXcQ",
      description: "Epic championship night with 3 title fights and unforgettable knockouts.",
      views: "45,231"
    },
    {
      id: 2,
      title: "Texas Thunder",
      date: "June 15, 2024", 
      duration: "1:58:45",
      thumbnail: "/placeholder.svg?height=300&width=400",
      youtubeId: "dQw4w9WgXcQ",
      description: "Lightning-fast action featuring the most explosive fighters in Texas.",
      views: "38,492"
    },
    {
      id: 3,
      title: "Spring Slam Spectacular",
      date: "April 20, 2024",
      duration: "2:05:12",
      thumbnail: "/placeholder.svg?height=300&width=400",
      youtubeId: "dQw4w9WgXcQ",
      description: "Record-breaking attendance with incredible championship fights.",
      views: "52,103"
    },
    {
      id: 4,
      title: "Winter Warriors",
      date: "February 14, 2024",
      duration: "2:22:18",
      thumbnail: "/placeholder.svg?height=300&width=400",
      youtubeId: "dQw4w9WgXcQ",
      description: "Valentine's Day special featuring 5 championship fights and surprises.",
      views: "41,876"
    },
    {
      id: 5,
      title: "New Year Knockout",
      date: "January 6, 2024",
      duration: "1:45:33",
      thumbnail: "/placeholder.svg?height=300&width=400",
      youtubeId: "dQw4w9WgXcQ",
      description: "Started the year with explosive action and new champions crowned.",
      views: "35,654"
    },
    {
      id: 6,
      title: "Holiday Havoc",
      date: "December 15, 2023",
      duration: "2:08:56",
      thumbnail: "/placeholder.svg?height=300&width=400",
      youtubeId: "dQw4w9WgXcQ",
      description: "End of year celebration with the best fighters and amazing finishes.",
      views: "48,291"
    }
  ]

  return (
    <div className="min-h-screen pt-16">
      {/* Hero Section */}
      {/* <section className="relative h-96 flex items-center justify-center overflow-hidden">
        <video autoPlay muted loop playsInline className="absolute inset-0 w-full h-full object-cover">
          <source src="/videos/streaming-hero.mp4" type="video/mp4" />
          <source src="/videos/streaming-hero.webm" type="video/webm" />
        </video>
        <div className="absolute inset-0 bg-black/70" />
        <div className="relative z-10 text-center">
          <h1 className="text-6xl font-black text-white mb-4">
            LIVE <span className="text-red-600">STREAMING</span>
          </h1>
          <p className="text-xl text-gray-300">Never Miss a Fight</p>
        </div>
      </section> */}

      {/* Live Stream Section */}
      {isLiveEvent ? (
        <section className="py-20 bg-gradient-to-b from-black to-gray-900">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <div className="flex items-center justify-center gap-3 mb-4">
                <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                <Badge className="bg-red-600 text-white font-bold px-4 py-2 text-lg">
                  LIVE NOW
                </Badge>
                <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
              </div>
              <h2 className="text-4xl font-black text-white mb-4">{liveStreamData.title}</h2>
              <p className="text-xl text-gray-300 max-w-3xl mx-auto">{liveStreamData.description}</p>
            </div>

            <div className="max-w-6xl mx-auto">
              <div className="relative aspect-video rounded-lg overflow-hidden mb-6">
                <iframe
                  src={liveStreamData.youtubeUrl}
                  title="Live Stream"
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
              
              <div className="bg-black/50 border border-red-900/30 rounded-lg p-6">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-6">
                    <div className="flex items-center text-gray-300">
                      <Users className="w-5 h-5 mr-2 text-red-500" />
                      <span className="font-semibold">{liveStreamData.viewers} watching</span>
                    </div>
                    <div className="flex items-center text-gray-300">
                      <Clock className="w-5 h-5 mr-2 text-red-500" />
                      <span>Started at {liveStreamData.startTime}</span>
                    </div>
                  </div>
                  <Button className="bg-red-600 hover:bg-red-700 text-white font-bold">
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Watch on YouTube
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>
      ) : (
        <section className="py-20 bg-gradient-to-b from-black to-gray-900">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-4xl font-black text-white mb-8">
              NO LIVE <span className="text-red-600">EVENT</span>
            </h2>
            <p className="text-xl text-gray-300 mb-8">
              Stay tuned for our next live event. Check out our past fights below!
            </p>
            <Button className="bg-red-600 hover:bg-red-700 text-white font-bold px-8 py-4">
              Get Notified of Next Event
            </Button>
          </div>
        </section>
      )}

      {/* Past Events Section */}
      <section className="py-20 bg-gradient-to-b from-gray-900 to-black">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-black text-center mb-16 text-white">
            PAST <span className="text-red-600">EVENTS</span>
          </h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {pastEvents.map((event) => (
              <div
                key={event.id}
                className="bg-black/50 border border-red-900/30 rounded-lg overflow-hidden group hover:border-red-600/50 transition-all duration-300 hover:scale-105"
              >
                <div className="relative h-64">
                  <Image
                    src={event.thumbnail}
                    alt={event.title}
                    fill
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors duration-300" />
                  
                  {/* Play Button Overlay */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="bg-red-600 rounded-full p-4">
                      <Play className="w-8 h-8 text-white fill-white" />
                    </div>
                  </div>
                  
                  {/* Duration Badge */}
                  <div className="absolute bottom-4 right-4">
                    <Badge className="bg-black/80 text-white">
                      {event.duration}
                    </Badge>
                  </div>
                </div>
                
                <div className="p-6">
                  <h3 className="text-xl font-bold text-white mb-2 group-hover:text-red-400 transition-colors">
                    {event.title}
                  </h3>
                  
                  <div className="flex items-center text-gray-400 mb-3">
                    <Calendar className="w-4 h-4 mr-2" />
                    <span className="text-sm">{event.date}</span>
                  </div>
                  
                  <p className="text-gray-300 text-sm mb-4 line-clamp-2">
                    {event.description}
                  </p>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400 text-sm">{event.views} views</span>
                    <Button 
                      size="sm" 
                      className="bg-red-600 hover:bg-red-700 text-white font-bold"
                      onClick={() => window.open(`https://www.youtube.com/watch?v=${event.youtubeId}`, '_blank')}
                    >
                      Watch Replay
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-20 bg-gradient-to-b from-black to-gray-900">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-black mb-4 text-white">
            NEVER MISS A <span className="text-red-600">FIGHT</span>
          </h2>
          <p className="text-gray-400 mb-8 text-lg max-w-2xl mx-auto">
            Subscribe to our YouTube channel and hit the notification bell to get alerts 
            when we go live for the next big fight night.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button className="bg-red-600 hover:bg-red-700 text-white font-bold px-8 py-4">
              <ExternalLink className="w-4 h-4 mr-2" />
              Subscribe on YouTube
            </Button>
            <Button 
              variant="outline" 
              className="border-red-600 text-red-600 hover:bg-red-600 hover:text-white font-bold px-8 py-4"
            >
              View Upcoming Events
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
} 