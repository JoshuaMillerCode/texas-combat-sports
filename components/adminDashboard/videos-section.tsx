import { useState } from "react"
import { useVideosQuery, useCreateVideoMutation, useUpdateVideoMutation, useDeleteVideoMutation } from "@/hooks/use-queries"
import { LoadingCard, ErrorCard } from "./loading-card"
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Plus, Edit, Trash2, Eye, Play, Calendar, Users, Clock } from "lucide-react"
import { CreateVideoForm, EditVideoForm, ViewVideoModal } from "./videos"

export default function VideosSection({ searchTerm }: { searchTerm: string }) {
  const { data: videos = [], isLoading, error } = useVideosQuery()
  const { mutate: createVideo, isPending: isCreating } = useCreateVideoMutation()
  const { mutate: updateVideo, isPending: isUpdating } = useUpdateVideoMutation()
  const { mutate: deleteVideo, isPending: isDeleting } = useDeleteVideoMutation()
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [selectedVideo, setSelectedVideo] = useState<any>(null)

  if (isLoading) return <LoadingCard />
  if (error) return <ErrorCard />

  const filteredVideos = videos.filter((video: any) => 
    video.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (video.description && video.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (video.associatedEvent && video.associatedEvent.title && video.associatedEvent.title.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  const formatDuration = (minutes?: number) => {
    if (!minutes) return "N/A"
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`
  }

  const formatDate = (date?: Date) => {
    if (!date) return "N/A"
    return new Date(date).toLocaleDateString()
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold text-white">Videos</h2>
          <p className="text-gray-400">Manage video content and live streams</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-red-600 hover:bg-red-700">
              <Plus className="h-4 w-4 mr-2" />
              Add Video
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-gray-900 border-gray-800 text-white max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
            <DialogHeader className="flex-shrink-0">
              <DialogTitle>Create New Video</DialogTitle>
              <DialogDescription className="text-gray-400">
                Add a new video or live stream to the platform
              </DialogDescription>
            </DialogHeader>
            <div className="overflow-y-auto flex-1 pr-2">
              <CreateVideoForm onSubmit={createVideo} isLoading={isCreating} onClose={() => setIsCreateDialogOpen(false)} />
            </div>
          </DialogContent>
        </Dialog>

        {/* Edit Video Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="bg-gray-900 border-gray-800 text-white max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
            <DialogHeader className="flex-shrink-0">
              <DialogTitle>Edit Video</DialogTitle>
              <DialogDescription className="text-gray-400">
                Update the video details
              </DialogDescription>
            </DialogHeader>
            <div className="overflow-y-auto flex-1 pr-2">
              {selectedVideo && (
                <EditVideoForm 
                  video={selectedVideo} 
                  onSubmit={(data) => {
                    const updateData = { ...data, id: selectedVideo._id }
                    updateVideo(updateData)
                    setIsEditDialogOpen(false)
                    setSelectedVideo(null)
                  }} 
                  isLoading={isUpdating} 
                  onClose={() => {
                    setIsEditDialogOpen(false)
                    setSelectedVideo(null)
                  }} 
                />
              )}
            </div>
          </DialogContent>
        </Dialog>

        {/* View Video Dialog */}
        <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
          <DialogContent className="bg-gray-900 border-gray-800 text-white max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
            <DialogHeader className="flex-shrink-0">
              <DialogTitle>Video Details</DialogTitle>
              <DialogDescription className="text-gray-400">
                View video information
              </DialogDescription>
            </DialogHeader>
            <div className="overflow-y-auto flex-1 pr-2">
              {selectedVideo && <ViewVideoModal video={selectedVideo} />}
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Videos Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredVideos.map((video: any) => (
          <Card key={video._id} className="bg-gray-800 border-gray-700 hover:bg-gray-750 transition-colors">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <CardTitle className="text-white text-lg">{video.title}</CardTitle>
                  <CardDescription className="text-gray-400 mt-1">
                    {video.associatedEvent ? video.associatedEvent.title : "No associated event"}
                  </CardDescription>
                </div>
                <div className="flex flex-col gap-1">
                  {video.isLiveEvent && (
                    <Badge variant="destructive" className="text-xs bg-red-600 text-white border-red-600">
                      <Play className="h-3 w-3 mr-1" />
                      Live
                    </Badge>
                  )}
                  {!video.isPublic && (
                    <Badge variant="secondary" className="text-xs bg-gray-600 text-white border-gray-600">
                      Private
                    </Badge>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-300">Duration:</span>
                  <span className="text-white">{formatDuration(video.duration)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-300">Views:</span>
                  <span className="text-white">{video.viewCount || 0}</span>
                </div>
                {video.scheduledStartTime && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-300">Scheduled:</span>
                    <span className="text-white">{formatDate(video.scheduledStartTime)}</span>
                  </div>
                )}
                {video.date && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-300">Date:</span>
                    <span className="text-white">{formatDate(video.date)}</span>
                  </div>
                )}
              </div>
              <div className="flex gap-2 mt-4">
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="border-gray-600 text-gray-300 hover:bg-gray-700"
                  onClick={() => {
                    setSelectedVideo(video)
                    setIsViewDialogOpen(true)
                  }}
                >
                  <Eye className="h-4 w-4 mr-1" />
                  View
                </Button>
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="border-gray-600 text-gray-300 hover:bg-gray-700"
                  onClick={() => {
                    setSelectedVideo(video)
                    setIsEditDialogOpen(true)
                  }}
                >
                  <Edit className="h-4 w-4 mr-1" />
                  Edit
                </Button>
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="border-red-600 text-red-400 hover:bg-red-900/20"
                  onClick={() => {
                    deleteVideo(video._id)
                  }}
                >
                  <Trash2 className="h-4 w-4 mr-1" />
                  Delete
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredVideos.length === 0 && (
        <div className="text-center py-12">
          <Play className="h-12 w-12 text-gray-600 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-400 mb-2">No videos found</h3>
          <p className="text-gray-500">
            {searchTerm ? "Try adjusting your search terms" : "Get started by adding your first video"}
          </p>
        </div>
      )}
    </div>
  )
}
