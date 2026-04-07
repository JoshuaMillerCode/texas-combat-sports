import { useState } from "react"
import { useVideosQuery, useCreateVideoMutation, useUpdateVideoMutation, useDeleteVideoMutation } from "@/hooks/use-queries"
import { LoadingCard, ErrorCard } from "./loading-card"
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Plus, Edit, Trash2, Eye, Play } from "lucide-react"
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

      {/* Videos Table */}
      <div className="overflow-x-auto rounded-md border border-gray-700">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-700 bg-gray-800/50">
              <th className="text-left py-3 px-4 text-xs font-medium uppercase text-gray-400">Title</th>
              <th className="text-left py-3 px-4 text-xs font-medium uppercase text-gray-400">Event</th>
              <th className="text-left py-3 px-4 text-xs font-medium uppercase text-gray-400">Type</th>
              <th className="text-left py-3 px-4 text-xs font-medium uppercase text-gray-400">Views</th>
              <th className="text-left py-3 px-4 text-xs font-medium uppercase text-gray-400">Visibility</th>
              <th className="text-right py-3 px-4 text-xs font-medium uppercase text-gray-400">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredVideos.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-gray-500">No videos found</td>
              </tr>
            ) : (
              filteredVideos.map((video: any) => (
                <tr key={video._id} className="border-b border-gray-800 last:border-0 hover:bg-gray-800/40 transition-colors">
                  <td className="py-3 px-4 text-white font-medium">{video.title}</td>
                  <td className="py-3 px-4 text-gray-300">{video.associatedEvent?.title || <span className="text-gray-600">—</span>}</td>
                  <td className="py-3 px-4">
                    {video.isLiveEvent ? (
                      <Badge className="bg-red-700/40 text-red-400 border-0 text-xs">
                        <Play className="h-3 w-3 mr-1" />Live
                      </Badge>
                    ) : (
                      <span className="text-gray-500 text-xs">VOD</span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-gray-300">{video.viewCount || 0}</td>
                  <td className="py-3 px-4">
                    {video.isPublic ? (
                      <Badge className="bg-green-700/30 text-green-400 border-0 text-xs">Public</Badge>
                    ) : (
                      <Badge variant="outline" className="border-gray-600 text-gray-500 text-xs">Private</Badge>
                    )}
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex gap-1 justify-end">
                      <Button
                        size="sm" variant="ghost"
                        className="h-7 w-7 p-0 text-gray-400 hover:text-white hover:bg-gray-700"
                        title="View"
                        onClick={() => { setSelectedVideo(video); setIsViewDialogOpen(true) }}
                      >
                        <Eye className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        size="sm" variant="ghost"
                        className="h-7 w-7 p-0 text-gray-400 hover:text-white hover:bg-gray-700"
                        title="Edit"
                        onClick={() => { setSelectedVideo(video); setIsEditDialogOpen(true) }}
                      >
                        <Edit className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        size="sm" variant="ghost"
                        className="h-7 w-7 p-0 text-gray-400 hover:text-red-400 hover:bg-red-900/20"
                        title="Delete"
                        onClick={() => {
                          if (window.confirm(`Delete "${video.title}"? This cannot be undone.`)) {
                            deleteVideo(video._id)
                          }
                        }}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
