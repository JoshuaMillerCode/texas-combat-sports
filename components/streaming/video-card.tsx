"use client"

import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Play, Calendar, Eye } from "lucide-react"
import { format } from "date-fns"
import type { IVideo } from "@/lib/models/Video"

interface VideoCardProps {
  video: IVideo
  onWatchVideo: (videoId: string) => void
  formatDuration: (minutes: number) => string
  formatViewCount: (count: number) => string
}

export default function VideoCard({ 
  video, 
  onWatchVideo, 
  formatDuration, 
  formatViewCount 
}: VideoCardProps) {
  const handleWatch = () => {
    onWatchVideo(video._id.toString())
    if (video.videoUrl) {
      window.open(video.videoUrl, '_blank')
    }
  }

  return (
    <div className="bg-black/50 border border-red-900/30 rounded-lg overflow-hidden group hover:border-red-600/50 transition-all duration-300 hover:scale-105">
      <div className="relative h-64">
        {video.thumbnailUrl ? (
          <Image
            src={video.thumbnailUrl}
            alt={video.title}
            fill
            className="object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gray-800 flex items-center justify-center">
            <Play 
              className="w-16 h-16 text-gray-600 cursor-pointer" 
              onClick={handleWatch}
            />
          </div>
        )}
        <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors duration-300" />
        
        {/* Play Button Overlay */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="bg-red-600 rounded-full p-4">
            <Play 
              className="w-8 h-8 text-white fill-white cursor-pointer" 
              onClick={handleWatch}
            />
          </div>
        </div>
        
        {/* Duration Badge */}
        {video.duration && (
          <div className="absolute bottom-4 right-4">
            <Badge className="bg-black/80 text-white">
              {formatDuration(video.duration)}
            </Badge>
          </div>
        )}
      </div>
      
      <div className="p-6">
        <h3 className="text-xl font-bold text-white mb-2 group-hover:text-red-400 transition-colors">
          {video.title}
        </h3>
        
        <div className="flex items-center text-gray-400 mb-3">
          <Calendar className="w-4 h-4 mr-2" />
          <span className="text-sm">
            {video.date ? 
              format(new Date(video.date), 'MMM dd, yyyy') : 
              video.createdAt ? 
                format(new Date(video.createdAt), 'MMM dd, yyyy') : 
                'Date not available'
            }
          </span>
        </div>
        
        <p className="text-gray-300 text-sm mb-4 line-clamp-2">
          {video.description || 'No description available'}
        </p>
        
        <div className="flex items-center justify-between">
          <span className="text-gray-400 text-sm flex items-center">
            <Eye className="w-4 h-4 mr-1" />
            {formatViewCount(video.viewCount)} views
          </span>
          <Button 
            size="sm" 
            className="bg-red-600 hover:bg-red-700 text-white font-bold"
            onClick={handleWatch}
          >
            Watch Replay
          </Button>
        </div>
      </div>
    </div>
  )
} 