"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Clock, ExternalLink, Eye } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import type { IVideo } from "@/lib/models/Video"

interface LiveStreamSectionProps {
  currentLiveEvent: IVideo
  formatViewCount: (count: number) => string
}

export default function LiveStreamSection({ currentLiveEvent, formatViewCount }: LiveStreamSectionProps) {
  return (
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
          <h2 className="text-4xl font-black text-white mb-4">{currentLiveEvent.title}</h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">{currentLiveEvent.description}</p>
        </div>

        <div className="max-w-6xl mx-auto">
          <div className="relative aspect-video rounded-lg overflow-hidden mb-6">
            {currentLiveEvent.liveStreamUrl ? (
              <iframe
                src={currentLiveEvent.liveStreamUrl}
                title="Live Stream"
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            ) : (
              <div className="w-full h-full bg-gray-800 flex items-center justify-center">
                <p className="text-white text-xl">Live stream URL not available</p>
              </div>
            )}
          </div>
          
          <div className="bg-black/50 border border-red-900/30 rounded-lg p-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              {/* <div className="flex items-center gap-6">
                <div className="flex items-center text-gray-300">
                  <Eye className="w-5 h-5 mr-2 text-red-500" />
                  <span className="font-semibold">{formatViewCount(currentLiveEvent.viewCount)} views</span>
                </div>
                <div className="flex items-center text-gray-300">
                  <Clock className="w-5 h-5 mr-2 text-red-500" />
                  <span>
                    Started {currentLiveEvent.scheduledStartTime ? 
                      formatDistanceToNow(new Date(currentLiveEvent.scheduledStartTime), { addSuffix: true }) : 
                      'recently'
                    }
                  </span>
                </div>
              </div> */}
              {currentLiveEvent.liveStreamUrl && (
                <Button 
                  className="bg-red-600 hover:bg-red-700 text-white font-bold"
                  onClick={() => window.open(currentLiveEvent.videoUrl, '_blank')}
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Watch Full Screen
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
} 