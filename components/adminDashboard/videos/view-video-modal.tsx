import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Play, Calendar, Clock, Eye, Globe, Lock, ExternalLink } from "lucide-react"

interface ViewVideoModalProps {
  video: any
}

export function ViewVideoModal({ video }: ViewVideoModalProps) {
  const formatDuration = (minutes?: number) => {
    if (!minutes) return "N/A"
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`
  }

  const formatDate = (date?: Date) => {
    if (!date) return "N/A"
    return new Date(date).toLocaleString()
  }

  const isCurrentlyLive = () => {
    if (!video.isLiveEvent || !video.scheduledStartTime) return false
    const now = new Date()
    return now >= new Date(video.scheduledStartTime)
  }

  return (
    <div className="space-y-6">
      {/* Video Header */}
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h3 className="text-xl font-semibold text-white mb-2">{video.title}</h3>
          <div className="flex items-center gap-2 mb-3">
            {video.isLiveEvent && (
              <Badge variant="destructive" className="text-xs bg-red-600 text-white border-red-600">
                <Play className="h-3 w-3 mr-1" />
                {isCurrentlyLive() ? "Live Now" : "Live Event"}
              </Badge>
            )}
            {!video.isPublic && (
              <Badge variant="secondary" className="text-xs bg-gray-600 text-white border-gray-600">
                <Lock className="h-3 w-3 mr-1" />
                Private
              </Badge>
            )}
            {video.isPublic && (
              <Badge variant="outline" className="text-xs bg-green-600 text-white border-green-600">
                <Globe className="h-3 w-3 mr-1" />
                Public
              </Badge>
            )}
          </div>
        </div>
      </div>

      {/* Video Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Basic Information */}
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white text-lg">Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-400">Duration:</span>
              <span className="text-white">{formatDuration(video.duration)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Views:</span>
              <span className="text-white flex items-center">
                <Eye className="h-4 w-4 mr-1" />
                {video.viewCount || 0}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Created:</span>
              <span className="text-white">{formatDate(video.createdAt)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Updated:</span>
              <span className="text-white">{formatDate(video.updatedAt)}</span>
            </div>
          </CardContent>
        </Card>

        {/* Event Information */}
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white text-lg">Event Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-400">Associated Event:</span>
              <span className="text-white">
                {video.associatedEvent ? video.associatedEvent.title : "None"}
              </span>
            </div>
            {video.date && (
              <div className="flex justify-between">
                <span className="text-gray-400">Event Date:</span>
                <span className="text-white flex items-center">
                  <Calendar className="h-4 w-4 mr-1" />
                  {formatDate(video.date)}
                </span>
              </div>
            )}
            {video.scheduledStartTime && (
              <div className="flex justify-between">
                <span className="text-gray-400">Scheduled Start:</span>
                <span className="text-white flex items-center">
                  <Clock className="h-4 w-4 mr-1" />
                  {formatDate(video.scheduledStartTime)}
                </span>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Description */}
      {video.description && (
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white text-lg">Description</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-300 whitespace-pre-wrap">{video.description}</p>
          </CardContent>
        </Card>
      )}

      {/* URLs */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white text-lg">URLs</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <span className="text-gray-400 block mb-1">Video URL:</span>
            <div className="flex items-center gap-2">
              <span className="text-white text-sm break-all flex-1">{video.videoUrl}</span>
              <a
                href={video.videoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-red-400 hover:text-red-300"
              >
                <ExternalLink className="h-4 w-4" />
              </a>
            </div>
          </div>
          
          {video.thumbnailUrl && (
            <div>
              <span className="text-gray-400 block mb-1">Thumbnail URL:</span>
              <div className="flex items-center gap-2">
                <span className="text-white text-sm break-all flex-1">{video.thumbnailUrl}</span>
                <a
                  href={video.thumbnailUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-red-400 hover:text-red-300"
                >
                  <ExternalLink className="h-4 w-4" />
                </a>
              </div>
            </div>
          )}

          {video.liveStreamUrl && (
            <div>
              <span className="text-gray-400 block mb-1">Live Stream URL:</span>
              <div className="flex items-center gap-2">
                <span className="text-white text-sm break-all flex-1">{video.liveStreamUrl}</span>
                <a
                  href={video.liveStreamUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-red-400 hover:text-red-300"
                >
                  <ExternalLink className="h-4 w-4" />
                </a>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Live Event Status */}
      {video.isLiveEvent && (
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white text-lg">Live Event Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${isCurrentlyLive() ? 'bg-red-500 animate-pulse' : 'bg-gray-500'}`} />
              <span className="text-white">
                {isCurrentlyLive() ? 'Currently Live' : 'Scheduled Live Event'}
              </span>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
