"use client"

import VideoCard from "./video-card"
import type { IVideo } from "@/lib/models/Video"

interface PastEventsSectionProps {
  pastVideos?: IVideo[]
  onWatchVideo: (videoId: string) => void
  formatDuration: (minutes: number) => string
  formatViewCount: (count: number) => string
}

export default function PastEventsSection({ 
  pastVideos, 
  onWatchVideo, 
  formatDuration, 
  formatViewCount 
}: PastEventsSectionProps) {
  return (
    <section className="py-20 bg-gradient-to-b from-gray-900 to-black">
      <div className="container mx-auto px-4">
        <h2 className="text-4xl font-black text-center mb-16 text-white">
          PAST <span className="text-red-600">EVENTS</span>
        </h2>
        
        {pastVideos && pastVideos.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...pastVideos].reverse().map((video: IVideo) => (
              <VideoCard
                key={video._id.toString()}
                video={video}
                onWatchVideo={onWatchVideo}
                formatDuration={formatDuration}
                formatViewCount={formatViewCount}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-400 text-lg">No past events available at the moment.</p>
          </div>
        )}
      </div>
    </section>
  )
} 