import { useState, useEffect } from "react"
import { useEventsQuery } from "@/hooks/use-queries"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon, Loader2 } from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"

interface EditVideoFormProps {
  video: any
  onSubmit: (data: any) => void
  isLoading: boolean
  onClose: () => void
}

export function EditVideoForm({ video, onSubmit, isLoading, onClose }: EditVideoFormProps) {
  const { data: events = [] } = useEventsQuery()
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    videoUrl: "",
    thumbnailUrl: "",
    isLiveEvent: false,
    scheduledStartTime: undefined as Date | undefined,
    liveStreamUrl: "",
    associatedEvent: "",
    duration: "",
    isPublic: true,
    date: undefined as Date | undefined,
  })

  useEffect(() => {
    if (video) {
      setFormData({
        title: video.title || "",
        description: video.description || "",
        videoUrl: video.videoUrl || "",
        thumbnailUrl: video.thumbnailUrl || "",
        isLiveEvent: video.isLiveEvent || false,
        scheduledStartTime: video.scheduledStartTime ? new Date(video.scheduledStartTime) : undefined,
        liveStreamUrl: video.liveStreamUrl || "",
        associatedEvent: video.associatedEvent?._id || "",
        duration: video.duration?.toString() || "",
        isPublic: video.isPublic !== undefined ? video.isPublic : true,
        date: video.date ? new Date(video.date) : undefined,
      })
    }
  }, [video])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    const submitData = {
      ...formData,
      duration: formData.duration ? parseInt(formData.duration) : undefined,
      associatedEvent: formData.associatedEvent || undefined,
      scheduledStartTime: formData.scheduledStartTime || undefined,
      date: formData.date || undefined,
    }

    onSubmit(submitData)
  }

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Basic Information */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-white">Basic Information</h3>
        
        <div className="space-y-2">
          <Label htmlFor="title" className="text-gray-300">Title *</Label>
          <Input
            id="title"
            value={formData.title}
            onChange={(e) => handleInputChange("title", e.target.value)}
            placeholder="Enter video title"
            className="bg-gray-800 border-gray-700 text-white"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="description" className="text-gray-300">Description</Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) => handleInputChange("description", e.target.value)}
            placeholder="Enter video description"
            className="bg-gray-800 border-gray-700 text-white"
            rows={3}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="videoUrl" className="text-gray-300">Video URL *</Label>
          <Input
            id="videoUrl"
            value={formData.videoUrl}
            onChange={(e) => handleInputChange("videoUrl", e.target.value)}
            placeholder="https://example.com/video.mp4"
            className="bg-gray-800 border-gray-700 text-white"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="thumbnailUrl" className="text-gray-300">Thumbnail URL</Label>
          <Input
            id="thumbnailUrl"
            value={formData.thumbnailUrl}
            onChange={(e) => handleInputChange("thumbnailUrl", e.target.value)}
            placeholder="https://example.com/thumbnail.jpg"
            className="bg-gray-800 border-gray-700 text-white"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="duration" className="text-gray-300">Duration (minutes)</Label>
          <Input
            id="duration"
            type="number"
            value={formData.duration}
            onChange={(e) => handleInputChange("duration", e.target.value)}
            placeholder="120"
            className="bg-gray-800 border-gray-700 text-white"
            min="0"
          />
        </div>
      </div>

      {/* Live Event Settings */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-white">Live Event Settings</h3>
        
        <div className="flex items-center space-x-2">
          <Switch
            id="isLiveEvent"
            checked={formData.isLiveEvent}
            onCheckedChange={(checked) => handleInputChange("isLiveEvent", checked)}
          />
          <Label htmlFor="isLiveEvent" className="text-gray-300">This is a live event</Label>
        </div>

        {formData.isLiveEvent && (
          <>
            <div className="space-y-2">
              <Label htmlFor="liveStreamUrl" className="text-gray-300">Live Stream URL</Label>
              <Input
                id="liveStreamUrl"
                value={formData.liveStreamUrl}
                onChange={(e) => handleInputChange("liveStreamUrl", e.target.value)}
                placeholder="https://stream.example.com/live"
                className="bg-gray-800 border-gray-700 text-white"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-gray-300">Scheduled Start Time</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal bg-gray-800 border-gray-700 text-white",
                      !formData.scheduledStartTime && "text-gray-500"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.scheduledStartTime ? (
                      format(formData.scheduledStartTime, "PPP")
                    ) : (
                      <span>Pick a date</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 bg-gray-800 border-gray-700">
                  <Calendar
                    mode="single"
                    selected={formData.scheduledStartTime}
                    onSelect={(date) => handleInputChange("scheduledStartTime", date)}
                    initialFocus
                    className="bg-gray-800 text-white"
                  />
                </PopoverContent>
              </Popover>
            </div>
          </>
        )}
      </div>

      {/* Event Association */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-white">Event Association</h3>
        
        <div className="space-y-2">
          <Label htmlFor="associatedEvent" className="text-gray-300">Associated Event</Label>
          <Select value={formData.associatedEvent || "none"} onValueChange={(value) => handleInputChange("associatedEvent", value === "none" ? "" : value)}>
            <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
              <SelectValue placeholder="Select an event (optional)" />
            </SelectTrigger>
            <SelectContent className="bg-gray-800 border-gray-700">
              <SelectItem value="none" className="text-white hover:bg-gray-700">No event</SelectItem>
              {events.map((event: any) => (
                <SelectItem key={event._id} value={event._id} className="text-white hover:bg-gray-700">
                  {event.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label className="text-gray-300">Event Date</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal bg-gray-800 border-gray-700 text-white",
                  !formData.date && "text-gray-500"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {formData.date ? (
                  format(formData.date, "PPP")
                ) : (
                  <span>Pick a date (optional)</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 bg-gray-800 border-gray-700">
              <Calendar
                mode="single"
                selected={formData.date}
                onSelect={(date) => handleInputChange("date", date)}
                initialFocus
                className="bg-gray-800 text-white"
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {/* Visibility Settings */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-white">Visibility Settings</h3>
        
        <div className="flex items-center space-x-2">
          <Switch
            id="isPublic"
            checked={formData.isPublic}
            onCheckedChange={(checked) => handleInputChange("isPublic", checked)}
          />
          <Label htmlFor="isPublic" className="text-gray-300">Make video public</Label>
        </div>
      </div>

      {/* Form Actions */}
      <div className="flex justify-end space-x-3 pt-6 border-t border-gray-700">
        <Button
          type="button"
          variant="outline"
          onClick={onClose}
          className="border-gray-600 text-gray-300 hover:bg-gray-700"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          className="bg-red-600 hover:bg-red-700"
          disabled={isLoading}
        >
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Update Video
        </Button>
      </div>
    </form>
  )
}
