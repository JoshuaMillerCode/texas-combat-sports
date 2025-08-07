"use client"

import { useLiveEventsQuery, useVideosQuery, useIncrementViewCountMutation } from "@/hooks/use-queries"
import {
  LoadingSpinner,
  LiveStreamSection,
  NoLiveEventSection,
  PastEventsSection,
  CallToActionSection,
  formatDuration,
  formatViewCount
} from "@/components/streaming"

export default function StreamingContent() {
  const incrementViewCount = useIncrementViewCountMutation()
  
  // Fetch live events (current and upcoming)
  const { data: currentLiveEvents, isLoading: isLoadingLive } = useLiveEventsQuery(false)
  const { data: upcomingLiveEvents, isLoading: isLoadingUpcoming } = useLiveEventsQuery(true)
  
  // Fetch past videos (non-live events)
  const { data: pastVideos, isLoading: isLoadingPast } = useVideosQuery({
    isPublic: true,
    isLiveEvent: false
  })

  // Check if there's a currently live event
  const currentLiveEvent = currentLiveEvents?.[0]
  const isLiveEvent = !!currentLiveEvent

  const handleWatchVideo = (videoId: string) => {
    // Increment view count when user clicks to watch
    incrementViewCount.mutate(videoId)
  }

  if (isLoadingLive || isLoadingUpcoming || isLoadingPast) {
    return <LoadingSpinner />
  }

  return (
    <>
      {/* Live Stream Section */}
      {isLiveEvent ? (
        <LiveStreamSection 
          currentLiveEvent={currentLiveEvent}
          formatViewCount={formatViewCount}
        />
      ) : (
        <NoLiveEventSection upcomingLiveEvents={upcomingLiveEvents} />
      )}

      {/* Past Events Section */}
      <PastEventsSection
        pastVideos={pastVideos}
        onWatchVideo={handleWatchVideo}
        formatDuration={formatDuration}
        formatViewCount={formatViewCount}
      />

      {/* Call to Action */}
      <CallToActionSection />
    </>
  )
} 